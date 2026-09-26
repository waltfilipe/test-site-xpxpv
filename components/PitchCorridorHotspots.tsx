import type { ReactNode } from "react";
import { Tooltip } from "@/components/ui/Tooltip";
import type { AttThirdCorridorCount, PitchCorridor, PitchCorridorGuide } from "@/lib/api";

type Props = {
  guides: PitchCorridorGuide[];
  counts?: Partial<Record<PitchCorridor, AttThirdCorridorCount>>;
  interactive?: boolean;
  selected?: PitchCorridor | null;
  onSelect?: (corridor: PitchCorridor) => void;
  tooltipFor?: (corridor: PitchCorridor, stat: AttThirdCorridorCount | undefined) => ReactNode;
  labelFor?: (corridor: PitchCorridor) => string;
  showCountBadge?: boolean;
};

export function PitchCorridorHotspots({
  guides,
  counts,
  interactive = false,
  selected = null,
  onSelect,
  tooltipFor,
  labelFor,
  showCountBadge = false,
}: Props) {
  if (!guides.length) return null;

  return (
    <div className={`corridor-guides${interactive ? " corridor-guides--interactive" : ""}`} aria-hidden={!interactive}>
      {guides.map((guide) => {
        const stat = counts?.[guide.corridor];
        const isSelected = selected === guide.corridor;
        const inner = (
          <>
            {showCountBadge && stat != null && (
              <span className="corridor-count-badge">{stat.passes.toLocaleString()}</span>
            )}
          </>
        );

        const hitbox = interactive ? (
          <button
            type="button"
            className="corridor-hitbox"
            aria-pressed={isSelected}
            aria-label={labelFor?.(guide.corridor) ?? guide.corridor}
            onClick={() => onSelect?.(guide.corridor)}
          >
            {inner}
          </button>
        ) : (
          <span className="corridor-hitbox corridor-hitbox--static" role="img" aria-label={labelFor?.(guide.corridor)}>
            {inner}
          </span>
        );

        const wrapped =
          tooltipFor != null ? (
            <Tooltip content={tooltipFor(guide.corridor, stat)} block>
              {hitbox}
            </Tooltip>
          ) : (
            hitbox
          );

        return (
          <div
            key={guide.corridor}
            className={`corridor-guide corridor-guide--${guide.tone}${isSelected ? " is-selected" : ""}`}
            style={{
              left: `${guide.left_pct}%`,
              top: `${guide.top_pct}%`,
              width: `${guide.width_pct}%`,
              height: `${guide.height_pct}%`,
            }}
          >
            {wrapped}
          </div>
        );
      })}
    </div>
  );
}
