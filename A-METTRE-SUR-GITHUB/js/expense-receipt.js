/* Une photo par dépense. L'extension est facultative : les autres versions la
 * conservent comme un champ JSON inconnu. Ne jamais remplacer une structure
 * future ou invalide sans savoir ce qu'elle signifie. */
import { stringifyBackupJson } from "./precise-json.js";

export const EXPENSE_RECEIPT_KEY = "vigieExpenseReceipt";
export const RECEIPT_FILE_LIMIT = 5 * 1024 * 1024;
const MAX_PREVIEW_LENGTH = 8 * 1024 * 1024;
const IMAGE_URL = /^data:image\/(?:jpeg|png|webp|gif);base64,[A-Za-z0-9+/=\r\n]+$/i;

export function inspectExpenseReceipt(expense) {
  if (!Object.hasOwn(expense, EXPENSE_RECEIPT_KEY)) return { state: "empty", dataUrl: null };
  const box = expense[EXPENSE_RECEIPT_KEY];
  if (!box || typeof box !== "object" || Array.isArray(box) || box instanceof Uint8Array || !Object.hasOwn(box, "version") || box.version !== 1)
    return { state: "unsupported", dataUrl: null };
  const value = Object.hasOwn(box, "dataUrl") ? box.dataUrl : undefined;
  if (value == null || value === "") return { state: "empty", dataUrl: null };
  if (typeof value !== "string") return { state: "unsupported", dataUrl: null };
  return { state: "present", dataUrl: value };
}

/** Ne rend jamais utilisable comme URL une chaîne étrangère ou trop longue. */
export function receiptPreviewUrl(dataUrl) {
  return typeof dataUrl === "string" && dataUrl.length <= MAX_PREVIEW_LENGTH && IMAGE_URL.test(dataUrl) ? dataUrl : null;
}

/** Conserve les champs inconnus de l'enveloppe v1 même lors d'un retrait. */
export function withExpenseReceipt(expense, dataUrl) {
  const info = inspectExpenseReceipt(expense);
  if (info.state === "unsupported") throw new Error("Ce justificatif d’une autre version est conservé sans modification.");
  const box = Object.hasOwn(expense, EXPENSE_RECEIPT_KEY) ? { ...expense[EXPENSE_RECEIPT_KEY] } : { version: 1 };
  if (dataUrl == null) delete box.dataUrl;
  else box.dataUrl = dataUrl;
  return { ...expense, [EXPENSE_RECEIPT_KEY]: box };
}

/** Marge pour le pont Android : jamais refuser le retrait sur une ancienne
 * dépense déjà trop grosse ; le contrôle s'applique aux ajouts/remplacements. */
export function requireReceiptRecordSize(expense) {
  const serialized = stringifyBackupJson({ data: { expenses: [expense] } });
  if (serialized.length > 16 * 1024 * 1024 - 4096 || new TextEncoder().encode(serialized).length > 32 * 1024 * 1024 - 4096)
    throw new Error("Cette dépense et ses extensions sont trop volumineuses pour ajouter cette photo. Rien n’a été modifié.");
}

/** Vérification des signatures, en plus du type et de la limite du navigateur.
 * Un fichier endommagé peut toujours être illisible : l'aperçu gère ce cas. */
export async function validateReceiptFile(file) {
  if (!file || !file.size) throw new Error("Choisissez une photo non vide.");
  if (file.size > RECEIPT_FILE_LIMIT) throw new Error("La photo dépasse 5 Mio. Choisissez une image plus petite.");
  const head = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const begins = (...bytes) => bytes.every((v, i) => head[i] === v);
  const ascii = (from, text) => [...text].every((c, i) => head[from + i] === c.charCodeAt(0));
  const match = file.type === "image/jpeg" ? begins(0xff, 0xd8, 0xff)
    : file.type === "image/png" ? begins(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)
    : file.type === "image/webp" ? ascii(0, "RIFF") && ascii(8, "WEBP")
    : file.type === "image/gif" ? ascii(0, "GIF87a") || ascii(0, "GIF89a") : false;
  if (!match) throw new Error("Choisissez une image JPG, PNG, WebP ou GIF lisible.");
}
