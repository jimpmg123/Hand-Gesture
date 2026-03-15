# Errors and Fallbacks

This document describes how the system should react when landmark detection is uncertain, fails, or returns incomplete information. The goal is to keep the backend behavior predictable, preserve useful partial results, and make the next recovery step explicit for the frontend.

## 1. Why fallback logic is needed

Landmark detection does not always succeed. The backend should treat landmark recognition as one stage in a larger inference pipeline rather than as the only decision source.

Common reasons include:

- The photo may not contain a famous landmark.
- The image may contain only food, interior scenes, streets, shops, or general places.
- The object may be blurry or partially blocked.
- The image may not include GPS metadata.
- The API may return a low-confidence result.

## 2. Main result states from landmark detection

### A. API error

This means the request itself failed before a normal detection result could be evaluated.

Example causes:

- Authentication issue.
- Invalid request format.
- Unsupported image content.
- Quota or billing issue.

Handling:

- Set status to `api_error`.
- Log the details.
- Return a safe error message to the frontend.
- Do not treat it as `no landmark found`.

### B. No landmark detected

This means:

- The request succeeded.
- `landmarkAnnotations` is missing or empty.

Handling:

- Set status to `no_landmark_detected`.
- Trigger OCR or other fallback analysis.
- Inform the frontend that landmark detection produced no usable result.

### C. Low-confidence landmark detected

This means:

- A top candidate exists but the score is below a useful confidence threshold.

Threshold policy:

- `score >= 0.75`: strong candidate
- `0.50 <= score < 0.75`: uncertain candidate
- `score < 0.50`: weak candidate, treat as fallback case

Handling:

- Set status to `low_confidence_landmark`.
- Optionally keep the candidate for reference.
- Trigger OCR or additional image analysis before final decision.

### D. Landmark detected successfully

Handling:

- Set status to `landmark_detected`.
- Use coordinates for map visualization.
- Use geocoding for readable address.
- Return result to the frontend.

## 3. Recommended fallback order

The recommended backend order is:

1. Check EXIF GPS metadata.
2. Run Google Cloud Vision Landmark Detection.
3. Run OCR if landmark fails.
4. Use geocoding / place search.
5. Ask for user-supported context.

For the OCR step, useful text clues may include:

- Signs.
- Menus.
- Shop names.
- Street names.
- Station names.
- Building text.

## 4. Recommended backend status values

Use normalized backend status values so the frontend can react consistently:

- `api_error`
- `no_landmark_detected`
- `low_confidence_landmark`
- `landmark_detected`
- `gps_detected`
- `ocr_fallback_used`
- `manual_input_needed`

Example JSON response:

```json
{
  "status": "low_confidence_landmark",
  "landmark": "Possible Landmark Name",
  "score": 0.58,
  "next_step": "run_ocr"
}
```

## 5. Project design guidance

The system should not rely on only one API result. A single landmark detection response can be helpful, but it should be combined with other evidence when the image is ambiguous, generic, or incomplete.

Recommended multi-stage inference order:

1. EXIF GPS if available.
2. Landmark detection.
3. OCR fallback.
4. Geocoding / place search.
5. User-provided hints.
