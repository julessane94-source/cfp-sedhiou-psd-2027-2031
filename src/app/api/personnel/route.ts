import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { authorizeApi } from "@/lib/permissions";
import { normalizeRole } from "@/lib/role-routes";

export async function POST(request: Request) {
  const authorization = await authorizeApi("personnel.gerer");
  if (!authorization.ok) return authorization.response;

  try {
    const formData = await request.formData();

    const action = String(formData.get("action") ?? "");

    if (action === "service") {
      const name = String(formData.get("name") ?? "").trim();
      const description = String(
        formData.get("description") ?? ""
      ).trim();

      if (!name) {
        throw new Error("Le nom du service est obligatoire.");
      }

      await prisma.service.create({
        data: {
          name,
          description: description || null,
        },
      });

      revalidatePath("/personnel");

      return NextResponse.redirect(
        new URL("/personnel", request.url),
        303
      );
    }

    const matricule = String(formData.get("matricule") ?? "").trim();
    const firstName = String(formData.get("firstName") ?? "").trim();
    const lastName = String(formData.get("lastName") ?? "").trim();
    const position = String(formData.get("position") ?? "").trim();
    const contractType = String(formData.get("contractType") ?? "").trim();
    const serviceId = String(formData.get("serviceId") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const roleName = String(formData.get("roleName") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const hireDateValue = String(formData.get("hireDate") ?? "").trim();

    if (!matricule || !firstName || !lastName) {
      throw new Error("Matricule, prénom et nom sont obligatoires.");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
      throw new Error("Une adresse e-mail valide est obligatoire pour le compte utilisateur.");
    }
    if (password.length < 12) {
      throw new Error("Le mot de passe initial doit contenir au moins 12 caractères.");
    }
    if (!roleName || normalizeRole(roleName) === "DIRECTEUR") {
      throw new Error("Choisissez un rôle non-directeur pour ce compte.");
    }
    const role = await prisma.role.findUnique({ where: { name: roleName }, select: { id: true } });
    if (!role) throw new Error("Le rôle choisi n’existe pas. Actualisez la page.");

    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { email, firstName, lastName, passwordHash, roleId: role.id },
        select: { id: true },
      });
      await tx.agent.create({
        data: {
          matricule,
          firstName,
          lastName,
          position: position || null,
          contractType: contractType || null,
          serviceId: serviceId || null,
          phone: phone || null,
          email,
          userId: user.id,
          hireDate: hireDateValue ? new Date(hireDateValue + "T00:00:00.000Z") : null,
        },
      });
    });

    revalidatePath("/personnel");
    revalidatePath("/dashboard");

    return NextResponse.redirect(
      new URL("/personnel", request.url),
      303
    );
  } catch {
    return NextResponse.redirect(
      new URL("/personnel?error=1", request.url),
      303
    );
  }
}
