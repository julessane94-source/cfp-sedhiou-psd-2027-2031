import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const action = String(formData.get("action") ?? "");

    if (action === "service") {
      const name = String(formData.get("name") ?? "").trim();
      const description = String(
        formData.get("description") ?? ""
      ).trim();

      if (!name) {
        throw new Error("Le nom du service est obligatoire.");
      }

      await prisma.service.create({
        data: {
          name,
          description: description || null,
        },
      });

      revalidatePath("/personnel");

      return NextResponse.redirect(
        new URL("/personnel", request.url),
        303
      );
    }

    const matricule = String(formData.get("matricule") ?? "").trim();
    const firstName = String(formData.get("firstName") ?? "").trim();
    const lastName = String(formData.get("lastName") ?? "").trim();
    const position = String(formData.get("position") ?? "").trim();
    const contractType = String(formData.get("contractType") ?? "").trim();
    const serviceId = String(formData.get("serviceId") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const hireDateValue = String(formData.get("hireDate") ?? "").trim();

    if (!matricule || !firstName || !lastName) {
      throw new Error("Matricule, prénom et nom sont obligatoires.");
    }

    await prisma.agent.create({
      data: {
        matricule,
        firstName,
        lastName,
        position: position || null,
        contractType: contractType || null,
        serviceId: serviceId || null,
        phone: phone || null,
        email: email || null,
        hireDate: hireDateValue
          ? new Date(`${hireDateValue}T00:00:00.000Z`)
          : null,
      },
    });

    revalidatePath("/personnel");
    revalidatePath("/dashboard");

    return NextResponse.redirect(
      new URL("/personnel", request.url),
      303
    );
  } catch {
    return NextResponse.redirect(
      new URL("/personnel?error=1", request.url),
      303
    );
  }
}
