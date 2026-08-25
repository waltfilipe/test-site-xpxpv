"use client";

import { Tooltip } from "@/components/ui/Tooltip";
import type { PlayerBadgeKey } from "@/lib/playerBadges";
import { PLAYER_BADGE_CATALOG, sortPlayerBadges } from "@/lib/playerBadges";
import { useI18n } from "@/lib/i18n/context";

type Props = {
  badges?: PlayerBadgeKey[] | null;
  compact?: boolean;
};

export function ProfileBadgesCard({ badges, compact = false }: Props) {
  const { m } = useI18n();
  const ordered = sortPlayerBadges(badges ?? []);
  const shellClass = compact ? "profile-badges-card profile-badges-inline" : "profile-badges-card";

  return (
    <div className={shellClass}>
      <div className="profile-badges-head">
        <span className="section-label">{m.sections.badges}</span>
      </div>
      {ordered.length > 0 ? (
        <div className="profile-badges-list" role="list">
          {ordered.map((key) => {
            const spec = PLAYER_BADGE_CATALOG[key];
            const copy = m.profileBadges[key];
            return (
              <Tooltip key={key} content={copy.tooltip}>
                <div
                  className={`profile-badge-tile profile-badge-tile-${key}`}
                  role="listitem"
                  style={{
                    borderColor: `${spec.accent}55`,
                    background: `linear-gradient(145deg, ${spec.accent}22 0%, ${spec.accent}10 100%)`,
                    boxShadow: `inset 0 1px 0 ${spec.accent}24`,
                  }}
                  aria-label={copy.label}
                >
                  <span className="profile-badge-icon" style={{ color: spec.accent }} aria-hidden="true">
                    <i className={`fa-solid ${spec.icon}`} />
                  </span>
                  <span className="profile-badge-label">{copy.label}</span>
                </div>
              </Tooltip>
            );
          })}
        </div>
      ) : (
        <p className="profile-badges-empty">{m.profileBadges.empty}</p>
      )}
    </div>
  );
}
