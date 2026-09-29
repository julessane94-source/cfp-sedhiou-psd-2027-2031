import { prisma } from "@/lib/prisma";

export default async function StagesPage() {
  const [stages, learners] = await Promise.all([
    prisma.stage.findMany({
      include: { learner: true },
      orderBy: { startDate: "desc" },
    }),
    prisma.learner.findMany({
      orderBy: { lastName: "asc" },
    }),
  ]);

  const total = stages.length;
  const enCours = stages.filter((s) => s.status === "EN_COURS").length;
  const prevus = stages.filter((s) => s.status === "PREVU").length;
  const termines = stages.filter((s) => s.status === "TERMINE").length;

  return (
    <main className="ui-page">
      <section className="dashboard-hero animate-rise">
        <div>
          <span className="dashboard-kicker">CFP SÉDHIOU</span>
          <h1>Gestion des stages</h1>
          <p>Suivi des stages et de l’insertion professionnelle des apprenants.</p>
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="dashboard-stat">
          <div className="stat-icon">🎓</div>
          <div><span>Total stages</span><strong>{total}</strong></div>
        </div>

        <div className="dashboard-stat">
          <div className="stat-icon">🟡</div>
          <div><span>Prévus</span><strong>{prevus}</strong></div>
        </div>

        <div className="dashboard-stat">
          <div className="stat-icon">🔵</div>
          <div><span>En cours</span><strong>{enCours}</strong></div>
        </div>

        <div className="dashboard-stat">
          <div className="stat-icon">🟢</div>
          <div><span>Terminés</span><strong>{termines}</strong></div>
        </div>
      </section>

      <section className="ui-card">
        <h2>Nouvelle affectation en stage</h2>

        <form action="/api/stages" method="POST" className="ui-form">
          <label>
            Apprenant
            <select name="learnerId" required>
              <option value="">Sélectionner un apprenant</option>
              {learners.map((learner) => (
                <option key={learner.id} value={learner.id}>
                  {learner.lastName} {learner.firstName} — {learner.matricule}
                </option>
              ))}
            </select>
          </label>

          <label>
            Structure d’accueil
            <input name="structure" required placeholder="Entreprise / organisme" />
          </label>

          <label>
            Adresse
            <input name="address" placeholder="Adresse de la structure" />
          </label>

          <label>
            Type de stage
            <select name="type" defaultValue="PROFESSIONNEL">
              <option value="ACADEMIQUE">Académique</option>
              <option value="PROFESSIONNEL">Professionnel</option>
              <option value="INSERTION">Insertion</option>
            </select>
          </label>

          <label>
            Tuteur
            <input name="tutorName" placeholder="Nom du tuteur" />
          </label>

          <label>
            Téléphone du tuteur
            <input name="tutorPhone" placeholder="Téléphone" />
          </label>

          <label>
            Date de début
            <input type="date" name="startDate" required />
          </label>

          <label>
            Date de fin
            <input type="date" name="endDate" required />
          </label>

          <label>
            N° convention
            <input name="conventionNumber" placeholder="Référence de convention" />
          </label>

          <label className="full-width">
            Observations
            <textarea name="observations" rows={3} />
          </label>

          <button type="submit">Enregistrer le stage</button>
        </form>
      </section>

      <section className="ui-card">
        <h2>Suivi des stages</h2>

        <div className="table-wrap">
          <table className="ui-table">
            <thead>
              <tr>
                <th>Apprenant</th>
                <th>Structure</th>
                <th>Type</th>
                <th>Période</th>
                <th>Statut</th>
                <th>Évaluation</th>
              </tr>
            </thead>

            <tbody>
              {stages.map((stage) => (
                <tr key={stage.id}>
                  <td>
                    <strong>
                      {stage.learner.lastName} {stage.learner.firstName}
                    </strong>
                    <small>{stage.learner.matricule}</small>
                  </td>
                  <td>{stage.structure}</td>
                  <td>{stage.type}</td>
                  <td>
                    {new Date(stage.startDate).toLocaleDateString("fr-FR")}
                    {" → "}
                    {new Date(stage.endDate).toLocaleDateString("fr-FR")}
                  </td>
                  <td>
                    <span className={`badge badge-${stage.status.toLowerCase()}`}>
                      {stage.status}
                    </span>
                  </td>
                  <td>{stage.evaluation != null ? String(stage.evaluation) : "—"}</td>
                </tr>
              ))}

              {stages.length === 0 && (
                <tr>
                  <td colSpan={6}>Aucun stage enregistré.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
