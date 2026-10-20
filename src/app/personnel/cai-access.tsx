"use client";

import { useState } from "react";

type Agent = { id: string; name: string; hasAccount: boolean };

export default function CreaCaiAccess({ agent }: { agent: Agent }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [credentials, setCredentials] = useState<{ login: string; password: string } | null>(null);

  async function provision() {
    setLoading(true);
    setError("");
    setCredentials(null);
    try {
      const response = await fetch("/api/personnel/cai-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId: agent.id }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Création de l’accès impossible.");
      setCredentials({ login: result.login, password: result.password });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  if (credentials) {
    return (
      <div className="min-w-64 space-y-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-950">
        <strong>Accès créé pour {agent.name}</strong>
        <p>Identifiant : <code className="select-all">{credentials.login}</code></p>
        <p>Mot de passe initial : <code className="select-all">{credentials.password}</code></p>
        <p className="text-xs">Copiez ces identifiants maintenant : le mot de passe ne sera plus affiché.</p>
        <button type="button" onClick={() => setCredentials(null)} className="font-semibold underline">Masquer</button>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <button
        type="button"
        disabled={loading || agent.hasAccount}
        onClick={provision}
        className="rounded-lg bg-indigo-700 px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {loading ? "Création…" : agent.hasAccount ? "Compte déjà créé" : "Créer l’accès CAI"}
      </button>
      {error && <p role="alert" className="max-w-56 text-xs text-red-700">{error}</p>}
    </div>
  );
}
