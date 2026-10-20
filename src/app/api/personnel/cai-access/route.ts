import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Authentification requise." }, { status: 401 });
  if (session.role !== "DIRECTEUR") return NextResponse.json({ error: "Seul le directeur peut créer les accès." }, { status: 403 });

  try {
    const { agentId } = await request.json();
    if (typeof agentId !== "string" || !agentId) {
      return NextResponse.json({ error: "Agent invalide." }, { status: 400 });
    }

    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      include: { service: true, user: true },
    });
    if (!agent || !agent.service?.name.toLocaleLowerCase().includes("cai")) {
      return NextResponse.json({ error: "Cet agent n’est pas rattaché à la cellule CAI." }, { status: 400 });
    }
    if (agent.user) return NextResponse.json({ error: "Cet agent possède déjà un compte." }, { status: 409 });

    const email = (agent.email || `${agent.matricule.replace(/[^a-zA-Z0-9._-]/g, "").toLowerCase()}@cai.cfpsedhiou.local`).trim().toLowerCase();
    const existingUser = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (existingUser) {
      return NextResponse.json({ error: "L’adresse e-mail est déjà utilisée par un autre compte. Renseignez une adresse unique à l’agent." }, { status: 409 });
    }

    const temporaryPassword = randomBytes(18).toString("base64url");
    const passwordHash = await bcrypt.hash(temporaryPassword, 12);
    const role = await prisma.role.upsert({
      where: { name: "CAI_INSERTION" },
      update: { description: "Équipe de la cellule d’appui à l’insertion" },
      create: { name: "CAI_INSERTION", description: "Équipe de la cellule d’appui à l’insertion" },
    });

    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { email, firstName: agent.firstName, lastName: agent.lastName, passwordHash, roleId: role.id },
      });
      await tx.agent.update({ where: { id: agent.id }, data: { userId: user.id } });
    });

    return NextResponse.json({ login: email, password: temporaryPassword }, { status: 201 });
  } catch (error) {
    console.error("POST /api/personnel/cai-access:", error);
    return NextResponse.json({ error: "Impossible de créer cet accès pour le moment." }, { status: 500 });
  }
}
