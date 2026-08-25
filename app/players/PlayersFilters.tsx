"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useTransition } from "react";
import { PLAYER_BADGE_KEYS } from "@/lib/playerBadges";
import { useI18n } from "@/lib/i18n/context";

type Props = {
  leagues: string[];
  currentLeague?: string;
  currentBadge?: string;
};

export function PlayersFilters({ leagues, currentLeague, currentBadge }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { m } = useI18n();
  const [isPending, startTransition] = useTransition();

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const params = new URLSearchParams();
    const league = String(form.get("league") || "");
    const badge = String(form.get("badge") || "");
    if (league) params.set("league", league);
    if (badge) params.set("badge", badge);
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
      <select name="league" defaultValue={currentLeague ?? searchParams.get("league") ?? ""}>
        <option value="">{m.common.allLeagues}</option>
        {leagues.map((l) => (
          <option key={l} value={l}>
            {l}
          </option>
        ))}
      </select>
      <select name="badge" defaultValue={currentBadge ?? searchParams.get("badge") ?? ""}>
        <option value="">{m.players.allBadges}</option>
        {PLAYER_BADGE_KEYS.map((key) => (
          <option key={key} value={key}>
            {m.profileBadges[key].label}
          </option>
        ))}
      </select>
      <button type="submit" className="btn" disabled={isPending}>
        {isPending ? m.common.filtering : m.common.filter}
      </button>
      <button
        type="button"
        className="btn"
        style={{ background: "var(--surface-2)", color: "var(--text)" }}
        onClick={clearFilters}
      >
        {m.common.clear}
      </button>
    </form>
  );
}
