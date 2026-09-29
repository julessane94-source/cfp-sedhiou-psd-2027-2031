import { prisma } from "@/lib/prisma";
import EntrepreneurshipActions from "@/components/EntrepreneurshipActions";

export default async function EntrepreneuriatPage() {
  const [projects, learners] = await Promise.all([
    prisma.entrepreneurshipProject.findMany({
      include: { learner: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.learner.findMany({
      orderBy: { lastName: "asc" },
    }),
  ]);

  const total = projects.length;
  const idees = projects.filter((p) => p.status === "IDEE").length;
  const accompagnement = projects.filter(
    (p) => p.status === "ACCOMPAGNEMENT"
  ).length;
  const financement = projects.filter(
    (p) => p.status === "FINANCEMENT"
  ).length;
  const actifs = projects.filter(
    (p) => p.status === "EN_ACTIVITE"
  ).length;

  const requestedTotal = projects.reduce(
    (sum, p) => sum + Number(p.requestedAmount ?? 0),
    0
  );

  const financedTotal = projects.reduce(
    (sum, p) => sum + Number(p.financedAmount ?? 0),
    0
  );

  return (
    <main className="ui-page">
      <section className="dashboard-hero animate-rise">
        <div>
          <span className="dashboard-kicker">CFP SÉDHIOU</span>
          <h1>Entrepreneuriat</h1>
          <p>
            Gestion des projets entrepreneuriaux et accompagnement des
            porteurs.
          </p>
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="dashboard-stat">
          <div className="stat-icon">💡</div>
          <div>
            <span>Total projets</span>
            <strong>{total}</strong>
          </div>
        </div>

        <div className="dashboard-stat">
          <div className="stat-icon">📝</div>
          <div>
            <span>Idées</span>
            <strong>{idees}</strong>
          </div>
        </div>

        <div className="dashboard-stat">
          <div className="stat-icon">🤝</div>
          <div>
            <span>Accompagnement</span>
            <strong>{accompagnement}</strong>
          </div>
        </div>

        <div className="dashboard-stat">
          <div className="stat-icon">💰</div>
          <div>
            <span>Financement</span>
            <strong>{financement}</strong>
          </div>
        </div>

        <div className="dashboard-stat">
          <div className="stat-icon">🚀</div>
          <div>
            <span>En activité</span>
            <strong>{actifs}</strong>
          </div>
        </div>
      </section>

      <section className="dashboard-bottom">
        <div className="ui-card">
          <h2>Financement</h2>
          <p>
            Montant demandé :{" "}
            <strong>{requestedTotal.toLocaleString("fr-FR")} FCFA</strong>
          </p>
          <p>
            Montant financé :{" "}
            <strong>{financedTotal.toLocaleString("fr-FR")} FCFA</strong>
          </p>
        </div>
      </section>

      <section className="ui-card">
        <h2>Nouveau projet entrepreneurial</h2>

        <form
          action="/api/entrepreneuriat"
          method="POST"
          className="ui-form"
        >
          <label>
            Porteur du projet
            <select name="learnerId">
              <option value="">Sélectionner un apprenant</option>
              {learners.map((learner) => (
                <option key={learner.id} value={learner.id}>
                  {learner.lastName} {learner.firstName} —{" "}
                  {learner.matricule}
                </option>
              ))}
            </select>
          </label>

          <label>
            Nom du projet
            <input
              name="name"
              required
              placeholder="Nom du projet"
            />
          </label>

          <label>
            Secteur d'activité
            <input
              name="sector"
              required
              placeholder="Agriculture, numérique, artisanat..."
            />
          </label>

          <label>
            Structure
            <input
              name="structure"
              placeholder="Entreprise ou structure créée"
            />
          </label>

          <label>
            Montant recherché
            <input
              name="requestedAmount"
              type="number"
              min="0"
              step="1"
              placeholder="FCFA"
            />
          </label>

          <label>
            Date de démarrage
            <input name="startDate" type="date" />
          </label>

          <label className="full-width">
            Description
            <textarea
              name="description"
              rows={3}
              placeholder="Présentation du projet..."
            />
          </label>

          <label className="full-width">
            Observations
            <textarea
              name="notes"
              rows={3}
              placeholder="Accompagnement, besoins, remarques..."
            />
          </label>

          <button type="submit">Enregistrer le projet</button>
        </form>
      </section>

      <section className="ui-card">
        <h2>Suivi des projets</h2>

        <div className="table-wrap">
          <table className="ui-table">
            <thead>
              <tr>
                <th>Projet</th>
                <th>Porteur</th>
                <th>Secteur</th>
                <th>Statut</th>
                <th>Demandé</th>
                <th>Financé</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {projects.map((project) => (
                <tr key={project.id}>
                  <td>
                    <strong>{project.name}</strong>
                    <small>{project.structure || "—"}</small>
                  </td>

                  <td>
                    {project.learner
                      ? `${project.learner.lastName} ${project.learner.firstName}`
                      : "Porteur externe"}
                  </td>

                  <td>{project.sector}</td>

                  <td>
                    <span
                      className={`badge badge-${project.status.toLowerCase()}`}
                    >
                      {project.status}
                    </span>
                  </td>

                  <td>
                    {project.requestedAmount != null
                      ? `${Number(project.requestedAmount).toLocaleString(
                          "fr-FR"
                        )} FCFA`
                      : "—"}
                  </td>

                  <td>
                    {project.financedAmount != null
                      ? `${Number(project.financedAmount).toLocaleString(
                          "fr-FR"
                        )} FCFA`
                      : "—"}
                  </td>

                  <td>
                    <EntrepreneurshipActions
                      id={project.id}
                      status={project.status}
                      financedAmount={
                        project.financedAmount != null
                          ? String(project.financedAmount)
                          : null
                      }
                    />
                  </td>
                </tr>
              ))}

              {projects.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    Aucun projet entrepreneurial enregistré.
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
