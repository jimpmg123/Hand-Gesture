# CLIP Gate Rules

This document defines how CLIP should be used in `Travel From Photo`.

The project should not treat CLIP as a final location resolver. CLIP is only a lightweight visual filter and scene classifier used before more expensive or more context-aware steps such as landmark detection or OpenAI image reasoning.

## 1. Main Purpose

CLIP should be used for two limited roles:

1. Gate classification
   - Decide whether an image is useful for location inference.
   - Reject images that are very unlikely to produce a place estimate.

2. Broad scene hints
   - Produce rough scene categories that can be passed to downstream reasoning as weak hints.
   - These hints should never be treated as hard facts.

## 2. Stage A: Gate Classification

### Goal

Determine whether the image is:

- a travel-relevant scene, or
- a non-location image that should be rejected early.

### Recommended Labels

- `travel-relevant scene`
- `food close-up`
- `portrait or selfie`
- `close-up object`
- `indoor private scene`

### Intended Meaning

- `travel-relevant scene`
  - Outdoor or public-space image with enough environmental context for location inference.
  - Examples: streets, waterfronts, shrines, plazas, train platforms, ruins, landscapes.

- `food close-up`
  - Meal-focused image where place inference is weak or impossible without strong metadata.

- `portrait or selfie`
  - Face-centered image where the background is not the main subject.

- `close-up object`
  - Object-focused shot with little or no place context.

- `indoor private scene`
  - Indoor room or private environment with weak public-location signals.

### Gate Decision

- Pass if top result is `travel-relevant scene`.
- Reject if top result is one of:
  - `food close-up`
  - `portrait or selfie`
  - `close-up object`
- Usually reject `indoor private scene`, unless the team later adds a specific recovery rule.

### Important Exception

If EXIF GPS already exists, the image should still be accepted even if CLIP would reject it.

In other words:

- `EXIF GPS exists` -> accept
- `No EXIF GPS` -> run CLIP gate

## 3. Stage B: Broad Scene Hint Classification

### Goal

If the image passes the gate, CLIP may produce broad scene labels to help later reasoning.

These labels are not final answers. They are only weak priors.

### Recommended Labels

- `urban street`
- `river scene`
- `sea or beach`
- `lake or waterfront`
- `temple or shrine`
- `historic site or ruin`
- `market street`
- `mountain landscape`
- `transport-related scene`
- `museum or gallery exterior`

### Why These Labels

These labels are broad enough that CLIP can often separate them reasonably well, while still being useful for downstream reasoning.

They are much safer than highly detailed labels such as:

- `two people swimming in a lake`
- `Kyoto riverside shrine gate`
- `Tokyo subway station entrance`

Highly specific labels create false confidence and are harder to maintain.

## 4. Transport Rule

`transport-related scene` is intentionally broad.

This label should include scenes such as:

- train platform
- train tracks
- station area
- ferry dock
- airport terminal
- large visible bus/train/boat context

The model does not need to identify the exact transport type reliably.

For this project, the important question is:

- "Does this image contain location-relevant public-space context?"

not:

- "Is this definitely a subway platform vs. rail line vs. tram station?"

## 5. What CLIP Should Not Be Used For

CLIP should not be trusted for:

- exact place name inference
- exact city or country inference
- precise geolocation
- people count
- human action understanding
- small object certainty
- final pass/fail decisions when metadata already provides reliable GPS

## 6. How CLIP Output Should Be Passed Forward

CLIP results should be passed to later stages as weak hints only.

Recommended style:

```json
{
  "clip_gate_label": "travel-relevant scene",
  "clip_gate_score": 0.78,
  "clip_scene_hints": [
    { "label": "transport-related scene", "score": 0.62 },
    { "label": "urban street", "score": 0.49 },
    { "label": "river scene", "score": 0.31 }
  ]
}
```

The downstream system should interpret this as:

- probable broad scene categories
- not verified facts

## 7. OpenAI Interaction Rule

If CLIP scene hints are passed to OpenAI, they must be framed as weak priors.

Good wording:

- `Weak scene priors from CLIP: transport-related scene (0.62), urban street (0.49). Use only if consistent with the image.`

Bad wording:

- `This image is a transport hub.`

The second form can bias the model too strongly when CLIP is wrong.

## 8. Recommended Pipeline Position

Suggested order:

1. Image upload
2. EXIF extraction
3. If GPS exists -> accept
4. If GPS does not exist -> CLIP gate classification
5. If gate rejects -> mark image as failed for location inference
6. If gate accepts -> landmark detection
7. If landmark detection fails -> OpenAI image reasoning

## 9. Design Principle

CLIP is not the judge of truth.

CLIP is only a cheap early filter and rough scene classifier.

The project should keep CLIP simple, broad, and conservative.
