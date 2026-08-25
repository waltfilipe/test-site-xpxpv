"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PassGradePanel } from "@/components/PassGradePanel";
import { PassLengthMix } from "@/components/PassLengthMix";
import { ProfileBadgesCard } from "@/components/ProfileBadgesCard";
import { ReportMapCaption } from "@/components/ReportMapCaption";
import { ReportPassScoreAccordion } from "@/components/ReportPassScoreAccordion";
import { ReportRoundCard } from "@/components/ReportRoundCard";
import { RoundGradeChart } from "@/components/RoundGradeChart";
import { XpIndicesPanel } from "@/components/XpIndicesPanel";
import { XpProfilePanel } from "@/components/XpProfilePanel";
import { LoadingState } from "@/components/LoadingState";
import { getPassMap, type PeerScope, type PlayerProfile } from "@/lib/api";
import type { EnrichedReportPlayer } from "@/lib/playerReports";
import {
  formatContractUntil,
  formatDominantFoot,
  formatLeagueName,
  formatPlayerHeight,
} from "@/lib/formatters";
import { overallPassGradeFromProfile } from "@/lib/passGrades";
import { selectProfileView } from "@/lib/profileView";
import { REPORT_MAP_FILTER_KEYS, type ReportMapFilterKey } from "@/lib/reportMapKeys";
import { useI18n } from "@/lib/i18n/context";
import type { Messages } from "@/lib/i18n/messages";

export type PlayerReportMaps = {
  pass_map_b64?: string | null;
  dest_map_b64?: string | null;
  caption?: string;
};

export type ReportMapSlot = {
  key: string;
  label: string;
  pass_map_b64?: string | null;
  loading?: boolean;
  error?: string | null;
};

export function mapFilterLabel(m: Messages, key: string): string {
  return m.mapFilters[key as keyof Messages["mapFilters"]] ?? key;
}

function translateGroupLabel(m: Messages, label?: string): string | undefined {
  if (!label) return undefined;
  if (label === "Top 10") return m.groupLabels.top10;
  if (label === "Extended watchlist") return m.groupLabels.extendedWatchlist;
  return label;
}

function FactIcon({ icon }: { icon: string }) {
  return (
    <span className="identity-fact-icon" aria-hidden="true">
      <i className={`fa-solid ${icon}`} />
    </span>
  );
}

function minutesPillStyle(pct: number | null | undefined): React.CSSProperties | undefined {
  if (pct == null || Number.isNaN(pct)) return undefined;
  const clamped = Math.max(0, Math.min(1, pct));
  const hue = clamped * 120;
  const color = `hsla(${hue}, 42%, 40%, 0.72)`;
  return {
    "--minutes-ring": color,
  } as React.CSSProperties;
}

type Props = {
  entry: EnrichedReportPlayer;
  profile: PlayerProfile;
  maps: PlayerReportMaps | null;
  mapSlots?: ReportMapSlot[] | null;
  expandAll?: boolean;
  preloadMaps?: boolean;
  peerScope?: PeerScope;
  onMapsLoaded?: (maps: PlayerReportMaps, slots: ReportMapSlot[]) => void;
  onExportPdf?: (playerId: string) => void;
  exportDisabled?: boolean;
};

export function PlayerReportSheet({
  entry,
  profile,
  maps: initialMaps,
  mapSlots: externalSlots,
  expandAll = false,
  preloadMaps = false,
  peerScope = "league",
  onMapsLoaded,
  onExportPdf,
  exportDisabled = false,
}: Props) {
  const { m } = useI18n();
  const [activePage, setActivePage] = useState<1 | 2>(1);
  const [localSlots, setLocalSlots] = useState<ReportMapSlot[]>(
    REPORT_MAP_FILTER_KEYS.map((key) => ({ key, label: mapFilterLabel(m, key) })),
  );
  const [mapsLoading, setMapsLoading] = useState(false);
  const [mapsError, setMapsError] = useState<string | null>(null);

  const mapSlots = externalSlots ?? localSlots;
  const setMapSlots = externalSlots ? () => {} : setLocalSlots;

  const p = profile.player;
  const activeView = selectProfileView(profile, "absolute", peerScope);
  const passScores = activeView.pass_scores;
  const overallPassGrade = overallPassGradeFromProfile(profile);
  const category = entry.category;
  const categoryMeta = m.profileCategories[category.id];
  const categoryTitle = categoryMeta?.title ?? category.title;
  const categorySubtitle = categoryMeta?.subtitle ?? category.subtitle;
  const categoryDescription = categoryMeta?.description ?? category.description;
  const displayName = String(p.player_name ?? "—");
  const leagueLabel = formatLeagueName(
    p.league != null ? String(p.league) : null,
    p.league_source != null ? String(p.league_source) : null,
  );
  const playerId = entry.playerId;
  const accent = category.accent;
  const minutesPct = p.minutes_pct != null ? Number(p.minutes_pct) : null;
  const categoryIndex = entry.categoryIndex;
  const shouldLoadMaps = activePage === 2 || preloadMaps;

  useEffect(() => {
    if (!shouldLoadMaps) return;
    if (mapSlots.length > 0 && mapSlots.every((s) => s.pass_map_b64 || s.error)) return;
    if (externalSlots?.every((s) => s.pass_map_b64 || s.error)) return;

    let cancelled = false;
    setMapsLoading(true);
    setMapsError(null);
    setMapSlots(REPORT_MAP_FILTER_KEYS.map((key) => {
      const existing = mapSlots.find((s) => s.key === key);
      return existing?.pass_map_b64
        ? { ...existing, loading: false }
        : { key, label: mapFilterLabel(m, key), loading: true };
    }));

    (async () => {
      const family = entry.positionFamily ?? "midfielders";
      let firstLoaded: PlayerReportMaps | null = initialMaps;
      const nextSlots: ReportMapSlot[] = [...mapSlots];

      for (const key of REPORT_MAP_FILTER_KEYS) {
        if (cancelled) return;
        const existing = nextSlots.find((s) => s.key === key);
        if (existing?.pass_map_b64) continue;

        try {
          const res = await getPassMap(playerId, key, "all", family);
          if (cancelled) return;

          const idx = nextSlots.findIndex((s) => s.key === key);
          const slot: ReportMapSlot = {
            key,
            label: mapFilterLabel(m, key),
            pass_map_b64: res.pass_map_b64,
            loading: false,
            error: null,
          };
          if (idx >= 0) nextSlots[idx] = slot;
          else nextSlots.push(slot);

          const loaded = {
            pass_map_b64: res.pass_map_b64,
            dest_map_b64: res.dest_map_b64,
            caption: res.caption,
          };
          if (!firstLoaded?.pass_map_b64 && loaded.pass_map_b64) {
            firstLoaded = loaded;
          }

          setMapSlots([...nextSlots]);
        } catch (e) {
          if (cancelled) return;
          const msg = e instanceof Error ? e.message : m.common.loadFailed;
          const idx = nextSlots.findIndex((s) => s.key === key);
          if (idx >= 0) nextSlots[idx] = { ...nextSlots[idx], loading: false, error: msg };
          setMapSlots([...nextSlots]);
        }
      }

      if (!cancelled) {
        setMapsLoading(false);
        const primary = nextSlots.find((s) => s.pass_map_b64);
        if (primary?.pass_map_b64) {
          onMapsLoaded?.(
            { pass_map_b64: primary.pass_map_b64 },
            nextSlots,
          );
        }
      }
    })().catch((e) => {
      if (!cancelled) {
        setMapsError(e instanceof Error ? e.message : m.reports.loadingMaps);
        setMapsLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldLoadMaps, playerId, entry.positionFamily]);

  const renderIdentity = (compact = false) => (
    <div className={`player-card identity-card report-identity-card${compact ? " report-identity-compact" : ""}`}>
      <div className={`identity-hero identity-hero-side${compact ? " identity-hero-compact" : ""}`}>
        <div className="identity-photo-side">
          {p.photo_url ? (
            <Image
              src={String(p.photo_url)}
              alt=""
              fill
              className="identity-photo"
              unoptimized
              priority={categoryIndex <= 3}
              sizes={compact ? "72px" : "160px"}
            />
          ) : (
            <div className="identity-photo-placeholder identity-photo-placeholder-side">
              {displayName.charAt(0)}
            </div>
          )}
        </div>

        <div className="identity-hero-text">
          <h3 className="identity-title report-player-name">{displayName}</h3>
          <p className="identity-subline">
            {String(p.team ?? "—")} · {String(p.position ?? "—")}
          </p>
          <ProfileBadgesCard badges={profile.player_badges} compact />
          {!compact && (
            <p className="report-league-line muted">
              {leagueLabel}
            </p>
          )}

          {!compact && (
            <div className="identity-facts identity-facts-side">
              <div className="identity-fact">
                <FactIcon icon="fa-cake-candles" />
                <span className="identity-fact-label">{m.common.age}</span>
                <span className="identity-fact-value tabular">
                  {p.age != null ? String(p.age) : "—"}
                </span>
              </div>
              <div className="identity-fact">
                <FactIcon icon="fa-ruler-vertical" />
                <span className="identity-fact-label">{m.common.height}</span>
                <span className="identity-fact-value">
                  {formatPlayerHeight(p.height) ?? "—"}
                </span>
              </div>
              <div className="identity-fact">
                <FactIcon icon="fa-earth-americas" />
                <span className="identity-fact-label">{m.common.nationality}</span>
                <span className="identity-fact-value">{String(p.nationality ?? "—")}</span>
              </div>
              <div className="identity-fact">
                <FactIcon icon="fa-shoe-prints" />
                <span className="identity-fact-label">{m.common.foot}</span>
                <span className="identity-fact-value">
                  {formatDominantFoot(p.dominant_foot) ?? "—"}
                </span>
              </div>
            </div>
          )}

          {compact && (
            <div className="identity-facts identity-facts-compact">
              <span className="identity-fact-inline tabular">
                {p.age != null ? m.reports.ageYears.replace("{age}", String(p.age)) : "—"}
              </span>
              <span className="identity-fact-inline">{leagueLabel}</span>
            </div>
          )}
        </div>
      </div>

      <div className={`identity-meta-row${compact ? " identity-meta-row-compact" : ""}`}>
        {!compact && (
          <>
            <div className="identity-meta-pill">
              <span><FactIcon icon="fa-coins" /> {m.common.value}</span>
              <strong>{String(p.market_value ?? "—")}</strong>
            </div>
            <div className="identity-meta-pill">
              <span><FactIcon icon="fa-calendar-days" /> {m.common.contract}</span>
              <strong>{formatContractUntil(p.contract_until)}</strong>
            </div>
          </>
        )}
        <div
          className="identity-meta-pill identity-meta-pill-minutes"
          style={minutesPillStyle(minutesPct)}
          title={
            minutesPct != null
              ? `${(minutesPct * 100).toFixed(0)}${m.common.minutesPct}`
              : undefined
          }
        >
          <span><FactIcon icon="fa-clock" /> {m.common.minutes}</span>
          <strong className="tabular">{p.minutes != null ? String(p.minutes) : "—"}</strong>
        </div>
      </div>

      {!compact && profile.origin_heatmap_b64 && (
        <img
          src={`data:image/png;base64,${profile.origin_heatmap_b64}`}
          alt={m.profile.passOriginAlt}
          className="heatmap-img report-heatmap"
        />
      )}

      <div className="report-card-actions report-screen-only">
        {activePage === 1 ? (
          <button
            type="button"
            className="report-card-maps-btn"
            style={{ borderColor: `${accent}44`, color: accent }}
            onClick={() => setActivePage(2)}
          >
            <i className="fa-solid fa-map-location-dot" />
            <span>{m.reports.viewMaps}</span>
            <i className="fa-solid fa-arrow-right report-card-maps-arrow" />
          </button>
        ) : (
          <button
            type="button"
            className="report-card-maps-btn report-card-maps-btn-back"
            onClick={() => setActivePage(1)}
          >
            <i className="fa-solid fa-arrow-left" />
            <span>{m.reports.backToProfile}</span>
          </button>
        )}
      </div>
    </div>
  );

  const renderMapsStrip = () => (
    <div className="report-maps-player-strip report-screen-only">
      <div className="report-maps-strip-photo">
        {p.photo_url ? (
          <Image
            src={String(p.photo_url)}
            alt=""
            width={48}
            height={48}
            className="report-maps-strip-img"
            unoptimized
          />
        ) : (
          <div className="report-maps-strip-placeholder">{displayName.charAt(0)}</div>
        )}
      </div>
      <div className="report-maps-strip-main">
        <strong className="report-maps-strip-name">{displayName}</strong>
        <span className="report-maps-strip-meta">
          {String(p.team ?? "—")} · {String(p.position ?? "—")}
          {p.age != null ? ` · ${m.reports.ageYears.replace("{age}", String(p.age))}` : ""}
        </span>
        <span className="report-maps-strip-league muted">
          {leagueLabel}
        </span>
      </div>
      <div
        className="identity-meta-pill identity-meta-pill-minutes report-maps-strip-minutes"
        style={minutesPillStyle(minutesPct)}
      >
        <span><FactIcon icon="fa-clock" /> {m.reports.minutesShort}</span>
        <strong className="tabular">{p.minutes != null ? String(p.minutes) : "—"}</strong>
      </div>
    </div>
  );
  const loadedMaps = mapSlots.filter((s) => s.pass_map_b64);
  const anyLoading = mapSlots.some((s) => s.loading);
  const roundGrades = profile.xp_round_grades ?? [];
  const gradedRounds = roundGrades.filter((point) => point.grade != null);
  const showPerformancePage = expandAll && gradedRounds.length >= 2;

  return (
    <div
      className="player-report-bundle"
      data-category={category.id}
      data-player-id={playerId}
      id={`report-${playerId}`}
    >
      <section
        className={`player-report-sheet report-page-1${activePage === 2 && !expandAll ? " report-page-screen-hidden" : ""}`}
      >
        <div className="report-page-1-inner">
          <header className="report-sheet-header">
            <div className="report-sheet-brand">
              <span className="brand-icon report-brand-icon">
                <i className="fa-solid fa-futbol" />
              </span>
              <div>
                <span className="report-sheet-eyebrow">{m.reports.midfielderReportEyebrow}</span>
                <h2 className="report-sheet-category" style={{ color: accent }}>
                  {categoryTitle}
                </h2>
              </div>
            </div>
            <div className="report-sheet-meta">
              {entry.groupLabel && (
                <span className="report-sheet-group">{translateGroupLabel(m, entry.groupLabel)}</span>
              )}
              <span className="report-sheet-page-label report-print-only">{m.reports.overview}</span>
              <div className="report-sheet-meta-row">
                <span className="report-sheet-index tabular">
                  {String(categoryIndex).padStart(2, "0")}
                </span>
                {onExportPdf && (
                  <button
                    type="button"
                    className="report-export-one-btn report-screen-only"
                    onClick={() => onExportPdf(playerId)}
                    disabled={exportDisabled}
                    title={`${m.reports.exportPdfTitle} ${displayName}`}
                  >
                    <i className="fa-solid fa-file-pdf" />
                  </button>
                )}
              </div>
            </div>
          </header>

          <p className="report-sheet-description">{categoryDescription}</p>

          <div className="report-sheet-body pa-layout report-layout-v2">
            <div className="pa-col pa-col-identity">{renderIdentity(false)}</div>

            <div className="pa-col pa-col-score">
              <div className="score-stack">
                <div className="player-card profile-grade-card">
                  <PassGradePanel score={overallPassGrade} embedded />
                </div>
                <XpProfilePanel xp={profile.xp ?? {}} peerScope={peerScope} />
                <div className="player-card profile-indices-mix-card">
                  <XpIndicesPanel
                    indices={profile.xp_indices ?? []}
                    roundGrades={profile.xp_round_grades ?? []}
                    accent={accent}
                    expandAll={expandAll}
                  />
                  <PassLengthMix data={profile} />
                </div>
              </div>
            </div>

            <div className="pa-col pa-col-pillars">
              <div className="player-card pillars-card report-pillars-card">
                <h3 className="section-label">{m.sections.passScores}</h3>
                <ReportPassScoreAccordion sections={passScores} expandAll={expandAll} />
              </div>
            </div>
          </div>
        </div>

        <footer className="report-sheet-footer">
          <span>
            <strong>Pass Scout</strong> · {displayName}
          </span>
          <span className="report-sheet-footer-right">
            <Link
              href={`/profile?player=${playerId}&position_family=midfielders`}
              className="report-screen-only"
            >
              {m.common.fullProfile}
            </Link>
            <span className="report-print-only tabular">
              {displayName} · {categorySubtitle}
            </span>
          </span>
        </footer>
      </section>

      <section
        className={`player-report-sheet report-page-2${activePage === 1 && !expandAll && !preloadMaps ? " report-page-screen-hidden" : ""}`}
      >
        <header className="report-sheet-header report-sheet-header-compact">
          <div className="report-sheet-brand">
            <span className="brand-icon report-brand-icon">
              <i className="fa-solid fa-map-location-dot" />
            </span>
            <div>
              <span className="report-sheet-eyebrow">{m.reports.passMapsEyebrow}</span>
              <h2 className="report-sheet-category" style={{ color: accent }}>
                {displayName}
              </h2>
            </div>
          </div>
          <div className="report-sheet-meta report-maps-header-meta">
            <button
              type="button"
              className="report-maps-back-btn report-screen-only"
              onClick={() => setActivePage(1)}
            >
              <i className="fa-solid fa-arrow-left" />
              {m.reports.backToProfile}
            </button>
            <span className="report-sheet-page-label report-print-only">{m.reports.mapsPageLabel}</span>
            <span className="report-sheet-index tabular">
              {String(categoryIndex).padStart(2, "0")}
            </span>
          </div>
        </header>

        <div className="report-maps-page">
          {renderMapsStrip()}

          <div className="report-maps-body">
            {mapsLoading && loadedMaps.length === 0 && (
              <LoadingState message={m.reports.generatingMaps} />
            )}
            {mapsError && <p className="error-box">{mapsError}</p>}

            <div className="report-maps-grid report-maps-grid-3">
              {mapSlots.map((slot) => (
                <div key={slot.key} className="report-map-card">
                  <h4 className="section-label-sm">{slot.label}</h4>
                  {slot.loading && !slot.pass_map_b64 && (
                    <div className="report-map-skeleton" aria-busy="true">
                      <span className="report-map-skeleton-pulse" />
                    </div>
                  )}
                  {slot.error && !slot.pass_map_b64 && (
                    <p className="placeholder-note report-map-error">{slot.error}</p>
                  )}
                  {slot.pass_map_b64 && (
                    <div className="report-map-viewport">
                      <img
                        src={`data:image/png;base64,${slot.pass_map_b64}`}
                        alt={slot.label}
                        className="report-map-img"
                      />
                    </div>
                  )}
                  <ReportMapCaption mapKey={slot.key as ReportMapFilterKey} profile={profile} />
                  {!slot.loading && !slot.error && !slot.pass_map_b64 && shouldLoadMaps && (
                    <p className="placeholder-note">{m.common.unavailable}</p>
                  )}
                </div>
              ))}
            </div>

            {anyLoading && loadedMaps.length > 0 && (
              <p className="muted report-maps-loading-hint report-screen-only">
                {m.reports.loadingMaps} ({loadedMaps.length}/{REPORT_MAP_FILTER_KEYS.length})
              </p>
            )}
          </div>
        </div>

        <footer className="report-sheet-footer">
          <span>
            <strong>Pass Scout</strong> · {m.reports.mapsPageLabel} · {displayName}
          </span>
          <span className="report-sheet-footer-right report-print-only tabular">
            {displayName}
          </span>
        </footer>
      </section>

      {showPerformancePage && (
        <section
          className={[
            "player-report-sheet",
            "report-page-3",
            gradedRounds.length > 30 ? "report-performance-compact" : "",
          ].filter(Boolean).join(" ")}
        >
          <header className="report-sheet-header report-sheet-header-compact">
            <div className="report-sheet-brand">
              <span className="brand-icon report-brand-icon">
                <i className="fa-solid fa-chart-line" />
              </span>
              <div>
                <span className="report-sheet-eyebrow">{m.reports.performanceEyebrow}</span>
                <h2 className="report-sheet-category" style={{ color: accent }}>
                  {displayName}
                </h2>
              </div>
            </div>
            <div className="report-sheet-meta report-maps-header-meta">
              <span className="report-sheet-page-label report-print-only">
                {m.reports.performancePageLabel}
              </span>
              <span className="report-sheet-index tabular">
                {String(categoryIndex).padStart(2, "0")}
              </span>
            </div>
          </header>

          <div className="report-performance-page">
            <RoundGradeChart points={roundGrades} accent={accent} printPage />
            <div className="report-round-cards-grid">
              {gradedRounds.map((point) => (
                <ReportRoundCard key={point.round} point={point} accent={accent} />
              ))}
            </div>
          </div>

          <footer className="report-sheet-footer">
            <span>
              <strong>Pass Scout</strong> · {m.reports.performancePageLabel} · {displayName}
            </span>
            <span className="report-sheet-footer-right report-print-only tabular">
              {displayName}
            </span>
          </footer>
        </section>
      )}
    </div>
  );
}
