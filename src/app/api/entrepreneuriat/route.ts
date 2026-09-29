import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { EntrepreneurshipStatus } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const learnerId = String(formData.get("learnerId") || "");
    const name = String(formData.get("name") || "");
    const sector = String(formData.get("sector") || "");
    const description = String(formData.get("description") || "");
    const structure = String(formData.get("structure") || "");
    const requestedAmount = String(formData.get("requestedAmount") || "");
    const startDate = String(formData.get("startDate") || "");
    const notes = String(formData.get("notes") || "");

    if (!name || !sector) {
      return NextResponse.json(
        { error: "Nom du projet et secteur obligatoires." },
        { status: 400 }
      );
    }

    await prisma.entrepreneurshipProject.create({
      data: {
        learnerId: learnerId || null,
        name,
        sector,
        description: description || null,
        structure: structure || null,
        requestedAmount: requestedAmount ? Number(requestedAmount) : null,
        startDate: startDate ? new Date(startDate) : null,
        notes: notes || null,
      },
    });

    return NextResponse.redirect(
      new URL("/entrepreneuriat", request.url)
    );
  } catch {
    return NextResponse.json(
      { error: "Impossible d'enregistrer le projet." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();

    const data: {
      status?: EntrepreneurshipStatus;
      financedAmount?: number | null;
      notes?: string | null;
    } = {};

    if (body.status) {
      data.status = body.status as EntrepreneurshipStatus;
    }

    if (body.financedAmount !== undefined) {
      data.financedAmount =
        body.financedAmount === "" || body.financedAmount === null
          ? null
          : Number(body.financedAmount);
    }

    if (body.notes !== undefined) {
      data.notes = body.notes || null;
    }

    const project = await prisma.entrepreneurshipProject.update({
      where: { id: body.id },
      data,
    });

    return NextResponse.json(project);
  } catch {
    return NextResponse.json(
      { error: "Impossible de modifier le projet." },
      { status: 500 }
    );
  }
}
