from __future__ import annotations

import json
import sys
from pathlib import Path

CURRENT_FILE = Path(__file__).resolve()
BACKEND_DIR = CURRENT_FILE.parents[1]
TEST_RESULTS_DIR = BACKEND_DIR / "test_results" / "test_openai_location"

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.services.shared.openai_location_service import analyze_image_location_with_openai


def main() -> int:
    if len(sys.argv) < 2:
        print("Usage: python scripts/test_openai_location.py <image_path> [model]")
        return 1

    image_path = Path(sys.argv[1]).expanduser()
    model = sys.argv[2] if len(sys.argv) >= 3 else "gpt-4.1-mini"
    result = analyze_image_location_with_openai(image_path, model=model)

    TEST_RESULTS_DIR.mkdir(parents=True, exist_ok=True)
    output_path = TEST_RESULTS_DIR / f"{image_path.stem}_openai_location.json"
    output_path.write_text(json.dumps(result, indent=2, ensure_ascii=False), encoding="utf-8")

    print(json.dumps(result, indent=2, ensure_ascii=False))
    print(f"\nSaved result to: {output_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
