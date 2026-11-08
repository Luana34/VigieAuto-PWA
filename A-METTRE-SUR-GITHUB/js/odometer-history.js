/* Historique kilométrique : corrections manuelles stockées séparément et
 * relevés consultés à la demande dans leurs sources. Aucun doublon de plein,
 * entretien ou contrôle ; aucun relevé ancien reconstruit ou inventé. */
import { stringifyBackupJson } from './precise-json.js';

export const CORRECTION_STORE = 'odometerCorrections';
export const ODOMETER_HISTORY_KEY = 'vigieOdometerCorrections';
export const ODOMETER_HISTORY_VERSION = 1;
export const MAX_CORRECTIONS = 2048;
export const CORRECTION_TEXT_LIMIT = 500;
const own = (x, k) => Object.prototype.hasOwnProperty.call(x, k);
const object = x => x !== null && typeof x === 'object' && !Array.isArray(x) && !(x instanceof Uint8Array);

export function validOdometerDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  if (year < 100) return false;
  const result = new Date(Date.UTC(year, month - 1, day));
  return result.getUTCFullYear() === year && result.getUTCMonth() === month - 1 && result.getUTCDate() === day;
}
export function validOdometerNumber(value) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 &&
    !Object.is(value, -0) && value <= Number.MAX_SAFE_INTEGER;
}
function validInstant(value) {
  if (typeof value !== 'string' || value.length > 40) return false;
  const match = /^\d{4}-\d{2}-\d{2}T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,3})?Z$/.exec(value);
  return !!match && Number(match[1]) <= 23 && Number(match[2]) <= 59 && Number(match[3]) <= 59 &&
    Number.isFinite(Date.parse(value)) && validOdometerDate(value.slice(0, 10));
}
function optionalText(obj, key) {
  return !own(obj, key) || obj[key] === null ||
    (typeof obj[key] === 'string' && obj[key].length <= CORRECTION_TEXT_LIMIT);
}
export function validCorrection(entry) {
  return object(entry) && typeof entry.id === 'string' && entry.id.length > 0 && entry.id.length <= 200 &&
    validOdometerDate(entry.date) && validInstant(entry.recordedAt) &&
    validOdometerNumber(entry.before) && validOdometerNumber(entry.after) &&
    optionalText(entry, 'reason') && optionalText(entry, 'actor');
}
export const correctionKey = (vehicleId, entryId) => JSON.stringify([vehicleId, entryId]);

/** Les formats non reconnus restent intacts dans le véhicule, sans conversion. */
export function inspectOdometerHistory(vehicle) {
  if (!object(vehicle) || typeof vehicle.id !== 'string' || !vehicle.id) return { state: 'unsupported' };
  if (!own(vehicle, ODOMETER_HISTORY_KEY)) return { state: 'absent' };
  const history = vehicle[ODOMETER_HISTORY_KEY];
  if (!object(history) || history.version !== ODOMETER_HISTORY_VERSION || !Array.isArray(history.entries) ||
      history.entries.length > MAX_CORRECTIONS) return { state: 'unsupported' };
  const ids = new Set();
  for (const entry of history.entries) {
    if (!validCorrection(entry) || ids.has(entry.id)) return { state: 'unsupported' };
    ids.add(entry.id);
  }
  return { state: 'valid', history };
}

/** Transforme un véhicule du pont JSON en véhicule local et lignes distinctes.
 * Le conteneur vide conserve ses propriétés futures ; une extension inconnue
 * reste intégralement dans le véhicule, sans suppression ou interprétation. */
export function splitWireVehicle(vehicle) {
  const info = inspectOdometerHistory(vehicle);
  if (info.state !== 'valid') return { vehicle, rows: [] };
  const rows = info.history.entries.map((entry, order) => ({
    id: correctionKey(vehicle.id, entry.id), vehicleId: vehicle.id, order, entry,
  }));
  return { vehicle: { ...vehicle, [ODOMETER_HISTORY_KEY]: { ...info.history, entries: [] } }, rows };
}
export function splitWireRecords(data) {
  if (!object(data) || !Array.isArray(data.vehicles) || own(data, CORRECTION_STORE))
    throw new Error('Structure du carnet kilométrique invalide ; import annulé.');
  const rows = [];
  const vehicles = data.vehicles.map(vehicle => {
    const split = splitWireVehicle(vehicle);
    rows.push(...split.rows);
    return split.vehicle;
  });
  return { ...data, vehicles, [CORRECTION_STORE]: rows };
}
function validLocalRow(row) {
  return object(row) && typeof row.vehicleId === 'string' && row.vehicleId.length > 0 &&
    validCorrection(row.entry) && row.id === correctionKey(row.vehicleId, row.entry.id) &&
    Number.isSafeInteger(row.order) && row.order >= 0;
}

/** Reconstruit le seul objet de sauvegarde. Refuse un état local incohérent
 * au lieu d’exporter une archive incomplète ou d’effacer une extension. */
export function mergeWireRecords(records) {
  if (!object(records) || !Array.isArray(records.vehicles) || !Array.isArray(records[CORRECTION_STORE]))
    throw new Error('Historique kilométrique indisponible ; export annulé.');
  const vehiclesById = new Map();
  for (const vehicle of records.vehicles) {
    if (!object(vehicle) || typeof vehicle.id !== 'string' || !vehicle.id || vehiclesById.has(vehicle.id))
      throw new Error('Véhicule incohérent ; export annulé.');
    vehiclesById.set(vehicle.id, vehicle);
  }
  const grouped = new Map(), seenKeys = new Set();
  for (const row of records[CORRECTION_STORE]) {
    if (!validLocalRow(row) || !vehiclesById.has(row.vehicleId) || seenKeys.has(row.id))
      throw new Error('Correction kilométrique incohérente ; export annulé sans perte.');
    seenKeys.add(row.id);
    if (!grouped.has(row.vehicleId)) grouped.set(row.vehicleId, []);
    grouped.get(row.vehicleId).push(row);
  }
  const vehicles = records.vehicles.map(vehicle => {
    const rows = grouped.get(vehicle.id) || [];
    if (!rows.length) return vehicle;
    const info = inspectOdometerHistory(vehicle);
    if (info.state !== 'valid' || info.history.entries.length !== 0 || rows.length > MAX_CORRECTIONS)
      throw new Error('Historique kilométrique non reconnu ou trop volumineux ; export annulé sans perte.');
    const positions = new Set();
    for (const row of rows) {
      if (positions.has(row.order)) throw new Error('Ordre des corrections incohérent ; export annulé.');
      positions.add(row.order);
    }
    const entries = [...rows].sort((a, b) => a.order - b.order || a.id.localeCompare(b.id)).map(row => row.entry);
    return { ...vehicle, [ODOMETER_HISTORY_KEY]: { ...info.history, entries } };
  });
  const result = { ...records, vehicles };
  delete result[CORRECTION_STORE];
  return result;
}

/** Prépare une correction volontaire sans modifier les arguments. */
export function prepareManualCorrection(expected, changedVehicle, existingRows, { id, date, recordedAt, reason = '', actor = '' }) {
  if (!object(expected) || !object(changedVehicle) || expected.id !== changedVehicle.id || !Array.isArray(existingRows))
    throw new Error('Véhicule ou historique périmé ; rouvrez le formulaire.');
  if (!validOdometerNumber(expected.odometer) || !validOdometerNumber(changedVehicle.odometer))
    throw new Error('Ce kilométrage ne peut pas être utilisé sans risque d’arrondi. Les données restent inchangées.');
  if (expected.odometer === changedVehicle.odometer) return { vehicle: changedVehicle, row: null };
  const info = inspectOdometerHistory(expected);
  if (info.state === 'unsupported' || (info.state === 'valid' && info.history.entries.length !== 0))
    throw new Error('Historique d’une autre version ou non reconnu : la correction est bloquée pour préserver les données.');
  if (typeof reason !== 'string' || typeof actor !== 'string' || reason.length > CORRECTION_TEXT_LIMIT || actor.length > CORRECTION_TEXT_LIMIT)
    throw new Error(`Motif ou personne trop long : maximum ${CORRECTION_TEXT_LIMIT} caractères.`);
  if (!reason.trim()) throw new Error('Indiquez le motif de la correction.');
  const entry = { id, date, recordedAt, before: expected.odometer, after: changedVehicle.odometer, reason:reason.trim(), actor:actor.trim() };
  if (!validCorrection(entry)) throw new Error('Correction kilométrique invalide ; rien n’a été enregistré.');
  const rows = existingRows.filter(row => row.vehicleId === expected.id);
  if (rows.length >= MAX_CORRECTIONS) throw new Error(`Cet historique atteint ${MAX_CORRECTIONS} corrections. Aucune donnée n’a été supprimée.`);
  const order = rows.reduce((maximum, row) => Math.max(maximum, row.order), -1) + 1;
  const row = { id: correctionKey(expected.id, id), vehicleId: expected.id, order, entry };
  const shell = info.state === 'valid' ? info.history : { version: ODOMETER_HISTORY_VERSION, entries: [] };
  const vehicle = { ...changedVehicle, [ODOMETER_HISTORY_KEY]: shell };
  const wire = mergeWireRecords({ vehicles: [vehicle], [CORRECTION_STORE]: [...rows, row] }).vehicles[0];
  const text = stringifyBackupJson({ data: { vehicles: [wire] } });
  if (text.length > 16 * 1024 * 1024 - 4096 || new TextEncoder().encode(text).length > 32 * 1024 * 1024 - 4096)
    throw new Error('Le véhicule deviendrait trop volumineux pour une sauvegarde compatible ; rien n’a été enregistré.');
  return { vehicle, row };
}

/** Chronologie des données disponibles. Même jour = ordre indéterminé ; ne
 * signaler une baisse que lorsqu’elle est certaine entre jours distincts. */
export function buildOdometerTimeline(records, vehicleId) {
  const vehicle = Array.isArray(records?.vehicles) ? records.vehicles.find(v => v.id === vehicleId) : null;
  if (!vehicle) throw new Error('Ce véhicule n’existe plus.');
  const info = inspectOdometerHistory(vehicle), entries = [];
  let omitted = 0;
  const append = (kind, record, title, detail = '', optional = false) => {
    if (record.vehicleId !== vehicleId) return;
    if (optional && (record.odometer === null || record.odometer === undefined)) return;
    if (!validOdometerDate(record.date) || !validOdometerNumber(record.odometer) || typeof record.id !== 'string') { omitted++; return; }
    entries.push({ kind, id: record.id, date: record.date, km: record.odometer, title, detail, anomaly: false });
  };
  for (const x of records.fills || []) {
    const unit = x.unit === 'kWh' ? 'Recharge' : 'Plein';
    const fuel = typeof x.vigieFuelSubtype === 'string' ? x.vigieFuelSubtype : '';
    append('fill', x, unit, [fuel, x.full === false ? 'Partiel' : x.full === true ? 'Complet' : ''].filter(Boolean).join(' · '));
  }
  for (const x of records.services || []) append('service', x, 'Entretien', typeof x.title === 'string' ? x.title : '');
  for (const x of records.checks || []) append('check', x, 'Contrôle CQ', typeof x.templateName === 'string' ? x.templateName : '');
  for (const x of records.symptoms || []) append('symptom', x, 'Symptôme', typeof x.title === 'string' ? x.title : '');
  for (const x of records.expenses || []) append('expense', x, 'Dépense', typeof x.title === 'string' ? x.title : '', true);
  const rows = records[CORRECTION_STORE] || [];
  for (const row of rows) {
    if (row.vehicleId !== vehicleId) continue;
    if (!validLocalRow(row) || info.state !== 'valid' || info.history.entries.length !== 0) { omitted++; continue; }
    entries.push({ kind: 'correction', id: row.id, date: row.entry.date, km: row.entry.after,
      before: row.entry.before, reason: row.entry.reason || '', actor: row.entry.actor || '',
      title: 'Correction manuelle', detail: '', anomaly: false, row });
  }
  const groups = new Map();
  for (const entry of entries) {
    if (!groups.has(entry.date)) groups.set(entry.date, []);
    groups.get(entry.date).push(entry);
  }
  let previousMinimum = null;
  for (const date of [...groups.keys()].sort()) {
    const group = groups.get(date);
    const hasDeliberateDecrease = group.some(x => x.kind === 'correction' && x.km < x.before);
    if (previousMinimum !== null && !hasDeliberateDecrease)
      for (const entry of group) if (entry.kind !== 'correction' && entry.km < previousMinimum) entry.anomaly = true;
    previousMinimum = group.reduce((minimum, entry) => Math.min(minimum, entry.km), Infinity);
  }
  entries.sort((a,b) => b.date.localeCompare(a.date) || a.kind.localeCompare(b.kind) || a.id.localeCompare(b.id));
  return { entries, omitted, historyState: info.state,
    unsplit: info.state === 'valid' && info.history.entries.length > 0 };
}
