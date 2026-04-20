from __future__ import annotations

import json
import sys
from pathlib import Path

CURRENT_FILE = Path(__file__).resolve()
BACKEND_DIR = CURRENT_FILE.parents[1]
TEST_RESULTS_DIR = BACKEND_DIR / "test_results" / "test_landmark_detection"

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.services.shared.landmark_detection_service import analyze_landmark_detection


def main() -> int:
    if len(sys.argv) < 2:
        print("Usage: python scripts/test_landmark_detection.py <image_path>")
        return 1

    image_path = Path(sys.argv[1]).expanduser()
    result = analyze_landmark_detection(image_path)

    TEST_RESULTS_DIR.mkdir(parents=True, exist_ok=True)
    output_path = TEST_RESULTS_DIR / f"{image_path.stem}_landmark_detection.json"
    output_path.write_text(json.dumps(result, indent=2, ensure_ascii=False), encoding="utf-8")

    print(json.dumps(result, indent=2, ensure_ascii=False))
    print(f"\nSaved result to: {output_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
