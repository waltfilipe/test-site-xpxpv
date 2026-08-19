"use client";

import { Tooltip } from "@/components/ui/Tooltip";
import { useI18n } from "@/lib/i18n/context";
import type { ProfileCluster } from "@/lib/api";

type Props = {
  cluster?: ProfileCluster | null;
  compact?: boolean;
};

export function ProfileClusterCard({ cluster, compact = false }: Props) {
  const { m, locale } = useI18n();

  if (!cluster?.key) return null;

  const title = locale === "pt" ? cluster.title_pt : cluster.title_en;
  const summary = locale === "pt" ? cluster.summary_pt : cluster.summary_en;
  const tip = m.profile.clusterTip.replace("{pct}", String(cluster.pool_pct ?? "—"));

  const shellClass = compact
    ? "profile-cluster-inline"
    : "profile-cluster-card";

  return (
    <Tooltip content={tip} block>
      <div
        className={shellClass}
        style={
          compact
            ? undefined
            : {
                borderColor: `${cluster.accent ?? "var(--accent)"}44`,
                boxShadow: `inset 0 1px 0 ${cluster.accent ?? "var(--accent)"}18`,
              }
        }
      >
        {!compact && (
          <div className="profile-cluster-head">
            <span className="section-label">{m.sections.passProfileCluster}</span>
          </div>
        )}
        <div className="profile-cluster-body">
          <span
            className="profile-cluster-icon"
            style={{ color: cluster.accent ?? "var(--accent)" }}
            aria-hidden="true"
          >
            <i className={`fa-solid ${cluster.icon ?? "fa-fingerprint"}`} />
          </span>
          <div className="profile-cluster-copy">
            {compact && (
              <span className="profile-cluster-eyebrow">{m.sections.passProfileCluster}</span>
            )}
            <p className="profile-cluster-title">{title ?? cluster.key}</p>
            <p className="profile-cluster-summary">{summary}</p>
          </div>
        </div>
      </div>
    </Tooltip>
  );
}
