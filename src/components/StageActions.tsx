"use client";

import { useState } from "react";

export default function StageActions({
  id,
  status,
  evaluation,
  observations,
}: {
  id: string;
  status: string;
  evaluation: string | null;
  observations: string | null;
}) {
  const [loading, setLoading] = useState(false);

  async function update(data: Record<string, unknown>) {
    setLoading(true);

    await fetch("/api/stages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...data }),
    });

    window.location.reload();
  }

  return (
    <div className="stage-actions">
      {status === "PREVU" && (
        <button
          type="button"
          onClick={() => update({ status: "EN_COURS" })}
          disabled={loading}
        >
          ▶ Démarrer
        </button>
      )}

      {status === "EN_COURS" && (
        <button
          type="button"
          onClick={() => update({ status: "TERMINE" })}
          disabled={loading}
        >
          ✓ Terminer
        </button>
      )}

      {(status === "PREVU" || status === "EN_COURS") && (
        <button
          type="button"
          onClick={() => update({ status: "SUSPENDU" })}
          disabled={loading}
        >
          ⏸ Suspendre
        </button>
      )}

      {status === "TERMINE" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();

            const form = new FormData(e.currentTarget);
            update({
              evaluation: form.get("evaluation"),
              observations: form.get("observations"),
            });
          }}
        >
          <input
            name="evaluation"
            type="number"
            min="0"
            max="20"
            step="0.01"
            defaultValue={evaluation ?? ""}
            placeholder="Note /20"
          />

          <input
            name="observations"
            defaultValue={observations ?? ""}
            placeholder="Observation"
          />

          <button type="submit" disabled={loading}>
            Enregistrer
          </button>
        </form>
      )}
    </div>
  );
}
