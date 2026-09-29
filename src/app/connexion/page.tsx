"use client";

import { FormEvent, useState } from "react";

export default function ConnexionPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Connexion impossible.");
        return;
      }

      window.location.href = "/dashboard";
    } catch {
      setError("Impossible de contacter le serveur.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-brand">
          <img
            src="/logo-cfp-sedhiou.svg"
            alt="Logo CFP Sédhiou"
            className="login-logo"
          />
          <span>CFP SÉDHIOU</span>
        </div>

        <h1>Connexion</h1>
        <p>Accédez à votre espace de gestion.</p>

        <form onSubmit={handleSubmit} className="login-form">
          <label>
            Adresse e-mail
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="exemple@cfpsedhiou.sn"
              autoComplete="email"
              required
            />
          </label>

          <label>
            Mot de passe
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Votre mot de passe"
              autoComplete="current-password"
              required
            />
          </label>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" disabled={loading}>
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <small>Plateforme administrative et financière</small>
      </section>
    </main>
  );
}
