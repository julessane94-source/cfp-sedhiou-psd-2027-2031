"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
} from "lucide-react";

export default function ConnexionPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Connexion impossible.");
        return;
      }

      window.location.href = data.user?.home ?? "/dashboard";
    } catch {
      setError("Impossible de contacter le serveur. Vérifiez votre connexion et réessayez.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card" aria-labelledby="login-title">
        <div className="login-showcase">
          <div className="login-showcase-brand">
            <span className="login-showcase-logo">
              <Image
                src="/logo-cfp-sedhiou.svg"
                alt=""
                width={58}
                height={58}
                priority
              />
            </span>
            <span>
              <strong>CFP SÉDHIOU</strong>
              <small>Centre de formation professionnelle</small>
            </span>
          </div>

          <div className="login-showcase-copy">
            <span className="login-showcase-eyebrow">
              <span /> PLATEFORME INSTITUTIONNELLE
            </span>
            <h2>Former aujourd’hui. Construire demain.</h2>
            <p>
              Un espace unique pour accompagner les apprenants, les équipes et
              les projets du CFP Sédhiou.
            </p>
          </div>

          <div className="login-showcase-art" aria-hidden="true">
            <div className="login-orbit login-orbit-one" />
            <div className="login-orbit login-orbit-two" />
            <div className="login-art-card login-art-card-top">
              <span className="login-art-mark">01</span>
              <span>Formation</span>
              <i />
            </div>
            <div className="login-art-seal">
              <Image
                src="/logo-cfp-sedhiou.svg"
                alt=""
                width={132}
                height={132}
              />
            </div>
            <div className="login-art-card login-art-card-bottom">
              <span className="login-art-mark">02</span>
              <span>Insertion professionnelle</span>
              <i />
            </div>
            <span className="login-art-spark login-art-spark-one" />
            <span className="login-art-spark login-art-spark-two" />
          </div>

          <div className="login-showcase-footer">
            <span>ENSEMBLE, FAISONS GRANDIR LES TALENTS</span>
            <span>SEDHIOU · SÉNÉGAL</span>
          </div>
        </div>

        <div className="login-form-panel">
          <div className="login-mobile-brand">
            <Image
              src="/logo-cfp-sedhiou.svg"
              alt="Logo CFP Sédhiou"
              width={48}
              height={48}
              priority
            />
            <span>CFP Sédhiou</span>
          </div>

          <div className="login-heading">
            <span className="login-heading-kicker">VOTRE ESPACE DE GESTION</span>
            <h1 id="login-title">Ravi de vous revoir.</h1>
            <p>Connectez-vous avec votre adresse e-mail professionnelle.</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <label htmlFor="login-email">Adresse e-mail</label>
            <div className="login-input-wrap">
              <Mail size={18} aria-hidden="true" />
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="nom@cfpsedhiou.sn"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                required
              />
            </div>

            <div className="login-password-label">
              <label htmlFor="login-password">Mot de passe</label>
            </div>
            <div className="login-input-wrap">
              <LockKeyhole size={18} aria-hidden="true" />
              <input
                id="login-password"
                type={passwordVisible ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Saisissez votre mot de passe"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="password-visibility-button"
                onClick={() => setPasswordVisible((visible) => !visible)}
                aria-label={passwordVisible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                aria-pressed={passwordVisible}
              >
                {passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {error && (
              <div className="login-error" role="alert">
                <AlertCircle size={18} aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}

            <button type="submit" className="login-submit" disabled={loading}>
              <span>{loading ? "Connexion en cours…" : "Se connecter"}</span>
              {loading ? <span className="login-spinner" aria-hidden="true" /> : <ArrowRight size={18} aria-hidden="true" />}
            </button>
          </form>

          <div className="login-form-footer">
            <span className="login-security-icon"><LockKeyhole size={14} aria-hidden="true" /></span>
            <span>Connexion sécurisée à votre espace professionnel</span>
          </div>
          <p className="login-help">Besoin d’aide ? Contactez l’administrateur de la plateforme.</p>
        </div>
      </section>
      <footer className="login-page-footer">
        <span>© {new Date().getFullYear()} CFP Sédhiou</span>
        <span>Plateforme administrative et financière</span>
      </footer>
    </main>
  );
}
