import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  CommunicationStatus,
  CommunicationType,
  type Prisma,
} from "@prisma/client";
import { authorizeApi } from "@/lib/permissions";
import { revalidatePath } from "next/cache";

const TYPES = new Set(Object.values(CommunicationType));
const STATUSES = new Set(Object.values(CommunicationStatus));

async function createPublicationNotifications(title: string, content: string, tx: Prisma.TransactionClient) {
  const recipients = await tx.user.findMany({
    where: { status: "ACTIVE" },
    select: { id: true },
  });
  if (recipients.length) {
    await tx.notification.createMany({
      data: recipients.map(({ id }) => ({
        userId: id,
        title: `Nouvelle information : ${title}`,
        message: content,
        read: false,
      })),
    });
  }
}

export async function POST(request: Request) {
  const authorization = await authorizeApi("communication.gerer");
  if (!authorization.ok) return authorization.response;
  try {
    const formData = await request.formData();

    const title = String(formData.get("title") || "").trim();
    const content = String(formData.get("content") || "").trim();
    const type = String(formData.get("type") || "ANNONCE");
    const status = String(formData.get("status") || "BROUILLON");

    if (!title || !content || title.length > 180 || content.length > 20000 || !TYPES.has(type as CommunicationType) || !STATUSES.has(status as CommunicationStatus)) {
      return NextResponse.json(
        { error: "Vérifiez le titre, le contenu, le type et le statut." },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.communication.create({
        data: {
          title,
          content,
          type: type as CommunicationType,
          status: status as CommunicationStatus,
          publishedAt: status === "PUBLIE" ? new Date() : null,
          authorId: authorization.session.userId,
        },
      });
      if (status === "PUBLIE") await createPublicationNotifications(title, content, tx);
    });
    revalidatePath("/communication");
    revalidatePath("/notifications");

    return NextResponse.redirect(
      new URL("/communication", request.url)
    );
  } catch {
    return NextResponse.json(
      { error: "Impossible d'enregistrer la communication." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const authorization = await authorizeApi("communication.gerer");
  if (!authorization.ok) return authorization.response;
  try {
    const { id, status } = await request.json();
    if (typeof id !== "string" || !id || typeof status !== "string" || !STATUSES.has(status as CommunicationStatus)) {
      return NextResponse.json({ error: "Publication invalide." }, { status: 400 });
    }

    const communication = await prisma.$transaction(async (tx) => {
      const current = await tx.communication.findUnique({ where: { id } });
      if (!current) return null;
      const updated = await tx.communication.updateMany({
        where: { id, status: current.status },
        data: {
          status: status as CommunicationStatus,
          publishedAt: status === "PUBLIE" ? current.publishedAt ?? new Date() : null,
        },
      });
      if (!updated.count) throw new Error("La communication a été modifiée simultanément.");
      if (status === "PUBLIE" && current.status !== "PUBLIE") {
        await createPublicationNotifications(current.title, current.content, tx);
      }
      return tx.communication.findUnique({ where: { id } });
    });

    if (!communication) return NextResponse.json({ error: "Communication introuvable." }, { status: 404 });
    revalidatePath("/communication");
    revalidatePath("/notifications");

    return NextResponse.json(communication);
  } catch {
    return NextResponse.json(
      { error: "Impossible de modifier la communication." },
      { status: 500 }
    );
  }
}
