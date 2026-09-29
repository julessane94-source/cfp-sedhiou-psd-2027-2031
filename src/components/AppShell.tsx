"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import Sidebar from "./layout/Sidebar";
import ScrollReveal from "./ScrollReveal";

export default function AppShell({
  children,
}: {
  children: ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  const pathname = usePathname();
  const router = useRouter();

  const previousPathname = useRef<string | null>(null);
  const splashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isLoginPage =
    pathname === "/" || pathname === "/connexion";

  const startSplash = () => {
    if (splashTimer.current) {
      clearTimeout(splashTimer.current);
    }

    setShowSplash(true);

    splashTimer.current = setTimeout(() => {
      setShowSplash(false);
    }, 1400);
  };

  /*
   * Animation au premier chargement de l'application.
   */
  useEffect(() => {
    startSplash();

    return () => {
      if (splashTimer.current) {
        clearTimeout(splashTimer.current);
      }
    };
  }, []);

  /*
   * Animation lorsqu'on passe de la connexion
   * vers une page protégée après authentification.
   */
  useEffect(() => {
    const previous = previousPathname.current;

    if (
      previous &&
      (previous === "/" || previous === "/connexion") &&
      !isLoginPage
    ) {
      startSplash();
    }

    previousPathname.current = pathname;
  }, [pathname, isLoginPage]);

  /*
   * Vérification de la session.
   */
  useEffect(() => {
    if (isLoginPage) {
      setCheckingSession(false);
      return;
    }

    let cancelled = false;

    async function checkSession() {
      try {
        const response = await fetch("/api/auth/me", {
          cache: "no-store",
        });

        if (!response.ok && !cancelled) {
          router.replace("/connexion");
          return;
        }
      } catch {
        if (!cancelled) {
          router.replace("/connexion");
        }
      } finally {
        if (!cancelled) {
          setCheckingSession(false);
        }
      }
    }

    checkSession();

    return () => {
      cancelled = true;
    };
  }, [isLoginPage, router]);

  /*
   * Déconnexion.
   */
  const handleLogout = async () => {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
    });

    if (response.ok) {
      router.push("/connexion");
      router.refresh();
    }
  };

  /*
   * Écran d'animation du logo.
   */
  if (showSplash) {
    return (
      <div className="cfp-splash">
        <div className="cfp-splash-content">
          <div className="cfp-splash-logo">
            <Image
              src="/logo-cfp-sedhiou.svg"
              alt="Logo CFP Sédhiou"
              width={110}
              height={110}
              priority
            />
          </div>

          <div className="cfp-splash-title">
            <strong>CFP Sédhiou</strong>
            <span>Plateforme de gestion</span>
          </div>

          <div className="cfp-splash-loader">
            <span />
          </div>
        </div>
      </div>
    );
  }

  /*
   * Page de connexion.
   */
  if (isLoginPage) {
    return (
      <div className="login-shell">
        <main className="app-content">
          <ScrollReveal>{children}</ScrollReveal>
        </main>
      </div>
    );
  }

  /*
   * Vérification de session.
   */
  if (checkingSession) {
    return (
      <div className="app-loading">
        <div className="app-loading-card">
          <div className="status-dot" />
          <strong>Vérification de la session...</strong>
        </div>
      </div>
    );
  }

  /*
   * Application principale.
   */
  return (
    <div className="app-shell">
      <Sidebar
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      />

      <div
        className={`sidebar-overlay ${
          menuOpen ? "is-visible" : ""
        }`}
        onClick={() => setMenuOpen(false)}
      />

      <div className="app-main">
        <header className="mobile-header">
          <div className="mobile-brand">
            <Image
              src="/logo-cfp-sedhiou.svg"
              alt="Logo CFP Sédhiou"
              className="mobile-logo"
              width={42}
              height={42}
            />

            <div>
              <strong>CFP Sédhiou</strong>
              <span>Plateforme de gestion</span>
            </div>
          </div>

          <div className="mobile-header-actions">
            <button
              type="button"
              onClick={handleLogout}
              className="logout-button"
            >
              Se déconnecter
            </button>

            <button
              type="button"
              className={`mobile-menu-button ${
                menuOpen ? "is-open" : ""
              }`}
              onClick={() => setMenuOpen((value) => !value)}
              aria-label={
                menuOpen ? "Fermer le menu" : "Ouvrir le menu"
              }
              aria-expanded={menuOpen}
            >
              <span className="hamburger-line" />
              <span className="hamburger-line" />
              <span className="hamburger-line" />
            </button>
          </div>
        </header>

        <main className="app-content">
          <ScrollReveal>{children}</ScrollReveal>
        </main>
      </div>
    </div>
  );
}
