#!/usr/bin/env python3
"""Refresh players.json and pool-metrics.json from the backend API pool."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
POOL_PATH = Path("/agent/repos/xpv-xp_site/backend/data/api_pool_midfielders.json")

PLAYER_LIST_FIELDS = (
    "player_id",
    "player_name",
    "position",
    "position_group",
    "position_family",
    "league",
    "league_source",
    "age",
    "height",
    "nationality",
    "dominant_foot",
    "market_value",
    "market_value_eur",
    "contract_until",
    "photo_url",
    "pass_rating",
    "pass_rating_rank",
    "pass_rating_total",
    "progression_rating",
    "progression_rating_rank",
    "progression_rating_total",
    "total_passes",
    "total_xt",
    "xt_per_pass",
    "midfield_origin_profile",
    "eligible_for_rating",
    "xp_pass_rating",
    "pass_grade_overall",
    "pass_grade_overall_rank_in_pool",
    "team",
    "pass_volume_letter",
    "pass_efficiency_letter",
    "pass_buildup_letter",
    "pass_chance_creation_letter",
    "pv_abs_leth_letter",
    "defense_letter",
    "defense_display",
)

SYNC_FIELDS = {
    "pass_rating",
    "pass_rating_rank",
    "pass_rating_total",
    "xp_pass_rating",
    "pass_grade_overall",
    "pass_grade_overall_rank_in_pool",
    "pass_grade_overall_rank_pool_size",
    "pass_volume_letter",
    "pass_efficiency_letter",
    "pass_buildup_letter",
    "pass_chance_creation_letter",
    "pv_abs_leth_letter",
    "defense_letter",
    "defense_display",
    "passes_total",
    "minutes",
    "minutes_pct",
    "team",
    "age",
}


def _pick(player: dict[str, Any], fields: tuple[str, ...]) -> dict[str, Any]:
    return {key: player.get(key) for key in fields if key in player}


def main() -> None:
    pool = json.loads(POOL_PATH.read_text(encoding="utf-8"))
    eligible = [p for p in pool["players"] if p.get("xp_profile_bars_eligible")]
    by_id = {str(p["player_id"]): p for p in eligible}

    existing_metrics: list[dict[str, Any]] = []
    metrics_path = DATA / "pool-metrics.json"
    if metrics_path.is_file():
        existing_metrics = json.loads(metrics_path.read_text(encoding="utf-8"))

    metrics_by_id = {str(row["player_id"]): row for row in existing_metrics}
    merged_metrics: list[dict[str, Any]] = []

    for pid, player in sorted(by_id.items(), key=lambda item: item[1].get("player_name", "")):
        base = dict(metrics_by_id.get(pid, player))
        base["player_id"] = pid
        for key, value in player.items():
            if key in SYNC_FIELDS or key not in base or base.get(key) is None:
                base[key] = value
        merged_metrics.append(base)

    rows = []
    for player in eligible:
        pid = str(player["player_id"])
        metrics = metrics_by_id.get(pid, player)
        row = _pick({**metrics, **player}, PLAYER_LIST_FIELDS)
        row["player_id"] = pid
        rows.append(row)

    rows.sort(
        key=lambda row: (
            row.get("pass_grade_overall_rank_in_pool")
            if row.get("pass_grade_overall_rank_in_pool") is not None
            else 9999
        )
    )

    leagues = sorted({str(r.get("league_source", "")) for r in rows if r.get("league_source")})

    players_payload = {
        "position_family": "midfielders",
        "total": len(rows),
        "offset": 0,
        "limit": len(rows),
        "players": rows,
    }
    players_payload_path = DATA / "players.json"
    players_payload_path.write_text(
        json.dumps(players_payload, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    metrics_path.write_text(
        json.dumps(merged_metrics, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    meta_path = DATA / "meta.json"
    if meta_path.is_file():
        meta = json.loads(meta_path.read_text(encoding="utf-8"))
    else:
        meta = {"position_family": "midfielders"}
    meta["player_count"] = len(rows)
    meta["leagues"] = leagues
    meta_path.write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"Synced {len(rows)} eligible players ({len(leagues)} leagues)")
    print(f"  wrote {players_payload_path.name}, {metrics_path.name}, {meta_path.name}")


if __name__ == "__main__":
    main()
