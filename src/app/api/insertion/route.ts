import { NextResponse } from "next/server";
import type { InsertionStatus } from "@prisma/client";
import { authorizeApi } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

const STATUSES = new Set([
  "EN_RECHERCHE", "STAGE", "EMPLOI", "AUTO_EMPLOI", "ENTREPRENEUR", "SANS_EMPLOI",
]);

export async function POST(request: Request) {
  const authorization = await authorizeApi("insertion.gerer");
  if (!authorization.ok) return authorization.response;

  try {
    const form = await request.formData();
    const learnerId = String(form.get("learnerId") ?? "").trim();
    const year = Number(form.get("year"));
    const status = String(form.get("status") ?? "");
    const date = (key: string) => {
      const value = String(form.get(key) ?? "").trim();
      return value ? new Date(`${value}T00:00:00.000Z`) : null;
    };
    const text = (key: string) => String(form.get(key) ?? "").trim() || null;
    const salaryValue = String(form.get("salary") ?? "").trim();

    if (!learnerId || !Number.isInteger(year) || year < 2000 || year > 2200 || !STATUSES.has(status)) {
      return NextResponse.json({ error: "Veuillez vérifier l’apprenant, l’année et la situation." }, { status: 400 });
    }

    const learner = await prisma.learner.findUnique({ where: { id: learnerId }, select: { id: true } });
    if (!learner) return NextResponse.json({ error: "Apprenant introuvable." }, { status: 404 });

    await prisma.insertion.create({
      data: {
        learnerId,
        year,
        status: status as InsertionStatus,
        structure: text("structure"),
        position: text("position"),
        contractType: text("contractType"),
        startDate: date("startDate"),
        salary: salaryValue && Number.isFinite(Number(salaryValue)) ? Number(salaryValue) : null,
        notes: text("notes"),
      },
    });

    return NextResponse.redirect(new URL("/insertion", request.url), 303);
  } catch (error) {
    console.error("POST /api/insertion:", error);
    return NextResponse.json({ error: "Impossible d’enregistrer ce suivi." }, { status: 500 });
  }
}
