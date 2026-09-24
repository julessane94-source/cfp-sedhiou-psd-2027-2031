import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Building2,
  BriefcaseBusiness,
  GraduationCap,
  ShieldCheck,
  Target,
  Users,
} from "lucide-react";
import { PSD_AXES } from "@/data/psd";

const stats = [
  {
    label: "Axes stratégiques",
    value: PSD_AXES.length,
    icon: Target,
    description: "Axes du PSD 2027–2031",
  },
  {
    label: "Objectifs",
    value: PSD_AXES.reduce(
      (total, axis) => total + axis.objectives.length,
      0
    ),
    icon: BarChart3,
    description: "Objectifs opérationnels",
  },
  {
    label: "Formations",
    value: "—",
    icon: GraduationCap,
    description: "À renseigner",
  },
  {
    label: "Apprenants",
    value: "—",
    icon: Users,
    description: "À renseigner",
  },
];

const quickLinks = [
  {
    title: "Formations",
    description: "Programmes, filières et suivi pédagogique",
    href: "/formations",
    icon: GraduationCap,
  },
  {
    title: "Infrastructures",
    description: "Équipements, bâtiments et environnement",
    href: "/infrastructures",
    icon: Building2,
  },
  {
    title: "Insertion",
    description: "Stages, emploi et entrepreneuriat",
    href: "/insertion",
    icon: BriefcaseBusiness,
  },
  {
    title: "Personnel",
    description: "Ressources humaines et administration",
    href: "/personnel",
    icon: Users,
  },
  {
    title: "Sécurité",
    description: "Accès, protection et sécurité numérique",
    href: "/dashboard",
    icon: ShieldCheck,
  },
];

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-sky-600">
            CFP Sédhiou
          </p>

          <div className="mt-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-950">
                Tableau de bord
              </h1>

              <p className="mt-2 max-w-3xl text-slate-600">
                Pilotage stratégique et opérationnel du Plan de Développement
                Stratégique 2027–2031.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Période
              </p>
              <p className="mt-1 font-bold text-slate-900">
                2027 — 2031
              </p>
            </div>
          </div>
        </div>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                    <Icon size={22} />
                  </div>

                  <span className="text-xs font-medium text-slate-400">
                    PSD
                  </span>
                </div>

                <p className="mt-5 text-sm font-medium text-slate-500">
                  {stat.label}
                </p>

                <p className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
                  {stat.value}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {stat.description}
                </p>
              </div>
            );
          })}
        </section>

        <section className="mt-8">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-950">
              Axes stratégiques
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Suivi des orientations et objectifs du PSD.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {PSD_AXES.map((axis) => (
              <Link
                key={axis.code}
                href={`/dashboard/psd/${axis.code.toLowerCase().replace(/\s+/g, "-")}`}
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                      <Target size={21} />
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-sky-600">
                        {axis.code}
                      </p>

                      <h3 className="mt-1 font-bold text-slate-950">
                        {axis.title}
                      </h3>
                    </div>
                  </div>

                  <ArrowRight
                    size={20}
                    className="mt-2 text-slate-400 transition group-hover:translate-x-1 group-hover:text-sky-600"
                  />
                </div>

                <p className="mt-5 text-sm leading-6 text-slate-600">
                  {axis.purpose}
                </p>

                <div className="mt-5 border-t border-slate-100 pt-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Objectifs
                  </p>

                  <ul className="mt-3 space-y-2">
                    {axis.objectives.slice(0, 3).map((objective) => (
                      <li
                        key={objective}
                        className="flex gap-2 text-sm text-slate-600"
                      >
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500" />
                        <span>{objective}</span>
                      </li>
                    ))}
                  </ul>

                  {axis.objectives.length > 3 && (
                    <p className="mt-3 text-xs font-semibold text-sky-600">
                      + {axis.objectives.length - 3} autre(s) objectif(s)
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-950">
              Accès rapide
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {quickLinks.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <Icon className="text-sky-600" size={23} />

                  <h3 className="mt-4 font-bold text-slate-900">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    {item.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mt-8 rounded-2xl bg-slate-950 p-6 text-white shadow-sm">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={20} className="text-emerald-400" />
                <h2 className="font-bold">
                  Gouvernance et sécurité
                </h2>
              </div>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                La sécurité numérique sera traitée comme un volet distinct :
                contrôle des accès, protection des données, sauvegardes,
                traçabilité et continuité de service.
              </p>
            </div>

            <Link
              href="/dashboard"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-950"
            >
              Consulter
              <ArrowRight size={17} />
            </Link>
          </div>
        </section>

      </div>
    </main>
  );
}
