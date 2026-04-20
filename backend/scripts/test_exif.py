# cd "E:\CSE 416\Travel-from-photo"
# .\backend\.venv\Scripts\python.exe backend\scripts\test_exif.py backend\test_images\tm2.jpg

from __future__ import annotations

import json
import sys
from pathlib import Path

CURRENT_FILE = Path(__file__).resolve()
BACKEND_DIR = CURRENT_FILE.parents[1]
TEST_RESULTS_DIR = BACKEND_DIR / "test_results" / "test_exif"

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.services.exif_service import extract_image_metadata


def main() -> int:
    if len(sys.argv) < 2:
        print("Usage: python scripts/test_exif.py <image_path>")
        return 1

    image_path = Path(sys.argv[1]).expanduser()
    metadata = extract_image_metadata(image_path)
    TEST_RESULTS_DIR.mkdir(parents=True, exist_ok=True)

    output_path = TEST_RESULTS_DIR / f"{image_path.stem}.json"
    output_path.write_text(json.dumps(metadata, indent=2, ensure_ascii=False), encoding="utf-8")

    print(json.dumps(metadata, indent=2, ensure_ascii=False))
    print(f"\nSaved result to: {output_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
