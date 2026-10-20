import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizeApi } from "@/lib/permissions";

export async function POST(request: Request) {
  const authorization = await authorizeApi("absences.gerer");
  if (!authorization.ok) return authorization.response;
  const role = authorization.session.role;
  const form = await request.formData();
  const action = String(form.get("action") ?? "create");

  if (action === "decision") {
    if (role !== "DIRECTEUR") return NextResponse.json({ error: "Seul le Directeur peut approuver ou refuser une absence." }, { status: 403 });
    const id = String(form.get("id") ?? "");
    const decision = String(form.get("decision") ?? "");
    const note = String(form.get("note") ?? "").trim();
    if (!id || !["APPROUVEE", "REFUSEE"].includes(decision)) return NextResponse.json({ error: "Décision invalide." }, { status: 400 });
    if (note.length > 500) return NextResponse.json({ error: "La note ne peut pas dépasser 500 caractères." }, { status: 400 });
    const result = await prisma.absenceRequest.updateMany({ where: { id, status: "EN_ATTENTE" }, data: { status: decision, decisionNote: note || null, reviewedById: authorization.session.userId, reviewedAt: new Date() } });
    if (!result.count) return NextResponse.json({ error: "Cette demande a déjà été traitée ou n’existe plus." }, { status: 409 });
    return NextResponse.redirect(new URL("/absences?success=decision", request.url), 303);
  }

  if (role !== "FORMATEUR") return NextResponse.json({ error: "Seul un formateur peut déposer une demande d’absence." }, { status: 403 });
  const startValue = String(form.get("startDate") ?? "");
  const endValue = String(form.get("endDate") ?? "");
  const reason = String(form.get("reason") ?? "").trim();
  const startDate = new Date(startValue + "T00:00:00.000Z");
  const endDate = new Date(endValue + "T23:59:59.999Z");
  if (!startValue || !endValue || Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || startDate > endDate || !reason || reason.length > 2000) return NextResponse.json({ error: "Dates ou motif invalides." }, { status: 400 });
  await prisma.absenceRequest.create({ data: { userId: authorization.session.userId, startDate, endDate, reason } });
  return NextResponse.redirect(new URL("/absences?success=submitted", request.url), 303);
}
