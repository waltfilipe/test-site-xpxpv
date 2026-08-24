import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import {
  enrichedReportPlayers,
  mergedReportPlayers,
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

  it("dedupes merged report players by id while keeping all group labels", () => {
    const merged = mergedReportPlayers();
    const raw = enrichedReportPlayers();
    assert.ok(merged.length < raw.length);
    assert.equal(new Set(merged.map((entry) => entry.playerId)).size, merged.length);

    const pedri = merged.find((entry) => entry.playerId === "992587");
    assert.ok(pedri);
    assert.equal(raw.filter((entry) => entry.playerId === "992587").length, 2);
    assert.ok(pedri.groupLabels.includes("La Liga"));
    assert.equal(pedri.groups.length, 1);
    assert.equal(pedri.groups[0]?.label, "La Liga");
    assert.ok(pedri.groups[0]?.accent);
  });
});
