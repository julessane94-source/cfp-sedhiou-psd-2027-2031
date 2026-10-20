import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { authorizeApi } from "@/lib/permissions";
import { normalizeRole } from "@/lib/role-routes";
import { prisma } from "@/lib/prisma";

const MIN_PASSWORD_LENGTH = 12;

export async function POST(request: Request) {
  const authorization = await authorizeApi("personnel.gerer");
  if (!authorization.ok) return authorization.response;
  if (normalizeRole(authorization.session.role) !== "DIRECTEUR") {
    return NextResponse.json({ error: "Seul le directeur peut créer les comptes du personnel." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const agentId = String(body.agentId ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const roleName = String(body.roleName ?? "").trim();
    const password = String(body.password ?? "");

    if (!agentId || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
      return NextResponse.json({ error: "Un agent et un identifiant e-mail valide sont obligatoires." }, { status: 400 });
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json({ error: "Le mot de passe initial doit contenir au moins 12 caractères." }, { status: 400 });
    }
    if (!roleName || normalizeRole(roleName) === "DIRECTEUR") {
      return NextResponse.json({ error: "Choisissez un rôle non-directeur." }, { status: 400 });
    }

    const [agent, role] = await Promise.all([
      prisma.agent.findUnique({ where: { id: agentId }, select: { id: true, userId: true, firstName: true, lastName: true } }),
      prisma.role.findUnique({ where: { name: roleName }, select: { id: true } }),
    ]);
    if (!agent) return NextResponse.json({ error: "Membre du personnel introuvable." }, { status: 404 });
    if (agent.userId) return NextResponse.json({ error: "Ce membre possède déjà un compte." }, { status: 409 });
    if (!role) return NextResponse.json({ error: "Rôle introuvable. Actualisez la page." }, { status: 400 });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: { email, firstName: agent.firstName, lastName: agent.lastName, passwordHash, roleId: role.id },
        select: { id: true, email: true, firstName: true, lastName: true, role: { select: { name: true } } },
      });
      await tx.agent.update({ where: { id: agent.id }, data: { userId: created.id, email } });
      return created;
    });

    revalidatePath("/personnel");
    revalidatePath("/utilisateurs");
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "Cet identifiant ou ce matricule est déjà utilisé." }, { status: 409 });
    }
    console.error("POST /api/personnel/access:", error);
    return NextResponse.json({ error: "Impossible d’associer le compte à ce membre du personnel." }, { status: 500 });
  }
}
