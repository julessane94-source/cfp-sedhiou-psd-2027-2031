"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
};

type MenuItem = {
  label: string;
  href: string;
  icon: string;
};

type MenuGroup = {
  title: string;
  items: MenuItem[];
};

const allGroups: MenuGroup[] = [
  {
    title: "Accueil",
    items: [
      {
        label: "Tableau de bord",
        href: "/dashboard",
        icon: "▦",
      },
    ],
  },
  {
    title: "Formation & insertion",
    items: [
      {
        label: "Apprenants",
        href: "/apprenants",
        icon: "👥",
      },
      {
        label: "Candidatures",
        href: "/candidature",
        icon: "📝",
      },
      {
        label: "Formations",
        href: "/formations",
        icon: "🎓",
      },
      {
        label: "Stages",
        href: "/stages",
        icon: "💼",
      },
      {
        label: "Insertion",
        href: "/insertion",
        icon: "🎯",
      },
      {
        label: "Entrepreneuriat",
        href: "/entrepreneuriat",
        icon: "🚀",
      },
    ],
  },
  {
    title: "Administration",
    items: [
      {
        label: "Personnel",
        href: "/personnel",
        icon: "👤",
      },
      {
        label: "Partenaires",
        href: "/partenaires",
        icon: "🤝",
      },
      {
        label: "Communication",
        href: "/communication",
        icon: "💬",
      },
      {
        label: "Documents",
        href: "/documents",
        icon: "📄",
      },
      {
        label: "Notifications",
        href: "/notifications",
        icon: "🔔",
      },
    ],
  },
  {
    title: "Gestion & contrôle",
    items: [
      {
        label: "Finances",
        href: "/finances",
        icon: "💰",
      },
      {
        label: "Patrimoine",
        href: "/infrastructures",
        icon: "🏢",
      },
      {
        label: "Sécurité",
        href: "/securite",
        icon: "🛡",
      },
    ],
  },
];

const roleMenus: Record<string, string[]> = {
  DIRECTEUR: [
    "/dashboard",
    "/apprenants",
    "/candidature",
    "/formations",
    "/stages",
    "/insertion",
    "/entrepreneuriat",
    "/personnel",
    "/partenaires",
    "/communication",
    "/documents",
    "/notifications",
    "/finances",
    "/infrastructures",
    "/securite",
  ],

  GESTIONNAIRE: [
    "/dashboard",
    "/apprenants",
    "/candidature",
    "/formations",
    "/stages",
    "/insertion",
    "/entrepreneuriat",
    "/partenaires",
    "/communication",
    "/documents",
    "/notifications",
    "/infrastructures",
  ],

  COMPTABLE_MATIERES: [
    "/dashboard",
    "/infrastructures",
    "/documents",
    "/notifications",
  ],

  CHEF_TRAVAUX: [
    "/dashboard",
    "/formations",
    "/apprenants",
    "/stages",
    "/infrastructures",
    "/documents",
    "/notifications",
  ],

  SURVEILLANT: [
    "/dashboard",
    "/apprenants",
    "/stages",
    "/notifications",
  ],

  FORMATEUR: [
    "/dashboard",
    "/formations",
    "/apprenants",
    "/stages",
    "/documents",
    "/notifications",
  ],
};

function normalizeRole(role: string) {
  return role
    .toUpperCase()
    .trim()
    .replace(/\s+/g, "_");
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      try {
        const response = await fetch("/api/auth/me", {
          cache: "no-store",
        });

        if (!response.ok) {
          if (!cancelled) {
            setUser(null);
          }
          return;
        }

        const data = await response.json();

        if (!cancelled) {
          setUser(data.user ?? null);
        }
      } catch (error) {
        console.error("Chargement utilisateur:", error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadUser();

    return () => {
      cancelled = true;
    };
  }, []);

  const visibleGroups = useMemo(() => {
    if (!user) {
      return [];
    }

    const role = normalizeRole(user.role);
    const allowed = roleMenus[role];

    // Si le rôle n'est pas encore déclaré dans la configuration,
    // on garde uniquement le tableau de bord.
    const allowedRoutes = new Set(
      allowed ?? ["/dashboard"]
    );

    return allGroups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) =>
          allowedRoutes.has(item.href)
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [user]);

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } catch (error) {
      console.error("Déconnexion:", error);
    } finally {
      router.push("/connexion");
      router.refresh();
    }
  }

  const fullName = user
    ? `${user.firstName} ${user.lastName}`.trim()
    : "Utilisateur";

  return (
    <>
      <div
        className={`sidebar-overlay ${open ? "is-visible" : ""}`}
        onClick={onClose}
      />

      <aside className={`sidebar ${open ? "is-open" : ""}`}>
        <div className="sidebar-brand">
          <div className="brand-logo">
            <Image
              src="/logo-cfp-sedhiou.svg"
              alt="Logo CFP Sédhiou"
              width={48}
              height={48}
            />
          </div>

          <div className="brand-text">
            <strong>CFP Sédhiou</strong>
            <span>Plateforme de gestion</span>
          </div>

          <button
            type="button"
            className="sidebar-close"
            onClick={onClose}
            aria-label="Fermer le menu"
          >
            ×
          </button>
        </div>

        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {user?.firstName?.charAt(0)?.toUpperCase() ?? "U"}
          </div>

          <div className="sidebar-user-info">
            <strong>
              {loading ? "Chargement..." : fullName}
            </strong>

            <small>
              {loading
                ? "..."
                : user?.role ?? "Utilisateur"}
            </small>
          </div>
        </div>

        <nav className="sidebar-nav">
          {visibleGroups.map((group) => (
            <div className="nav-group" key={group.title}>
              <div className="nav-group-title">
                {group.title}
              </div>

              {group.items.map((item) => {
                const active =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`nav-link ${active ? "is-active" : ""}`}
                    onClick={onClose}
                  >
                    <span className="nav-icon">
                      {item.icon}
                    </span>

                    <span>{item.label}</span>

                    <span className="nav-arrow">›</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="sidebar-account">
          <Link
            href="/compte"
            className={`sidebar-account-link ${
              pathname.startsWith("/compte") ? "is-active" : ""
            }`}
            onClick={onClose}
          >
            <span>⚙</span>
            <span>Mon compte</span>
          </Link>

          <Link
            href="/compte/mot-de-passe"
            className="sidebar-account-link"
            onClick={onClose}
          >
            <span>🔑</span>
            <span>Changer le mot de passe</span>
          </Link>
        </div>

        <div className="sidebar-footer">
          <div className="footer-status">
            <span className="status-dot" />

            <div>
              <strong>Système opérationnel</strong>
              <small>Données synchronisées</small>
            </div>
          </div>
        
      <button
        type="button"
        className="sidebar-logout"
        onClick={handleLogout}
      >
        <span className="sidebar-logout-icon">↪</span>
        <span>Se déconnecter</span>
      </button>
</div>
      </aside>
    </>
  );
}
