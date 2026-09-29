import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

const comptes = [
  {
    email: "gestionnaire@cfp-sedhiou.sn",
    firstName: "Gestionnaire",
    lastName: "CFP Sédhiou",
    role: "GESTIONNAIRE",
    password: "Gestionnaire@2026",
  },
  {
    email: "chef.travaux@cfp-sedhiou.sn",
    firstName: "Chef des travaux",
    lastName: "CFP Sédhiou",
    role: "CHEF_TRAVAUX",
    password: "ChefTravaux@2026",
  },
  {
    email: "comptable.matieres@cfp-sedhiou.sn",
    firstName: "Comptable des matières",
    lastName: "CFP Sédhiou",
    role: "COMPTABLE_MATIERES",
    password: "Comptable@2026",
  },
  {
    email: "surveillant@cfp-sedhiou.sn",
    firstName: "Surveillant",
    lastName: "CFP Sédhiou",
    role: "SURVEILLANT",
    password: "Surveillant@2026",
  },
  {
    email: "formateur@cfp-sedhiou.sn",
    firstName: "Formateur",
    lastName: "CFP Sédhiou",
    role: "FORMATEUR",
    password: "Formateur@2026",
  },
];

async function main() {
  for (const compte of comptes) {
    const role = await prisma.role.findUnique({
      where: { name: compte.role },
    });

    if (!role) {
      console.log(`❌ Rôle introuvable : ${compte.role}`);
      continue;
    }

    const existe = await prisma.user.findUnique({
      where: { email: compte.email },
    });

    if (existe) {
      console.log(`⚠️ Déjà existant : ${compte.email}`);
      continue;
    }

    const passwordHash = await bcrypt.hash(compte.password, 10);

    const user = await prisma.user.create({
      data: {
        email: compte.email,
        passwordHash,
        firstName: compte.firstName,
        lastName: compte.lastName,
        roleId: role.id,
        status: "ACTIVE",
      },
    });

    console.log(`✅ Créé : ${user.email} → ${compte.role}`);
  }
}

main()
  .catch((error) => {
    console.error("❌ Erreur :", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
