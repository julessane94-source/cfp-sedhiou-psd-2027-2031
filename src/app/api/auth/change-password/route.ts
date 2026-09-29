import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Session expirée. Veuillez vous reconnecter." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const currentPassword = String(
      body.currentPassword ?? ""
    );

    const newPassword = String(
      body.newPassword ?? ""
    );

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Tous les champs sont obligatoires." },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        {
          error:
            "Le nouveau mot de passe doit contenir au moins 8 caractères.",
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: session.userId,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur introuvable." },
        { status: 404 }
      );
    }

    const validPassword = await bcrypt.compare(
      currentPassword,
      user.passwordHash
    );

    if (!validPassword) {
      return NextResponse.json(
        { error: "Votre mot de passe actuel est incorrect." },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(
      newPassword,
      12
    );

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        passwordHash,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Mot de passe modifié avec succès.",
    });
  } catch (error) {
    console.error(
      "POST /api/auth/change-password:",
      error
    );

    return NextResponse.json(
      { error: "Impossible de modifier le mot de passe." },
      { status: 500 }
    );
  }
}
