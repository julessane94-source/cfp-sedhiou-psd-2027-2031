import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

const roles = [
  ["DIRECTEUR", "Direction et supervision globale du CFP"],
  ["GESTIONNAIRE", "Gestion administrative et financière"],
  ["COMPTABLE_MATIERES", "Gestion du patrimoine, des équipements et des matières"],
  ["CHEF_TRAVAUX", "Gestion administrative des formations, apprenants et stages"],
  ["SURVEILLANT", "Suivi administratif et surveillance des apprenants"],
  ["FORMATEUR", "Accès administratif aux données nécessaires aux formateurs"],
];

for (const [name, description] of roles) {
  await prisma.role.upsert({
    where: { name },
    update: { description },
    create: { name, description },
  });
}

console.log("6 rôles CFP Sédhiou créés ou vérifiés.");

await prisma.$disconnect();
