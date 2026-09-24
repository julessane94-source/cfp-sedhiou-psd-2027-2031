import Link from "next/link";
import { revalidatePath } from "next/cache";
import { ArrowLeft, GraduationCap, UserPlus } from "lucide-react";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function ajouterFormation(formData: FormData) {
  "use server";

  const code = String(formData.get("code") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const level = String(formData.get("level") ?? "").trim();
  const duration = String(formData.get("duration") ?? "").trim();

  if (!code || !title) return;

  await prisma.training.create({
    data: {
      code,
      title,
      category: category || null,
      level: level || null,
      duration: duration || null,
      active: true,
    },
  });

  revalidatePath("/formations");
  revalidatePath("/formations/admin");
}

async function ajouterApprenant(formData: FormData) {
  "use server";

  const matricule = String(formData.get("matricule") ?? "").trim();
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();

  if (!matricule || !firstName || !lastName) return;

  await prisma.learner.create({
    data: {
      matricule,
      firstName,
      lastName,
      phone: phone || null,
      email: email || null,
    },
  });

  revalidatePath("/formations");
  revalidatePath("/formations/admin");
}

async function inscrireApprenant(formData: FormData) {
  "use server";

  const learnerId = String(formData.get("learnerId") ?? "");
  const trainingId = String(formData.get("trainingId") ?? "");

  if (!learnerId || !trainingId) return;

  await prisma.enrollment.create({
    data: {
      learnerId,
      trainingId,
      startDate: new Date(),
      status: "INSCRIT",
    },
  });

  revalidatePath("/formations");
  revalidatePath("/formations/admin");
}

export default async function FormationsAdminPage() {
  const [formations, apprenants] = await Promise.all([
    prisma.training.findMany({
      where: { active: true },
      orderBy: { title: "asc" },
    }),
    prisma.learner.findMany({
      orderBy: [
        { lastName: "asc" },
        { firstName: "asc" },
      ],
    }),
  ]);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">

        <Link
          href="/formations"
          className="inline-flex items-center gap-2 text-sm font-medium text-sky-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux formations
        </Link>

        <div className="mt-6">
          <p className="text-sm font-semibold text-sky-700">
            Administration
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-950">
            Gestion des formations et apprenants
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Création des formations, enregistrement des apprenants et
            inscriptions.
          </p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">

          {/* FORMATION */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-sky-50 p-3">
                <GraduationCap className="h-5 w-5 text-sky-700" />
              </div>

              <div>
                <h2 className="font-bold text-slate-950">
                  Nouvelle formation
                </h2>
                <p className="text-sm text-slate-500">
                  Ajouter une formation au catalogue.
                </p>
              </div>
            </div>

            <form action={ajouterFormation} className="mt-6 space-y-4">
              <input
                name="code"
                required
                placeholder="Code — ex. INFO-01"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-sky-500"
              />

              <input
                name="title"
                required
                placeholder="Intitulé de la formation"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-sky-500"
              />

              <input
                name="category"
                placeholder="Catégorie"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-sky-500"
              />

              <input
                name="level"
                placeholder="Niveau"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-sky-500"
              />

              <input
                name="duration"
                placeholder="Durée — ex. 12 mois"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-sky-500"
              />

              <button
                type="submit"
                className="w-full rounded-xl bg-sky-700 px-4 py-3 text-sm font-bold text-white hover:bg-sky-800"
              >
                Ajouter la formation
              </button>
            </form>
          </section>

          {/* APPRENANT */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-50 p-3">
                <UserPlus className="h-5 w-5 text-emerald-700" />
              </div>

              <div>
                <h2 className="font-bold text-slate-950">
                  Nouvel apprenant
                </h2>
                <p className="text-sm text-slate-500">
                  Enregistrer un nouvel apprenant.
                </p>
              </div>
            </div>

            <form action={ajouterApprenant} className="mt-6 space-y-4">
              <input
                name="matricule"
                required
                placeholder="Matricule"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
              />

              <input
                name="firstName"
                required
                placeholder="Prénom"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
              />

              <input
                name="lastName"
                required
                placeholder="Nom"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
              />

              <input
                name="phone"
                placeholder="Téléphone"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
              />

              <input
                name="email"
                type="email"
                placeholder="Email"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
              />

              <button
                type="submit"
                className="w-full rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-800"
              >
                Ajouter l'apprenant
              </button>
            </form>
          </section>
        </div>

        {/* INSCRIPTION */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-bold text-slate-950">
            Inscrire un apprenant à une formation
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Sélectionner l'apprenant et la formation.
          </p>

          <form
            action={inscrireApprenant}
            className="mt-6 grid gap-4 md:grid-cols-3"
          >
            <select
              name="learnerId"
              required
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
              defaultValue=""
            >
              <option value="" disabled>
                Choisir un apprenant
              </option>

              {apprenants.map((apprenant) => (
                <option key={apprenant.id} value={apprenant.id}>
                  {apprenant.matricule} — {apprenant.firstName}{" "}
                  {apprenant.lastName}
                </option>
              ))}
            </select>

            <select
              name="trainingId"
              required
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
              defaultValue=""
            >
              <option value="" disabled>
                Choisir une formation
              </option>

              {formations.map((formation) => (
                <option key={formation.id} value={formation.id}>
                  {formation.code} — {formation.title}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white hover:bg-slate-800"
            >
              Enregistrer l'inscription
            </button>
          </form>
        </section>

        <div className="mt-6 flex gap-3">
          <Link
            href="/formations"
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700"
          >
            Voir les formations
          </Link>

          <Link
            href="/dashboard"
            className="rounded-xl bg-sky-700 px-4 py-3 text-sm font-semibold text-white"
          >
            Tableau de bord
          </Link>
        </div>
      </div>
    </main>
  );
}
