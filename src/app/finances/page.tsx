import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function FinancesPage() {
  const [budgets, lines, operations, suppliers] = await Promise.all([
    prisma.budget.findMany({
      include: { lines: true },
      orderBy: { year: "desc" },
    }),
    prisma.budgetLine.findMany({
      include: { budget: true },
      orderBy: { code: "asc" },
    }),
    prisma.financialOperation.findMany({
      include: { budgetLine: true, supplier: true },
      orderBy: { date: "desc" },
      take: 20,
    }),
    prisma.supplier.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  const totalBudget = budgets.reduce(
    (sum, b) => sum + Number(b.amount),
    0
  );

  const totalAllocated = lines.reduce(
    (sum, l) => sum + Number(l.allocated),
    0
  );

  const totalCommitted = lines.reduce(
    (sum, l) => sum + Number(l.committed),
    0
  );

  const totalSpent = lines.reduce(
    (sum, l) => sum + Number(l.spent),
    0
  );

  const available = totalAllocated - totalCommitted;

  return (
    <main className="min-h-screen bg-slate-50 p-4">
      <div className="mx-auto max-w-7xl space-y-6">

        <header>
          <h1 className="text-3xl font-bold">
            Finances / Comptabilité
          </h1>
          <p className="mt-2 text-slate-600">
            Suivi budgétaire et financier du CFP Sédhiou
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-5">
          <div className="rounded-xl bg-white p-5 shadow">
            <p className="text-sm text-slate-500">Budgets</p>
            <p className="text-2xl font-bold">{budgets.length}</p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow">
            <p className="text-sm text-slate-500">Budget total</p>
            <p className="text-2xl font-bold">
              {totalBudget.toLocaleString("fr-FR")}
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow">
            <p className="text-sm text-slate-500">Alloué</p>
            <p className="text-2xl font-bold">
              {totalAllocated.toLocaleString("fr-FR")}
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow">
            <p className="text-sm text-slate-500">Engagé</p>
            <p className="text-2xl font-bold">
              {totalCommitted.toLocaleString("fr-FR")}
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow">
            <p className="text-sm text-slate-500">Disponible</p>
            <p className="text-2xl font-bold">
              {available.toLocaleString("fr-FR")}
            </p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">

          <div className="rounded-xl bg-white p-5 shadow">
            <h2 className="text-xl font-bold">
              Créer un budget
            </h2>

            <form
              action="/api/finances"
              method="post"
              className="mt-4 space-y-3"
            >
              <input type="hidden" name="action" value="budget" />

              <input
                name="year"
                type="number"
                required
                placeholder="Année"
                className="w-full rounded-lg border p-3"
              />

              <input
                name="title"
                required
                placeholder="Titre du budget"
                className="w-full rounded-lg border p-3"
              />

              <input
                name="amount"
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="Montant total"
                className="w-full rounded-lg border p-3"
              />

              <textarea
                name="description"
                placeholder="Description"
                className="w-full rounded-lg border p-3"
              />

              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white"
              >
                Enregistrer le budget
              </button>
            </form>
          </div>

          <div className="rounded-xl bg-white p-5 shadow">
            <h2 className="text-xl font-bold">
              Créer une ligne budgétaire
            </h2>

            <form
              action="/api/finances"
              method="post"
              className="mt-4 space-y-3"
            >
              <input
                type="hidden"
                name="action"
                value="budgetLine"
              />

              <select
                name="budgetId"
                required
                className="w-full rounded-lg border p-3"
              >
                <option value="">
                  Sélectionner le budget
                </option>

                {budgets.map((budget) => (
                  <option key={budget.id} value={budget.id}>
                    {budget.year} — {budget.title}
                  </option>
                ))}
              </select>

              <input
                name="code"
                required
                placeholder="Code budgétaire"
                className="w-full rounded-lg border p-3"
              />

              <input
                name="label"
                required
                placeholder="Libellé"
                className="w-full rounded-lg border p-3"
              />

              <input
                name="allocated"
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="Montant alloué"
                className="w-full rounded-lg border p-3"
              />

              <button
                type="submit"
                className="rounded-lg bg-emerald-600 px-5 py-3 font-semibold text-white"
              >
                Enregistrer la ligne
              </button>
            </form>
          </div>

        </section>

        <section className="rounded-xl bg-white p-5 shadow">
          <h2 className="text-xl font-bold">
            Budgets
          </h2>

          {budgets.length === 0 ? (
            <p className="mt-4 text-slate-500">
              Aucun budget enregistré.
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-slate-100">
                  <tr>
                    <th className="p-3">Année</th>
                    <th className="p-3">Budget</th>
                    <th className="p-3">Montant</th>
                    <th className="p-3">Lignes</th>
                  </tr>
                </thead>

                <tbody>
                  {budgets.map((budget) => (
                    <tr key={budget.id} className="border-b">
                      <td className="p-3">{budget.year}</td>
                      <td className="p-3 font-medium">
                        {budget.title}
                      </td>
                      <td className="p-3">
                        {Number(budget.amount).toLocaleString("fr-FR")}
                      </td>
                      <td className="p-3">
                        {budget.lines.length}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-xl bg-white p-5 shadow">
          <h2 className="text-xl font-bold">
            Lignes budgétaires
          </h2>

          {lines.length === 0 ? (
            <p className="mt-4 text-slate-500">
              Aucune ligne budgétaire enregistrée.
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-slate-100">
                  <tr>
                    <th className="p-3">Code</th>
                    <th className="p-3">Libellé</th>
                    <th className="p-3">Alloué</th>
                    <th className="p-3">Engagé</th>
                    <th className="p-3">Dépensé</th>
                    <th className="p-3">Disponible</th>
                  </tr>
                </thead>

                <tbody>
                  {lines.map((line) => {
                    const allocated = Number(line.allocated);
                    const committed = Number(line.committed);
                    const spent = Number(line.spent);

                    return (
                      <tr key={line.id} className="border-b">
                        <td className="p-3 font-medium">
                          {line.code}
                        </td>
                        <td className="p-3">
                          {line.label}
                        </td>
                        <td className="p-3">
                          {allocated.toLocaleString("fr-FR")}
                        </td>
                        <td className="p-3">
                          {committed.toLocaleString("fr-FR")}
                        </td>
                        <td className="p-3">
                          {spent.toLocaleString("fr-FR")}
                        </td>
                        <td className="p-3 font-semibold">
                          {(allocated - committed).toLocaleString("fr-FR")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-xl bg-white p-5 shadow">
          <h2 className="text-xl font-bold">
            Ajouter un fournisseur
          </h2>

          <form
            action="/api/finances"
            method="post"
            className="mt-4 grid gap-3 md:grid-cols-2"
          >
            <input type="hidden" name="action" value="supplier" />

            <input
              name="name"
              required
              placeholder="Nom du fournisseur"
              className="rounded-lg border p-3"
            />

            <input
              name="identifier"
              placeholder="NINEA / identifiant"
              className="rounded-lg border p-3"
            />

            <input
              name="phone"
              placeholder="Téléphone"
              className="rounded-lg border p-3"
            />

            <input
              name="email"
              type="email"
              placeholder="E-mail"
              className="rounded-lg border p-3"
            />

            <input
              name="address"
              placeholder="Adresse"
              className="rounded-lg border p-3 md:col-span-2"
            />

            <button
              type="submit"
              className="rounded-lg bg-slate-700 px-5 py-3 font-semibold text-white md:col-span-2"
            >
              Enregistrer le fournisseur
            </button>
          </form>
        </section>

        <section className="rounded-xl bg-white p-5 shadow">
          <h2 className="text-xl font-bold">
            Nouvelle opération financière
          </h2>

          <form
            action="/api/finances"
            method="post"
            className="mt-4 grid gap-3 md:grid-cols-2"
          >
            <input type="hidden" name="action" value="operation" />

            <input
              name="reference"
              required
              placeholder="Référence"
              className="rounded-lg border p-3"
            />

            <select
              name="type"
              required
              className="rounded-lg border p-3"
            >
              <option value="">Type d'opération</option>
              <option value="ENGAGEMENT">Engagement</option>
              <option value="DEPENSE">Dépense</option>
              <option value="PAIEMENT">Paiement</option>
              <option value="RECETTE">Recette</option>
            </select>

            <input
              name="date"
              type="date"
              required
              className="rounded-lg border p-3"
            />

            <input
              name="amount"
              type="number"
              min="0.01"
              step="0.01"
              required
              placeholder="Montant"
              className="rounded-lg border p-3"
            />

            <input
              name="description"
              required
              placeholder="Description"
              className="rounded-lg border p-3 md:col-span-2"
            />

            <select
              name="budgetLineId"
              className="rounded-lg border p-3"
            >
              <option value="">
                Ligne budgétaire
              </option>

              {lines.map((line) => (
                <option key={line.id} value={line.id}>
                  {line.code} — {line.label}
                </option>
              ))}
            </select>

            <select
              name="supplierId"
              className="rounded-lg border p-3"
            >
              <option value="">
                Fournisseur
              </option>

              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="rounded-lg bg-purple-600 px-5 py-3 font-semibold text-white md:col-span-2"
            >
              Enregistrer l'opération
            </button>
          </form>
        </section>

        <section className="rounded-xl bg-white p-5 shadow">
          <h2 className="text-xl font-bold">
            Dernières opérations
          </h2>

          {operations.length === 0 ? (
            <p className="mt-4 text-slate-500">
              Aucune opération financière enregistrée.
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-slate-100">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Référence</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Description</th>
                    <th className="p-3">Montant</th>
                  </tr>
                </thead>

                <tbody>
                  {operations.map((operation) => (
                    <tr key={operation.id} className="border-b">
                      <td className="p-3">
                        {operation.date.toLocaleDateString("fr-FR")}
                      </td>
                      <td className="p-3 font-medium">
                        {operation.reference}
                      </td>
                      <td className="p-3">
                        {operation.type}
                      </td>
                      <td className="p-3">
                        {operation.description}
                      </td>
                      <td className="p-3">
                        {Number(operation.amount).toLocaleString("fr-FR")}
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
