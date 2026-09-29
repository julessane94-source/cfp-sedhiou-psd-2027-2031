"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type User = {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
};

export default function ComptePage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
        }
      })
      .catch(console.error);
  }, []);

  if (!user) {
    return (
      <section className="page-section">
        <p>Chargement de votre compte...</p>
      </section>
    );
  }

  return (
    <section className="page-section">
      <div className="page-header">
        <div>
          <span className="eyebrow">Mon compte</span>
          <h1>Mon profil</h1>
          <p>
            Consultez vos informations personnelles et
            gérez votre sécurité.
          </p>
        </div>
      </div>

      <div className="card">
        <h2>Informations personnelles</h2>

        <div className="profile-grid">
          <div>
            <small>Prénom</small>
            <strong>{user.firstName}</strong>
          </div>

          <div>
            <small>Nom</small>
            <strong>{user.lastName}</strong>
          </div>

          <div>
            <small>Adresse e-mail</small>
            <strong>{user.email}</strong>
          </div>

          <div>
            <small>Rôle</small>
            <strong>{user.role}</strong>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Sécurité</h2>

        <p>
          Vous pouvez modifier votre mot de passe à tout
          moment.
        </p>

        <Link
          href="/compte/mot-de-passe"
          className="primary-button"
        >
          Changer mon mot de passe
        </Link>
      </div>
    </section>
  );
}
