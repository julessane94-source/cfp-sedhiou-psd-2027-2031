import Link from "next/link";
import { ArrowRight, Target, Layers3, CheckCircle2 } from "lucide-react";
import { PSD_AXES } from "@/data/psd";

export default function PSDPage() {
  const totalObjectives = PSD_AXES.reduce(
    (total, axis) => total + axis.objectives.length,
    0
  );

  return (
    <main className="space-y-8">
      {/* EN-TÊTE */}
      <section className="rounded-2xl bg-slate-900 p-6 text-white shadow-sm">
        <div className="max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-300">
            Pilotage stratégique
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            PSD 2027–2031
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
            Tableau de bord du Plan de Développement Stratégique du Centre de
            Formation Professionnelle de Sédhiou.
          </p>
        </div>
      </section>

      {/* INDICATEURS GÉNÉRAUX */}
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-slate-100 p-3">
              <Layers3 className="h-5 w-5 text-slate-700" />
            </div>

            <div>
              <p className="text-sm text-slate-500">Axes stratégiques</p>
              <p className="text-2xl font-bold text-slate-900">
                {PSD_AXES.length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-slate-100 p-3">
              <Target className="h-5 w-5 text-slate-700" />
            </div>

            <div>
              <p className="text-sm text-slate-500">Objectifs recensés</p>
              <p className="text-2xl font-bold text-slate-900">
                {totalObjectives}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-slate-100 p-3">
              <CheckCircle2 className="h-5 w-5 text-slate-700" />
            </div>

            <div>
              <p className="text-sm text-slate-500">Période</p>
              <p className="text-2xl font-bold text-slate-900">2027–2031</p>
            </div>
          </div>
        </div>
      </section>

      {/* AXES STRATÉGIQUES */}
      <section>
        <div className="mb-5">
          <h2 className="text-xl font-bold text-slate-900">
            Les 5 axes stratégiques
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Sélectionnez un axe pour consulter ses objectifs et son pilotage.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {PSD_AXES.map((axis) => (
            <Link
              key={axis.code}
              href={`/dashboard/psd/${axis.code
                .toLowerCase()
                .replaceAll(" ", "-")}`}
              className="group rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
                    {axis.code.replace("AXE ", "")}
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      {axis.code}
                    </p>

                    <h3 className="mt-1 text-lg font-bold text-slate-900">
                      {axis.title}
                    </h3>
                  </div>
                </div>

                <ArrowRight
                  className="mt-1 h-5 w-5 shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-slate-900"
                />
              </div>

              <p className="mt-5 text-sm leading-6 text-slate-600">
                {axis.purpose}
              </p>

              <div className="mt-5 border-t pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Objectifs
                  </span>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {axis.objectives.length}
                  </span>
                </div>

                <ul className="mt-3 space-y-2">
                  {axis.objectives.slice(0, 3).map((objective) => (
                    <li
                      key={objective}
                      className="flex gap-2 text-sm text-slate-600"
                    >
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                      <span>{objective}</span>
                    </li>
                  ))}
                </ul>

                {axis.objectives.length > 3 && (
                  <p className="mt-3 text-xs font-medium text-slate-400">
                    + {axis.objectives.length - 3} autre
                    {axis.objectives.length - 3 > 1 ? "s" : ""} objectif
                    {axis.objectives.length - 3 > 1 ? "s" : ""}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
