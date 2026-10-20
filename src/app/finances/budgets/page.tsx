import Link from "next/link";
import { ArrowLeft, Wallet } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function money(value: number) {
  return new Intl.NumberFormat("fr-FR").format(value) + " FCFA";
}

export default async function BudgetsPage() {
  const budgets = await prisma.budget.findMany({
    include: { lines: true },
    orderBy: [{ year: "desc" }, { title: "asc" }],
  });

  const allocated = budgets.reduce(
    (total, budget) => total + Number(budget.amount),
    0
  );
  const spent = budgets.reduce(
    (total, budget) =>
      total + budget.lines.reduce((lineTotal, line) => lineTotal + Number(line.spent), 0),
    0
  );

  return (
    <main className="min-h-screen space-y-6 bg-slate-50 p-4 md:p-6">
      <header>
        <Link href="/finances" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:underline">
          <ArrowLeft size={16} aria-hidden="true" /> Retour aux finances
        </Link>
        <div className="mt-3 flex items-center gap-3">
          <Wallet className="text-blue-700" aria-hidden="true" />
          <h1 className="text-3xl font-bold text-slate-900">Budgets</h1>
        </div>
        <p className="mt-2 text-slate-600">Consultez les enveloppes budgétaires et le suivi de leurs lignes.</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-3" aria-label="Synthèse budgétaire">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Budgets enregistrés</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{budgets.length}</p>
        </div>
        <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Montant total prévu</p>
          <p className="mt-2 text-2xl font-bold text-blue-700">{money(allocated)}</p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Dépenses imputées</p>
          <p className="mt-2 text-2xl font-bold text-emerald-700">{money(spent)}</p>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-bold text-slate-900">Liste des budgets</h2>
        </div>
        {budgets.length === 0 ? (
          <p className="p-8 text-center text-slate-500">Aucun budget n’est enregistré pour le moment.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">Année</th>
                  <th className="px-5 py-3">Budget</th>
                  <th className="px-5 py-3">Lignes</th>
                  <th className="px-5 py-3">Montant</th>
                  <th className="px-5 py-3">Engagé</th>
                  <th className="px-5 py-3">Dépensé</th>
                </tr>
              </thead>
              <tbody>
                {budgets.map((budget) => {
                  const committed = budget.lines.reduce((sum, line) => sum + Number(line.committed), 0);
                  const budgetSpent = budget.lines.reduce((sum, line) => sum + Number(line.spent), 0);
                  return (
                    <tr key={budget.id} className="border-t border-slate-100 align-top">
                      <td className="whitespace-nowrap px-5 py-4">{budget.year}</td>
                      <td className="px-5 py-4">
                        <strong className="text-slate-900">{budget.title}</strong>
                        {budget.description && <p className="mt-1 max-w-md text-slate-500">{budget.description}</p>}
                        {budget.lines.length > 0 && (
                          <ul className="mt-3 space-y-1 text-xs text-slate-500">
                            {budget.lines.map((line) => (
                              <li key={line.id}>{line.code} · {line.label} — {money(Number(line.allocated))}</li>
                            ))}
                          </ul>
                        )}
                      </td>
                      <td className="px-5 py-4">{budget.lines.length}</td>
                      <td className="whitespace-nowrap px-5 py-4 font-semibold">{money(Number(budget.amount))}</td>
                      <td className="whitespace-nowrap px-5 py-4 text-amber-700">{money(committed)}</td>
                      <td className="whitespace-nowrap px-5 py-4 font-semibold text-emerald-700">{money(budgetSpent)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
