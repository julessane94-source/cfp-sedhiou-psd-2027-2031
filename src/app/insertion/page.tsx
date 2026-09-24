import { prisma } from "@/lib/prisma";

export default async function InsertionPage() {
  const [learners, insertions] = await Promise.all([
    prisma.learner.findMany({
      orderBy: { lastName: "asc" },
    }),
    prisma.insertion.findMany({
      include: { learner: true },
      orderBy: { year: "desc" },
    }),
  ]);

  const emploi = insertions.filter((i) => i.status === "EMPLOI").length;
  const stage = insertions.filter((i) => i.status === "STAGE").length;
  const autoEmploi = insertions.filter(
    (i) => i.status === "AUTO_EMPLOI" || i.status === "ENTREPRENEUR"
  ).length;

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <h1 className="text-3xl font-bold">Insertion professionnelle</h1>
      <p className="mt-2 text-slate-600">
        Suivi de l’insertion des apprenants après leur formation.
      </p>

      <section className="mt-6 grid gap-4 md:grid-cols-4">
        <div className="rounded-xl bg-white p-5 shadow">
          <p className="text-sm text-slate-500">Apprenants</p>
          <p className="text-3xl font-bold">{learners.length}</p>
        </div>
        <div className="rounded-xl bg-white p-5 shadow">
          <p className="text-sm text-slate-500">Emploi</p>
          <p className="text-3xl font-bold">{emploi}</p>
        </div>
        <div className="rounded-xl bg-white p-5 shadow">
          <p className="text-sm text-slate-500">Stages</p>
          <p className="text-3xl font-bold">{stage}</p>
        </div>
        <div className="rounded-xl bg-white p-5 shadow">
          <p className="text-sm text-slate-500">Auto-emploi / entrepreneuriat</p>
          <p className="text-3xl font-bold">{autoEmploi}</p>
        </div>
      </section>

      <section className="mt-8 rounded-xl bg-white p-6 shadow">
        <h2 className="text-xl font-semibold">Enregistrer une insertion</h2>

        <form action="/api/insertion" method="post"
          className="mt-4 grid gap-3 md:grid-cols-2">
          <input type="hidden" name="action" value="create" />

          <select name="learnerId" required className="rounded-lg border p-3">
            <option value="">Sélectionner un apprenant</option>
            {learners.map((learner) => (
              <option key={learner.id} value={learner.id}>
                {learner.lastName} {learner.firstName} — {learner.matricule}
              </option>
            ))}
          </select>

          <input name="year" type="number" min="2000" required
            placeholder="Année de suivi" className="rounded-lg border p-3" />

          <select name="status" required className="rounded-lg border p-3">
            <option value="EN_RECHERCHE">En recherche</option>
            <option value="STAGE">Stage</option>
            <option value="EMPLOI">Emploi</option>
            <option value="AUTO_EMPLOI">Auto-emploi</option>
            <option value="ENTREPRENEUR">Entrepreneur</option>
            <option value="SANS_EMPLOI">Sans emploi</option>
          </select>

          <input name="structure" placeholder="Entreprise / structure"
            className="rounded-lg border p-3" />

          <input name="position" placeholder="Poste occupé"
            className="rounded-lg border p-3" />

          <input name="contractType" placeholder="Type de contrat"
            className="rounded-lg border p-3" />

          <input name="startDate" type="date"
            className="rounded-lg border p-3" />

          <input name="salary" type="number" step="0.01"
            placeholder="Salaire mensuel"
            className="rounded-lg border p-3" />

          <textarea name="notes" placeholder="Observations"
            className="rounded-lg border p-3 md:col-span-2" />

          <button type="submit"
            className="rounded-lg bg-slate-900 px-5 py-3 font-medium text-white md:col-span-2">
            Enregistrer le suivi
          </button>
        </form>
      </section>

      <section className="mt-8 rounded-xl bg-white p-6 shadow">
        <h2 className="text-xl font-semibold">Historique des insertions</h2>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b">
                <th className="p-3">Apprenant</th>
                <th className="p-3">Année</th>
                <th className="p-3">Situation</th>
                <th className="p-3">Structure</th>
                <th className="p-3">Poste</th>
              </tr>
            </thead>
            <tbody>
              {insertions.map((insertion) => (
                <tr key={insertion.id} className="border-b">
                  <td className="p-3">
                    {insertion.learner.lastName} {insertion.learner.firstName}
                  </td>
                  <td className="p-3">{insertion.year}</td>
                  <td className="p-3">{insertion.status}</td>
                  <td className="p-3">{insertion.structure || "-"}</td>
                  <td className="p-3">{insertion.position || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
