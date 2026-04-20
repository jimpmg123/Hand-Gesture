from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

PROJECT_BACKEND = Path(__file__).resolve().parents[1]
if str(PROJECT_BACKEND) not in sys.path:
    sys.path.insert(0, str(PROJECT_BACKEND))

from app.services.shared import extract_text_with_cloud_vision


def _parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run Cloud Vision OCR on a local image.")
    parser.add_argument("image_path", type=Path, help="Path to the input image file.")
    parser.add_argument(
        "--language-hint",
        action="append",
        default=[],
        help="Optional language hint to pass to Cloud Vision. Can be repeated.",
    )
    return parser.parse_args()


def main() -> None:
    args = _parse_args()
    result = extract_text_with_cloud_vision(
        args.image_path,
        language_hints=args.language_hint or None,
        include_raw_response=False,
    )

    output_dir = PROJECT_BACKEND / "test_results" / "test_ocr_service"
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / f"{args.image_path.stem}.json"
    output_path.write_text(
        json.dumps(result, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )

    print(json.dumps(result, indent=2, ensure_ascii=False))
    print(f"\nSaved OCR result to: {output_path}")


if __name__ == "__main__":
    main()
