import { prisma } from "@/lib/prisma";

export default async function SecuritePage() {
  const [incidents, agents, services, assets] = await Promise.all([
    prisma.securityIncident.findMany({
      include: { agent: true, service: true, asset: true },
      orderBy: { date: "desc" },
    }),
    prisma.agent.findMany({ orderBy: { lastName: "asc" } }),
    prisma.service.findMany({ orderBy: { name: "asc" } }),
    prisma.asset.findMany({ orderBy: { name: "asc" } }),
  ]);

  const ouverts = incidents.filter((i) => i.status === "OUVERT").length;
  const enCours = incidents.filter((i) => i.status === "EN_COURS").length;
  const clotures = incidents.filter((i) => i.status === "CLOTURE").length;

  return (
    <main style={{ padding: 24 }}>
      <h1>Gestion de la sécurité</h1>
      <p>Registre des incidents, accidents et événements de sécurité.</p>

      <section style={{ display: "flex", gap: 16, margin: "24px 0" }}>
        <div><strong>{incidents.length}</strong><br />Total incidents</div>
        <div><strong>{ouverts}</strong><br />Ouverts</div>
        <div><strong>{enCours}</strong><br />En cours</div>
        <div><strong>{clotures}</strong><br />Clôturés</div>
      </section>

      <hr />

      <h2>Déclarer un incident</h2>

      <form action="/api/securite" method="post">
        <input type="hidden" name="action" value="incident" />

        <p>
          <label>Référence<br />
            <input name="reference" required placeholder="INC-2026-001" />
          </label>
        </p>

        <p>
          <label>Date<br />
            <input name="date" type="datetime-local" required />
          </label>
        </p>

        <p>
          <label>Lieu<br />
            <input name="location" required />
          </label>
        </p>

        <p>
          <label>Type<br />
            <input name="type" required placeholder="Accident, vol, incendie..." />
          </label>
        </p>

        <p>
          <label>Gravité<br />
            <select name="severity" required>
              <option value="FAIBLE">Faible</option>
              <option value="MOYENNE">Moyenne</option>
              <option value="ELEVEE">Élevée</option>
              <option value="CRITIQUE">Critique</option>
            </select>
          </label>
        </p>

        <p>
          <label>Description<br />
            <textarea name="description" rows={4} required />
          </label>
        </p>

        <p>
          <label>Actions immédiates<br />
            <textarea name="actions" rows={3} />
          </label>
        </p>

        <p>
          <label>Agent concerné<br />
            <select name="agentId">
              <option value="">-- Aucun --</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.matricule} - {agent.firstName} {agent.lastName}
                </option>
              ))}
            </select>
          </label>
        </p>

        <p>
          <label>Service concerné<br />
            <select name="serviceId">
              <option value="">-- Aucun --</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
          </label>
        </p>

        <p>
          <label>Bien concerné<br />
            <select name="assetId">
              <option value="">-- Aucun --</option>
              {assets.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.inventoryCode} - {asset.name}
                </option>
              ))}
            </select>
          </label>
        </p>

        <button type="submit">Enregistrer l'incident</button>
      </form>

      <hr />

      <h2>Registre des incidents</h2>

      {incidents.length === 0 ? (
        <p>Aucun incident enregistré.</p>
      ) : (
        <table border={1} cellPadding={8}>
          <thead>
            <tr>
              <th>Référence</th>
              <th>Date</th>
              <th>Type</th>
              <th>Gravité</th>
              <th>Statut</th>
              <th>Lieu</th>
              <th>Service</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {incidents.map((incident) => (
              <tr key={incident.id}>
                <td>{incident.reference}</td>
                <td>{new Date(incident.date).toLocaleString("fr-FR")}</td>
                <td>{incident.type}</td>
                <td>{incident.severity}</td>
                <td>{incident.status}</td>
                <td>{incident.location}</td>
                <td>{incident.service?.name ?? "-"}</td>

                <td>
                  {incident.status === "OUVERT" && (
                    <form action="/api/securite" method="post">
                      <input type="hidden" name="action" value="statut" />
                      <input type="hidden" name="id" value={incident.id} />
                      <input
                        type="hidden"
                        name="status"
                        value="EN_COURS"
                      />
                      <button type="submit">
                        Prendre en charge
                      </button>
                    </form>
                  )}

                  {incident.status === "EN_COURS" && (
                    <form action="/api/securite" method="post">
                      <input type="hidden" name="action" value="statut" />
                      <input type="hidden" name="id" value={incident.id} />
                      <input
                        type="hidden"
                        name="status"
                        value="CLOTURE"
                      />
                      <button type="submit">
                        Clôturer
                      </button>
                    </form>
                  )}

                  {incident.status === "CLOTURE" && (
                    <span>Terminé</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
