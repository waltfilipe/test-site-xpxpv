import assert from "node:assert/strict";
import test from "node:test";

// Mirror PassLengthMix origin resolution for regression coverage.
function resolveOffensiveOriginPct(data: {
  midfield_offensive_origin_pct?: number | null;
  defensive_origin_pct?: number | null;
  player?: Record<string, unknown>;
  xp?: Record<string, unknown>;
}): number | null {
  const direct =
    data.midfield_offensive_origin_pct
    ?? data.player?.midfield_offensive_origin_pct
    ?? data.xp?.midfield_offensive_origin_pct;
  if (direct != null && Number.isFinite(Number(direct))) {
    return Number(direct);
  }
  if (data.defensive_origin_pct != null && Number.isFinite(data.defensive_origin_pct)) {
    return Math.round((100 - Number(data.defensive_origin_pct)) * 10) / 10;
  }
  return null;
}

test("pass location marker uses attacking share for offensive-heavy players", () => {
  const offensive = resolveOffensiveOriginPct({ midfield_offensive_origin_pct: 69.1 });
  assert.equal(offensive, 69.1);
  assert.equal(100 - offensive!, 30.9);
});

test("pass location marker falls back from defensive share when needed", () => {
  const offensive = resolveOffensiveOriginPct({ defensive_origin_pct: 30.9 });
  assert.equal(offensive, 69.1);
});
