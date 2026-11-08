/* Fiche complémentaire facultative du véhicule. Le repère visuel, le VIN,
 * l'immatriculation et les notes existants restent des champs séparés.
 * Aucun achat, rappel ou conversion n'est créé automatiquement. */
import { validCurrencyCode } from "./currency.js";

export const VEHICLE_PROFILE_KEY = "vigieVehicleProfile";
export const PROFILE_TEXT_LIMIT = 200;
export const PROFILE_FIELDS = Object.freeze([
  "bodyColor", "insurer", "policyNumber", "insuranceExpiry",
  "purchaseDate", "purchaseAmount", "purchaseCurrency",
]);

const plain = (x) => x !== null && typeof x === "object" && !Array.isArray(x) &&
  !(x instanceof Uint8Array) && Object.prototype.toString.call(x) === "[object Object]";
const optionalText = (x, max = PROFILE_TEXT_LIMIT) => x == null || (typeof x === "string" && x.length <= max);
const asText = (x) => x == null ? "" : x;
const emptyFields = () => Object.fromEntries(PROFILE_FIELDS.map((key) => [key, ""]));

/** Date calendaire sans fuseau : aucune correction automatique d'une date impossible. */
export function validProfileDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  if (y < 1 || m < 1 || m > 12 || d < 1) return false;
  const leap = y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0);
  const lengths = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return d <= lengths[m - 1];
}

/** Texte décimal exact, jamais converti en nombre binaire et sans conversion de devise. */
export function normalizePurchaseAmount(raw) {
  if (typeof raw !== "string") throw new Error("Montant d’achat invalide : rien n’a été modifié.");
  const input = raw.trim();
  if (!input) return "";
  const match = /^(?:(\d{1,24})(?:[.,](\d{1,6}))?|[.,](\d{1,6}))$/.exec(input);
  if (!match) throw new Error("Prix d’achat : saisissez un montant positif ou nul avec au plus six décimales, sans séparateur de milliers.");
  const whole = (match[1] || "0").replace(/^0+(?=\d)/, "");
  const fraction = match[2] ?? match[3];
  return whole + (fraction ? `.${fraction}` : "");
}

function recognizedFields(box) {
  if (!plain(box) || box.version !== 1) return null;
  if (!optionalText(box.bodyColor)) return null;
  const insurance = box.insurance, purchase = box.purchase;
  if (insurance != null && !plain(insurance)) return null;
  if (purchase != null && !plain(purchase)) return null;
  const ins = insurance || {}, buy = purchase || {};
  if (!optionalText(ins.company) || !optionalText(ins.policyNumber) || !optionalText(ins.expiryDate, 10) ||
      !optionalText(buy.date, 10) || !optionalText(buy.amount, 31) || !optionalText(buy.currency, 3)) return null;
  const fields = {
    bodyColor: asText(box.bodyColor), insurer: asText(ins.company), policyNumber: asText(ins.policyNumber),
    insuranceExpiry: asText(ins.expiryDate), purchaseDate: asText(buy.date),
    purchaseAmount: asText(buy.amount), purchaseCurrency: asText(buy.currency),
  };
  if ((fields.insuranceExpiry && !validProfileDate(fields.insuranceExpiry)) ||
      (fields.purchaseDate && !validProfileDate(fields.purchaseDate))) return null;
  if (!!fields.purchaseAmount !== !!fields.purchaseCurrency) return null;
  if (fields.purchaseCurrency && !validCurrencyCode(fields.purchaseCurrency)) return null;
  if (fields.purchaseAmount) {
    try { if (normalizePurchaseAmount(fields.purchaseAmount) !== fields.purchaseAmount) return null; }
    catch { return null; }
  }
  return fields;
}

/** Un format inconnu est signalé, conservé et non modifiable dans cette version. */
export function inspectVehicleProfile(vehicle) {
  if (!plain(vehicle)) throw new Error("Véhicule invalide : aucune donnée modifiée.");
  if (!Object.hasOwn(vehicle, VEHICLE_PROFILE_KEY)) return { state: "absent", fields: emptyFields() };
  const value = vehicle[VEHICLE_PROFILE_KEY], fields = recognizedFields(value);
  return fields ? { state: "valid", fields, value } : { state: "unsupported", fields: null };
}

const pathByField = Object.freeze({
  bodyColor: ["bodyColor"], insurer: ["insurance", "company"], policyNumber: ["insurance", "policyNumber"],
  insuranceExpiry: ["insurance", "expiryDate"], purchaseDate: ["purchase", "date"],
  purchaseAmount: ["purchase", "amount"], purchaseCurrency: ["purchase", "currency"],
});

/** Copie seulement les champs réellement modifiés et conserve toutes les extensions. */
export function withVehicleProfile(vehicle, values, changedKeys) {
  const info = inspectVehicleProfile(vehicle);
  if (info.state === "unsupported") throw new Error("Ces informations proviennent d’un format non reconnu : elles sont conservées sans modification.");
  if (!plain(values) || !Array.isArray(changedKeys) || changedKeys.some((key) => !PROFILE_FIELDS.includes(key)))
    throw new Error("Informations du véhicule invalides : rien n’a été modifié.");
  const next = { ...info.fields };
  for (const key of new Set(changedKeys)) {
    if (typeof values[key] !== "string") throw new Error("Informations du véhicule invalides : rien n’a été modifié.");
    let value = values[key].trim();
    if (["bodyColor", "insurer", "policyNumber"].includes(key) && value.length > PROFILE_TEXT_LIMIT)
      throw new Error(`Ce champ dépasse ${PROFILE_TEXT_LIMIT} caractères : rien n’a été modifié.`);
    if (["insuranceExpiry", "purchaseDate"].includes(key) && value && !validProfileDate(value))
      throw new Error("Vérifiez la date saisie : rien n’a été modifié.");
    if (key === "purchaseAmount") value = normalizePurchaseAmount(value);
    if (key === "purchaseCurrency") {
      value = value.toUpperCase();
      if (value && !validCurrencyCode(value)) throw new Error("Indiquez un code de devise à trois lettres.");
    }
    next[key] = value;
  }
  if (!!next.purchaseAmount !== !!next.purchaseCurrency)
    throw new Error("Renseignez le prix d’achat et sa devise ensemble, ou laissez les deux champs vides.");
  const changed = PROFILE_FIELDS.filter((key) => next[key] !== info.fields[key]);
  if (!changed.length) return vehicle;
  const box = { ...(info.value || {}), version: 1 };
  const copied = new Set();
  for (const key of changed) {
    const path = pathByField[key];
    if (path.length === 1) {
      if (next[key]) box[path[0]] = next[key]; else delete box[path[0]];
      continue;
    }
    const [section, property] = path;
    if (!copied.has(section)) {
      // Copier seulement la section réellement éditée ; les autres restent intactes.
      box[section] = { ...(box[section] || {}) }; copied.add(section);
    }
    if (next[key]) box[section][property] = next[key]; else delete box[section][property];
  }
  return { ...vehicle, [VEHICLE_PROFILE_KEY]: box };
}
