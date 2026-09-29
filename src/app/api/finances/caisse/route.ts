import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

const ROLES_AUTORISES = [
  "GESTIONNAIRE",
  "DIRECTEUR",
  "COMPTABLE DES MATIERES",
];

function roleNormalise(role?: string) {
  return (role || "").trim().toUpperCase();
}

function numeroMouvement(prefix: string) {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const t = Date.now().toString().slice(-6);

  return `${prefix}-${y}${m}${d}-${t}`;
}

export async function GET(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Authentification requise." },
        { status: 401 }
      );
    }

    if (!ROLES_AUTORISES.includes(roleNormalise(session.role))) {
      return NextResponse.json(
        { error: "Accès refusé." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);

    const type = searchParams.get("type");
    const sourceType = searchParams.get("sourceType");
    const category = searchParams.get("category");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const where: any = {};

    if (type === "ENTREE" || type === "SORTIE") {
      where.type = type;
    }

    if (
      sourceType === "INSCRIPTION" ||
      sourceType === "FONDS" ||
      sourceType === "DEPENSE" ||
      sourceType === "AUTRE" ||
      sourceType === "AJUSTEMENT"
    ) {
      where.sourceType = sourceType;
    }

    if (category) {
      where.category = {
        contains: category,
        mode: "insensitive",
      };
    }

    if (from || to) {
      where.movementDate = {};

      if (from) {
        where.movementDate.gte = new Date(`${from}T00:00:00`);
      }

      if (to) {
        where.movementDate.lte = new Date(`${to}T23:59:59.999`);
      }
    }

    const movements = await prisma.cashMovement.findMany({
      where,
      include: {
        registeredBy: true,
        learnerPayment: {
          include: {
            learner: true,
            enrollment: {
              include: {
                training: true,
              },
            },
            receipt: true,
          },
        },
      },
      orderBy: {
        movementDate: "desc",
      },
      take: 200,
    });

    const [entrees, sorties] = await Promise.all([
      prisma.cashMovement.aggregate({
        where: {
          ...where,
          type: "ENTREE",
        },
        _sum: {
          amount: true,
        },
      }),
      prisma.cashMovement.aggregate({
        where: {
          ...where,
          type: "SORTIE",
        },
        _sum: {
          amount: true,
        },
      }),
    ]);

    const totalEntrees = Number(entrees._sum.amount || 0);
    const totalSorties = Number(sorties._sum.amount || 0);

    return NextResponse.json({
      movements,
      summary: {
        totalEntrees,
        totalSorties,
        solde: totalEntrees - totalSorties,
      },
    });
  } catch (error) {
    console.error("GET /api/finances/caisse:", error);

    return NextResponse.json(
      { error: "Erreur lors du chargement de la caisse." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Authentification requise." },
        { status: 401 }
      );
    }

    if (!ROLES_AUTORISES.includes(roleNormalise(session.role))) {
      return NextResponse.json(
        { error: "Accès refusé." },
        { status: 403 }
      );
    }

    const body = await request.json();

    const {
      type,
      sourceType,
      category,
      label,
      amount,
      movementDate,
      paymentMethod,
      reference,
      note,
      supportingDocument,
    } = body;

    if (!type || !sourceType || !category || !label || amount === undefined) {
      return NextResponse.json(
        {
          error:
            "type, sourceType, category, label et amount sont obligatoires.",
        },
        { status: 400 }
      );
    }

    if (!["ENTREE", "SORTIE"].includes(type)) {
      return NextResponse.json(
        { error: "Type de mouvement invalide." },
        { status: 400 }
      );
    }

    if (
      !["FONDS", "DEPENSE", "AUTRE", "AJUSTEMENT"].includes(sourceType)
    ) {
      return NextResponse.json(
        { error: "Source de mouvement invalide." },
        { status: 400 }
      );
    }

    const montant = Number(amount);

    if (!Number.isFinite(montant) || montant <= 0) {
      return NextResponse.json(
        { error: "Le montant doit être supérieur à zéro." },
        { status: 400 }
      );
    }

    if (sourceType === "DEPENSE" && type !== "SORTIE") {
      return NextResponse.json(
        { error: "Une dépense doit être une sortie de caisse." },
        { status: 400 }
      );
    }

    if (sourceType === "FONDS" && type !== "ENTREE") {
      return NextResponse.json(
        { error: "Un fonds reçu doit être une entrée de caisse." },
        { status: 400 }
      );
    }

    const movement = await prisma.cashMovement.create({
      data: {
        movementNumber: numeroMouvement(
          type === "ENTREE" ? "ENC" : "SOR"
        ),
        type,
        sourceType,
        category: String(category).trim(),
        label: String(label).trim(),
        amount: montant,
        movementDate: movementDate
          ? new Date(movementDate)
          : new Date(),
        paymentMethod: paymentMethod || null,
        reference: reference?.trim() || null,
        note: note?.trim() || null,
        supportingDocument:
          supportingDocument?.trim() || null,
        registeredById: session.userId,
      },
      include: {
        registeredBy: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        movement,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/finances/caisse:", error);

    return NextResponse.json(
      { error: "Erreur lors de l'enregistrement du mouvement." },
      { status: 500 }
    );
  }
}
