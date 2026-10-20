"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

type Role = { name: string; description: string | null };
type Agent = { id: string; name: string; hasAccount: boolean; email: string; roleName: string };

export default function CreaCaiAccess({ agent, roles }: { agent: Agent; roles: Role[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  async function provision(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setIsError(false);
    const form = new FormData(event.currentTarget);
    try {
      const values = Object.fromEntries(form.entries());
      const response = await fetch("/api/personnel/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId: agent.id, ...values }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Création du compte impossible.");
      setMessage("Compte associé à " + result.user.email + ".");
      router.refresh();
    } catch (cause) {
      setIsError(true);
      setMessage(cause instanceof Error ? cause.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  if (agent.hasAccount) {
    return (
      <div className="min-w-40 text-sm">
        <strong className="text-emerald-800">Compte associé</strong>
        <p>{agent.email}</p>
        <span className="text-slate-500">{agent.roleName.replaceAll("_", " ")}</span>
      </div>
    );
  }

  return (
    <form onSubmit={provision} className="min-w-56 space-y-2">
      <input name="email" type="email" required maxLength={254} defaultValue={agent.email} placeholder="Identifiant e-mail" className="w-full rounded-lg border p-2 text-sm" />
      <select name="roleName" required defaultValue="" className="w-full rounded-lg border p-2 text-sm">
        <option value="" disabled>Choisir un rôle</option>
        {roles.map((role) => <option key={role.name} value={role.name}>{role.name.replaceAll("_", " ")}</option>)}
      </select>
      <input name="password" type="password" required minLength={12} autoComplete="new-password" placeholder="Mot de passe initial (12 caractères min.)" className="w-full rounded-lg border p-2 text-sm" />
      <button type="submit" disabled={loading} className="rounded-lg bg-indigo-700 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60">
        {loading ? "Création…" : "Créer le compte utilisateur"}
      </button>
      {message && <p role={isError ? "alert" : "status"} className={isError ? "text-xs text-red-700" : "text-xs text-emerald-700"}>{message}</p>}
    </form>
  );
}
