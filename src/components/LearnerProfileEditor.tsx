"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = { id: string; firstName: string; lastName: string; phone: string; email: string; birthDate: string; integrationYear: string };

export default function LearnerProfileEditor(props: Props) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  async function save(formData: FormData) {
    setBusy(true); setMessage("");
    try {
      const response = await fetch(`/api/apprenants/${props.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(formData.entries())),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Mise à jour impossible.");
      setMessage("La fiche de l’apprenant a été complétée.");
      setOpen(false);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Une erreur est survenue.");
    } finally { setBusy(false); }
  }

  return (
    <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold text-slate-900">Compléter les informations</h2>
          <p className="mt-1 text-sm text-slate-600">Ajoutez ou corrigez les coordonnées et les informations personnelles.</p>
        </div>
        <button type="button" onClick={() => setOpen(!open)} className="rounded-xl bg-indigo-800 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700">{open ? "Fermer" : "Modifier la fiche"}</button>
      </div>
      {message && <p role="status" className="mt-3 rounded-lg bg-slate-100 p-3 text-sm text-slate-800">{message}</p>}
      {open && <form action={save} className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold text-slate-700">Prénom<input name="firstName" defaultValue={props.firstName} required maxLength={100} className="mt-1 w-full rounded-lg border border-slate-300 p-3" /></label>
        <label className="text-sm font-semibold text-slate-700">Nom<input name="lastName" defaultValue={props.lastName} required maxLength={100} className="mt-1 w-full rounded-lg border border-slate-300 p-3" /></label>
        <label className="text-sm font-semibold text-slate-700">Téléphone<input name="phone" defaultValue={props.phone} maxLength={40} className="mt-1 w-full rounded-lg border border-slate-300 p-3" /></label>
        <label className="text-sm font-semibold text-slate-700">E-mail<input name="email" type="email" defaultValue={props.email} maxLength={254} className="mt-1 w-full rounded-lg border border-slate-300 p-3" /></label>
        <label className="text-sm font-semibold text-slate-700">Date de naissance<input name="birthDate" type="date" defaultValue={props.birthDate} className="mt-1 w-full rounded-lg border border-slate-300 p-3" /></label>
        <label className="text-sm font-semibold text-slate-700">Année d’intégration<input name="integrationYear" type="number" min={1950} max={new Date().getFullYear() + 1} defaultValue={props.integrationYear} className="mt-1 w-full rounded-lg border border-slate-300 p-3" /></label>
        <button disabled={busy} className="rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white disabled:opacity-50 sm:col-span-2">{busy ? "Enregistrement…" : "Enregistrer les informations"}</button>
      </form>}
    </section>
  );
}
