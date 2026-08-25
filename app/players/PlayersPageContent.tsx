"use client";

import Link from "next/link";
import { Suspense } from "react";
import { PageHero } from "@/components/PageHero";
import { PlayersTable } from "@/components/PlayersTable";
import type { PlayerSummary } from "@/lib/api";
import { useI18n } from "@/lib/i18n/context";
import { PlayersFilters } from "./PlayersFilters";

type Props = {
  players: PlayerSummary[];
  total: number;
  error: string | null;
  family: string;
  filters: {
    leagues: string[];
  };
  params: {
    league?: string;
    badge?: string;
  };
};

export function PlayersPageContent({
  players,
  total,
  error,
  family,
  filters,
  params,
}: Props) {
  const { m } = useI18n();
  const foundLabel = total === 1 ? m.players.found : m.players.foundPlural;

  return (
    <div className="container">
      <PageHero title={m.nav.players} subtitle={m.players.subtitle} icon="fa-table-list" />

      <Suspense fallback={<div className="muted">{m.players.loadingFilters}</div>}>
        <PlayersFilters
          leagues={filters.leagues}
          currentLeague={params.league}
          currentBadge={params.badge}
        />
      </Suspense>

      {error && <div className="error-box">{error}</div>}

      <p className="muted" style={{ marginBottom: "0.75rem" }}>
        {total} {foundLabel}
      </p>

      <div className="players-promo-card report-screen-only">
        <span className="players-promo-icon">
          <i className="fa-solid fa-award" />
        </span>
        <span className="players-promo-text">
          <strong>{m.players.badgesPromoTitle}</strong>
          <span className="muted">{m.players.badgesPromoDesc}</span>
        </span>
        <Link href="/reports" className="players-promo-cta">
          {m.players.reportsLink} <i className="fa-solid fa-arrow-right" />
        </Link>
      </div>

      <PlayersTable players={players} positionFamily={family} />
    </div>
  );
}
