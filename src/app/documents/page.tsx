import { prisma } from "@/lib/prisma";

export default async function DocumentsPage() {
  const documents = await prisma.document.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold">Gestion des documents</h1>
      <p className="mt-2 text-slate-600">
        Centralisation et suivi des documents administratifs.
      </p>

      <section className="mt-6 rounded-xl bg-white p-5 shadow">
        <h2 className="text-xl font-semibold">Nouveau document</h2>

        <form action="/api/documents" method="post" className="mt-4 grid gap-3">
          <input type="hidden" name="action" value="create" />

          <input
            name="title"
            required
            placeholder="Titre du document"
            className="rounded border p-2"
          />

          <input
            name="fileName"
            required
            placeholder="Nom du fichier"
            className="rounded border p-2"
          />

          <input
            name="storageKey"
            required
            placeholder="Clé de stockage"
            className="rounded border p-2"
          />

          <input
            name="mimeType"
            placeholder="Type MIME : application/pdf"
            className="rounded border p-2"
          />

          <button className="rounded bg-slate-800 px-4 py-2 text-white">
            Enregistrer
          </button>
        </form>
      </section>

      <section className="mt-6 rounded-xl bg-white p-5 shadow">
        <h2 className="text-xl font-semibold">Documents</h2>

        <div className="mt-4 space-y-3">
          {documents.map((document) => (
            <div key={document.id} className="rounded border p-4">
              <strong>{document.title}</strong>
              <p className="text-sm text-slate-600">
                {document.fileName} — {document.status}
              </p>

              <div className="mt-3 flex gap-2">
                {document.status === "BROUILLON" && (
                  <form action="/api/documents" method="post">
                    <input type="hidden" name="action" value="status" />
                    <input type="hidden" name="id" value={document.id} />
                    <input type="hidden" name="status" value="VALIDE" />
                    <button className="rounded bg-green-700 px-3 py-1 text-sm text-white">
                      Valider
                    </button>
                  </form>
                )}

                {document.status === "VALIDE" && (
                  <form action="/api/documents" method="post">
                    <input type="hidden" name="action" value="status" />
                    <input type="hidden" name="id" value={document.id} />
                    <input type="hidden" name="status" value="ARCHIVE" />
                    <button className="rounded bg-slate-600 px-3 py-1 text-sm text-white">
                      Archiver
                    </button>
                  </form>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
