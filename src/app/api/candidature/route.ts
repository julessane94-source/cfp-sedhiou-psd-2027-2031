import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const firstName = String(body.firstName ?? "").trim();
    const lastName = String(body.lastName ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const phone = String(body.phone ?? "").trim();
    const trainingId = String(body.trainingId ?? "").trim();
    const address = String(body.address ?? "").trim();
    const motivation = String(body.motivation ?? "").trim();
    const birthDateValue = String(body.birthDate ?? "").trim();
    if (!firstName || !lastName || !email || !phone || !trainingId) return NextResponse.json({ error: "Veuillez remplir tous les champs obligatoires." }, { status: 400 });
    if (firstName.length > 100 || lastName.length > 100 || email.length > 254 || phone.length > 30 || address.length > 500 || motivation.length > 3000) return NextResponse.json({ error: "Un champ dépasse la longueur autorisée." }, { status: 400 });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Adresse e-mail invalide." }, { status: 400 });
    const training = await prisma.training.findFirst({ where: { id: trainingId, active: true }, select: { id: true, title: true } });
    if (!training) return NextResponse.json({ error: "Cette formation n’est plus disponible." }, { status: 400 });
    const reference = "CFP-" + new Date().getFullYear() + "-" + crypto.randomUUID().slice(0, 8).toUpperCase();
    const candidature = await prisma.candidature.create({ data: { reference, firstName, lastName, email, phone, address: address || null, motivation: motivation || null, trainingId: training.id, trainingName: training.title, birthDate: birthDateValue ? new Date(birthDateValue + "T12:00:00.000Z") : null }, select: { reference: true, trainingName: true } });
    return NextResponse.json({ candidature }, { status: 201 });
  } catch (error) {
    console.error("Erreur dépôt candidature:", error);
    return NextResponse.json({ error: "Impossible d’enregistrer la candidature. Réessayez plus tard." }, { status: 500 });
  }
}
