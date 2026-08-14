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
          gradeGeral: profile.prod_grade_geral,
          gradeExpected: profile.prod_grade_expected ?? profile.prod_grade_rel,
          gradeGap: profile.prod_rel_gap,
          relGap: profile.prod_rel_xpv,
          relLiftBadge: profile.prod_rel_lift_badge,
          relGapPoolMean: profile.prod_rel_gap_pool_mean,
          relGapPoolP70: profile.prod_rel_gap_pool_p70,
          xpvPerGame: profile.prod_xpv_per_game,
          xpvExpected: profile.prod_xpv_expected,
        }}
        precision={{
          gradeGeral: profile.prec_grade_geral,
          gradeExpected: profile.prec_grade_expected ?? profile.prec_grade_stratum,
          coePerPass: profile.prec_coe_per_pass,
          stratumGap: profile.prec_stratum_gap,
          stratumLiftBadge: profile.prec_stratum_lift_badge,
          stratumGapPoolMean: profile.prec_stratum_gap_pool_mean,
          stratumGapPoolP70: profile.prec_stratum_gap_pool_p70,
          expectedPct:
            typeof profile.player?.xpass_expected_pct === "number"
              ? profile.player.xpass_expected_pct
              : null,
          completionPct:
            typeof profile.player?.pass_completion_pct === "number"
              ? profile.player.pass_completion_pct
              : null,
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
