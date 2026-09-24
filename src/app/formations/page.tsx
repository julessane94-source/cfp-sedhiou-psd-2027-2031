"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Formation = {
  id: number;
  title: string;
  category: string;
  level: string;
  duration: string;
  mode: string;
  description: string;
};

const formations: Formation[] = [
  {
    id: 1,
    title: "Formation professionnelle",
    category: "Qualification",
    level: "À préciser",
    duration: "À préciser",
    mode: "Présentiel",
    description:
      "Parcours de qualification professionnelle à intégrer au catalogue officiel du CFP.",
  },
  {
    id: 2,
    title: "Formation technique",
    category: "Technique",
    level: "À préciser",
    duration: "À préciser",
    mode: "Présentiel",
    description:
      "Parcours technique destiné au développement des compétences professionnelles.",
  },
  {
    id: 3,
    title: "Formation en entrepreneuriat",
    category: "Entrepreneuriat",
    level: "À préciser",
    duration: "À préciser",
    mode: "Présentiel / hybride",
    description:
      "Parcours orienté vers l'entrepreneuriat, l'auto-emploi et la création d'activités.",
  },
  {
    id: 4,
    title: "Formation en insertion professionnelle",
    category: "Insertion",
    level: "À préciser",
    duration: "À préciser",
    mode: "Présentiel / hybride",
    description:
      "Accompagnement vers l'emploi, le stage et l'insertion professionnelle.",
  },
  {
    id: 5,
    title: "Formation continue",
    category: "Formation continue",
    level: "Professionnel",
    duration: "À préciser",
    mode: "À préciser",
    description:
      "Formation destinée au renforcement et à l'actualisation des compétences.",
  },
];

const categories = [
  "Toutes",
  ...Array.from(new Set(formations.map((formation) => formation.category))),
];

export default function FormationsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Toutes");

  const filteredFormations = useMemo(() => {
    const query = search.toLowerCase().trim();

    return formations.filter((formation) => {
      const matchesCategory =
        category === "Toutes" || formation.category === category;

      const matchesSearch =
        !query ||
        formation.title.toLowerCase().includes(query) ||
        formation.category.toLowerCase().includes(query) ||
        formation.description.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [search, category]);

  return (
    <main className="min-h-screen bg-slate-50">
      {/* HERO */}
      <section className="bg-slate-900 px-6 py-14 text-white">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/"
            className="mb-6 inline-block text-sm text-slate-300 hover:text-white"
          >
            ← Retour à l'accueil
          </Link>

          <div className="max-w-3xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-300">
              Centre de Formation Professionnelle de Sédhiou
            </p>

            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              Nos formations
            </h1>

            <p className="mt-5 text-lg leading-8 text-slate-300">
              Découvrez le catalogue des parcours de formation et accédez
              directement aux informations utiles pour préparer votre
              candidature.
            </p>
          </div>
        </div>
      </section>

      {/* RECHERCHE */}
      <section className="border-b bg-white px-6 py-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row">
          <div className="flex-1">
            <label
              htmlFor="search"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Rechercher une formation
            </label>

            <input
              id="search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Nom, domaine, mot-clé..."
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-600 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <div className="md:w-72">
            <label
              htmlFor="category"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Domaine
            </label>

            <select
              id="category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-slate-600"
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* CATALOGUE */}
      <section className="px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Catalogue des formations
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                {filteredFormations.length} formation
                {filteredFormations.length > 1 ? "s" : ""} affichée
                {filteredFormations.length > 1 ? "s" : ""}
              </p>
            </div>

            <Link
              href="/candidature"
              className="hidden rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 md:inline-block"
            >
              Déposer une candidature
            </Link>
          </div>

          {filteredFormations.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <h3 className="text-lg font-semibold text-slate-900">
                Aucune formation trouvée
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Modifiez votre recherche ou sélectionnez une autre catégorie.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredFormations.map((formation) => (
                <article
                  key={formation.id}
                  className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      {formation.category}
                    </span>

                    <span className="text-xs font-medium text-slate-400">
                      #{String(formation.id).padStart(2, "0")}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900">
                    {formation.title}
                  </h3>

                  <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">
                    {formation.description}
                  </p>

                  <div className="mt-6 grid grid-cols-2 gap-3 border-t pt-5 text-sm">
                    <div>
                      <p className="text-xs text-slate-400">Niveau</p>
                      <p className="mt-1 font-semibold text-slate-700">
                        {formation.level}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400">Durée</p>
                      <p className="mt-1 font-semibold text-slate-700">
                        {formation.duration}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex gap-3">
                    <button
                      type="button"
                      className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      onClick={() =>
                        alert(
                          `Fiche de formation : ${formation.title}\n\nLes informations détaillées seront connectées au catalogue officiel.`
                        )
                      }
                    >
                      Voir la fiche
                    </button>

                    <Link
                      href="/candidature"
                      className="flex-1 rounded-xl bg-slate-900 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-slate-700"
                    >
                      Candidater
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* APPEL À L'ACTION */}
      <section className="px-6 pb-14">
        <div className="mx-auto max-w-7xl rounded-3xl bg-slate-900 px-6 py-10 text-white md:px-10">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-bold">
                Vous souhaitez rejoindre le CFP ?
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                Préparez votre candidature et transmettez votre dossier
                depuis l'espace dédié.
              </p>
            </div>

            <Link
              href="/candidature"
              className="rounded-xl bg-white px-6 py-3 text-center text-sm font-bold text-slate-900 transition hover:bg-slate-100"
            >
              Commencer ma candidature
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
