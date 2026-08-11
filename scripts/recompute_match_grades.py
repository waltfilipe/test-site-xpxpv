#!/usr/bin/env python3
"""Recompute per-match composite grades and consistency for static profiles."""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path
from typing import Any

_BACKEND = Path(__file__).resolve().parents[2] / "xpv-xp_site" / "backend"
if str(_BACKEND) not in sys.path:
    sys.path.insert(0, str(_BACKEND))

os.environ.setdefault("PASS_SCOUT_MODE", "local")

import xpass_engine as xpe  # noqa: E402
import xp_engine as xe  # noqa: E402
from services.data_parts import clear_data_parts_cache, get_data_parts  # noqa: E402
from services.profile_service import build_round_grade_series  # noqa: E402
from xp_stats_engine import XP_ROUND_SERIES_KEY, round_production_series  # noqa: E402
import xp_stats_engine as xstats  # noqa: E402

DATA_DIR = Path(__file__).resolve().parents[1] / "data"
PROFILES_DIR = DATA_DIR / "profiles"
PLAYER_IDS_FILE = DATA_DIR / "player-ids.json"
POSITION_FAMILY = "midfielders"


def _refresh_round_series(
    rows: list[dict[str, Any]],
    passes_by_player: dict[str, Any],
) -> int:
    """Attach xPass and rebuild per-match series (incl. short/long COE) for pool rows."""
    refreshed = 0
    for row in rows:
        pid = str(row.get("player_id") or "")
        grp = passes_by_player.get(pid)
        if grp is None or getattr(grp, "empty", True):
            continue
        try:
            prepared = xpe.attach_xpass_to_passes(grp.copy())
        except KeyError:
            continue
        series = round_production_series(prepared)
        if not series:
            continue
        row[XP_ROUND_SERIES_KEY] = series
        refreshed += 1
    return refreshed


def main() -> None:
    player_ids = [str(pid) for pid in json.loads(PLAYER_IDS_FILE.read_text(encoding="utf-8"))]

    print("Loading midfielder bundle…")
    clear_data_parts_cache()
    parts = get_data_parts(POSITION_FAMILY, require_passes=True)
    xp_by_id = parts["xp_by_id"]

    print("Loading scored passes with geometry for xPass COE…")
    passes_by_player = xe.load_european_league_xp_passes_grouped(POSITION_FAMILY)

    pool_rows = [dict(xp) for xp in xp_by_id.values()]
    print(f"Refreshing per-match COE for {len(pool_rows)} pool players…")
    refreshed = _refresh_round_series(pool_rows, passes_by_player)
    print(f"  {refreshed} players with xPass round series")

    print("Recomputing composite match grades on full position pool…")
    xstats.attach_composite_indices(pool_rows)
    xp_lookup = {str(row["player_id"]): row for row in pool_rows}

    updated = 0
    with_eff = 0
    for pid in player_ids:
        row = xp_lookup.get(pid)
        profile_path = PROFILES_DIR / f"{pid}.json"
        if row is None or not profile_path.is_file():
            print(f"  WARNING: missing data for {pid}")
            continue

        profile = json.loads(profile_path.read_text(encoding="utf-8"))
        xp = profile.get("xp")
        if not isinstance(xp, dict):
            continue

        series = list(row.get(XP_ROUND_SERIES_KEY) or ())
        for key in (
            "xp_game_grades",
            "xp_game_grade_mean",
            "xp_game_grade_mad",
            "xp_game_consistency_score",
            XP_ROUND_SERIES_KEY,
        ):
            if key in row:
                xp[key] = list(series) if key == XP_ROUND_SERIES_KEY else row[key]

        profile["xp_round_grades"] = build_round_grade_series(xp, None)
        profile["xp_game_consistency_score"] = row.get("xp_game_consistency_score")
        profile_path.write_text(json.dumps(profile, ensure_ascii=False), encoding="utf-8")
        updated += 1

        games = profile.get("xp_round_grades") or []
        filled = sum(
            1
            for g in games
            if g.get("short_pass_eff_pct") is not None or g.get("long_pass_eff_pct") is not None
        )
        with_eff += filled
        grades = row.get("xp_game_grades") or ()
        if grades:
            print(
                f"  {pid}: COE {filled}/{len(games)}, grades {min(grades):.2f}–{max(grades):.2f}, "
                f"consistency {row.get('xp_game_consistency_score')}"
            )

    pool_metrics_path = DATA_DIR / "pool-metrics.json"
    if pool_metrics_path.is_file():
        pool_rows_json = json.loads(pool_metrics_path.read_text(encoding="utf-8"))
        for row in pool_rows_json:
            pid = str(row.get("player_id"))
            src = xp_lookup.get(pid)
            if not src:
                continue
            for key in (
                "xp_game_grades",
                "xp_game_grade_mean",
                "xp_game_grade_mad",
                "xp_game_consistency_score",
            ):
                if key in src:
                    row[key] = src[key]
        pool_metrics_path.write_text(json.dumps(pool_rows_json, ensure_ascii=False), encoding="utf-8")
        print("  updated pool-metrics.json")

    print(f"Done — {updated} profiles updated, {with_eff} game rows with COE")


if __name__ == "__main__":
    main()
