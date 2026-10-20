import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight, Bell, Check, LockKeyhole } from "lucide-react";
import { getVisibleMenuItems } from "@/lib/navigation";

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
  if (!session) redirect("/connexion");
  const role = session.role;
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
    { title: "Budgets", value: budgets, icon: "💰", href: "/finances/budgets" },
    { title: "Opérations", value: operations, icon: "💳", href: "/finances/operations" },
    { title: "Sécurité", value: incidents, icon: "🛡️", href: "/securite" },
    { title: "Documents", value: documents, icon: "📄", href: "/documents" },
  ];

  const roleStats: Record<string, typeof allStats> = {
    DIRECTEUR: allStats,
    GESTIONNAIRE: [
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
  const menuItems = getVisibleMenuItems(role);
  const allowedRoutes = new Set(menuItems.map((item) => item.href));
  const visibleStats = stats.filter(
    (stat) =>
      allowedRoutes.has(stat.href) ||
      (stat.href.startsWith("/finances/") && allowedRoutes.has("/finances"))
  );
  const quickRouteOrder = [
    "/apprenants",
    "/candidature",
    "/formations",
    "/finances",
    "/finances/caisse",
    "/infrastructures",
    "/personnel",
    "/stages",
    "/insertion",
    "/entrepreneuriat",
    "/partenaires",
    "/communication",
    "/documents",
    "/securite",
  ];
  const quickActions = quickRouteOrder
    .map((href) => menuItems.find((item) => item.href === href))
    .filter((item): item is (typeof menuItems)[number] => Boolean(item))
    .slice(0, 6);
  const notificationSummary = (
    <>
      <Bell size={17} aria-hidden="true" />
      <strong>{notifications}</strong>
      <span>{notifications > 1 ? "notifications" : "notification"}</span>
      {allowedRoutes.has("/notifications") && (
        <ArrowUpRight size={15} aria-hidden="true" />
      )}
    </>
  );

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

        {allowedRoutes.has("/notifications") ? (
          <Link href="/notifications" className="notification-badge">
            {notificationSummary}
          </Link>
        ) : (
          <div className="notification-badge" aria-label={`${notifications} notifications`}>
            {notificationSummary}
          </div>
        )}
      </section>

      <section className="dashboard-grid">
        {visibleStats.map(({ title, value, icon, href }, index) => (
          <Link
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
            <ArrowUpRight className="stat-arrow" size={16} aria-hidden="true" />
          </Link>
        ))}
      </section>

      <section className="dashboard-bottom animate-rise">
        <div className="ui-card">
          <div className="quick-actions-heading">
            <div>
              <span className="dashboard-section-kicker">VOS ESPACES</span>
              <h2>Accès rapides</h2>
            </div>
            <span className="quick-actions-count">
              <Check size={14} aria-hidden="true" /> {quickActions.length} accès
            </span>
          </div>

          <div className="quick-actions">
            {quickActions.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}>
                  <Icon size={17} strokeWidth={1.8} aria-hidden="true" />
                  <span>{item.label}</span>
                  <ArrowUpRight size={15} className="quick-action-arrow" aria-hidden="true" />
                </Link>
              );
            })}
          </div>
        </div>

        <div className="ui-card dashboard-info">
          <div className="dashboard-info-icon"><LockKeyhole size={20} aria-hidden="true" /></div>
          <span>Votre espace</span>
          <strong>{roleLabel}</strong>
          <p>Les modules affichés correspondent à votre profil de gestion.</p>
          <small>Connecté à la plateforme CFP Sédhiou</small>
        </div>
      </section>
    </main>
  );
}
