"use client";

import { Tooltip } from "@/components/ui/Tooltip";
import { useI18n } from "@/lib/i18n/context";
import type { ProfileCluster } from "@/lib/api";

type Props = {
  cluster?: ProfileCluster | null;
};

export function ProfileClusterCard({ cluster }: Props) {
  const { m, locale } = useI18n();

  if (!cluster?.key) return null;

  const title = locale === "pt" ? cluster.title_pt : cluster.title_en;
  const summary = locale === "pt" ? cluster.summary_pt : cluster.summary_en;
  const tip = m.profile.clusterTip.replace("{pct}", String(cluster.pool_pct ?? "—"));

  return (
    <Tooltip content={tip} block>
      <div
        className="profile-cluster-card"
        style={{
          borderColor: `${cluster.accent ?? "var(--accent)"}44`,
          boxShadow: `inset 0 1px 0 ${cluster.accent ?? "var(--accent)"}18`,
        }}
      >
        <div className="profile-cluster-head">
          <span className="section-label">{m.sections.passProfileCluster}</span>
        </div>
        <div className="profile-cluster-body">
          <span
            className="profile-cluster-icon"
            style={{ color: cluster.accent ?? "var(--accent)" }}
            aria-hidden="true"
          >
            <i className={`fa-solid ${cluster.icon ?? "fa-fingerprint"}`} />
          </span>
          <div className="profile-cluster-copy">
            <p className="profile-cluster-title">{title ?? cluster.key}</p>
            <p className="profile-cluster-summary">{summary}</p>
          </div>
        </div>
      </div>
    </Tooltip>
  );
}
