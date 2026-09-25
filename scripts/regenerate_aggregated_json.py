#!/usr/bin/env python3
"""Regenerate data/aggregated.json (aggregate pass-map PNGs) for the static site."""

from __future__ import annotations

import base64
import io
import json
import os
import sys
from pathlib import Path
from typing import Any

# Site-specific styling: softened gray→red scale on both aggregate maps, plus
# quadrant geometry so the UI can anchor tooltips over the rendered PNGs.
STATIC_AGGREGATE_RENDER_VERSION = 4

_BACKEND_CANDIDATES = (
    Path(__file__).resolve().parents[2] / "xpv-xp_site" / "backend",
    Path("/tmp/xpv-xp_site/backend"),
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

import numpy as np  # noqa: E402
from matplotlib.colors import LinearSegmentedColormap  # noqa: E402

import xp_engine as xe  # noqa: E402
import xp_study_engine as xpe  # noqa: E402
import xp_study_maps as xsm  # noqa: E402
from position_families import normalize_position_family  # noqa: E402
from services.maps_service import _top_position_pass_pool  # noqa: E402

DATA_DIR = Path(__file__).resolve().parents[1] / "data"
OUT_PATH = DATA_DIR / "aggregated.json"
TOP_N = 250
POSITION_FAMILY = "midfielders"
PAD_INCHES = 0.04

# Same gray→red family as the difficulty map, but with extra stops so the
# volume map ramps into red gradually instead of jumping at mid-scale.
CMAP_COMMON_SOFT = LinearSegmentedColormap.from_list(
    "common_gray_red_soft",
    [
        (0.00, "#6b7280"),
        (0.18, "#8d939c"),
        (0.36, "#b0a8ad"),
        (0.54, "#cfa8a5"),
        (0.70, "#e0a096"),
        (0.84, "#e8907f"),
        (0.93, "#e07567"),
        (1.00, "#cf4f42"),
    ],
)


def _render(fig, *, pad_inches: float = PAD_INCHES) -> tuple[str, dict[str, dict[str, float]]]:
    """Save the figure as base64 PNG and locate each pitch quadrant inside it.

    `fig_to_b64` crops with bbox_inches="tight", so quadrant boxes are measured
    against the same cropped bbox to stay aligned with the delivered image.
    """
    import matplotlib.pyplot as plt

    fig.canvas.draw()
    bbox = fig.get_tightbbox(fig.canvas.get_renderer()).padded(pad_inches)

    ax = fig.axes[0]
    dpi = float(fig.dpi)

    def to_image_fraction(x: float, y: float) -> tuple[float, float]:
        px, py = ax.transData.transform((x, y))
        return (
            (px / dpi - bbox.x0) / bbox.width,
            (py / dpi - bbox.y0) / bbox.height,
        )

    quadrants: dict[str, dict[str, float]] = {}
    for key in xpe.QUADRANT_ORDER:
        x0, y0, x1, y1 = xpe.quadrant_bounds(key)
        fx0, fy0 = to_image_fraction(x0, y0)
        fx1, fy1 = to_image_fraction(x1, y1)
        left, right = sorted((fx0, fx1))
        bottom, top = sorted((fy0, fy1))
        quadrants[key] = {
            "left_pct": round(left * 100.0, 3),
            "top_pct": round((1.0 - top) * 100.0, 3),
            "width_pct": round((right - left) * 100.0, 3),
            "height_pct": round((top - bottom) * 100.0, 3),
        }

    buf = io.BytesIO()
    fig.savefig(
        buf,
        format="png",
        dpi=fig.dpi,
        facecolor=fig.get_facecolor(),
        bbox_inches=bbox,
        pad_inches=0,
    )
    plt.close(fig)
    return base64.b64encode(buf.getvalue()).decode("ascii"), quadrants


def _quadrant_metrics(passes, xp_col: str = "xp_m4") -> dict[str, dict[str, float]]:
    """Pass count, share and mean xP per destination quadrant."""
    work = passes[passes["is_won"] & passes["has_end"]].dropna(subset=["x_end", "y_end"])
    x_end = work["x_end"].to_numpy(dtype=float)
    y_end = work["y_end"].to_numpy(dtype=float)
    xp_values = (
        work[xp_col].to_numpy(dtype=float)
        if xp_col in work.columns
        else np.zeros(len(work))
    )

    total = max(len(work), 1)
    metrics: dict[str, dict[str, float]] = {}
    for key in xpe.QUADRANT_ORDER:
        x0, y0, x1, y1 = xpe.quadrant_bounds(key)
        mask = (x_end >= x0) & (x_end < x1) & (y_end >= y0) & (y_end < y1)
        count = int(mask.sum())
        cell_xp = xp_values[mask]
        metrics[key] = {
            "passes": count,
            "share_pct": round(count / total * 100.0, 1),
            "mean_xp": round(float(cell_xp.mean()), 4) if count else 0.0,
        }
    return metrics


def build_aggregated_payload(top_n: int, position_family: str) -> dict[str, Any]:
    family = normalize_position_family(position_family)
    season = xe.load_european_league_season_passes(
        position_family=family,
        cache_version=xe.XP_DATA_CACHE_VERSION,
    )
    if season is None or season.empty:
        raise SystemExit("No season passes available for the requested position family.")

    completed = season[season["is_won"] & season["has_end"]].copy()
    if completed.empty:
        raise SystemExit("No completed passes available for the requested position family.")

    pool = _top_position_pass_pool(completed, top_n)
    agg = xpe.aggregate_pass_destination_grids(pool["passes"])
    quadrant_metrics = _quadrant_metrics(pool["passes"])

    common_fig = xsm._draw_destination_grid_map(
        agg["count_grid"],
        title="Common passes",
        cbar_label="Passes at destination",
        cmap=CMAP_COMMON_SOFT,
    )
    common_b64, common_quadrants = _render(common_fig)

    difficult_fig = xsm._draw_destination_grid_map(
        agg["mean_xp_grid"],
        title="Difficult passes",
        cbar_label="Mean xP at destination",
        cmap=xsm.CMAP_XP_GRAY_RED,
        vmax=xsm.XP_PASS_MAX,
    )
    difficult_b64, difficult_quadrants = _render(difficult_fig)

    quadrant_stats = [
        {
            "quadrant_key": key,
            "quadrant": xsm.AGGREGATE_QUADRANT_LABELS[key],
            **quadrant_metrics[key],
        }
        for key in xpe.QUADRANT_ORDER
    ]

    return {
        "position_family": family,
        "player_count": pool["player_count"],
        "total_passes": int(len(pool["passes"])),
        "min_passes_cutoff": pool["min_passes_cutoff"],
        "xp_scale_max": float(xsm.XP_PASS_MAX),
        "quadrant_stats": quadrant_stats,
        "common_map_b64": common_b64,
        "common_map_quadrants": common_quadrants,
        "rare_map_b64": difficult_b64,
        "rare_map_quadrants": difficult_quadrants,
    }


def main() -> None:
    payload = build_aggregated_payload(TOP_N, POSITION_FAMILY)
    OUT_PATH.write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")
    print(
        f"Wrote {OUT_PATH} (static render v{STATIC_AGGREGATE_RENDER_VERSION}, top {TOP_N})"
    )


if __name__ == "__main__":
    main()
