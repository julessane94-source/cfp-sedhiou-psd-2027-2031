import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const roleLabels: Record<string, string> = {
  DIRECTEUR: "Directeur",
  GESTIONNAIRE: "Gestionnaire",
  COMPTABLE_MATIERES: "Comptable matières",
  CHEF_TRAVAUX: "Chef des travaux",
  SURVEILLANT: "Surveillant",
  FORMATEUR: "Formateur",
};

export default async function DashboardPage() {
  const session = await getSession();
  const role = session?.role ?? "DIRECTEUR";
  const roleLabel = roleLabels[role] ?? role;

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

  const allStats = [
    { title: "Personnel", value: agents, icon: "👥", href: "/personnel" },
    { title: "Apprenants", value: learners, icon: "🎓", href: "/apprenants" },
    { title: "Formations", value: trainings, icon: "📚", href: "/formations" },
    { title: "Patrimoine", value: assets, icon: "🏢", href: "/infrastructures" },
    { title: "Budgets", value: budgets, icon: "💰", href: "/finances" },
    { title: "Opérations", value: operations, icon: "💳", href: "/finances" },
    { title: "Sécurité", value: incidents, icon: "🛡️", href: "/securite" },
    { title: "Documents", value: documents, icon: "📄", href: "/documents" },
  ];

  const roleStats: Record<string, typeof allStats> = {
    DIRECTEUR: allStats,
    GESTIONNAIRE: [
      allStats[0],
      allStats[1],
      allStats[2],
      allStats[4],
      allStats[5],
      allStats[7],
    ],
    COMPTABLE_MATIERES: [
      allStats[3],
      allStats[4],
    ],
    CHEF_TRAVAUX: [
      allStats[1],
      allStats[2],
    ],
    SURVEILLANT: [
      allStats[1],
      allStats[6],
    ],
    FORMATEUR: [
      allStats[1],
      allStats[2],
    ],
  };

  const stats = roleStats[role] ?? allStats;

  return (
    <main className="ui-page">
      <section className="dashboard-hero animate-rise">
        <div>
          <span className="dashboard-kicker">CFP SÉDHIOU</span>
          <h1>Tableau de bord</h1>
          <p>
            Vue de gestion adaptée à votre fonction : <strong>{roleLabel}</strong>.
          </p>
        </div>

        <div className="notification-badge">
          🔔 <strong>{notifications}</strong>
          <span>{notifications > 1 ? "notifications" : "notification"}</span>
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
          </a>
        ))}
      </section>

      {role === "DIRECTEUR" && (
        <section className="dashboard-bottom animate-rise">
          <div className="ui-card">
            <span>Supervision du Directeur</span>
            <h2>Vue globale de l’établissement</h2>
            <p>
              Accès direct aux principaux indicateurs administratifs,
              financiers, matériels et de sécurité.
            </p>

            <div className="dashboard-grid">
              <a className="dashboard-stat animate-rise" href="/personnel">
                <div className="stat-icon">👥</div>
                <div>
                  <span>Personnel</span>
                  <strong>{allStats[0].value}</strong>
                </div>
              </a>

              <a className="dashboard-stat animate-rise" href="/apprenants">
                <div className="stat-icon">🎓</div>
                <div>
                  <span>Apprenants</span>
                  <strong>{allStats[1].value}</strong>
                </div>
              </a>

              <a className="dashboard-stat animate-rise" href="/finances">
                <div className="stat-icon">💰</div>
                <div>
                  <span>Opérations financières</span>
                  <strong>{allStats[5].value}</strong>
                </div>
              </a>

              <a className="dashboard-stat animate-rise" href="/securite">
                <div className="stat-icon">🛡️</div>
                <div>
                  <span>Incidents sécurité</span>
                  <strong>{allStats[6].value}</strong>
                </div>
              </a>
            </div>
          </div>
        </section>
      )}

      <section className="dashboard-bottom animate-rise">
        <div className="ui-card">
          <h2>Accès rapides</h2>

          <div className="quick-actions">
            {role === "DIRECTEUR" && (
              <>
                <a href="/personnel">👥 Personnel</a>
                <a href="/finances">💰 Finances</a>
                <a href="/infrastructures">🏢 Patrimoine</a>
                <a href="/securite">🛡️ Sécurité</a>
              </>
            )}

            {role === "GESTIONNAIRE" && (
              <>
                <a href="/apprenants">🎓 Apprenants</a>
                <a href="/formations">📚 Formations</a>
                <a href="/personnel">👥 Personnel</a>
                <a href="/finances">💰 Finances</a>
                <a href="/stages">🏢 Stages</a>
                <a href="/insertion">🎯 Insertion</a>
                <a href="/entrepreneuriat">🚀 Entrepreneuriat</a>
                <a href="/partenaires">🤝 Partenaires</a>
                <a href="/communication">📢 Communication</a>
                <a href="/documents">📄 Documents</a>
              </>
            )}

            {role === "COMPTABLE_MATIERES" && (
              <>
                <a href="/infrastructures">🏢 Patrimoine</a>
                <a href="/finances">💰 Consultation finances</a>
                <a href="/documents">📄 Documents</a>
              </>
            )}

            {role === "CHEF_TRAVAUX" && (
              <>
                <a href="/apprenants">🎓 Apprenants</a>
                <a href="/formations">📚 Formations</a>
                <a href="/stages">🏢 Stages</a>
                <a href="/insertion">🎯 Insertion</a>
                <a href="/entrepreneuriat">🚀 Entrepreneuriat</a>
                <a href="/partenaires">🤝 Partenaires</a>
                <a href="/documents">📄 Documents</a>
              </>
            )}

            {role === "SURVEILLANT" && (
              <>
                <a href="/apprenants">🎓 Apprenants</a>
                <a href="/securite">🛡️ Sécurité</a>
                <a href="/stages">🏢 Stages</a>
                <a href="/documents">📄 Documents</a>
              </>
            )}

            {role === "FORMATEUR" && (
              <>
                <a href="/apprenants">🎓 Apprenants</a>
                <a href="/formations">📚 Formations</a>
                <a href="/stages">🏢 Stages</a>
                <a href="/documents">📄 Documents</a>
              </>
            )}
          </div>
        </div>

        <div className="ui-card dashboard-info">
          <span>État de la plateforme</span>
          <strong>Système opérationnel</strong>
          <p>
            Données synchronisées avec la base centrale.
          </p>
          <small>Session : {roleLabel}</small>
        </div>
      </section>
    </main>
  );
}
