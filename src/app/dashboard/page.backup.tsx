import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const [
    agents,
    learners,
    trainings,
    assets,
    budgets,
    operations,
    incidents,
    documents,
    notifications,
  ] = await Promise.all([
    prisma.agent.count(),
    prisma.learner.count(),
    prisma.training.count(),
    prisma.asset.count(),
    prisma.budget.count(),
    prisma.financialOperation.count(),
    prisma.securityIncident.count(),
    prisma.document.count(),
    prisma.notification.count({
      where: { read: false },
    }),
  ]);

  return (
    <main className="min-h-screen p-6">
      <h1 className="text-3xl font-bold">
        Tableau de bord
      </h1>

      <p className="mt-2 text-slate-500">
        Vue globale de la plateforme administrative et financière du CFP Sédhiou.
      </p>

      <section className="mt-8 grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        <Card title="Personnel" value={agents} />
        <Card title="Apprenants" value={learners} />
        <Card title="Formations" value={trainings} />
        <Card title="Patrimoine" value={assets} />
        <Card title="Budgets" value={budgets} />
        <Card title="Opérations financières" value={operations} />
        <Card title="Incidents sécurité" value={incidents} />
        <Card title="Documents" value={documents} />
      </section>

      <section className="mt-8 rounded-xl bg-white p-6 shadow">
        <h2 className="text-xl font-semibold">
          Notifications
        </h2>

        <p className="mt-3 text-3xl font-bold">
          {notifications}
        </p>

        <p className="text-slate-500">
          notification(s) non lue(s)
        </p>
      </section>
    </main>
  );
}

function Card({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div className="rounded-xl bg-white p-5 shadow">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}
