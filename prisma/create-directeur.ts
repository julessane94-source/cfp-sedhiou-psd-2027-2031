import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

const email = "directeur@cfpsedhiou.sn";
const password = "CfpSedhiou@2026";

const role = await prisma.role.findUnique({
  where: { name: "DIRECTEUR" },
});

if (!role) {
  throw new Error("Le rôle DIRECTEUR n'existe pas.");
}

const passwordHash = await bcrypt.hash(password, 12);

await prisma.user.upsert({
  where: { email },
  update: {
    passwordHash,
    roleId: role.id,
    status: "ACTIVE",
  },
  create: {
    email,
    passwordHash,
    firstName: "Directeur",
    lastName: "CFP Sédhiou",
    roleId: role.id,
    status: "ACTIVE",
  },
});

console.log("Compte Directeur créé ou mis à jour.");
console.log(`Email : ${email}`);
console.log(`Mot de passe : ${password}`);

await prisma.$disconnect();
