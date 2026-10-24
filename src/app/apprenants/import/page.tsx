import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import DocumentImport from "@/components/DocumentImport";

export default async function ImportApprenantsPage() {
  const session = await getSession();
  if (!session) redirect("/connexion");
  if (!["DIRECTEUR", "SURVEILLANT"].includes(session.role)) redirect("/dashboard");
  return <main className="mx-auto min-h-screen max-w-5xl space-y-6 p-5 md:p-8">
    <a href="/apprenants" className="text-sm font-semibold text-emerald-800 hover:underline">← Retour aux apprenants</a>
    <header className="rounded-3xl bg-gradient-to-r from-emerald-950 to-teal-800 p-8 text-white shadow-xl">
      <p className="text-xs font-bold uppercase tracking-widest text-emerald-200">Surveillance</p>
      <h1 className="mt-2 text-3xl font-black">Importer une liste d’apprenants</h1>
      <p className="mt-3 max-w-2xl text-emerald-50">Les matricules sont attribués automatiquement. Les informations absentes pourront être ajoutées ensuite sur chaque fiche apprenant.</p>
    </header>
    <DocumentImport kind="apprenants" />
  </main>;
}
