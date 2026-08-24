"use client";

import { useEffect, useMemo, useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { PeerScopeToggle } from "@/components/PeerScopeToggle";
import { buildProfileUrl, type ProfileFilterState } from "@/lib/profileParams";
import { prefetchPlayerProfile } from "@/lib/profileClientCache";
import type { PeerScope, PlayerOption } from "@/lib/api";
import { useI18n } from "@/lib/i18n/context";

const MAX_RESULTS = 20;
const PREVIEW_RESULTS = 12;

function filterOptions(options: PlayerOption[], query: string): PlayerOption[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) {
    return options.slice(0, PREVIEW_RESULTS);
  }

  return options
    .filter((option) => {
      const haystack = `${option.player_name} ${option.team} ${option.label}`.toLowerCase();
      return haystack.includes(trimmed);
    })
    .slice(0, MAX_RESULTS);
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
  const [open, setOpen] = useState(false);

  const selected = useMemo(
    () => options.find((option) => option.player_id === currentId),
    [options, currentId],
  );

  useEffect(() => {
    if (!open) {
      setSearch("");
    }
  }, [currentId, open]);

  const filtered = useMemo(() => filterOptions(options, search), [options, search]);
  const displayValue = open ? search : (selected?.player_name ?? search);
  const family = filters.position_family ?? "midfielders";

  if (!options.length) return null;

  function selectPlayer(playerId: string) {
    prefetchPlayerProfile(playerId, family);
    router.push(buildProfileUrl({ ...filters, player: playerId, search: undefined }));
    setOpen(false);
    setSearch("");
  }

  function onInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" && filtered[0]) {
      event.preventDefault();
      selectPlayer(filtered[0].player_id);
    }
    if (event.key === "Escape") {
      setOpen(false);
      setSearch("");
    }
  }

  return (
    <div className="player-search-row">
      <div className={`compare-player-picker player-search-autocomplete${open ? " is-open" : ""}`}>
        <label className="filter-label compare-player-picker-label" htmlFor="player-search">
          {m.profile.searchPlayer}
        </label>
        <div className="compare-player-picker-wrap">
          <input
            id="player-search"
            type="search"
            className="compare-player-picker-input player-search-input"
            value={displayValue}
            placeholder={m.profile.searchPlaceholder}
            autoComplete="off"
            role="combobox"
            aria-expanded={open}
            aria-controls="player-search-listbox"
            aria-autocomplete="list"
            onChange={(event) => {
              setSearch(event.target.value);
              setOpen(true);
            }}
            onFocus={() => {
              setSearch(selected?.player_name ?? "");
              setOpen(true);
            }}
            onBlur={() => {
              window.setTimeout(() => setOpen(false), 150);
            }}
            onKeyDown={onInputKeyDown}
          />
          {open ? (
            filtered.length > 0 ? (
              <ul
                id="player-search-listbox"
                className="compare-player-picker-list"
                role="listbox"
              >
                {filtered.map((option) => (
                  <li key={option.player_id}>
                    <button
                      type="button"
                      className={`compare-player-picker-option${option.player_id === currentId ? " active" : ""}`}
                      role="option"
                      aria-selected={option.player_id === currentId}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => selectPlayer(option.player_id)}
                    >
                      {option.label}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="compare-player-picker-empty">{m.common.noResults}</div>
            )
          ) : null}
        </div>
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
