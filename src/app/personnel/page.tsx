import { prisma } from "@/lib/prisma";
import CreaCaiAccess from "./cai-access";

export const dynamic = "force-dynamic";

export default async function PersonnelPage() {
  const [agents, services, roles] = await Promise.all([
    prisma.agent.findMany({
      include: { service: true, user: { select: { email: true, role: { select: { name: true } } } } },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    }),
    prisma.service.findMany({
      orderBy: { name: "asc" },
    }),
    prisma.role.findMany({
      where: { name: { not: "DIRECTEUR" } },
      orderBy: { name: "asc" },
      select: { name: true, description: true },
    }),
  ]);

  return (
    <main className="min-h-screen bg-slate-50 p-4">
      <div className="mx-auto max-w-7xl space-y-6">

        <header>
          <h1 className="text-3xl font-bold">
            Gestion du personnel
          </h1>
          <p className="mt-2 text-slate-600">
            Ressources humaines du CFP Sédhiou
          </p>
        </header>

        <section className="rounded-xl bg-white p-5 shadow">
          <h2 className="text-xl font-bold">
            Créer une cellule ou un service
          </h2>

          <form
            action="/api/personnel"
            method="post"
            className="mt-4 grid gap-3 md:grid-cols-2"
          >
            <input type="hidden" name="action" value="service" />

            <input
              name="name"
              required
              placeholder="Ex. CAI — Cellule d’appui à l’insertion"
              className="rounded-lg border p-3"
            />

            <input
              name="description"
              placeholder="Description"
              className="rounded-lg border p-3"
            />

            <button
              type="submit"
              className="rounded-lg bg-slate-700 px-5 py-3 font-semibold text-white md:col-span-2"
            >
              Enregistrer le service
            </button>
          </form>
        </section>

        <section className="rounded-xl bg-white p-5 shadow">
          <h2 className="text-xl font-bold">
            Nouvel agent et compte utilisateur
          </h2>
          <p className="mt-2 text-sm text-slate-600">Chaque membre du personnel reçoit un identifiant et un rôle d’accès à la plateforme.</p>

          <form
            action="/api/personnel"
            method="post"
            className="mt-4 grid gap-3 md:grid-cols-2"
          >
            <input type="hidden" name="action" value="agent" />

            <input
              name="matricule"
              required
              placeholder="Matricule"
              className="rounded-lg border p-3"
            />

            <input
              name="firstName"
              required
              placeholder="Prénom"
              className="rounded-lg border p-3"
            />

            <input
              name="lastName"
              required
              placeholder="Nom"
              className="rounded-lg border p-3"
            />

            <input
              name="position"
              placeholder="Fonction"
              className="rounded-lg border p-3"
            />

            <input
              name="contractType"
              placeholder="Type de contrat"
              className="rounded-lg border p-3"
            />

            <select
              name="serviceId"
              className="rounded-lg border p-3"
            >
              <option value="">Service</option>

              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>

            <input
              name="phone"
              placeholder="Téléphone"
              className="rounded-lg border p-3"
            />

            <input
              name="email"
              type="email"
              required
              placeholder="E-mail de connexion"
              className="rounded-lg border p-3"
            />

            <select name="roleName" required defaultValue="" className="rounded-lg border p-3">
              <option value="" disabled>Rôle utilisateur</option>
              {roles.map((role) => <option key={role.name} value={role.name}>{role.name.replaceAll("_", " ")}</option>)}
            </select>

            <input
              name="password"
              type="password"
              required
              minLength={12}
              autoComplete="new-password"
              placeholder="Mot de passe initial (12 caractères minimum)"
              className="rounded-lg border p-3"
            />

            <input
              name="hireDate"
              type="date"
              className="rounded-lg border p-3"
            />

            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white md:col-span-2"
            >
              Enregistrer l'agent
            </button>
          </form>
        </section>

        <section className="rounded-xl bg-white p-5 shadow">
          <h2 className="text-xl font-bold">
            Personnel ({agents.length})
          </h2>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="p-3">Matricule</th>
                  <th className="p-3">Agent</th>
                  <th className="p-3">Fonction</th>
                  <th className="p-3">Service</th>
                  <th className="p-3">Contrat</th>
                  <th className="p-3">Compte utilisateur</th>
                </tr>
              </thead>

              <tbody>
                {agents.map((agent) => (
                  <tr key={agent.id} className="border-b">
                    <td className="p-3 font-medium">
                      {agent.matricule}
                    </td>
                    <td className="p-3">
                      {agent.firstName} {agent.lastName}
                    </td>
                    <td className="p-3">
                      {agent.position ?? "Non renseignée"}
                    </td>
                    <td className="p-3">
                      {agent.service?.name ?? "Non affecté"}
                    </td>
                    <td className="p-3">
                      {agent.contractType ?? "Non renseigné"}
                    </td>
                    <td className="p-3">
                      <CreaCaiAccess
                        agent={{
                          id: agent.id,
                          name: agent.firstName + " " + agent.lastName,
                          hasAccount: Boolean(agent.userId),
                          email: agent.user?.email ?? agent.email ?? "",
                          roleName: agent.user?.role?.name ?? "",
                        }}
                        roles={roles}
                      />                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </main>
  );
}
