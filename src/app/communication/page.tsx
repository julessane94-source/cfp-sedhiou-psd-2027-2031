import { prisma } from "@/lib/prisma";
import CommunicationActions from "@/components/CommunicationActions";

export default async function CommunicationPage() {
  const communications = await prisma.communication.findMany({
    orderBy: { createdAt: "desc" },
  });

  const total = communications.length;
  const brouillons = communications.filter(
    (c) => c.status === "BROUILLON"
  ).length;
  const publiees = communications.filter(
    (c) => c.status === "PUBLIE"
  ).length;
  const evenements = communications.filter(
    (c) => c.type === "EVENEMENT"
  ).length;

  return (
    <main className="ui-page">
      <section className="dashboard-hero animate-rise">
        <div>
          <span className="dashboard-kicker">CFP SÉDHIOU</span>
          <h1>Communication</h1>
          <p>
            Gestion des annonces, informations, événements et notes
            internes du CFP.
          </p>
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="dashboard-stat">
          <div className="stat-icon">📢</div>
          <div>
            <span>Total</span>
            <strong>{total}</strong>
          </div>
        </div>

        <div className="dashboard-stat">
          <div className="stat-icon">📝</div>
          <div>
            <span>Brouillons</span>
            <strong>{brouillons}</strong>
          </div>
        </div>

        <div className="dashboard-stat">
          <div className="stat-icon">📣</div>
          <div>
            <span>Publiées</span>
            <strong>{publiees}</strong>
          </div>
        </div>

        <div className="dashboard-stat">
          <div className="stat-icon">📅</div>
          <div>
            <span>Événements</span>
            <strong>{evenements}</strong>
          </div>
        </div>
      </section>

      <section className="ui-card">
        <h2>Nouvelle communication</h2>

        <form
          action="/api/communication"
          method="POST"
          className="ui-form"
        >
          <label>
            Titre
            <input
              name="title"
              required
              placeholder="Titre de l'annonce"
            />
          </label>

          <label>
            Type
            <select name="type" defaultValue="ANNONCE">
              <option value="ANNONCE">Annonce</option>
              <option value="INFORMATION">Information</option>
              <option value="EVENEMENT">Événement</option>
              <option value="NOTE">Note</option>
            </select>
          </label>

          <label className="full-width">
            Contenu
            <textarea
              name="content"
              rows={6}
              required
              placeholder="Rédigez le contenu de la communication..."
            />
          </label>

          <label>
            Statut initial
            <select name="status" defaultValue="BROUILLON">
              <option value="BROUILLON">Brouillon</option>
              <option value="PUBLIE">Publier immédiatement</option>
            </select>
          </label>

          <button type="submit">
            Enregistrer
          </button>
        </form>
      </section>

      <section className="ui-card">
        <h2>Communications</h2>

        <div className="table-wrap">
          <table className="ui-table">
            <thead>
              <tr>
                <th>Titre</th>
                <th>Type</th>
                <th>Statut</th>
                <th>Publication</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {communications.map((communication) => (
                <tr key={communication.id}>
                  <td>
                    <strong>{communication.title}</strong>
                    <small>
                      {communication.content.slice(0, 100)}
                      {communication.content.length > 100 ? "..." : ""}
                    </small>
                  </td>

                  <td>{communication.type}</td>

                  <td>
                    <span
                      className={`badge badge-${communication.status.toLowerCase()}`}
                    >
                      {communication.status}
                    </span>
                  </td>

                  <td>
                    {communication.publishedAt
                      ? new Date(
                          communication.publishedAt
                        ).toLocaleDateString("fr-FR")
                      : "—"}
                  </td>

                  <td>
                    <CommunicationActions
                      id={communication.id}
                      status={communication.status}
                    />
                  </td>
                </tr>
              ))}

              {communications.length === 0 && (
                <tr>
                  <td colSpan={5}>
                    Aucune communication enregistrée.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
