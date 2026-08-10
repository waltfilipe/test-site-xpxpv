"use client";

import { useRouter } from "next/navigation";
import type { CSSProperties } from "react";
import { PLAYER_REPORT_CATEGORIES } from "@/lib/playerReports";
import { buildProfileUrl, type ProfileFilterState } from "@/lib/profileParams";

type Props = {
  current: ProfileFilterState;
  counts: Record<string, number>;
};

const DEFAULT_GROUP = PLAYER_REPORT_CATEGORIES[0]?.id ?? "u23-breakout";

export function ProfileGroupCards({ current, counts }: Props) {
  const router = useRouter();
  const activeKey = current.profile_group ?? DEFAULT_GROUP;
  const activeCard =
    PLAYER_REPORT_CATEGORIES.find((card) => card.id === activeKey) ??
    PLAYER_REPORT_CATEGORIES[0];

  function selectGroup(id: string) {
    if (id === activeKey) return;
    router.push(
      buildProfileUrl({
        position_family: current.position_family,
        profile_group: id,
        player: undefined,
        search: current.search,
      }),
    );
  }

  return (
    <>
      <section className="reports-category-panel profile-group-panel">
        <div className="reports-category-grid">
          {PLAYER_REPORT_CATEGORIES.map((card) => {
            const isActive = activeKey === card.id;
            const count = counts[card.id] ?? 0;
            return (
              <button
                key={card.id}
                type="button"
                className={`reports-category-card${isActive ? " active" : ""}`}
                style={{ "--category-accent": card.accent } as CSSProperties}
                onClick={() => selectGroup(card.id)}
              >
                <span className="reports-category-card-eyebrow">{card.subtitle}</span>
                <strong className="reports-category-card-title">{card.title}</strong>
                <p className="reports-category-card-desc">{card.description}</p>
                <div className="reports-category-card-foot">
                  <span className="reports-category-card-count tabular">{count} atletas</span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {activeCard && (
        <div className="reports-active-banner profile-group-banner">
          <div>
            <span className="reports-active-eyebrow">Grupo selecionado</span>
            <h2 style={{ color: activeCard.accent }}>{activeCard.title}</h2>
            <p className="muted">{activeCard.description}</p>
          </div>
        </div>
      )}
    </>
  );
}
