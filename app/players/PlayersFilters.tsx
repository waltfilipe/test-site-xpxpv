"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useTransition } from "react";
import { useI18n } from "@/lib/i18n/context";

type Props = {
  leagues: string[];
  positionGroups: string[];
  positionFamilies: readonly { key: string; label: string }[];
  currentLeague?: string;
  currentPositionGroup?: string;
  currentPositionFamily?: string;
  currentSearch?: string;
};

export function PlayersFilters({
  leagues,
  positionGroups,
  currentLeague,
  currentPositionGroup,
  currentSearch,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { m } = useI18n();
  const [isPending, startTransition] = useTransition();

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const params = new URLSearchParams();
    const league = String(form.get("league") || "");
    const positionGroup = String(form.get("position_group") || "");
    const positionFamily = String(form.get("position_family") || "midfielders");
    const search = String(form.get("search") || "").trim();
    if (league) params.set("league", league);
    if (positionGroup) params.set("position_group", positionGroup);
    if (positionFamily && positionFamily !== "midfielders") params.set("position_family", positionFamily);
    if (search) params.set("search", search);
    startTransition(() => {
      router.push(`/players?${params.toString()}`);
    });
  }

  function clearFilters() {
    startTransition(() => {
      router.push("/players");
    });
  }

  return (
    <form className="filters" onSubmit={onSubmit}>
      <input
        name="search"
        type="search"
        placeholder={m.players.searchPlaceholder}
        defaultValue={currentSearch ?? searchParams.get("search") ?? ""}
      />
      <select name="league" defaultValue={currentLeague ?? searchParams.get("league") ?? ""}>
        <option value="">{m.common.allLeagues}</option>
        {leagues.map((l) => (
          <option key={l} value={l}>
            {l}
          </option>
        ))}
      </select>
      <select
        name="position_group"
        defaultValue={currentPositionGroup ?? searchParams.get("position_group") ?? ""}
      >
        <option value="">{m.common.allPositions}</option>
        {positionGroups.map((pg) => (
          <option key={pg} value={pg}>
            {pg}
          </option>
        ))}
      </select>
      <button type="submit" className="btn" disabled={isPending}>
        {isPending ? m.common.filtering : m.common.filter}
      </button>
      <button type="button" className="btn" style={{ background: "var(--surface-2)", color: "var(--text)" }} onClick={clearFilters}>
        {m.common.clear}
      </button>
    </form>
  );
}
