"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { LoadingState } from "@/components/LoadingState";
import {
  PlayerReportSheet,
  mapFilterLabel,
  type ReportMapSlot,
} from "@/components/PlayerReportSheet";
import { ReportsPlayerList, type ReportListRow } from "@/components/ReportsPlayerList";
import { REPORT_MAP_FILTER_KEYS } from "@/lib/reportMapKeys";
import { waitForReportMapImages, buildReportPdfFilename } from "@/lib/reportPrint";
import {
  getPassMap,
  getPlayerProfile,
  getPlayers,
  type PlayerProfile,
  type PlayerSummary,
} from "@/lib/api";
import { overallPassGradeFromProfile } from "@/lib/passGrades";
import {
  mergedReportPlayers,
  reportEntryForPlayer,
  totalReportCount,
} from "@/lib/playerReports";
import { useI18n } from "@/lib/i18n/context";
import type { Messages } from "@/lib/i18n/messages";

type PrintReportEntry = {
  entry: NonNullable<ReturnType<typeof reportEntryForPlayer>>;
  profile: PlayerProfile;
  mapSlots: ReportMapSlot[];
};

function reportRating(summary: PlayerSummary | null): number | null {
  if (!summary) return null;
  const overall = overallPassGradeFromProfile(summary);
  if (overall != null) return overall;
  const raw = summary.xp_pass_rating ?? summary.pass_rating;
  if (raw == null || Number.isNaN(raw)) return null;
  return Math.round(raw * 1000) / 100;
}

async function loadMapSlots(
  playerId: string,
  family: string,
  m: Messages,
  existing?: ReportMapSlot[] | null,
): Promise<ReportMapSlot[]> {
  const slots: ReportMapSlot[] = REPORT_MAP_FILTER_KEYS.map((key) => {
    const prev = existing?.find((s) => s.key === key);
    return prev?.pass_map_b64
      ? { ...prev }
      : { key, label: mapFilterLabel(m, key), loading: true };
  });

  for (const key of REPORT_MAP_FILTER_KEYS) {
    const idx = slots.findIndex((s) => s.key === key);
    if (slots[idx]?.pass_map_b64) continue;
    try {
      const res = await getPassMap(playerId, key, "all", family);
      slots[idx] = {
        key,
        label: mapFilterLabel(m, key),
        pass_map_b64: res.pass_map_b64,
        loading: false,
        error: null,
      };
    } catch (e) {
      slots[idx] = {
        key,
        label: mapFilterLabel(m, key),
        loading: false,
        error: e instanceof Error ? e.message : m.common.loadFailed,
      };
    }
  }
  return slots;
}

export function ReportsClient() {
  const { m } = useI18n();
  const [summaries, setSummaries] = useState<PlayerSummary[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [printing, setPrinting] = useState(false);
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [printEntries, setPrintEntries] = useState<PrintReportEntry[]>([]);
  const [printQueue, setPrintQueue] = useState<string[] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const rows = useMemo<ReportListRow[]>(() => {
    const byId = new Map(summaries.map((player) => [player.player_id, player]));
    return mergedReportPlayers().map((entry) => ({
      entry,
      summary: byId.get(entry.playerId) ?? null,
    }));
  }, [summaries]);

  const visibleRows = useMemo<ReportListRow[]>(() => {
    const query = searchQuery.trim().toLowerCase();
    let list = rows;
    if (query) {
      list = list.filter(({ entry, summary }) => {
        const name = summary?.player_name ?? entry.playerId;
        return name.toLowerCase().includes(query);
      });
    }
    return [...list].sort((a, b) => {
      const left = reportRating(a.summary) ?? -Infinity;
      const right = reportRating(b.summary) ?? -Infinity;
      if (right !== left) return right - left;
      const leftName = a.summary?.player_name ?? a.entry.playerId;
      const rightName = b.summary?.player_name ?? b.entry.playerId;
      return leftName.localeCompare(rightName);
    });
  }, [rows, searchQuery]);

  useEffect(() => {
    let cancelled = false;
    setListLoading(true);
    setListError(null);

    getPlayers({ position_family: "midfielders", limit: 200 })
      .then((res) => {
        if (!cancelled) setSummaries(res.players);
      })
      .catch((e) => {
        if (!cancelled) {
          setSummaries([]);
          setListError(e instanceof Error ? e.message : m.common.loadFailed);
        }
      })
      .finally(() => {
        if (!cancelled) setListLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [m.common.loadFailed]);

  useEffect(() => {
    if (!printQueue?.length || !printEntries.length) return;

    let cancelled = false;
    document.body.dataset.printMode = "dedicated";
    setPrinting(true);

    (async () => {
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      if (cancelled) return;
      const root = document.getElementById("report-print-root");
      const mapStatus = root
        ? await waitForReportMapImages(root, printQueue)
        : { ready: false, loaded: 0, expected: printQueue.length * REPORT_MAP_FILTER_KEYS.length };
      if (!mapStatus.ready) {
        console.warn(
          `Report PDF print: ${mapStatus.loaded}/${mapStatus.expected} map images ready before timeout.`,
        );
      }

      const printItem = printEntries[0];
      const playerRecord = printItem?.profile.player ?? {};
      const rawName = playerRecord.player_name;
      const playerName =
        typeof rawName === "string" && rawName.trim()
          ? rawName.trim()
          : printItem?.entry.playerId ?? "Player";
      const rating = printItem
        ? overallPassGradeFromProfile(
            printItem.profile.player as Parameters<typeof overallPassGradeFromProfile>[0],
          )
        : null;
      const previousTitle = document.title;
      document.title = buildReportPdfFilename(playerName, rating);

      const restore = () => {
        document.title = previousTitle;
        delete document.body.dataset.printMode;
        setPrinting(false);
        setPrintEntries([]);
        setPrintQueue(null);
        setExportingId(null);
        window.removeEventListener("afterprint", restore);
      };

      window.addEventListener("afterprint", restore);
      if (!cancelled) window.print();
    })();

    return () => {
      cancelled = true;
    };
  }, [printQueue, printEntries]);

  const handleExport = useCallback(
    async (playerId: string) => {
      const entry = reportEntryForPlayer(playerId);
      if (!entry) return;

      setExportingId(playerId);
      const family = entry.positionFamily ?? "midfielders";

      try {
        const profile = await getPlayerProfile(playerId, family);
        const mapSlots = await loadMapSlots(playerId, family, m);
        setPrintEntries([{ entry, profile, mapSlots }]);
        setPrintQueue([playerId]);
      } catch (e) {
        setExportingId(null);
        console.error(e);
      }
    },
    [m],
  );

  const busy = listLoading || printing || exportingId != null;

  return (
    <div className={`reports-page${printing ? " reports-printing" : ""}`}>
      <header className="reports-hero-card report-screen-only">
        <div className="reports-hero-main">
          <div className="reports-hero-copy">
            <p className="reports-hero-eyebrow">{m.reports.scoutingEyebrow}</p>
            <h1 className="reports-hero-title">{m.reports.heroTitle}</h1>
            <p className="reports-hero-subtitle">{m.reports.heroSubtitle}</p>
            <p className="reports-hero-lead">
              {m.reports.heroLead.replace("{count}", String(totalReportCount()))}
            </p>
          </div>
          <div className="reports-hero-stats">
            <div className="reports-hero-stat">
              <span className="reports-hero-stat-val tabular">{totalReportCount()}</span>
              <span className="reports-hero-stat-label">{m.common.athletes}</span>
            </div>
            <div className="reports-hero-stat">
              <span className="reports-hero-stat-val">PDF</span>
              <span className="reports-hero-stat-label">{m.common.exportable}</span>
            </div>
          </div>
        </div>
      </header>

      <section className="reports-list-toolbar report-screen-only">
        <p className="reports-list-toolbar-copy muted">{m.reports.listLead}</p>
        <div className="reports-list-toolbar-actions">
          <label className="reports-search-field">
            <span className="sr-only">{m.common.search}</span>
            <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
            <input
              type="search"
              className="reports-search-input"
              placeholder={m.reports.searchPlaceholder}
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </label>
        </div>
      </section>

      {listLoading && <LoadingState message={m.reports.loadingFirst} />}

      {listError && !listLoading && (
        <div className="error-box">{listError}</div>
      )}

      {!listLoading && !listError && (
        <ReportsPlayerList
          rows={visibleRows}
          exportingId={exportingId}
          exportDisabled={busy}
          onExport={handleExport}
        />
      )}

      <div id="report-print-root" className="report-print-root" aria-hidden={!printing}>
        {printEntries.map((item) => (
          <PlayerReportSheet
            key={`print-${item.entry.playerId}`}
            entry={item.entry}
            profile={item.profile}
            maps={
              item.mapSlots.find((s) => s.pass_map_b64)
                ? { pass_map_b64: item.mapSlots.find((s) => s.pass_map_b64)?.pass_map_b64 }
                : null
            }
            mapSlots={item.mapSlots}
            expandAll
            preloadMaps
            peerScope="pool"
          />
        ))}
      </div>
    </div>
  );
}
