import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizeApi } from "@/lib/permissions";

export async function POST(request: Request) {
  const authorization = await authorizeApi("planning.gerer");
  if (!authorization.ok) return authorization.response;
  if (!["DIRECTEUR", "CHEF_TRAVAUX"].includes(authorization.session.role)) {
    return NextResponse.json({ error: "Seul le Chef des travaux ou le Directeur peut gérer le planning." }, { status: 403 });
  }

  try {
    const form = await request.formData();
    if (String(form.get("action") ?? "") === "delete") {
      const id = String(form.get("id") ?? "");
      if (!id) return NextResponse.json({ error: "Cours introuvable." }, { status: 400 });
      await prisma.timetableEntry.delete({ where: { id } });
      return NextResponse.redirect(new URL("/planning?success=deleted", request.url), 303);
    }
    const weekday = Number(form.get("weekday"));
    const startTime = String(form.get("startTime") ?? "");
    const endTime = String(form.get("endTime") ?? "");
    const room = String(form.get("room") ?? "").trim();
    const className = String(form.get("className") ?? "").trim();
    const subject = String(form.get("subject") ?? "").trim();
    const userId = String(form.get("userId") ?? "").trim();
    if (!Number.isInteger(weekday) || weekday < 1 || weekday > 7 || !/^([01]\d|2[0-3]):[0-5]\d$/.test(startTime) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(endTime) || startTime >= endTime || !room || room.length > 100 || !subject || subject.length > 160 || !userId || userId.length > 100) {
      return NextResponse.json({ error: "Les informations du cours sont invalides." }, { status: 400 });
    }
    const instructor = await prisma.user.findFirst({ where: { id: userId, status: "ACTIVE", role: { name: "FORMATEUR" } }, select: { id: true } });
    if (!instructor) return NextResponse.json({ error: "Sélectionnez un compte formateur actif." }, { status: 400 });
    const sameDay = await prisma.timetableEntry.findMany({ where: { weekday } });
    const conflict = sameDay.find((entry) => startTime < entry.endTime && endTime > entry.startTime && (entry.room.toLocaleLowerCase() === room.toLocaleLowerCase() || entry.userId === userId));
    if (conflict) return NextResponse.json({ error: conflict.room.toLocaleLowerCase() === room.toLocaleLowerCase() ? "Cette salle est déjà occupée sur ce créneau." : "Ce formateur a déjà un cours sur ce créneau." }, { status: 409 });
    await prisma.timetableEntry.create({ data: { weekday, startTime, endTime, room, className: className || null, subject, userId } });
    return NextResponse.redirect(new URL("/planning?success=created", request.url), 303);
  } catch (error) {
    console.error("Erreur de création du planning:", error);
    return NextResponse.json({ error: "Impossible d’enregistrer ce cours." }, { status: 500 });
  }
}
