import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL doit être défini dans l’environnement.");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) });

const comptes = [
  { email: "gestionnaire@cfp-sedhiou.sn", firstName: "Gestionnaire", role: "GESTIONNAIRE", passwordEnv: "GESTIONNAIRE_PASSWORD" },
  { email: "chef.travaux@cfp-sedhiou.sn", firstName: "Chef des travaux", role: "CHEF_TRAVAUX", passwordEnv: "CHEF_TRAVAUX_PASSWORD" },
  { email: "comptable.matieres@cfp-sedhiou.sn", firstName: "Comptable des matières", role: "COMPTABLE_MATIERES", passwordEnv: "COMPTABLE_MATIERES_PASSWORD" },
  { email: "surveillant@cfp-sedhiou.sn", firstName: "Surveillant", role: "SURVEILLANT", passwordEnv: "SURVEILLANT_PASSWORD" },
  { email: "formateur@cfp-sedhiou.sn", firstName: "Formateur", role: "FORMATEUR", passwordEnv: "FORMATEUR_PASSWORD" },
];

async function main() {
  for (const compte of comptes) {
    const password = process.env[compte.passwordEnv];
    if (!password || password.length < 12) {
      throw new Error(`${compte.passwordEnv} est obligatoire et doit contenir au moins 12 caractères.`);
    }

    const role = await prisma.role.findUnique({ where: { name: compte.role } });
    if (!role) {
      console.log(`Rôle introuvable : ${compte.role}`);
      continue;
    }

    const existing = await prisma.user.findUnique({ where: { email: compte.email } });
    if (existing) {
      console.log(`Compte déjà présent : ${compte.email}`);
      continue;
    }

    await prisma.user.create({
      data: {
        email: compte.email,
        firstName: compte.firstName,
        lastName: "CFP Sédhiou",
        roleId: role.id,
        status: "ACTIVE",
        passwordHash: await bcrypt.hash(password, 12),
      },
    });
    console.log(`Compte créé : ${compte.email} (${compte.role})`);
  }
}

main()
  .catch((error) => {
    console.error("Erreur lors de la création des comptes.", error instanceof Error ? error.message : "Erreur inconnue.");
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
