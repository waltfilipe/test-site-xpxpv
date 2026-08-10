"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { LoadingState } from "@/components/LoadingState";
import { PlayerSearchRow } from "@/components/PlayerSearchRow";
import { ProfileGroupCards } from "@/components/ProfileGroupCards";
import { ProfileView } from "@/components/ProfileView";
import { getPlayerOptions, getPlayers } from "@/lib/api";
import { PROFILE_ALL_GROUP, profileGroupCounts } from "@/lib/playerReports";
import { filtersFromRecord, type ProfileFilterState } from "@/lib/profileParams";

function filtersForGroup(filters: ProfileFilterState): ProfileFilterState {
  const group = filters.profile_group ?? PROFILE_ALL_GROUP.id;
  if (group === PROFILE_ALL_GROUP.id) {
    const { profile_group: _removed, ...rest } = filters;
    return rest;
  }
  return { ...filters, profile_group: group };
}

function ProfilePageBodyInner() {
  const searchParams = useSearchParams();
  const filters = useMemo(
    () => filtersFromRecord(Object.fromEntries(searchParams.entries())),
    [searchParams],
  );
  const family = filters.position_family ?? "midfielders";
  const profileGroup = filters.profile_group ?? PROFILE_ALL_GROUP.id;
  const activeFilters = useMemo(() => filtersForGroup(filters), [filters]);

  const [options, setOptions] = useState<{ player_id: string; label: string }[]>([]);
  const [groupCounts, setGroupCounts] = useState<Record<string, number>>({});
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
    ])
      .then(([playersRes, optionsRes]) => {
        if (cancelled) return;
        setGroupCounts(profileGroupCounts(playersRes.players));
        setOptions(optionsRes.options);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Backend indisponível");
        setOptions([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [family, filterKey, searchParams]);

  const playerId = filters.player ?? options[0]?.player_id;

  if (loading) {
    return <LoadingState message="Carregando pool de jogadores…" />;
  }

  return (
    <>
      {error && (
        <p className="muted profile-empty-note">
          {error}. O backend pode levar alguns minutos no primeiro carregamento — tente novamente em instantes.
        </p>
      )}

      <ProfileGroupCards current={{ ...filters, profile_group: profileGroup }} counts={groupCounts} />

      {options.length > 0 ? (
        <PlayerSearchRow options={options} currentId={playerId} filters={activeFilters} />
      ) : !error ? (
        <p className="muted profile-empty-note">
          Nenhum jogador encontrado neste grupo.
        </p>
      ) : null}

      {playerId ? <ProfileView playerId={playerId} positionFamily={family} /> : null}
    </>
  );
}

export function ProfilePageBody() {
  return (
    <Suspense fallback={<LoadingState message="Carregando perfil…" />}>
      <ProfilePageBodyInner />
    </Suspense>
  );
}
