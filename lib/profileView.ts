import type { PeerScope, PlayerProfile, ProfileViewMode, ProfileViewPayload } from "@/lib/api";

export function profileViewKey(
  mode: ProfileViewMode,
  peerScope: PeerScope,
): keyof NonNullable<PlayerProfile["profile_views"]> {
  if (mode === "relative") {
    return peerScope === "league" ? "relative_league" : "relative";
  }
  return peerScope === "league" ? "absolute_league" : "absolute";
}

export function selectProfileView(
  profile: PlayerProfile,
  mode: ProfileViewMode = "absolute",
  peerScope: PeerScope = "league",
): ProfileViewPayload {
  const key = profileViewKey(mode, peerScope);
  const view = profile.profile_views?.[key];
  if (view) return view;

  if (mode === "absolute" && peerScope === "pool") {
    return {
      mode: "absolute",
      peer_scope: "pool",
      pass_grade: profile.pass_grade_general,
      xp_bars: profile.xp_bars ?? [],
      pass_scores: profile.pass_scores ?? [],
    };
  }

  return {
    mode: "absolute",
    peer_scope: peerScope,
    pass_grade: profile.pass_grade_general,
    xp_bars: profile.xp_bars ?? [],
    pass_scores: profile.pass_scores ?? [],
  };
}
