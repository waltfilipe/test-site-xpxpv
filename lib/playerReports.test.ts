import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import {
  enrichedReportPlayers,
  playerIdsForProfileGroup,
} from "./playerReports.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const POOL_IDS = new Set(
  JSON.parse(readFileSync(join(ROOT, "data/player-ids.json"), "utf8")) as string[],
);

describe("playerReports", () => {
  it("includes Sofyan Amrabat in the Prime Prospects 24–30 group", () => {
    const primeProspectIds = playerIdsForProfileGroup("blue-collar-24-30");
    assert.ok(primeProspectIds.has("359272"), "Sofyan Amrabat (359272) must be in Prime Prospects reports");

    const amrabat = enrichedReportPlayers().find((entry) => entry.playerId === "359272");
    assert.ok(amrabat, "Sofyan Amrabat must appear in enriched report players");
    assert.equal(amrabat.category.id, "blue-collar-24-30");
    assert.equal(amrabat.groupLabel, "Extended watchlist");
  });

  it("only lists report players that exist in the curated pool data", () => {
    const missing = enrichedReportPlayers()
      .map((entry) => entry.playerId)
      .filter((playerId) => !POOL_IDS.has(playerId));

    assert.deepEqual(missing, [], `Report players missing from pool data: ${missing.join(", ")}`);
  });
});
