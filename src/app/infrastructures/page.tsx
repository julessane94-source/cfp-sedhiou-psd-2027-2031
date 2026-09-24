import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function InfrastructuresPage() {
  const [assets, categories, services] = await Promise.all([
    prisma.asset.findMany({
      include: {
        category: true,
        service: true,
        _count: { select: { maintenances: true } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.assetCategory.findMany({
      orderBy: { name: "asc" },
    }),
    prisma.service.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  const actifs = assets.filter((a) => a.status === "ACTIF").length;
  const maintenance = assets.filter(
    (a) => a.status === "EN_MAINTENANCE"
  ).length;
  const horsService = assets.filter(
    (a) => a.status === "HORS_SERVICE"
  ).length;

  return (
    <main className="min-h-screen bg-slate-50 p-4">
      <div className="mx-auto max-w-7xl space-y-6">

        <header>
          <h1 className="text-3xl font-bold">
            Patrimoine / Infrastructures
          </h1>
          <p className="mt-2 text-slate-600">
            Gestion des équipements et du patrimoine du CFP Sédhiou
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          <div className="rounded-xl bg-white p-5 shadow">
            <p className="text-sm text-slate-500">Biens</p>
            <p className="text-3xl font-bold">{assets.length}</p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow">
            <p className="text-sm text-slate-500">Actifs</p>
            <p className="text-3xl font-bold">{actifs}</p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow">
            <p className="text-sm text-slate-500">Maintenance</p>
            <p className="text-3xl font-bold">{maintenance}</p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow">
            <p className="text-sm text-slate-500">Hors service</p>
            <p className="text-3xl font-bold">{horsService}</p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">

          <div className="rounded-xl bg-white p-5 shadow">
            <h2 className="text-xl font-bold">
              Ajouter une catégorie
            </h2>

            <form
              action="/api/infrastructures"
              method="post"
              className="mt-4 space-y-3"
            >
              <input
                type="hidden"
                name="action"
                value="category"
              />

              <input
                name="name"
                required
                placeholder="Ex : Informatique"
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
                Créer la catégorie
              </button>
            </form>
          </div>

          <div className="rounded-xl bg-white p-5 shadow">
            <h2 className="text-xl font-bold">
              Ajouter un équipement
            </h2>

            <form
              action="/api/infrastructures"
              method="post"
              className="mt-4 space-y-3"
            >
              <input
                type="hidden"
                name="action"
                value="asset"
              />

              <input
                name="inventoryCode"
                required
                placeholder="Code inventaire"
                className="w-full rounded-lg border p-3"
              />

              <input
                name="name"
                required
                placeholder="Désignation"
                className="w-full rounded-lg border p-3"
              />

              <textarea
                name="description"
                placeholder="Description"
                className="w-full rounded-lg border p-3"
              />

              <input
                name="location"
                placeholder="Localisation"
                className="w-full rounded-lg border p-3"
              />

              <label className="block text-sm font-medium">
                Date d'acquisition
              </label>

              <input
                name="acquisitionDate"
                type="date"
                className="w-full rounded-lg border p-3"
              />

              <input
                name="acquisitionValue"
                type="number"
                step="0.01"
                placeholder="Valeur d'acquisition"
                className="w-full rounded-lg border p-3"
              />

              <select
                name="categoryId"
                className="w-full rounded-lg border p-3"
              >
                <option value="">Sans catégorie</option>

                {categories.map((category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                ))}
              </select>

              <select
                name="serviceId"
                className="w-full rounded-lg border p-3"
              >
                <option value="">Sans service</option>

                {services.map((service) => (
                  <option
                    key={service.id}
                    value={service.id}
                  >
                    {service.name}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                className="rounded-lg bg-emerald-600 px-5 py-3 font-semibold text-white"
              >
                Enregistrer l'équipement
              </button>
            </form>
          </div>

        </section>

        <section className="rounded-xl bg-white p-5 shadow">
          <h2 className="text-xl font-bold">
            Enregistrer une maintenance
          </h2>

          <form
            action="/api/infrastructures"
            method="post"
            className="mt-4 grid gap-3 md:grid-cols-2"
          >
            <input
              type="hidden"
              name="action"
              value="maintenance"
            />

            <select
              name="assetId"
              required
              className="rounded-lg border p-3"
            >
              <option value="">Choisir un équipement</option>
              {assets.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.inventoryCode} — {asset.name}
                </option>
              ))}
            </select>

            <input
              name="date"
              type="date"
              required
              className="rounded-lg border p-3"
            />

            <input
              name="description"
              required
              placeholder="Panne ou intervention"
              className="rounded-lg border p-3"
            />

            <input
              name="cost"
              type="number"
              step="0.01"
              placeholder="Coût de l'intervention"
              className="rounded-lg border p-3"
            />

            <input
              name="provider"
              placeholder="Prestataire"
              className="rounded-lg border p-3"
            />

            <select
              name="status"
              className="rounded-lg border p-3"
            >
              <option value="EN_COURS">En cours</option>
              <option value="TERMINE">Terminée</option>
            </select>

            <button
              type="submit"
              className="rounded-lg bg-orange-600 px-5 py-3 font-semibold text-white md:col-span-2"
            >
              Enregistrer la maintenance
            </button>
          </form>
        </section>

        <section className="rounded-xl bg-white p-5 shadow">
          <h2 className="text-xl font-bold">
            Inventaire du patrimoine
          </h2>

          {assets.length === 0 ? (
            <p className="mt-4 text-slate-500">
              Aucun équipement enregistré.
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-slate-100">
                  <tr>
                    <th className="p-3">Code</th>
                    <th className="p-3">Désignation</th>
                    <th className="p-3">Catégorie</th>
                    <th className="p-3">Localisation</th>
                    <th className="p-3">Service</th>
                    <th className="p-3">État</th>
                  </tr>
                </thead>

                <tbody>
                  {assets.map((asset) => (
                    <tr
                      key={asset.id}
                      className="border-b"
                    >
                      <td className="p-3 font-medium">
                        {asset.inventoryCode}
                      </td>

                      <td className="p-3">
                        {asset.name}
                      </td>

                      <td className="p-3">
                        {asset.category?.name ?? "Non catégorisé"}
                      </td>

                      <td className="p-3">
                        {asset.location ?? "Non renseignée"}
                      </td>

                      <td className="p-3">
                        {asset.service?.name ?? "Non affecté"}
                      </td>

                      <td className="p-3">
                        {asset.status}
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
