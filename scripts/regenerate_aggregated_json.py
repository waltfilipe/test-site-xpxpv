#!/usr/bin/env python3
"""Regenerate data/aggregated.json (aggregate pass-map PNGs) for the static site."""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path

_BACKEND = Path(__file__).resolve().parents[2] / "xpv-xp_site" / "backend"
if str(_BACKEND) not in sys.path:
    sys.path.insert(0, str(_BACKEND))

os.environ.setdefault("PASS_SCOUT_MODE", "local")
os.environ.setdefault("HEAVY_MAPS_ENABLED", "1")

from services.maps_service import AGGREGATED_MAP_RENDER_VERSION, load_aggregated_maps  # noqa: E402

DATA_DIR = Path(__file__).resolve().parents[1] / "data"
OUT_PATH = DATA_DIR / "aggregated.json"
TOP_N = 250
POSITION_FAMILY = "midfielders"


def main() -> None:
    load_aggregated_maps.cache_clear()
    agg = load_aggregated_maps(TOP_N, POSITION_FAMILY, render_version=AGGREGATED_MAP_RENDER_VERSION)
    payload = {
        "position_family": agg.get("position_family", POSITION_FAMILY),
        "player_count": agg.get("player_count", 0),
        "total_passes": agg.get("total_passes", 0),
        "min_passes_cutoff": agg.get("min_passes_cutoff", 0),
        "quadrant_stats": agg.get("quadrant_stats", []),
        "common_map_b64": agg.get("common_map_b64"),
        "rare_map_b64": agg.get("rare_map_b64"),
    }
    OUT_PATH.write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")
    print(f"Wrote {OUT_PATH} (render v{AGGREGATED_MAP_RENDER_VERSION}, top {TOP_N})")


if __name__ == "__main__":
    main()
