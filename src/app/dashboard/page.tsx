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

import { prisma } from "@/lib/prisma";
import { PSD_AXES } from "@/data/psd";

export const dynamic = "force-dynamic";

const formatNumber = (value: number) =>
  new Intl.NumberFormat("fr-FR").format(value);

const formatCFA = (value: number) =>
  new Intl.NumberFormat("fr-SN", {
    style: "currency",
    currency: "XOF",
    maximumFractionDigits: 0,
  }).format(value);

export default async function DashboardPage() {
  const [
    axisCount,
    objectiveCount,
    trainingCount,
    learnerCount,
    budgetTotals,
  ] = await Promise.all([
    prisma.pSDAxis.count(),
    prisma.pSDObjective.count(),
    prisma.training.count({
      where: { active: true },
    }),
    prisma.learner.count(),
    prisma.budgetLine.aggregate({
      _sum: {
        allocated: true,
        spent: true,
        committed: true,
      },
    }),
  ]);

  const allocated = Number(budgetTotals._sum.allocated ?? 0);
  const committed = Number(budgetTotals._sum.committed ?? 0);
  const spent = Number(budgetTotals._sum.spent ?? 0);

  const stats = [
    {
      label: "Axes stratégiques",
      value: formatNumber(axisCount),
      icon: Target,
      description: "Axes du PSD 2027–2031",
    },
    {
      label: "Objectifs",
      value: formatNumber(objectiveCount),
      icon: BarChart3,
      description: "Objectifs opérationnels",
    },
    {
      label: "Formations actives",
      value: formatNumber(trainingCount),
      icon: GraduationCap,
      description: "Formations enregistrées",
    },
    {
      label: "Apprenants",
      value: formatNumber(learnerCount),
      icon: Users,
      description: "Apprenants enregistrés",
    },
  ];

  const quickLinks = [
    {
      title: "Formations",
      description: "Gérer les formations et les apprenants",
      href: "/formations",
      icon: GraduationCap,
    },
    {
      title: "Infrastructures",
      description: "Suivre le patrimoine et les équipements",
      href: "/infrastructures",
      icon: Building2,
    },
    {
      title: "Insertion",
      description: "Suivre l'insertion professionnelle",
      href: "/insertion",
      icon: BriefcaseBusiness,
    },
    {
      title: "Personnel",
      description: "Gérer les ressources humaines",
      href: "/personnel",
      icon: Users,
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold text-sky-700">
              CFP Sédhiou
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
              Tableau de bord
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Pilotage administratif, financier et opérationnel —
              PSD 2027–2031
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Période stratégique
            </p>
            <p className="mt-1 font-semibold text-slate-900">
              2027–2031
            </p>
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
                  <div className="rounded-xl bg-sky-50 p-3">
                    <Icon className="h-5 w-5 text-sky-700" />
                  </div>

                  <span className="text-xs font-medium text-emerald-600">
                    Données réelles
                  </span>
                </div>

                <p className="mt-5 text-sm font-medium text-slate-500">
                  {stat.label}
                </p>

                <p className="mt-1 text-3xl font-bold text-slate-950">
                  {stat.value}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {stat.description}
                </p>
              </div>
            );
          })}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-sky-700">
                  PSD 2027–2031
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-950">
                  Axes stratégiques
                </h2>
              </div>

              <Target className="h-6 w-6 text-sky-700" />
            </div>

            <div className="mt-6 grid gap-3">
              {PSD_AXES.map((axis) => (
                <div
                  key={axis.code}
                  className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-sky-700">
                        {axis.code}
                      </p>

                      <h3 className="mt-1 font-semibold text-slate-900">
                        {axis.title}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        {axis.purpose}
                      </p>
                    </div>

                    <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500">
                      {axis.objectives.length} objectif
                      {axis.objectives.length > 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-50 p-3">
                <BarChart3 className="h-5 w-5 text-emerald-700" />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Situation financière
                </p>
                <h2 className="text-xl font-bold text-slate-950">
                  Budget
                </h2>
              </div>
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Budget alloué
                </p>
                <p className="mt-1 text-xl font-bold text-slate-900">
                  {formatCFA(allocated)}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Engagements
                </p>
                <p className="mt-1 text-xl font-bold text-slate-900">
                  {formatCFA(committed)}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Dépenses
                </p>
                <p className="mt-1 text-xl font-bold text-slate-900">
                  {formatCFA(spent)}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-slate-950">
              Accès rapide
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Accéder aux principaux modules de la plateforme.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickLinks.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <Icon className="h-6 w-6 text-sky-700" />

                  <h3 className="mt-4 font-bold text-slate-900">
                    {item.title}
                  </h3>

                  <p className="mt-1 text-sm leading-5 text-slate-500">
                    {item.description}
                  </p>

                  <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-sky-700">
                    Ouvrir
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mt-8 rounded-2xl bg-slate-950 p-6 text-white shadow-sm">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-white/10 p-3">
                <ShieldCheck className="h-6 w-6 text-emerald-400" />
              </div>

              <div>
                <h2 className="font-bold">
                  Gouvernance et sécurité
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                  La sécurité numérique sera traitée comme un volet
                  distinct : contrôle des accès, protection des données,
                  sauvegardes, traçabilité et continuité de service.
                </p>
              </div>
            </div>

            <Link
              href="/dashboard"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-950"
            >
              Consulter
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
