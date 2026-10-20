import Link from "next/link";
import { ArrowLeft, ReceiptText } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function money(value: number) {
  return new Intl.NumberFormat("fr-FR").format(value) + " FCFA";
}

const typeLabels: Record<string, string> = {
  RECETTE: "Recette",
  DEPENSE: "Dépense",
  ENGAGEMENT: "Engagement",
  PAIEMENT: "Paiement",
};

export default async function OperationsPage() {
  const [operations, aggregate] = await Promise.all([
    prisma.financialOperation.findMany({
      include: {
        budgetLine: { include: { budget: true } },
        supplier: true,
      },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      take: 100,
    }),
    prisma.financialOperation.aggregate({
      _count: { id: true },
      _sum: { amount: true },
    }),
  ]);

  return (
    <main className="min-h-screen space-y-6 bg-slate-50 p-4 md:p-6">
      <header>
        <Link href="/finances" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:underline">
          <ArrowLeft size={16} aria-hidden="true" /> Retour aux finances
        </Link>
        <div className="mt-3 flex items-center gap-3">
          <ReceiptText className="text-emerald-700" aria-hidden="true" />
          <h1 className="text-3xl font-bold text-slate-900">Opérations financières</h1>
        </div>
        <p className="mt-2 text-slate-600">Consultez les recettes, dépenses, engagements et paiements enregistrés.</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2" aria-label="Synthèse des opérations">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Opérations enregistrées</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{aggregate._count.id}</p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Montant cumulé</p>
          <p className="mt-2 text-2xl font-bold text-emerald-700">{money(Number(aggregate._sum.amount ?? 0))}</p>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-bold text-slate-900">Journal des opérations</h2>
          <p className="mt-1 text-sm text-slate-500">Les 100 opérations les plus récentes.</p>
        </div>
        {operations.length === 0 ? (
          <p className="p-8 text-center text-slate-500">Aucune opération financière n’est enregistrée pour le moment.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Référence</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Description</th>
                  <th className="px-5 py-3">Fournisseur</th>
                  <th className="px-5 py-3">Ligne budgétaire</th>
                  <th className="px-5 py-3 text-right">Montant</th>
                </tr>
              </thead>
              <tbody>
                {operations.map((operation) => (
                  <tr key={operation.id} className="border-t border-slate-100">
                    <td className="whitespace-nowrap px-5 py-4">{new Intl.DateTimeFormat("fr-FR", { dateStyle: "short" }).format(operation.date)}</td>
                    <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-700">{operation.reference}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                        {typeLabels[operation.type] ?? operation.type}
                      </span>
                    </td>
                    <td className="max-w-sm px-5 py-4">{operation.description}</td>
                    <td className="px-5 py-4">{operation.supplier?.name ?? "—"}</td>
                    <td className="px-5 py-4">
                      {operation.budgetLine
                        ? `${operation.budgetLine.code} · ${operation.budgetLine.label} (${operation.budgetLine.budget.year})`
                        : "—"}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-right font-bold text-slate-900">{money(Number(operation.amount))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
