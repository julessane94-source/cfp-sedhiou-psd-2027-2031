import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { SessionPayload } from "@/lib/auth";

function normalizePermissionKey(key: string) {
  return key
    .replace(/\.gerer$/, ".manage")
    .replace(/\.voir$/, ".view");
}

async function roleHasPermission(session: SessionPayload, permissionKey: string) {
  const role = await prisma.role.findUnique({
    where: { id: session.roleId },
    include: { permissions: { include: { permission: true } } },
  });

  if (!role) return false;
  if (role.name === "DIRECTEUR") return true;
  if (role.name === "CAI_INSERTION" && permissionKey === "insertion.gerer") return true;
  if (normalizePermissionKey(permissionKey) === "communication.manage" && role.name !== "CELLULE_COM") return false;

  const expectedKey = normalizePermissionKey(permissionKey);
  return role.permissions.some(({ permission }) => normalizePermissionKey(permission.key) === expectedKey);
}

export async function hasPermission(
  permissionKey: string
): Promise<boolean> {
  const session = await getSession();

  if (!session) return false;
  return roleHasPermission(session, permissionKey);
}

export async function authorizeApi(permissionKey: string) {
  const session = await getSession();
  if (!session) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Authentification requise." }, { status: 401 }),
    };
  }

  // Revalide l'état et le rôle dans la base pour éviter qu'une session
  // conserve ses droits après désactivation ou changement de rôle.
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { status: true, roleId: true },
  });
  if (!user || user.status !== "ACTIVE" || user.roleId !== session.roleId) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Session invalide. Veuillez vous reconnecter." }, { status: 401 }),
    };
  }

  if (!(await roleHasPermission(session, permissionKey))) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Accès refusé." }, { status: 403 }),
    };
  }

  return { ok: true as const, session };
}

export async function requirePermission(
  permissionKey: string
): Promise<boolean> {
  return hasPermission(permissionKey);
}
