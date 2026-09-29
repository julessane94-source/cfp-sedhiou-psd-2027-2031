"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ChangePasswordPage() {
  const router = useRouter();

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError(
        "La confirmation du nouveau mot de passe ne correspond pas."
      );
      return;
    }

    if (newPassword.length < 8) {
      setError(
        "Le nouveau mot de passe doit contenir au moins 8 caractères."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "/api/auth/change-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error ??
            "Impossible de modifier le mot de passe."
        );
        return;
      }

      setSuccess(
        "Votre mot de passe a été modifié avec succès."
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        router.push("/compte");
      }, 1200);
    } catch {
      setError(
        "Une erreur est survenue. Veuillez réessayer."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="page-section">
      <div className="page-header">
        <div>
          <span className="eyebrow">Sécurité</span>
          <h1>Changer le mot de passe</h1>
          <p>
            Modifiez le mot de passe de votre compte.
          </p>
        </div>
      </div>

      <div className="card password-card">
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="form-alert form-alert-error">
              {error}
            </div>
          )}

          {success && (
            <div className="form-alert form-alert-success">
              {success}
            </div>
          )}

          <div className="form-field">
            <label htmlFor="currentPassword">
              Mot de passe actuel
            </label>

            <input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(event) =>
                setCurrentPassword(event.target.value)
              }
              placeholder="Votre mot de passe actuel"
              autoComplete="current-password"
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="newPassword">
              Nouveau mot de passe
            </label>

            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(event) =>
                setNewPassword(event.target.value)
              }
              placeholder="Minimum 8 caractères"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="confirmPassword">
              Confirmer le nouveau mot de passe
            </label>

            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(event.target.value)
              }
              placeholder="Répétez le nouveau mot de passe"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>

          <div className="form-actions">
            <Link
              href="/compte"
              className="secondary-button"
            >
              Annuler
            </Link>

            <button
              type="submit"
              className="primary-button"
              disabled={loading}
            >
              {loading
                ? "Modification..."
                : "Modifier le mot de passe"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
