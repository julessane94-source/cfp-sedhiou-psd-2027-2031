"use client";

import { useState } from "react";

export default function NotificationActions({
  id,
  read,
}: {
  id: string;
  read: boolean;
}) {
  const [loading, setLoading] = useState(false);

  async function update(nextRead: boolean) {
    setLoading(true);

    await fetch("/api/notifications", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id,
        read: nextRead,
      }),
    });

    window.location.reload();
  }

  return (
    <button
      type="button"
      disabled={loading}
      onClick={() => update(!read)}
    >
      {read ? "↩️ Non lue" : "✓ Marquer lue"}
    </button>
  );
}
