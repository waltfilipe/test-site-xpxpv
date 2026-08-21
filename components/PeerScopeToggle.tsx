"use client";

import type { PeerScope } from "@/lib/api";
import { useI18n } from "@/lib/i18n/context";

type Props = {
  scope: PeerScope;
  onChange: (scope: PeerScope) => void;
};

export function PeerScopeToggle({ scope, onChange }: Props) {
  const { m } = useI18n();

  return (
    <div className="profile-mode-toggle" role="tablist" aria-label={m.profile.peerScopeToggleLabel}>
      <button
        type="button"
        role="tab"
        aria-selected={scope === "pool"}
        className={`profile-mode-btn${scope === "pool" ? " is-active" : ""}`}
        onClick={() => onChange("pool")}
        title={m.profile.peerScopePoolTip}
      >
        {m.profile.peerScopePool}
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={scope === "league"}
        className={`profile-mode-btn${scope === "league" ? " is-active" : ""}`}
        onClick={() => onChange("league")}
        title={m.profile.peerScopeLeagueTip}
      >
        {m.profile.peerScopeLeague}
      </button>
    </div>
  );
}
