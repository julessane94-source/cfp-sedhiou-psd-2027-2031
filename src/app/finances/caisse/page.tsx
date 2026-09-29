import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CaisseActions } from "./CaisseActions";

export const dynamic = "force-dynamic";

function money(value: number) {
  return new Intl.NumberFormat("fr-FR").format(value) + " FCFA";
}

export default async function CaissePage() {
  const mouvements = await prisma.cashMovement.findMany({
    include: {
      registeredBy: true,
      learnerPayment: {
        include: {
          learner: true,
        },
      },
    },
    orderBy: {
      movementDate: "desc",
    },
    take: 100,
  });

  const entrees = mouvements
    .filter((m) => m.type === "ENTREE")
    .reduce((total, m) => total + Number(m.amount), 0);

  const sorties = mouvements
    .filter((m) => m.type === "SORTIE")
    .reduce((total, m) => total + Number(m.amount), 0);

  const solde = entrees - sorties;

  return (
    <main className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <Link
            href="/finances"
            className="text-sm text-blue-600 hover:underline"
          >
            ← Retour aux finances
          </Link>

          <h1 className="mt-2 text-2xl font-bold text-slate-900">
            Registre de caisse
          </h1>

          <p className="text-sm text-slate-500">
            Suivi des entrées, sorties et du solde de caisse du CFP Sédhiou.
          </p>
        </div>

        <CaisseActions />
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Solde de caisse</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {money(solde)}
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total des entrées</p>
          <p className="mt-2 text-3xl font-bold text-emerald-600">
            {money(entrees)}
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total des sorties</p>
          <p className="mt-2 text-3xl font-bold text-red-600">
            {money(sorties)}
          </p>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="border-b px-5 py-4">
          <h2 className="font-semibold text-slate-900">
            Journal de caisse
          </h2>
          <p className="text-sm text-slate-500">
            Les paiements d'inscription apparaissent automatiquement ici.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Référence</th>
                <th className="px-4 py-3">Libellé</th>
                <th className="px-4 py-3">Catégorie</th>
                <th className="px-4 py-3">Entrée</th>
                <th className="px-4 py-3">Sortie</th>
                <th className="px-4 py-3">Agent</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {mouvements.map((mouvement) => {
                const montant = Number(mouvement.amount);
                const apprenant = mouvement.learnerPayment?.learner;

                return (
                  <tr key={mouvement.id} className="hover:bg-slate-50">
                    <td className="whitespace-nowrap px-4 py-3">
                      {new Date(mouvement.movementDate).toLocaleDateString(
                        "fr-FR"
                      )}
                    </td>

                    <td className="px-4 py-3 font-medium">
                      {mouvement.movementNumber}
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">
                        {mouvement.label}
                      </div>

                      {apprenant && (
                        <div className="text-xs text-slate-500">
                          {apprenant.matricule} — {apprenant.firstName}{" "}
                          {apprenant.lastName}
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      {mouvement.category}
                    </td>

                    <td className="px-4 py-3 font-semibold text-emerald-600">
                      {mouvement.type === "ENTREE"
                        ? money(montant)
                        : "—"}
                    </td>

                    <td className="px-4 py-3 font-semibold text-red-600">
                      {mouvement.type === "SORTIE"
                        ? money(montant)
                        : "—"}
                    </td>

                    <td className="px-4 py-3 text-slate-600">
                      {mouvement.registeredBy?.firstName}{" "}
                      {mouvement.registeredBy?.lastName}
                    </td>
                  </tr>
                );
              })}

              {mouvements.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-slate-500"
                  >
                    Aucun mouvement de caisse pour le moment.
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
