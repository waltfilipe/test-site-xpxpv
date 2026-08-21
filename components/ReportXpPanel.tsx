import { PassLengthMix } from "@/components/PassLengthMix";
import { XpProfileBars } from "@/components/XpProfileBars";
import type { PeerScope, PlayerProfile } from "@/lib/api";
import { XpIndicesPanel } from "@/components/XpIndicesPanel";
import { selectProfileView } from "@/lib/profileView";

type Props = {
  profile: PlayerProfile;
  accent?: string;
  expandAll?: boolean;
  peerScope?: PeerScope;
};

export function ReportXpPanel({
  profile,
  accent = "#a78bfa",
  expandAll = false,
  peerScope = "league",
}: Props) {
  const activeView = selectProfileView(profile, "absolute", peerScope);
  const xpBars = activeView.xp_bars;

  return (
    <div className="player-card xp-profile-card report-xp-card">
      <h3 className="section-label">xP Profile</h3>
      <XpProfileBars bars={xpBars} />

      {(profile.xp_indices?.length ?? 0) > 0 && (
        <XpIndicesPanel
          indices={profile.xp_indices ?? []}
          roundGrades={profile.xp_round_grades ?? []}
          accent={accent}
          expandAll={expandAll}
        />
      )}

      <PassLengthMix data={profile} />
    </div>
  );
}
