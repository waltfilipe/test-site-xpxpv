"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useI18n } from "@/lib/i18n/context";

export function SiteHeader() {
  const { m } = useI18n();
  const pathname = usePathname();
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    setNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.classList.toggle("site-nav-open", navOpen);
    return () => {
      document.body.classList.remove("site-nav-open");
    };
  }, [navOpen]);

  return (
    <header className={`site-header${navOpen ? " site-header--nav-open" : ""}`}>
      <div className="container site-header-inner">
        <Link href="/" className="brand">
          <span className="brand-icon">
            <i className="fa-solid fa-futbol" />
          </span>
          {m.brand.nameMain}<span>{m.brand.nameAccent}</span>
        </Link>
        <button
          type="button"
          className="nav-toggle"
          aria-expanded={navOpen}
          aria-controls="site-primary-nav"
          onClick={() => setNavOpen((open) => !open)}
        >
          <i className={`fa-solid ${navOpen ? "fa-xmark" : "fa-bars"}`} aria-hidden="true" />
          <span>{navOpen ? m.nav.closeMenu : m.nav.openMenu}</span>
        </button>
        <nav id="site-primary-nav" className="nav" aria-label={m.nav.primary}>
          <Link href="/">{m.nav.home}</Link>
          <Link href="/profile">{m.nav.profile}</Link>
          <Link href="/compare">{m.nav.compare}</Link>
          <Link href="/maps">{m.nav.maps}</Link>
          <Link href="/players">{m.nav.players}</Link>
          <Link href="/reports" className="nav-link-featured">{m.nav.reports}</Link>
          <LanguageToggle />
        </nav>
      </div>
      {navOpen ? (
        <button
          type="button"
          className="nav-backdrop"
          aria-label={m.nav.closeMenu}
          onClick={() => setNavOpen(false)}
        />
      ) : null}
    </header>
  );
}
