import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function ApprenantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const apprenant = await prisma.learner.findUnique({
    where: { id },
    include: {
      enrollments: {
        include: {
          training: true,
          payments: {
            include: {
              receipt: true,
            },
            orderBy: {
              paidAt: "desc",
            },
          },
        },
        orderBy: {
          academicYear: "desc",
        },
      },
    },
  });

  if (!apprenant) {
    notFound();
  }

  const formatMoney = (value: number) =>
    new Intl.NumberFormat("fr-FR").format(value) + " FCFA";

  return (
    <main className="min-h-screen p-4 md:p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <a
              href="/apprenants"
              className="text-sm font-medium text-blue-700"
            >
              ← Retour aux apprenants
            </a>

            <h1 className="mt-3 text-3xl font-bold text-slate-900">
              {apprenant.firstName} {apprenant.lastName}
            </h1>

            <p className="mt-1 text-slate-500">
              Fiche complète de l'apprenant
            </p>
          </div>

          <div className="rounded-xl bg-blue-50 px-5 py-3 text-center">
            <p className="text-xs font-semibold uppercase text-blue-600">
              Matricule
            </p>
            <p className="text-xl font-bold text-blue-900">
              {apprenant.matricule}
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Informations personnelles
            </h2>

            <div className="mt-4 space-y-3 text-sm">
              <p>
                <span className="text-slate-500">Prénom :</span>{" "}
                <strong>{apprenant.firstName}</strong>
              </p>

              <p>
                <span className="text-slate-500">Nom :</span>{" "}
                <strong>{apprenant.lastName}</strong>
              </p>

              <p>
                <span className="text-slate-500">Téléphone :</span>{" "}
                <strong>{apprenant.phone || "Non renseigné"}</strong>
              </p>

              <p>
                <span className="text-slate-500">Email :</span>{" "}
                <strong>{apprenant.email || "Non renseigné"}</strong>
              </p>

              <p>
                <span className="text-slate-500">Année d'intégration :</span>{" "}
                <strong>{apprenant.integrationYear || "Non renseignée"}</strong>
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Situation d'inscription
            </h2>

            {apprenant.enrollments.length === 0 ? (
              <p className="mt-4 text-sm text-slate-500">
                Aucune inscription.
              </p>
            ) : (
              <div className="mt-4 space-y-4">
                {apprenant.enrollments.map((inscription) => {
                  const totalPaid = inscription.payments.reduce(
                    (total, payment) => total + Number(payment.amount),
                    0
                  );

                  const netPayable = Number(inscription.netPayable);
                  const reste = Math.max(0, netPayable - totalPaid);

                  const statut =
                    totalPaid >= netPayable && netPayable > 0
                      ? "PAYÉ"
                      : totalPaid > 0
                        ? "PARTIEL"
                        : "IMPAYÉ";

                  return (
                    <div
                      key={inscription.id}
                      className="rounded-xl border border-slate-200 p-4"
                    >
                      <div className="flex flex-wrap justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {inscription.training.title}
                          </p>
                          <p className="text-sm text-slate-500">
                            {inscription.academicYear} ·{" "}
                            {inscription.level || "Niveau non renseigné"}
                          </p>
                        </div>

                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                          {inscription.status || "INSCRIT"}
                        </span>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-lg bg-slate-50 p-3">
                          <p className="text-xs text-slate-500">
                            Frais d'inscription
                          </p>
                          <p className="font-semibold">
                            {formatMoney(Number(inscription.registrationFee))}
                          </p>
                        </div>

                        <div className="rounded-lg bg-slate-50 p-3">
                          <p className="text-xs text-slate-500">
                            Coût formation
                          </p>
                          <p className="font-semibold">
                            {formatMoney(Number(inscription.trainingCost))}
                          </p>
                        </div>

                        <div className="rounded-lg bg-slate-50 p-3">
                          <p className="text-xs text-slate-500">Réduction</p>
                          <p className="font-semibold">
                            {formatMoney(Number(inscription.discount))}
                          </p>
                        </div>

                        <div className="rounded-lg bg-slate-50 p-3">
                          <p className="text-xs text-slate-500">
                            Prise en charge / bourse
                          </p>
                          <p className="font-semibold">
                            {formatMoney(
                              Number(inscription.scholarshipCoverage)
                            )}
                          </p>
                        </div>

                        <div className="rounded-lg bg-blue-50 p-3">
                          <p className="text-xs text-blue-600">Net à payer</p>
                          <p className="font-bold text-blue-900">
                            {formatMoney(netPayable)}
                          </p>
                        </div>

                        <div className="rounded-lg bg-green-50 p-3">
                          <p className="text-xs text-green-600">Total payé</p>
                          <p className="font-bold text-green-800">
                            {formatMoney(totalPaid)}
                          </p>
                        </div>

                        <div className="rounded-lg bg-red-50 p-3">
                          <p className="text-xs text-red-600">Reste à payer</p>
                          <p className="font-bold text-red-800">
                            {formatMoney(reste)}
                          </p>
                        </div>

                        <div className="rounded-lg bg-slate-100 p-3">
                          <p className="text-xs text-slate-500">
                            Situation financière
                          </p>
                          <p className="font-bold text-slate-900">
                            {statut}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5">
                        <h3 className="font-semibold text-slate-900">
                          Historique des paiements
                        </h3>

                        {inscription.payments.length === 0 ? (
                          <p className="mt-2 text-sm text-slate-500">
                            Aucun paiement enregistré.
                          </p>
                        ) : (
                          <div className="mt-3 divide-y rounded-xl border border-slate-200">
                            {inscription.payments.map((payment) => (
                              <div
                                key={payment.id}
                                className="flex flex-wrap items-center justify-between gap-3 p-3"
                              >
                                <div>
                                  <p className="font-medium">
                                    {formatMoney(Number(payment.amount))}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    {payment.method} ·{" "}
                                    {payment.paymentReference}
                                  </p>
                                </div>

                                {payment.receipt ? (
                                  <a
                                    href={`/apprenants/recu/${payment.receipt.receiptNumber}`}
                                    className="rounded-lg bg-blue-700 px-3 py-2 text-xs font-semibold text-white"
                                  >
                                    Voir le reçu
                                  </a>
                                ) : null}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
