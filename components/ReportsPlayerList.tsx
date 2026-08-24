"use client";

import Link from "next/link";
import type { PlayerSummary } from "@/lib/api";
import { GradeBadge } from "@/components/ui/GradeBadge";
import { formatLeagueName } from "@/lib/formatters";
import { overallPassGradeFromProfile } from "@/lib/passGrades";
import type { MergedReportPlayer } from "@/lib/playerReports";
import { useI18n } from "@/lib/i18n/context";
import type { Messages } from "@/lib/i18n/messages";

export type ReportListRow = {
  entry: MergedReportPlayer;
  summary: PlayerSummary | null;
};

type Props = {
  rows: ReportListRow[];
  exportingId: string | null;
  exportDisabled?: boolean;
  onExport: (playerId: string) => void;
};

function passRatingDisplay(summary: PlayerSummary | null): number | null {
  if (!summary) return null;
  const overall = overallPassGradeFromProfile(summary);
  if (overall != null) return overall;
  const raw = summary.xp_pass_rating ?? summary.pass_rating;
  if (raw == null || Number.isNaN(raw)) return null;
  return Math.round(raw * 100) / 10;
}

function categoryTitle(m: Messages, categoryId: string, fallback?: string): string {
  return m.profileCategories[categoryId]?.title ?? fallback ?? categoryId;
}

function translateGroupLabel(m: Messages, label: string): string {
  if (label === "Top 10") return m.groupLabels.top10;
  if (label === "Extended watchlist") return m.groupLabels.extendedWatchlist;
  return label;
}

function ratingLetters(summary: PlayerSummary | null) {
  if (!summary) return [];
  return [
    { key: "vol", letter: summary.pass_volume_letter },
    { key: "eff", letter: summary.pass_efficiency_letter },
    { key: "build", letter: summary.pass_buildup_letter },
    { key: "chance", letter: summary.pass_chance_creation_letter },
  ].filter((item) => item.letter);
}

export function ReportsPlayerList({
  rows,
  exportingId,
  exportDisabled = false,
  onExport,
}: Props) {
  const { m } = useI18n();

  if (!rows.length) {
    return <p className="placeholder-note">{m.reports.listEmpty}</p>;
  }

  return (
    <div className="reports-player-list" aria-label={m.reports.listAria}>
      <div className="reports-player-list-head" aria-hidden="true">
        <span>{m.reports.listColPlayer}</span>
        <span>{m.reports.listColMeta}</span>
        <span>{m.reports.listColRatings}</span>
        <span>{m.reports.listColCategory}</span>
        <span>{m.reports.listColAction}</span>
      </div>

      <ul className="reports-player-list-rows">
        {rows.map(({ entry, summary }, index) => {
          const playerId = entry.playerId;
          const name = summary?.player_name ?? playerId;
          const team = summary?.team ?? "—";
          const league = formatLeagueName(summary?.league, summary?.league_source);
          const age = summary?.age;
          const position = summary?.position ?? "—";
          const passRating = passRatingDisplay(summary);
          const letters = ratingLetters(summary);
          const isExporting = exportingId === playerId;
          const rankLabel = String(index + 1).padStart(2, "0");

          return (
            <li
              key={playerId}
              className="reports-player-list-row"
              style={{ "--row-accent": entry.category.accent } as React.CSSProperties}
            >
              <div className="reports-player-list-main">
                <div className="reports-player-list-identity">
                  <span className="reports-player-list-index tabular">
                    {rankLabel}
                  </span>
                  <div className="reports-player-list-copy">
                    <Link
                      href={`/profile?player=${playerId}&position_family=midfielders`}
                      className="reports-player-list-name"
                    >
                      {name}
                      {entry.note ? <span className="reports-player-list-note">{entry.note}</span> : null}
                    </Link>
                    <span className="reports-player-list-subline muted">
                      {team} · {position}
                    </span>
                  </div>
                </div>

                <div className="reports-player-list-meta">
                  <span>{league}</span>
                  {age != null ? (
                    <span className="tabular">{m.reports.ageYears.replace("{age}", String(age))}</span>
                  ) : null}
                </div>

                <div className="reports-player-list-ratings">
                  {passRating != null ? (
                    <span className="reports-player-list-score tabular">{passRating.toFixed(1)}</span>
                  ) : (
                    <span className="reports-player-list-score muted">—</span>
                  )}
                  <div className="reports-player-list-letters">
                    {letters.map((item) => (
                      <GradeBadge key={item.key} letter={item.letter} size="sm" />
                    ))}
                  </div>
                </div>

                <div className="reports-player-list-category">
                  <div className="reports-player-list-category-tags">
                    {entry.categoryIds.map((categoryId) => (
                      <span key={categoryId} className="reports-player-list-category-tag">
                        {categoryTitle(m, categoryId, entry.category.title)}
                      </span>
                    ))}
                  </div>
                  {entry.groups.length > 0 ? (
                    <div className="reports-player-list-group-tags">
                      {entry.groups.map((group) => (
                        <span
                          key={group.label}
                          className="reports-player-list-group-tag"
                          style={{ "--group-accent": group.accent } as React.CSSProperties}
                        >
                          {translateGroupLabel(m, group.label)}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="reports-player-list-action">
                  <button
                    type="button"
                    className="reports-player-list-export"
                    disabled={exportDisabled || isExporting}
                    onClick={() => onExport(playerId)}
                    title={`${m.reports.exportPdfTitle} ${name}`}
                  >
                    <i className={`fa-solid ${isExporting ? "fa-spinner fa-spin" : "fa-file-pdf"}`} />
                    <span>{isExporting ? m.reports.exportingPdf : m.common.exportPdf}</span>
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
