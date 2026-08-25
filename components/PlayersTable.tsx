"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { PlayerSummary } from "@/lib/api";
import { GradeBadge } from "@/components/ui/GradeBadge";
import { formatLeagueName } from "@/lib/formatters";
import { useI18n } from "@/lib/i18n/context";
import { overallPassGradeFromProfile } from "@/lib/passGrades";
import { PLAYER_BADGE_CATALOG, sortPlayerBadges, type PlayerBadgeKey } from "@/lib/playerBadges";

const LETTER_ORDER = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D"] as const;

type SortKey =
  | "player_name"
  | "league"
  | "age"
  | "pass_grade"
  | "pass_volume_letter"
  | "pass_efficiency_letter"
  | "pass_buildup_letter"
  | "pass_chance_creation_letter"
  | "pv_abs_leth_letter";

type SortDir = "asc" | "desc";
type SortEntry = { key: SortKey; dir: SortDir };

type Props = {
  players: PlayerSummary[];
  positionFamily: string;
};

function letterRank(letter: string | null | undefined): number {
  if (!letter?.trim()) return 999;
  const normalized = letter.trim().replace("−", "-");
  const idx = LETTER_ORDER.indexOf(normalized as (typeof LETTER_ORDER)[number]);
  return idx === -1 ? 998 : idx;
}

function valueForKey(
  player: PlayerSummary,
  passGrade: number | null,
  key: SortKey,
): unknown {
  if (key === "pass_grade") return passGrade;
  if (key === "league") return formatLeagueName(player.league, player.league_source);
  return player[key as keyof PlayerSummary];
}

function compareValues(a: unknown, b: unknown, key: SortKey): number {
  if (key === "pass_grade") {
    const na = typeof a === "number" ? a : -Infinity;
    const nb = typeof b === "number" ? b : -Infinity;
    return na - nb;
  }
  if (
    key === "pass_volume_letter"
    || key === "pass_efficiency_letter"
    || key === "pass_buildup_letter"
    || key === "pass_chance_creation_letter"
    || key === "pv_abs_leth_letter"
  ) {
    return letterRank(String(a ?? "")) - letterRank(String(b ?? ""));
  }
  if (key === "age") {
    const na = typeof a === "number" ? a : -Infinity;
    const nb = typeof b === "number" ? b : -Infinity;
    return na - nb;
  }
  return String(a ?? "").localeCompare(String(b ?? ""), undefined, { sensitivity: "base" });
}

function defaultDirForKey(key: SortKey): SortDir {
  if (
    key === "pass_volume_letter"
    || key === "pass_efficiency_letter"
    || key === "pass_buildup_letter"
    || key === "pass_chance_creation_letter"
    || key === "pv_abs_leth_letter"
  ) {
    return "asc";
  }
  return key === "player_name" || key === "league" ? "asc" : "desc";
}

function PlayerBadgePills({ badges }: { badges?: PlayerBadgeKey[] }) {
  const { m } = useI18n();
  const ordered = sortPlayerBadges(badges ?? []);
  if (!ordered.length) return <span className="muted">—</span>;

  return (
    <div className="players-badge-pills">
      {ordered.map((key) => {
        const spec = PLAYER_BADGE_CATALOG[key];
        return (
          <span
            key={key}
            className="players-badge-pill"
            style={{
              borderColor: `${spec.accent}55`,
              background: `${spec.accent}18`,
              color: spec.accent,
            }}
            title={m.profileBadges[key].label}
          >
            {m.profileBadges[key].label}
          </span>
        );
      })}
    </div>
  );
}

export function PlayersTable({ players, positionFamily }: Props) {
  const { m } = useI18n();
  const [sortStack, setSortStack] = useState<SortEntry[]>([
    { key: "pass_grade", dir: "desc" },
  ]);

  const sorted = useMemo(() => {
    const rows = players.map((player) => ({
      player,
      pass_grade: overallPassGradeFromProfile(player),
    }));
    rows.sort((left, right) => {
      for (const entry of sortStack) {
        const av = valueForKey(left.player, left.pass_grade, entry.key);
        const bv = valueForKey(right.player, right.pass_grade, entry.key);
        const cmp = compareValues(av, bv, entry.key);
        if (cmp !== 0) return entry.dir === "asc" ? cmp : -cmp;
      }
      return 0;
    });
    return rows;
  }, [players, sortStack]);

  function toggleSort(key: SortKey) {
    setSortStack((prev) => {
      if (prev[0]?.key === key) {
        const flipped = prev[0].dir === "asc" ? "desc" : "asc";
        return [{ key, dir: flipped }, ...prev.slice(1)];
      }
      const without = prev.filter((entry) => entry.key !== key);
      return [{ key, dir: defaultDirForKey(key) }, ...without].slice(0, 4);
    });
  }

  function sortIndicator(key: SortKey) {
    const index = sortStack.findIndex((entry) => entry.key === key);
    if (index === -1) return null;
    const entry = sortStack[index];
    return (
      <span className="players-sort-indicator">
        <i className={`fa-solid fa-caret-${entry.dir === "asc" ? "up" : "down"} players-sort-icon`} aria-hidden="true" />
        {sortStack.length > 1 && index > 0 && (
          <span className="players-sort-priority tabular">{index + 1}</span>
        )}
      </span>
    );
  }

  return (
    <div className="table-wrap">
      <table className="players-table">
        <thead>
          <tr>
            <th>
              <button type="button" className="players-sort-btn" onClick={() => toggleSort("player_name")}>
                {m.common.player} {sortIndicator("player_name")}
              </button>
            </th>
            <th>
              <button type="button" className="players-sort-btn" onClick={() => toggleSort("league")}>
                {m.players.league} {sortIndicator("league")}
              </button>
            </th>
            <th>
              <button type="button" className="players-sort-btn" onClick={() => toggleSort("age")}>
                {m.common.age} {sortIndicator("age")}
              </button>
            </th>
            <th>
              <button type="button" className="players-sort-btn" onClick={() => toggleSort("pass_grade")}>
                {m.players.passGrade} {sortIndicator("pass_grade")}
              </button>
            </th>
            <th>{m.sections.badges}</th>
            <th>
              <button type="button" className="players-sort-btn" onClick={() => toggleSort("pass_volume_letter")}>
                {m.players.volume} {sortIndicator("pass_volume_letter")}
              </button>
            </th>
            <th>
              <button type="button" className="players-sort-btn" onClick={() => toggleSort("pass_efficiency_letter")}>
                {m.players.precision} {sortIndicator("pass_efficiency_letter")}
              </button>
            </th>
            <th>
              <button type="button" className="players-sort-btn" onClick={() => toggleSort("pass_buildup_letter")}>
                {m.players.buildup} {sortIndicator("pass_buildup_letter")}
              </button>
            </th>
            <th>
              <button type="button" className="players-sort-btn" onClick={() => toggleSort("pass_chance_creation_letter")}>
                {m.players.chanceCreation} {sortIndicator("pass_chance_creation_letter")}
              </button>
            </th>
            <th>
              <button type="button" className="players-sort-btn" onClick={() => toggleSort("pv_abs_leth_letter")}>
                {m.players.lethality} {sortIndicator("pv_abs_leth_letter")}
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(({ player, pass_grade }) => (
            <tr key={player.player_id}>
              <td>
                <Link href={`/profile?player=${player.player_id}&position_family=${positionFamily}`}>
                  {player.player_name}
                </Link>
              </td>
              <td>{formatLeagueName(player.league, player.league_source)}</td>
              <td className="tabular">{player.age ?? "—"}</td>
              <td>
                <span className="rating tabular">
                  {pass_grade != null ? pass_grade.toFixed(1) : "—"}
                </span>
              </td>
              <td><PlayerBadgePills badges={player.player_badges} /></td>
              <td><GradeBadge letter={player.pass_volume_letter} size="sm" /></td>
              <td><GradeBadge letter={player.pass_efficiency_letter} size="sm" /></td>
              <td><GradeBadge letter={player.pass_buildup_letter} size="sm" /></td>
              <td><GradeBadge letter={player.pass_chance_creation_letter} size="sm" /></td>
              <td><GradeBadge letter={player.pv_abs_leth_letter} size="sm" /></td>
            </tr>
          ))}
          {sorted.length === 0 && (
            <tr>
              <td colSpan={10} className="muted" style={{ textAlign: "center", padding: "2rem" }}>
                {m.common.noResults}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
