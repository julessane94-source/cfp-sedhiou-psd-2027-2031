import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  Target,
} from "lucide-react";
import { PSD_AXES } from "@/data/psd";

type PageProps = {
  params: Promise<{
    code: string;
  }>;
};

function normalizeCode(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

export default async function PSDAxisPage({ params }: PageProps) {
  const { code } = await params;

  const axis = PSD_AXES.find(
    (item) => normalizeCode(item.code) === code
  );

  if (!axis) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">

        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-sky-600"
        >
          <ArrowLeft size={17} />
          Retour au tableau de bord
        </Link>

        <section className="rounded-2xl bg-slate-950 p-6 text-white shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="max-w-4xl">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-sky-400">
                {axis.code}
              </p>

              <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                {axis.title}
              </h1>

              <p className="mt-5 max-w-3xl text-base leading-7 text-slate-300">
                {axis.purpose}
              </p>
            </div>

            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10">
              <Target size={28} className="text-sky-400" />
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <Target className="text-sky-600" size={22} />

            <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Objectifs
            </p>

            <p className="mt-1 text-3xl font-bold text-slate-950">
              {axis.objectives.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <CalendarDays className="text-sky-600" size={22} />

            <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Période
            </p>

            <p className="mt-1 text-3xl font-bold text-slate-950">
              2027–2031
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <BarChart3 className="text-sky-600" size={22} />

            <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Suivi
            </p>

            <p className="mt-1 text-3xl font-bold text-slate-950">
              À renseigner
            </p>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-slate-950">
              Objectifs opérationnels
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Objectifs enregistrés pour cet axe dans les données du PSD.
            </p>
          </div>

          <div className="space-y-4">
            {axis.objectives.map((objective, index) => (
              <div
                key={objective}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 font-bold text-sky-600">
                    {index + 1}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">
                      {objective}
                    </h3>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-xs text-slate-500">
                          Indicateur
                        </p>
                        <p className="mt-1 text-sm font-medium text-slate-700">
                          À définir
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-xs text-slate-500">
                          Échéance
                        </p>
                        <p className="mt-1 text-sm font-medium text-slate-700">
                          2027–2031
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-xs text-slate-500">
                          Avancement
                        </p>
                        <p className="mt-1 text-sm font-medium text-slate-700">
                          Non renseigné
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <div className="flex gap-4">
            <CircleAlert
              size={24}
              className="shrink-0 text-amber-600"
            />

            <div>
              <h2 className="font-bold text-amber-900">
                Données de pilotage à compléter
              </h2>

              <p className="mt-2 text-sm leading-6 text-amber-800">
                Les indicateurs, responsables, budgets, échéances détaillées
                et niveaux d’avancement pourront être renseignés dans
                l’étape suivante de la plateforme.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
          <div className="flex gap-4">
            <CheckCircle2
              size={24}
              className="shrink-0 text-emerald-600"
            />

            <div>
              <h2 className="font-bold text-emerald-900">
                Structure de suivi prête
              </h2>

              <p className="mt-2 text-sm leading-6 text-emerald-800">
                Cette fiche servira de base pour le suivi annuel et
                pluriannuel du PSD 2027–2031.
              </p>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
