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

from services.data_parts import clear_data_parts_cache, get_data_parts  # noqa: E402
from services.profile_service import build_round_grade_series  # noqa: E402
import xp_stats_engine as xstats  # noqa: E402

DATA_DIR = Path(__file__).resolve().parents[1] / "data"
PROFILES_DIR = DATA_DIR / "profiles"
PLAYER_IDS_FILE = DATA_DIR / "player-ids.json"
POSITION_FAMILY = "midfielders"


def main() -> None:
    player_ids = [str(pid) for pid in json.loads(PLAYER_IDS_FILE.read_text(encoding="utf-8"))]
    player_id_set = set(player_ids)

    print("Loading midfielder bundle…")
    clear_data_parts_cache()
    parts = get_data_parts(POSITION_FAMILY, require_passes=True)
    xp_rows = [
        dict(row)
        for row in parts["analysis_players"]
        if str(row.get("player_id")) in player_id_set
    ]
    xp_by_id = {
        pid: dict(xp)
        for pid, xp in parts["xp_by_id"].items()
        if pid in player_id_set
    }
    for row in xp_rows:
        pid = str(row["player_id"])
        if pid in xp_by_id:
            row.update(xp_by_id[pid])

    print(f"Recomputing composite match grades for {len(xp_rows)} players…")
    xstats.attach_composite_indices(xp_rows)

    updated = 0
    for row in xp_rows:
        pid = str(row["player_id"])
        profile_path = PROFILES_DIR / f"{pid}.json"
        if not profile_path.is_file():
            print(f"  WARNING: missing profile {pid}")
            continue

        profile = json.loads(profile_path.read_text(encoding="utf-8"))
        xp = profile.get("xp")
        if not isinstance(xp, dict):
            continue

        for key in (
            "xp_game_grades",
            "xp_game_grade_mean",
            "xp_game_grade_mad",
            "xp_game_consistency_score",
            "xp_round_series",
        ):
            if key in row:
                xp[key] = row[key]

        passes_df = parts["passes_by_player"].get(pid)
        profile["xp_round_grades"] = build_round_grade_series(xp, None)
        profile["xp_game_consistency_score"] = row.get("xp_game_consistency_score")
        profile_path.write_text(json.dumps(profile, ensure_ascii=False), encoding="utf-8")
        updated += 1

        grades = row.get("xp_game_grades") or ()
        if grades:
            print(
                f"  {pid}: grades {min(grades):.2f}–{max(grades):.2f}, "
                f"consistency {row.get('xp_game_consistency_score')}"
            )

    pool_metrics_path = DATA_DIR / "pool-metrics.json"
    if pool_metrics_path.is_file():
        pool_rows = json.loads(pool_metrics_path.read_text(encoding="utf-8"))
        xp_lookup = {str(r["player_id"]): r for r in xp_rows}
        for row in pool_rows:
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
        pool_metrics_path.write_text(json.dumps(pool_rows, ensure_ascii=False), encoding="utf-8")
        print("  updated pool-metrics.json")

    print(f"Done — {updated} profiles updated")


if __name__ == "__main__":
    main()
