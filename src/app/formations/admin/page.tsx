import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function FormationsAdminPage() {
  const [formations, learners] = await Promise.all([
    prisma.training.findMany({
      where: { active: true },
      orderBy: { title: "asc" },
    }),
    prisma.learner.findMany({
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    }),
  ]);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Administration des formations
            </h1>
            <p className="mt-2 text-slate-600">
              Gestion des formations, des apprenants et des inscriptions.
            </p>
          </div>

          <Link
            href="/formations"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            ← Retour aux formations
          </Link>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">
              Ajouter une formation
            </h2>

            <form
              action="/api/formations/admin"
              method="POST"
              className="mt-6 space-y-4"
            >
              <input type="hidden" name="action" value="formation" />

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Code
                </label>
                <input
                  name="code"
                  required
                  placeholder="Ex. INFO-01"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Nom de la formation
                </label>
                <input
                  name="title"
                  required
                  placeholder="Nom de la formation"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Catégorie
                </label>
                <input
                  name="category"
                  placeholder="Ex. Informatique"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Niveau
                </label>
                <input
                  name="level"
                  placeholder="Ex. CAP, BT, BTS..."
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Durée
                </label>
                <input
                  name="duration"
                  placeholder="Ex. 2 ans"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-slate-900 px-4 py-2.5 font-semibold text-white hover:bg-slate-800"
              >
                Ajouter la formation
              </button>
            </form>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">
              Ajouter un apprenant
            </h2>

            <form
              action="/api/formations/admin"
              method="POST"
              className="mt-6 space-y-4"
            >
              <input type="hidden" name="action" value="apprenant" />

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Matricule
                </label>
                <input
                  name="matricule"
                  required
                  placeholder="Matricule"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Prénom
                </label>
                <input
                  name="firstName"
                  required
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Nom
                </label>
                <input
                  name="lastName"
                  required
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Téléphone
                </label>
                <input
                  name="phone"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-slate-900 px-4 py-2.5 font-semibold text-white hover:bg-slate-800"
              >
                Ajouter l'apprenant
              </button>
            </form>
          </section>
        </div>

        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">
            Inscrire un apprenant
          </h2>

          <form
            action="/api/formations/admin"
            method="POST"
            className="mt-6 grid gap-4 md:grid-cols-2"
          >
            <input type="hidden" name="action" value="inscription" />

            <div>
              <label className="text-sm font-medium text-slate-700">
                Apprenant
              </label>
              <select
                name="learnerId"
                required
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              >
                <option value="">Sélectionner un apprenant</option>
                {learners.map((learner) => (
                  <option key={learner.id} value={learner.id}>
                    {learner.matricule} — {learner.firstName}{" "}
                    {learner.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Formation
              </label>
              <select
                name="trainingId"
                required
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              >
                <option value="">Sélectionner une formation</option>
                {formations.map((formation) => (
                  <option key={formation.id} value={formation.id}>
                    {formation.code} — {formation.title}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="md:col-span-2 rounded-lg bg-slate-900 px-4 py-2.5 font-semibold text-white hover:bg-slate-800"
            >
              Inscrire l'apprenant
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
