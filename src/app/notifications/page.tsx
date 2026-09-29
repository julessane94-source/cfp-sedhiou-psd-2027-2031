import { prisma } from "@/lib/prisma";
import NotificationActions from "@/components/NotificationActions";

export default async function NotificationsPage() {
  const notifications = await prisma.notification.findMany({
    orderBy: { createdAt: "desc" },
  });

  const total = notifications.length;
  const nonLues = notifications.filter((n) => !n.read).length;
  const lues = notifications.filter((n) => n.read).length;

  return (
    <main className="ui-page">
      <section className="dashboard-hero animate-rise">
        <div>
          <span className="dashboard-kicker">CFP SÉDHIOU</span>
          <h1>Notifications</h1>
          <p>
            Centre de suivi des notifications et informations
            importantes de la plateforme.
          </p>
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="dashboard-stat">
          <div className="stat-icon">🔔</div>
          <div>
            <span>Total</span>
            <strong>{total}</strong>
          </div>
        </div>

        <div className="dashboard-stat">
          <div className="stat-icon">🔴</div>
          <div>
            <span>Non lues</span>
            <strong>{nonLues}</strong>
          </div>
        </div>

        <div className="dashboard-stat">
          <div className="stat-icon">✅</div>
          <div>
            <span>Lues</span>
            <strong>{lues}</strong>
          </div>
        </div>
      </section>

      <section className="ui-card">
        <h2>Nouvelle notification</h2>

        <form
          action="/api/notifications"
          method="POST"
          className="ui-form"
        >
          <label>
            Titre
            <input
              name="title"
              required
              placeholder="Titre de la notification"
            />
          </label>

          <label className="full-width">
            Message
            <textarea
              name="message"
              rows={4}
              required
              placeholder="Message à transmettre..."
            />
          </label>

          <button type="submit">
            Envoyer la notification
          </button>
        </form>
      </section>

      <section className="ui-card">
        <h2>Centre de notifications</h2>

        <div className="table-wrap">
          <table className="ui-table">
            <thead>
              <tr>
                <th>Notification</th>
                <th>Date</th>
                <th>État</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {notifications.map((notification) => (
                <tr key={notification.id}>
                  <td>
                    <strong>{notification.title}</strong>
                    <small>{notification.message}</small>
                  </td>

                  <td>
                    {new Date(
                      notification.createdAt
                    ).toLocaleString("fr-FR")}
                  </td>

                  <td>
                    <span
                      className={`badge ${
                        notification.read
                          ? "badge-lu"
                          : "badge-non_lu"
                      }`}
                    >
                      {notification.read ? "Lue" : "Non lue"}
                    </span>
                  </td>

                  <td>
                    <NotificationActions
                      id={notification.id}
                      read={notification.read}
                    />
                  </td>
                </tr>
              ))}

              {notifications.length === 0 && (
                <tr>
                  <td colSpan={4}>
                    Aucune notification.
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
