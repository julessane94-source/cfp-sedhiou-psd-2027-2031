"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import Sidebar from "@/components/layout/Sidebar";

export default function AppShell({
  children,
}: {
  children: ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="app-shell">
      {menuOpen && (
        <button
          className="mobile-overlay"
          aria-label="Fermer le menu"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <div className={menuOpen ? "sidebar-wrapper menu-open" : "sidebar-wrapper"}>
        <Sidebar />
      </div>

      <main className="app-content">
        <header className="topbar">
          <div className="topbar-brand">
            <strong>Plateforme de gestion</strong>
            <span>Administration · CFP Sédhiou</span>
          </div>

          <button
            type="button"
            className="mobile-menu"
            onClick={() => setMenuOpen((value) => !value)}
            aria-label="Ouvrir le menu"
          >
            <span>{menuOpen ? "×" : "☰"}</span>
            {menuOpen ? "Fermer" : "Menu"}
          </button>
        </header>

        <div className="page-content">
          {children}
        </div>
      </main>
    </div>
  );
}
