"use client";

import { useState } from "react";

export function CaisseActions() {
  const [open, setOpen] = useState<"fonds" | "depense" | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.currentTarget;
    const data = new FormData(form);

    setLoading(true);
    setMessage("");

    const payload = {
      type: open === "depense" ? "SORTIE" : "ENTREE",
      sourceType: open === "depense" ? "DEPENSE" : "FONDS",
      category: String(data.get("category") || ""),
      label: String(data.get("label") || ""),
      amount: Number(data.get("amount") || 0),
      reference: String(data.get("reference") || ""),
      note: String(data.get("note") || ""),
    };

    const response = await fetch("/api/finances/caisse", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    setLoading(false);

    if (!response.ok) {
      setMessage(result.error || "Erreur lors de l'enregistrement.");
      return;
    }

    setMessage("Mouvement enregistré avec succès.");
    form.reset();

    setTimeout(() => {
      window.location.reload();
    }, 700);
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setOpen("fonds")}
          className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          + Fonds reçu
        </button>

        <button
          type="button"
          onClick={() => setOpen("depense")}
          className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
        >
          + Dépense
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">
                  {open === "fonds"
                    ? "Enregistrer un fonds reçu"
                    : "Enregistrer une dépense"}
                </h2>

                <p className="text-sm text-slate-500">
                  {open === "fonds"
                    ? "Ajoutez une nouvelle entrée de caisse."
                    : "Ajoutez une sortie de caisse."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(null)}
                className="text-2xl text-slate-400"
              >
                ×
              </button>
            </div>

            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Catégorie
                </label>

                <select
                  name="category"
                  required
                  className="w-full rounded-xl border px-3 py-2"
                >
                  {open === "fonds" ? (
                    <>
                      <option value="">Sélectionner</option>
                      <option value="SUBVENTION">Subvention</option>
                      <option value="DOTATION">Dotation</option>
                      <option value="PARTENAIRE">Partenaire</option>
                      <option value="DON">Don</option>
                      <option value="AUTRE">Autre</option>
                    </>
                  ) : (
                    <>
                      <option value="">Sélectionner</option>
                      <option value="FOURNITURES">Fournitures</option>
                      <option value="ENTRETIEN">Entretien</option>
                      <option value="TRANSPORT">Transport</option>
                      <option value="MISSION">Mission</option>
                      <option value="REPARATION">Réparation</option>
                      <option value="AUTRE">Autre</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Libellé
                </label>

                <input
                  name="label"
                  required
                  placeholder="Ex. Dotation du partenaire"
                  className="w-full rounded-xl border px-3 py-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Montant FCFA
                </label>

                <input
                  name="amount"
                  type="number"
                  min="1"
                  required
                  className="w-full rounded-xl border px-3 py-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Référence
                </label>

                <input
                  name="reference"
                  placeholder="N° reçu, chèque, bordereau..."
                  className="w-full rounded-xl border px-3 py-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Observation
                </label>

                <textarea
                  name="note"
                  rows={3}
                  className="w-full rounded-xl border px-3 py-2"
                />
              </div>

              {message && (
                <p className="rounded-xl bg-slate-100 p-3 text-sm">
                  {message}
                </p>
              )}

              <button
                disabled={loading}
                className="w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white disabled:opacity-50"
              >
                {loading ? "Enregistrement..." : "Enregistrer"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
