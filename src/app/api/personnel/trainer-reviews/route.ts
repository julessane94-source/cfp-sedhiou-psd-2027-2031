import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { authorizeApi } from "@/lib/permissions";
import { normalizeRole } from "@/lib/role-routes";

export async function POST(request: Request) {
  const authorization = await authorizeApi("planning.gerer");
  if (!authorization.ok) return authorization.response;
  if (!["DIRECTEUR", "CHEF_TRAVAUX"].includes(normalizeRole(authorization.session.role))) {
    return NextResponse.json({ error: "Seul le Chef des travaux ou le Directeur peut confirmer ces dossiers." }, { status: 403 });
  }

  const form = await request.formData();
  const reviewId = String(form.get("reviewId") ?? "").trim();
  const requestedAgentId = String(form.get("agentId") ?? "").trim();
  const firstName = String(form.get("firstName") ?? "").trim();
  const lastName = String(form.get("lastName") ?? "").trim();
  if (!reviewId || !firstName || !lastName || firstName.length > 100 || lastName.length > 100) {
    return NextResponse.json({ error: "Le prénom et le nom confirmés sont obligatoires." }, { status: 400 });
  }

  try {
    await prisma.$transaction(async (tx) => {
      const review = await tx.trainerReview.findUnique({ where: { id: reviewId } });
      if (!review) throw new Error("Dossier formateur introuvable.");

      let agentId = requestedAgentId;
      if (agentId) {
        const agent = await tx.agent.findUnique({ where: { id: agentId }, select: { id: true, position: true } });
        if (!agent) throw new Error("Le dossier Personnel sélectionné n’existe plus.");
        const confirmedPosition = (agent.position || "Formateur")
          .replace(/\\s*[·-]\\s*Formateur \\(à confirmer\\)/i, " · Formateur")
          .trim() || "Formateur";
        await tx.agent.update({ where: { id: agent.id }, data: { firstName, lastName, position: confirmedPosition } });
      } else {
        const matricule = `FORM-${review.id.slice(-12).toUpperCase()}`;
        const existing = await tx.agent.findUnique({ where: { matricule }, select: { id: true } });
        if (existing) throw new Error("Un matricule généré pour ce dossier existe déjà. Rechargez la page et réessayez.");
        const agent = await tx.agent.create({ data: { matricule, firstName, lastName, position: "Formateur" }, select: { id: true } });
        agentId = agent.id;
      }

      await tx.trainerReview.update({
        where: { id: review.id },
        data: { agentId, status: "CONFIRME", reviewedById: authorization.session.userId },
      });
    });
    revalidatePath("/personnel");
    revalidatePath("/dashboard");
    return NextResponse.redirect(new URL("/personnel?trainer=confirmed", request.url), 303);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Impossible de confirmer ce dossier.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
