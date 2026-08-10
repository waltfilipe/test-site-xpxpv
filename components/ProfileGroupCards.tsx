"use client";

import { useRouter } from "next/navigation";
import type { CSSProperties } from "react";
import { PLAYER_REPORT_CATEGORIES, PROFILE_ALL_GROUP } from "@/lib/playerReports";
import { buildProfileUrl, type ProfileFilterState } from "@/lib/profileParams";
import { useI18n } from "@/lib/i18n/context";

type Props = {
  current: ProfileFilterState;
  counts: Record<string, number>;
};

export function ProfileGroupCards({ current, counts }: Props) {
  const router = useRouter();
  const { m } = useI18n();
  const activeKey = current.profile_group ?? PROFILE_ALL_GROUP.id;
  const activeCategory = PLAYER_REPORT_CATEGORIES.find((card) => card.id === activeKey);
  const isAllActive = activeKey === PROFILE_ALL_GROUP.id;
  const allCategory = m.profileCategories.all;
  const activeMeta = isAllActive ? allCategory : m.profileCategories[activeKey];

  function selectGroup(id: string) {
    if (id === activeKey) return;
    router.push(
      buildProfileUrl({
        position_family: current.position_family,
        profile_group: id === PROFILE_ALL_GROUP.id ? undefined : id,
        player: undefined,
        search: current.search,
      }),
    );
  }

  const bannerTitle = activeMeta?.title;
  const bannerDescription = activeMeta?.description;
  const bannerAccent = isAllActive ? PROFILE_ALL_GROUP.accent : activeCategory?.accent;

  return (
    <>
      <section className="reports-category-panel profile-group-panel">
        <button
          type="button"
          className={`reports-category-card profile-group-all-card${isAllActive ? " active" : ""}`}
          style={{ "--category-accent": PROFILE_ALL_GROUP.accent } as CSSProperties}
          onClick={() => selectGroup(PROFILE_ALL_GROUP.id)}
        >
          <div className="profile-group-all-main">
            <span className="reports-category-card-eyebrow">{allCategory.subtitle}</span>
            <strong className="reports-category-card-title profile-group-all-title">
              {allCategory.title}
            </strong>
          </div>
          <span className="reports-category-card-count tabular profile-group-all-count">
            {counts[PROFILE_ALL_GROUP.id] ?? 0} {m.common.athletes}
          </span>
        </button>

        <div className="reports-category-grid profile-group-age-grid">
          {PLAYER_REPORT_CATEGORIES.map((card) => {
            const isActive = activeKey === card.id;
            const count = counts[card.id] ?? 0;
            const meta = m.profileCategories[card.id];
            return (
              <button
                key={card.id}
                type="button"
                className={`reports-category-card${isActive ? " active" : ""}`}
                style={{ "--category-accent": card.accent } as CSSProperties}
                onClick={() => selectGroup(card.id)}
              >
                <span className="reports-category-card-eyebrow">{meta.subtitle}</span>
                <strong className="reports-category-card-title">{meta.title}</strong>
                <p className="reports-category-card-desc">{meta.description}</p>
                <div className="reports-category-card-foot">
                  <span className="reports-category-card-count tabular">{count} {m.common.athletes}</span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {bannerTitle && (
        <div className="reports-active-banner profile-group-banner">
          <div>
            <span className="reports-active-eyebrow">{m.common.selectedGroup}</span>
            <h2 style={{ color: bannerAccent }}>{bannerTitle}</h2>
            <p className="muted">{bannerDescription}</p>
          </div>
        </div>
      )}
    </>
  );
}
