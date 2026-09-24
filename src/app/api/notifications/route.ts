import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const action = String(formData.get("action") || "");

  if (action === "create") {
    const userId = String(formData.get("userId") || "");
    const title = String(formData.get("title") || "");
    const message = String(formData.get("message") || "");

    if (!userId || !title || !message) {
      return NextResponse.redirect(new URL("/notifications", request.url));
    }

    await prisma.notification.create({
      data: {
        userId,
        title,
        message,
      },
    });
  }

  if (action === "read") {
    const id = String(formData.get("id") || "");

    if (id) {
      await prisma.notification.update({
        where: { id },
        data: { read: true },
      });
    }
  }

  revalidatePath("/notifications");
  revalidatePath("/dashboard");

  return NextResponse.redirect(new URL("/notifications", request.url));
}
