import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { DocumentStatus } from "@prisma/client";

export async function POST(request: Request) {
  const formData = await request.formData();
  const action = String(formData.get("action") ?? "");

  if (action === "status") {
    const id = String(formData.get("id") ?? "");
    const status = String(formData.get("status") ?? "");

    if (id && ["BROUILLON", "VALIDE", "ARCHIVE"].includes(status)) {
      await prisma.document.update({
        where: { id },
        data: { status: status as DocumentStatus },
      });
    }

    revalidatePath("/documents");
    return NextResponse.redirect(new URL("/documents", request.url));
  }

  if (action !== "create") {
    return NextResponse.redirect(new URL("/documents", request.url));
  }

  const title = String(formData.get("title") ?? "").trim();
  const fileName = String(formData.get("fileName") ?? "").trim();
  const storageKey = String(formData.get("storageKey") ?? "").trim();
  const mimeType = String(formData.get("mimeType") ?? "").trim();

  const author = await prisma.user.findFirst({
    orderBy: { createdAt: "asc" },
  });

  if (!author) {
    return NextResponse.json(
      { error: "Aucun utilisateur auteur n'est disponible." },
      { status: 400 }
    );
  }

  if (!title || !fileName || !storageKey) {
    return NextResponse.json(
      { error: "Les champs obligatoires sont incomplets." },
      { status: 400 }
    );
  }

  await prisma.document.create({
    data: {
      title,
      fileName,
      storageKey,
      mimeType: mimeType || null,
      status: DocumentStatus.BROUILLON,
      authorId: author.id,
    },
  });

  revalidatePath("/documents");
  revalidatePath("/dashboard");

  return NextResponse.redirect(
    new URL("/documents", request.url)
  );
}
