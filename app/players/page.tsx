import { getMeta, getPlayers } from "@/lib/api";
import { PlayersPageContent } from "./PlayersPageContent";

type PageProps = {
  searchParams: Promise<{
    league?: string;
    badge?: string;
  }>;
};

export default async function PlayersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  let data = { total: 0, players: [] as Awaited<ReturnType<typeof getPlayers>>["players"] };
  let filters = { leagues: [] as string[] };
  let error: string | null = null;

  const family = "midfielders";

  try {
    const [meta, playersRes] = await Promise.all([
      getMeta(family),
      getPlayers({
        league: params.league,
        badge: params.badge,
        position_family: family,
        limit: 500,
      }),
    ]);
    data = playersRes;
    filters = { leagues: meta.leagues };
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load players";
  }

  return (
    <PlayersPageContent
      players={data.players}
      total={data.total}
      error={error}
      family={family}
      filters={filters}
      params={{
        league: params.league,
        badge: params.badge,
      }}
    />
  );
}
