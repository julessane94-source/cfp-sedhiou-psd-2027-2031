import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const action = String(formData.get("action") || "");

  if (action === "create") {
    await prisma.notification.create({
      data: {
        userId: String(formData.get("userId") || ""),
        title: String(formData.get("title") || ""),
        message: String(formData.get("message") || ""),
      },
    });
  }

  revalidatePath("/communication");
  revalidatePath("/notifications");

  return NextResponse.redirect(
    new URL("/communication", request.url)
  );
}
