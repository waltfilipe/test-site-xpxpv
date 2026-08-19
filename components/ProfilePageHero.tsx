"use client";

import { useI18n } from "@/lib/i18n/context";

export function ProfilePageHero() {
  const { m } = useI18n();

  return (
    <header className="profile-page-hero profile-page-hero-compact">
      <div className="container profile-page-hero-inner">
        <div className="profile-page-hero-copy">
          <span className="profile-page-eyebrow">{m.brand.name}</span>
          <div className="profile-page-hero-headline">
            <h1>{m.nav.profile}</h1>
            <p className="profile-page-hero-lead">{m.profile.pageLead}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
