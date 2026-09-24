import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const formData = await request.formData();
  const action = String(formData.get("action") ?? "");

  try {
    if (action === "category") {
      const name = String(formData.get("name") ?? "").trim();
      const description = String(formData.get("description") ?? "").trim();

      if (!name) {
        throw new Error("Le nom de la catégorie est obligatoire.");
      }

      await prisma.assetCategory.create({
        data: {
          name,
          description: description || null,
        },
      });
    }

    if (action === "maintenance") {
      const assetId = String(formData.get("assetId") ?? "").trim();
      const dateValue = String(formData.get("date") ?? "").trim();
      const description = String(
        formData.get("description") ?? ""
      ).trim();
      const cost = String(formData.get("cost") ?? "").trim();
      const provider = String(
        formData.get("provider") ?? ""
      ).trim();
      const status = String(
        formData.get("status") ?? ""
      ).trim();

      if (!assetId || !dateValue || !description) {
        throw new Error(
          "Équipement, date et description sont obligatoires."
        );
      }

      await prisma.maintenance.create({
        data: {
          assetId,
          date: new Date(`${dateValue}T00:00:00.000Z`),
          description,
          cost: cost ? Number(cost) : null,
          provider: provider || null,
          status: status || "EN_COURS",
        },
      });

      if (status === "EN_COURS") {
        await prisma.asset.update({
          where: { id: assetId },
          data: { status: "EN_MAINTENANCE" },
        });
      }

      if (status === "TERMINE") {
        await prisma.asset.update({
          where: { id: assetId },
          data: { status: "ACTIF" },
        });
      }
    }

    if (action === "asset") {
      const inventoryCode = String(
        formData.get("inventoryCode") ?? ""
      ).trim();

      const name = String(formData.get("name") ?? "").trim();
      const description = String(
        formData.get("description") ?? ""
      ).trim();

      const acquisitionDateValue = String(
        formData.get("acquisitionDate") ?? ""
      ).trim();

      const acquisitionValue = String(
        formData.get("acquisitionValue") ?? ""
      ).trim();

      const location = String(
        formData.get("location") ?? ""
      ).trim();

      const categoryId = String(
        formData.get("categoryId") ?? ""
      ).trim();

      const serviceId = String(
        formData.get("serviceId") ?? ""
      ).trim();

      if (!inventoryCode || !name) {
        throw new Error(
          "Le code inventaire et la désignation sont obligatoires."
        );
      }

      const acquisitionDate = acquisitionDateValue
        ? new Date(`${acquisitionDateValue}T00:00:00.000Z`)
        : null;

      await prisma.asset.create({
        data: {
          inventoryCode,
          name,
          description: description || null,
          acquisitionDate,
          acquisitionValue: acquisitionValue
            ? Number(acquisitionValue)
            : null,
          location: location || null,
          categoryId: categoryId || null,
          serviceId: serviceId || null,
        },
      });
    }

    revalidatePath("/infrastructures");
    revalidatePath("/dashboard");

    return NextResponse.redirect(
      new URL("/infrastructures", request.url),
      303
    );
  } catch {
    return NextResponse.redirect(
      new URL("/infrastructures?error=1", request.url),
      303
    );
  }
}
