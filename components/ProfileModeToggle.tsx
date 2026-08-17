"use client";

import type { ProfileViewMode } from "@/lib/api";
import { useI18n } from "@/lib/i18n/context";

type Props = {
  mode: ProfileViewMode;
  onChange: (mode: ProfileViewMode) => void;
};

export function ProfileModeToggle({ mode, onChange }: Props) {
  const { m } = useI18n();

  return (
    <div className="profile-mode-toggle" role="tablist" aria-label={m.profile.modeToggleLabel}>
      <button
        type="button"
        role="tab"
        aria-selected={mode === "absolute"}
        className={`profile-mode-btn${mode === "absolute" ? " is-active" : ""}`}
        onClick={() => onChange("absolute")}
      >
        {m.profile.modeAbsolute}
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={mode === "relative"}
        className={`profile-mode-btn${mode === "relative" ? " is-active" : ""}`}
        onClick={() => onChange("relative")}
      >
        {m.profile.modeRelative}
      </button>
    </div>
  );
}
