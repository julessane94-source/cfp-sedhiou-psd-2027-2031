import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizeApi } from "@/lib/permissions";
import { revalidatePath } from "next/cache";

export async function POST(request: Request) {
  const authorization = await authorizeApi("notifications.gerer");
  if (!authorization.ok) return authorization.response;
  try {
    const formData = await request.formData();

    const title = String(formData.get("title") || "");
    const message = String(formData.get("message") || "");

    if (!title || !message) {
      return NextResponse.json(
        { error: "Le titre et le message sont obligatoires." },
        { status: 400 }
      );
    }

    const recipients = await prisma.user.findMany({
      where: { status: "ACTIVE" },
      select: { id: true },
    });
    if (!recipients.length) {
      return NextResponse.json({ error: "Aucun compte actif ne peut recevoir la notification." }, { status: 400 });
    }

    await prisma.notification.createMany({
      data: recipients.map(({ id }) => ({ userId: id, title, message, read: false })),
    });
    revalidatePath("/notifications");

    return NextResponse.redirect(
      new URL("/notifications", request.url)
    );
  } catch {
    return NextResponse.json(
      { error: "Impossible de créer la notification." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const authorization = await authorizeApi("notifications.voir");
  if (!authorization.ok) return authorization.response;
  try {
    const { id, read } = await request.json();

    if (typeof id !== "string" || !id || typeof read !== "boolean") {
      return NextResponse.json({ error: "Notification invalide." }, { status: 400 });
    }

    const result = await prisma.notification.updateMany({
      where: { id, userId: authorization.session.userId },
      data: {
        read,
      },
    });
    if (!result.count) return NextResponse.json({ error: "Notification introuvable." }, { status: 404 });
    revalidatePath("/notifications");

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Impossible de modifier la notification." },
      { status: 500 }
    );
  }
}
