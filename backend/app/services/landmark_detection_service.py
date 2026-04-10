from __future__ import annotations

import base64
import json
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from app.core.config import GOOGLE_CLOUD_VISION_API_KEY

VISION_ANNOTATE_URL = "https://vision.googleapis.com/v1/images:annotate"


def _require_api_key() -> str:
    if not GOOGLE_CLOUD_VISION_API_KEY:
        raise RuntimeError(
            "GOOGLE_CLOUD_VISION_API_KEY is not set. Add it to backend/.env or rely on GOOGLE_MAPS_API_KEY fallback."
        )

    return GOOGLE_CLOUD_VISION_API_KEY


def _build_landmark_detection_request(image_bytes: bytes, max_results: int = 10) -> dict:
    image_base64 = base64.b64encode(image_bytes).decode("ascii")
    return {
        "requests": [
            {
                "image": {"content": image_base64},
                "features": [
                    {
                        "type": "LANDMARK_DETECTION",
                        "maxResults": max_results,
                    }
                ],
            }
        ]
    }


def analyze_landmark_detection(
    image_path: str | Path,
    max_results: int = 10,
    include_raw_response: bool = False,
) -> dict:
    path = Path(image_path)

    if not path.exists():
        raise FileNotFoundError(f"Image file was not found: {path}")

    if not path.is_file():
        raise ValueError(f"Expected a file path, got: {path}")

    api_key = _require_api_key()
    payload = _build_landmark_detection_request(path.read_bytes(), max_results=max_results)
    request_url = f"{VISION_ANNOTATE_URL}?key={api_key}"

    request = Request(
        request_url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urlopen(request, timeout=60) as response:
            raw_response = json.loads(response.read().decode("utf-8"))
    except HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="ignore")
        raise RuntimeError(f"Cloud Vision landmark detection failed with HTTP {exc.code}: {detail}") from exc
    except URLError as exc:
        raise RuntimeError(f"Cloud Vision landmark detection request failed: {exc}") from exc

    responses = raw_response.get("responses", [])
    if not responses:
        raise RuntimeError("Cloud Vision landmark detection returned no responses.")

    response_payload = responses[0]
    if "error" in response_payload:
        raise RuntimeError(f"Cloud Vision landmark detection failed: {response_payload['error']}")

    landmark_annotations = response_payload.get("landmarkAnnotations", [])

    landmarks = []
    for item in landmark_annotations:
        locations = []
        for location in item.get("locations", []):
            lat_lng = location.get("latLng", {})
            locations.append(
                {
                    "latitude": lat_lng.get("latitude"),
                    "longitude": lat_lng.get("longitude"),
                }
            )

        landmarks.append(
            {
                "description": item.get("description"),
                "score": item.get("score"),
                "mid": item.get("mid"),
                "locations": locations,
                "bounding_poly": item.get("boundingPoly"),
            }
        )

    result = {
        "file_name": path.name,
        "absolute_path": str(path.resolve()),
        "top_landmark": landmarks[0] if landmarks else None,
        "landmarks": landmarks,
    }

    if include_raw_response:
        result["raw_response"] = raw_response

    return result
