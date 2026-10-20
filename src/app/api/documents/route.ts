import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { DocumentStatus } from "@prisma/client";
import { authorizeApi } from "@/lib/permissions";

export async function POST(request: Request) {
  const authorization = await authorizeApi("documents.gerer");
  if (!authorization.ok) return authorization.response;
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
      authorId: authorization.session.userId,
    },
  });

  revalidatePath("/documents");
  revalidatePath("/dashboard");

  return NextResponse.redirect(
    new URL("/documents", request.url)
  );
}
