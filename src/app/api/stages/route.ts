import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { StageStatus, StageType } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const learnerId = String(formData.get("learnerId") || "");
    const structure = String(formData.get("structure") || "");
    const address = String(formData.get("address") || "");
    const tutorName = String(formData.get("tutorName") || "");
    const tutorPhone = String(formData.get("tutorPhone") || "");
    const type = String(formData.get("type") || "PROFESSIONNEL");
    const startDate = String(formData.get("startDate") || "");
    const endDate = String(formData.get("endDate") || "");
    const conventionNumber = String(formData.get("conventionNumber") || "");
    const observations = String(formData.get("observations") || "");

    if (!learnerId || !structure || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Champs obligatoires manquants." },
        { status: 400 }
      );
    }

    await prisma.stage.create({
      data: {
        learnerId,
        structure,
        address: address || null,
        tutorName: tutorName || null,
        tutorPhone: tutorPhone || null,
        type: type as StageType,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        conventionNumber: conventionNumber || null,
        observations: observations || null,
      },
    });

    return NextResponse.redirect(new URL("/stages", request.url));
  } catch {
    return NextResponse.json(
      { error: "Impossible d'enregistrer le stage." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, status, evaluation, observations } = await request.json();

    const data: {
      status?: StageStatus;
      evaluation?: number | null;
      observations?: string | null;
    } = {};

    if (status) data.status = status as StageStatus;
    if (evaluation !== undefined) {
      data.evaluation =
        evaluation === "" || evaluation === null ? null : Number(evaluation);
    }
    if (observations !== undefined) data.observations = observations || null;

    const stage = await prisma.stage.update({
      where: { id },
      data,
    });

    return NextResponse.json(stage);
  } catch {
    return NextResponse.json(
      { error: "Impossible de modifier le stage." },
      { status: 500 }
    );
  }
}
