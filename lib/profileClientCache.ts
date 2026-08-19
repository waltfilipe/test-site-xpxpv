import { getPlayerProfile, type PlayerProfile } from "@/lib/api";

const cache = new Map<string, PlayerProfile>();
const inflight = new Map<string, Promise<PlayerProfile>>();

function cacheKey(playerId: string, positionFamily: string) {
  return `${positionFamily}:${playerId}`;
}

export function getCachedPlayerProfile(
  playerId: string,
  positionFamily = "midfielders",
): PlayerProfile | null {
  return cache.get(cacheKey(playerId, positionFamily)) ?? null;
}

export function prefetchPlayerProfile(
  playerId: string,
  positionFamily = "midfielders",
): void {
  void loadPlayerProfile(playerId, positionFamily).catch(() => {});
}

export async function loadPlayerProfile(
  playerId: string,
  positionFamily = "midfielders",
): Promise<PlayerProfile> {
  const key = cacheKey(playerId, positionFamily);
  const hit = cache.get(key);
  if (hit) return hit;

  const pending = inflight.get(key);
  if (pending) return pending;

  const request = getPlayerProfile(playerId, positionFamily)
    .then((profile) => {
      cache.set(key, profile);
      inflight.delete(key);
      return profile;
    })
    .catch((error) => {
      inflight.delete(key);
      throw error;
    });

  inflight.set(key, request);
  return request;
}
