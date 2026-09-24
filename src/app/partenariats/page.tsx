import { prisma } from "@/lib/prisma";

export default async function PartenariatsPage() {
  const partners = await prisma.partner.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <h1 className="text-3xl font-bold">Gestion des partenariats</h1>
      <p className="mt-2 text-slate-600">
        Gestion des partenaires institutionnels, entreprises et ONG.
      </p>

      <section className="mt-8 rounded-xl bg-white p-5 shadow">
        <h2 className="text-xl font-semibold">Nouveau partenaire</h2>

        <form action="/api/partenariats" method="post"
          className="mt-4 grid gap-3 md:grid-cols-2">

          <input type="hidden" name="action" value="create" />

          <input name="name" required
            placeholder="Nom du partenaire"
            className="rounded border p-2" />

          <input name="type"
            placeholder="Type : institution, entreprise, ONG..."
            className="rounded border p-2" />

          <input name="contact"
            placeholder="Personne contact"
            className="rounded border p-2" />

          <input name="phone"
            placeholder="Téléphone"
            className="rounded border p-2" />

          <input name="email" type="email"
            placeholder="E-mail"
            className="rounded border p-2" />

          <input name="address"
            placeholder="Adresse"
            className="rounded border p-2" />

          <textarea name="description"
            placeholder="Description de la collaboration"
            className="rounded border p-2 md:col-span-2" />

          <button className="rounded bg-slate-800 px-4 py-2 text-white md:col-span-2">
            Enregistrer le partenaire
          </button>
        </form>
      </section>

      <section className="mt-8 rounded-xl bg-white p-5 shadow">
        <h2 className="text-xl font-semibold">Partenaires enregistrés</h2>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="p-3">Partenaire</th>
                <th className="p-3">Type</th>
                <th className="p-3">Contact</th>
                <th className="p-3">Téléphone</th>
                <th className="p-3">Statut</th>
              </tr>
            </thead>

            <tbody>
              {partners.map((partner) => (
                <tr key={partner.id} className="border-b">
                  <td className="p-3 font-medium">{partner.name}</td>
                  <td className="p-3">{partner.type || "-"}</td>
                  <td className="p-3">{partner.contact || "-"}</td>
                  <td className="p-3">{partner.phone || "-"}</td>
                  <td className="p-3">{partner.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
