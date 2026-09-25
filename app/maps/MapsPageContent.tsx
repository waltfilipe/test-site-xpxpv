"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { LoadingState } from "@/components/LoadingState";
import { PageHero } from "@/components/PageHero";
import { Tooltip } from "@/components/ui/Tooltip";
import {
  getAggregatedMaps,
  type AggregatedMaps,
  type QuadrantBox,
  type QuadrantKey,
} from "@/lib/api";
import { useI18n } from "@/lib/i18n/context";

const QUADRANT_ORDER: QuadrantKey[] = ["def_left", "def_right", "att_left", "att_right"];

function fillTemplate(template: string, values: Record<string, string>) {
  return template.replace(/\{(\w+)\}/g, (match, key) => values[key] ?? match);
}

type QuadrantOverlayProps = {
  boxes: Record<QuadrantKey, QuadrantBox>;
  tooltipFor: (key: QuadrantKey) => ReactNode;
  labelFor: (key: QuadrantKey) => string;
  selected?: QuadrantKey[];
  onToggle?: (key: QuadrantKey) => void;
};

function QuadrantOverlay({ boxes, tooltipFor, labelFor, selected, onToggle }: QuadrantOverlayProps) {
  return (
    <div className="quadrant-overlay">
      {QUADRANT_ORDER.map((key) => {
        const box = boxes[key];
        if (!box) return null;
        const isSelected = selected?.includes(key) ?? false;
        const interactive = Boolean(onToggle);
        return (
          <div
            key={key}
            className={`quadrant-hotspot${isSelected ? " is-selected" : ""}${interactive ? " is-clickable" : ""}`}
            style={{
              left: `${box.left_pct}%`,
              top: `${box.top_pct}%`,
              width: `${box.width_pct}%`,
              height: `${box.height_pct}%`,
            }}
          >
            <Tooltip content={tooltipFor(key)} block>
              {interactive ? (
                <button
                  type="button"
                  className="quadrant-hitbox"
                  aria-pressed={isSelected}
                  aria-label={labelFor(key)}
                  onClick={() => onToggle?.(key)}
                />
              ) : (
                <span className="quadrant-hitbox" aria-label={labelFor(key)} role="img" />
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
  const [selected, setSelected] = useState<QuadrantKey[]>([]);
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

  const statsByKey = useMemo(() => {
    const map = new Map<QuadrantKey, AggregatedMaps["quadrant_stats"][number]>();
    for (const row of aggregated?.quadrant_stats ?? []) map.set(row.quadrant_key, row);
    return map;
  }, [aggregated]);

  const quadrantLabel = (key: QuadrantKey) => m.maps.quadrants[key];

  const toggleQuadrant = (key: QuadrantKey) => {
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
    const [firstKey, secondKey] = selected;
    const first = statsByKey.get(firstKey);
    const second = statsByKey.get(secondKey);
    if (!first || !second) return null;

    const [high, low] = first.passes >= second.passes ? [first, second] : [second, first];
    const diff = high.passes - low.passes;
    const gainPct = low.passes ? (diff / low.passes) * 100 : 0;
    const dropPct = high.passes ? (diff / high.passes) * 100 : 0;

    return {
      first,
      second,
      highLabel: quadrantLabel(high.quadrant_key),
      lowLabel: quadrantLabel(low.quadrant_key),
      diff,
      gainPct,
      dropPct,
      equal: diff === 0,
    };
  }, [selected, statsByKey, m]);

  const commonTooltip = (key: QuadrantKey): ReactNode => {
    const stat = statsByKey.get(key);
    if (!stat) return null;
    const isSelected = selected.includes(key);
    return (
      <div className="quadrant-tip">
        <p className="quadrant-tip-title">{quadrantLabel(key)}</p>
        <p className="quadrant-tip-row">
          <span>{m.maps.tooltip.passesLabel}</span>
          <strong>{numberFormat.format(stat.passes)}</strong>
        </p>
        <p className="quadrant-tip-row">
          <span>{m.maps.tooltip.shareLabel}</span>
          <strong>{stat.share_pct.toFixed(1)}%</strong>
        </p>
        <p className="quadrant-tip-note">
          {isSelected
            ? selected.length < 2
              ? m.maps.tooltip.comparePending
              : m.maps.tooltip.compareSelected
            : m.maps.tooltip.compareHint}
        </p>
      </div>
    );
  };

  const difficultTooltip = (key: QuadrantKey): ReactNode => {
    const stat = statsByKey.get(key);
    if (!stat) return null;
    return (
      <div className="quadrant-tip">
        <p className="quadrant-tip-title">{quadrantLabel(key)}</p>
        <p className="quadrant-tip-row">
          <span>{m.maps.tooltip.meanXpLabel}</span>
          <strong>{stat.mean_xp.toFixed(2)}</strong>
        </p>
        <p className="quadrant-tip-row">
          <span>{m.maps.tooltip.difficultyLabel}</span>
          <strong>{difficultyBand(stat.mean_xp)}</strong>
        </p>
        <p className="quadrant-tip-note">{m.maps.tooltip.xpExplain}</p>
      </div>
    );
  };

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

          <div className="maps-grid">
            {aggregated.common_map_b64 && (
              <figure className="aggregate-map">
                <div className="aggregate-map-frame">
                  <img
                    src={`data:image/png;base64,${aggregated.common_map_b64}`}
                    alt={m.maps.commonPassesAlt}
                    className="map-img"
                  />
                  {aggregated.common_map_quadrants && (
                    <QuadrantOverlay
                      boxes={aggregated.common_map_quadrants}
                      tooltipFor={commonTooltip}
                      labelFor={quadrantLabel}
                      selected={selected}
                      onToggle={toggleQuadrant}
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
                  {aggregated.rare_map_quadrants && (
                    <QuadrantOverlay
                      boxes={aggregated.rare_map_quadrants}
                      tooltipFor={difficultTooltip}
                      labelFor={quadrantLabel}
                    />
                  )}
                </div>
                <figcaption className="muted">{m.maps.tooltip.xpExplain}</figcaption>
              </figure>
            )}
          </div>

          {comparison && (
            <div className="quadrant-compare-card" role="status">
              <div className="quadrant-compare-head">
                <h4>{m.maps.tooltip.comparisonTitle}</h4>
                <button type="button" className="btn btn-ghost" onClick={() => setSelected([])}>
                  {m.maps.tooltip.clearSelection}
                </button>
              </div>
              <div className="quadrant-compare-values">
                {[comparison.first, comparison.second].map((stat) => (
                  <div key={stat.quadrant_key} className="quadrant-compare-value">
                    <span className="quadrant-compare-label">{quadrantLabel(stat.quadrant_key)}</span>
                    <strong>{numberFormat.format(stat.passes)}</strong>
                    <span className="muted">{stat.share_pct.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
              <p className="quadrant-compare-summary">
                {comparison.equal
                  ? m.maps.tooltip.comparisonEqual
                  : fillTemplate(m.maps.tooltip.comparisonMore, {
                      high: comparison.highLabel,
                      low: comparison.lowLabel,
                      pct: comparison.gainPct.toFixed(1),
                    })}
              </p>
              {!comparison.equal && (
                <p className="muted">
                  {fillTemplate(m.maps.tooltip.comparisonDiff, {
                    diff: numberFormat.format(comparison.diff),
                    low: comparison.lowLabel,
                    high: comparison.highLabel,
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
