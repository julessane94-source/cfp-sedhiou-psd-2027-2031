"use client";

import { FormEvent, useState } from "react";

type Props = {
  sourceType: "FONDS" | "DEPENSE";
};

export default function CaisseForm({ sourceType }: Props) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const isExpense = sourceType === "DEPENSE";

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const form = new FormData(e.currentTarget);

    const response = await fetch("/api/finances/caisse", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: isExpense ? "SORTIE" : "ENTREE",
        sourceType,
        category: form.get("category"),
        label: form.get("label"),
        amount: Number(form.get("amount")),
        movementDate: form.get("movementDate"),
        paymentMethod: form.get("paymentMethod") || null,
        reference: form.get("reference") || null,
        note: form.get("note") || null,
        supportingDocument: form.get("supportingDocument") || null,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.error || "Erreur lors de l'enregistrement.");
      setLoading(false);
      return;
    }

    e.currentTarget.reset();
    setMessage(
      isExpense
        ? "Dépense enregistrée dans la caisse."
        : "Fonds reçu enregistré dans la caisse."
    );

    setLoading(false);
    window.location.reload();
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700">
          Catégorie
        </label>
        <select
          name="category"
          required
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
        >
          {isExpense ? (
            <>
              <option value="FOURNITURES">Fournitures</option>
              <option value="ENTRETIEN">Entretien</option>
              <option value="TRANSPORT">Transport</option>
              <option value="MISSION">Mission</option>
              <option value="REPARATION">Réparation</option>
              <option value="AUTRE">Autre</option>
            </>
          ) : (
            <>
              <option value="SUBVENTION">Subvention</option>
              <option value="DOTATION">Dotation</option>
              <option value="PARTENAIRE">Partenaire</option>
              <option value="DON">Don</option>
              <option value="AUTRE">Autre</option>
            </>
          )}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Libellé
        </label>
        <input
          name="label"
          required
          placeholder={isExpense ? "Ex. Achat de fournitures" : "Ex. Dotation reçue"}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Montant
        </label>
        <input
          name="amount"
          type="number"
          min="1"
          step="0.01"
          required
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
        />
      </div>

      {!isExpense && (
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Mode de réception
          </label>
          <select
            name="paymentMethod"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          >
            <option value="">Non précisé</option>
            <option value="ESPECES">Espèces</option>
            <option value="WAVE">Wave</option>
            <option value="ORANGE_MONEY">Orange Money</option>
            <option value="VIREMENT_BANCAIRE">Virement bancaire</option>
            <option value="AUTRE">Autre</option>
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Référence
        </label>
        <input
          name="reference"
          placeholder="Référence, bordereau, facture..."
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
        />
      </div>

      {isExpense && (
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Justificatif
          </label>
          <input
            name="supportingDocument"
            placeholder="Nom ou référence du justificatif"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Observation
        </label>
        <textarea
          name="note"
          rows={3}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
        />
      </div>

      {message && (
        <p className="rounded-lg bg-slate-100 px-3 py-2 text-sm">
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white disabled:opacity-50"
      >
        {loading
          ? "Enregistrement..."
          : isExpense
            ? "Enregistrer la dépense"
            : "Enregistrer les fonds reçus"}
      </button>
    </form>
  );
}
