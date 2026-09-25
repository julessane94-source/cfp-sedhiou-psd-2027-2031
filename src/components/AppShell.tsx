import Link from "next/link";
import type { ReactNode } from "react";

const modules = [
  ["Dashboard", "/dashboard", "⌂"],
  ["Apprenants", "/apprenants", "🎓"],
  ["Candidatures", "/candidature", "📋"],
  ["Formations", "/formations", "📚"],
  ["Personnel", "/personnel", "👥"],
  ["Finances", "/finances", "💰"],
  ["Infrastructures", "/infrastructures", "🏢"],
  ["Sécurité", "/securite", "🛡"],
  ["Insertion", "/insertion", "🚀"],
  ["Stages", "/stages", "💼"],
  ["Entrepreneuriat", "/entrepreneuriat", "📈"],
  ["Partenaires", "/partenaires", "🤝"],
  ["Communication", "/communication", "💬"],
  ["Documents", "/documents", "📄"],
  ["Notifications", "/notifications", "🔔"],
];

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo">CFP</div>
          <div>
            <strong>CFP Sédhiou</strong>
            <span>PSD 2027–2031</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {modules.map(([label, href, icon]) => (
            <Link key={href} href={href} className="nav-link">
              <span className="nav-icon">{icon}</span>
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <span className="status-dot" />
          Système opérationnel
        </div>
      </aside>

      <main className="app-content">
        <header className="topbar">
          <div className="topbar-title">
            <strong>Plateforme de gestion</strong>
            <span>Administration · CFP Sédhiou</span>
          </div>

          <details className="mobile-menu">
            <summary>
              <span>☰</span>
              Menu
            </summary>

            <div className="mobile-menu-panel">
              {modules.map(([label, href, icon]) => (
                <Link key={href} href={href} className="mobile-nav-link">
                  <span>{icon}</span>
                  {label}
                </Link>
              ))}
            </div>
          </details>
        </header>

        <div className="page-content">{children}</div>
      </main>
    </div>
  );
}
