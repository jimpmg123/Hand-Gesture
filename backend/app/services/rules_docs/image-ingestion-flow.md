# Image Ingestion Flow

This document is a lightweight note that summarizes the image upload processing flow.

Its purpose is not to freeze the implementation forever. The goal is to keep a clear text version of the current flow so future features can be added in the right place without guessing.

---

## Purpose

`image_ingestion_service` is the **top-level orchestration layer** for uploaded image processing.

It should not perform every detailed task by itself.  
Its role is to connect lower-level services in the correct order.

The main connected responsibilities are:

- EXIF metadata extraction
- CLIP gate classification
- CLIP broad scene hint classification
- Landmark detection
- OpenAI-based image reasoning
- Geocoding / reverse geocoding
- Database persistence

---

## Recommended Processing Order

```text
Frontend uploads image
-> router receives UploadFile
-> image_ingestion_service starts processing
-> create temporary file if needed
-> extract EXIF metadata
-> check whether GPS exists
   -> GPS exists:
      -> use coordinates
      -> run reverse geocoding if needed
   -> GPS missing:
      -> run CLIP gate classification
      -> if image is not suitable for location inference, mark as failed
      -> if image passes the gate, extract CLIP broad scene hints
      -> run Landmark detection
      -> if Landmark fails, run OpenAI image reasoning
-> merge extracted and inferred results
-> save through repository layer
-> return API response
```

---

## Role of CLIP

CLIP is not the final location resolver.

In this project, CLIP has only two intended roles.

### 1. Gate Classification

First, determine whether the image is useful for location inference at all.

Examples:

- pass:
  - travel scene
  - city street
  - waterfront scene
  - shrine / ruin / station-platform type public scene
- reject:
  - food close-up
  - face-centered selfie
  - object close-up
  - private indoor image with almost no place context

### 2. Broad Scene Hints

Only for images that pass the gate, extract broad scene hints.

Examples:

- `river scene`
- `sea or beach`
- `lake or waterfront`
- `temple or shrine`
- `historic site or ruin`
- `urban street`
- `market street`
- `mountain landscape`
- `transport-related scene`

These outputs should be used only as **weak hints** in later Landmark or OpenAI stages.

---

## Detailed Logic at the Current Stage

At the current stage, the recommended logic order is:

1. Receive the uploaded image in the API route.
2. Call the EXIF service and extract metadata.
3. If GPS exists, use that coordinate first.
4. If GPS is missing, run CLIP gate classification.
5. If CLIP rejects the image, mark it as a failed location-inference image.
6. If CLIP accepts the image, extract CLIP broad scene hints.
7. Run Landmark detection.
8. If Landmark detection fails, run OpenAI image reasoning.
9. Merge final coordinates, address, scene hints, and status into one payload.
10. If needed, persist the result through the repository layer.

---

## Flow That Can Be Expanded Later

The project can naturally grow into the following flow:

```text
Frontend uploads image
-> router receives file
-> image_ingestion_service starts orchestration
-> prepare temporary file / logging
-> extract EXIF metadata
-> check whether GPS exists
   -> yes:
      -> use GPS coordinates
      -> reverse geocoding
   -> no:
      -> CLIP gate classification
      -> if rejected, mark as failed
      -> if accepted, extract CLIP broad scene hints
      -> Landmark detection
      -> if Landmark fails, run OpenAI reasoning
      -> if needed, combine with Geocoding / Places APIs
-> merge raw metadata and inferred results
-> save through repository layer
-> return structured API response
```

---

## Extension Points

The following positions are good future extension points.

### Right After EXIF Extraction

- check whether GPS exists
- validate captured time
- normalize camera metadata

### Right After the GPS-Missing Branch Begins

- CLIP gate
- CLIP scene hints
- Landmark detection
- OpenAI fallback

### Right Before Final Merge

- merge raw metadata and inferred results
- decide final status
- assign failure reason

### Right Before Database Save

- save image metadata
- save analysis cache
- connect results to Travelize / Journal downstream flows

---

## Design Principle

`image_ingestion_service` should stay focused on **flow coordination**.

That means:

- real EXIF parsing belongs in `exif_service`
- real CLIP inference belongs in `clip_service`
- real Landmark calls belong in `landmark_detection_service`
- real DB insert / update belongs in `repositories`
- `image_ingestion_service` connects them in order

---

## Why Keep This as a Text Document

This flow will likely change over time.

For example:

- OpenAI calling rules may change
- DB models may expand
- integration with Travelize / AI Trip Journal may grow

So this document should be treated as a maintainable flow note, not as a permanently frozen specification.
