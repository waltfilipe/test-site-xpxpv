"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";

type Meta = {
  player_count: number;
  description: string;
  leagues: string[];
};

const MODULE_KEYS = ["reports", "profile", "compare", "maps", "players"] as const;
const MODULE_ICONS = {
  reports: "fa-file-lines",
  profile: "fa-user",
  compare: "fa-scale-balanced",
  maps: "fa-map-location-dot",
  players: "fa-table-list",
} as const;
const MODULE_ACCENTS = {
  reports: "#a78bfa",
  profile: "#38bdf8",
  compare: "#34d399",
  maps: "#fbbf24",
  players: "#94a3b8",
} as const;
const MODULE_HREFS = {
  reports: "/reports",
  profile: "/profile",
  compare: "/compare",
  maps: "/maps",
  players: "/players",
} as const;

export function HomeContent({ meta }: { meta: Meta }) {
  const { m } = useI18n();

  return (
    <div className="container home-page">
      <section className="home-intro">
        <p className="home-eyebrow">{m.home.eyebrow}</p>
        <h1 className="home-title">
          Pass<span>Scout</span>
        </h1>
        <p className="home-lead">{m.home.lead}</p>
        <div className="home-stats">
          <span className="home-stat">
            <strong className="tabular">{meta.player_count || "—"}</strong> {m.home.playersStat}
          </span>
          <span className="home-stat-sep" aria-hidden="true" />
          <span className="home-stat">
            <strong>{meta.leagues.length || 5}</strong> {m.home.leaguesStat}
          </span>
          <span className="home-stat-sep" aria-hidden="true" />
          <span className="home-stat">
            <strong>xP</strong> {m.home.modelStat}
          </span>
        </div>
      </section>

      <nav className="home-modules" aria-label={m.home.modulesAria}>
        {MODULE_KEYS.map((key) => {
          const mod = m.home.modules[key];
          const featured = key === "reports";
          return (
            <Link
              key={key}
              href={MODULE_HREFS[key]}
              className={`home-module-card${featured ? " home-module-featured" : ""}`}
              style={{ "--module-accent": MODULE_ACCENTS[key] } as React.CSSProperties}
            >
              <span className="home-module-icon" aria-hidden="true">
                <i className={`fa-solid ${MODULE_ICONS[key]}`} />
              </span>
              <span className="home-module-body">
                <span className="home-module-title">{mod.title}</span>
                <span className="home-module-desc">{mod.description}</span>
              </span>
              <span className="home-module-arrow" aria-hidden="true">
                <i className="fa-solid fa-arrow-right" />
              </span>
            </Link>
          );
        })}
      </nav>

      <p className="home-footnote muted">{meta.description || m.home.footnote}</p>
    </div>
  );
}
