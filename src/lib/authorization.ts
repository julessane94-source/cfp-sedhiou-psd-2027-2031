import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function requirePermission(permissionKey: string) {
  const session = await getSession();

  if (!session) {
    return {
      ok: false as const,
      status: 401,
      error: "Authentification requise.",
    };
  }

  const permission = await prisma.permission.findUnique({
    where: { key: permissionKey },
  });

  if (!permission) {
    return {
      ok: false as const,
      status: 500,
      error: `Permission introuvable : ${permissionKey}`,
    };
  }

  const rolePermission = await prisma.rolePermission.findUnique({
    where: {
      roleId_permissionId: {
        roleId: session.roleId,
        permissionId: permission.id,
      },
    },
  });

  if (!rolePermission) {
    return {
      ok: false as const,
      status: 403,
      error: "Accès interdit.",
    };
  }

  return {
    ok: true as const,
    session,
  };
}
