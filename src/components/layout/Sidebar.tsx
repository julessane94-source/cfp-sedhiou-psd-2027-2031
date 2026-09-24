"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const sections = [
  {
    title: "PRINCIPAL",
    items: [["Tableau de bord", "/dashboard", "⌂"]],
  },
  {
    title: "GESTION",
    items: [
      ["Apprenants", "/apprenants", "🎓"],
      ["Candidatures", "/candidature", "📝"],
      ["Formations", "/formations", "📚"],
      ["Personnel", "/personnel", "👥"],
      ["Insertion", "/insertion", "💼"],
    ],
  },
  {
    title: "ADMINISTRATION",
    items: [
      ["Finances", "/finances", "💰"],
      ["Patrimoine", "/infrastructures", "🏢"],
      ["Sécurité", "/securite", "🛡"],
      ["Documents", "/documents", "📄"],
    ],
  },
  {
    title: "COMMUNICATION",
    items: [
      ["Communication", "/communication", "💬"],
      ["Notifications", "/notifications", "🔔"],
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-logo">CFP</div>

        <div className="brand-text">
          <strong>CFP Sédhiou</strong>
          <span>PSD 2027–2031</span>
        </div>
      </div>

      <nav className="sidebar-menu">
        {sections.map((section) => (
          <div className="menu-section" key={section.title}>
            <div className="menu-section-title">{section.title}</div>

            {section.items.map(([label, href, icon]) => {
              const active =
                pathname === href ||
                (href !== "/dashboard" && pathname.startsWith(`${href}/`));

              return (
                <Link
                  key={href}
                  href={href}
                  className={`nav-link ${active ? "active" : ""}`}
                >
                  <span className="nav-icon">{icon}</span>
                  <span className="nav-label">{label}</span>
                  {active && <span className="nav-arrow">›</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="system-status">
          <span className="status-dot" />
          <div>
            <strong>Système opérationnel</strong>
            <small>Base centrale connectée</small>
          </div>
        </div>

        <div className="sidebar-version">
          CFP Sédhiou · v1.0
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
