import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import {
  CashMovementType,
  CashSourceType,
} from "@prisma/client";

const ROLES_AUTORISES = ["GESTIONNAIRE", "DIRECTEUR"];

function genererReference(prefix = "CAI") {
  const maintenant = new Date();

  const date = maintenant
    .toISOString()
    .replace(/\D/g, "")
    .slice(0, 14);

  const aleatoire = Math.random()
    .toString(36)
    .slice(2, 7)
    .toUpperCase();

  return `${prefix}-${date}-${aleatoire}`;
}

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Session non authentifiée." },
        { status: 401 }
      );
    }

    const role = session.role.trim().toUpperCase();

    if (!ROLES_AUTORISES.includes(role)) {
      return NextResponse.json(
        { error: "Vous n'êtes pas autorisé à gérer la caisse." },
        { status: 403 }
      );
    }

    const body = await request.json();

    const typeValue = String(body.type || "").trim().toUpperCase();
    const sourceTypeValue = String(body.sourceType || "").trim().toUpperCase();

    const category = String(body.category || "").trim().toUpperCase();
    const label = String(body.label || "").trim();
    const reference = String(body.reference || "").trim();
    const note = String(body.note || "").trim();

    const amount = Number(body.amount);

    if (typeValue !== "ENTREE" && typeValue !== "SORTIE") {
      return NextResponse.json(
        { error: "Type de mouvement invalide." },
        { status: 400 }
      );
    }

    if (sourceTypeValue !== "FONDS" && sourceTypeValue !== "DEPENSE") {
      return NextResponse.json(
        { error: "Source du mouvement invalide." },
        { status: 400 }
      );
    }

    if (!category) {
      return NextResponse.json(
        { error: "La catégorie est obligatoire." },
        { status: 400 }
      );
    }

    if (!label) {
      return NextResponse.json(
        { error: "Le libellé est obligatoire." },
        { status: 400 }
      );
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Le montant doit être supérieur à zéro." },
        { status: 400 }
      );
    }

    if (sourceTypeValue === "FONDS" && typeValue !== "ENTREE") {
      return NextResponse.json(
        { error: "Un fonds reçu doit être une entrée." },
        { status: 400 }
      );
    }

    if (sourceTypeValue === "DEPENSE" && typeValue !== "SORTIE") {
      return NextResponse.json(
        { error: "Une dépense doit être une sortie." },
        { status: 400 }
      );
    }

    const type: CashMovementType =
      typeValue === "ENTREE"
        ? CashMovementType.ENTREE
        : CashMovementType.SORTIE;

    const sourceType: CashSourceType =
      sourceTypeValue === "FONDS"
        ? CashSourceType.FONDS
        : CashSourceType.DEPENSE;

    const mouvement = await prisma.cashMovement.create({
      data: {
        movementNumber: genererReference(),
        type,
        sourceType,
        category,
        label,
        amount,
        movementDate: new Date(),
        reference: reference || null,
        note: note || null,
        registeredById: session.userId,
      },
    });

    return NextResponse.json(
      {
        success: true,
        movement: mouvement,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur création mouvement caisse :", error);

    return NextResponse.json(
      { error: "Impossible d'enregistrer le mouvement de caisse." },
      { status: 500 }
    );
  }
}
