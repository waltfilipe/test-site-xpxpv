import { PassLengthMix } from "@/components/PassLengthMix";
import { XpProfileBars } from "@/components/XpProfileBars";
import type { PlayerProfile } from "@/lib/api";
import { XpIndicesPanel } from "@/components/XpIndicesPanel";

type Props = {
  profile: PlayerProfile;
  accent?: string;
  expandAll?: boolean;
};

export function ReportXpPanel({ profile, accent = "#a78bfa", expandAll = false }: Props) {
  return (
    <div className="player-card xp-profile-card report-xp-card">
      <h3 className="section-label">xP Profile</h3>
      <XpProfileBars
        bars={profile.xp_bars}
        productivity={{
          geralDisplay: profile.prod_geral_display,
          relDisplay: profile.prod_rel_display,
          relGap: profile.prod_rel_xpv,
          xpvPerGame: profile.prod_xpv_per_game,
          xpvExpected: profile.prod_xpv_expected,
        }}
        precision={{
          blend: profile.prec_grade_blend,
        }}
        lethality={{
          blend: profile.leth_grade_blend,
          xpv: profile.leth_grade_xpv,
          threat: profile.leth_grade_threat,
        }}
      />

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
