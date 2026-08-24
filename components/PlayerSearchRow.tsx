"use client";

import { useMemo, useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { PeerScopeToggle } from "@/components/PeerScopeToggle";
import { buildProfileUrl, type ProfileFilterState } from "@/lib/profileParams";
import { prefetchPlayerProfile } from "@/lib/profileClientCache";
import type { PeerScope, PlayerOption } from "@/lib/api";
import { useI18n } from "@/lib/i18n/context";

const MAX_SEARCH_RESULTS = 16;

function matchesQuery(option: PlayerOption, query: string): boolean {
  const haystack = `${option.player_name} ${option.team} ${option.label}`.toLowerCase();
  return haystack.includes(query);
}

function filterOptions(options: PlayerOption[], query: string): PlayerOption[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return options;
  return options.filter((option) => matchesQuery(option, trimmed));
}

export function PlayerSearchRow({
  options,
  currentId,
  filters,
  peerScope,
}: {
  options: PlayerOption[];
  currentId?: string;
  filters: ProfileFilterState;
  peerScope?: {
    scope: PeerScope;
    onChange: (scope: PeerScope) => void;
  };
}) {
  const router = useRouter();
  const { m } = useI18n();
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const family = filters.position_family ?? "midfielders";

  const filteredOptions = useMemo(
    () => filterOptions(options, search),
    [options, search],
  );

  const searchResults = useMemo(() => {
    const trimmed = search.trim();
    if (!trimmed) return [];
    return filteredOptions.slice(0, MAX_SEARCH_RESULTS);
  }, [filteredOptions, search]);

  const selectOptions = useMemo(() => {
    if (!currentId) return filteredOptions;
    if (filteredOptions.some((option) => option.player_id === currentId)) {
      return filteredOptions;
    }
    const current = options.find((option) => option.player_id === currentId);
    return current ? [current, ...filteredOptions] : filteredOptions;
  }, [filteredOptions, currentId, options]);

  const selectValue = currentId ?? selectOptions[0]?.player_id ?? options[0]?.player_id;

  if (!options.length) return null;

  function navigateToPlayer(playerId: string) {
    prefetchPlayerProfile(playerId, family);
    router.push(buildProfileUrl({ ...filters, player: playerId, search: undefined }));
    setSearch("");
    setSearchOpen(false);
  }

  function onSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" && searchResults[0]) {
      event.preventDefault();
      navigateToPlayer(searchResults[0].player_id);
    }
    if (event.key === "Escape") {
      setSearchOpen(false);
    }
  }

  return (
    <div className="player-search-row">
      <div className={`player-search-form player-search-live${searchOpen ? " is-open" : ""}`}>
        <label className="filter-label" htmlFor="player-search">
          {m.profile.searchPlayer}
        </label>
        <div className="player-search-input-wrap">
          <input
            id="player-search"
            type="search"
            className="player-search-input"
            placeholder={m.profile.searchPlaceholder}
            value={search}
            autoComplete="off"
            role="combobox"
            aria-expanded={searchOpen && search.trim().length > 0}
            aria-controls="player-search-results"
            onChange={(event) => {
              setSearch(event.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            onBlur={() => {
              window.setTimeout(() => setSearchOpen(false), 150);
            }}
            onKeyDown={onSearchKeyDown}
          />
        </div>
        {searchOpen && search.trim() ? (
          searchResults.length > 0 ? (
            <ul id="player-search-results" className="player-search-results" role="listbox">
              {searchResults.map((option) => (
                <li key={option.player_id}>
                  <button
                    type="button"
                    className={`player-search-result${option.player_id === currentId ? " active" : ""}`}
                    role="option"
                    aria-selected={option.player_id === currentId}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => navigateToPlayer(option.player_id)}
                  >
                    {option.label}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="player-search-results player-search-results-empty">
              {m.common.noResults}
            </div>
          )
        ) : null}
      </div>

      <div className="player-select-field">
        <label className="filter-label" htmlFor="player-select">
          {m.profile.selectPlayer}
        </label>
        <select
          id="player-select"
          className="player-select"
          value={selectValue}
          onChange={(event) => navigateToPlayer(event.target.value)}
          onFocus={() => {
            if (currentId) {
              prefetchPlayerProfile(currentId, family);
            }
          }}
        >
          {selectOptions.length > 0 ? (
            selectOptions.map((option) => (
              <option key={option.player_id} value={option.player_id}>
                {option.label}
              </option>
            ))
          ) : (
            <option value="">{m.common.noResults}</option>
          )}
        </select>
      </div>

      {peerScope ? (
        <div className="player-search-actions player-search-peer-scope">
          <span className="filter-label filter-label-compact">{m.profile.peerScopeToggleLabel}</span>
          <PeerScopeToggle scope={peerScope.scope} onChange={peerScope.onChange} />
        </div>
      ) : null}
    </div>
  );
}
