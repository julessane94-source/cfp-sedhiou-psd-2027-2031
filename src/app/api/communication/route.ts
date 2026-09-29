import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  CommunicationStatus,
  CommunicationType,
} from "@prisma/client";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const title = String(formData.get("title") || "");
    const content = String(formData.get("content") || "");
    const type = String(formData.get("type") || "ANNONCE");
    const status = String(formData.get("status") || "BROUILLON");

    if (!title || !content) {
      return NextResponse.json(
        { error: "Le titre et le contenu sont obligatoires." },
        { status: 400 }
      );
    }

    const author = await prisma.user.findFirst({
      orderBy: { createdAt: "asc" },
    });

    await prisma.communication.create({
      data: {
        title,
        content,
        type: type as CommunicationType,
        status: status as CommunicationStatus,
        publishedAt:
          status === "PUBLIE"
            ? new Date()
            : null,
        authorId: author?.id ?? null,
      },
    });

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
  try {
    const { id, status } = await request.json();

    const data: {
      status: CommunicationStatus;
      publishedAt?: Date | null;
    } = {
      status: status as CommunicationStatus,
    };

    if (status === "PUBLIE") {
      data.publishedAt = new Date();
    }

    if (status === "ARCHIVE") {
      data.publishedAt = null;
    }

    const communication = await prisma.communication.update({
      where: { id },
      data,
    });

    return NextResponse.json(communication);
  } catch {
    return NextResponse.json(
      { error: "Impossible de modifier la communication." },
      { status: 500 }
    );
  }
}
