import { prisma } from "@/lib/prisma";

export default async function ApprenantsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const params = await searchParams;
  const search = (params.search || "").trim();

  const apprenants = await prisma.learner.findMany({
    where: search
      ? {
          OR: [
            {
              matricule: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              firstName: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              lastName: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              phone: {
                contains: search,
                mode: "insensitive",
              },
            },
          ],
        }
      : undefined,
    orderBy: [
      { lastName: "asc" },
      { firstName: "asc" },
    ],
    include: {
      enrollments: {
        include: {
          training: true,
          payments: true,
        },
        orderBy: {
          academicYear: "desc",
        },
        take: 1,
      },
    },
  });

  return (
    <div className="min-h-screen p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Apprenants
          </h1>
          <p className="mt-2 text-slate-500">
            Gestion administrative et financière des apprenants du CFP Sédhiou.
          </p>
        </div>

        <a
          href="/apprenants/nouveau"
          className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm"
        >
          + Enregistrer un apprenant
        </a>
      </div>

      <form
        method="GET"
        className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            name="search"
            defaultValue={search}
            placeholder="Rechercher par matricule, nom, prénom ou téléphone..."
            className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
          />

          <button
            type="submit"
            className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
          >
            Rechercher
          </button>

          {search && (
            <a
              href="/apprenants"
              className="rounded-xl bg-slate-100 px-5 py-3 text-center text-sm font-semibold text-slate-700"
            >
              Effacer
            </a>
          )}
        </div>
      </form>

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            {search ? "Résultats" : "Total apprenants"}
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {apprenants.length}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Liste des apprenants
          </h2>
        </div>

        {apprenants.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            Aucun apprenant trouvé.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {apprenants.map((apprenant) => {
              const inscription = apprenant.enrollments[0];

              const totalPaid = inscription
                ? inscription.payments.reduce(
                    (total, payment) => total + Number(payment.amount),
                    0
                  )
                : 0;

              const netPayable = inscription
                ? Number(inscription.netPayable)
                : 0;

              const statut =
                !inscription
                  ? "NON INSCRIT"
                  : totalPaid >= netPayable && netPayable > 0
                    ? "PAYÉ"
                    : totalPaid > 0
                      ? "PARTIEL"
                      : "IMPAYÉ";

              return (
                <a
                  key={apprenant.id}
                  href={`/apprenants/${apprenant.id}`}
                  className="block p-5 transition hover:bg-slate-50"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {apprenant.firstName} {apprenant.lastName}
                      </h3>

                      <p className="mt-1 text-sm font-medium text-blue-700">
                        Matricule : {apprenant.matricule}
                      </p>

                      {apprenant.phone && (
                        <p className="text-sm text-slate-500">
                          Téléphone : {apprenant.phone}
                        </p>
                      )}
                    </div>

                    <div className="text-sm md:text-right">
                      {inscription ? (
                        <>
                          <p className="font-medium text-slate-700">
                            {inscription.training.title}
                          </p>

                          <p className="text-slate-500">
                            Niveau : {inscription.level || "Non renseigné"}
                          </p>

                          <p className="text-slate-500">
                            Année : {inscription.academicYear}
                          </p>

                          <span
                            className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                              statut === "PAYÉ"
                                ? "bg-green-100 text-green-700"
                                : statut === "PARTIEL"
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-red-100 text-red-700"
                            }`}
                          >
                            {statut}
                          </span>
                        </>
                      ) : (
                        <span className="text-slate-400">
                          Aucune inscription
                        </span>
                      )}
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
