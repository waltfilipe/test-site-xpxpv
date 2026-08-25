#!/usr/bin/env python3
"""Build composite player badge assignments for the static test site."""

from __future__ import annotations

import json
from pathlib import Path

POOL_PATH = Path("/agent/repos/xpv-xp_site/backend/data/api_pool_midfielders.json")
DERIVED_PATH = Path(__file__).resolve().parents[1] / "data" / "pool-derived-metrics.json"
OUTPUT_PATH = Path(__file__).resolve().parents[1] / "data" / "player-badges.json"

BADGE_ORDER = (
    "elite_passer",
    "metronome",
    "organizador",
    "progressor",
    "criativo",
    "mestre_curto",
    "bombeiro_longo",
)

_GAP_MIN_PP = 3.0

_LETTER_TIER: dict[str, int] = {
    "A+": 10,
    "A": 9,
    "A-": 8,
    "B+": 7,
    "B": 6,
    "B-": 5,
    "C+": 4,
    "C": 3,
    "C-": 2,
    "D": 1,
    "—": 0,
}


def _letter_tier(letter: str | None) -> int:
    return _LETTER_TIER.get(str(letter or "—").strip(), 0)


def _at_least(letter: str | None, floor: str) -> bool:
    return _letter_tier(letter) >= _LETTER_TIER[floor]


def _at_most(letter: str | None, ceiling: str) -> bool:
    return _letter_tier(letter) <= _LETTER_TIER[ceiling]


def _pctile(values: list[float], q: float) -> float:
    if not values:
        return 0.0
    ordered = sorted(values)
    pos = (len(ordered) - 1) * q
    lo = int(pos)
    hi = min(lo + 1, len(ordered) - 1)
    frac = pos - lo
    return ordered[lo] * (1.0 - frac) + ordered[hi] * frac


def _get(player: dict, derived: dict[str, dict], key: str):
    value = player.get(key)
    if value is None:
        value = derived.get(str(player.get("player_id", "")), {}).get(key)
    return value


def main() -> None:
    pool = json.loads(POOL_PATH.read_text(encoding="utf-8"))
    derived = json.loads(DERIVED_PATH.read_text(encoding="utf-8")).get("players", {})
    eligible = [p for p in pool["players"] if p.get("xp_profile_bars_eligible")]

    rows: list[dict] = []
    for player in eligible:
        short_d = float(_get(player, derived, "eff_short_stratum_delta_pp") or 0.0)
        long_d = float(_get(player, derived, "eff_long_stratum_delta_pp") or 0.0)
        rows.append(
            {
                "player_id": str(player["player_id"]),
                "player_name": str(player.get("player_name") or ""),
                "vol": float(_get(player, derived, "passes_total") or 0.0),
                "leth": float(_get(player, derived, "leth_xpv_per_pass") or 0.0),
                "xpv_pp": float(_get(player, derived, "xpv_per_pass") or 0.0),
                "chance": float(_get(player, derived, "pass_chance_creation_index") or -999.0),
                "buildup": float(_get(player, derived, "pass_buildup_index") or -999.0),
                "vol_letter": str(_get(player, derived, "pass_volume_letter") or "—"),
                "buildup_letter": str(_get(player, derived, "pass_buildup_letter") or "—"),
                "precision_letter": str(_get(player, derived, "pass_efficiency_letter") or "—"),
                "chance_letter": str(_get(player, derived, "pass_chance_creation_letter") or "—"),
                "leth_letter": str(_get(player, derived, "pv_abs_leth_letter") or "—"),
                "short_d": short_d,
                "long_d": long_d,
                "gap_short_long": short_d - long_d,
                "gap_long_short": long_d - short_d,
                "long_share_pctile": float(
                    _get(player, derived, "long_pass_share_pctile") or 50.0
                ),
            }
        )

    def pct(key: str, q: float) -> float:
        return _pctile([row[key] for row in rows], q)

    thresholds = {
        "short_d_p50": pct("short_d", 0.50),
        "long_d_p50": pct("long_d", 0.50),
        "gap_min_pp": _GAP_MIN_PP,
        "xpv_pp_p60": pct("xpv_pp", 0.60),
        "xpv_pp_p70": pct("xpv_pp", 0.70),
    }

    by_player_id: dict[str, list[str]] = {}
    counts: dict[str, int] = {key: 0 for key in BADGE_ORDER}

    for row in rows:
        badges: list[str] = []
        is_metronome_base = _at_least(row["vol_letter"], "B+") and _at_least(
            row["precision_letter"], "B+"
        )
        if is_metronome_base:
            if _at_least(row["chance_letter"], "A-"):
                badges.append("elite_passer")
            else:
                badges.append("metronome")

        if (
            _at_least(row["buildup_letter"], "B")
            and _at_least(row["vol_letter"], "B")
            and row["xpv_pp"] < thresholds["xpv_pp_p60"]
            and "metronome" not in badges
            and "elite_passer" not in badges
        ):
            badges.append("organizador")
        if (
            _at_most(row["vol_letter"], "B")
            and _at_least(row["buildup_letter"], "B+")
            and row["xpv_pp"] > thresholds["xpv_pp_p70"]
        ):
            badges.append("progressor")
        if (
            _at_most(row["vol_letter"], "B")
            and _at_least(row["chance_letter"], "B+")
            and _at_least(row["leth_letter"], "B+")
        ):
            badges.append("criativo")
        if (
            row["gap_short_long"] >= _GAP_MIN_PP
            and row["short_d"] >= thresholds["short_d_p50"]
            and row["long_share_pctile"] <= 60.0
        ):
            badges.append("mestre_curto")
        if (
            row["gap_long_short"] >= _GAP_MIN_PP
            and row["long_d"] >= thresholds["long_d_p50"]
            and row["long_share_pctile"] >= 40.0
        ):
            badges.append("bombeiro_longo")

        ordered = [key for key in BADGE_ORDER if key in badges]
        if ordered:
            by_player_id[row["player_id"]] = ordered
            for key in ordered:
                counts[key] += 1

    payload = {
        "cache_version": 1,
        "eligible_count": len(rows),
        "badge_order": list(BADGE_ORDER),
        "criteria": {
            "elite_passer": (
                "pass_volume_letter >= B+ AND pass_efficiency_letter >= B+ "
                "AND pass_chance_creation_letter >= A- (replaces metronome)"
            ),
            "metronome": (
                "pass_volume_letter >= B+ AND pass_efficiency_letter >= B+ "
                "AND pass_chance_creation_letter < A-"
            ),
            "organizador": (
                "pass_buildup_letter >= B AND pass_volume_letter >= B "
                "AND xpv_per_pass < P60 AND NOT metronome/elite_passer"
            ),
            "progressor": (
                "pass_volume_letter <= B AND pass_buildup_letter >= B+ "
                "AND xpv_per_pass > P70"
            ),
            "criativo": (
                "pass_volume_letter <= B AND pass_chance_creation_letter >= B+ "
                "AND pv_abs_leth_letter >= B+"
            ),
            "mestre_curto": (
                "gap(short-long) >= 3pp AND short_delta >= P50 "
                "AND long_pass_share_pctile <= 60 (short share >= P40)"
            ),
            "bombeiro_longo": (
                "gap(long-short) >= 3pp AND long_delta >= P50 "
                "AND long_pass_share_pctile >= 40"
            ),
        },
        "thresholds": thresholds,
        "counts": counts,
        "by_player_id": by_player_id,
    }

    OUTPUT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {OUTPUT_PATH} ({len(by_player_id)} players with badges)")
    for key in BADGE_ORDER:
        print(f"  {key}: {counts[key]}")

    by_name = {r["player_id"]: r["player_name"] for r in rows}
    for key in BADGE_ORDER:
        ids = sorted(
            (pid for pid, bs in by_player_id.items() if key in bs),
            key=lambda pid: by_name.get(pid, pid),
        )
        if ids:
            print(f"\n{key}:")
            for pid in ids:
                print(f"  - {by_name.get(pid, pid)}")


if __name__ == "__main__":
    main()
