"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { LoadingState } from "@/components/LoadingState";
import { PlayerSearchRow } from "@/components/PlayerSearchRow";
import { ProfileFilters } from "@/components/ProfileFilters";
import { ProfileGroupCards } from "@/components/ProfileGroupCards";
import { ProfileView } from "@/components/ProfileView";
import { getMeta, getPlayerOptions, getPlayers, type PeerScope } from "@/lib/api";
import { mergeFilterOptions } from "@/lib/filterDefaults";
import type { FilterOptionsMeta } from "@/lib/filterTypes";
import { PROFILE_ALL_GROUP, profileGroupCounts, profileLeagueCounts } from "@/lib/playerReports";
import { filtersFromRecord, type ProfileFilterState } from "@/lib/profileParams";
import { useI18n } from "@/lib/i18n/context";

function filtersForGroup(filters: ProfileFilterState): ProfileFilterState {
  const group = filters.profile_group ?? PROFILE_ALL_GROUP.id;
  if (group === PROFILE_ALL_GROUP.id) {
    const { profile_group: _removed, ...rest } = filters;
    return rest;
  }
  return { ...filters, profile_group: group };
}

function ProfilePageBodyInner() {
  const { m } = useI18n();
  const searchParams = useSearchParams();
  const filters = useMemo(
    () => filtersFromRecord(Object.fromEntries(searchParams.entries())),
    [searchParams],
  );
  const family = filters.position_family ?? "midfielders";
  const profileGroup = filters.profile_group ?? PROFILE_ALL_GROUP.id;
  const activeFilters = useMemo(() => filtersForGroup(filters), [filters]);

  const [filterOptions, setFilterOptions] = useState<FilterOptionsMeta>(mergeFilterOptions());
  const [nationalities, setNationalities] = useState<string[]>([]);
  const [options, setOptions] = useState<{ player_id: string; label: string }[]>([]);
  const [groupCounts, setGroupCounts] = useState<Record<string, number>>({});
  const [leagueCounts, setLeagueCounts] = useState<Record<string, number>>({});
  const [peerScope, setPeerScope] = useState<PeerScope>("league");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filterKey = searchParams.toString();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const currentFilters = filtersFromRecord(Object.fromEntries(searchParams.entries()));

    Promise.all([
      getPlayers({ position_family: family, limit: 100 }),
      getPlayerOptions(filtersForGroup(currentFilters)),
      getMeta(family),
    ])
      .then(([playersRes, optionsRes, meta]) => {
        if (cancelled) return;
        setGroupCounts(profileGroupCounts(playersRes.players));
        setLeagueCounts(profileLeagueCounts(playersRes.players, profileGroup));
        setOptions(optionsRes.options);
        setFilterOptions(mergeFilterOptions(meta));
        setNationalities(meta.nationalities ?? []);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : m.compare.backendUnavailable);
        setOptions([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [family, filterKey, searchParams, profileGroup, m.compare.backendUnavailable]);

  const playerId = filters.player ?? options[0]?.player_id;

  if (loading) {
    return <LoadingState message={m.profile.loadingPool} />;
  }

  return (
    <>
      {error && (
        <p className="muted profile-empty-note">
          {error}. {m.profile.backendRetryNote}
        </p>
      )}

      <ProfileGroupCards
        current={{ ...filters, profile_group: profileGroup }}
        counts={groupCounts}
        leagueCounts={leagueCounts}
      />

      {options.length > 0 ? (
        <>
          <PlayerSearchRow
            options={options}
            currentId={playerId}
            filters={activeFilters}
            peerScope={{ scope: peerScope, onChange: setPeerScope }}
            filtersToggle={{
              open: filtersOpen,
              onToggle: () => setFiltersOpen((open) => !open),
              label: m.filters.title,
            }}
          />

          <ProfileFilters
            options={filterOptions}
            nationalities={nationalities}
            current={filters}
            open={filtersOpen}
            onOpenChange={setFiltersOpen}
            showHeader={false}
          />
        </>
      ) : !error ? (
        <p className="muted profile-empty-note">
          {m.profile.noPlayersInGroup}
        </p>
      ) : null}

      {playerId ? (
        <ProfileView
          playerId={playerId}
          positionFamily={family}
          peerScope={peerScope}
        />
      ) : null}
    </>
  );
}

export function ProfilePageBody() {
  const { m } = useI18n();

  return (
    <Suspense fallback={<LoadingState message={m.profile.loadingProfile} />}>
      <ProfilePageBodyInner />
    </Suspense>
  );
}
