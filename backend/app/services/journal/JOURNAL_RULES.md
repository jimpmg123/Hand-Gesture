# Journal Rules and Classification Notes

This document summarizes the current Journal preview logic implemented in the backend.
It describes how images become observations, how observations become segments, and how the
system currently decides between `stay`, `transit`, and `uncertain`.

The goal of this file is to keep the rules readable without opening every service file.

## 1. Pipeline Overview

The current Journal preview pipeline is:

1. Receive uploaded images.
2. Extract EXIF metadata.
3. Filter out images that cannot be used for Journal.
4. Group eligible images into observations.
5. Enrich observations with place context and scene context.
6. Classify each observation as `stay`, `transit`, or `uncertain`.
7. Merge classified observations into timeline segments.
8. Infer default transit segments when the user has no transit photos.

At preview time, this pipeline does **not** save anything to the database yet.

## 2. Journal Eligibility

An image is eligible for Journal only if all of the following are true:

- It has EXIF capture time.
- It has EXIF GPS coordinates.
- The capture time was parsed successfully.
- The latitude and longitude were parsed successfully.

If any of those checks fail, the image is rejected before observation building starts.

Relevant code:

- `journal_eligibility_service.py`

## 3. Observation Rules

An observation is the smallest Journal unit.
It is not only for burst shots. Every usable image belongs to exactly one observation.

- A normal single photo becomes a `single` observation.
- Multiple burst-like photos can become one `burst` observation.

### 3.1 Burst Grouping

Images are grouped into the same observation only when both rules are true:

- Time difference from the **first image in the current observation** is within `10 seconds`.
- Distance from the **current observation center** is within `30 meters`.

Constants:

- `DEFAULT_BURST_WINDOW_SECONDS = 10`
- `DEFAULT_BURST_DISTANCE_METERS = 30.0`

Important detail:

- This is **not** pairwise chaining.
- The system does **not** say "`img2` is within 10 seconds of `img1`, and `img3` is within 10 seconds of `img2`, so all three belong together".
- It always compares against the current observation window and center.

Observation fields include:

- observation id / order
- image ids
- representative image
- start time / end time
- center latitude / longitude
- image count
- optional enrichment fields

Relevant code:

- `observation_builder_service.py`

## 4. Place Enrichment

Each observation is enriched with location-related information after observation creation.

### 4.1 Address

The router attaches:

- country
- city
- formatted address

This comes from reverse geocoding.

### 4.2 Anchor POI vs Nearest POI

The current Journal logic distinguishes between two place concepts:

#### Anchor POI

This is the larger place used for grouping and segment naming.

Examples:

- `Kiyomizu-dera`
- `Nishiki Market`

Anchor POIs are searched from a broader nearby radius:

- `ANCHOR_POI_RADIUS_METERS = 1500.0`
- `ANCHOR_POI_MAX_RESULTS = 20`

The system tries to prefer broader destination-like places over tiny local sub-features.

#### Nearest POI

This is the closest POI to the image coordinate.
It is not used as the main grouping key anymore.
It is meant for image-level detail display.

Examples:

- `Eizando`
- `Nio-mon Gate`
- `Watahan`

Nearest POI is searched from the default nearby radius:

- `DEFAULT_POI_RADIUS_METERS = 150.0`
- `DEFAULT_POI_MAX_RESULTS = 5`

Relevant code:

- `journal.py`
- `places_service.py`

## 5. Same-Place Signals

The current Journal logic uses several signals to decide whether nearby observations belong
to the same large place.

### 5.1 Coordinate-Based Same Place

Two observations are treated as nearby same-place candidates if:

- their observation centers are within `120 meters`

Constant:

- `SAME_PLACE_RADIUS_METERS = 120.0`

This is used mainly in observation classification.

### 5.2 Anchor Match

Two observations are treated as belonging to the same large venue if:

- their normalized anchor names match

This is now the strongest same-place signal for large attractions.

Examples:

- `Kiyomizu-dera` and `Kiyomizu-dera`
- `Nishiki Market` and `Nishiki Market`

### 5.3 Address-Head Match

There is also a weaker coarse same-place signal based on the first token of the formatted address.

This exists as a fallback because large venues can have multiple internal coordinates and
multiple nearby POIs.

Current limitation:

- Address-head matching is still coarse and should be treated as a fallback, not the main rule.

## 6. Observation Classification: Stay vs Transit vs Uncertain

Classification happens at the observation level before segment building.

The system computes two scores:

- `stay_score`
- `transit_score`

Then it compares the two.

### 6.1 Classification Margin

If the score difference is large enough, the observation becomes `stay` or `transit`.
Otherwise it becomes `uncertain`.

Constant:

- `CLASSIFICATION_MARGIN = 0.20`

Decision rule:

- if `stay_score - transit_score >= 0.20` -> `stay`
- if `transit_score - stay_score >= 0.20` -> `transit`
- otherwise -> `uncertain`

### 6.2 Stay Signals

The current implementation adds stay score in these cases:

- burst observation: `+0.10`
- long observation duration of at least 10 minutes: `+0.35`
- previous observation shares the same anchor: `+0.65`
- next observation shares the same anchor: `+0.65`
- previous nearby observation after a time gap: `+0.35`
- next nearby observation after a time gap: `+0.35`
- previous address-head match after a time gap: `+0.40`
- next address-head match after a time gap: `+0.40`
- anchor matches on both sides: `+0.30`
- nearby observations on both sides: `+0.20`
- address heads match on both sides: `+0.20`

POI / scene / document stay signals:

- destination-like POI: `+0.45`
- destination scene: `+0.35`
- food photo: `+0.40`
- stay-supporting document type: `+0.45`

### 6.3 Transit Signals

The current implementation adds transit score in these cases:

- recent movement from a different place: `+0.10`
- upcoming movement to a different place: `+0.10`
- observation lies on the path between two different places: `+0.35`

POI / scene / document transit signals:

- transit-like POI: `+0.55`
- transport-related scene: `+0.45`
- document-like scene: `+0.05`
- transit-supporting document type: `+0.55`

### 6.4 POI Keyword Logic

POI type matching is currently keyword-based, not exact-enum-based.

This was chosen because Google place type output is varied and exact matching added little value.

Examples of destination-like keywords:

- `market`
- `museum`
- `park`
- `shrine`
- `temple`
- `tourist`
- `visitor`
- `restaurant`
- `food`

Examples of transit-like keywords:

- `airport`
- `station`
- `subway`
- `terminal`
- `train`
- `bus_station`
- `transit`

Relevant code:

- `segment_classifier_service.py`

## 7. Segment Building

After every observation gets a suggested type, the system builds final segments.

The current segment types are:

- `stay`
- `transit`
- `uncertain`

### 7.1 Stay Merge

Two consecutive stay observations are merged into one stay segment if:

- distance is within `150 meters`, **or**
- anchor names match

and:

- the time gap is within `7200 seconds` (2 hours)
- they are in the same city, when city data exists

Constants:

- `STAY_MERGE_DISTANCE_METERS = 150.0`
- `STAY_MERGE_GAP_SECONDS = 7200`

### 7.2 Transit Merge

Two consecutive transit observations are merged if:

- the time gap is within `5400 seconds`

Constant:

- `TRANSIT_MERGE_GAP_SECONDS = 5400`

### 7.3 Segment Naming

The current segment display name prefers:

1. anchor POI name
2. city name

This means segment naming is now intended to follow the large anchor, not the nearest tiny sub-feature.

Relevant code:

- `segment_builder_service.py`

## 8. Stay Duration Logic

Current Journal preview does **not** treat image timestamps as exact true stay duration.
It builds a practical estimated duration for timeline display.

### 8.1 Observed Duration

Observed duration is:

- `segment.end_time - segment.start_time`

This matters only when multiple photos already exist inside one segment.

### 8.2 Same-Place Consecutive Stay

If the next segment is also a stay segment on the same day and both segments are treated as the same place:

- the current segment duration extends until the next segment start

This means the gap belongs to the current place stay.

### 8.3 Different-Place Consecutive Stay

If the next stay segment is treated as a different place:

- the system infers travel time
- subtracts the inferred travel from the gap
- gives the remaining time to the current stay

## 9. Inferred Transit Logic

If two consecutive stay segments exist and there is **no actual transit photo segment** between them,
the system inserts a synthetic transit segment.

This is called an inferred transit segment.

### 9.1 Travel Mode Rule

The current fallback rule is:

- if distance is `<= 4 km` -> `walk`
- if distance is `> 4 km` -> `taxi`

Constants:

- `WALK_DISTANCE_THRESHOLD_KM = 4.0`
- `WALK_SPEED_KMH = 6.0`
- `TAXI_SPEED_KMH = 40.0`

### 9.2 Travel Time Rule

Travel time is estimated from straight-line distance:

- walking speed = `6 km/h`
- taxi speed = `40 km/h`

Travel minutes are rounded up with a minimum of 1 minute.

### 9.3 Inferred Transit Segment Fields

An inferred transit segment currently has:

- segment type = `transit`
- `is_inferred = true`
- no image ids
- `location_name = "Default transit"`
- travel mode
- travel distance in km
- inferred duration

Relevant code:

- `segment_builder_service.py`

## 10. Preview-Time Defaults

The preview route currently runs with:

- place enrichment enabled
- CLIP scene classification enabled
- OCR + document classification disabled

This means preview is currently focused on:

- EXIF filtering
- observation grouping
- place enrichment
- scene-based stay/transit scoring
- segment building

but not yet on full document reasoning.

## 11. Known Limitations

The current logic is practical but still heuristic.

Known limitations include:

- same-place matching still depends on approximate address and anchor quality
- anchor naming quality depends on nearby Google Places results
- inferred travel still uses straight-line distance, not road routing
- some local POI names may remain in Japanese or Chinese
- duration is an estimated display value, not a ground-truth stay measurement

## 12. Files to Read

If you need to trace the implementation, start here:

- `journal_eligibility_service.py`
- `observation_builder_service.py`
- `segment_classifier_service.py`
- `segment_builder_service.py`
- `journal_service.py`
- `backend/app/routers/journal.py`
