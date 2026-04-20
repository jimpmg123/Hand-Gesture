from __future__ import annotations

import json
import sys
from pathlib import Path

PROJECT_BACKEND = Path(__file__).resolve().parents[1]
if str(PROJECT_BACKEND) not in sys.path:
    sys.path.insert(0, str(PROJECT_BACKEND))

from app.services.shared.places_service import enrich_coordinates_with_place_context


def main() -> None:
    if len(sys.argv) < 3:
        raise SystemExit(
            "Usage: python scripts/test_places_service.py <latitude> <longitude> [radius_meters]"
        )

    latitude = float(sys.argv[1])
    longitude = float(sys.argv[2])
    radius_meters = float(sys.argv[3]) if len(sys.argv) >= 4 else 150.0

    result = enrich_coordinates_with_place_context(
        latitude,
        longitude,
        poi_radius_meters=radius_meters,
    )

    output_dir = PROJECT_BACKEND / "test_results" / "test_places_service"
    output_dir.mkdir(parents=True, exist_ok=True)
    output_file = output_dir / f"{latitude}_{longitude}.json"
    output_file.write_text(json.dumps(result, indent=2), encoding="utf-8")

    print(json.dumps(result, indent=2))
    print(f"\nSaved to: {output_file}")


if __name__ == "__main__":
    main()
