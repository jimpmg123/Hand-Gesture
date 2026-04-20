from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

PROJECT_BACKEND = Path(__file__).resolve().parents[1]
if str(PROJECT_BACKEND) not in sys.path:
    sys.path.insert(0, str(PROJECT_BACKEND))

from app.services.shared.geocoding_service import geocode_address, reverse_geocode_coordinates


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--image-name", required=True)
    parser.add_argument("--latitude", type=float, required=True)
    parser.add_argument("--longitude", type=float, required=True)
    parser.add_argument("--address", required=True)
    args = parser.parse_args()

    reverse_result = reverse_geocode_coordinates(args.latitude, args.longitude)
    forward_result = geocode_address(args.address)

    payload = {
        "image_name": args.image_name,
        "input_coordinates": {
            "latitude": args.latitude,
            "longitude": args.longitude,
        },
        "input_address": args.address,
        "reverse_geocoding": reverse_result,
        "forward_geocoding": forward_result,
    }

    output_dir = PROJECT_BACKEND / "test_results" / "test_geocoding"
    output_dir.mkdir(parents=True, exist_ok=True)
    output_file = output_dir / f"{args.image_name}_geocoding.json"
    output_file.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")

    print(json.dumps(payload, indent=2, ensure_ascii=False))
    print(f"\nSaved to: {output_file}")


if __name__ == "__main__":
    main()
