import type { PitchCorridorGuide } from "@/lib/api";

type Props = {
  guides: PitchCorridorGuide[];
};

export function PitchCorridorGuides({ guides }: Props) {
  if (!guides.length) return null;

  return (
    <div className="corridor-guides" aria-hidden="true">
      {guides.map((guide) => (
        <div
          key={guide.corridor}
          className={`corridor-guide corridor-guide--${guide.tone}`}
          style={{
            left: `${guide.left_pct}%`,
            top: `${guide.top_pct}%`,
            width: `${guide.width_pct}%`,
            height: `${guide.height_pct}%`,
          }}
        />
      ))}
    </div>
  );
}
