"use client";

import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./layout/Sidebar";
import ScrollReveal from "./ScrollReveal";

export default function AppShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const isLoginPage = pathname === "/" || pathname === "/connexion";

  if (isLoginPage) {
    return (
      <div className="login-shell">
        <main className="app-content">
          <ScrollReveal>{children}</ScrollReveal>
        </main>
      </div>
    );
  }

  return (
    <div className={`app-shell ${isLoginPage ? "login-shell" : ""}`}>
      <Sidebar
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      />

      <div
        className={`sidebar-overlay ${menuOpen ? "is-visible" : ""}`}
        onClick={() => setMenuOpen(false)}
      />

      <div className="app-main">
        <header className="mobile-header">
          <div className="mobile-brand">
            <img
              src="/logo-cfp-sedhiou.svg"
              alt="Logo CFP Sédhiou"
              className="mobile-logo"
            />
            <div>
              <strong>CFP Sédhiou</strong>
              <span>Plateforme de gestion</span>
            </div>
          </div>

          <button
            type="button"
            className={`mobile-menu-button ${menuOpen ? "is-open" : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={menuOpen}
          >
            <span className="hamburger-line" />
            <span className="hamburger-line" />
            <span className="hamburger-line" />
          </button>
        </header>

        <main className="app-content"><ScrollReveal>{children}</ScrollReveal></main>
      </div>
    </div>
  );
}
