import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizeApi } from "@/lib/permissions";
import { extractRows, extractTrainerNames, type ImportRow } from "@/lib/document-import";
import { normalizeRole } from "@/lib/role-routes";
import { revalidatePath } from "next/cache";

export const runtime = "nodejs";
const days: Record<string, number> = { lundi: 1, lun: 1, monday: 1, mardi: 2, mar: 2, tuesday: 2, mercredi: 3, mer: 3, wednesday: 3, jeudi: 4, jeu: 4, thursday: 4, vendredi: 5, ven: 5, friday: 5, samedi: 6, sam: 6, saturday: 6, dimanche: 7, dim: 7, sunday: 7 };
const clean = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
const time = (value: string) => {
  const normalized = value.trim().replace(/[hH]/, ":").replace(/\s/g, "");
  const match = normalized.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return "";
  const h = Number(match[1]), m = Number(match[2]);
  return h <= 23 && m <= 59 ? `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}` : "";
};
function validateRows(input: unknown): ImportRow[] {
  if (!Array.isArray(input) || input.length === 0 || input.length > 500) throw new Error("L’import doit contenir entre 1 et 500 lignes.");
  return input.map((row) => {
    if (!row || typeof row !== "object") throw new Error("Une ligne du document est invalide.");
    return Object.fromEntries(Object.entries(row).map(([key, value]) => [key, String(value ?? "").trim().slice(0, 200)]));
  });
}
function parseWeekday(value: string) { return days[clean(value)] ?? Number(value); }
function parseDate(value: string): Date | null {
  if (!value) return null;
  const d = new Date(value);
  if (!Number.isNaN(d.getTime())) return d;
  const m = value.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
  if (m) { const parsed = new Date(Date.UTC(Number(m[3]), Number(m[2]) - 1, Number(m[1]))); return Number.isNaN(parsed.getTime()) ? null : parsed; }
  return null;
}
async function authorize(kind: string) {
  const permission = kind === "planning" ? "planning.gerer" : "apprenants.gerer";
  const auth = await authorizeApi(permission);
  if (!auth.ok) return { error: auth.response } as const;
  const role = normalizeRole(auth.session.role);
  const allowed = kind === "planning" ? ["DIRECTEUR", "CHEF_TRAVAUX"] : ["DIRECTEUR", "SURVEILLANT"];
  if (!allowed.includes(role)) return { error: NextResponse.json({ error: "Accès refusé." }, { status: 403 }) } as const;
  return { session: auth.session } as const;
}
export async function POST(request: Request, context: { params: Promise<{ kind: string }> }) {
  const { kind } = await context.params;
  if (kind !== "planning" && kind !== "apprenants") return NextResponse.json({ error: "Type d’import inconnu." }, { status: 404 });
  const auth = await authorize(kind);
  if ("error" in auth) return auth.error;
  try {
    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const file = form.get("file");
      if (!(file instanceof File)) return NextResponse.json({ error: "Sélectionnez un fichier." }, { status: 400 });
      let rows: ImportRow[] = [];
      let detectedTrainers: string[] = [];
      try {
        rows = await extractRows(file, kind);
      } catch (error) {
        if (kind !== "planning" || !file.name.toLowerCase().endsWith(".pdf")) throw error;
        detectedTrainers = await extractTrainerNames(file);
        if (!detectedTrainers.length) throw error;
      }
      if (kind === "planning" && file.name.toLowerCase().endsWith(".pdf") && rows.length) {
        detectedTrainers = await extractTrainerNames(file);
      }
      if (!rows.length && !detectedTrainers.length) return NextResponse.json({ error: "Aucune ligne exploitable n’a été trouvée." }, { status: 400 });

      const trainerMatches = detectedTrainers.length
        ? await prisma.user.findMany({
            where: { status: "ACTIVE", role: { name: "FORMATEUR" } },
            select: { firstName: true, lastName: true },
          })
        : [];
      const trainers = detectedTrainers.map((name) => {
        const surname = clean(name.replace(/^(?:Mme|M)\.?\s*/i, ""));
        return {
          name,
          matches: trainerMatches
            .filter((trainer) => clean(trainer.lastName) === surname)
            .map((trainer) => `${trainer.firstName} ${trainer.lastName}`),
          personnelMatches: [] as string[],
        };
      });
      if (kind === "planning" && detectedTrainers.length) {
        const surnameLabels = detectedTrainers.map((name) => name.replace(/^(?:Mme|M)\.?\s*/i, ""));
        const surnames = surnameLabels.map(clean);
        const existingAgents = await prisma.agent.findMany({
          where: { OR: surnameLabels.map((lastName) => ({ lastName: { equals: lastName, mode: "insensitive" as const } })) },
          select: { id: true, firstName: true, lastName: true, position: true },
        });
        trainers.forEach((trainer) => {
          const surname = clean(trainer.name.replace(/^(?:Mme|M)\.?\s*/i, ""));
          trainer.personnelMatches = existingAgents
            .filter((agent) => clean(agent.lastName) === surname)
            .map((agent) => `${agent.firstName} ${agent.lastName}`);
        });

        const previous = await prisma.trainerReview.findMany({
          where: { normalizedName: { in: surnames } },
          select: { normalizedName: true },
        });
        await prisma.$transaction(async (tx) => {
          for (let index = 0; index < detectedTrainers.length; index++) {
            const sourceName = detectedTrainers[index];
            const surname = surnames[index];
            const surnameLabel = surnameLabels[index];
            if (!surname) continue;

            const review = await tx.trainerReview.upsert({
              where: { normalizedName: surname },
              create: { sourceName, normalizedName: surname, sourceFileName: file.name, createdById: auth.session.userId },
              update: { sourceName, sourceFileName: file.name },
            });
            const matches = existingAgents.filter((agent) => clean(agent.lastName) === surname);
            if (matches.length) {
              // Mark each possible personnel match as a trainer awaiting the Chef's
              // identity confirmation; ambiguous surnames remain unlinked.
              for (const match of matches) {
                const position = match.position?.trim() ?? "";
                if (!position.toLocaleLowerCase("fr").includes("formateur")) {
                  await tx.agent.update({
                    where: { id: match.id },
                    data: { position: position ? `${position} · Formateur (à confirmer)` : "Formateur (à confirmer)" },
                  });
                }
              }
            } else if (!review.agentId) {
              // Create a visible provisional personnel record even when the PDF
              // only supplies a surname. The Chef can replace the placeholder.
              const agent = await tx.agent.create({
                data: {
                  matricule: `FORM-${review.id.slice(-12).toUpperCase()}`,
                  firstName: "À confirmer",
                  lastName: surnameLabel,
                  position: "Formateur (à confirmer)",
                },
                select: { id: true },
              });
              await tx.trainerReview.update({ where: { id: review.id }, data: { agentId: agent.id } });
            }
          }
        });

        const newNames = [...new Set(surnames.filter((name) => name && !previous.some((item) => item.normalizedName === name)))];
        const reviewers = await prisma.user.findMany({
          where: { status: "ACTIVE", role: { name: "CHEF_TRAVAUX" } },
          select: { id: true },
        });
        if (reviewers.length) {
          const names = detectedTrainers.join(", ");
          await prisma.notification.createMany({
            data: reviewers.map(({ id }) => ({
              userId: id,
              title: newNames.length ? "Formateurs ajoutés au personnel — à confirmer" : "Mise à jour des formateurs à confirmer",
              message: `${file.name}: les formateurs détectés ont été ajoutés ou associés à des dossiers Personnel. Vérifiez les identités et complétez les informations dans la rubrique Personnel : ${names}.`,
            })),
          });
        }
        revalidatePath("/personnel");
        revalidatePath("/notifications");
      }
      return NextResponse.json({ rows, trainers });
    }
    const body = await request.json();
    const rows = validateRows(body.rows);
    if (kind === "planning") {
      const trainers = await prisma.user.findMany({ where: { status: "ACTIVE", role: { name: "FORMATEUR" } }, select: { id: true, firstName: true, lastName: true, email: true } });
      const entries = await prisma.timetableEntry.findMany();
      const prepared = rows.map((row, i) => {
        const weekday = parseWeekday(row.weekday ?? "");
        const startTime = time(row.startTime ?? ""), endTime = time(row.endTime ?? "");
        const room = row.room?.trim() ?? "", className = row.className?.trim() ?? "", subject = row.subject?.trim() || className;
        const teacher = clean(row.trainer ?? "");
        const abbreviatedSurname = clean(teacher.replace(/^(?:mme?|monsieur|madame)\.?\s*/, ""));
        const matches = trainers.filter((t) =>
          clean(`${t.firstName} ${t.lastName}`) === teacher ||
          clean(t.email) === teacher ||
          (abbreviatedSurname.length >= 3 && clean(t.lastName) === abbreviatedSurname)
        );
        const errors: string[] = [];
        if (!Number.isInteger(weekday) || weekday < 1 || weekday > 7) errors.push("jour invalide");
        if (!startTime || !endTime || startTime >= endTime) errors.push("horaires invalides");
        if (!room || !subject) errors.push("salle ou cours manquant");
        if (matches.length !== 1) errors.push(matches.length ? "formateur ambigu" : "formateur introuvable");
        return { rowNumber: i + 2, weekday, startTime, endTime, room, className, subject, userId: matches[0]?.id ?? "", trainerName: matches[0] ? `${matches[0].firstName} ${matches[0].lastName}` : row.trainer, errors };
      });
      prepared.forEach((r, index) => {
        if (r.errors.length) return;
        const overlaps = (p: { weekday: number; startTime: string; endTime: string; room: string; userId: string }) =>
          p.weekday === r.weekday && r.startTime < p.endTime && r.endTime > p.startTime &&
          (clean(p.room) === clean(r.room) || p.userId === r.userId);
        const duplicate = entries.some(overlaps) || prepared.slice(0, index).some((p) => !p.errors.length && overlaps(p));
        if (duplicate) r.errors.push("conflit de salle ou de formateur");
      });
      const invalid = prepared.filter((r) => r.errors.length);
      if (body.action !== "import") return NextResponse.json({ rows: prepared, invalid: invalid.length, valid: prepared.length - invalid.length });
      if (invalid.length) return NextResponse.json({ error: "Corrigez les lignes signalées avant l’import.", rows: prepared }, { status: 422 });
      await prisma.$transaction(async (tx) => {
        for (const row of prepared) await tx.timetableEntry.create({ data: { weekday: row.weekday, startTime: row.startTime, endTime: row.endTime, room: row.room, className: row.className || null, subject: row.subject, userId: row.userId } });
      });
      return NextResponse.json({ imported: prepared.length });
    }

    const invalidNames = rows.filter((row) => !row.firstName?.trim() || !row.lastName?.trim());
    if (invalidNames.length) return NextResponse.json({ error: "Chaque ligne doit contenir un prénom et un nom.", invalid: invalidNames.length }, { status: 422 });
    const normalizedRows = rows.map((row, index) => ({ rowNumber: index + 2, firstName: row.firstName.trim(), lastName: row.lastName.trim(), phone: row.phone?.trim() ?? "", email: row.email?.trim() ?? "", birthDate: row.birthDate?.trim() ?? "" }));
    const invalidDates = normalizedRows.filter((r) => r.birthDate && !parseDate(r.birthDate));
    if (body.action !== "import") return NextResponse.json({ rows: normalizedRows.map((r) => ({ ...r, errors: r.birthDate && !parseDate(r.birthDate) ? ["date de naissance invalide"] : [] })), invalid: invalidDates.length, valid: normalizedRows.length - invalidDates.length });
    if (invalidDates.length) return NextResponse.json({ error: "Corrigez les dates de naissance invalides avant l’import." }, { status: 422 });

    const year = new Date().getFullYear();
    const prefix = `MAT-${year}-`;
    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.learner.findMany({ where: { matricule: { startsWith: prefix } }, select: { matricule: true } });
      let next = existing.reduce((max, item) => Math.max(max, Number(item.matricule.slice(prefix.length)) || 0), 0) + 1;
      let imported = 0, skipped = 0;
      for (const row of normalizedRows) {
        const duplicate = await tx.learner.findFirst({ where: row.email ? { email: { equals: row.email, mode: "insensitive" } } : { firstName: { equals: row.firstName, mode: "insensitive" }, lastName: { equals: row.lastName, mode: "insensitive" }, birthDate: parseDate(row.birthDate) ?? undefined } });
        if (duplicate) { skipped++; continue; }
        let matricule = `${prefix}${String(next++).padStart(6, "0")}`;
        while (await tx.learner.findUnique({ where: { matricule }, select: { id: true } })) matricule = `${prefix}${String(next++).padStart(6, "0")}`;
        await tx.learner.create({ data: { matricule, firstName: row.firstName, lastName: row.lastName, phone: row.phone || null, email: row.email || null, birthDate: parseDate(row.birthDate), integrationYear: year } });
        imported++;
      }
      return { imported, skipped };
    }, { isolationLevel: "Serializable" });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Import impossible.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
