import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminFormations() {
  const [learners, trainings] = await Promise.all([
    prisma.learner.findMany({
      include: {
        enrollments: {
          include: { training: true },
          orderBy: { startDate: "desc" },
        },
      },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    }),
    prisma.training.findMany({
      where: { active: true },
      orderBy: { title: "asc" },
    }),
  ]);

  return (
    <main className="min-h-screen bg-slate-50 p-4">
      <div className="mx-auto max-w-7xl space-y-6">
        <header>
          <Link href="/formations" className="text-blue-600">
            ← Formations
          </Link>
          <h1 className="mt-2 text-3xl font-bold">
            Administration des formations
          </h1>
          <p className="text-slate-600">
            Apprenants et suivi des parcours.
          </p>
        </header>

        <section className="rounded-xl bg-white p-5 shadow">
          <h2 className="mb-4 text-xl font-bold">
            Ajouter une formation
          </h2>

          <form
            action="/api/formations/admin"
            method="post"
            className="grid gap-3 md:grid-cols-4"
          >
            <input type="hidden" name="action" value="formation" />

            <input
              name="code"
              placeholder="Code"
              required
              className="rounded border p-3"
            />

            <input
              name="title"
              placeholder="Nom de la formation"
              required
              className="rounded border p-3"
            />

            <input
              name="category"
              placeholder="Filière"
              className="rounded border p-3"
            />

            <input
              name="duration"
              placeholder="Durée"
              className="rounded border p-3"
            />

            <button className="rounded bg-blue-600 p-3 font-semibold text-white">
              Ajouter
            </button>
          </form>
        </section>

        <section className="rounded-xl bg-white p-5 shadow">
          <h2 className="mb-4 text-xl font-bold">
            Ajouter un apprenant
          </h2>

          <form
            action="/api/formations/admin"
            method="post"
            className="grid gap-3 md:grid-cols-3"
          >
            <input type="hidden" name="action" value="apprenant" />

            <input
              name="firstName"
              placeholder="Prénom"
              required
              className="rounded border p-3"
            />

            <input
              name="lastName"
              placeholder="Nom"
              required
              className="rounded border p-3"
            />

            <input
              name="birthDate"
              type="date"
              required
              className="rounded border p-3"
            />

            <input
              name="integrationYear"
              type="number"
              placeholder="Année d'intégration"
              required
              className="rounded border p-3"
            />

            <input
              name="phone"
              placeholder="Téléphone"
              className="rounded border p-3"
            />

            <input
              name="email"
              type="email"
              placeholder="Email"
              className="rounded border p-3"
            />

            <button className="rounded bg-emerald-600 p-3 font-semibold text-white">
              Ajouter l'apprenant
            </button>
          </form>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-bold">
            Liste des apprenants
          </h2>

          <div className="space-y-5">
            {learners.length === 0 && (
              <div className="rounded-xl bg-white p-6 text-slate-500 shadow">
                Aucun apprenant enregistré.
              </div>
            )}

            {learners.map((learner) => {
              const current = learner.enrollments[0];

              let sameLevel = 0;

              if (current?.level) {
                for (const e of learner.enrollments) {
                  if (e.level === current.level) sameLevel++;
                  else break;
                }
              }

              const canRepeat = sameLevel < 2;

              return (
                <article
                  key={learner.id}
                  className="rounded-xl bg-white p-5 shadow"
                >
                  <div className="mb-4">
                    <h3 className="text-xl font-bold">
                      {learner.firstName} {learner.lastName}
                    </h3>

                    <p className="text-sm text-slate-600">
                      Matricule :
                      <strong className="ml-1">
                        {learner.matricule}
                      </strong>
                    </p>

                    <p className="text-sm text-slate-600">
                      Intégration :
                      {learner.integrationYear ?? "Non renseignée"}
                    </p>

                    <details className="mt-3">
                      <summary className="inline-block cursor-pointer rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white">
                        ✏️ Modifier les informations
                      </summary>

                      <form
                        action="/api/formations/admin"
                        method="post"
                        className="mt-3 grid gap-3 rounded-lg border bg-slate-50 p-4 md:grid-cols-2"
                      >
                        <input
                          type="hidden"
                          name="action"
                          value="modifierApprenant"
                        />

                        <input
                          type="hidden"
                          name="learnerId"
                          value={learner.id}
                        />

                        <input
                          name="firstName"
                          defaultValue={learner.firstName}
                          placeholder="Prénom"
                          required
                          className="rounded border p-3"
                        />

                        <input
                          name="lastName"
                          defaultValue={learner.lastName}
                          placeholder="Nom"
                          required
                          className="rounded border p-3"
                        />

                        <input
                          name="birthDate"
                          type="date"
                          defaultValue={
                            learner.birthDate
                              ? learner.birthDate.toISOString().slice(0, 10)
                              : ""
                          }
                          required
                          className="rounded border p-3"
                        />

                        <input
                          name="phone"
                          defaultValue={learner.phone ?? ""}
                          placeholder="Téléphone"
                          className="rounded border p-3"
                        />

                        <input
                          name="email"
                          type="email"
                          defaultValue={learner.email ?? ""}
                          placeholder="Email"
                          className="rounded border p-3"
                        />

                        <div className="md:col-span-2">
                          <div className="mb-2 text-sm text-slate-500">
                            Matricule permanent : <strong>{learner.matricule}</strong>
                          </div>

                          <button
                            type="submit"
                            className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white"
                          >
                            Enregistrer les modifications
                          </button>
                        </div>
                      </form>
                    </details>
                  </div>

                  {!current ? (
                    <form
                      action="/api/formations/admin"
                      method="post"
                      className="grid gap-3 md:grid-cols-3"
                    >
                      <input
                        type="hidden"
                        name="action"
                        value="inscription"
                      />

                      <input
                        type="hidden"
                        name="learnerId"
                        value={learner.id}
                      />

                      <select
                        name="trainingId"
                        required
                        className="rounded border p-3"
                      >
                        <option value="">
                          Choisir la formation
                        </option>

                        {trainings.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.code} — {t.title}
                          </option>
                        ))}
                      </select>

                      <input
                        name="academicYear"
                        defaultValue="2026-2027"
                        className="rounded border p-3"
                      />

                      <select
                        name="level"
                        className="rounded border p-3"
                      >
                        <option value="">Niveau</option>
                        <option value="1ère année">1ère année</option>
                        <option value="2ème année">2ème année</option>
                        <option value="3ème année">3ème année</option>
                      </select>

                      <button className="rounded bg-emerald-600 p-3 font-semibold text-white">
                        Inscrire
                      </button>
                    </form>
                  ) : (
                    <>
                      <div className="rounded-lg border p-4">
                        <div className="grid gap-3 md:grid-cols-4">
                          <div>
                            <small>Année</small>
                            <div className="font-semibold">
                              {current.academicYear}
                            </div>
                          </div>

                          <div>
                            <small>Formation</small>
                            <div className="font-semibold">
                              {current.training.title}
                            </div>
                          </div>

                          <div>
                            <small>Niveau</small>
                            <div className="font-semibold">
                              {current.level ?? "Non renseigné"}
                            </div>
                          </div>

                          <div>
                            <small>Statut</small>
                            <div className="font-semibold">
                              {current.status ?? "Non renseigné"}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {current.level !== "3ème année" && (
                          <form
                            action="/api/formations/admin"
                            method="post"
                          >
                            <input
                              type="hidden"
                              name="action"
                              value="passer"
                            />
                            <input
                              type="hidden"
                              name="enrollmentId"
                              value={current.id}
                            />
                            <button className="rounded bg-emerald-600 px-4 py-2 font-semibold text-white">
                              ✓ PASSER
                            </button>
                          </form>
                        )}

                        {canRepeat && current.level && (
                          <form
                            action="/api/formations/admin"
                            method="post"
                          >
                            <input
                              type="hidden"
                              name="action"
                              value="redoubler"
                            />
                            <input
                              type="hidden"
                              name="enrollmentId"
                              value={current.id}
                            />
                            <button className="rounded bg-amber-500 px-4 py-2 font-semibold text-white">
                              ↻ REDOUBLER
                            </button>
                          </form>
                        )}

                        <form
                          action="/api/formations/admin"
                          method="post"
                        >
                          <input
                            type="hidden"
                            name="action"
                            value="suspendre"
                          />
                          <input
                            type="hidden"
                            name="enrollmentId"
                            value={current.id}
                          />
                          <button className="rounded bg-red-600 px-4 py-2 font-semibold text-white">
                            ⏸ SUSPENDRE
                          </button>
                        </form>
                      </div>

                      {!canRepeat && (
                        <div className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-800">
                          Redoublement bloqué après deux années
                          consécutives au même niveau.
                        </div>
                      )}
                    </>
                  )}

                  <div className="mt-5 border-t pt-4">
                    <h4 className="mb-3 font-semibold">
                      Historique du parcours
                    </h4>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="p-2">Année</th>
                            <th className="p-2">Formation</th>
                            <th className="p-2">Niveau</th>
                            <th className="p-2">Statut</th>
                          </tr>
                        </thead>

                        <tbody>
                          {learner.enrollments.map((e) => (
                            <tr
                              key={e.id}
                              className="border-b"
                            >
                              <td className="p-2">
                                {e.academicYear}
                              </td>

                              <td className="p-2">
                                {e.training.code} —{" "}
                                {e.training.title}
                              </td>

                              <td className="p-2">
                                {e.level ?? "Non renseigné"}
                              </td>

                              <td className="p-2">
                                {e.status ?? "Non renseigné"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
