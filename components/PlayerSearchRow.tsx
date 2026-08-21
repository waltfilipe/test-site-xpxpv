"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { PeerScopeToggle } from "@/components/PeerScopeToggle";
import { buildProfileUrl, type ProfileFilterState } from "@/lib/profileParams";
import { prefetchPlayerProfile } from "@/lib/profileClientCache";
import type { PeerScope } from "@/lib/api";
import { useI18n } from "@/lib/i18n/context";

type Option = { player_id: string; label: string };

type FiltersToggle = {
  open: boolean;
  onToggle: () => void;
  label: string;
};

export function PlayerSearchRow({
  options,
  currentId,
  filters,
  peerScope,
  filtersToggle,
}: {
  options: Option[];
  currentId?: string;
  filters: ProfileFilterState;
  peerScope?: {
    scope: PeerScope;
    onChange: (scope: PeerScope) => void;
  };
  filtersToggle?: FiltersToggle;
}) {
  const router = useRouter();
  const { m } = useI18n();
  const [search, setSearch] = useState(filters.search ?? "");

  if (!options.length) return null;

  function onSearchSubmit(e: FormEvent) {
    e.preventDefault();
    router.push(
      buildProfileUrl({
        ...filters,
        search: search.trim() || undefined,
        player: undefined,
      }),
    );
  }

  return (
    <div className="player-search-row">
      <form className="player-search-form" onSubmit={onSearchSubmit}>
        <label className="filter-label" htmlFor="player-search">{m.profile.searchPlayer}</label>
        <div className="player-search-input-wrap">
          <input
            id="player-search"
            type="search"
            className="player-search-input"
            placeholder={m.profile.searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-ghost btn-sm" aria-label={m.common.search}>
            <i className="fa-solid fa-magnifying-glass" />
          </button>
        </div>
      </form>

      <div className="player-select-field">
        <label className="filter-label" htmlFor="player-select">{m.profile.selectPlayer}</label>
        <select
          id="player-select"
          className="player-select"
          value={currentId ?? options[0].player_id}
          onChange={(e) => {
            const nextId = e.target.value;
            prefetchPlayerProfile(nextId, filters.position_family ?? "midfielders");
            router.push(buildProfileUrl({ ...filters, player: nextId }));
          }}
          onFocus={() => {
            if (currentId) {
              prefetchPlayerProfile(currentId, filters.position_family ?? "midfielders");
            }
          }}
        >
          {options.map((o) => (
            <option key={o.player_id} value={o.player_id}>{o.label}</option>
          ))}
        </select>
      </div>

      {peerScope ? (
        <div className="player-search-actions player-search-peer-scope">
          <span className="filter-label">{m.profile.peerScopeToggleLabel}</span>
          <PeerScopeToggle scope={peerScope.scope} onChange={peerScope.onChange} />
        </div>
      ) : null}

      {filtersToggle ? (
        <div className="player-search-actions">
          <span className="filter-label player-search-actions-label" aria-hidden="true">
            &nbsp;
          </span>
          <button
            type="button"
            className={`btn btn-ghost btn-sm player-filters-toggle${filtersToggle.open ? " active" : ""}`}
            onClick={filtersToggle.onToggle}
            aria-expanded={filtersToggle.open}
            aria-controls="profile-filters-panel"
          >
            <i className="fa-solid fa-sliders" aria-hidden="true" />
            {filtersToggle.label}
            <i className={`fa-solid fa-chevron-${filtersToggle.open ? "up" : "down"}`} aria-hidden="true" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
