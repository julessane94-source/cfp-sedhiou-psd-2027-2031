import { prisma } from "@/lib/prisma";

export default async function CommunicationPage() {
  const messages = await prisma.notification.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <h1 className="text-3xl font-bold">Communication</h1>
      <p className="mt-2 text-slate-600">
        Communication interne et diffusion des informations administratives.
      </p>

      <section className="mt-8 rounded-xl bg-white p-5 shadow">
        <h2 className="text-xl font-semibold">Nouvelle communication</h2>

        <form action="/api/communication" method="post"
          className="mt-4 grid gap-3">
          <input type="hidden" name="action" value="create" />

          <input
            name="userId"
            required
            placeholder="ID du destinataire"
            className="rounded border p-2"
          />

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
        <h2 className="text-xl font-semibold">Communications</h2>

        <div className="mt-4 space-y-3">
          {messages.map((message) => (
            <div key={message.id} className="rounded border p-4">
              <h3 className="font-semibold">{message.title}</h3>
              <p className="mt-1 text-slate-600">{message.message}</p>
              <p className="mt-2 text-sm text-slate-400">
                Destinataire : {message.userId}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
