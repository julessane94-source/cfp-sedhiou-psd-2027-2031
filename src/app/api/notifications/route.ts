import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
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

    const user = await prisma.user.findFirst({
      orderBy: { createdAt: "asc" },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Aucun utilisateur disponible." },
        { status: 400 }
      );
    }

    await prisma.notification.create({
      data: {
        userId: user.id,
        title,
        message,
        read: false,
      },
    });

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
  try {
    const { id, read } = await request.json();

    const notification = await prisma.notification.update({
      where: { id },
      data: {
        read: Boolean(read),
      },
    });

    return NextResponse.json(notification);
  } catch {
    return NextResponse.json(
      { error: "Impossible de modifier la notification." },
      { status: 500 }
    );
  }
}
