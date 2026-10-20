"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";

type Role = { name: string; description: string | null };
type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  role: Role;
};

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [resetUser, setResetUser] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/utilisateurs", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Chargement impossible.");
      setUsers(data.users);
      setRoles(data.roles);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Chargement impossible.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setSaving(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/utilisateurs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(form.entries())),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Création impossible.");
      formElement.reset();
      setMessage(`Compte créé : ${data.user.email}`);
      await refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Création impossible.");
    } finally {
      setSaving(false);
    }
  }

  async function update(id: string, changes: Record<string, string>) {
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/utilisateurs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...changes }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Modification impossible.");
      setMessage("Compte mis à jour.");
      setResetUser(null);
      await refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Modification impossible.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <section className="ui-card">
        <h2>Créer un compte</h2>
        <p>Le courriel sert d’identifiant. Le mot de passe doit contenir au moins 12 caractères.</p>
        <form className="ui-form" onSubmit={submit}>
          <label>Prénom<input name="firstName" autoComplete="given-name" required maxLength={100} /></label>
          <label>Nom<input name="lastName" autoComplete="family-name" required maxLength={100} /></label>
          <label>Identifiant (e-mail)<input name="email" type="email" autoComplete="username" required maxLength={254} /></label>
          <label>Rôle<select name="roleName" required defaultValue=""><option value="" disabled>Choisir un rôle</option>{roles.map((role) => <option key={role.name} value={role.name}>{role.name.replaceAll("_", " ")}</option>)}</select></label>
          <label className="full-width">Mot de passe initial<input name="password" type="password" autoComplete="new-password" minLength={12} required /></label>
          <button type="submit" disabled={saving}>{saving ? "Enregistrement…" : "Créer le compte"}</button>
        </form>
        {message && <p role="status" aria-live="polite">{message}</p>}
      </section>

      <section className="ui-card">
        <h2>Comptes existants</h2>
        {loading ? <p>Chargement des utilisateurs…</p> : (
          <div className="table-wrap">
            <table className="ui-table">
              <thead><tr><th>Utilisateur</th><th>Identifiant</th><th>Rôle</th><th>État</th><th>Accès</th></tr></thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td><strong>{user.firstName} {user.lastName}</strong></td>
                    <td>{user.email}</td>
                    <td>
                      <select aria-label={`Rôle de ${user.email}`} value={user.role.name} disabled={saving || user.role.name === "DIRECTEUR"} onChange={(event) => void update(user.id, { roleName: event.target.value })}>
                        {user.role.name === "DIRECTEUR" && <option value="DIRECTEUR">DIRECTEUR</option>}
                        {roles.map((role) => <option key={role.name} value={role.name}>{role.name.replaceAll("_", " ")}</option>)}
                      </select>
                    </td>
                    <td><span className={`badge ${user.status === "ACTIVE" ? "badge-publie" : "badge-brouillon"}`}>{user.status === "ACTIVE" ? "Actif" : "Désactivé"}</span></td>
                    <td>
                      <div className="stage-actions">
                        <button type="button" disabled={saving || user.role.name === "DIRECTEUR"} onClick={() => void update(user.id, { status: user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" })}>{user.status === "ACTIVE" ? "Désactiver" : "Activer"}</button>
                        <button type="button" disabled={saving || user.role.name === "DIRECTEUR"} onClick={() => setResetUser(resetUser === user.id ? null : user.id)}>Réinitialiser le mot de passe</button>
                      </div>
                      {resetUser === user.id && (
                        <form className="ui-form" onSubmit={(event) => { event.preventDefault(); const form = new FormData(event.currentTarget); const password = String(form.get("password") || ""); void update(user.id, { password }); }}>
                          <label>Nouveau mot de passe<input name="password" type="password" minLength={12} autoComplete="new-password" required /></label>
                          <button type="submit" disabled={saving}>Enregistrer</button>
                        </form>
                      )}
                    </td>
                  </tr>
                ))}
                {!users.length && <tr><td colSpan={5}>Aucun utilisateur.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
