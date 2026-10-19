"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronRight, KeyRound, LogOut, Settings } from "lucide-react";
import { getVisibleMenuGroups } from "@/lib/navigation";

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
        const response = await fetch("/api/auth/me", { cache: "no-store" });
        if (!response.ok) {
          if (!cancelled) setUser(null);
          return;
        }

        const data = await response.json();
        if (!cancelled) setUser(data.user ?? null);
      } catch (error) {
        console.error("Chargement utilisateur:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadUser();
    return () => {
      cancelled = true;
    };
  }, []);

  const visibleGroups = useMemo(
    () => (user ? getVisibleMenuGroups(user.role) : []),
    [user]
  );

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);

    try {
      await fetch("/api/auth/logout", { method: "POST" });
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
      <button
        type="button"
        className={`sidebar-overlay ${open ? "is-visible" : ""}`}
        onClick={onClose}
        aria-label="Fermer le menu"
        tabIndex={open ? 0 : -1}
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
          <div className="sidebar-avatar" aria-hidden="true">
            {user?.firstName?.charAt(0)?.toUpperCase() ?? "U"}
          </div>
          <div className="sidebar-user-info">
            <strong>{loading ? "Chargement…" : fullName}</strong>
            <small>{loading ? " " : user?.role ?? "Utilisateur"}</small>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Navigation principale">
          {visibleGroups.map((group) => (
            <div className="nav-group" key={group.title}>
              <div className="nav-group-title">{group.title}</div>
              {group.items.map((item) => {
                const active =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`nav-link ${active ? "is-active" : ""}`}
                    onClick={onClose}
                    aria-current={active ? "page" : undefined}
                  >
                    <span className="nav-icon">
                      <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
                    </span>
                    <span>{item.label}</span>
                    <ChevronRight size={15} className="nav-arrow" aria-hidden="true" />
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="sidebar-account">
          <Link
            href="/compte"
            className={`sidebar-account-link ${pathname.startsWith("/compte") ? "is-active" : ""}`}
            onClick={onClose}
          >
            <Settings size={17} aria-hidden="true" />
            <span>Mon compte</span>
          </Link>
          <Link
            href="/compte/mot-de-passe"
            className="sidebar-account-link"
            onClick={onClose}
          >
            <KeyRound size={17} aria-hidden="true" />
            <span>Changer le mot de passe</span>
          </Link>
        </div>

        <div className="sidebar-footer">
          <div className="footer-status">
            <span className="status-dot" />
            <div>
              <strong>Espace sécurisé</strong>
              <small>Compte connecté</small>
            </div>
          </div>
          <button
            type="button"
            className="sidebar-logout"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            <LogOut size={17} aria-hidden="true" />
            <span>{loggingOut ? "Déconnexion…" : "Se déconnecter"}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
