import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import DocumentImport from "@/components/DocumentImport";

export default async function ImportPlanningPage() {
  const session = await getSession();
  if (!session) redirect("/connexion");
  if (!["DIRECTEUR", "CHEF_TRAVAUX"].includes(session.role)) redirect("/dashboard");
  return <main className="mx-auto min-h-screen max-w-5xl space-y-6 p-5 md:p-8">
    <a href="/planning" className="text-sm font-semibold text-indigo-800 hover:underline">← Retour aux emplois du temps</a>
    <header className="rounded-3xl bg-gradient-to-r from-indigo-950 to-cyan-900 p-8 text-white shadow-xl">
      <p className="text-xs font-bold uppercase tracking-widest text-cyan-200">Chef des travaux</p>
      <h1 className="mt-2 text-3xl font-black">Importer un emploi du temps</h1>
      <p className="mt-3 max-w-2xl text-slate-200">La plateforme lit le document et prépare les cours, salles, horaires et formateurs pour vérification avant ajout au planning.</p>
    </header>
    <DocumentImport kind="planning" />
  </main>;
}
