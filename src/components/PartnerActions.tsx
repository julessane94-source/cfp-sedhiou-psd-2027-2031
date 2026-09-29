"use client";

import { useState } from "react";

export default function PartnerActions({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const [loading, setLoading] = useState(false);

  async function update(nextStatus: string) {
    setLoading(true);

    await fetch("/api/partenaires", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: nextStatus }),
    });

    window.location.reload();
  }

  return (
    <div className="stage-actions">
      {status === "ACTIF" ? (
        <button
          type="button"
          disabled={loading}
          onClick={() => update("INACTIF")}
        >
          Désactiver
        </button>
      ) : (
        <button
          type="button"
          disabled={loading}
          onClick={() => update("ACTIF")}
        >
          Activer
        </button>
      )}
    </div>
  );
}
