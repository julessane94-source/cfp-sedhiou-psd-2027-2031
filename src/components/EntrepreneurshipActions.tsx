"use client";

import { useState } from "react";

export default function EntrepreneurshipActions({
  id,
  status,
  financedAmount,
}: {
  id: string;
  status: string;
  financedAmount: string | null;
}) {
  const [loading, setLoading] = useState(false);

  async function update(data: Record<string, unknown>) {
    setLoading(true);

    await fetch("/api/entrepreneuriat", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...data }),
    });

    window.location.reload();
  }

  return (
    <div className="stage-actions">
      {status === "IDEE" && (
        <button
          type="button"
          disabled={loading}
          onClick={() => update({ status: "ETUDE" })}
        >
          🔎 Étudier
        </button>
      )}

      {status === "ETUDE" && (
        <button
          type="button"
          disabled={loading}
          onClick={() => update({ status: "ACCOMPAGNEMENT" })}
        >
          🤝 Accompagner
        </button>
      )}

      {status === "ACCOMPAGNEMENT" && (
        <button
          type="button"
          disabled={loading}
          onClick={() => update({ status: "FINANCEMENT" })}
        >
          💰 Financement
        </button>
      )}

      {status === "FINANCEMENT" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);

            update({
              status: "EN_ACTIVITE",
              financedAmount: form.get("financedAmount"),
            });
          }}
        >
          <input
            name="financedAmount"
            type="number"
            min="0"
            step="1"
            defaultValue={financedAmount ?? ""}
            placeholder="Montant financé"
          />
          <button type="submit" disabled={loading}>
            🚀 Activer
          </button>
        </form>
      )}

      {status !== "EN_ACTIVITE" && status !== "ABANDONNE" && (
        <button
          type="button"
          disabled={loading}
          onClick={() => update({ status: "ABANDONNE" })}
        >
          ✕ Abandonner
        </button>
      )}

      {status === "EN_ACTIVITE" && (
        <span className="badge badge-en_activite">
          ✓ Projet actif
        </span>
      )}
    </div>
  );
}
