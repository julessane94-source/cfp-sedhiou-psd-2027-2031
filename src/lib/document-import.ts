import ExcelJS from "exceljs";
import mammoth from "mammoth";
import pdf from "pdf-parse";

export type ImportRow = Record<string, string>;

const aliases: Record<string, string[]> = {
  weekday: ["jour", "jour de cours", "weekday", "day"],
  startTime: ["debut", "heure debut", "heure de debut", "debut cours", "start", "start time"],
  endTime: ["fin", "heure fin", "heure de fin", "fin cours", "end", "end time"],
  room: ["salle", "salle de cours", "room", "local"],
  trainer: ["formateur", "formateur trice", "enseignant", "professeur", "prof", "trainer", "instructor"],
  subject: ["cours", "matiere", "module", "intitule", "classe", "formation", "subject"],
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
  const keys = mapHeaders(matrixClean[0]);
  const required = kind === "planning" ? ["weekday", "startTime", "endTime", "room", "trainer", "subject"] : ["firstName", "lastName"];
  if (required.some((key) => !keys.includes(key))) {
    throw new Error(kind === "planning"
      ? "Colonnes attendues : Jour, Début, Fin, Salle, Formateur et Cours/Classe."
      : "Colonnes attendues : Prénom et Nom.");
  }
  return matrixClean.slice(1).map((row) => Object.fromEntries(keys.map((key, index) => [key, String(row[index] ?? "").trim()]).filter(([key]) => Boolean(key))));
}

function rowsFromText(text: string, kind: "planning" | "apprenants") {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const matrix = lines.map((line) => line.includes("|") ? line.split("|") : line.includes("\t") ? line.split("\t") : line.split(/\s{2,}/));
  return rowsFromMatrix(matrix, kind);
}

export async function extractRows(file: File, kind: "planning" | "apprenants") {
  if (file.size > 10 * 1024 * 1024) throw new Error("Le fichier dépasse la limite de 10 Mo.");
  const name = file.name.toLowerCase();
  const buffer = Buffer.from(await file.arrayBuffer());
  if (name.endsWith(".xlsx")) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as unknown as ArrayBuffer);
    const sheet = workbook.worksheets[0];
    if (!sheet) return [];
    const matrix: unknown[][] = [];
    sheet.eachRow({ includeEmpty: false }, (row) => matrix.push(row.values.slice(1).map((cell) => cell instanceof Date ? cell.toISOString().slice(0, 10) : String(cell ?? ""))));
    return rowsFromMatrix(matrix, kind);
  }
  if (name.endsWith(".docx")) {
    const result = await mammoth.extractRawText({ buffer });
    return rowsFromText(result.value, kind);
  }
  if (name.endsWith(".pdf")) {
    const result = await pdf(buffer);
    if (!result.text.trim()) throw new Error("Ce PDF ne contient pas de texte sélectionnable. Les PDF scannés nécessitent une reconnaissance OCR.");
    return rowsFromText(result.text, kind);
  }
  throw new Error("Format non pris en charge. Utilisez Excel (.xlsx), Word (.docx) ou PDF avec texte sélectionnable.");
}
