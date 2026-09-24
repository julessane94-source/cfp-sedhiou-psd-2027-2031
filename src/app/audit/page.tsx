import { prisma } from "@/lib/prisma";

export default async function AuditPage() {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: true,
    },
  });

  const users = await prisma.user.findMany({
    orderBy: { firstName: "asc" },
  });

  return (
    <main className="min-h-screen p-6">
      <h1 className="text-3xl font-bold">Audit & traçabilité</h1>

      <p className="mt-2 text-slate-500">
        Historique des actions effectuées dans le système.
      </p>

      <section className="mt-8 rounded-xl bg-white p-5 shadow">
        <h2 className="text-xl font-semibold">Enregistrer une action</h2>

        <form
          action="/api/audit"
          method="post"
          className="mt-4 grid gap-3"
        >
          <input type="hidden" name="action" value="create" />

          <select name="userId" className="rounded border p-2">
            <option value="">Utilisateur</option>

            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.firstName} {user.lastName}
              </option>
            ))}
          </select>

          <input
            name="auditAction"
            required
            placeholder="Action : création, modification, suppression..."
            className="rounded border p-2"
          />

          <input
            name="entity"
            required
            placeholder="Entité : Agent, Budget, Document..."
            className="rounded border p-2"
          />

          <input
            name="entityId"
            placeholder="Identifiant de l'entité"
            className="rounded border p-2"
          />

          <input
            name="ipAddress"
            placeholder="Adresse IP"
            className="rounded border p-2"
          />

          <textarea
            name="metadata"
            placeholder='Informations complémentaires, ex. {"module":"finances"}'
            className="rounded border p-2"
          />

          <button className="rounded bg-slate-800 px-4 py-2 text-white">
            Enregistrer l'action
          </button>
        </form>
      </section>

      <section className="mt-8 rounded-xl bg-white p-5 shadow">
        <h2 className="text-xl font-semibold">
          Historique ({logs.length})
        </h2>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b">
                <th className="p-3">Date</th>
                <th className="p-3">Utilisateur</th>
                <th className="p-3">Action</th>
                <th className="p-3">Entité</th>
                <th className="p-3">ID</th>
                <th className="p-3">IP</th>
              </tr>
            </thead>

            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b">
                  <td className="p-3">
                    {log.createdAt.toLocaleString("fr-FR")}
                  </td>

                  <td className="p-3">
                    {log.user
                      ? `${log.user.firstName} ${log.user.lastName}`
                      : "Système"}
                  </td>

                  <td className="p-3 font-medium">{log.action}</td>

                  <td className="p-3">{log.entity}</td>

                  <td className="p-3">{log.entityId || "-"}</td>

                  <td className="p-3">{log.ipAddress || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {logs.length === 0 && (
            <p className="mt-4 text-slate-500">
              Aucune action enregistrée.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
