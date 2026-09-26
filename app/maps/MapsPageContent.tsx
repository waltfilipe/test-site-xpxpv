"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { LoadingState } from "@/components/LoadingState";
import { PageHero } from "@/components/PageHero";
import { PitchCorridorGuides } from "@/components/PitchCorridorGuides";
import { PitchCorridorHotspots } from "@/components/PitchCorridorHotspots";
import { Tooltip } from "@/components/ui/Tooltip";
import {
  getAggregatedMaps,
  type AggregatedMaps,
  type AttThirdCorridorCount,
  type CellStat,
  type PitchCorridor,
  type QuadrantBox,
} from "@/lib/api";
import { useI18n } from "@/lib/i18n/context";

function fillTemplate(template: string, values: Record<string, string>) {
  return template.replace(/\{(\w+)\}/g, (match, key) => values[key] ?? match);
}

type CellOverlayProps = {
  cells: CellStat[];
  boxes: Record<string, QuadrantBox>;
  tooltipFor: (cell: CellStat) => ReactNode;
  labelFor: (cell: CellStat) => string;
  selected?: string[];
  onToggle?: (key: string) => void;
};

function CellOverlay({ cells, boxes, tooltipFor, labelFor, selected, onToggle }: CellOverlayProps) {
  return (
    <div className="cell-overlay">
      {cells.map((cell) => {
        const box = boxes[cell.key];
        if (!box) return null;
        const isSelected = selected?.includes(cell.key) ?? false;
        const interactive = Boolean(onToggle);
        return (
          <div
            key={cell.key}
            className={`cell-hotspot${isSelected ? " is-selected" : ""}${interactive ? " is-clickable" : ""}`}
            style={{
              left: `${box.left_pct}%`,
              top: `${box.top_pct}%`,
              width: `${box.width_pct}%`,
              height: `${box.height_pct}%`,
            }}
          >
            <Tooltip content={tooltipFor(cell)} block>
              {interactive ? (
                <button
                  type="button"
                  className="cell-hitbox"
                  aria-pressed={isSelected}
                  aria-label={labelFor(cell)}
                  onClick={() => onToggle?.(cell.key)}
                />
              ) : (
                <span className="cell-hitbox" aria-label={labelFor(cell)} role="img" />
              )}
            </Tooltip>
          </div>
        );
      })}
    </div>
  );
}

export function MapsPageContent() {
  const { m, locale } = useI18n();
  const positionFamily = "midfielders";
  const [aggregated, setAggregated] = useState<AggregatedMaps | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [selectedCorridor, setSelectedCorridor] = useState<PitchCorridor | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getAggregatedMaps(positionFamily)
      .then(setAggregated)
      .catch(() => setError(m.maps.backendUnavailable))
      .finally(() => setLoading(false));
  }, [positionFamily, m.maps.backendUnavailable]);

  const numberFormat = useMemo(
    () => new Intl.NumberFormat(locale === "pt" ? "pt-BR" : "en-US"),
    [locale],
  );

  const cells = useMemo(() => aggregated?.cell_stats ?? [], [aggregated]);
  const corridorGuides = aggregated?.attacking_corridor_guides ?? [];
  const attThirdCorridorDest: Partial<Record<PitchCorridor, AttThirdCorridorCount>> =
    aggregated?.halfspace_summary?.att_third_corridor_dest_counts ?? {};
  const attThirdDestTotal = aggregated?.halfspace_summary?.att_third_dest_total ?? 0;
  const CORRIDOR_ORDER: PitchCorridor[] = ["lat_l", "hs_l", "cen", "hs_r", "lat_r"];

  const attThirdCorridorOrigin = useMemo((): Partial<Record<PitchCorridor, AttThirdCorridorCount>> => {
    const flows = aggregated?.att_third_corridor_origin_flows;
    if (!flows) return {};
    let total = 0;
    for (const key of CORRIDOR_ORDER) {
      total += flows[key]?.origin_passes ?? 0;
    }
    total = Math.max(total, 1);
    const out: Partial<Record<PitchCorridor, AttThirdCorridorCount>> = {};
    for (const key of CORRIDOR_ORDER) {
      const passes = flows[key]?.origin_passes ?? 0;
      out[key] = {
        passes,
        share_pct: Math.round((passes / total) * 10000) / 100,
      };
    }
    return out;
  }, [aggregated?.att_third_corridor_origin_flows]);

  const activeOriginFlow = useMemo(() => {
    if (!aggregated?.att_third_corridor_origin_flows || !selectedCorridor) return null;
    return aggregated.att_third_corridor_origin_flows[selectedCorridor] ?? null;
  }, [aggregated, selectedCorridor]);

  const cellsByKey = useMemo(() => {
    const map = new Map<string, CellStat>();
    for (const cell of cells) map.set(cell.key, cell);
    return map;
  }, [cells]);

  const cellLabel = (cell: CellStat) =>
    fillTemplate(m.maps.cellLabel, {
      x: m.maps.zonesX[cell.x_zone],
      y: m.maps.zonesY[cell.y_zone],
    });

  const cellRef = (cell: CellStat) =>
    fillTemplate(m.maps.cellRef, {
      col: String(cell.col + 1),
      row: String(cell.row + 1),
    });

  const corridorLabel = (corridor?: PitchCorridor) =>
    corridor ? m.maps.halfspace.corridors[corridor] : "—";

  const halfspaceSummaryLine = useMemo(() => {
    const summary = aggregated?.halfspace_summary;
    if (!summary) return null;
    const other = summary.origin_total - summary.offensive_halfspace_origins;
    const otherPct = (100 - summary.offensive_halfspace_origin_share_pct).toFixed(2);
    return fillTemplate(m.maps.halfspace.summaryLine, {
      ohs: numberFormat.format(summary.offensive_halfspace_origins),
      ohsPct: summary.offensive_halfspace_origin_share_pct.toFixed(2),
      other: numberFormat.format(other),
      otherPct,
    });
  }, [aggregated, m.maps.halfspace.summaryLine, numberFormat]);

  const toggleCell = (key: string) => {
    setSelected((current) => {
      if (current.includes(key)) return current.filter((item) => item !== key);
      return [...current, key].slice(-2);
    });
  };

  const difficultyBand = (meanXp: number) => {
    const scale = aggregated?.xp_scale_max || 1;
    const ratio = meanXp / scale;
    if (ratio < 0.25) return m.maps.tooltip.xpDifficultyLow;
    if (ratio < 0.5) return m.maps.tooltip.xpDifficultyMid;
    return m.maps.tooltip.xpDifficultyHigh;
  };

  const comparison = useMemo(() => {
    if (selected.length < 2) return null;
    const first = cellsByKey.get(selected[0]);
    const second = cellsByKey.get(selected[1]);
    if (!first || !second) return null;

    const [high, low] = first.passes >= second.passes ? [first, second] : [second, first];
    const diff = high.passes - low.passes;

    return {
      first,
      second,
      high,
      low,
      diff,
      gainPct: low.passes ? (diff / low.passes) * 100 : 0,
      dropPct: high.passes ? (diff / high.passes) * 100 : 0,
      equal: diff === 0,
    };
  }, [selected, cellsByKey]);

  const commonTooltip = (cell: CellStat): ReactNode => {
    const isSelected = selected.includes(cell.key);
    return (
      <div className="cell-tip">
        <p className="cell-tip-title">{cellLabel(cell)}</p>
        <p className="cell-tip-ref">{cellRef(cell)}</p>
        <p className="cell-tip-row">
          <span>{m.maps.tooltip.passesLabel}</span>
          <strong>{numberFormat.format(cell.passes)}</strong>
        </p>
        <p className="cell-tip-row">
          <span>{m.maps.tooltip.shareLabel}</span>
          <strong>{cell.share_pct.toFixed(2)}%</strong>
        </p>
        <p className="cell-tip-note">
          {isSelected
            ? selected.length < 2
              ? m.maps.tooltip.comparePending
              : m.maps.tooltip.compareSelected
            : m.maps.tooltip.compareHint}
        </p>
      </div>
    );
  };

  const attThirdDestSummaryLine = useMemo(() => {
    if (!attThirdDestTotal) return null;
    return fillTemplate(m.maps.halfspace.attThirdDestSummaryLine, {
      total: numberFormat.format(attThirdDestTotal),
    });
  }, [attThirdDestTotal, m.maps.halfspace.attThirdDestSummaryLine, numberFormat]);

  const corridorDestTooltip = (corridor: PitchCorridor): ReactNode => {
    const stat = attThirdCorridorDest[corridor];
    return (
      <div className="cell-tip">
        <p className="cell-tip-title">{corridorLabel(corridor)}</p>
        <p className="cell-tip-row">
          <span>{m.maps.halfspace.corridorDestPassesLabel}</span>
          <strong>{numberFormat.format(stat?.passes ?? 0)}</strong>
        </p>
        <p className="cell-tip-row">
          <span>{m.maps.halfspace.corridorDestShareLabel}</span>
          <strong>{(stat?.share_pct ?? 0).toFixed(2)}%</strong>
        </p>
        <p className="cell-tip-note">{m.maps.halfspace.corridorHoverHint}</p>
      </div>
    );
  };

  const corridorOriginTooltip = (corridor: PitchCorridor): ReactNode => {
    const stat = attThirdCorridorOrigin[corridor];
    return (
      <div className="cell-tip">
        <p className="cell-tip-title">{corridorLabel(corridor)}</p>
        <p className="cell-tip-row">
          <span>{m.maps.halfspace.corridorFlowOriginLabel}</span>
          <strong>{numberFormat.format(stat?.passes ?? 0)}</strong>
        </p>
        <p className="cell-tip-row">
          <span>{m.maps.halfspace.corridorOriginShareLabel}</span>
          <strong>{(stat?.share_pct ?? 0).toFixed(2)}%</strong>
        </p>
        <p className="cell-tip-note">{m.maps.halfspace.corridorClickHint}</p>
      </div>
    );
  };

  const toggleCorridor = (corridor: PitchCorridor) => {
    setSelectedCorridor((prev) => (prev === corridor ? null : corridor));
  };

  const difficultTooltip = (cell: CellStat): ReactNode => (
    <div className="cell-tip">
      <p className="cell-tip-title">{cellLabel(cell)}</p>
      <p className="cell-tip-ref">{cellRef(cell)}</p>
      <p className="cell-tip-row">
        <span>{m.maps.tooltip.meanXpLabel}</span>
        <strong>{(cell.mean_xp ?? 0).toFixed(2)}</strong>
      </p>
      <p className="cell-tip-row">
        <span>{m.maps.tooltip.difficultyLabel}</span>
        <strong>{difficultyBand(cell.mean_xp ?? 0)}</strong>
      </p>
      <p className="cell-tip-note">{m.maps.tooltip.xpExplain}</p>
    </div>
  );

  return (
    <div className="container">
      <PageHero title={m.nav.maps} subtitle={m.maps.subtitle} icon="fa-map-location-dot" />

      {error && <div className="error-box">{error}</div>}

      {loading && <LoadingState message={m.maps.generating} />}

      {!loading && aggregated && (
        <section className="aggregate-maps">
          <header className="aggregate-maps-header">
            <h3 className="section-label">{m.maps.aggregateNote}</h3>
            <p className="muted">
              {fillTemplate(m.maps.aggregateLead, {
                players: numberFormat.format(aggregated.player_count),
                passes: numberFormat.format(aggregated.total_passes),
              })}
            </p>
          </header>

          {corridorGuides.length > 0 && (
            <div className="corridor-legend" role="note">
              <span className="corridor-legend-title">{m.maps.corridorLegendTitle}</span>
              <span className="corridor-legend-item corridor-legend-item--yellow">
                {m.maps.corridorLegend.yellow}
              </span>
              <span className="corridor-legend-item corridor-legend-item--white">
                {m.maps.corridorLegend.white}
              </span>
              <span className="corridor-legend-item corridor-legend-item--red">
                {m.maps.corridorLegend.red}
              </span>
            </div>
          )}

          <div className="maps-grid">
            {aggregated.common_map_b64 && (
              <figure className="aggregate-map">
                <div className="aggregate-map-frame">
                  <img
                    src={`data:image/png;base64,${aggregated.common_map_b64}`}
                    alt={m.maps.commonPassesAlt}
                    className="map-img"
                  />
                  <PitchCorridorGuides guides={corridorGuides} />
                  {aggregated.common_map_cells && (
                    <CellOverlay
                      cells={cells}
                      boxes={aggregated.common_map_cells}
                      tooltipFor={commonTooltip}
                      labelFor={cellLabel}
                      selected={selected}
                      onToggle={toggleCell}
                    />
                  )}
                </div>
                <figcaption className="muted">{m.maps.tooltip.compareHint}</figcaption>
              </figure>
            )}

            {aggregated.rare_map_b64 && (
              <figure className="aggregate-map">
                <div className="aggregate-map-frame">
                  <img
                    src={`data:image/png;base64,${aggregated.rare_map_b64}`}
                    alt={m.maps.rarePassesAlt}
                    className="map-img"
                  />
                  <PitchCorridorGuides guides={corridorGuides} />
                  {aggregated.rare_map_cells && (
                    <CellOverlay
                      cells={cells}
                      boxes={aggregated.rare_map_cells}
                      tooltipFor={difficultTooltip}
                      labelFor={cellLabel}
                    />
                  )}
                </div>
                <figcaption className="muted">{m.maps.tooltip.xpExplain}</figcaption>
              </figure>
            )}
          </div>

          {aggregated.halfspace_origin_map_b64 && (
            <section className="halfspace-maps">
              <header className="aggregate-maps-header">
                <h3 className="section-label">{m.maps.halfspace.sectionTitle}</h3>
                <p className="muted">{m.maps.halfspace.sectionLead}</p>
                {halfspaceSummaryLine && <p className="muted">{halfspaceSummaryLine}</p>}
                {attThirdDestSummaryLine && <p className="muted">{attThirdDestSummaryLine}</p>}
              </header>
              <div className="maps-grid halfspace-maps-grid">
                <figure className="aggregate-map halfspace-map">
                  <div className="aggregate-map-frame">
                    <img
                      src={`data:image/png;base64,${aggregated.halfspace_origin_map_b64}`}
                      alt={m.maps.halfspace.originMapAlt}
                      className="map-img"
                    />
                    <PitchCorridorHotspots
                      guides={corridorGuides}
                      counts={attThirdCorridorDest}
                      tooltipFor={(corridor) => corridorDestTooltip(corridor)}
                      labelFor={corridorLabel}
                      showCountBadge
                      emphasis
                    />
                  </div>
                  <figcaption className="muted">{m.maps.halfspace.originCaption}</figcaption>
                </figure>

                {aggregated.halfspace_dest_map_b64 && (
                  <figure className="aggregate-map halfspace-map">
                    <div className="aggregate-map-frame">
                      <img
                        src={`data:image/png;base64,${aggregated.halfspace_dest_map_b64}`}
                        alt={m.maps.halfspace.destMapAlt}
                        className="map-img"
                      />
                      <PitchCorridorHotspots
                        guides={corridorGuides}
                        counts={attThirdCorridorOrigin}
                        tooltipFor={(corridor) => corridorOriginTooltip(corridor)}
                        interactive
                        selected={selectedCorridor}
                        onSelect={toggleCorridor}
                        labelFor={corridorLabel}
                        showCountBadge
                        emphasis
                      />
                    </div>
                    <figcaption className="muted">{m.maps.halfspace.destCaption}</figcaption>
                  </figure>
                )}
              </div>

              <div className="corridor-flow-card" role="status">
                <div className="corridor-flow-head">
                  <h4>{m.maps.halfspace.corridorFlowTitle}</h4>
                  {selectedCorridor && (
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => setSelectedCorridor(null)}
                    >
                      {m.maps.halfspace.corridorFlowClear}
                    </button>
                  )}
                </div>
                {!selectedCorridor && (
                  <p className="muted">{m.maps.halfspace.corridorFlowPickCorridor}</p>
                )}
                {selectedCorridor && activeOriginFlow && (
                  <>
                    <p className="corridor-flow-origin">
                      <strong>{corridorLabel(selectedCorridor)}</strong>
                      {" · "}
                      {m.maps.halfspace.corridorFlowOriginLabel}:{" "}
                      <strong>{numberFormat.format(activeOriginFlow.origin_passes)}</strong>
                    </p>
                    <ul className="corridor-flow-list">
                      {CORRIDOR_ORDER.map((key) => {
                        const dest = activeOriginFlow.dest_corridor_counts[key];
                        if (!dest?.passes) return null;
                        return (
                          <li key={key}>
                            <span>{corridorLabel(key)}</span>
                            <span>
                              {numberFormat.format(dest.passes)} ({dest.share_pct.toFixed(1)}%)
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                    <p className="muted corridor-flow-note">{m.maps.halfspace.corridorOriginSelectHint}</p>
                  </>
                )}
              </div>
            </section>
          )}

          {comparison && (
            <div className="quadrant-compare-card" role="status">
              <div className="quadrant-compare-head">
                <h4>{m.maps.tooltip.comparisonTitle}</h4>
                <button type="button" className="btn btn-ghost" onClick={() => setSelected([])}>
                  {m.maps.tooltip.clearSelection}
                </button>
              </div>
              <div className="quadrant-compare-values">
                {[comparison.first, comparison.second].map((cell) => (
                  <div key={cell.key} className="quadrant-compare-value">
                    <span className="quadrant-compare-label">
                      {cellLabel(cell)} · {cellRef(cell)}
                    </span>
                    <strong>{numberFormat.format(cell.passes)}</strong>
                    <span className="muted">{cell.share_pct.toFixed(2)}%</span>
                  </div>
                ))}
              </div>
              <p className="quadrant-compare-summary">
                {comparison.equal
                  ? m.maps.tooltip.comparisonEqual
                  : fillTemplate(m.maps.tooltip.comparisonMore, {
                      high: `${cellLabel(comparison.high)} (${cellRef(comparison.high)})`,
                      low: `${cellLabel(comparison.low)} (${cellRef(comparison.low)})`,
                      pct: comparison.gainPct.toFixed(1),
                    })}
              </p>
              {!comparison.equal && (
                <p className="muted">
                  {fillTemplate(m.maps.tooltip.comparisonDiff, {
                    diff: numberFormat.format(comparison.diff),
                    low: cellRef(comparison.low),
                    high: cellRef(comparison.high),
                    pct: comparison.dropPct.toFixed(1),
                  })}
                </p>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
