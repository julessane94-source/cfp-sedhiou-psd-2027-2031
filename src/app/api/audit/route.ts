import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const formData = await request.formData();

  const action = String(formData.get("action") || "");

  if (action === "create") {
    const userId = String(formData.get("userId") || "");
    const auditAction = String(formData.get("auditAction") || "");
    const entity = String(formData.get("entity") || "");
    const entityId = String(formData.get("entityId") || "");
    const ipAddress = String(formData.get("ipAddress") || "");
    const metadataText = String(formData.get("metadata") || "");

    if (!auditAction || !entity) {
      return NextResponse.redirect(
        new URL("/audit", request.url)
      );
    }

    let metadata = undefined;

    if (metadataText) {
      try {
        metadata = JSON.parse(metadataText);
      } catch {
        metadata = { note: metadataText };
      }
    }

    await prisma.auditLog.create({
      data: {
        userId: userId || undefined,
        action: auditAction,
        entity,
        entityId: entityId || undefined,
        ipAddress: ipAddress || undefined,
        metadata,
      },
    });
  }

  revalidatePath("/audit");

  return NextResponse.redirect(new URL("/audit", request.url));
}
