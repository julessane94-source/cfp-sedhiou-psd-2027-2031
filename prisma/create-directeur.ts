import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const databaseUrl = process.env.DATABASE_URL;
const email = process.env.DIRECTEUR_EMAIL;
const password = process.env.DIRECTEUR_PASSWORD;
if (!databaseUrl || !email || !password || password.length < 12) {
  throw new Error("DATABASE_URL, DIRECTEUR_EMAIL et un DIRECTEUR_PASSWORD d’au moins 12 caractères sont requis.");
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) });

try {
  const role = await prisma.role.findUnique({ where: { name: "DIRECTEUR" } });
  if (!role) throw new Error("Le rôle DIRECTEUR n’existe pas.");

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.upsert({
    where: { email },
    update: { passwordHash, roleId: role.id, status: "ACTIVE" },
    create: {
      email,
      passwordHash,
      firstName: "Directeur",
      lastName: "CFP Sédhiou",
      roleId: role.id,
      status: "ACTIVE",
    },
  });
  console.log(`Compte directeur créé ou mis à jour : ${email}`);
} finally {
  await prisma.$disconnect();
}
