import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function getCurrentAcademicYear() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  return month >= 9
    ? `${year}-${year + 1}`
    : `${year - 1}-${year}`;
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("fr-FR").format(value) + " FCFA";
}

export default async function FinancesPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const params = await searchParams;
  const academicYear = params.year || getCurrentAcademicYear();

  const [
    enrollmentStats,
    paymentStats,
    learnerCount,
    recentPayments,
  ] = await Promise.all([
    prisma.enrollment.aggregate({
      where: {
        academicYear,
      },
      _sum: {
        netPayable: true,
        registrationFee: true,
        trainingCost: true,
        discount: true,
        scholarshipCoverage: true,
      },
      _count: {
        id: true,
      },
    }),

    prisma.learnerPayment.aggregate({
      where: {
        enrollment: {
          academicYear,
        },
      },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    }),

    prisma.learner.count({
      where: {
        enrollments: {
          some: {
            academicYear,
          },
        },
      },
    }),

    prisma.learnerPayment.findMany({
      where: {
        enrollment: {
          academicYear,
        },
      },
      include: {
        learner: true,
        enrollment: {
          include: {
            training: true,
          },
        },
        registeredBy: true,
        receipt: true,
      },
      orderBy: {
        paidAt: "desc",
      },
      take: 20,
    }),
  ]);

  const previsions = Number(enrollmentStats._sum.netPayable || 0);
  const totalEncaisse = Number(paymentStats._sum.amount || 0);
  const resteAEncaisser = Math.max(0, previsions - totalEncaisse);

  const tauxRecouvrement =
    previsions > 0
      ? Math.min(100, (totalEncaisse / previsions) * 100)
      : 0;

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <header>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Finances / Comptabilité
              </h1>
              <p className="mt-2 text-slate-600">
                Suivi des inscriptions, encaissements et prévisions du CFP
                Sédhiou.
              </p>
            </div>

            <form method="get" className="flex items-center gap-2">
              <label
                htmlFor="year"
                className="text-sm font-medium text-slate-700"
              >
                Année académique
              </label>

              <select
                id="year"
                name="year"
                defaultValue={academicYear}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                <option value="2026-2027">2026-2027</option>
                <option value="2027-2028">2027-2028</option>
                <option value="2028-2029">2028-2029</option>
                <option value="2029-2030">2029-2030</option>
              </select>

              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
              >
                Afficher
              </button>
            </form>
          </div>
        </header>

        {/* INDICATEURS FINANCIERS DES INSCRIPTIONS */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">
              Total des inscriptions
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {formatMoney(previsions)}
            </p>

            <p className="mt-2 text-xs text-slate-500">
              Prévisions pour {academicYear}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-emerald-100">
            <p className="text-sm text-slate-500">
              Total réellement encaissé
            </p>

            <p className="mt-2 text-3xl font-bold text-emerald-600">
              {formatMoney(totalEncaisse)}
            </p>

            <p className="mt-2 text-xs text-slate-500">
              Paiements enregistrés
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-orange-100">
            <p className="text-sm text-slate-500">
              Reste à encaisser
            </p>

            <p className="mt-2 text-3xl font-bold text-orange-600">
              {formatMoney(resteAEncaisser)}
            </p>

            <p className="mt-2 text-xs text-slate-500">
              Prévisions moins encaissements
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-blue-100">
            <p className="text-sm text-slate-500">
              Taux d'encaissement
            </p>

            <p className="mt-2 text-3xl font-bold text-blue-600">
              {tauxRecouvrement.toFixed(1)} %
            </p>

            <p className="mt-2 text-xs text-slate-500">
              {learnerCount} apprenant(s) inscrit(s)
            </p>
          </div>
        </section>

        {/* SYNTHÈSE */}
        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-xl font-bold text-slate-900">
              Prévisions financières
            </h2>

            <div className="mt-5 space-y-4">
              <div className="flex justify-between border-b pb-3">
                <span className="text-slate-600">
                  Frais d'inscription
                </span>
                <strong>
                  {formatMoney(
                    Number(enrollmentStats._sum.registrationFee || 0)
                  )}
                </strong>
              </div>

              <div className="flex justify-between border-b pb-3">
                <span className="text-slate-600">
                  Coût des formations
                </span>
                <strong>
                  {formatMoney(
                    Number(enrollmentStats._sum.trainingCost || 0)
                  )}
                </strong>
              </div>

              <div className="flex justify-between border-b pb-3">
                <span className="text-slate-600">
                  Réductions
                </span>
                <strong className="text-red-600">
                  -{" "}
                  {formatMoney(
                    Number(enrollmentStats._sum.discount || 0)
                  )}
                </strong>
              </div>

              <div className="flex justify-between border-b pb-3">
                <span className="text-slate-600">
                  Prises en charge / bourses
                </span>
                <strong className="text-blue-600">
                  -{" "}
                  {formatMoney(
                    Number(
                      enrollmentStats._sum.scholarshipCoverage || 0
                    )
                  )}
                </strong>
              </div>

              <div className="flex justify-between rounded-xl bg-slate-100 p-4">
                <span className="font-bold text-slate-900">
                  Net à prévoir
                </span>
                <strong className="text-xl text-slate-900">
                  {formatMoney(previsions)}
                </strong>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-xl font-bold text-slate-900">
              Situation des encaissements
            </h2>

            <div className="mt-5 space-y-4">
              <div className="rounded-xl bg-emerald-50 p-4">
                <p className="text-sm text-emerald-700">
                  Montant encaissé
                </p>
                <p className="mt-1 text-2xl font-bold text-emerald-700">
                  {formatMoney(totalEncaisse)}
                </p>
              </div>

              <div className="rounded-xl bg-orange-50 p-4">
                <p className="text-sm text-orange-700">
                  Montant encore attendu
                </p>
                <p className="mt-1 text-2xl font-bold text-orange-700">
                  {formatMoney(resteAEncaisser)}
                </p>
              </div>

              <div className="rounded-xl bg-slate-100 p-4">
                <p className="text-sm text-slate-600">
                  Nombre de paiements
                </p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {paymentStats._count.id}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* DERNIERS ENCAISSEMENTS */}
        <section className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="border-b border-slate-200 p-5">
            <h2 className="text-xl font-bold text-slate-900">
              Derniers encaissements
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Année académique : {academicYear}
            </p>
          </div>

          {recentPayments.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              Aucun paiement enregistré pour cette année.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">Matricule</th>
                    <th className="px-5 py-3">Apprenant</th>
                    <th className="px-5 py-3">Formation</th>
                    <th className="px-5 py-3">Montant</th>
                    <th className="px-5 py-3">Mode</th>
                    <th className="px-5 py-3">Reçu</th>
                  </tr>
                </thead>

                <tbody>
                  {recentPayments.map((payment) => (
                    <tr
                      key={payment.id}
                      className="border-t border-slate-100"
                    >
                      <td className="px-5 py-3">
                        {new Intl.DateTimeFormat("fr-FR", {
                          dateStyle: "short",
                        }).format(payment.paidAt)}
                      </td>

                      <td className="px-5 py-3 font-semibold text-blue-700">
                        {payment.learner.matricule}
                      </td>

                      <td className="px-5 py-3 font-medium">
                        {payment.learner.firstName}{" "}
                        {payment.learner.lastName}
                      </td>

                      <td className="px-5 py-3">
                        {payment.enrollment.training.title}
                      </td>

                      <td className="px-5 py-3 font-bold text-emerald-600">
                        {formatMoney(Number(payment.amount))}
                      </td>

                      <td className="px-5 py-3">
                        {payment.method}
                      </td>

                      <td className="px-5 py-3">
                        {payment.receipt ? (
                          <a
                            href={`/apprenants/recu/${payment.receipt.receiptNumber}`}
                            className="font-semibold text-blue-600 hover:underline"
                          >
                            Voir le reçu
                          </a>
                        ) : (
                          <span className="text-slate-400">
                            —
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
