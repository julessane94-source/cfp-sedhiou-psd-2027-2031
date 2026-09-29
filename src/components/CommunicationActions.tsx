"use client";

import { useState } from "react";

export default function CommunicationActions({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const [loading, setLoading] = useState(false);

  async function update(nextStatus: string) {
    setLoading(true);

    await fetch("/api/communication", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: nextStatus }),
    });

    window.location.reload();
  }

  return (
    <div className="stage-actions">
      {status === "BROUILLON" && (
        <button
          type="button"
          disabled={loading}
          onClick={() => update("PUBLIE")}
        >
          📣 Publier
        </button>
      )}

      {status === "PUBLIE" && (
        <button
          type="button"
          disabled={loading}
          onClick={() => update("ARCHIVE")}
        >
          🗄️ Archiver
        </button>
      )}

      {status === "ARCHIVE" && (
        <button
          type="button"
          disabled={loading}
          onClick={() => update("BROUILLON")}
        >
          ↩️ Restaurer
        </button>
      )}
    </div>
  );
}
