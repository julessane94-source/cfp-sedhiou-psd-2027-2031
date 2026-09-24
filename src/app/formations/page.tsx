import Link from "next/link";
import { GraduationCap, Users, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function FormationsPage() {
  const [formations, learnerCount] = await Promise.all([
    prisma.training.findMany({
      where: {
        active: true,
      },
      include: {
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
      orderBy: {
        title: "asc",
      },
    }),
    prisma.learner.count(),
  ]);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <GraduationCap className="h-8 w-8 text-slate-700" />
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Formations
              </h1>
            </div>

            <p className="mt-2 text-slate-600">
              Gestion des formations et des apprenants du CFP Sédhiou.
            </p>
          </div>

          <Link
            href="/formations/admin"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            Administration
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-6 w-6 text-slate-600" />

              <div>
                <p className="text-sm text-slate-500">
                  Formations actives
                </p>

                <p className="text-2xl font-bold text-slate-900">
                  {formations.length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6 text-slate-600" />

              <div>
                <p className="text-sm text-slate-500">
                  Apprenants
                </p>

                <p className="text-2xl font-bold text-slate-900">
                  {learnerCount}
                </p>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-8">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-900">
              Catalogue des formations
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Formations actuellement actives au CFP Sédhiou.
            </p>
          </div>

          {formations.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <GraduationCap className="mx-auto h-10 w-10 text-slate-400" />

              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                Aucune formation enregistrée
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Utilisez l'espace Administration pour ajouter une formation.
              </p>

              <Link
                href="/formations/admin"
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Ajouter une formation
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {formations.map((formation) => (
                <article
                  key={formation.id}
                  className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="inline-flex rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                        {formation.code}
                      </span>

                      <h3 className="mt-3 text-lg font-bold text-slate-900">
                        {formation.title}
                      </h3>
                    </div>

                    <GraduationCap className="h-6 w-6 shrink-0 text-slate-500" />
                  </div>

                  {formation.description && (
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {formation.description}
                    </p>
                  )}

                  <div className="mt-5 space-y-2 text-sm text-slate-600">
                    {formation.category && (
                      <p>
                        <span className="font-semibold">Catégorie :</span>{" "}
                        {formation.category}
                      </p>
                    )}

                    {formation.level && (
                      <p>
                        <span className="font-semibold">Niveau :</span>{" "}
                        {formation.level}
                      </p>
                    )}

                    {formation.duration && (
                      <p>
                        <span className="font-semibold">Durée :</span>{" "}
                        {formation.duration}
                      </p>
                    )}

                    <p className="flex items-center gap-2 pt-2 font-medium text-slate-700">
                      <Users className="h-4 w-4" />
                      {formation._count.enrollments} apprenant
                      {formation._count.enrollments > 1 ? "s" : ""}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
