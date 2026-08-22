"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { LoadingState } from "@/components/LoadingState";
import { PeerScopeToggle } from "@/components/PeerScopeToggle";
import {
  PlayerReportSheet,
  mapFilterLabel,
  type PlayerReportMaps,
  type ReportMapSlot,
} from "@/components/PlayerReportSheet";
import { REPORT_MAP_FILTER_KEYS } from "@/lib/reportMapKeys";
import { waitForReportMapImages } from "@/lib/reportPrint";
import {
  getPassMap,
  getPlayerOptions,
  getPlayerProfile,
  type PeerScope,
  type PlayerOption,
  type PlayerProfile,
} from "@/lib/api";
import {
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
  const [options, setOptions] = useState<PlayerOption[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState("");
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [maps, setMaps] = useState<PlayerReportMaps | null>(null);
  const [mapSlots, setMapSlots] = useState<ReportMapSlot[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [peerScope, setPeerScope] = useState<PeerScope>("league");
  const [printing, setPrinting] = useState(false);
  const [printPreparing, setPrintPreparing] = useState(false);
  const [printEntries, setPrintEntries] = useState<PrintReportEntry[]>([]);
  const [printQueue, setPrintQueue] = useState<string[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    setOptionsLoading(true);
    getPlayerOptions({ position_family: "midfielders" })
      .then((res) => {
        if (cancelled) return;
        setOptions(res.options);
        if (res.options[0]?.player_id) {
          setSelectedId(res.options[0].player_id);
        }
      })
      .catch(() => {
        if (!cancelled) setOptions([]);
      })
      .finally(() => {
        if (!cancelled) setOptionsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedId) return;

    let cancelled = false;
    const entry = reportEntryForPlayer(selectedId);
    const family = entry?.positionFamily ?? "midfielders";

    setLoading(true);
    setLoadError(null);
    setProfile(null);
    setMaps(null);
    setMapSlots(null);

    (async () => {
      try {
        const loadedProfile = await getPlayerProfile(selectedId, family);
        if (cancelled) return;

        const slots = await loadMapSlots(selectedId, family, m);
        if (cancelled) return;

        const primary = slots.find((s) => s.pass_map_b64);
        setProfile(loadedProfile);
        setMapSlots(slots);
        setMaps(
          primary?.pass_map_b64 ? { pass_map_b64: primary.pass_map_b64 } : null,
        );
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : m.common.loadFailed);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedId, m]);

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

      const restore = () => {
        delete document.body.dataset.printMode;
        setPrinting(false);
        setPrintEntries([]);
        setPrintQueue(null);
        window.removeEventListener("afterprint", restore);
      };

      window.addEventListener("afterprint", restore);
      if (!cancelled) window.print();
    })();

    return () => {
      cancelled = true;
    };
  }, [printQueue, printEntries]);

  const entry = useMemo(
    () => (selectedId ? reportEntryForPlayer(selectedId) : null),
    [selectedId],
  );

  const handlePrint = useCallback(async () => {
    if (!entry || !profile) return;

    setPrintPreparing(true);
    const family = entry.positionFamily ?? "midfielders";
    const slots = await loadMapSlots(entry.playerId, family, m, mapSlots);
    setMapSlots(slots);
    const primary = slots.find((s) => s.pass_map_b64);
    setMaps(primary?.pass_map_b64 ? { pass_map_b64: primary.pass_map_b64 } : maps);

    setPrintEntries([
      {
        entry,
        profile,
        mapSlots: slots,
      },
    ]);
    setPrintPreparing(false);
    setPrintQueue([entry.playerId]);
  }, [entry, profile, mapSlots, maps, m]);

  const busy = optionsLoading || loading || printPreparing;
  const selectedLabel = options.find((o) => o.player_id === selectedId)?.label;

  return (
    <div className={`reports-page${printing ? " reports-printing" : ""}`}>
      <header className="reports-hero-card report-screen-only">
        <div className="reports-hero-main">
          <div className="reports-hero-copy">
            <p className="reports-hero-eyebrow">{m.reports.scoutingEyebrow}</p>
            <h1 className="reports-hero-title">{m.reports.heroTitle}</h1>
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

      <section className="reports-player-select-panel report-screen-only">
        <div className="reports-player-select-field">
          <label className="filter-label" htmlFor="report-player-select">
            {m.reports.selectPlayerLabel}
          </label>
          <select
            id="report-player-select"
            className="player-select"
            value={selectedId}
            disabled={optionsLoading || !options.length}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            {optionsLoading && (
              <option value="">{m.reports.loadingPlayer}</option>
            )}
            {!optionsLoading && !options.length && (
              <option value="">{m.reports.selectPlayerPlaceholder}</option>
            )}
            {options.map((o) => (
              <option key={o.player_id} value={o.player_id}>
                {o.label}
              </option>
            ))}
          </select>
          <p className="reports-hint muted">{m.reports.selectPlayerHint}</p>
        </div>

        <div className="reports-player-select-actions">
          <PeerScopeToggle scope={peerScope} onChange={setPeerScope} />
          <button
            type="button"
            className="btn btn-primary"
            onClick={handlePrint}
            disabled={busy || !profile || !entry}
          >
            <i className="fa-solid fa-file-pdf" />
            {printPreparing ? m.reports.preparingMaps : m.common.exportGroup}
          </button>
        </div>
      </section>

      {optionsLoading && (
        <LoadingState message={m.reports.loadingFirst} />
      )}

      {!optionsLoading && loading && (
        <LoadingState
          message={
            selectedLabel
              ? m.reports.loadingPlayer
              : m.reports.loadingPlayerId.replace("{id}", selectedId)
          }
        />
      )}

      {loadError && !loading && (
        <div className="player-report-bundle report-error-bundle">
          <div className="player-report-sheet report-error-sheet">
            <p className="error-box">
              {m.reports.loadPlayerFailedPrefix} {selectedId}: {loadError}
            </p>
          </div>
        </div>
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
            peerScope={peerScope}
          />
        ))}
      </div>

      {!loading && profile && entry && (
        <div className="reports-stack reports-screen-stack">
          <PlayerReportSheet
            entry={entry}
            profile={profile}
            maps={maps}
            mapSlots={mapSlots}
            expandAll={printing}
            preloadMaps
            peerScope={peerScope}
            exportDisabled={busy}
            onExportPdf={() => handlePrint()}
            onMapsLoaded={(nextMaps, slots) => {
              setMaps(nextMaps);
              setMapSlots(slots);
            }}
          />
        </div>
      )}
    </div>
  );
}
