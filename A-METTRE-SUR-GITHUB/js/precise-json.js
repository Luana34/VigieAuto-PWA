/*
 * Sauvegardes JSON : les nombres des champs que l'interface utilise restent des
 * Number. Les nombres d'extensions que Number arrondirait sont rangés dans un
 * Uint8Array interne, impossible à confondre avec une valeur issue de JSON.parse.
 * Ce marqueur est stockable par l'algorithme de clonage structuré d'IndexedDB et
 * est réécrit comme un jeton numérique JSON, jamais comme un tableau ou un texte.
 * La base IndexedDB est versionnée séparément pour empêcher une ancienne PWA de
 * lire ces marqueurs comme si elle connaissait leur représentation.
 */

const MAX_NUMBER_LENGTH = 1000;
const MAX_DEPTH = 256;
const MAGIC = [86, 65, 45, 78, 49, 58]; // « VA-N1: »
const NUMBER = /^(-?)(0|[1-9]\d*)(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/;
const NUMBER_AT = /-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/y;

// Champs lus comme nombres par les formulaires, les calculs ou le suivi GPS.
// À actualiser AVANT qu'une nouvelle fonction interprète un champ jusque-là inconnu.
const USED_NUMBERS = {
  vehicles: new Set(["year", "initialKm", "odometer"]),
  services: new Set(["odometer", "parts", "labor"]),
  fills: new Set(["odometer", "volume", "unitPrice", "total"]),
  trips: new Set(["distanceKm", "durationMin", "gpsDistanceM"]),
  expenses: new Set(["amount"]),
  reminders: new Set(["dueKm", "warnDays", "warnKm", "repeatDays", "repeatKm"]),
  symptoms: new Set(["odometer"]),
  checks: new Set(["odometer"]),
  documents: new Set(["size"]),
};

// Compare les valeurs décimales sans convertir le coefficient en Number. Les
// exposants immenses ne peuvent être confondus avec un Number fini non nul ici.
function decimalIdentity(token) {
  const m = NUMBER.exec(token);
  if (!m) return null;
  let digits = (m[2] + (m[3] || "")).replace(/^0+/, "");
  if (!digits) return m[1] ? "-zero" : "zero";
  let trailing = 0;
  while (digits.endsWith("0")) { digits = digits.slice(0, -1); trailing++; }
  const exponent = Number(m[4] || 0) - (m[3] || "").length + trailing;
  if (!Number.isSafeInteger(exponent)) return null;
  return `${m[1]}${digits}e${exponent}`;
}

/** Vrai si la valeur décimale et le signe de zéro survivent à Number → JSON. */
export function survivesNumber(token, { forUse = false } = {}) {
  if (typeof token !== "string" || token.length > MAX_NUMBER_LENGTH || !NUMBER.test(token)) return false;
  const n = Number(token);
  if (!Number.isFinite(n) || (forUse && Math.abs(n) > Number.MAX_SAFE_INTEGER)) return false;
  const original = decimalIdentity(token);
  const roundTrip = decimalIdentity(JSON.stringify(n));
  return original !== null && original === roundTrip;
}

/** Les formulaires acceptent aussi des écritures usuelles comme 0012 ou .5. */
export function survivesUserNumber(raw) {
  if (typeof raw !== "string" || raw.length > MAX_NUMBER_LENGTH) return false;
  const m = /^([+-]?)(?:(\d+)(?:\.(\d*))?|\.(\d+))(?:[eE]([+-]?\d+))?$/.exec(raw);
  if (!m) return false;
  const sign = m[1] === "-" ? "-" : "";
  const integer = (m[2] || "0").replace(/^0+(?=\d)/, "");
  const fraction = m[3] ?? m[4] ?? "";
  const normalized = sign + integer + (fraction ? `.${fraction}` : "") + (m[5] ? `e${m[5]}` : "");
  return survivesNumber(normalized, { forUse: true });
}

/** Addition décimale d'une échéance : ne jamais écrire une somme arrondie. */
export function addNumbersForUse(a, b) {
  const fail = () => { throw new Error("La prochaine échéance est trop précise ou trop grande pour être enregistrée sans arrondi."); };
  if (![a, b].every((x) => typeof x === "number" && Number.isFinite(x) && x >= 0 && x <= Number.MAX_SAFE_INTEGER)) fail();
  const parts = (n) => {
    const m = NUMBER.exec(JSON.stringify(n));
    return { digits: (m[2] + (m[3] || "")).replace(/^0+(?=\d)/, ""), exp: Number(m[4] || 0) - (m[3] || "").length };
  };
  const x = parts(a), y = parts(b), exponent = Math.min(x.exp, y.exp);
  const left = x.digits + "0".repeat(x.exp - exponent), right = y.digits + "0".repeat(y.exp - exponent);
  let i = left.length - 1, j = right.length - 1, carry = 0, sum = "";
  while (i >= 0 || j >= 0 || carry) {
    const n = (i >= 0 ? left.charCodeAt(i--) - 48 : 0) + (j >= 0 ? right.charCodeAt(j--) - 48 : 0) + carry;
    sum = String(n % 10) + sum;
    carry = Math.floor(n / 10);
  }
  const token = `${sum.replace(/^0+(?=\d)/, "")}e${exponent}`;
  if (!survivesNumber(token, { forUse: true })) fail();
  return Number(token);
}

function knownNumber(path, root) {
  if (path.length === 1 && path[0] === "formatVersion") return true;
  if (path.length !== 4 || path[0] !== "data" || typeof path[2] !== "number") return false;
  const [, collection, index, field] = path;
  if (USED_NUMBERS[collection]?.has(field)) return true;
  if (collection === "settings") {
    const id = root?.data?.settings?.[index]?.id;
    if (id === "vehicleSuggestions" && field === "version") return true;
    if (["theme", "activeVehicle", "defaultsSeeded"].includes(id) && field === "value") return true;
  }
  return false;
}

function encodeNumber(token) {
  const bytes = new Uint8Array(MAGIC.length + token.length);
  bytes.set(MAGIC);
  for (let i = 0; i < token.length; i++) bytes[MAGIC.length + i] = token.charCodeAt(i);
  return bytes;
}

function decodeNumber(bytes) {
  if (!(bytes instanceof Uint8Array) || bytes.length <= MAGIC.length ||
      bytes.length > MAGIC.length + MAX_NUMBER_LENGTH ||
      MAGIC.some((byte, i) => bytes[i] !== byte)) {
    throw new Error("Une valeur interne de la sauvegarde est illisible. Export annulé ; les données restent sur cet appareil.");
  }
  let token = "";
  for (let i = MAGIC.length; i < bytes.length; i++) token += String.fromCharCode(bytes[i]);
  if (!NUMBER.test(token)) throw new Error("Un nombre interne est invalide. Export annulé ; les données restent sur cet appareil.");
  return token;
}

/**
 * JSON.parse assure d'abord la validité grammaticale. Une seconde lecture
 * itérative associe les jetons numériques originaux aux valeurs, détecte les
 * clés répétées et refuse les valeurs utilisées qui seraient arrondies.
 */
export function parseBackupJson(text) {
  const root = JSON.parse(text);
  const holder = { root };
  const stack = [];
  let i = 0;
  const whitespace = () => { while (i < text.length && /[\t\n\r ]/.test(text[i])) i++; };
  const string = (read) => {
    const start = i++;
    while (i < text.length) {
      const quote = text.indexOf('"', i);
      if (quote < 0) throw new SyntaxError("Chaîne JSON incomplète.");
      let backslashes = 0;
      for (let j = quote - 1; j >= start && text[j] === "\\"; j--) backslashes++;
      i = quote + 1;
      if (backslashes % 2 === 0) return read ? JSON.parse(text.slice(start, i)) : undefined;
    }
    throw new SyntaxError("Chaîne JSON incomplète.");
  };
  const value = (parent, key, path) => {
    whitespace();
    const c = text[i];
    if (c === "{" || c === "[") {
      if (stack.length >= MAX_DEPTH) throw new Error("Sauvegarde trop profondément imbriquée ; import annulé, aucune donnée remplacée.");
      i++;
      stack.push(c === "{" ? { kind: "object", value: parent[key], path, keys: new Set(), state: "value" }
                           : { kind: "array", value: parent[key], path, index: 0, state: "value" });
    } else if (c === '"') string(false);
    else if (c === "t") i += 4;
    else if (c === "f") i += 5;
    else if (c === "n") i += 4;
    else {
      NUMBER_AT.lastIndex = i;
      const match = NUMBER_AT.exec(text);
      if (!match) throw new SyntaxError("Nombre JSON invalide.");
      const token = match[0];
      i = NUMBER_AT.lastIndex;
      if (token.length > MAX_NUMBER_LENGTH)
        throw new Error(`Un nombre dépasse ${MAX_NUMBER_LENGTH} caractères ; import annulé, aucune donnée remplacée.`);
      if (knownNumber(path, root)) {
        if (!survivesNumber(token, { forUse: true })) {
          const location = path.length === 1 ? "version de sauvegarde" : `${path[1]}.${path[3]}`;
          throw new Error(`La valeur numérique ${location} est trop précise ou trop grande pour être utilisée sans arrondi. Import annulé ; conservez le fichier original.`);
        }
      } else if (!survivesNumber(token)) {
        // DefineProperty évite tout comportement spécial du nom « __proto__ ».
        Object.defineProperty(parent, key, { value: encodeNumber(token), enumerable: true, configurable: true, writable: true });
      }
    }
  };

  value(holder, "root", []);
  while (stack.length) {
    const frame = stack[stack.length - 1];
    whitespace();
    const c = text[i];
    if (frame.state === "separator") {
      if (c === ",") { i++; frame.state = "value"; continue; }
      if ((frame.kind === "object" && c === "}") || (frame.kind === "array" && c === "]")) {
        i++; stack.pop(); continue;
      }
      throw new SyntaxError("Séparateur JSON invalide.");
    }
    if ((frame.kind === "object" && c === "}") || (frame.kind === "array" && c === "]")) {
      i++; stack.pop(); continue;
    }
    if (frame.kind === "object") {
      if (c !== '"') throw new SyntaxError("Clé JSON invalide.");
      const key = string(true);
      if (frame.keys.has(key)) throw new Error("Une propriété JSON est répétée ; import annulé, aucune donnée remplacée.");
      frame.keys.add(key);
      whitespace();
      if (text[i++] !== ":") throw new SyntaxError("Propriété JSON invalide.");
      frame.state = "separator";
      value(frame.value, key, frame.path.concat(key));
    } else {
      const index = frame.index++;
      frame.state = "separator";
      value(frame.value, index, frame.path.concat(index));
    }
  }
  whitespace();
  if (i !== text.length) throw new SyntaxError("Contenu supplémentaire après le JSON.");
  return holder.root;
}

/** Sérialise le snapshot, en refusant les valeurs internes inconnues au lieu de les effacer. */
export function stringifyBackupJson(root) {
  const ancestors = new Set();
  const serialize = (item, path, depth, arrayItem = false) => {
    if (item === null) return "null";
    if (typeof item === "string" || typeof item === "boolean") return JSON.stringify(item);
    if (typeof item === "number") {
      if (!Number.isFinite(item)) throw new Error("Un nombre enregistré n’est pas fini. Export annulé ; les données restent sur cet appareil.");
      if (Object.is(item, -0)) return "-0";
      return JSON.stringify(item);
    }
    if (item === undefined || typeof item === "function" || typeof item === "symbol") return arrayItem ? "null" : undefined;
    if (item instanceof Uint8Array) {
      if (knownNumber(path, root)) throw new Error("Un nombre utilisé par l’application est illisible. Export annulé ; les données restent sur cet appareil.");
      return decodeNumber(item);
    }
    if (typeof item !== "object") throw new Error("Une valeur enregistrée ne peut pas être exportée en JSON.");
    if (depth > MAX_DEPTH || ancestors.has(item)) throw new Error("Sauvegarde trop imbriquée ou circulaire. Export annulé.");
    const isArray = Array.isArray(item);
    const prototype = Object.getPrototypeOf(item);
    if (!isArray && prototype !== Object.prototype && prototype !== null)
      throw new Error("Une valeur interne inconnue ne peut pas être exportée sans risque.");
    ancestors.add(item);
    const indent = "  ".repeat(depth), nextIndent = "  ".repeat(depth + 1);
    let output;
    if (isArray) {
      const elements = Array.from({ length: item.length }, (_, index) => serialize(item[index], path.concat(index), depth + 1, true));
      output = elements.length ? `[\n${nextIndent}${elements.join(`,\n${nextIndent}`)}\n${indent}]` : "[]";
    } else {
      const fields = [];
      for (const key of Object.keys(item)) {
        const encoded = serialize(item[key], path.concat(key), depth + 1);
        if (encoded !== undefined) fields.push(`${JSON.stringify(key)}: ${encoded}`);
      }
      output = fields.length ? `{\n${nextIndent}${fields.join(`,\n${nextIndent}`)}\n${indent}}` : "{}";
    }
    ancestors.delete(item);
    return output;
  };
  const result = serialize(root, [], 0);
  if (result === undefined) throw new Error("Sauvegarde vide ; export annulé.");
  return result;
}
