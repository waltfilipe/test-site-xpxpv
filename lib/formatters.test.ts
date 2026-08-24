import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatDominantFoot, formatPlayerHeight } from "./formatters.ts";

describe("formatters identity", () => {
  it("normalizes player heights and rejects invalid values", () => {
    assert.equal(formatPlayerHeight("1.80 m (5 ft 11 in)"), "1.80 m");
    assert.equal(formatPlayerHeight("185 cm"), "1.85 m");
    assert.equal(formatPlayerHeight("174 cm"), "1.74 m");
    assert.equal(formatPlayerHeight("2 cm"), null);
    assert.equal(formatPlayerHeight(null), null);
  });

  it("normalizes dominant foot labels", () => {
    assert.equal(formatDominantFoot("right"), "Right");
    assert.equal(formatDominantFoot("Left foot"), "Left");
    assert.equal(formatDominantFoot("both"), "Both");
  });
});
