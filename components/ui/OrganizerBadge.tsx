"use client";

import { Tooltip } from "@/components/ui/Tooltip";
import { useI18n } from "@/lib/i18n/context";

type Props = {
  show?: boolean;
};

export function OrganizerBadge({ show = true }: Props) {
  const { m } = useI18n();
  if (!show) return null;

  return (
    <Tooltip content={m.badges.organizerTooltip} block>
      <div className="organizer-badge-wrap">
        <span className="organizer-badge" aria-label={m.badges.organizer}>
          <i className="fa-solid fa-chess-board" aria-hidden="true" />
          <span>{m.badges.organizer}</span>
        </span>
      </div>
    </Tooltip>
  );
}
