import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { buildReportMapCaption } from "./reportMapCaptions.ts";
import { MESSAGES } from "./i18n/messages.ts";

const en = MESSAGES.en;

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

function loadProfile(id: string) {
  return JSON.parse(readFileSync(join(ROOT, `data/profiles/${id}.json`), "utf8"));
}

describe("reportMapCaptions", () => {
  it("builds progressive origin caption with defensive-half-only split", () => {
    const profile = loadProfile("902029");
    const caption = buildReportMapCaption("report_progressive_origin", profile, en);

    assert.ok(caption.stats.some((line) => line.includes("9.7 prog /90")));
    assert.ok(caption.stats.some((line) => line.includes("45.9% from defensive half")));
    assert.ok(!caption.stats.some((line) => line.includes("attacking half")));
    assert.ok(!caption.stats.some((line) => line.includes("construction")));
    assert.ok(caption.stats.some((line) => line.includes("P84 in league")));
  });

  it("builds destination caption with penalty-area share", () => {
    const profile = loadProfile("902029");
    const caption = buildReportMapCaption("report_progressive_dest", profile, en);

    assert.ok(caption.stats.some((line) => line.includes("23.3% of progressive passes reach final third")));
    assert.ok(caption.stats.some((line) => line.includes("15.2% of progressive passes reach penalty area")));
    assert.ok(caption.stats.some((line) => line.includes("30.0 final-third passes /90")));
    assert.ok(!caption.stats.some((line) => line.includes("Creation xPV")));
  });

  it("builds impact caption with IP FT totals and rate", () => {
    const profile = loadProfile("902029");
    const caption = buildReportMapCaption("report_impact_final_third", profile, en);

    assert.ok(caption.stats.some((line) => line === "IP FT: 29"));
    assert.ok(caption.stats.some((line) => line.includes("Impact Passes/game: 1.4")));
    assert.ok(caption.stats.some((line) => line === "Impact rate: 6.0%"));
    assert.ok(caption.stats.some((line) => line.includes("Creation xPV /game: 1.65")));
    assert.ok(caption.summary.length > 0);
  });
});
