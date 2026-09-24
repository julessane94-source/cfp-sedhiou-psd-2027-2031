import Link from "next/link";
import { ArrowLeft, GraduationCap, Users } from "lucide-react";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function FormationsPage() {
  const formations = await prisma.training.findMany({
    where: { active: true },
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
  });

  const totalApprenants = await prisma.learner.count();

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-sky-700 hover:text-sky-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au tableau de bord
        </Link>

        <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold text-sky-700">
              CFP Sédhiou
            </p>

            <h1 className="mt-1 text-3xl font-bold text-slate-950">
              Formations
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Gestion des formations et suivi des apprenants.
            </p>
          </div>

          <div className="flex gap-3">
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-xs text-slate-400">
                Formations actives
              </p>
              <p className="mt-1 text-xl font-bold text-slate-900">
                {formations.length}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-xs text-slate-400">
                Apprenants
              </p>
              <p className="mt-1 text-xl font-bold text-slate-900">
                {totalApprenants}
              </p>
            </div>
          </div>
        </div>

        <section className="mt-8">
          {formations.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <GraduationCap className="mx-auto h-10 w-10 text-slate-400" />

              <h2 className="mt-4 font-bold text-slate-900">
                Aucune formation enregistrée
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Les formations pourront être ajoutées depuis le module
                d'administration.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {formations.map((formation) => (
                <article
                  key={formation.id}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="rounded-xl bg-sky-50 p-3">
                      <GraduationCap className="h-6 w-6 text-sky-700" />
                    </div>

                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      Active
                    </span>
                  </div>

                  <p className="mt-5 text-xs font-bold uppercase tracking-wide text-sky-700">
                    {formation.code}
                  </p>

                  <h2 className="mt-1 text-lg font-bold text-slate-950">
                    {formation.title}
                  </h2>

                  {formation.description && (
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {formation.description}
                    </p>
                  )}

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-xs text-slate-400">
                        Catégorie
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {formation.category ?? "—"}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-xs text-slate-400">
                        Niveau
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {formation.level ?? "—"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                    <Users className="h-4 w-4" />
                    <span>
                      {formation._count.enrollments} apprenant
                      {formation._count.enrollments !== 1 ? "s" : ""}
                    </span>
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
