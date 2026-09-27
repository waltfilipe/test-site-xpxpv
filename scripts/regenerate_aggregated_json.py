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
STATIC_AGGREGATE_RENDER_VERSION = 12

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
# Offensive band: halfway line → front edge of the 18-yard box (StatsBomb x).
OFF_ZONE_X0 = xpe.FIELD_X / 2.0
OFF_ZONE_X1 = xpe.FIELD_X - 18.0
PEN_BOX_Y0 = xpe.FIELD_Y * 0.275
PEN_BOX_Y1 = xpe.FIELD_Y * 0.725

# Five vertical corridors (StatsBomb y = pitch width), matching tactical-board lanes.
CORRIDOR_BOUNDS: tuple[tuple[float, float, str], ...] = (
    (0.0, xpe.FIELD_Y * 0.16, "lat_l"),
    (xpe.FIELD_Y * 0.16, xpe.FIELD_Y * 0.32, "hs_l"),
    (xpe.FIELD_Y * 0.32, xpe.FIELD_Y * 0.48, "cen"),
    (xpe.FIELD_Y * 0.48, xpe.FIELD_Y * 0.64, "hs_r"),
    (xpe.FIELD_Y * 0.64, xpe.FIELD_Y, "lat_r"),
)
CORRIDOR_TONE: dict[str, str] = {
    "lat_l": "blue",
    "lat_r": "blue",
    "hs_l": "yellow",
    "hs_r": "yellow",
    "cen": "red",
}

# Match UI corridor colors (RGBA) for baked-in pitch overlays on full-field maps.
CORRIDOR_FACE: dict[str, tuple[float, float, float, float]] = {
    "blue": (59 / 255, 130 / 255, 246 / 255, 0.18),
    "yellow": (250 / 255, 204 / 255, 21 / 255, 0.20),
    "red": (239 / 255, 68 / 255, 68 / 255, 0.22),
}
CORRIDOR_EDGE: dict[str, tuple[float, float, float, float]] = {
    "blue": (37 / 255, 99 / 255, 235 / 255, 0.98),
    "yellow": (250 / 255, 204 / 255, 21 / 255, 0.98),
    "red": (239 / 255, 68 / 255, 68 / 255, 0.98),
}

CMAP_OFF_ZONE_VOLUME = LinearSegmentedColormap.from_list(
    "off_zone_vol_red",
    ["#fff1f2", "#fecdd3", "#fb7185", "#e11d48", "#881337"],
)

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


def _off_zone_dest_point(x: float, y: float) -> bool:
    x = float(x)
    return OFF_ZONE_X0 <= x < OFF_ZONE_X1


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
        if not _off_zone_dest_point(x_end, y_end):
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


def _draw_offensive_corridor_zone_map(
    corridor_counts: dict[str, int],
    *,
    title: str,
    cbar_label: str,
):
    """Standalone offensive band: five corridors, fill = pass volume (red scale)."""
    import matplotlib.pyplot as plt
    from matplotlib.cm import ScalarMappable
    from matplotlib.colors import Normalize

    field_y = float(xpe.FIELD_Y)
    x0, x1 = OFF_ZONE_X0, OFF_ZONE_X1

    fig, ax = plt.subplots(figsize=(7.4, 5.6))
    fig.set_facecolor("#1a1a2e")
    fig.set_dpi(220)
    ax.set_facecolor("#1e4620")
    ax.set_xlim(x0 - 1.2, x1 + 1.2)
    ax.set_ylim(-0.4, field_y + 0.4)
    ax.set_aspect("equal")
    ax.axis("off")

    ax.plot(
        [x0, x1, x1, x0, x0],
        [0, 0, field_y, field_y, 0],
        color="#f8fafc",
        linewidth=2.4,
        zorder=1,
    )
    ax.plot([x0, x0], [0, field_y], color="#cbd5e1", linewidth=2.0, linestyle="--", zorder=1)
    ax.plot([x1, x1], [PEN_BOX_Y0, PEN_BOX_Y1], color="#f8fafc", linewidth=2.6, zorder=1)

    values = np.array([float(corridor_counts.get(c, 0)) for _, _, c in CORRIDOR_BOUNDS])
    vmax = max(float(values.max()), 1.0)
    norm = Normalize(vmin=0.0, vmax=vmax)

    for (cy0, cy1, corridor), value in zip(CORRIDOR_BOUNDS, values):
        tone = CORRIDOR_TONE[corridor]
        edge_rgba = CORRIDOR_EDGE[tone]
        ax.add_patch(
            Rectangle(
                (x0, cy0),
                x1 - x0,
                cy1 - cy0,
                facecolor=CMAP_OFF_ZONE_VOLUME(norm(value)),
                edgecolor=edge_rgba,
                linewidth=3.4,
                zorder=2,
            )
        )

    sm = ScalarMappable(norm=norm, cmap=CMAP_OFF_ZONE_VOLUME)
    sm.set_array([])
    cbar = fig.colorbar(sm, ax=ax, fraction=0.035, pad=0.02)
    cbar.set_label(cbar_label, color="white", fontsize=8)
    cbar.ax.yaxis.set_tick_params(color="white", labelcolor="white")
    ax.set_title(title, color="#f8fafc", fontsize=13, fontweight="bold", pad=12)
    return fig


def _offensive_corridor_guides(fig) -> list[dict[str, Any]]:
    _, to_image_fraction = _figure_image_fraction_fn(fig)
    guides: list[dict[str, Any]] = []
    for y0, y1, corridor in CORRIDOR_BOUNDS:
        fx0, fy0 = to_image_fraction(OFF_ZONE_X0, y0)
        fx1, fy1 = to_image_fraction(OFF_ZONE_X1, y1)
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


def _render_fig_png(fig, *, pad_inches: float = PAD_INCHES) -> str:
    import matplotlib.pyplot as plt

    fig.canvas.draw()
    bbox = fig.get_tightbbox(fig.canvas.get_renderer()).padded(pad_inches)
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
    return base64.b64encode(buf.getvalue()).decode("ascii")


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

    off_corridor_counts_raw = {
        key: int(att_dest_counts[key]["passes"]) for key in att_dest_counts
    }
    offensive_corridor_fig = _draw_offensive_corridor_zone_map(
        off_corridor_counts_raw,
        title="Offensive zone · passes into corridors",
        cbar_label="Passes into corridor",
    )
    offensive_corridor_guides = _offensive_corridor_guides(offensive_corridor_fig)
    offensive_corridor_map_b64 = _render_fig_png(offensive_corridor_fig)

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
        "offensive_corridor_map_b64": offensive_corridor_map_b64,
        "offensive_corridor_guides": offensive_corridor_guides,
    }


def main() -> None:
    payload = build_aggregated_payload(TOP_N, POSITION_FAMILY)
    OUT_PATH.write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")
    print(
        f"Wrote {OUT_PATH} (static render v{STATIC_AGGREGATE_RENDER_VERSION}, top {TOP_N})"
    )


if __name__ == "__main__":
    main()
