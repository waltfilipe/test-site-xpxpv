"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { PeerScopeToggle } from "@/components/PeerScopeToggle";
import { buildProfileUrl, type ProfileFilterState } from "@/lib/profileParams";
import { prefetchPlayerProfile } from "@/lib/profileClientCache";
import type { PeerScope } from "@/lib/api";
import { useI18n } from "@/lib/i18n/context";

type Option = { player_id: string; label: string };

export function PlayerSearchRow({
  options,
  currentId,
  filters,
  peerScope,
  onPeerScopeChange,
}: {
  options: Option[];
  currentId?: string;
  filters: ProfileFilterState;
  peerScope?: PeerScope;
  onPeerScopeChange?: (scope: PeerScope) => void;
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

      {onPeerScopeChange ? (
        <div className="player-search-scope">
          <span className="filter-label">{m.profile.peerScopeToggleLabel}</span>
          <PeerScopeToggle scope={peerScope ?? "league"} onChange={onPeerScopeChange} />
        </div>
      ) : null}
    </div>
  );
}
