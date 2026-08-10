"use client";

import { useRouter } from "next/navigation";
import type { CSSProperties } from "react";
import { PROFILE_GROUP_CARDS } from "@/lib/positionFamilies";
import { buildProfileUrl, type ProfileFilterState } from "@/lib/profileParams";

type Props = {
  current: ProfileFilterState;
  counts: Record<string, number>;
};

export function ProfileGroupCards({ current, counts }: Props) {
  const router = useRouter();
  const activeKey = current.position_block ?? "all";
  const activeCard = PROFILE_GROUP_CARDS.find((card) => card.key === activeKey) ?? PROFILE_GROUP_CARDS[0];

  function selectGroup(key: string) {
    if (key === activeKey) return;
    router.push(
      buildProfileUrl({
        position_family: current.position_family,
        position_block: key === "all" ? undefined : key,
        player: undefined,
        search: current.search,
      }),
    );
  }

  return (
    <>
      <section className="reports-category-panel profile-group-panel">
        <div className="reports-category-grid">
          {PROFILE_GROUP_CARDS.map((card) => {
            const isActive = activeKey === card.key;
            const count = counts[card.key] ?? 0;
            return (
              <button
                key={card.key}
                type="button"
                className={`reports-category-card${isActive ? " active" : ""}`}
                style={{ "--category-accent": card.accent } as CSSProperties}
                onClick={() => selectGroup(card.key)}
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
