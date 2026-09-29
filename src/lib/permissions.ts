import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function hasPermission(
  permissionKey: string
): Promise<boolean> {
  const session = await getSession();

  if (!session) return false;

  if (session.role === "DIRECTEUR") return true;

  const role = await prisma.role.findUnique({
    where: { id: session.roleId },
    include: {
      permissions: {
        include: {
          permission: true,
        },
      },
    },
  });

  if (!role) return false;

  return role.permissions.some(
    ({ permission }) => permission.key === permissionKey
  );
}

export async function requirePermission(
  permissionKey: string
): Promise<boolean> {
  return hasPermission(permissionKey);
}
