import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const action = String(formData.get("action") || "");

  if (action === "create") {
    await prisma.partner.create({
      data: {
        name: String(formData.get("name") || ""),
        type: String(formData.get("type") || "") || undefined,
        contact: String(formData.get("contact") || "") || undefined,
        phone: String(formData.get("phone") || "") || undefined,
        email: String(formData.get("email") || "") || undefined,
        address: String(formData.get("address") || "") || undefined,
        description:
          String(formData.get("description") || "") || undefined,
      },
    });
  }

  revalidatePath("/partenariats");
  revalidatePath("/dashboard");

  return NextResponse.redirect(
    new URL("/partenariats", request.url)
  );
}
