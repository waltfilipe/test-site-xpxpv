#!/usr/bin/env python3
"""Regenerate data/aggregated.json (aggregate pass-map PNGs) for the static site."""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path
from typing import Any

# Site-specific styling (gray→red scale on both maps; "Difficult passes" for high-xP cells).
STATIC_AGGREGATE_RENDER_VERSION = 3

_BACKEND_CANDIDATES = (
    Path(__file__).resolve().parents[2] / "xpv-xp_site" / "backend",
    Path("/tmp/xpv-xp_site/backend"),
    Path("/tmp/tmp.TYQd7isKoq/xpv/backend"),
)

_BACKEND: Path | None = None
for candidate in _BACKEND_CANDIDATES:
    if (candidate / "services" / "maps_service.py").is_file():
        _BACKEND = candidate
        break

if _BACKEND is None:
    raise SystemExit(
        "xpv-xp_site backend not found. Clone it next to this repo or under /tmp/xpv-xp_site."
    )

if str(_BACKEND) not in sys.path:
    sys.path.insert(0, str(_BACKEND))

os.environ.setdefault("PASS_SCOUT_MODE", "local")
os.environ.setdefault("HEAVY_MAPS_ENABLED", "1")

import xp_engine as xe  # noqa: E402
import xp_study_engine as xpe  # noqa: E402
import xp_study_maps as xsm  # noqa: E402
from position_families import normalize_position_family  # noqa: E402
from services.maps_service import _grid_map_b64, _top_position_pass_pool  # noqa: E402

DATA_DIR = Path(__file__).resolve().parents[1] / "data"
OUT_PATH = DATA_DIR / "aggregated.json"
TOP_N = 250
POSITION_FAMILY = "midfielders"


def draw_midfielder_common_passes_map(
    count_grid,
    *,
    title: str,
    dest_cols: int = 8,
    dest_rows: int = 6,
):
    """Pass volume by destination — same gray→red scale as the difficulty map."""
    return xsm._draw_destination_grid_map(
        count_grid,
        title=title,
        cbar_label="Passes at destination",
        cmap=xsm.CMAP_XP_GRAY_RED,
        dest_cols=dest_cols,
        dest_rows=dest_rows,
    )


def draw_midfielder_difficult_passes_map(
    mean_xp_grid,
    *,
    title: str,
    dest_cols: int = 8,
    dest_rows: int = 6,
):
    """Mean xP by destination — higher xP = more difficult passes."""
    return xsm._draw_destination_grid_map(
        mean_xp_grid,
        title=title,
        cbar_label="Mean xP at destination",
        cmap=xsm.CMAP_XP_GRAY_RED,
        vmax=xsm.XP_PASS_MAX,
        dest_cols=dest_cols,
        dest_rows=dest_rows,
    )


def load_static_aggregated_maps(top_n: int, position_family: str) -> dict[str, Any]:
    family = normalize_position_family(position_family)
    season = xe.load_european_league_season_passes(
        position_family=family,
        cache_version=xe.XP_DATA_CACHE_VERSION,
    )
    if season is None or season.empty:
        return {"player_count": 0, "total_passes": 0, "quadrant_stats": []}

    completed = season[season["is_won"] & season["has_end"]].copy()
    if completed.empty:
        return {"player_count": 0, "total_passes": 0, "quadrant_stats": []}

    pool = _top_position_pass_pool(completed, top_n)
    agg = xpe.aggregate_pass_destination_grids(pool["passes"])
    return {
        "position_family": family,
        "player_count": pool["player_count"],
        "total_passes": int(len(pool["passes"])),
        "min_passes_cutoff": pool["min_passes_cutoff"],
        "quadrant_stats": agg.get("quadrant_stats", []),
        "common_map_b64": _grid_map_b64(
            agg.get("count_grid"),
            draw_midfielder_common_passes_map,
            "Common passes",
        ),
        "rare_map_b64": _grid_map_b64(
            agg.get("mean_xp_grid"),
            draw_midfielder_difficult_passes_map,
            "Difficult passes",
        ),
    }


def main() -> None:
    agg = load_static_aggregated_maps(TOP_N, POSITION_FAMILY)
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
    print(
        f"Wrote {OUT_PATH} (static render v{STATIC_AGGREGATE_RENDER_VERSION}, top {TOP_N})"
    )


if __name__ == "__main__":
    main()
