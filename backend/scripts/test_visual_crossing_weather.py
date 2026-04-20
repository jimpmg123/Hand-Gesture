from __future__ import annotations

import json
import re
import sys
from pathlib import Path

CURRENT_FILE = Path(__file__).resolve()
BACKEND_DIR = CURRENT_FILE.parents[1]
TEST_RESULTS_DIR = BACKEND_DIR / "test_results" / "test_visual_crossing_weather"

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.services.weather_service import fetch_visual_crossing_daily_weather


def _slugify(value: str) -> str:
    slug = re.sub(r"[^a-zA-Z0-9]+", "_", value.strip().lower())
    return slug.strip("_") or "location"


def main() -> int:
    if len(sys.argv) < 3:
        print('Usage: python scripts/test_visual_crossing_weather.py "<location>" <YYYY-MM-DD>')
        return 1

    location = sys.argv[1]
    target_date = sys.argv[2]
    result = fetch_visual_crossing_daily_weather(location, target_date)

    TEST_RESULTS_DIR.mkdir(parents=True, exist_ok=True)
    output_path = TEST_RESULTS_DIR / f"{_slugify(location)}_{target_date}.json"
    output_path.write_text(json.dumps(result, indent=2, ensure_ascii=False), encoding="utf-8")

    print(json.dumps(result, indent=2, ensure_ascii=False))
    print(f"\nSaved result to: {output_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
