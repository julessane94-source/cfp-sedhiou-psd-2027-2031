import Link from "next/link";
import { prisma } from "@/lib/prisma";
import CandidatureForm from "./form";
export const dynamic = "force-dynamic";
export default async function CandidaturePage() {
  const formations = await prisma.training.findMany({ where: { active: true }, orderBy: { title: "asc" }, select: { id: true, code: true, title: true, category: true, level: true } });
  return (
    <main className="min-h-screen overflow-hidden bg-slate-50 text-slate-900">
      <section className="relative isolate overflow-hidden bg-slate-950 px-6 py-16 text-white sm:px-10 lg:px-16">
        <div className="absolute -right-24 -top-36 -z-10 h-96 w-96 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 -z-10 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="mx-auto max-w-6xl">
          <Link href="/" className="text-sm font-semibold text-emerald-300 transition hover:text-white">← Retour à l’accueil</Link>
          <div className="mt-12 max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-200">CFP Sédhiou · Admissions</span>
            <h1 className="mt-7 text-4xl font-black tracking-tight sm:text-6xl">Votre avenir commence ici.</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">Candidatez à une formation professionnelle et développez les compétences qui ouvrent de nouvelles perspectives.</p>
            <div className="mt-8 flex flex-wrap gap-3 text-sm text-slate-300"><span className="rounded-xl bg-white/10 px-4 py-3">01 · Choisissez une formation</span><span className="rounded-xl bg-white/10 px-4 py-3">02 · Complétez votre dossier</span><span className="rounded-xl bg-white/10 px-4 py-3">03 · Suivez votre demande</span></div>
          </div>
        </div>
      </section>
      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-12 sm:px-10 lg:grid-cols-[0.75fr_1.25fr] lg:px-16 lg:py-16">
        <aside className="space-y-6"><div className="rounded-3xl bg-emerald-950 p-7 text-white shadow-xl shadow-emerald-950/10"><p className="text-sm font-bold uppercase tracking-widest text-emerald-300">Candidature en ligne</p><h2 className="mt-3 text-2xl font-extrabold">Un dossier simple et rapide</h2><p className="mt-4 leading-7 text-emerald-50/80">Renseignez vos informations avec soin. Un numéro de suivi vous sera communiqué dès l’enregistrement de votre demande.</p></div>
        <div className="rounded-3xl border border-slate-200 bg-white p-7"><h3 className="font-bold">À préparer</h3><ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600"><li>• Une adresse e-mail et un numéro joignable</li><li>• La formation qui correspond à votre projet</li><li>• Quelques mots sur votre motivation</li></ul></div>
        <p className="px-2 text-sm text-slate-500">Déjà inscrit au centre ? <Link className="font-semibold text-emerald-800 hover:underline" href="/connexion">Accéder à votre espace</Link></p></aside>
        <CandidatureForm formations={formations} />
      </section>
    </main>
  );
}
