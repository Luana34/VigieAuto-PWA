/* Notes du véhicule : texte commun aux anciennes versions, mise en forme
 * facultative par intervalles UTF-16. Aucune copie du texte dans l'extension.
 * Les formats futurs sont conservés mais jamais interprétés ou écrasés. */
export const VEHICLE_NOTES_KEY = "vigieVehicleNotes";
export const VEHICLE_NOTES_LIMIT = 8000;
export const VEHICLE_NOTES_MARK_LIMIT = 128;
export const VEHICLE_NOTES_HASH_ALGORITHM = "sha256-utf16be-v1";
const HASH = /^[0-9a-f]{64}$/;
const plain = (x) => x !== null && typeof x === "object" && !Array.isArray(x) &&
  !(x instanceof Uint8Array) && Object.prototype.toString.call(x) === "[object Object]";
const own = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);
const styles = new Set(["bold", "italic"]);

// SHA-256 sur les unités UTF-16 big-endian, y compris les éventuels surrogates
// isolés : une modification du texte par une ancienne version rend l'empreinte différente.
export async function vehicleNotesHash(text) {
  if (typeof text !== "string" || text.length > VEHICLE_NOTES_LIMIT) throw new Error("Texte des notes invalide ou trop long.");
  if (!globalThis.crypto?.subtle) throw new Error("La vérification locale des notes est indisponible dans ce navigateur. Les données restent inchangées.");
  const bytes = new Uint8Array(text.length * 2);
  for (let i = 0; i < text.length; i++) { const n = text.charCodeAt(i); bytes[i * 2] = n >>> 8; bytes[i * 2 + 1] = n & 255; }
  const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
function boundary(text, index) {
  if (index <= 0 || index >= text.length) return true;
  const a = text.charCodeAt(index - 1), b = text.charCodeAt(index);
  return !(a >= 0xd800 && a <= 0xdbff && b >= 0xdc00 && b <= 0xdfff);
}
function basicMark(mark) {
  return plain(mark) && Object.keys(mark).length === 3 && ["start", "end", "style"].every((k) => own(mark, k)) &&
    Number.isSafeInteger(mark.start) && Number.isSafeInteger(mark.end) && mark.start >= 0 && mark.start < mark.end &&
    mark.end <= VEHICLE_NOTES_LIMIT && styles.has(mark.style);
}
/** Union d'intervalles de même style ; aucun caractère n'est transformé. */
export function normalizeNoteMarks(marks, text) {
  if (typeof text !== "string" || text.length > VEHICLE_NOTES_LIMIT || !Array.isArray(marks) || marks.length > VEHICLE_NOTES_MARK_LIMIT ||
      marks.some((m) => !basicMark(m) || m.end > text.length || !boundary(text, m.start) || !boundary(text, m.end)))
    throw new Error("Mise en forme des notes non reconnue : aucune donnée modifiée.");
  const merged = [];
  for (const style of ["bold", "italic"]) {
    const spans = marks.filter((m) => m.style === style).map((m) => ({ start:m.start, end:m.end, style }))
      .sort((a, b) => a.start - b.start || a.end - b.end);
    for (const mark of spans) {
      const last = merged.at(-1);
      if (last && last.style === style && mark.start <= last.end) last.end = Math.max(last.end, mark.end);
      else merged.push(mark);
    }
  }
  if (merged.length > VEHICLE_NOTES_MARK_LIMIT) throw new Error("Trop de mises en forme dans cette note : aucune donnée modifiée.");
  return merged.sort((a, b) => a.start - b.start || a.end - b.end || a.style.localeCompare(b.style));
}
const sameMarks = (a, b) => a.length === b.length && a.every((m, i) => m.start === b[i].start && m.end === b[i].end && m.style === b[i].style);

/** La note ancienne ne crée aucun nouvel objet à la lecture. */
export async function inspectVehicleNotes(vehicle) {
  if (!plain(vehicle)) throw new Error("Véhicule invalide : aucune donnée modifiée.");
  const raw = vehicle.notes;
  if (raw != null && typeof raw !== "string") return { state:"unsupported", reason:"text" };
  const text = raw ?? "";
  if (text.length > VEHICLE_NOTES_LIMIT) return { state:"unsupported", reason:"length" };
  if (!own(vehicle, VEHICLE_NOTES_KEY)) return { state:"absent", text, marks:[] };
  const box = vehicle[VEHICLE_NOTES_KEY];
  if (!plain(box) || box.version !== 1 || box.algorithm !== VEHICLE_NOTES_HASH_ALGORITHM || typeof box.textHash !== "string" || !HASH.test(box.textHash) ||
      !Array.isArray(box.marks) || box.marks.length > VEHICLE_NOTES_MARK_LIMIT || box.marks.some((m) => !basicMark(m)))
    return { state:"unsupported", reason:"format" };
  if (!globalThis.crypto?.subtle) return { state:"unavailable", text };
  const hash = await vehicleNotesHash(text);
  if (hash !== box.textHash) return { state:"stale", text, value:box };
  try { return { state:"valid", text, marks:normalizeNoteMarks(box.marks, text), value:box }; }
  catch { return { state:"unsupported", reason:"format" }; }
}

/** Ajouter ou retirer un style sur la sélection, sans toucher au texte. */
export function toggleNoteMark(text, marks, style, start, end) {
  if (!styles.has(style) || !Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 0 || start >= end || end > text.length ||
      !boundary(text, start) || !boundary(text, end)) throw new Error("Sélectionnez d’abord le texte à mettre en forme.");
  const current = normalizeNoteMarks(marks, text), same = current.filter((m) => m.style === style);
  let cursor = start;
  for (const m of same) { if (m.end <= cursor || m.start > cursor) continue; cursor = Math.max(cursor, m.end); if (cursor >= end) break; }
  const remove = cursor >= end;
  const next = current.flatMap((m) => {
    if (!remove || m.style !== style || m.end <= start || m.start >= end) return [m];
    const out = [];
    if (m.start < start) out.push({ start:m.start, end:start, style });
    if (m.end > end) out.push({ start:end, end:m.end, style });
    return out;
  });
  if (!remove) next.push({ start, end, style });
  return normalizeNoteMarks(next, text);
}

/** Réajuste les styles après une saisie ; ne renvoie jamais un intervalle invalide. */
export function rebaseNoteMarks(before, after, marks) {
  const current = normalizeNoteMarks(marks, before);
  if (typeof after !== "string" || after.length > VEHICLE_NOTES_LIMIT) throw new Error(`Les notes dépassent ${VEHICLE_NOTES_LIMIT} caractères : aucune donnée modifiée.`);
  if (before === after) return current;
  let prefix = 0, suffix = 0;
  while (prefix < before.length && prefix < after.length && before.charCodeAt(prefix) === after.charCodeAt(prefix)) prefix++;
  while (prefix > 0 && (!boundary(before, prefix) || !boundary(after, prefix))) prefix--;
  while (suffix < before.length - prefix && suffix < after.length - prefix &&
    before.charCodeAt(before.length - 1 - suffix) === after.charCodeAt(after.length - 1 - suffix)) suffix++;
  while (suffix > 0 && (!boundary(before, before.length - suffix) || !boundary(after, after.length - suffix))) suffix--;
  const oldEnd = before.length - suffix, newEnd = after.length - suffix, delta = newEnd - oldEnd;
  const moved = [];
  for (const mark of current) {
    let start, end;
    if (mark.end <= prefix) { start = mark.start; end = mark.end; }
    else if (mark.start >= oldEnd) { start = mark.start + delta; end = mark.end + delta; }
    else { start = mark.start < prefix ? mark.start : prefix; end = mark.end > oldEnd ? mark.end + delta : newEnd; }
    if (start < end) moved.push({ start, end, style:mark.style });
  }
  return normalizeNoteMarks(moved, after);
}

/** Applique uniquement le texte et, si nécessaire, l'extension reconnue. */
export async function withVehicleNotes(vehicle, draft, { resetStale = false } = {}) {
  const info = await inspectVehicleNotes(vehicle);
  if (["unsupported", "unavailable"].includes(info.state)) throw new Error("Ces notes ou leur format ne sont pas reconnus ici : les données restent conservées sans modification.");
  if (info.state === "stale" && !resetStale) throw new Error("Le texte des notes a changé dans une autre version : vérifiez la mise en forme avant de continuer.");
  if (!plain(draft) || typeof draft.text !== "string" || !Array.isArray(draft.marks)) throw new Error("Notes invalides : aucune donnée modifiée.");
  const marks = normalizeNoteMarks(draft.marks, draft.text);
  if (info.state !== "stale" && draft.text === info.text && sameMarks(marks, info.marks)) return vehicle;
  // Aucune extension inventée pour une note sans mise en forme.
  const next = { ...vehicle };
  if (draft.text !== info.text) next.notes = draft.text;
  if (info.state === "absent" && !marks.length) return next;
  const box = info.state === "absent" ? {} : info.value;
  next[VEHICLE_NOTES_KEY] = { ...box, version:1, algorithm:VEHICLE_NOTES_HASH_ALGORITHM,
    textHash:await vehicleNotesHash(draft.text), marks };
  return next;
}
