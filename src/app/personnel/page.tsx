import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { normalizeRole } from "@/lib/role-routes";
import CreaCaiAccess from "./cai-access";

export const dynamic = "force-dynamic";

const normalizeName = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase().trim();

export default async function PersonnelPage({ searchParams }: { searchParams: Promise<{ trainer?: string }> }) {
  const session = await getSession();
  if (!session) redirect("/connexion");
  const role = normalizeRole(session.role);
  const canReviewTrainers = role === "CHEF_TRAVAUX";
  const canManagePersonnel = role === "DIRECTEUR" || await hasPermission("personnel.gerer");
  if (!canReviewTrainers && !canManagePersonnel) redirect("/dashboard");

  if (canManagePersonnel) {
    await prisma.role.upsert({ where: { name: "CAI_INSERTION" }, update: { description: "Cellule CAI - appui insertion" }, create: { name: "CAI_INSERTION", description: "Cellule CAI - appui insertion" } });
  }

  const [agents, services, roles, trainerReviews] = await Promise.all([
    canManagePersonnel ? prisma.agent.findMany({
      include: { service: true, user: { select: { email: true, role: { select: { name: true } } } } },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    }) : Promise.resolve([]),
    canManagePersonnel ? prisma.service.findMany({
      orderBy: { name: "asc" },
    }) : Promise.resolve([]),
    canManagePersonnel ? prisma.role.findMany({
      where: { name: { not: "DIRECTEUR" } },
      orderBy: { name: "asc" },
      select: { name: true, description: true },
    }) : Promise.resolve([]),
    prisma.trainerReview.findMany({
      where: { status: "A_CONFIRMER" },
      include: { agent: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { updatedAt: "desc" },
    }),
  ]);
  const surnameLabels = trainerReviews.map((review) => review.sourceName.replace(/^(?:Mme|M)\.?\s*/i, ""));
  const matchingAgents = surnameLabels.length ? await prisma.agent.findMany({
    where: { OR: surnameLabels.map((lastName) => ({ lastName: { equals: lastName, mode: "insensitive" as const } })) },
    select: { id: true, firstName: true, lastName: true },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  }) : [];
  const params = await searchParams;

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
        {params.trainer === "confirmed" && <p role="status" className="rounded-lg bg-emerald-100 p-3 text-sm font-medium text-emerald-900">Le dossier du formateur a été confirmé et ajouté au personnel.</p>}

        {canReviewTrainers && trainerReviews.length === 0 && <p className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-700">Aucun nouveau formateur n’attend de confirmation. Les noms détectés dans les prochains emplois du temps apparaîtront ici.</p>}
        {trainerReviews.length > 0 && <section className="rounded-xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
          <h2 className="text-xl font-bold text-amber-950">Formateurs détectés à confirmer ({trainerReviews.length})</h2>
          <p className="mt-2 text-sm text-amber-900">Le dernier emploi du temps PDF a fourni ces noms abrégés. Vérifiez chaque identité, choisissez un dossier Personnel existant ou complétez les informations pour créer le dossier.</p>
          <div className="mt-4 space-y-4">
            {trainerReviews.map((review) => {
              const agentsForReview = matchingAgents.filter((agent) => normalizeName(agent.lastName) === review.normalizedName);
              if (review.agent && !agentsForReview.some((agent) => agent.id === review.agent?.id)) agentsForReview.push(review.agent);
              const detectedSurname = review.sourceName.replace(/^(?:Mme|M)\.?\s*/i, "");
              return <form key={review.id} action="/api/personnel/trainer-reviews" method="post" className="grid gap-3 rounded-lg border border-amber-200 bg-white p-4 md:grid-cols-2">
                <input type="hidden" name="reviewId" value={review.id} />
                <div className="md:col-span-2"><strong>{review.sourceName}</strong><span className="ml-2 text-xs text-slate-500">Source : {review.sourceFileName || "PDF"}</span></div>
                <label className="text-sm font-medium">Dossier Personnel à associer
                  <select name="agentId" defaultValue={review.agentId ?? ""} className="mt-1 w-full rounded-lg border p-2">
                    <option value="">Créer un nouveau dossier Personnel</option>
                    {agentsForReview.map((agent) => <option key={agent.id} value={agent.id}>{agent.firstName} {agent.lastName}</option>)}
                  </select>
                </label>
                <div className="hidden md:block" />
                <label className="text-sm font-medium">Prénom à confirmer
                  <input name="firstName" required defaultValue={review.agent?.firstName ?? ""} className="mt-1 w-full rounded-lg border p-2" />
                </label>
                <label className="text-sm font-medium">Nom à confirmer
                  <input name="lastName" required defaultValue={review.agent?.lastName ?? detectedSurname} className="mt-1 w-full rounded-lg border p-2" />
                </label>
                <button type="submit" className="rounded-lg bg-amber-700 px-4 py-2 font-semibold text-white md:col-span-2">Confirmer ou mettre à jour le dossier</button>
              </form>;
            })}
          </div>
        </section>}

        {canManagePersonnel && <section className="rounded-xl bg-white p-5 shadow">
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
        </section>}

        {canManagePersonnel && <section className="rounded-xl bg-white p-5 shadow">
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
        </section>}

        {canManagePersonnel && <section className="rounded-xl bg-white p-5 shadow">
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
        </section>}

      </div>
    </main>
  );
}
