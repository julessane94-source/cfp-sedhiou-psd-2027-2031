import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

const permissions = [
  ["dashboard.view", "Voir le tableau de bord"],
  ["apprenants.view", "Voir les apprenants"],
  ["apprenants.manage", "Gérer les apprenants"],
  ["formations.view", "Voir les formations"],
  ["formations.manage", "Gérer les formations"],
  ["candidatures.view", "Voir les candidatures"],
  ["candidatures.manage", "Gérer les candidatures"],
  ["personnel.view", "Voir le personnel"],
  ["personnel.manage", "Gérer le personnel"],
  ["finances.view", "Voir les finances"],
  ["finances.manage", "Gérer les finances"],
  ["patrimoine.view", "Voir le patrimoine"],
  ["patrimoine.manage", "Gérer le patrimoine"],
  ["securite.view", "Voir les incidents de sécurité"],
  ["securite.manage", "Gérer les incidents de sécurité"],
  ["stages.view", "Voir les stages"],
  ["stages.manage", "Gérer les stages"],
  ["insertion.view", "Voir l'insertion professionnelle"],
  ["insertion.manage", "Gérer l'insertion professionnelle"],
  ["entrepreneuriat.view", "Voir l'entrepreneuriat"],
  ["entrepreneuriat.manage", "Gérer l'entrepreneuriat"],
  ["partenaires.view", "Voir les partenaires"],
  ["partenaires.manage", "Gérer les partenaires"],
  ["communication.view", "Voir les communications"],
  ["communication.manage", "Gérer les communications"],
  ["documents.view", "Voir les documents"],
  ["documents.manage", "Gérer les documents"],
  ["notifications.view", "Voir les notifications"],
  ["notifications.manage", "Gérer les notifications"],
];

const rolePermissions: Record<string, string[]> = {
  DIRECTEUR: permissions.map(([key]) => key),

  GESTIONNAIRE: [
    "dashboard.view",
    "apprenants.view",
    "apprenants.manage",
    "formations.view",
    "formations.manage",
    "candidatures.view",
    "candidatures.manage",
    "personnel.view",
    "personnel.manage",
    "finances.view",
    "finances.manage",
    "patrimoine.view",
    "stages.view",
    "stages.manage",
    "insertion.view",
    "insertion.manage",
    "entrepreneuriat.view",
    "entrepreneuriat.manage",
    "partenaires.view",
    "partenaires.manage",
    "communication.view",
    "communication.manage",
    "documents.view",
    "documents.manage",
    "notifications.view",
    "notifications.manage",
  ],

  COMPTABLE_MATIERES: [
    "dashboard.view",
    "patrimoine.view",
    "patrimoine.manage",
    "documents.view",
    "documents.manage",
    "notifications.view",
  ],

  CHEF_TRAVAUX: [
    "dashboard.view",
    "apprenants.view",
    "apprenants.manage",
    "formations.view",
    "formations.manage",
    "candidatures.view",
    "candidatures.manage",
    "stages.view",
    "stages.manage",
    "insertion.view",
    "insertion.manage",
    "entrepreneuriat.view",
    "entrepreneuriat.manage",
    "partenaires.view",
    "communication.view",
    "documents.view",
    "notifications.view",
  ],

  SURVEILLANT: [
    "dashboard.view",
    "apprenants.view",
    "stages.view",
    "documents.view",
    "notifications.view",
  ],

  FORMATEUR: [
    "dashboard.view",
    "apprenants.view",
    "formations.view",
    "stages.view",
    "documents.view",
    "notifications.view",
  ],
};

for (const [key, name] of permissions) {
  await prisma.permission.upsert({
    where: { key },
    update: { name },
    create: { key, name },
  });
}

for (const [roleName, permissionKeys] of Object.entries(rolePermissions)) {
  const role = await prisma.role.findUnique({
    where: { name: roleName },
  });

  if (!role) {
    throw new Error(`Rôle introuvable : ${roleName}`);
  }

  for (const key of permissionKeys) {
    const permission = await prisma.permission.findUnique({
      where: { key },
    });

    if (!permission) {
      throw new Error(`Permission introuvable : ${key}`);
    }

    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: role.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: role.id,
        permissionId: permission.id,
      },
    });
  }
}

console.log("Permissions et droits des 6 rôles configurés.");

await prisma.$disconnect();
