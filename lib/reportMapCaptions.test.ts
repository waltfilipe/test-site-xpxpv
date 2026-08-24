import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { buildReportMapCaption } from "./reportMapCaptions.ts";
import { MESSAGES } from "./i18n/messages.ts";

const en = MESSAGES.en;

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("reportMapCaptions", () => {
  it("builds progressive origin caption from profile data", () => {
    const profile = JSON.parse(
      readFileSync(join(ROOT, "data/profiles/992587.json"), "utf8"),
    );

    const caption = buildReportMapCaption("report_progressive_origin", profile, en);

    assert.ok(caption.stats.length >= 3);
    assert.match(caption.stats[0]!, /7\.7 prog \/90/);
    assert.ok(caption.summary.length > 0);
  });

  it("builds impact caption with threat and creation stats", () => {
    const profile = JSON.parse(
      readFileSync(join(ROOT, "data/profiles/992587.json"), "utf8"),
    );

    const caption = buildReportMapCaption("report_impact_final_third", profile, en);

    assert.ok(caption.stats.some((line) => line.includes("Impact rate")));
    assert.ok(caption.stats.some((line) => line.includes("key passes")));
  });
});
