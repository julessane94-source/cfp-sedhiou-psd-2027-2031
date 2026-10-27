import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { normalizeRole } from "@/lib/role-routes";
import { prisma } from "@/lib/prisma";

const weekdays = ["", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const hours = Array.from({ length: 24 }, (_, hour) => `${String(hour).padStart(2, "0")}:00`);
export const dynamic = "force-dynamic";

export default async function PlanningPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; weekday?: string; time?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/connexion");
  if (!["DIRECTEUR", "CHEF_TRAVAUX"].includes(normalizeRole(session.role))) redirect("/dashboard");

  const params = await searchParams;
  const requestedDay = Number(params.weekday);
  const selectedDay = Number.isInteger(requestedDay) && requestedDay >= 1 && requestedDay <= 7 ? requestedDay : 1;
  const selectedTime = hours.includes(params.time ?? "") ? params.time! : "08:00";

  const [entries, trainers] = await Promise.all([
    prisma.timetableEntry.findMany({
      include: { instructor: { select: { firstName: true, lastName: true } } },
      orderBy: [{ weekday: "asc" }, { startTime: "asc" }, { room: "asc" }],
    }),
    prisma.user.findMany({
      where: { status: "ACTIVE", role: { name: "FORMATEUR" } },
      select: { id: true, firstName: true, lastName: true },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    }),
  ]);

  const rooms = [...new Set(entries.map((entry) => entry.room.trim()).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, "fr", { numeric: true, sensitivity: "base" }),
  );
  const occupancy = rooms.map((room) => ({
    room,
    courses: entries.filter(
      (entry) =>
        entry.weekday === selectedDay &&
        entry.room.trim().toLocaleLowerCase("fr") === room.toLocaleLowerCase("fr") &&
        entry.startTime <= selectedTime &&
        selectedTime < entry.endTime,
    ),
  }));

  return (
    <main className="mx-auto min-h-screen max-w-7xl space-y-8 p-5 md:p-8">
      <header className="rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-cyan-950 p-8 text-white shadow-xl">
        <p className="text-xs font-bold uppercase tracking-[.22em] text-cyan-200">Organisation des cours</p>
        <h1 className="mt-3 text-3xl font-black md:text-4xl">Emplois du temps</h1>
        <p className="mt-3 max-w-3xl text-slate-300">
          Consultez l’occupation des salles par jour et par heure, puis retrouvez le planning complet de la semaine.
        </p>
      </header>

      {params.success && <p className="rounded-xl bg-emerald-50 p-4 text-emerald-800">Le planning a été mis à jour.</p>}

      <a href="/planning/import" className="inline-flex rounded-xl bg-cyan-800 px-5 py-3 font-bold text-white shadow-sm transition hover:bg-cyan-700">Importer un emploi du temps</a>

      <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.18em] text-indigo-700">Vue en temps réel du planning</p>
          <h2 className="mt-1 text-2xl font-black text-slate-950">Occupation des salles</h2>
          <p className="mt-2 text-sm text-slate-600">
            Choisissez un jour et une heure pour voir les salles occupées et les formateurs présents.
          </p>
        </div>

        <form action="/planning" method="get" className="flex flex-wrap items-end gap-4 rounded-xl bg-slate-50 p-4">
          <label className="min-w-48 flex-1 text-sm font-semibold text-slate-800">
            Jour
            <select name="weekday" defaultValue={String(selectedDay)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-3">
              {weekdays.slice(1).map((day, index) => (
                <option key={day} value={index + 1}>{day}</option>
              ))}
            </select>
          </label>
          <label className="min-w-40 flex-1 text-sm font-semibold text-slate-800">
            Heure
            <select name="time" defaultValue={selectedTime} className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-3">
              {hours.map((hour) => <option key={hour} value={hour}>{hour}</option>)}
            </select>
          </label>
          <button className="rounded-lg bg-indigo-800 px-6 py-3 font-bold text-white transition hover:bg-indigo-700">
            Afficher les salles
          </button>
        </form>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-bold text-slate-900">{weekdays[selectedDay]} à {selectedTime}</h3>
          <p className="text-sm text-slate-500">{occupancy.filter((room) => room.courses.length > 0).length} salle(s) occupée(s)</p>
        </div>

        {rooms.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <p className="font-semibold text-slate-800">Aucune salle n’est encore enregistrée dans le planning.</p>
            <p className="mt-1 text-sm text-slate-600">Ajoutez un premier cours pour faire apparaître les salles ici.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {occupancy.map(({ room, courses }) => (
              <article key={room} className={`rounded-xl border p-5 ${courses.length ? "border-emerald-200 bg-emerald-50/70" : "border-slate-200 bg-slate-50"}`}>
                <div className="flex items-start justify-between gap-3">
                  <h4 className="text-lg font-black text-slate-950">{room}</h4>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${courses.length ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"}`}>
                    {courses.length ? "Occupée" : "Libre"}
                  </span>
                </div>
                {courses.length === 0 ? (
                  <p className="mt-4 text-sm text-slate-600">Aucun cours dans cette salle à cette heure.</p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {courses.map((course) => (
                      <div key={course.id} className="border-t border-emerald-200 pt-3">
                        {course.className && <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">{course.className}</p>}
                        <p className="font-bold text-slate-900">{course.subject}</p>
                        <p className="mt-1 text-sm text-slate-700">
                          {course.instructor.firstName} {course.instructor.lastName}
                        </p>
                        <p className="mt-1 text-xs font-semibold text-slate-500">{course.startTime}–{course.endTime}</p>
                      </div>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-7 lg:grid-cols-[.8fr_1.2fr]">
        <form action="/api/planning" method="post" className="h-fit space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">Ajouter un cours</h2>
          <label className="block text-sm font-semibold">
            Jour
            <select name="weekday" required className="mt-1 w-full rounded-lg border p-3">
              {weekdays.slice(1).map((day, index) => <option key={day} value={index + 1}>{day}</option>)}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm font-semibold">Début<input type="time" name="startTime" required className="mt-1 w-full rounded-lg border p-3" /></label>
            <label className="text-sm font-semibold">Fin<input type="time" name="endTime" required className="mt-1 w-full rounded-lg border p-3" /></label>
          </div>
          <label className="block text-sm font-semibold">Classe / groupe<input name="className" maxLength={100} placeholder="Ex. 1re année Cuisine" className="mt-1 w-full rounded-lg border p-3" /></label>
          <label className="block text-sm font-semibold">Salle<input name="room" required maxLength={100} placeholder="Ex. Salle 2" className="mt-1 w-full rounded-lg border p-3" /></label>
          <label className="block text-sm font-semibold">
            Formateur
            <select name="userId" required defaultValue="" className="mt-1 w-full rounded-lg border p-3">
              <option value="" disabled>Choisir un formateur</option>
              {trainers.map((trainer) => <option key={trainer.id} value={trainer.id}>{trainer.firstName} {trainer.lastName}</option>)}
            </select>
          </label>
          <label className="block text-sm font-semibold">Intitulé du cours<input name="subject" required maxLength={160} className="mt-1 w-full rounded-lg border p-3" /></label>
          <button className="w-full rounded-xl bg-indigo-800 px-5 py-3 font-bold text-white hover:bg-indigo-700">Enregistrer le créneau</button>
        </form>

        <section className="space-y-6">
          <h2 className="text-2xl font-black text-slate-950">Planning de la semaine</h2>
          {weekdays.slice(1).map((day, index) => {
            const dayEntries = entries.filter((entry) => entry.weekday === index + 1);
            return (
              <article key={day} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <h3 className="bg-slate-50 px-5 py-4 text-lg font-bold">
                  {day}<span className="ml-2 text-sm font-normal text-slate-500">{dayEntries.length} cours</span>
                </h3>
                {dayEntries.length === 0 ? (
                  <p className="p-5 text-sm text-slate-500">Aucun cours planifié.</p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {dayEntries.map((entry) => (
                      <div key={entry.id} className="flex flex-wrap items-center gap-4 p-5">
                        <div className="min-w-32 font-mono font-bold text-indigo-800">{entry.startTime}–{entry.endTime}</div>
                        <div className="min-w-40 flex-1">
                          {entry.className && <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">{entry.className}</p>}
                          <p className="font-bold">{entry.subject}</p>
                          <p className="text-sm text-slate-600">{entry.instructor.firstName} {entry.instructor.lastName}</p>
                        </div>
                        <span className="rounded-full bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-900">{entry.room}</span>
                        <form action="/api/planning" method="post">
                          <input type="hidden" name="action" value="delete" />
                          <input type="hidden" name="id" value={entry.id} />
                          <button className="text-sm text-rose-700 hover:underline" aria-label={`Supprimer ${entry.subject}`}>Supprimer</button>
                        </form>
                      </div>
                    ))}
                  </div>
                )}
              </article>
            );
          })}
        </section>
      </section>
    </main>
  );
}
