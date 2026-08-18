import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import {
  enrichedReportPlayers,
  PLAYER_REPORT_CATEGORIES,
  playerIdsForProfileGroup,
} from "./playerReports.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const POOL_IDS = new Set(
  JSON.parse(readFileSync(join(ROOT, "data/player-ids.json"), "utf8")) as string[],
);

describe("playerReports", () => {
  it("defines three overall-grade cohort blocks", () => {
    assert.equal(PLAYER_REPORT_CATEGORIES.length, 3);
    assert.deepEqual(
      PLAYER_REPORT_CATEGORIES.map((cat) => cat.id),
      ["top-overall-league", "top-overall-no-giants", "top-u23-league"],
    );
  });

  it("lists five players per league in block 1", () => {
    const block1 = PLAYER_REPORT_CATEGORIES.find((cat) => cat.id === "top-overall-league");
    assert.ok(block1);
    assert.equal(block1.groups.length, 5);
    for (const group of block1.groups) {
      assert.equal(group.players.length, 5);
    }
  });

  it("only lists report players that exist in the curated pool data", () => {
    const missing = enrichedReportPlayers()
      .map((entry) => entry.playerId)
      .filter((playerId) => !POOL_IDS.has(playerId));

    assert.deepEqual(missing, [], `Report players missing from pool data: ${missing.join(", ")}`);
  });
});
