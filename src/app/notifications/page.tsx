import { prisma } from "@/lib/prisma";

export default async function NotificationsPage() {
  const notifications = await prisma.notification.findMany({
    orderBy: { createdAt: "desc" },
  });

  const users = await prisma.user.findMany({
    orderBy: { firstName: "asc" },
  });

  return (
    <main className="min-h-screen p-6">
      <h1 className="text-3xl font-bold">Notifications</h1>
      <p className="mt-2 text-slate-500">
        Gestion des notifications du système.
      </p>

      <section className="mt-8 rounded-xl bg-white p-5 shadow">
        <h2 className="text-xl font-semibold">Nouvelle notification</h2>

        <form action="/api/notifications" method="post" className="mt-4 grid gap-3">
          <input type="hidden" name="action" value="create" />

          <select name="userId" required className="rounded border p-2">
            <option value="">Utilisateur destinataire</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.firstName} {user.lastName}
              </option>
            ))}
          </select>

          <input
            name="title"
            required
            placeholder="Titre"
            className="rounded border p-2"
          />

          <textarea
            name="message"
            required
            placeholder="Message"
            className="rounded border p-2"
          />

          <button className="rounded bg-slate-800 px-4 py-2 text-white">
            Envoyer
          </button>
        </form>
      </section>

      <section className="mt-8 rounded-xl bg-white p-5 shadow">
        <h2 className="text-xl font-semibold">
          Notifications ({notifications.length})
        </h2>

        <div className="mt-4 space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="rounded-lg border p-4"
            >
              <div className="flex items-center justify-between">
                <strong>{notification.title}</strong>

                {!notification.read ? (
                  <form action="/api/notifications" method="post">
                    <input type="hidden" name="action" value="read" />
                    <input
                      type="hidden"
                      name="id"
                      value={notification.id}
                    />
                    <button className="rounded bg-slate-800 px-3 py-1 text-sm text-white">
                      Marquer comme lue
                    </button>
                  </form>
                ) : (
                  <span className="text-sm text-slate-500">Lue</span>
                )}
              </div>

              <p className="mt-2">{notification.message}</p>
              <p className="mt-2 text-xs text-slate-500">
                {notification.createdAt.toLocaleString("fr-FR")}
              </p>
            </div>
          ))}

          {notifications.length === 0 && (
            <p className="text-slate-500">
              Aucune notification enregistrée.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
