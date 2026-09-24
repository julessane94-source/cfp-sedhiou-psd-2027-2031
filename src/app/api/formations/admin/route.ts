import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

function genererMatricule(
  integrationYear: number,
  birthDate: Date
) {
  const annee = String(integrationYear).slice(-2);
  const jour = String(birthDate.getUTCDate()).padStart(2, "0");
  const mois = String(birthDate.getUTCMonth() + 1).padStart(2, "0");
  const anneeNaissance = String(birthDate.getUTCFullYear());

  return `p${annee}${jour}${mois}${anneeNaissance}`;
}

function anneeSuivante(academicYear: string) {
  const match = academicYear.match(/^(\d{4})-(\d{4})$/);

  if (!match) {
    throw new Error(
      "L'année académique doit être au format 2026-2027."
    );
  }

  const debut = Number(match[1]) + 1;
  const fin = Number(match[2]) + 1;

  return `${debut}-${fin}`;
}

function niveauSuivant(level: string | null) {
  if (level === "1ère année") return "2ème année";
  if (level === "2ème année") return "3ème année";

  return null;
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const action = String(formData.get("action") ?? "");

  try {
    // =========================================================
    // FORMATION
    // =========================================================
    if (action === "formation") {
      const code = String(formData.get("code") ?? "").trim();
      const title = String(formData.get("title") ?? "").trim();
      const category = String(formData.get("category") ?? "").trim();
      const level = String(formData.get("level") ?? "").trim();
      const duration = String(formData.get("duration") ?? "").trim();

      if (!code || !title) {
        throw new Error(
          "Le code et le nom de la formation sont obligatoires."
        );
      }

      await prisma.training.create({
        data: {
          code,
          title,
          category: category || null,
          level: level || null,
          duration: duration || null,
          active: true,
        },
      });
    }

    // =========================================================
    // APPRENANT
    // =========================================================
    if (action === "apprenant") {
      const firstName = String(
        formData.get("firstName") ?? ""
      ).trim();

      const lastName = String(
        formData.get("lastName") ?? ""
      ).trim();

      const birthDateValue = String(
        formData.get("birthDate") ?? ""
      ).trim();

      const integrationYearValue = String(
        formData.get("integrationYear") ?? ""
      ).trim();

      const phone = String(
        formData.get("phone") ?? ""
      ).trim();

      const email = String(
        formData.get("email") ?? ""
      ).trim();

      if (
        !firstName ||
        !lastName ||
        !birthDateValue ||
        !integrationYearValue
      ) {
        throw new Error(
          "Le prénom, le nom, la date de naissance et l'année d'intégration sont obligatoires."
        );
      }

      const birthDate = new Date(
        `${birthDateValue}T00:00:00.000Z`
      );

      const integrationYear = Number(
        integrationYearValue
      );

      if (
        Number.isNaN(birthDate.getTime()) ||
        !Number.isInteger(integrationYear) ||
        integrationYear < 1900 ||
        integrationYear > 2100
      ) {
        throw new Error(
          "Les informations de naissance ou d'intégration sont invalides."
        );
      }

      const baseMatricule = genererMatricule(
        integrationYear,
        birthDate
      );

      let matricule = baseMatricule;
      let compteur = 2;

      while (
        await prisma.learner.findUnique({
          where: { matricule },
          select: { id: true },
        })
      ) {
        matricule = `${baseMatricule}-${compteur}`;
        compteur++;
      }

      await prisma.learner.create({
        data: {
          matricule,
          firstName,
          lastName,
          birthDate,
          integrationYear,
          phone: phone || null,
          email: email || null,
        },
      });
    }

    // =========================================================
    // PREMIÈRE INSCRIPTION
    // =========================================================
    if (action === "inscription") {
      const learnerId = String(
        formData.get("learnerId") ?? ""
      );

      const trainingId = String(
        formData.get("trainingId") ?? ""
      );

      const academicYear = String(
        formData.get("academicYear") ?? ""
      ).trim();

      const level = String(
        formData.get("level") ?? ""
      ).trim();

      if (!learnerId || !trainingId) {
        throw new Error(
          "L'apprenant et la formation sont obligatoires."
        );
      }

      await prisma.enrollment.create({
        data: {
          learnerId,
          trainingId,
          academicYear:
            academicYear || "NON_RENSEIGNEE",
          level: level || null,
          startDate: new Date(),
          status: "INSCRIT",
        },
      });
    }

    // =========================================================
    // MODIFIER LES INFORMATIONS DE L'APPRENANT
    // =========================================================
    if (action === "modifierApprenant") {
      const learnerId = String(formData.get("learnerId") ?? "");
      const firstName = String(formData.get("firstName") ?? "").trim();
      const lastName = String(formData.get("lastName") ?? "").trim();
      const birthDateValue = String(formData.get("birthDate") ?? "").trim();
      const phone = String(formData.get("phone") ?? "").trim();
      const email = String(formData.get("email") ?? "").trim();

      if (!learnerId || !firstName || !lastName || !birthDateValue) {
        throw new Error("Le prénom, le nom et la date de naissance sont obligatoires.");
      }

      const birthDate = new Date(`${birthDateValue}T00:00:00.000Z`);

      if (Number.isNaN(birthDate.getTime())) {
        throw new Error("Date de naissance invalide.");
      }

      await prisma.learner.update({
        where: { id: learnerId },
        data: {
          firstName,
          lastName,
          birthDate,
          phone: phone || null,
          email: email || null,
        },
      });
    }

    // =========================================================
    // MODIFIER LE PARCOURS
    // =========================================================
    if (action === "modifierParcours") {
      const enrollmentId = String(
        formData.get("enrollmentId") ?? ""
      );

      const trainingId = String(
        formData.get("trainingId") ?? ""
      );

      const academicYear = String(
        formData.get("academicYear") ?? ""
      ).trim();

      const level = String(
        formData.get("level") ?? ""
      ).trim();

      const status = String(
        formData.get("status") ?? ""
      ).trim();

      if (!enrollmentId || !trainingId) {
        throw new Error(
          "L'inscription et la formation sont obligatoires."
        );
      }

      await prisma.enrollment.update({
        where: {
          id: enrollmentId,
        },
        data: {
          trainingId,
          academicYear:
            academicYear || "NON_RENSEIGNEE",
          level: level || null,
          status: status || "INSCRIT",
        },
      });
    }

    // =========================================================
    // PASSAGE À L'ANNÉE SUPÉRIEURE
    // =========================================================
    if (action === "passer") {
      const enrollmentId = String(
        formData.get("enrollmentId") ?? ""
      );

      const current = await prisma.enrollment.findUnique({
        where: {
          id: enrollmentId,
        },
        include: {
          learner: true,
        },
      });

      if (!current) {
        throw new Error(
          "Inscription introuvable."
        );
      }

      const nextLevel = niveauSuivant(current.level);

      if (!nextLevel) {
        await prisma.enrollment.update({
          where: {
            id: current.id,
          },
          data: {
            status: "TERMINE",
            endDate: new Date(),
          },
        });
      } else {
        const nextAcademicYear =
          anneeSuivante(current.academicYear);

        await prisma.enrollment.update({
          where: {
            id: current.id,
          },
          data: {
            status: "TERMINE",
            endDate: new Date(),
          },
        });

        await prisma.enrollment.create({
          data: {
            learnerId: current.learnerId,
            trainingId: current.trainingId,
            academicYear: nextAcademicYear,
            level: nextLevel,
            startDate: new Date(),
            status: "INSCRIT",
          },
        });
      }
    }

    // =========================================================
    // REDOUBLEMENT
    // =========================================================
    if (action === "redoubler") {
      const enrollmentId = String(
        formData.get("enrollmentId") ?? ""
      );

      const current = await prisma.enrollment.findUnique({
        where: {
          id: enrollmentId,
        },
      });

      if (!current) {
        throw new Error(
          "Inscription introuvable."
        );
      }

      if (!current.level) {
        throw new Error(
          "Le niveau actuel doit être renseigné avant un redoublement."
        );
      }

      const historique =
        await prisma.enrollment.findMany({
          where: {
            learnerId: current.learnerId,
          },
          orderBy: {
            startDate: "desc",
          },
        });

      let anneesMemeNiveau = 0;

      for (const inscription of historique) {
        if (
          inscription.level === current.level
        ) {
          anneesMemeNiveau++;
        } else {
          break;
        }
      }

      if (anneesMemeNiveau >= 2) {
        throw new Error(
          `Redoublement impossible : ${current.learnerId} a déjà passé 2 années consécutives au niveau ${current.level}. L'apprenant doit être suspendu, changer de niveau ou changer de filière.`
        );
      }

      const nextAcademicYear =
        anneeSuivante(current.academicYear);

      await prisma.enrollment.update({
        where: {
          id: current.id,
        },
        data: {
          status: "REDOUBLE",
          endDate: new Date(),
        },
      });

      await prisma.enrollment.create({
        data: {
          learnerId: current.learnerId,
          trainingId: current.trainingId,
          academicYear: nextAcademicYear,
          level: current.level,
          startDate: new Date(),
          status: "INSCRIT",
        },
      });
    }

    // =========================================================
    // SUSPENSION
    // =========================================================
    if (action === "suspendre") {
      const enrollmentId = String(
        formData.get("enrollmentId") ?? ""
      );

      if (!enrollmentId) {
        throw new Error(
          "Inscription introuvable."
        );
      }

      await prisma.enrollment.update({
        where: {
          id: enrollmentId,
        },
        data: {
          status: "SUSPENDU",
          endDate: new Date(),
        },
      });
    }

    // =========================================================
    // NOUVELLE ANNÉE PERSONNALISÉE
    // =========================================================
    if (action === "nouvelleAnnee") {
      const learnerId = String(
        formData.get("learnerId") ?? ""
      );

      const trainingId = String(
        formData.get("trainingId") ?? ""
      );

      const academicYear = String(
        formData.get("academicYear") ?? ""
      ).trim();

      const level = String(
        formData.get("level") ?? ""
      ).trim();

      if (
        !learnerId ||
        !trainingId ||
        !academicYear
      ) {
        throw new Error(
          "L'apprenant, la formation et l'année académique sont obligatoires."
        );
      }

      const ancienneInscription =
        await prisma.enrollment.findFirst({
          where: {
            learnerId,
          },
          orderBy: {
            startDate: "desc",
          },
        });

      await prisma.enrollment.create({
        data: {
          learnerId,
          trainingId,
          academicYear,
          level: level || null,
          startDate: new Date(),
          status: "INSCRIT",
        },
      });

      if (ancienneInscription) {
        await prisma.enrollment.update({
          where: {
            id: ancienneInscription.id,
          },
          data: {
            endDate: new Date(),
            status: "TERMINE",
          },
        });
      }
    }

    revalidatePath("/formations");
    revalidatePath("/formations/admin");
    revalidatePath("/dashboard");

    return NextResponse.redirect(
      new URL(
        "/formations/admin",
        request.url
      ),
      303
    );
  } catch (error) {
    console.error(
      "Erreur administration formations :",
      error
    );

    return NextResponse.redirect(
      new URL(
        "/formations/admin?error=1",
        request.url
      ),
      303
    );
  }
}
