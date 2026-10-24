import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizeApi } from "@/lib/permissions";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const authorization = await authorizeApi("apprenants.gerer");
  if (!authorization.ok) return authorization.response;
  if (!["DIRECTEUR", "SURVEILLANT"].includes(authorization.session.role)) {
    return NextResponse.json({ error: "Seul le surveillant ou le directeur peut compléter cette fiche." }, { status: 403 });
  }
  try {
    const { id } = await context.params;
    const body = await request.json();
    const firstName = String(body.firstName ?? "").trim();
    const lastName = String(body.lastName ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const email = String(body.email ?? "").trim();
    const birthDateValue = String(body.birthDate ?? "").trim();
    const integrationYearValue = String(body.integrationYear ?? "").trim();
    if (!firstName || !lastName || firstName.length > 100 || lastName.length > 100 || phone.length > 40 || email.length > 254) {
      return NextResponse.json({ error: "Vérifiez le prénom, le nom et les coordonnées." }, { status: 400 });
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "L’adresse e-mail n’est pas valide." }, { status: 400 });
    }
    const birthDate = birthDateValue ? new Date(`${birthDateValue}T00:00:00.000Z`) : null;
    if (birthDate && Number.isNaN(birthDate.getTime())) return NextResponse.json({ error: "La date de naissance n’est pas valide." }, { status: 400 });
    const integrationYear = integrationYearValue ? Number(integrationYearValue) : null;
    if (integrationYear !== null && (!Number.isInteger(integrationYear) || integrationYear < 1950 || integrationYear > new Date().getFullYear() + 1)) {
      return NextResponse.json({ error: "L’année d’intégration n’est pas valide." }, { status: 400 });
    }
    const updated = await prisma.learner.update({
      where: { id },
      data: { firstName, lastName, phone: phone || null, email: email || null, birthDate, integrationYear },
      select: { id: true, firstName: true, lastName: true },
    });
    return NextResponse.json({ learner: updated });
  } catch (error) {
    console.error("Erreur de mise à jour de la fiche apprenant:", error);
    return NextResponse.json({ error: "Impossible de mettre à jour cette fiche." }, { status: 500 });
  }
}
