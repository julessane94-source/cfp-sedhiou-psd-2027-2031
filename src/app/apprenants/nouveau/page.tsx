import { prisma } from "@/lib/prisma";
import NouvelApprenantForm from "./NouvelApprenantForm";

export default async function NouvelApprenantPage() {
  const formations = await prisma.training.findMany({
    where: {
      active: true,
    },
    orderBy: {
      title: "asc",
    },
    select: {
      id: true,
      code: true,
      title: true,
      level: true,
    },
  });

  return (
    <div className="min-h-screen p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">
          Nouvel apprenant
        </h1>
        <p className="mt-2 text-slate-500">
          Enregistrer un apprenant, son inscription et son premier paiement.
        </p>
      </div>

      <NouvelApprenantForm formations={formations} />
    </div>
  );
}
