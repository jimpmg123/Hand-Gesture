# API Details

This document describes the current external APIs used in the project, including their purpose, main endpoints, expected request and response shape, and how they fit into the system. The structure is intentionally modular so additional APIs can be added later using the same format.

## 1. Google Cloud Vision API

### Purpose

Google Cloud Vision API is used to detect landmarks from uploaded images and return landmark candidates, confidence scores, and possible coordinates.

### Main use in this project

- Analyze uploaded travel photos.
- Detect whether a recognizable landmark exists.
- Extract landmark name.
- Extract confidence score.
- Extract candidate coordinates if available.

### Endpoint

`POST https://vision.googleapis.com/v1/images:annotate`

### Feature used

`LANDMARK_DETECTION`

### Example request body

```json
{
  "requests": [
    {
      "image": {
        "content": "BASE64_ENCODED_IMAGE"
      },
      "features": [
        {
          "type": "LANDMARK_DETECTION",
          "maxResults": 5
        }
      ]
    }
  ]
}
```

### Important request fields

`requests[]`

Contains one or more analysis jobs in the same request payload. Each item defines the image input and the requested Vision features.

`image.content`

Contains the Base64-encoded image content that will be analyzed by the Vision API.

`features[].type`

Defines which Vision feature should be applied. In this project, the value is `LANDMARK_DETECTION`.

`features[].maxResults`

Limits the number of landmark candidates returned by the API. This is useful when the system wants to inspect alternatives instead of using only a single result.

### Example response fields of interest

`responses[0].landmarkAnnotations`

Contains the list of detected landmark candidates for the uploaded image.

`description`

The landmark name returned by the API, such as a famous building, monument, or place.

`score`

The confidence score for the returned landmark candidate.

`locations[].latLng.latitude`

The latitude value associated with the landmark candidate, when available.

`locations[].latLng.longitude`

The longitude value associated with the landmark candidate, when available.

`boundingPoly`

The approximate region of the image where the detected landmark appears.

### How this project uses the response

- If landmark candidates exist, use the top result as the primary location candidate.
- If coordinates exist, pass them to the map layer.
- If score is low or no result exists, trigger fallback logic.

## 2. Google Maps JavaScript API

### Purpose

Google Maps JavaScript API is used on the frontend to display an interactive map and visualize detected or inferred locations.

### Main use in this project

- Render a map in the web app.
- Place a marker at detected coordinates.
- Show the user where the predicted location is.
- Potentially support route visualization later.

### Main usage pattern

The frontend loads the Google Maps JavaScript API, initializes a map centered on a coordinate, and adds a marker for the predicted landmark or location returned by the backend.

### Important concepts

`map initialization`

The initial creation of the map instance inside a frontend component or page.

`center coordinates`

The latitude and longitude used to define the initial map focus.

`zoom level`

Controls how close the map view is to the detected location. A landmark-level result may use a tighter zoom than a city-level result.

`marker / advanced marker`

Visual pointer used to show the predicted location on the map.

`optional info window`

An optional popup layer that can display landmark name, score, address, or supporting explanation.

### Example frontend responsibilities

- Receive latitude and longitude from backend.
- Render a map component.
- Place a marker on the predicted point.
- Show landmark name and confidence if available.

### Expected data received from backend

```json
{
  "landmark": "Eiffel Tower",
  "score": 0.96,
  "latitude": 48.8584,
  "longitude": 2.2945
}
```

### How this project uses it

- Visual confirmation of predicted location.
- Better UX than only showing raw coordinates.
- Base layer for future route planning features.

## 3. Google Geocoding API

### Purpose

Google Geocoding API is used to convert coordinates into a human-readable address or place description.

### Main use in this project

- Convert landmark coordinates into readable location text.
- Display address or formatted place info to the user.
- Help explain where the predicted point is located.

### Main use case

The main use case is reverse geocoding, where latitude and longitude are converted into an address or readable place description.

### Example endpoint

`GET https://maps.googleapis.com/maps/api/geocode/json?latlng={LAT},{LNG}&key={API_KEY}`

### Example response fields of interest

`results[0].formatted_address`

The most readable address string returned for the coordinate pair.

`results[0].place_id`

Stable place identifier that can be used for later lookup or enrichment.

`results[0].types`

Describes the type of place returned, such as street address, route, locality, or point of interest.

### Example response usage

- Show readable address below map.
- Use as supporting evidence for the predicted place.
- Improve explanation when landmark name alone is not enough.

### Expected data returned to frontend

```json
{
  "formatted_address": "Champ de Mars, 5 Avenue Anatole France, 75007 Paris, France"
}
```

## 4. Current API flow in the project

The current external API flow is:

1. User uploads an image.
2. Backend sends image to Google Cloud Vision API.
3. If landmark is detected, backend extracts name / score / coordinates.
4. Frontend uses Google Maps JavaScript API to display the location.
5. Backend optionally calls Google Geocoding API to convert coordinates into readable address.
6. If landmark detection fails or confidence is low, fallback logic is triggered.

## Notes

- Vision API is the main image understanding API for landmark detection.
- Maps JavaScript API is used for visualization.
- Geocoding API is used for coordinate-to-address conversion.
- More APIs may be added later.
