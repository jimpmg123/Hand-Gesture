from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

PROJECT_BACKEND = Path(__file__).resolve().parents[1]
if str(PROJECT_BACKEND) not in sys.path:
    sys.path.insert(0, str(PROJECT_BACKEND))

from app.services.journal import classify_document_text

DEFAULT_SAMPLE_TEXT = """
JR WEST
Kyoto Station -> Osaka Station
Departure 09:30
Car 3 Seat 12A
Adult Fare 580 JPY
"""


def _parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Classify OCR text into a journal document subtype.")
    parser.add_argument(
        "--text-file",
        type=Path,
        help="Optional UTF-8 text file that contains OCR output.",
    )
    return parser.parse_args()


def main() -> None:
    args = _parse_args()
    extracted_text = DEFAULT_SAMPLE_TEXT
    if args.text_file:
        extracted_text = args.text_file.read_text(encoding="utf-8")

    result = classify_document_text(extracted_text)
    print(json.dumps(result, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
