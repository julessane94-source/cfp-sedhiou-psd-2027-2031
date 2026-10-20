import UserManagement from "@/components/UserManagement";

export default function UtilisateursPage() {
  return (
    <main className="ui-page">
      <section className="dashboard-hero animate-rise">
        <div>
          <span className="dashboard-kicker">ADMINISTRATION</span>
          <h1>Gestion des utilisateurs</h1>
          <p>Créez les identifiants, attribuez les rôles et réinitialisez les mots de passe.</p>
        </div>
      </section>
      <UserManagement />
    </main>
  );
}
