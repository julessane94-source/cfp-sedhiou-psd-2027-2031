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

async function rowsFromPlanningPdf(data: Uint8Array): Promise<ImportRow[]> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const { getPath } = await import("pdf-parse/worker");
  pdfjs.GlobalWorkerOptions.workerSrc = getPath();
  // pdf.js requires this directory explicitly in Node.js. Resolve it beside the
  // same legacy build that was imported so the URL stays valid in Vercel traces.
  const pdfjsEntryUrl = import.meta.resolve("pdfjs-dist/legacy/build/pdf.mjs");
  const standardFontDataUrl = new URL("./standard_fonts/", pdfjsEntryUrl).href;
  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(data),
    standardFontDataUrl,
  });
  const document = await loadingTask.promise;
  const rows: ImportRow[] = [];

  const cluster = (values: number[], tolerance = 1.5) => {
    const sorted = [...values].sort((a, b) => a - b);
    const groups: number[][] = [];
    for (const value of sorted) {
      const last = groups[groups.length - 1];
      if (last && Math.abs(value - last[last.length - 1]) <= tolerance) last.push(value);
      else groups.push([value]);
    }
    return groups.map((group) => group.reduce((sum, value) => sum + value, 0) / group.length);
  };
  const timeRange = (value: string) => {
    const match = value.match(/(\d{1,2})(?:h|:)?(\d{2})?\s*[-–à]\s*(\d{1,2})(?:h|:)?(\d{2})?/i);
    if (!match) return null;
    return {
      start: String(Number(match[1])).padStart(2, "0") + ":" + String(Number(match[2] || 0)).padStart(2, "0"),
      end: String(Number(match[3])).padStart(2, "0") + ":" + String(Number(match[4] || 0)).padStart(2, "0"),
    };
  };
  const dayPattern = /^(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)$/i;
  const teacherPattern = /\b(?:mme?|madame|monsieur)\.?\s+([A-ZÀ-ÖØ-Þ][A-ZÀ-ÖØ-Þ'’-]{2,})\b/i;
  const roomPattern = /^\s*(?:salle|atelier|laboratoire|local)\b.*$/i;

  try {
    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber++) {
      const page = await document.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1 });
      const operatorList = await page.getOperatorList();
      const horizontal: Array<{ y: number; left: number; right: number }> = [];
      const vertical: Array<{ x: number; top: number; bottom: number }> = [];
      let transformMatrix = [1, 0, 0, 1, 0, 0];
      const transformStack: number[][] = [];

      const toViewport = (x: number, y: number) => {
        const a = transformMatrix[0], b = transformMatrix[1], c = transformMatrix[2];
        const d = transformMatrix[3], e = transformMatrix[4], f = transformMatrix[5];
        const transformedX = a * x + c * y + e;
        const transformedY = b * x + d * y + f;
        const [viewA, viewB, viewC, viewD, viewE, viewF] = viewport.transform;
        return {
          x: viewA * transformedX + viewC * transformedY + viewE,
          y: viewB * transformedX + viewD * transformedY + viewF,
        };
      };
      const addSegment = (x1: number, y1: number, x2: number, y2: number) => {
        if (Math.abs(y2 - y1) <= 1.5 && Math.abs(x2 - x1) > 5) {
          horizontal.push({ y: (y1 + y2) / 2, left: Math.min(x1, x2), right: Math.max(x1, x2) });
        } else if (Math.abs(x2 - x1) <= 1.5 && Math.abs(y2 - y1) > 5) {
          vertical.push({ x: (x1 + x2) / 2, top: Math.min(y1, y2), bottom: Math.max(y1, y2) });
        }
      };

      for (let index = 0; index < operatorList.fnArray.length; index++) {
        const fn = operatorList.fnArray[index];
        const args = operatorList.argsArray[index] as unknown as Array<unknown>;
        if (fn === pdfjs.OPS.save) {
          transformStack.push([...transformMatrix]);
        } else if (fn === pdfjs.OPS.restore) {
          transformMatrix = transformStack.pop() ?? transformMatrix;
        } else if (fn === pdfjs.OPS.transform) {
          transformMatrix = pdfjs.Util.transform(transformMatrix, args as number[]);
        } else if (fn === pdfjs.OPS.constructPath) {
          if (args?.[0] !== pdfjs.OPS.stroke) continue;
          const bounds = args[2] as number[] | undefined;
          if (!bounds || bounds.length < 4 || bounds.some((value) => !Number.isFinite(value))) continue;
          const [x1, y1, x2, y2] = bounds;
          const points = [
            toViewport(x1, y1), toViewport(x1, y2),
            toViewport(x2, y1), toViewport(x2, y2),
          ];
          const left = Math.min(...points.map((point) => point.x));
          const right = Math.max(...points.map((point) => point.x));
          const top = Math.min(...points.map((point) => point.y));
          const bottom = Math.max(...points.map((point) => point.y));
          if (right - left > 5 && bottom - top > 5) {
            addSegment(left, top, right, top);
            addSegment(left, bottom, right, bottom);
            addSegment(left, top, left, bottom);
            addSegment(right, top, right, bottom);
          } else {
            addSegment(left, top, right, bottom);
          }
        }
      }

      const textContent = await page.getTextContent();
      const items = textContent.items.flatMap((entry) => {
        if (!("str" in entry) || !entry.str.trim()) return [];
        const item = entry as { str: string; transform: number[]; width: number; height: number };
        const matrix = pdfjs.Util.transform(viewport.transform, item.transform);
        const centerX = matrix[4] + item.width / 2;
        const centerY = matrix[5] - item.height / 2;
        return [{ text: item.str.trim(), x: centerX, y: centerY }];
      });
      const pageText = items.map((item) => item.text).join(" ");
      const className = pageText.match(/\bNIVEAU\s*:\s*((?:CAP\s*\d+)|(?:1\S*\s+ANN[EÉ]E))/i)?.[1]?.trim() ?? "";

      const longLines = horizontal.filter((line) => line.right - line.left > 450);
      const lineGroups: Array<{ y: number; lines: typeof longLines }> = [];
      for (const line of longLines.sort((a, b) => a.y - b.y)) {
        const existing = lineGroups.find((group) => Math.abs(group.y - line.y) <= 2);
        if (existing) existing.lines.push(line);
        else lineGroups.push({ y: line.y, lines: [line] });
      }
      const rowBounds = lineGroups
        .filter((group) => {
          const left = Math.min(...group.lines.map((line) => line.left));
          const right = Math.max(...group.lines.map((line) => line.right));
          return right - left > 500 && group.y > 80 && group.y < viewport.height - 60;
        })
        .map((group) => group.y)
        .sort((a, b) => a - b);
      if (rowBounds.length < 3) {
        page.cleanup();
        continue;
      }

      const tableTop = rowBounds[0];
      const tableBottom = rowBounds[rowBounds.length - 1];
      const tableLeft = Math.min(...horizontal.filter((line) => Math.abs(line.y - tableTop) < 3).map((line) => line.left));
      const tableRight = Math.max(...horizontal.filter((line) => Math.abs(line.y - tableTop) < 3).map((line) => line.right));
      const dayItems = items.filter((item) => dayPattern.test(item.text));
      if (!Number.isFinite(tableLeft) || !Number.isFinite(tableRight) || !dayItems.length) {
        page.cleanup();
        continue;
      }

      const headerTop = rowBounds[0];
      const headerBottom = rowBounds[1];
      const headerCenter = (headerTop + headerBottom) / 2;
      const headerX = cluster(vertical
        .filter((line) => line.bottom >= headerCenter && line.top <= headerCenter)
        .map((line) => line.x)
        .filter((x) => x >= tableLeft - 2 && x <= tableRight + 2));
      const cellBounds = (x: number, y: number) => {
        const boundaries = cluster(vertical
          .filter((line) => line.bottom >= y - 2 && line.top <= y + 2)
          .map((line) => line.x)
          .filter((value) => value >= tableLeft - 2 && value <= tableRight + 2));
        const left = [...boundaries].reverse().find((value) => value < x - 1);
        const right = boundaries.find((value) => value > x + 1);
        return left === undefined || right === undefined ? null : { left, right };
      };
      const timeSlots = items.flatMap((item) => {
        const range = timeRange(item.text);
        if (!range || item.y < headerTop - 2 || item.y > headerBottom + 2) return [];
        const bounds = cellBounds(item.x, headerCenter);
        return bounds ? [{ ...bounds, ...range }] : [];
      });
      if (!timeSlots.length) {
        page.cleanup();
        continue;
      }

      for (const dayItem of dayItems) {
        if (dayItem.x < tableLeft - 3 || dayItem.x > tableRight + 3 || dayItem.y < tableTop || dayItem.y > tableBottom) continue;
        const rowIndex = rowBounds.findIndex((bound, index) => index < rowBounds.length - 1 && dayItem.y >= bound && dayItem.y <= rowBounds[index + 1]);
        if (rowIndex < 0) continue;
        const rowTop = rowBounds[rowIndex];
        const rowBottom = rowBounds[rowIndex + 1];
        const rowCenter = (rowTop + rowBottom) / 2;
        const cellGroups = new Map<string, { bounds: { left: number; right: number }; items: typeof items }>();
        for (const item of items) {
          if (item.y < rowTop + 2 || item.y > rowBottom - 2 || dayPattern.test(item.text)) continue;
          const bounds = cellBounds(item.x, rowCenter);
          if (!bounds) continue;
          const key = Math.round(bounds.left) + ":" + Math.round(bounds.right);
          const group = cellGroups.get(key) ?? { bounds, items: [] };
          group.items.push(item);
          cellGroups.set(key, group);
        }

        for (const group of cellGroups.values()) {
          const slotMatches = timeSlots.filter((slot) => slot.left < group.bounds.right - 1 && slot.right > group.bounds.left + 1);
          if (!slotMatches.length) continue;
          const ordered = [...group.items].sort((a, b) => a.y - b.y || a.x - b.x);
          const textLines: Array<{ y: number; text: string }> = [];
          for (const item of ordered) {
            const existing = textLines.find((line) => Math.abs(line.y - item.y) <= 2);
            if (existing) existing.text += " " + item.text;
            else textLines.push({ y: item.y, text: item.text });
          }
          const lines = textLines.map((line) => line.text.trim()).filter(Boolean);
          const teacherLine = lines.find((line) => teacherPattern.test(line));
          const trainer = teacherLine?.match(teacherPattern)?.[1] ?? "";
          const roomLine = lines.find((line) => roomPattern.test(line));
          const room = roomLine?.trim() ?? "";
          const subject = lines.filter((line) => line !== teacherLine && line !== roomLine).join(" ").trim();
          if (!subject || !trainer) continue;
          const startSlot = [...slotMatches].sort((a, b) => a.left - b.left)[0];
          const endSlot = [...slotMatches].sort((a, b) => b.right - a.right)[0];
          rows.push({
            weekday: dayItem.text,
            startTime: startSlot.start,
            endTime: endSlot.end,
            room,
            className,
            trainer,
            subject,
          });
        }
      }

      page.cleanup();
    }
  } finally {
    await document.destroy();
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
        const gridRows = await rowsFromPlanningPdf(new Uint8Array(buffer));
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
