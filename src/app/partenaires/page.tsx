import { prisma } from "@/lib/prisma";
import PartnerActions from "@/components/PartnerActions";

export default async function PartenairesPage() {
  const partners = await prisma.partner.findMany({
    orderBy: { name: "asc" },
  });

  const total = partners.length;
  const actifs = partners.filter((p) => p.status === "ACTIF").length;
  const inactifs = total - actifs;

  return (
    <main className="ui-page">
      <section className="dashboard-hero animate-rise">
        <div>
          <span className="dashboard-kicker">CFP SÉDHIOU</span>
          <h1>Partenaires</h1>
          <p>
            Gestion des partenaires, structures d'accueil et organismes
            associés au CFP.
          </p>
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="dashboard-stat">
          <div className="stat-icon">🤝</div>
          <div>
            <span>Total partenaires</span>
            <strong>{total}</strong>
          </div>
        </div>

        <div className="dashboard-stat">
          <div className="stat-icon">🟢</div>
          <div>
            <span>Partenaires actifs</span>
            <strong>{actifs}</strong>
          </div>
        </div>

        <div className="dashboard-stat">
          <div className="stat-icon">⚪</div>
          <div>
            <span>Inactifs</span>
            <strong>{inactifs}</strong>
          </div>
        </div>
      </section>

      <section className="ui-card">
        <h2>Nouveau partenaire</h2>

        <form
          action="/api/partenaires"
          method="POST"
          className="ui-form"
        >
          <label>
            Nom du partenaire
            <input
              name="name"
              required
              placeholder="Nom de l'entreprise ou organisme"
            />
          </label>

          <label>
            Type
            <input
              name="type"
              placeholder="Entreprise, ONG, institution..."
            />
          </label>

          <label>
            Personne à contacter
            <input
              name="contact"
              placeholder="Nom du responsable"
            />
          </label>

          <label>
            Téléphone
            <input
              name="phone"
              type="tel"
              placeholder="Téléphone"
            />
          </label>

          <label>
            Email
            <input
              name="email"
              type="email"
              placeholder="contact@exemple.com"
            />
          </label>

          <label>
            Adresse
            <input
              name="address"
              placeholder="Adresse"
            />
          </label>

          <label className="full-width">
            Description
            <textarea
              name="description"
              rows={3}
              placeholder="Domaine d'intervention, collaboration..."
            />
          </label>

          <button type="submit">
            Enregistrer le partenaire
          </button>
        </form>
      </section>

      <section className="ui-card">
        <h2>Annuaire des partenaires</h2>

        <div className="table-wrap">
          <table className="ui-table">
            <thead>
              <tr>
                <th>Partenaire</th>
                <th>Type</th>
                <th>Contact</th>
                <th>Téléphone</th>
                <th>Email</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {partners.map((partner) => (
                <tr key={partner.id}>
                  <td>
                    <strong>{partner.name}</strong>
                    <small>{partner.address || "—"}</small>
                  </td>

                  <td>{partner.type || "—"}</td>

                  <td>{partner.contact || "—"}</td>

                  <td>{partner.phone || "—"}</td>

                  <td>{partner.email || "—"}</td>

                  <td>
                    <span
                      className={`badge badge-${partner.status.toLowerCase()}`}
                    >
                      {partner.status}
                    </span>
                  </td>

                  <td>
                    <PartnerActions
                      id={partner.id}
                      status={partner.status}
                    />
                  </td>
                </tr>
              ))}

              {partners.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    Aucun partenaire enregistré.
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
