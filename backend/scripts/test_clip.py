from __future__ import annotations

import json
import sys
from pathlib import Path

CURRENT_FILE = Path(__file__).resolve()
BACKEND_DIR = CURRENT_FILE.parents[1]
TEST_RESULTS_DIR = BACKEND_DIR / "test_results" / "test_clip"

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.services.shared.clip_service import analyze_image_by_axes, analyze_image_with_clip


def main() -> int:
    if len(sys.argv) < 2:
        print("Usage: python scripts/test_clip.py <image_path> [label1] [label2] ...")
        return 1

    image_path = Path(sys.argv[1]).expanduser()
    candidate_labels = sys.argv[2:] or None
    if candidate_labels:
        result = analyze_image_with_clip(image_path, candidate_labels=candidate_labels)
    else:
        result = analyze_image_by_axes(image_path)

    TEST_RESULTS_DIR.mkdir(parents=True, exist_ok=True)
    output_path = TEST_RESULTS_DIR / f"{image_path.stem}_clip.json"
    output_path.write_text(json.dumps(result, indent=2, ensure_ascii=False), encoding="utf-8")

    print(json.dumps(result, indent=2, ensure_ascii=False))
    print(f"\nSaved result to: {output_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
