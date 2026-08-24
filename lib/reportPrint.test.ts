import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { REPORT_MAP_FILTER_KEYS } from "./reportMapKeys.ts";
import {
  REPORT_MAPS_PER_PLAYER,
  REPORT_PAGES_PER_PLAYER,
  buildReportPdfFilename,
  sheetsPerPrintJob,
} from "./reportPrint.ts";

describe("reportPrint", () => {
  it("expects two pages per player", () => {
    assert.equal(REPORT_PAGES_PER_PLAYER, 2);
    assert.equal(sheetsPerPrintJob(3), 6);
    assert.equal(sheetsPerPrintJob(0), 0);
  });

  it("expects the report map trio used by Reports and Compare", () => {
    assert.equal(REPORT_MAPS_PER_PLAYER, 3);
    assert.deepEqual([...REPORT_MAP_FILTER_KEYS], [
      "report_progressive_origin",
      "report_progressive_dest",
      "report_impact_final_third",
    ]);
  });

  it("builds the default PDF filename from player name and rating", () => {
    assert.equal(buildReportPdfFilename("Pedri", 8.42), "Pedri - 8.4 - Pass Report");
    assert.equal(buildReportPdfFilename("Vitinha", null), "Vitinha - — - Pass Report");
    assert.equal(
      buildReportPdfFilename('Player: "A"/B', 7),
      'Player- -A--B - 7.0 - Pass Report',
    );
  });
});
