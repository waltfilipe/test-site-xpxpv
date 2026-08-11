"use client";

import Link from "next/link";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useI18n } from "@/lib/i18n/context";

export function SiteHeader() {
  const { m } = useI18n();

  return (
    <header className="site-header">
      <div className="container">
        <Link href="/" className="brand">
          <span className="brand-icon">
            <i className="fa-solid fa-futbol" />
          </span>
          Pass<span>Scout</span>
        </Link>
        <nav className="nav">
          <Link href="/profile">{m.nav.profile}</Link>
          <Link href="/compare">{m.nav.compare}</Link>
          <Link href="/maps">{m.nav.maps}</Link>
          <Link href="/players">{m.nav.players}</Link>
          <Link href="/reports" className="nav-link-featured">{m.nav.reports}</Link>
          <LanguageToggle />
        </nav>
      </div>
    </header>
  );
}
