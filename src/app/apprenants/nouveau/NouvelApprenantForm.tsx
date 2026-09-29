"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Formation = {
  id: string;
  code: string;
  title: string;
  level: string | null;
};

type Props = {
  formations: Formation[];
};

export default function NouvelApprenantForm({ formations }: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [registrationFee, setRegistrationFee] = useState("");
  const [trainingCost, setTrainingCost] = useState("");
  const [discount, setDiscount] = useState("");
  const [scholarshipCoverage, setScholarshipCoverage] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");

  const netPayable = useMemo(() => {
    const inscription = Number(registrationFee || 0);
    const formation = Number(trainingCost || 0);
    const remise = Number(discount || 0);
    const priseEnCharge = Number(scholarshipCoverage || 0);

    return Math.max(
      0,
      inscription + formation - remise - priseEnCharge
    );
  }, [
    registrationFee,
    trainingCost,
    discount,
    scholarshipCoverage,
  ]);

  const reste = Math.max(
    0,
    netPayable - Number(paymentAmount || 0)
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/apprenants", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de l'enregistrement.");
      }

      setMessage("Apprenant enregistré avec succès.");

      if (data.receipt?.receiptNumber) {
        router.push(
          `/apprenants/recu/${encodeURIComponent(
            data.receipt.receiptNumber
          )}`
        );
      } else {
        router.push("/apprenants");
        router.refresh();
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-5xl space-y-6"
    >
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-semibold text-slate-900">
          Informations de l'apprenant
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Prénom *
            </label>
            <input
              name="firstName"
              required
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
              placeholder="Prénom"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Nom *
            </label>
            <input
              name="lastName"
              required
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
              placeholder="Nom"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Date de naissance *
            </label>
            <input
              type="date"
              name="birthDate"
              required
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Année d'intégration *
            </label>
            <input
              type="number"
              name="integrationYear"
              required
              defaultValue={new Date().getFullYear()}
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Téléphone
            </label>
            <input
              name="phone"
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
              placeholder="77 000 00 00"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Email
            </label>
            <input
              type="email"
              name="email"
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
              placeholder="email@example.com"
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-semibold text-slate-900">
          Inscription
        </h2>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium">
              Formation *
            </label>
            <select
              name="trainingId"
              required
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
            >
              <option value="">Sélectionner une formation</option>
              {formations.map((formation) => (
                <option key={formation.id} value={formation.id}>
                  {formation.code} — {formation.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Année académique *
            </label>
            <input
              name="academicYear"
              required
              defaultValue="2026-2027"
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Niveau
            </label>
            <input
              name="level"
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
              placeholder="1ère année"
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-semibold text-slate-900">
          Situation financière
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          <MoneyInput
            label="Frais d'inscription"
            name="registrationFee"
            value={registrationFee}
            onChange={setRegistrationFee}
          />

          <MoneyInput
            label="Coût de la formation"
            name="trainingCost"
            value={trainingCost}
            onChange={setTrainingCost}
          />

          <MoneyInput
            label="Réduction"
            name="discount"
            value={discount}
            onChange={setDiscount}
          />

          <MoneyInput
            label="Prise en charge / bourse"
            name="scholarshipCoverage"
            value={scholarshipCoverage}
            onChange={setScholarshipCoverage}
          />
        </div>

        <div className="mt-6 rounded-xl bg-slate-50 p-5">
          <div className="flex items-center justify-between">
            <span className="font-medium text-slate-600">
              Net à payer
            </span>
            <span className="text-2xl font-bold text-slate-900">
              {netPayable.toLocaleString("fr-FR")} FCFA
            </span>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-semibold text-slate-900">
          Premier paiement
        </h2>

        <div className="grid gap-4 md:grid-cols-3">
          <MoneyInput
            label="Montant payé"
            name="paymentAmount"
            value={paymentAmount}
            onChange={setPaymentAmount}
          />

          <div>
            <label className="mb-1 block text-sm font-medium">
              Mode de paiement
            </label>
            <select
              name="paymentMethod"
              defaultValue="ESPECES"
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
            >
              <option value="ESPECES">Espèces</option>
              <option value="WAVE">Wave</option>
              <option value="ORANGE_MONEY">Orange Money</option>
              <option value="VIREMENT_BANCAIRE">
                Virement bancaire
              </option>
              <option value="AUTRE">Autre</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Référence paiement
            </label>
            <input
              name="paymentReference"
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
              placeholder="Optionnel"
            />
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-slate-200 p-4">
          <div className="flex justify-between">
            <span className="text-slate-600">Reste à payer</span>
            <strong className="text-slate-900">
              {reste.toLocaleString("fr-FR")} FCFA
            </strong>
          </div>
        </div>

        <div className="mt-4">
          <label className="mb-1 block text-sm font-medium">
            Note
          </label>
          <textarea
            name="note"
            rows={3}
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
            placeholder="Observation éventuelle"
          />
        </div>
      </section>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {message && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-green-700">
          {message}
        </div>
      )}

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push("/apprenants")}
          className="rounded-xl border border-slate-300 px-6 py-3 font-medium"
        >
          Annuler
        </button>

        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-blue-700 px-6 py-3 font-semibold text-white disabled:opacity-50"
        >
          {loading
            ? "Enregistrement..."
            : "Enregistrer l'apprenant"}
        </button>
      </div>
    </form>
  );
}

function MoneyInput({
  label,
  name,
  value,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium">
        {label}
      </label>
      <input
        type="number"
        min="0"
        step="1"
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-300 px-4 py-3"
        placeholder="0"
      />
    </div>
  );
}
