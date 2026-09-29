import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const name = String(formData.get("name") || "");
    const type = String(formData.get("type") || "");
    const contact = String(formData.get("contact") || "");
    const phone = String(formData.get("phone") || "");
    const email = String(formData.get("email") || "");
    const address = String(formData.get("address") || "");
    const description = String(formData.get("description") || "");

    if (!name) {
      return NextResponse.json(
        { error: "Le nom du partenaire est obligatoire." },
        { status: 400 }
      );
    }

    await prisma.partner.create({
      data: {
        name,
        type: type || null,
        contact: contact || null,
        phone: phone || null,
        email: email || null,
        address: address || null,
        description: description || null,
      },
    });

    return NextResponse.redirect(
      new URL("/partenaires", request.url)
    );
  } catch {
    return NextResponse.json(
      { error: "Impossible d'enregistrer le partenaire." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, status } = await request.json();

    const partner = await prisma.partner.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(partner);
  } catch {
    return NextResponse.json(
      { error: "Impossible de modifier le partenaire." },
      { status: 500 }
    );
  }
}
