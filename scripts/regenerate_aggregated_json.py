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
# grid-cell geometry so the UI can anchor tooltips over the rendered PNGs.
STATIC_AGGREGATE_RENDER_VERSION = 11

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
from matplotlib.patches import Rectangle  # noqa: E402

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
DEST_COLS = 8
DEST_ROWS = 6
ATT_THIRD_X = xpe.FIELD_X * (2.0 / 3.0)

# Five vertical corridors (StatsBomb y = pitch width), matching tactical-board lanes.
CORRIDOR_BOUNDS: tuple[tuple[float, float, str], ...] = (
    (0.0, xpe.FIELD_Y * 0.16, "lat_l"),
    (xpe.FIELD_Y * 0.16, xpe.FIELD_Y * 0.32, "hs_l"),
    (xpe.FIELD_Y * 0.32, xpe.FIELD_Y * 0.48, "cen"),
    (xpe.FIELD_Y * 0.48, xpe.FIELD_Y * 0.64, "hs_r"),
    (xpe.FIELD_Y * 0.64, xpe.FIELD_Y, "lat_r"),
)
CORRIDOR_TONE: dict[str, str] = {
    "lat_l": "yellow",
    "lat_r": "yellow",
    "hs_l": "white",
    "hs_r": "white",
    "cen": "red",
}

# Match UI corridor colors (RGBA) for baked-in pitch overlays.
CORRIDOR_FACE: dict[str, tuple[float, float, float, float]] = {
    "yellow": (250 / 255, 204 / 255, 21 / 255, 0.20),
    "white": (248 / 255, 250 / 255, 252 / 255, 0.14),
    "red": (239 / 255, 68 / 255, 68 / 255, 0.22),
}
CORRIDOR_EDGE: dict[str, tuple[float, float, float, float]] = {
    "yellow": (250 / 255, 204 / 255, 21 / 255, 0.98),
    "white": (248 / 255, 250 / 255, 252 / 255, 0.95),
    "red": (239 / 255, 68 / 255, 68 / 255, 0.98),
}

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


def cell_key(row: int, col: int) -> str:
    return f"r{row}c{col}"


def corridor_for_y(y: float) -> str:
    y = float(y)
    for y0, y1, corridor in CORRIDOR_BOUNDS:
        if y0 <= y < y1 or (corridor == "lat_r" and y >= y0):
            return corridor
    return "lat_r"


def cell_center(row: int, col: int) -> tuple[float, float]:
    x = (col + 0.5) / DEST_COLS * xpe.FIELD_X
    y = (row + 0.5) / DEST_ROWS * xpe.FIELD_Y
    return x, y


def is_att_third_x(x: float) -> bool:
    return float(x) >= ATT_THIRD_X


def is_offensive_halfspace_point(x: float, y: float) -> bool:
    return is_att_third_x(x) and corridor_for_y(y) in ("hs_l", "hs_r")


def _att_third_origin_point(x: float, y: float) -> bool:
    return is_att_third_x(x)


def _att_third_dest_point(x: float, y: float) -> bool:
    return is_att_third_x(x)


def is_offensive_halfspace_cell(row: int, col: int) -> bool:
    x, y = cell_center(row, col)
    return is_offensive_halfspace_point(x, y)


def _aggregate_dest_att_third_grid(passes) -> np.ndarray:
    """Pass counts by destination cell for passes ending in the attacking third."""
    grid = np.zeros((DEST_ROWS, DEST_COLS), dtype=float)
    work = passes[passes["is_won"] & passes["has_end"]].dropna(subset=["x_end", "y_end"])
    if work.empty:
        return grid
    att = work[work["x_end"].to_numpy(dtype=float) >= ATT_THIRD_X]
    if att.empty:
        return grid
    x_idx, y_idx = xpe._cell_indices(
        att["x_end"].to_numpy(dtype=float),
        att["y_end"].to_numpy(dtype=float),
        cols=DEST_COLS,
        rows=DEST_ROWS,
    )
    for ix, iy in zip(x_idx, y_idx):
        grid[iy, ix] += 1.0
    return grid


def _att_third_corridor_dest_counts(passes) -> tuple[dict[str, dict[str, Any]], int]:
    work = passes[passes["is_won"] & passes["has_end"]].dropna(subset=["x_end", "y_end"])
    counts: dict[str, int] = {key: 0 for _, _, key in CORRIDOR_BOUNDS}
    for x_end, y_end in zip(
        work["x_end"].to_numpy(dtype=float),
        work["y_end"].to_numpy(dtype=float),
    ):
        if not _att_third_dest_point(x_end, y_end):
            continue
        counts[corridor_for_y(y_end)] += 1
    total = max(sum(counts.values()), 1)
    return (
        {
            key: {
                "passes": int(counts[key]),
                "share_pct": round(counts[key] / total * 100.0, 2),
            }
            for key in counts
        },
        int(sum(counts.values())),
    )


def _dest_corridor_counts_from_passes(passes) -> dict[str, dict[str, Any]]:
    work = passes[passes["is_won"] & passes["has_end"]].dropna(subset=["x_end", "y_end"])
    counts: dict[str, int] = {key: 0 for _, _, key in CORRIDOR_BOUNDS}
    for y_end in work["y_end"].to_numpy(dtype=float):
        counts[corridor_for_y(y_end)] += 1
    total = max(sum(counts.values()), 1)
    return {
        key: {
            "passes": int(counts[key]),
            "share_pct": round(counts[key] / total * 100.0, 2),
        }
        for key in counts
    }


def _att_third_corridor_origin_flows(passes) -> dict[str, dict[str, Any]]:
    base = passes[passes["is_won"] & passes["has_end"]].dropna(
        subset=["x_start", "y_start", "x_end", "y_end"]
    )
    flows: dict[str, dict[str, Any]] = {}
    for _, _, corridor in CORRIDOR_BOUNDS:
        mask = np.array([
            _att_third_origin_point(x, y) and corridor_for_y(y) == corridor
            for x, y in zip(
                base["x_start"].to_numpy(dtype=float),
                base["y_start"].to_numpy(dtype=float),
            )
        ])
        subset = base.loc[mask]
        dest = xpe.aggregate_pass_destination_grids(
            subset, dest_cols=DEST_COLS, dest_rows=DEST_ROWS
        )
        flows[corridor] = {
            "origin_passes": int(len(subset)),
            "dest_cell_stats": _cell_metrics_from_grid(
                dest["count_grid"],
                metric="dest",
                mean_xp_grid=dest["mean_xp_grid"],
            ),
            "dest_corridor_counts": _dest_corridor_counts_from_passes(subset),
        }
    return flows


def _aggregate_origin_grid(passes) -> np.ndarray:
    grid = np.zeros((DEST_ROWS, DEST_COLS), dtype=float)
    work = passes[passes["is_won"] & passes["has_end"]].dropna(subset=["x_start", "y_start"])
    if work.empty:
        return grid
    x_idx, y_idx = xpe._cell_indices(
        work["x_start"].to_numpy(dtype=float),
        work["y_start"].to_numpy(dtype=float),
        cols=DEST_COLS,
        rows=DEST_ROWS,
    )
    for ix, iy in zip(x_idx, y_idx):
        grid[iy, ix] += 1.0
    return grid


def _origin_comparison_grid(origin_grid: np.ndarray) -> np.ndarray:
    """Index map: cell origin volume vs mean origin volume outside offensive half-space."""
    non_ohs = [
        float(origin_grid[row, col])
        for row in range(DEST_ROWS)
        for col in range(DEST_COLS)
        if not is_offensive_halfspace_cell(row, col) and origin_grid[row, col] > 0
    ]
    baseline = float(np.mean(non_ohs)) if non_ohs else 1.0
    out = np.zeros_like(origin_grid)
    for row in range(DEST_ROWS):
        for col in range(DEST_COLS):
            count = float(origin_grid[row, col])
            if count <= 0:
                continue
            out[row, col] = count / max(baseline, 1e-6)
    return out


def _halfspace_summary(passes) -> dict[str, Any]:
    work = passes[passes["is_won"] & passes["has_end"]].dropna(subset=["x_start", "y_start"])
    total = max(len(work), 1)
    counts: dict[str, int] = {key: 0 for _, _, key in CORRIDOR_BOUNDS}
    ohs = 0
    for x_start, y_start in zip(
        work["x_start"].to_numpy(dtype=float),
        work["y_start"].to_numpy(dtype=float),
    ):
        corridor = corridor_for_y(y_start)
        counts[corridor] += 1
        if is_offensive_halfspace_point(x_start, y_start):
            ohs += 1
    att_third = int((work["x_start"].to_numpy(dtype=float) >= ATT_THIRD_X).sum())
    return {
        "origin_total": int(len(work)),
        "offensive_halfspace_origins": int(ohs),
        "offensive_halfspace_origin_share_pct": round(ohs / total * 100.0, 2),
        "attacking_third_origins": att_third,
        "corridor_origin_counts": counts,
    }


def _cell_metrics_from_grid(
    count_grid: np.ndarray,
    *,
    metric: str,
    mean_xp_grid: np.ndarray | None = None,
) -> list[dict[str, Any]]:
    total = max(float(count_grid.sum()), 1.0)
    rows: list[dict[str, Any]] = []
    for row in range(DEST_ROWS):
        for col in range(DEST_COLS):
            count = int(count_grid[row, col])
            x, y = cell_center(row, col)
            x_zone = ("def", "mid", "att")[min(int(x / xpe.FIELD_X * 3), 2)]
            y_zone = ("left", "centre", "right")[min(int(y / xpe.FIELD_Y * 3), 2)]
            entry: dict[str, Any] = {
                "key": cell_key(row, col),
                "row": row,
                "col": col,
                "x_zone": x_zone,
                "y_zone": y_zone,
                "corridor": corridor_for_y(y),
                "is_offensive_halfspace": is_offensive_halfspace_cell(row, col),
                "passes": count,
                "share_pct": round(count / total * 100.0, 2),
            }
            if metric == "index":
                entry["index_vs_other_spaces"] = round(float(count_grid[row, col]), 3)
            if mean_xp_grid is not None:
                entry["mean_xp"] = round(float(mean_xp_grid[row, col]), 4)
            rows.append(entry)
    return rows


def _style_title(fig) -> None:
    ax = fig.axes[0]
    ax.set_title(
        ax.get_title(),
        color="#f8fafc",
        fontsize=13,
        fontweight="bold",
        pad=16,
    )


def _emphasize_att_third_corridors(fig, *, dim_outside: bool = True) -> None:
    """Draw five attacking-third corridor bands (yellow / white / red) on the pitch."""
    ax = fig.axes[0]
    field_x = float(xpe.FIELD_X)
    field_y = float(xpe.FIELD_Y)

    if dim_outside:
        ax.add_patch(
            Rectangle(
                (0.0, 0.0),
                ATT_THIRD_X,
                field_y,
                facecolor=(0.06, 0.09, 0.16, 0.62),
                edgecolor="none",
                zorder=3,
            )
        )

    ax.plot(
        [ATT_THIRD_X, ATT_THIRD_X],
        [0.0, field_y],
        color="#facc15",
        linewidth=2.4,
        alpha=0.95,
        zorder=7,
        solid_capstyle="butt",
    )

    att_width = field_x - ATT_THIRD_X
    for y0, y1, corridor in CORRIDOR_BOUNDS:
        tone = CORRIDOR_TONE[corridor]
        ax.add_patch(
            Rectangle(
                (ATT_THIRD_X, y0),
                att_width,
                y1 - y0,
                facecolor=CORRIDOR_FACE[tone],
                edgecolor=CORRIDOR_EDGE[tone],
                linewidth=2.6,
                zorder=8,
            )
        )

    for y_split in (xpe.FIELD_Y * 0.16, xpe.FIELD_Y * 0.32, xpe.FIELD_Y * 0.48, xpe.FIELD_Y * 0.64):
        ax.plot(
            [ATT_THIRD_X, field_x],
            [y_split, y_split],
            color=(1.0, 1.0, 1.0, 0.55),
            linewidth=1.1,
            zorder=9,
        )


def _figure_image_fraction_fn(fig, *, pad_inches: float = PAD_INCHES):
    """Map pitch data coordinates to fractions of the exported PNG."""
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

    return bbox, to_image_fraction


def _attacking_corridor_guides(fig) -> list[dict[str, Any]]:
    """Five corridor bands in the attacking third (yellow / white / red tones)."""
    _, to_image_fraction = _figure_image_fraction_fn(fig)
    guides: list[dict[str, Any]] = []
    for y0, y1, corridor in CORRIDOR_BOUNDS:
        fx0, fy0 = to_image_fraction(ATT_THIRD_X, y0)
        fx1, fy1 = to_image_fraction(xpe.FIELD_X, y1)
        left, right = sorted((fx0, fx1))
        bottom, top = sorted((fy0, fy1))
        guides.append({
            "corridor": corridor,
            "tone": CORRIDOR_TONE[corridor],
            "left_pct": round(left * 100.0, 3),
            "top_pct": round((1.0 - top) * 100.0, 3),
            "width_pct": round((right - left) * 100.0, 3),
            "height_pct": round((top - bottom) * 100.0, 3),
        })
    return guides


def _render(fig, *, pad_inches: float = PAD_INCHES) -> tuple[str, dict[str, dict[str, float]]]:
    """Save the figure as base64 PNG and locate each grid cell inside it.

    `fig_to_b64` crops with bbox_inches="tight", so cell boxes are measured
    against the same cropped bbox to stay aligned with the delivered image.
    """
    import matplotlib.pyplot as plt

    bbox, to_image_fraction = _figure_image_fraction_fn(fig, pad_inches=pad_inches)

    x_bins = np.linspace(0.0, xpe.FIELD_X, DEST_COLS + 1)
    y_bins = np.linspace(0.0, xpe.FIELD_Y, DEST_ROWS + 1)

    cells: dict[str, dict[str, float]] = {}
    for row in range(DEST_ROWS):
        for col in range(DEST_COLS):
            fx0, fy0 = to_image_fraction(x_bins[col], y_bins[row])
            fx1, fy1 = to_image_fraction(x_bins[col + 1], y_bins[row + 1])
            left, right = sorted((fx0, fx1))
            bottom, top = sorted((fy0, fy1))
            cells[cell_key(row, col)] = {
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
    return base64.b64encode(buf.getvalue()).decode("ascii"), cells


def _zone_keys(col: int, row: int) -> tuple[str, str]:
    """Pitch thirds for a cell centre: defensive/middle/attacking × left/centre/right."""
    x_centre = (col + 0.5) / DEST_COLS
    y_centre = (row + 0.5) / DEST_ROWS
    x_zone = ("def", "mid", "att")[min(int(x_centre * 3), 2)]
    y_zone = ("left", "centre", "right")[min(int(y_centre * 3), 2)]
    return x_zone, y_zone


def _cell_metrics(count_grid, mean_xp_grid) -> list[dict[str, Any]]:
    """Pass count, share and mean xP per destination grid cell."""
    total = max(float(count_grid.sum()), 1.0)
    rows: list[dict[str, Any]] = []
    for row in range(DEST_ROWS):
        for col in range(DEST_COLS):
            count = int(count_grid[row, col])
            x_zone, y_zone = _zone_keys(col, row)
            rows.append({
                "key": cell_key(row, col),
                "row": row,
                "col": col,
                "x_zone": x_zone,
                "y_zone": y_zone,
                "passes": count,
                "share_pct": round(count / total * 100.0, 2),
                "mean_xp": round(float(mean_xp_grid[row, col]), 4),
            })
    return rows


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
    agg = xpe.aggregate_pass_destination_grids(
        pool["passes"], dest_cols=DEST_COLS, dest_rows=DEST_ROWS
    )
    quadrant_metrics = _quadrant_metrics(pool["passes"])

    common_fig = xsm._draw_destination_grid_map(
        agg["count_grid"],
        title="Common passes",
        cbar_label="Passes at destination",
        cmap=CMAP_COMMON_SOFT,
    )
    _style_title(common_fig)
    attacking_corridor_guides = _attacking_corridor_guides(common_fig)
    common_b64, common_cells = _render(common_fig)

    difficult_fig = xsm._draw_destination_grid_map(
        agg["mean_xp_grid"],
        title="Difficult passes",
        cbar_label="Mean xP at destination",
        cmap=xsm.CMAP_XP_GRAY_RED,
        vmax=xsm.XP_PASS_MAX,
    )
    _style_title(difficult_fig)
    difficult_b64, difficult_cells = _render(difficult_fig)

    passes_df = pool["passes"]
    halfspace_summary = _halfspace_summary(passes_df)
    att_dest_counts, att_dest_total = _att_third_corridor_dest_counts(passes_df)
    halfspace_summary["att_third_corridor_dest_counts"] = att_dest_counts
    halfspace_summary["att_third_dest_total"] = att_dest_total

    dest_att_third_grid = _aggregate_dest_att_third_grid(passes_df)
    corridor_origin_flows = _att_third_corridor_origin_flows(passes_df)

    att_origin_work = passes_df[passes_df["is_won"] & passes_df["has_end"]].dropna(
        subset=["x_start", "y_start", "x_end", "y_end"]
    )
    att_origin_mask = att_origin_work["x_start"].to_numpy(dtype=float) >= ATT_THIRD_X
    att_origin_passes = att_origin_work.loc[att_origin_mask]
    att_origin_dest = xpe.aggregate_pass_destination_grids(
        att_origin_passes, dest_cols=DEST_COLS, dest_rows=DEST_ROWS
    )

    halfspace_origin_fig = xsm._draw_destination_grid_map(
        dest_att_third_grid,
        title="Attacking third · passes into corridors",
        cbar_label="Passes ending in attacking third",
        cmap=CMAP_COMMON_SOFT,
    )
    _style_title(halfspace_origin_fig)
    _emphasize_att_third_corridors(halfspace_origin_fig, dim_outside=True)
    halfspace_origin_b64, halfspace_origin_cells = _render(halfspace_origin_fig)

    halfspace_dest_fig = xsm._draw_destination_grid_map(
        att_origin_dest["count_grid"],
        title="Attacking third · pass destinations by origin corridor",
        cbar_label="Passes at destination",
        cmap=CMAP_COMMON_SOFT,
    )
    _style_title(halfspace_dest_fig)
    _emphasize_att_third_corridors(halfspace_dest_fig, dim_outside=False)
    halfspace_dest_b64, halfspace_dest_cells = _render(halfspace_dest_fig)

    halfspace_origin_cell_stats = _cell_metrics_from_grid(
        dest_att_third_grid,
        metric="dest",
    )

    halfspace_dest_cell_stats = _cell_metrics_from_grid(
        att_origin_dest["count_grid"],
        metric="dest",
        mean_xp_grid=att_origin_dest["mean_xp_grid"],
    )

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
        "dest_cols": DEST_COLS,
        "dest_rows": DEST_ROWS,
        "attacking_corridor_guides": attacking_corridor_guides,
        "quadrant_stats": quadrant_stats,
        "cell_stats": _cell_metrics(agg["count_grid"], agg["mean_xp_grid"]),
        "common_map_b64": common_b64,
        "common_map_cells": common_cells,
        "rare_map_b64": difficult_b64,
        "rare_map_cells": difficult_cells,
        "halfspace_summary": halfspace_summary,
        "halfspace_origin_map_b64": halfspace_origin_b64,
        "halfspace_origin_map_cells": halfspace_origin_cells,
        "halfspace_origin_cell_stats": halfspace_origin_cell_stats,
        "halfspace_dest_map_b64": halfspace_dest_b64,
        "halfspace_dest_map_cells": halfspace_dest_cells,
        "halfspace_dest_cell_stats": halfspace_dest_cell_stats,
        "att_third_corridor_origin_flows": corridor_origin_flows,
    }


def main() -> None:
    payload = build_aggregated_payload(TOP_N, POSITION_FAMILY)
    OUT_PATH.write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")
    print(
        f"Wrote {OUT_PATH} (static render v{STATIC_AGGREGATE_RENDER_VERSION}, top {TOP_N})"
    )


if __name__ == "__main__":
    main()
