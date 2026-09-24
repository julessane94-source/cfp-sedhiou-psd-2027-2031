import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Building2,
  GraduationCap,
  ShieldCheck,
  Users,
  BriefcaseBusiness,
} from "lucide-react";

const modules = [
  {
    title: "Tableau de bord",
    description: "Pilotage des indicateurs, objectifs et performances du CFP.",
    href: "/dashboard",
    icon: BarChart3,
  },
  {
    title: "Formations",
    description: "Gestion des formations, apprenants, programmes et résultats.",
    href: "/formations",
    icon: GraduationCap,
  },
  {
    title: "Infrastructures",
    description: "Suivi des bâtiments, équipements et environnement d’apprentissage.",
    href: "/infrastructures",
    icon: Building2,
  },
  {
    title: "Insertion",
    description: "Suivi de l’orientation, des stages, de l’emploi et de l’entrepreneuriat.",
    href: "/insertion",
    icon: BriefcaseBusiness,
  },
  {
    title: "Personnel",
    description: "Gestion des ressources humaines et du personnel.",
    href: "/personnel",
    icon: Users,
  },
  {
    title: "Sécurité",
    description: "Protection des données, accès et sécurité du système.",
    href: "/dashboard",
    icon: ShieldCheck,
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="max-w-4xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-sky-400">
              Centre de Formation Professionnelle de Sédhiou
            </p>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Plateforme numérique de pilotage du CFP Sédhiou
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
              Une plateforme moderne pour centraliser les formations,
              les apprenants, les infrastructures, les ressources humaines,
              l’insertion professionnelle et les indicateurs de performance.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-6 py-3 font-semibold text-white transition hover:bg-sky-400"
              >
                Accéder au tableau de bord
                <ArrowRight size={18} />
              </Link>

              <Link
                href="/formations"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-6 py-3 font-semibold text-white transition hover:bg-slate-800"
              >
                Voir les formations
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-sky-600">
            Plateforme CFP
          </p>

          <h2 className="mt-2 text-3xl font-bold tracking-tight">
            Les principaux espaces de gestion
          </h2>

          <p className="mt-3 max-w-2xl text-slate-600">
            Un accès structuré aux différents domaines du Centre de Formation
            Professionnelle de Sédhiou.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => {
            const Icon = module.icon;

            return (
              <Link
                key={module.title}
                href={module.href}
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                  <Icon size={24} />
                </div>

                <h3 className="text-xl font-semibold">
                  {module.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {module.description}
                </p>

                <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-sky-600">
                  Ouvrir
                  <ArrowRight
                    size={16}
                    className="transition group-hover:translate-x-1"
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-bold">
                CFP Sédhiou — PSD 2027–2031
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Plateforme numérique de gestion et de pilotage.
              </p>
            </div>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 font-semibold text-sky-600"
            >
              Tableau de bord
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
