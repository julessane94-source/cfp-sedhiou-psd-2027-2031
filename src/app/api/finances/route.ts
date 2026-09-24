import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { OperationType } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const action = String(formData.get("action") ?? "");

    if (action === "supplier") {
      const name = String(formData.get("name") ?? "").trim();
      const identifier = String(
        formData.get("identifier") ?? ""
      ).trim();
      const phone = String(formData.get("phone") ?? "").trim();
      const email = String(formData.get("email") ?? "").trim();
      const address = String(
        formData.get("address") ?? ""
      ).trim();

      if (!name) {
        throw new Error("Le nom du fournisseur est obligatoire.");
      }

      await prisma.supplier.create({
        data: {
          name,
          identifier: identifier || null,
          phone: phone || null,
          email: email || null,
          address: address || null,
        },
      });
    }

    if (action === "budget") {
      const year = Number(formData.get("year"));
      const title = String(formData.get("title") ?? "").trim();
      const amount = Number(formData.get("amount"));
      const description = String(
        formData.get("description") ?? ""
      ).trim();

      if (!year || !title || amount < 0) {
        throw new Error("Les informations du budget sont invalides.");
      }

      await prisma.budget.create({
        data: {
          year,
          title,
          amount,
          description: description || null,
        },
      });
    }

    if (action === "operation") {
      const reference = String(
        formData.get("reference") ?? ""
      ).trim();

      const type = String(
        formData.get("type") ?? ""
      ).trim();

      const dateValue = String(
        formData.get("date") ?? ""
      ).trim();

      const description = String(
        formData.get("description") ?? ""
      ).trim();

      const amount = Number(
        formData.get("amount")
      );

      const budgetLineId = String(
        formData.get("budgetLineId") ?? ""
      ).trim();

      const supplierId = String(
        formData.get("supplierId") ?? ""
      ).trim();

      if (
        !reference ||
        !type ||
        !dateValue ||
        !description ||
        amount <= 0
      ) {
        throw new Error(
          "Les informations de l'opération sont invalides."
        );
      }

      if (!["RECETTE", "DEPENSE", "ENGAGEMENT", "PAIEMENT"].includes(type)) {
        throw new Error("Type d'opération invalide.");
      }

      await prisma.financialOperation.create({
        data: {
          reference,
          type: type as OperationType,
          date: new Date(`${dateValue}T00:00:00.000Z`),
          description,
          amount,
          budgetLineId: budgetLineId || null,
          supplierId: supplierId || null,
        },
      });

      if (budgetLineId) {
        const line = await prisma.budgetLine.findUnique({
          where: { id: budgetLineId },
        });

        if (line) {
          const update: {
            committed?: number;
            spent?: number;
          } = {};

          if (type === "ENGAGEMENT") {
            update.committed = Number(line.committed) + amount;
          }

          if (type === "DEPENSE" || type === "PAIEMENT") {
            update.spent = Number(line.spent) + amount;
          }

          if (Object.keys(update).length > 0) {
            await prisma.budgetLine.update({
              where: { id: budgetLineId },
              data: update,
            });
          }
        }
      }
    }

    if (action === "budgetLine") {
      const budgetId = String(formData.get("budgetId") ?? "");
      const code = String(formData.get("code") ?? "").trim();
      const label = String(formData.get("label") ?? "").trim();
      const allocated = Number(formData.get("allocated"));

      if (!budgetId || !code || !label || allocated < 0) {
        throw new Error("Les informations de la ligne sont invalides.");
      }

      await prisma.budgetLine.create({
        data: {
          budgetId,
          code,
          label,
          allocated,
        },
      });
    }

    revalidatePath("/finances");

    return NextResponse.redirect(
      new URL("/finances", request.url),
      303
    );
  } catch {
    return NextResponse.redirect(
      new URL("/finances?error=1", request.url),
      303
    );
  }
}
