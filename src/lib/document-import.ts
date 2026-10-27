import ExcelJS from "exceljs";
import mammoth from "mammoth";

export type ImportRow = Record<string, string>;

const aliases: Record<string, string[]> = {
  weekday: ["jour", "jour de cours", "weekday", "day"],
  startTime: ["debut", "heure debut", "heure de debut", "debut cours", "start", "start time"],
  endTime: ["fin", "heure fin", "heure de fin", "fin cours", "end", "end time"],
  room: ["salle", "salle de cours", "room", "local"],
  trainer: ["formateur", "formateur trice", "enseignant", "professeur", "prof", "trainer", "instructor"],
  className: ["classe", "classe de cours", "groupe", "section", "class", "class name"],
  subject: ["cours", "matiere", "module", "intitule", "formation", "subject"],
  firstName: ["prenom", "prenoms", "first name", "given name"],
  lastName: ["nom", "nom de famille", "last name", "surname"],
  phone: ["telephone", "tel", "phone", "contact"],
  email: ["email", "courriel", "adresse electronique"],
  birthDate: ["date de naissance", "naissance", "birth date"],
};
const normalize = (value: unknown) => String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

function mapHeaders(headers: unknown[]) {
  return headers.map((header) => {
    const key = normalize(header);
    return Object.entries(aliases).find(([, names]) => names.some((name) => normalize(name) === key))?.[0] ?? "";
  });
}

function rowsFromMatrix(matrix: unknown[][], kind: "planning" | "apprenants"): ImportRow[] {
  const matrixClean = matrix.filter((row) => row.some((cell) => String(cell ?? "").trim()));
  if (matrixClean.length < 2) return [];
  const required = kind === "planning" ? ["weekday", "startTime", "endTime", "room", "trainer"] : ["firstName", "lastName"];
  const headerIndex = matrixClean.slice(0, 10).findIndex((row) => {
    const candidate = mapHeaders(row);
    return required.every((key) => candidate.includes(key)) &&
      (kind !== "planning" || candidate.includes("subject") || candidate.includes("className"));
  });
  if (headerIndex < 0) {
    throw new Error(kind === "planning"
      ? "Colonnes attendues : Jour, Début, Fin, Salle, Formateur et Cours/Classe."
      : "Colonnes attendues : Prénom et Nom.");
  }
  const keys = mapHeaders(matrixClean[headerIndex]);
  return matrixClean.slice(headerIndex + 1).map((row) => Object.fromEntries(keys.map((key, index) => [key, String(row[index] ?? "").trim()]).filter(([key]) => Boolean(key))));
}

function rowsFromText(text: string, kind: "planning" | "apprenants") {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const matrix = lines.map((line) => line.includes("|") ? line.split("|") : line.includes("\t") ? line.split("\t") : line.split(/\s{2,}/));
  return rowsFromMatrix(matrix, kind);
}

async function createPdfParser(data: Uint8Array) {
  // Install the native polyfills before loading pdf.js.
  const canvas = await import("@napi-rs/canvas");
  const globals = globalThis as unknown as Record<string, unknown>;
  globals.DOMMatrix ??= canvas.DOMMatrix;
  globals.ImageData ??= canvas.ImageData;
  globals.Path2D ??= canvas.Path2D;

  // Resolve pdf-parse's worker explicitly; Vercel's runtime cannot infer pdf.js's
  // default fake-worker path from its bundled serverless output.
  const { getPath } = await import("pdf-parse/worker");
  const { PDFParse } = await import("pdf-parse");
  PDFParse.setWorker(getPath());
  return new PDFParse({ data });
}

function rowsFromPlanningTables(
  result: { pages?: Array<{ tables?: unknown[][][] }> },
  textPages: Array<{ text?: string }> = [],
): ImportRow[] {
  const rows: ImportRow[] = [];
  const timeRange = (value: string) => {
    const match = value.match(/(\d{1,2})(?:h|:)?(\d{2})?\s*[-–à]\s*(\d{1,2})(?:h|:)?(\d{2})?/i);
    if (!match) return null;
    const start = String(Number(match[1])).padStart(2, "0") + ":" + String(Number(match[2] || 0)).padStart(2, "0");
    const end = String(Number(match[3])).padStart(2, "0") + ":" + String(Number(match[4] || 0)).padStart(2, "0");
    return { start, end };
  };
  const dayPattern = /^(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)$/i;
  const teacherPattern = /^\s*(?:M(?:me)?\.?)\s+([A-ZÀ-ÖØ-Þ][A-ZÀ-ÖØ-Þ'’-]{2,})\s*$/i;
  const roomPattern = /^\s*(?:salle|atelier|laboratoire|local)\s+(.+?)\s*$/i;

  for (const [pageIndex, page] of (result.pages ?? []).entries()) {
    const pageText = textPages[pageIndex]?.text ?? "";
    const className = pageText.match(/NIVEAU\s*:\s*([^\r\n]+)/i)?.[1]?.trim() ?? "";
    for (const rawTable of page.tables ?? []) {
      const table = rawTable.map((row) => Array.isArray(row)
        ? row.map((cell) => cell === null ? null : String(cell ?? "").trim())
        : []);
      const headerIndex = table.findIndex((row) => row.some((cell) => typeof cell === "string" && timeRange(cell)));
      if (headerIndex < 0) continue;
      const header = table[headerIndex];
      const timeColumns = header
        .map((cell, index) => ({ index, range: typeof cell === "string" ? timeRange(cell) : null }))
        .filter((item): item is { index: number; range: { start: string; end: string } } => Boolean(item.range));
      const byColumn = new Map(timeColumns.map((item) => [item.index, item.range]));
      const finalEnd = timeColumns.at(-1)?.range.end;
      for (const cells of table.slice(headerIndex + 1)) {
        const weekday = cells.find((cell) => typeof cell === "string" && dayPattern.test(cell.trim()));
        if (typeof weekday !== "string") continue;

        for (const slot of timeColumns) {
          const value = cells[slot.index];
          if (typeof value !== "string" || !value.trim()) continue;
          const lines = value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
          const teacherLine = lines.find((line) => teacherPattern.test(line));
          const trainer = teacherLine?.match(teacherPattern)?.[1] ?? "";
          const roomLine = lines.find((line) => roomPattern.test(line));
          const room = roomLine?.trim() ?? "";
          const subject = lines.find((line) => line !== teacherLine && line !== roomLine) ?? "";
          if (!subject) continue;

          let endTime = slot.range.end;
          let next = slot.index + 1;
          while (next < cells.length && cells[next] === null) next++;
          if (next >= cells.length) {
            endTime = finalEnd ?? slot.range.end;
          } else {
            const nextRange = byColumn.get(next);
            if (nextRange && nextRange.start > slot.range.start) endTime = nextRange.start;
          }

          rows.push({
            weekday,
            startTime: slot.range.start,
            endTime,
            room,
            className,
            trainer,
            subject,
          });
        }
      }
    }
  }
  return rows;
}

export async function extractRows(file: File, kind: "planning" | "apprenants") {
  if (file.size > 10 * 1024 * 1024) throw new Error("Le fichier dépasse la limite de 10 Mo.");
  const name = file.name.toLowerCase();
  const buffer = Buffer.from(await file.arrayBuffer());
  if (name.endsWith(".xlsx")) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as never);
    const sheet = workbook.worksheets[0];
    if (!sheet) return [];
    const matrix: unknown[][] = [];
    sheet.eachRow({ includeEmpty: false }, (row) => {
      const values: unknown[] = [];
      row.eachCell({ includeEmpty: true }, (cell, columnNumber) => {
        const value = cell.value;
        if (value instanceof Date) {
          values[columnNumber - 1] = value.toISOString().slice(0, 10);
        } else if (value && typeof value === "object" && "result" in value) {
          values[columnNumber - 1] = String(value.result ?? "");
        } else {
          values[columnNumber - 1] = String(cell.text ?? "");
        }
      });
      matrix.push(values);
    });
    return rowsFromMatrix(matrix, kind);
  }
  if (name.endsWith(".docx")) {
    // Mammoth's declaration uses a non-generic Node Buffer while modern @types/node
    // exposes Buffer<ArrayBufferLike>; the runtime value is still a Node Buffer.
    const result = await mammoth.extractRawText({ buffer: buffer as never });
    return rowsFromText(result.value, kind);
  }
  if (name.endsWith(".pdf")) {
    const parser = await createPdfParser(new Uint8Array(buffer));
    try {
      if (kind === "planning") {
        const [tables, textResult] = await Promise.all([parser.getTable(), parser.getText()]);
        const gridRows = rowsFromPlanningTables(
          tables as { pages?: Array<{ tables?: unknown[][][] }> },
          (textResult as { pages?: Array<{ text?: string }> }).pages ?? [],
        );
        if (gridRows.length) return gridRows;
      }
      const result = await parser.getText();
      if (!result.text.trim()) throw new Error("Ce PDF ne contient pas de texte sélectionnable. Les PDF scannés nécessitent une reconnaissance OCR.");
      return rowsFromText(result.text, kind);
    } finally {
      await parser.destroy();
    }
  }
  throw new Error("Format non pris en charge. Utilisez Excel (.xlsx), Word (.docx) ou PDF avec texte sélectionnable.");
}

/** Extract the abbreviated teacher labels commonly printed in CFP timetable grids. */
export async function extractTrainerNames(file: File) {
  if (!file.name.toLowerCase().endsWith(".pdf")) return [];
  if (file.size > 10 * 1024 * 1024) throw new Error("Le fichier dépasse la limite de 10 Mo.");

  const parser = await createPdfParser(new Uint8Array(await file.arrayBuffer()));
  try {
    const { text } = await parser.getText();
    const names = new Map<string, string>();
    const pattern = /\b(Mme?\.?|M\.)\s*([A-ZÀ-ÖØ-Þ][A-Za-zÀ-ÿ'’-]*)/g;
    for (const match of text.matchAll(pattern)) {
      const surname = match[2].trim().replace(/[.,;:]+$/, "");
      if (!surname || /^(?:LE CHEF|CHEF DES TRAVAUX)$/i.test(surname)) continue;
      const title = /^mme/i.test(match[1]) ? "Mme" : "M.";
      const label = `${title} ${surname}`;
      const key = normalize(surname);
      if (key) names.set(key, label);
    }
    return [...names.values()].sort((a, b) => a.localeCompare(b, "fr"));
  } finally {
    await parser.destroy();
  }
}
