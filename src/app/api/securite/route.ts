import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const formData = await request.formData();
  const action = String(formData.get("action") ?? "");

  if (action === "statut") {
    const id = String(formData.get("id") ?? "");
    const status = String(formData.get("status") ?? "");

    if (id && ["OUVERT", "EN_COURS", "CLOTURE"].includes(status)) {
      await prisma.securityIncident.update({
        where: { id },
        data: { status },
      });
    }

    revalidatePath("/securite");
    return NextResponse.redirect(new URL("/securite", request.url));
  }

  if (action !== "incident") {
    return NextResponse.redirect(new URL("/securite", request.url));
  }

  const reference = String(formData.get("reference") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const type = String(formData.get("type") ?? "").trim();
  const severity = String(formData.get("severity") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const actions = String(formData.get("actions") ?? "").trim();
  const date = String(formData.get("date") ?? "");

  const agentId = String(formData.get("agentId") ?? "").trim();
  const serviceId = String(formData.get("serviceId") ?? "").trim();
  const assetId = String(formData.get("assetId") ?? "").trim();

  if (!reference || !location || !type || !severity || !description || !date) {
    return NextResponse.json(
      { error: "Les champs obligatoires sont incomplets." },
      { status: 400 }
    );
  }

  await prisma.securityIncident.create({
    data: {
      reference,
      date: new Date(date),
      location,
      type,
      severity,
      description,
      actions: actions || null,
      status: "OUVERT",
      agentId: agentId || null,
      serviceId: serviceId || null,
      assetId: assetId || null,
    },
  });

  revalidatePath("/securite");
  revalidatePath("/dashboard");

  return NextResponse.redirect(new URL("/securite", request.url));
}
