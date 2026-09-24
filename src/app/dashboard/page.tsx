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
    prisma.notification.count({ where: { read: false } }),
  ]);

  const stats = [
    { title: "Personnel", value: agents, icon: "👥", href: "/personnel" },
    { title: "Apprenants", value: learners, icon: "🎓", href: "/apprenants" },
    { title: "Formations", value: trainings, icon: "📚", href: "/formations" },
    { title: "Patrimoine", value: assets, icon: "🏢", href: "/infrastructures" },
    { title: "Budgets", value: budgets, icon: "💰", href: "/finances" },
    { title: "Opérations", value: operations, icon: "📊", href: "/finances" },
    { title: "Sécurité", value: incidents, icon: "🛡️", href: "/securite" },
    { title: "Documents", value: documents, icon: "📄", href: "/documents" },
  ];

  return (
    <main className="ui-page">
      <section className="dashboard-hero animate-rise">
        <div>
          <span className="dashboard-kicker">CFP SÉDHIOU</span>
          <h1>Tableau de bord</h1>
          <p>
            Vue globale de la plateforme administrative et financière.
          </p>
        </div>

        <div className="notification-badge">
          🔔 <strong>{notifications}</strong>
          <span>notification{notifications > 1 ? "s" : ""}</span>
        </div>
      </section>

      <section className="dashboard-grid">
        {stats.map(({ title, value, icon, href }, index) => (
          <a
            key={title}
            href={href}
            className="dashboard-stat animate-rise"
            style={{ animationDelay: `${index * 45}ms` }}
          >
            <div className="stat-icon">{icon}</div>
            <div>
              <span>{title}</span>
              <strong>{value}</strong>
            </div>
            <b>→</b>
          </a>
        ))}
      </section>

      <section className="dashboard-bottom animate-rise">
        <div className="ui-card">
          <h2>Accès rapides</h2>
          <div className="quick-actions">
            <a href="/personnel">+ Personnel</a>
            <a href="/finances">+ Opération financière</a>
            <a href="/infrastructures">+ Patrimoine</a>
            <a href="/securite">+ Incident</a>
          </div>
        </div>

        <div className="ui-card dashboard-info">
          <span>État de la plateforme</span>
          <strong>● Système opérationnel</strong>
          <p>Données synchronisées avec la base centrale.</p>
        </div>
      </section>
    </main>
  );
}
