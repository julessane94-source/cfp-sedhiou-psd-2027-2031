import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

function genererReference(prefix: string) {
  return `${prefix}-${new Date().getFullYear()}-${crypto
    .randomUUID()
    .slice(0, 8)
    .toUpperCase()}`;
}

async function genererMatricule(annee: number) {
  const prefix = `MAT-${annee}-`;

  const derniers = await prisma.learner.findMany({
    where: {
      matricule: {
        startsWith: prefix,
      },
    },
    select: {
      matricule: true,
    },
  });

  let maximum = 0;

  for (const item of derniers) {
    const partie = item.matricule.slice(prefix.length);
    const numero = Number(partie);

    if (Number.isInteger(numero) && numero > maximum) {
      maximum = numero;
    }
  }

  return `${prefix}${String(maximum + 1).padStart(6, "0")}`;
}

function montant(value: FormDataEntryValue | null) {
  const n = Number(String(value ?? "0").replace(",", "."));

  if (!Number.isFinite(n) || n < 0) {
    throw new Error("Montant financier invalide.");
  }

  return n;
}

function calculerStatut(totalPaye: number, netPayable: number) {
  if (totalPaye <= 0) return "IMPAYE";
  if (totalPaye < netPayable) return "PARTIEL";
  return "PAYE";
}

export async function GET(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      { error: "Session expirée." },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.trim() ?? "";

  if (!search) {
    return NextResponse.json({ apprenants: [] });
  }

  const apprenants = await prisma.learner.findMany({
    where: {
      OR: [
        {
          matricule: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          firstName: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          lastName: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          phone: {
            contains: search,
            mode: "insensitive",
          },
        },
      ],
    },
    orderBy: [
      { lastName: "asc" },
      { firstName: "asc" },
    ],
    take: 10,
  });

  return NextResponse.json({ apprenants });
}

export async function POST(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      { error: "Session expirée. Veuillez vous reconnecter." },
      { status: 401 }
    );
  }

  const rolesAutorises = [
    "SURVEILLANT",
    "GESTIONNAIRE",
    "DIRECTEUR",
  ];

  if (!rolesAutorises.includes(session.role)) {
    return NextResponse.json(
      { error: "Vous n'êtes pas autorisé à enregistrer un apprenant." },
      { status: 403 }
    );
  }

  try {
    const formData = await request.formData();

    const learnerId = String(formData.get("learnerId") ?? "").trim();

    const firstName = String(formData.get("firstName") ?? "").trim();
    const lastName = String(formData.get("lastName") ?? "").trim();
    const birthDateValue = String(formData.get("birthDate") ?? "").trim();

    const phone = String(formData.get("phone") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();

    const trainingId = String(formData.get("trainingId") ?? "").trim();
    const academicYear =
      String(formData.get("academicYear") ?? "").trim();

    const level = String(formData.get("level") ?? "").trim();

    const registrationFee = montant(
      formData.get("registrationFee")
    );

    const trainingCost = montant(
      formData.get("trainingCost")
    );

    const discount = montant(
      formData.get("discount")
    );

    const scholarshipCoverage = montant(
      formData.get("scholarshipCoverage")
    );

    const paymentAmount = montant(
      formData.get("paymentAmount")
    );

    const paymentMethod = String(
      formData.get("paymentMethod") ?? ""
    ).trim();

    const paymentReference = String(
      formData.get("paymentReference") ?? ""
    ).trim();

    const note = String(
      formData.get("note") ?? ""
    ).trim();

    if (!trainingId || !academicYear) {
      throw new Error(
        "La formation et l'année académique sont obligatoires."
      );
    }

    if (!learnerId && (!firstName || !lastName || !birthDateValue)) {
      throw new Error(
        "Le prénom, le nom et la date de naissance sont obligatoires pour un nouvel apprenant."
      );
    }

    const birthDate = birthDateValue
      ? new Date(`${birthDateValue}T00:00:00.000Z`)
      : null;

    if (birthDate && Number.isNaN(birthDate.getTime())) {
      throw new Error("Date de naissance invalide.");
    }

    const netPayable = Math.max(
      0,
      registrationFee +
        trainingCost -
        discount -
        scholarshipCoverage
    );

    if (paymentAmount > netPayable) {
      throw new Error(
        "Le montant du paiement ne peut pas dépasser le montant net à payer."
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      let learner;

      if (learnerId) {
        learner = await tx.learner.findUnique({
          where: {
            id: learnerId,
          },
        });

        if (!learner) {
          throw new Error("Apprenant introuvable.");
        }
      } else {
        const anneeMatricule = new Date().getFullYear();

        let matricule = await genererMatricule(anneeMatricule);

        while (
          await tx.learner.findUnique({
            where: { matricule },
            select: { id: true },
          })
        ) {
          const numero = Number(matricule.slice(-6)) + 1;

          matricule = `MAT-${anneeMatricule}-${String(
            numero
          ).padStart(6, "0")}`;
        }

        learner = await tx.learner.create({
          data: {
            matricule,
            firstName,
            lastName,
            birthDate: birthDate!,
            integrationYear: anneeMatricule,
            phone: phone || null,
            email: email || null,
          },
        });
      }

      let enrollment = await tx.enrollment.findFirst({
        where: {
          learnerId: learner.id,
          trainingId,
          academicYear,
        },
      });

      if (!enrollment) {
        enrollment = await tx.enrollment.create({
          data: {
            learnerId: learner.id,
            trainingId,
            academicYear,
            level: level || null,
            startDate: new Date(),
            status: "INSCRIT",
            registrationFee,
            trainingCost,
            discount,
            scholarshipCoverage,
            netPayable,
          },
        });
      } else {
        enrollment = await tx.enrollment.update({
          where: {
            id: enrollment.id,
          },
          data: {
            level: level || enrollment.level,
            registrationFee,
            trainingCost,
            discount,
            scholarshipCoverage,
            netPayable,
          },
        });
      }

      const paiementsExistants = await tx.learnerPayment.findMany({
        where: {
          enrollmentId: enrollment.id,
        },
        select: {
          amount: true,
        },
      });

      const dejaPaye = paiementsExistants.reduce(
        (total, paiement) =>
          total + Number(paiement.amount),
        0
      );

      const totalPaye = dejaPaye + paymentAmount;

      if (totalPaye > netPayable) {
        throw new Error(
          "Le total des paiements dépasserait le montant net à payer."
        );
      }

      const statut = calculerStatut(
        totalPaye,
        netPayable
      );

      let payment = null;
      let receipt = null;

      if (paymentAmount > 0) {
        const reference =
          paymentReference ||
          genererReference("PAY");

        payment = await tx.learnerPayment.create({
          data: {
            paymentReference: reference,
            learnerId: learner.id,
            enrollmentId: enrollment.id,
            registeredById: session.userId,
            amount: paymentAmount,
            method: paymentMethod as
              "ESPECES" |
              "WAVE" |
              "ORANGE_MONEY" |
              "VIREMENT_BANCAIRE" |
              "AUTRE",
            status: statut as
              "PAYE" |
              "PARTIEL" |
              "IMPAYE",
            paidAt: new Date(),
            note: note || null,
          },
        });

        receipt = await tx.learnerReceipt.create({
          data: {
            receiptNumber: genererReference("REC"),
            paymentId: payment.id,
          },
        });
    
    await tx.cashMovement.create({
      data: {
        movementNumber: genererReference("ENC"),
        type: "ENTREE",
        sourceType: "INSCRIPTION",
        category: "INSCRIPTION",
        label: `Paiement inscription - ${learner.firstName} ${learner.lastName}`,
        amount: paymentAmount,
        movementDate: new Date(),
        paymentMethod: paymentMethod as
          | "ESPECES"
          | "WAVE"
          | "ORANGE_MONEY"
          | "VIREMENT_BANCAIRE"
          | "AUTRE",
        reference,
        note: note || null,
        learnerPaymentId: payment.id,
        registeredById: session.userId,
      },
    });

      }

      return {
        learner,
        enrollment,
        payment,
        receipt,
        netPayable,
        totalPaye,
        solde: Math.max(
          0,
          netPayable - totalPaye
        ),
        statut,
      };
    });

    return NextResponse.json(
      {
        success: true,
        message: "Apprenant enregistré avec succès.",
        ...result,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Une erreur est survenue.",
      },
      { status: 400 }
    );
  }
}
