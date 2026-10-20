import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const weekdays = ["", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
export const dynamic = "force-dynamic";

export default async function PlanningPage({ searchParams }: { searchParams: Promise<{ success?: string }> }) {
  const session = await getSession();
  if (!session) redirect("/connexion");
  if (!["DIRECTEUR", "CHEF_TRAVAUX"].includes(session.role)) redirect("/dashboard");
  const { success } = await searchParams;
  const [entries, trainers] = await Promise.all([
    prisma.timetableEntry.findMany({ include: { instructor: { select: { firstName: true, lastName: true } } }, orderBy: [{ weekday: "asc" }, { startTime: "asc" }, { room: "asc" }] }),
    prisma.user.findMany({ where: { status: "ACTIVE", role: { name: "FORMATEUR" } }, select: { id: true, firstName: true, lastName: true }, orderBy: [{ lastName: "asc" }, { firstName: "asc" }] }),
  ]);
  return <main className="mx-auto min-h-screen max-w-7xl space-y-8 p-5 md:p-8">
    <header className="rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-cyan-950 p-8 text-white shadow-xl"><p className="text-xs font-bold uppercase tracking-[.22em] text-cyan-200">Organisation des cours</p><h1 className="mt-3 text-3xl font-black md:text-4xl">Emplois du temps</h1><p className="mt-3 max-w-3xl text-slate-300">Vue globale des salles, des formateurs et des créneaux, du lundi au dimanche.</p></header>
    {success && <p className="rounded-xl bg-emerald-50 p-4 text-emerald-800">Le planning a été mis à jour.</p>}
    <section className="grid gap-7 lg:grid-cols-[.8fr_1.2fr]">
      <form action="/api/planning" method="post" className="h-fit space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-xl font-bold">Ajouter un cours</h2>
        <label className="block text-sm font-semibold">Jour<select name="weekday" required className="mt-1 w-full rounded-lg border p-3">{weekdays.slice(1).map((day,i)=><option key={day} value={i+1}>{day}</option>)}</select></label>
        <div className="grid grid-cols-2 gap-3"><label className="text-sm font-semibold">Début<input type="time" name="startTime" required className="mt-1 w-full rounded-lg border p-3" /></label><label className="text-sm font-semibold">Fin<input type="time" name="endTime" required className="mt-1 w-full rounded-lg border p-3" /></label></div>
        <label className="block text-sm font-semibold">Salle<input name="room" required maxLength={100} placeholder="Ex. Salle 2" className="mt-1 w-full rounded-lg border p-3" /></label>
        <label className="block text-sm font-semibold">Formateur<select name="userId" required defaultValue="" className="mt-1 w-full rounded-lg border p-3"><option value="" disabled>Choisir un formateur</option>{trainers.map(t=><option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>)}</select></label>
        <label className="block text-sm font-semibold">Intitulé du cours<input name="subject" required maxLength={160} className="mt-1 w-full rounded-lg border p-3" /></label>
        <button className="w-full rounded-xl bg-indigo-800 px-5 py-3 font-bold text-white hover:bg-indigo-700">Enregistrer le créneau</button>
      </form>
      <section className="space-y-6">{weekdays.slice(1).map((day,index)=>{const dayEntries=entries.filter(e=>e.weekday===index+1); return <article key={day} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><h2 className="bg-slate-50 px-5 py-4 text-lg font-bold">{day}<span className="ml-2 text-sm font-normal text-slate-500">{dayEntries.length} cours</span></h2>{dayEntries.length===0?<p className="p-5 text-sm text-slate-500">Aucun cours planifié.</p>:<div className="divide-y divide-slate-100">{dayEntries.map(e=><div key={e.id} className="flex flex-wrap items-center gap-4 p-5"><div className="min-w-32 font-mono font-bold text-indigo-800">{e.startTime}–{e.endTime}</div><div className="min-w-40 flex-1"><p className="font-bold">{e.subject}</p><p className="text-sm text-slate-600">{e.instructor.firstName} {e.instructor.lastName}</p></div><span className="rounded-full bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-900">{e.room}</span><form action="/api/planning" method="post"><input type="hidden" name="action" value="delete"/><input type="hidden" name="id" value={e.id}/><button className="text-sm text-rose-700 hover:underline" aria-label={`Supprimer ${e.subject}`}>Supprimer</button></form></div>)}</div>}</article>})}</section>
    </section>
  </main>;
}
