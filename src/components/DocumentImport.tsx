"use client";

import { useState } from "react";

type Props = { kind: "planning" | "apprenants" };
type Row = Record<string, string | number | string[]>;
type DetectedTrainer = { name: string; matches: string[]; personnelMatches?: string[] };

const labels: Record<string, string> = {
  weekday: "Jour", startTime: "Début", endTime: "Fin", room: "Salle", className: "Classe / groupe", trainerName: "Formateur", subject: "Cours / classe",
  firstName: "Prénom", lastName: "Nom", phone: "Téléphone", email: "E-mail", birthDate: "Naissance",
};

export default function DocumentImport({ kind }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [sourceRows, setSourceRows] = useState<Record<string, string>[]>([]);
  const [previewRows, setPreviewRows] = useState<Row[]>([]);
  const [detectedTrainers, setDetectedTrainers] = useState<DetectedTrainer[]>([]);
  const [invalid, setInvalid] = useState(0);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function preview() {
    if (!file) return;
    setBusy(true); setMessage(""); setPreviewRows([]); setSourceRows([]); setDetectedTrainers([]);
    try {
      const form = new FormData(); form.set("file", file);
      const response = await fetch("/api/imports/" + kind, { method: "POST", body: form });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Lecture du document impossible.");
      setDetectedTrainers(data.trainers ?? []);
      if (!data.rows?.length && data.trainers?.length) {
        setMessage(`${data.trainers.length} nom(s) de formateur détecté(s). Aucun tableau de créneaux standard n’a été reconnu dans ce PDF.`);
        return;
      }
      setSourceRows(data.rows);
      const check = await fetch("/api/imports/" + kind, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "preview", rows: data.rows }) });
      const checked = await check.json();
      if (!check.ok) throw new Error(checked.error || "Prévisualisation impossible.");
      setPreviewRows(checked.rows ?? []);
      setInvalid(checked.invalid ?? 0);
      setMessage(`${checked.valid ?? 0} ligne(s) prête(s) à importer${checked.invalid ? `, ${checked.invalid} à corriger` : ""}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Une erreur est survenue.");
    } finally { setBusy(false); }
  }

  async function commit() {
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/imports/" + kind, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "import", rows: sourceRows }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Import impossible.");
      setSourceRows([]); setPreviewRows([]);
      setMessage(kind === "planning"
        ? `${data.imported} créneau(x) ajouté(s) au planning avec ${new Set(sourceRows.map((row) => row.room?.trim()).filter(Boolean)).size} salle(s) enregistrée(s).`
        : `${data.imported} apprenant(s) créé(s), ${data.skipped} doublon(s) ignoré(s). Les matricules ont été générés automatiquement.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Une erreur est survenue.");
    } finally { setBusy(false); }
  }

  async function revalidate(rows: Record<string, string>[]) {
    setBusy(true);
    try {
      const response = await fetch("/api/imports/" + kind, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "preview", rows }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Vérification des lignes impossible.");
      setPreviewRows(data.rows ?? []);
      setInvalid(data.invalid ?? 0);
      setMessage(data.invalid
        ? `${data.valid ?? 0} ligne(s) prête(s), ${data.invalid} à compléter ou corriger.`
        : `${data.valid ?? 0} ligne(s) prête(s) à enregistrer.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Vérification impossible.");
    } finally {
      setBusy(false);
    }
  }

  const columns = kind === "planning"
    ? ["weekday", "startTime", "endTime", "room", "className", "trainerName", "subject", "errors"]
    : ["firstName", "lastName", "phone", "email", "birthDate", "errors"];

  return (
    <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Importer depuis un document</h2>
        <p className="mt-1 text-sm text-slate-600">Excel (.xlsx), Word (.docx) ou PDF textuel · 10 Mo maximum. Vérifiez les lignes avant l’enregistrement.</p>
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <label className="min-w-64 flex-1 text-sm font-semibold text-slate-700">
          Choisir un fichier
          <input type="file" accept=".xlsx,.docx,.pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="mt-2 block w-full rounded-xl border border-slate-300 p-3 text-sm" />
        </label>
        <button type="button" onClick={preview} disabled={!file || busy} className="rounded-xl bg-indigo-800 px-5 py-3 font-bold text-white disabled:opacity-50">{busy ? "Lecture…" : "Lire et prévisualiser"}</button>
      </div>
      {kind === "planning" ? (
        <p className="rounded-xl bg-indigo-50 p-4 text-sm text-indigo-900">Colonnes requises : Jour, Début, Fin, Salle, Formateur et Cours ou Classe. Le formateur doit correspondre à un compte actif de la plateforme. Les salles détectées seront enregistrées avec les créneaux ; le Chef des travaux peut compléter celles qui manquent dans la prévisualisation.</p>
      ) : (
        <p className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-900">Colonnes requises : Prénom et Nom. Téléphone, e-mail et date de naissance sont facultatifs et pourront être complétés dans la fiche. Les matricules sont générés automatiquement.</p>
      )}
      {message && <p role="status" className="rounded-xl bg-slate-100 p-3 text-sm text-slate-800">{message}</p>}
      {detectedTrainers.length > 0 && (
        <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-4">
          <h3 className="font-bold text-cyan-950">Formateurs repérés dans le PDF</h3>
          <p className="mt-1 text-sm text-cyan-900">Vérifiez les noms abrégés avec la liste actuelle des comptes formateurs.</p>
          <ul className="mt-3 space-y-2 text-sm">
            {detectedTrainers.map((trainer) => <li key={trainer.name} className="flex flex-wrap gap-x-2">
              <span className="font-semibold">{trainer.name}</span>
              <span className="text-cyan-900">{trainer.matches.length ? `Compte(s) correspondant(s) : ${trainer.matches.join(", ")}` : "Aucun compte formateur correspondant."}</span>
              {trainer.personnelMatches?.length ? <span className="w-full text-cyan-900">Dossier(s) Personnel correspondant(s) : {trainer.personnelMatches.join(", ")}</span> : <span className="w-full text-cyan-900">Ajouté à la liste Personnel pour confirmation ou complément par le Chef des travaux.</span>}
            </li>)}
          </ul>
          {kind === "planning" && <a href="/personnel" className="mt-4 inline-flex rounded-lg bg-cyan-900 px-4 py-2 font-semibold text-white hover:bg-cyan-800">Ouvrir les dossiers à confirmer dans Personnel</a>}
        </div>
      )}
      {previewRows.length > 0 && (
        <>
          <div className="max-h-[28rem] overflow-auto rounded-xl border border-slate-200">
            <table className="min-w-full text-left text-sm">
              <thead className="sticky top-0 bg-slate-50 text-xs uppercase text-slate-600"><tr>{columns.map((key) => <th key={key} className="px-3 py-3">{labels[key] || "État"}</th>)}</tr></thead>
              <tbody>{previewRows.map((row, index) => {
                const errors = Array.isArray(row.errors) ? row.errors.join(", ") : "";
                return <tr key={index} className={errors ? "border-t bg-rose-50 text-rose-900" : "border-t"}>
                  {columns.map((key) => <td key={key} className="whitespace-nowrap px-3 py-2">{key === "errors" ? errors || "Prête" : key === "room" && kind === "planning" ? (
                    <input
                      aria-label={`Salle pour la ligne ${index + 1}`}
                      value={sourceRows[index]?.room ?? ""}
                      onChange={(event) => {
                        const next = [...sourceRows];
                        next[index] = { ...next[index], room: event.target.value };
                        setSourceRows(next);
                        setPreviewRows((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, room: event.target.value } : item));
                      }}
                      onBlur={() => void revalidate(sourceRows)}
                      placeholder="Salle à compléter"
                      className="w-36 rounded-md border border-slate-300 px-2 py-1"
                    />
                  ) : String(row[key] ?? "—")}</td>)}
                </tr>;
              })}</tbody>
            </table>
          </div>
          {kind === "planning" && sourceRows.some((item) => !item.room?.trim()) && (
            <p className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm font-medium text-amber-950">
              Chef des travaux : complétez les salles manquantes dans la colonne « Salle », puis quittez le champ pour revérifier les lignes avant l’enregistrement.
            </p>
          )}
          <button type="button" onClick={commit} disabled={busy || invalid > 0} className="rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">{busy ? "Enregistrement…" : kind === "planning" ? "Enregistrer les créneaux" : "Créer les apprenants"}</button>
        </>
      )}
    </section>
  );
}
