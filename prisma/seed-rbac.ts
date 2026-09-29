import { prisma } from "../src/lib/prisma";

const droits: Record<string, string[]> = {
  DIRECTEUR: [
    "dashboard.voir",
    "apprenants.voir", "apprenants.gerer",
    "formations.voir", "formations.gerer",
    "personnel.voir", "personnel.gerer",
    "finances.voir", "finances.gerer",
    "patrimoine.voir", "patrimoine.gerer",
    "securite.voir", "securite.gerer",
    "stages.voir", "stages.gerer",
    "insertion.voir", "insertion.gerer",
    "entrepreneuriat.voir", "entrepreneuriat.gerer",
    "partenaires.voir", "partenaires.gerer",
    "communication.voir", "communication.gerer",
    "documents.voir", "documents.gerer",
    "notifications.voir", "notifications.gerer",
  ],

  GESTIONNAIRE: [
    "dashboard.voir",
    "apprenants.voir", "apprenants.gerer",
    "formations.voir", "formations.gerer",
    "personnel.voir", "personnel.gerer",
    "finances.voir", "finances.gerer",
    "patrimoine.voir",
    "stages.voir", "stages.gerer",
    "insertion.voir", "insertion.gerer",
    "entrepreneuriat.voir", "entrepreneuriat.gerer",
    "partenaires.voir", "partenaires.gerer",
    "communication.voir", "communication.gerer",
    "documents.voir", "documents.gerer",
    "notifications.voir", "notifications.gerer",
  ],

  COMPTABLE_MATIERES: [
    "dashboard.voir",
    "patrimoine.voir", "patrimoine.gerer",
    "finances.voir",
    "documents.voir",
    "notifications.voir",
  ],

  CHEF_TRAVAUX: [
    "dashboard.voir",
    "apprenants.voir", "apprenants.gerer",
    "formations.voir", "formations.gerer",
    "stages.voir", "stages.gerer",
    "insertion.voir", "insertion.gerer",
    "entrepreneuriat.voir", "entrepreneuriat.gerer",
    "partenaires.voir",
    "documents.voir",
    "notifications.voir",
  ],

  SURVEILLANT: [
    "dashboard.voir",
    "apprenants.voir", "apprenants.gerer",
    "securite.voir", "securite.gerer",
    "stages.voir",
    "documents.voir",
    "notifications.voir",
  ],

  FORMATEUR: [
    "dashboard.voir",
    "apprenants.voir",
    "formations.voir",
    "stages.voir",
    "insertion.voir",
    "documents.voir",
    "notifications.voir",
  ],
};

async function main() {
  const roles = await prisma.role.findMany();

  for (const role of roles) {
    const permissions = droits[role.name];

    if (!permissions) {
      console.log(`Rôle ignoré : ${role.name}`);
      continue;
    }

    for (const key of permissions) {
      const permission = await prisma.permission.findUnique({
        where: { key },
      });

      if (!permission) {
        console.log(`Permission introuvable : ${key}`);
        continue;
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

    console.log(`✓ ${role.name} configuré`);
  }

  console.log("RBAC configuré avec succès.");
  console.log(
    "Attributions :",
    await prisma.rolePermission.count()
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
