import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { authorizeApi } from "@/lib/permissions";

const PASSWORD_MIN_LENGTH = 12;

export async function GET() {
  const authorization = await authorizeApi("utilisateurs.gerer");
  if (!authorization.ok) return authorization.response;

  // Rend le rôle COM disponible immédiatement, y compris sur une base déjà en production.
  try {
    await prisma.$transaction(async (tx) => {
    const role = await tx.role.upsert({
      where: { name: "CELLULE_COM" },
      update: { description: "Gestion des communications et informations du CFP" },
      create: { name: "CELLULE_COM", description: "Gestion des communications et informations du CFP" },
    });
    for (const [key, name] of [
      ["dashboard.view", "Voir le tableau de bord"],
      ["communication.view", "Voir les communications"],
      ["communication.manage", "Gérer les communications"],
      ["notifications.view", "Voir les notifications"],
    ]) {
      const permission = await tx.permission.upsert({ where: { key }, update: { name }, create: { key, name } });
      await tx.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } },
        update: {},
        create: { roleId: role.id, permissionId: permission.id },
      });
    }
  });

  } catch (error) {
    // La préparation du rôle Communication ne doit pas bloquer la liste des comptes.
    console.error("Initialisation du rôle Communication:", error);
  }

  await prisma.role.upsert({ where: { name: "CAI_INSERTION" }, update: { description: "Cellule CAI - appui insertion" }, create: { name: "CAI_INSERTION", description: "Cellule CAI - appui insertion" } });
  const [users, roles] = await Promise.all([
    prisma.user.findMany({
      orderBy: [{ status: "asc" }, { lastName: "asc" }, { firstName: "asc" }],
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        status: true,
        createdAt: true,
        role: { select: { name: true, description: true } },
      },
    }),
    prisma.role.findMany({
      where: { name: { not: "DIRECTEUR" } },
      orderBy: { name: "asc" },
      select: { name: true, description: true },
    }),
  ]);

  return NextResponse.json({ users, roles });
}

export async function POST(request: Request) {
  const authorization = await authorizeApi("utilisateurs.gerer");
  if (!authorization.ok) return authorization.response;

  try {
    const body = await request.json();
    const firstName = String(body.firstName ?? "").trim();
    const lastName = String(body.lastName ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    const roleName = String(body.roleName ?? "");

    if (!firstName || !lastName || firstName.length > 100 || lastName.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
      return NextResponse.json({ error: "Vérifiez le prénom, le nom et l’adresse e-mail." }, { status: 400 });
    }
    if (password.length < PASSWORD_MIN_LENGTH) {
      return NextResponse.json({ error: `Le mot de passe doit contenir au moins ${PASSWORD_MIN_LENGTH} caractères.` }, { status: 400 });
    }
    if (!roleName || roleName === "DIRECTEUR") {
      return NextResponse.json({ error: "Choisissez un rôle non-directeur valide." }, { status: 400 });
    }

    const role = await prisma.role.findUnique({ where: { name: roleName }, select: { id: true } });
    if (!role) return NextResponse.json({ error: "Rôle introuvable." }, { status: 400 });

    const user = await prisma.user.create({
      data: { firstName, lastName, email, passwordHash: await bcrypt.hash(password, 12), roleId: role.id },
      select: { id: true, email: true, firstName: true, lastName: true, status: true, createdAt: true, role: { select: { name: true, description: true } } },
    });
    revalidatePath("/utilisateurs");
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "Cette adresse e-mail est déjà utilisée." }, { status: 409 });
    }
    console.error("POST /api/utilisateurs:", error);
    return NextResponse.json({ error: "Impossible de créer le compte." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const authorization = await authorizeApi("utilisateurs.gerer");
  if (!authorization.ok) return authorization.response;

  try {
    const body = await request.json();
    const id = String(body.id ?? "");
    if (!id || id === authorization.session.userId) {
      return NextResponse.json({ error: "Vous ne pouvez pas modifier votre propre compte depuis cet écran." }, { status: 400 });
    }

    const current = await prisma.user.findUnique({ where: { id }, select: { id: true, role: { select: { name: true } } } });
    if (!current) return NextResponse.json({ error: "Utilisateur introuvable." }, { status: 404 });
    if (current.role.name === "DIRECTEUR") {
      return NextResponse.json({ error: "Les comptes directeurs ne peuvent pas être modifiés depuis cette page." }, { status: 403 });
    }

    const data: { status?: "ACTIVE" | "INACTIVE"; roleId?: string; passwordHash?: string } = {};
    if (body.status !== undefined) {
      if (body.status !== "ACTIVE" && body.status !== "INACTIVE") {
        return NextResponse.json({ error: "Statut invalide." }, { status: 400 });
      }
      data.status = body.status;
    }
    if (body.roleName !== undefined) {
      const roleName = String(body.roleName);
      if (!roleName || roleName === "DIRECTEUR") return NextResponse.json({ error: "Le rôle directeur ne peut pas être attribué ici." }, { status: 400 });
      const role = await prisma.role.findUnique({ where: { name: roleName }, select: { id: true } });
      if (!role) return NextResponse.json({ error: "Rôle introuvable." }, { status: 400 });
      data.roleId = role.id;
    }
    if (body.password !== undefined) {
      const password = String(body.password);
      if (password.length < PASSWORD_MIN_LENGTH) return NextResponse.json({ error: `Le mot de passe doit contenir au moins ${PASSWORD_MIN_LENGTH} caractères.` }, { status: 400 });
      data.passwordHash = await bcrypt.hash(password, 12);
    }
    if (!Object.keys(data).length) return NextResponse.json({ error: "Aucune modification fournie." }, { status: 400 });

    const user = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, email: true, firstName: true, lastName: true, status: true, createdAt: true, role: { select: { name: true, description: true } } },
    });
    revalidatePath("/utilisateurs");
    return NextResponse.json({ user });
  } catch (error) {
    console.error("PATCH /api/utilisateurs:", error);
    return NextResponse.json({ error: "Impossible de modifier ce compte." }, { status: 500 });
  }
}
