// Fonctions pures de calcul et de formatage.
export const REMINDER_MONTHS_KEY = "vigieReminderMonths";
export const REMINDER_MONTHS_MAX = 1200;
const REMINDER_GUARD_FIELDS = [
  "vehicleId",
  "dueDate",
  "dueKm",
  "repeatDays",
  "repeatKm",
  "active",
];

function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}
function daysInCalendarMonth(year, month) {
  if (month === 2) return isLeapYear(year) ? 29 : 28;
  return month === 4 || month === 6 || month === 9 || month === 11 ? 30 : 31;
}
export function isCalendarDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return false;
  const [y, m, d] = value.split("-").map(Number);
  return (
    y >= 100 &&
    y <= 9999 &&
    m >= 1 &&
    m <= 12 &&
    d >= 1 &&
    d <= daysInCalendarMonth(y, m)
  );
}
export function addMonths(value, n) {
  if (!isCalendarDate(value)) return "";
  const months = Number(n);
  if (!Number.isInteger(months) || months < 1 || months > REMINDER_MONTHS_MAX)
    return "";
  const [y, m, d] = value.split("-").map(Number);
  const total = y * 12 + (m - 1) + months;
  const ny = Math.floor(total / 12);
  const nm = (total % 12) + 1;
  if (ny < 100 || ny > 9999) return "";
  const nd = Math.min(d, daysInCalendarMonth(ny, nm));
  return `${String(ny).padStart(4, "0")}-${String(nm).padStart(2, "0")}-${String(nd).padStart(2, "0")}`;
}

export const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
export function addDays(value, n) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return "";
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + Number(n)));
  return date.toISOString().slice(0, 10);
}
export function dayDiff(to, from = today()) {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(to || "") ||
    !/^\d{4}-\d{2}-\d{2}$/.test(from || "")
  )
    return null;
  const utc = (s) => {
    const [y, m, d] = s.split("-").map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((utc(to) - utc(from)) / 86400000);
}
export const number = (v, digits = 0) =>
  Number.isFinite(Number(v))
    ? new Intl.NumberFormat("fr-FR", {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      }).format(Number(v))
    : "—";
export const money = (v) => `${number(v, 2)} €`;
export const shortDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}/.test(value || "")) return "—";
  const [y, m, d] = value.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
};
export function prettyDate(
  value,
  opts = { day: "numeric", month: "long", year: "numeric" },
) {
  if (!/^\d{4}-\d{2}-\d{2}/.test(value || "")) return "—";
  const [y, m, d] = value.slice(0, 10).split("-").map(Number);
  return new Intl.DateTimeFormat("fr-FR", opts).format(new Date(y, m - 1, d));
}
export function fillIntervals(fills, targetUnit = null, currencyForFill = () => "EUR") {
  // Deux pleins complets délimitent un intervalle ; les pleins partiels intercalés y contribuent.
  // En cas de changement d'énergie, ne jamais additionner des litres et des kWh.
  const ordered = [...fills].sort(
    (a, b) =>
      (a.date || "").localeCompare(b.date || "") ||
      Number(a.odometer || 0) - Number(b.odometer || 0) ||
      (a.createdAt || "").localeCompare(b.createdAt || ""),
  );
  const byId = Object.create(null);
  let anchor = null,
    litres = 0,
    costs = new Map(),
    lastKm = null,
    invalid = false;
  for (const f of ordered) {
    const km = Number(f.odometer),
      volume = Number(f.volume),
      amount = Number(f.total);
    const valid =
      Number.isFinite(km) &&
      km >= 0 &&
      Number.isFinite(volume) &&
      volume > 0 &&
      Number.isFinite(amount) &&
      amount >= 0;
    if (!anchor) {
      if (f.full && valid) {
        anchor = f;
        lastKm = km;
      }
      continue;
    }
    if (!valid || km < lastKm || (f.unit || "L") !== (anchor.unit || "L"))
      invalid = true;
    if (valid) {
      litres += volume;
      const code = currencyForFill(f);
      if (typeof code !== "string" || !/^[A-Z]{3}$/.test(code)) invalid = true;
      else costs.set(code, (costs.get(code) || 0) + amount);
      lastKm = km;
    }
    if (f.full) {
      const distance = km - Number(anchor.odometer);
      if (!invalid && distance > 0) {
        // Jamais additionner les montants de devises différentes, même temporairement.
        const currency = costs.size === 1 ? costs.keys().next().value : null;
        const cost = currency === null ? null : costs.get(currency);
        byId[f.id] = {
          distance, volume: litres, cost, currency,
          consumption: (litres * 100) / distance,
          costPerKm: cost === null ? null : cost / distance,
          unit: f.unit || "L",
        };
      }
      anchor = valid ? f : null;
      lastKm = valid ? km : null;
      litres = 0;
      costs = new Map();
      invalid = false;
    }
  }
  const intervals = Object.values(byId).filter(
    (x) => !targetUnit || x.unit === targetUnit,
  );
  const distance = intervals.reduce((s, x) => s + x.distance, 0);
  const volume = intervals.reduce((s, x) => s + x.volume, 0);
  return {
    byId,
    intervals,
    distance,
    volume,
    average: distance ? (volume * 100) / distance : null,
  };
}
// Coût énergétique moyen au km sur les seuls intervalles de pleins complets valides.
// Les litres et kWh ne sont jamais mélangés ; ce n’est pas une mesure par trajet.
export function energyCostSummary(fills, unit, currencyForFill = () => "EUR") {
  const summary = fillIntervals(fills, unit, currencyForFill);
  if (!summary.distance || summary.intervals.some((x) => x.cost === null || !x.currency)) return null;
  const codes = new Set(summary.intervals.map((x) => x.currency));
  if (codes.size !== 1) return null; // pas de moyenne entre plusieurs devises
  return { value: summary.intervals.reduce((total, interval) => total + interval.cost, 0) / summary.distance,
    currency: codes.values().next().value };
}
export function averageEnergyCostPerKm(fills, unit, currencyForFill = () => "EUR") {
  return energyCostSummary(fills, unit, currencyForFill)?.value ?? null;
}

function isPlainJsonObject(value) {
  return (
    Boolean(value) &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    !(value instanceof Uint8Array)
  );
}
function validGuardValue(name, value) {
  if (value === null) return name !== "vehicleId" && name !== "active";
  if (name === "vehicleId")
    return typeof value === "string" && value.trim().length > 0 && value.length <= 4096;
  if (name === "dueDate") return typeof value === "string" && value.length <= 64;
  if (name === "active") return typeof value === "boolean";
  return typeof value === "number" && Number.isFinite(value) && !Object.is(value, -0);
}
function recordGuardValue(record, name) {
  return Object.hasOwn(record, name) && record[name] !== undefined
    ? record[name]
    : null;
}
function sameGuardValue(name, recordValue, guardValue) {
  if (recordValue === null || guardValue === null) {
    if (recordValue === null && guardValue === null) return true;
    if (name !== "repeatDays" && name !== "repeatKm") return false;
    const present = recordValue === null ? guardValue : recordValue;
    return validGuardValue(name, present) && present === 0;
  }
  if (!validGuardValue(name, recordValue) || !validGuardValue(name, guardValue))
    return false;
  return recordValue === guardValue;
}
export function inspectReminderMonths(record) {
  if (
    !record ||
    typeof record !== "object" ||
    !Object.hasOwn(record, REMINDER_MONTHS_KEY)
  ) {
    return { status: "none", months: 0 };
  }
  const ext = record[REMINDER_MONTHS_KEY];
  if (!isPlainJsonObject(ext)) return { status: "unknown", months: 0 };
  if (
    ext.version !== 1 ||
    !Number.isInteger(ext.months) ||
    ext.months < 0 ||
    ext.months > REMINDER_MONTHS_MAX
  ) {
    return { status: "unknown", months: 0 };
  }
  const guard = ext.guard;
  if (!isPlainJsonObject(guard)) return { status: "unknown", months: 0 };
  for (const key of REMINDER_GUARD_FIELDS) {
    if (!Object.hasOwn(guard, key) || !validGuardValue(key, guard[key])) {
      return { status: "unknown", months: 0 };
    }
  }
  if (ext.months === 0) return { status: "disabled", months: 0 };
  const changed = REMINDER_GUARD_FIELDS.some(
    (key) => !sameGuardValue(key, recordGuardValue(record, key), guard[key]),
  );
  const days = recordGuardValue(record, "repeatDays");
  const daysAreZero = days === null || days === 0;
  const hasValidDate =
    typeof record.dueDate === "string" && isCalendarDate(record.dueDate);
  return {
    status: changed || !daysAreZero || !hasValidDate ? "review" : "ready",
    months: ext.months,
  };
}
export function withReminderMonths(record, months) {
  if (!Number.isInteger(months) || months < 0 || months > REMINDER_MONTHS_MAX) {
    throw new Error(
      `La récurrence en mois doit être un entier entre 0 et ${REMINDER_MONTHS_MAX}.`,
    );
  }
  const inspected = inspectReminderMonths(record);
  if (inspected.status === "unknown") {
    throw new Error(
      "Récurrence mensuelle d’une version inconnue : conservez ce rappel sans modifier ses échéances.",
    );
  }
  for (const key of REMINDER_GUARD_FIELDS) {
    if (!validGuardValue(key, recordGuardValue(record, key))) {
      throw new Error(
        "Les valeurs du rappel ne peuvent pas être protégées par une récurrence en mois.",
      );
    }
  }
  if (months > 0) {
    for (const key of ["dueKm", "repeatDays", "repeatKm"]) {
      const value = recordGuardValue(record, key);
      if (
        value !== null &&
        (!Number.isFinite(value) || Math.abs(value) > Number.MAX_SAFE_INTEGER)
      ) {
        throw new Error(
          "Une valeur numérique dépasse la précision exacte prise en charge pour la récurrence en mois.",
        );
      }
    }
  }
  const prevExt = isPlainJsonObject(record[REMINDER_MONTHS_KEY])
    ? record[REMINDER_MONTHS_KEY]
    : {};
  const prevGuard = isPlainJsonObject(prevExt.guard) ? prevExt.guard : {};
  const nextGuard = { ...prevGuard };
  for (const key of REMINDER_GUARD_FIELDS) {
    nextGuard[key] = recordGuardValue(record, key);
  }
  return {
    ...record,
    [REMINDER_MONTHS_KEY]: {
      ...prevExt,
      version: 1,
      months,
      guard: nextGuard,
    },
  };
}

export function reminderInfo(r, vehicle, nowDate = today()) {
  const monthInfo = inspectReminderMonths(r);
  if (monthInfo.status === "unknown") {
    return {
      days: null,
      km: null,
      overdue: false,
      soon: false,
      needsReview: true,
      unknownMonths: true,
      months: 0,
      status: "ok",
      label: "Récurrence d’une autre version · ouvrez le rappel",
    };
  }
  if (monthInfo.status === "review") {
    return {
      days: null,
      km: null,
      overdue: false,
      soon: false,
      needsReview: true,
      unknownMonths: false,
      months: monthInfo.months,
      status: "soon",
      label:
        r.active === false
          ? "Inactif · récurrence à vérifier · ouvrez le rappel"
          : "Récurrence à vérifier · ouvrez le rappel",
    };
  }
  const days = r.dueDate ? dayDiff(r.dueDate, nowDate) : null;
  const km =
    r.dueKm !== null && r.dueKm !== undefined && r.dueKm !== "" && vehicle
      ? Number(r.dueKm) - Number(vehicle.odometer || 0)
      : null;
  const wd = Number.isFinite(Number(r.warnDays)) ? Number(r.warnDays) : 30;
  const wk = Number.isFinite(Number(r.warnKm)) ? Number(r.warnKm) : 500;
  const overdue = (days !== null && days < 0) || (km !== null && km < 0);
  const soon = (days !== null && days <= wd) || (km !== null && km <= wk);
  const parts = [];
  if (days !== null)
    parts.push(
      days < 0
        ? `${number(Math.abs(days))} j de retard`
        : days === 0
          ? "Aujourd’hui"
          : `dans ${number(days)} j`,
    );
  if (km !== null)
    parts.push(
      km < 0
        ? `${number(Math.abs(km))} km de retard`
        : km === 0
          ? "au kilométrage prévu"
          : `dans ${number(km)} km`,
    );
  if (monthInfo.months > 0) parts.push(`tous les ${monthInfo.months} mois`);
  return {
    days,
    km,
    overdue,
    soon,
    needsReview: false,
    unknownMonths: false,
    months: monthInfo.months,
    status: overdue ? "overdue" : soon ? "soon" : "ok",
    label: parts.join(" · ") || "Sans échéance",
  };
}
export function spending(records) {
  const fuel = records.fills.reduce((s, x) => s + (Number(x.total) || 0), 0);
  const service = records.services.reduce(
    (s, x) => s + (Number(x.parts) || 0) + (Number(x.labor) || 0),
    0,
  );
  const other = records.expenses.reduce(
    (s, x) => s + (Number(x.amount) || 0),
    0,
  );
  return { fuel, service, other, total: fuel + service + other };
}
export function monthlySpending(records, count = 6) {
  const base = new Date();
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(
      base.getFullYear(),
      base.getMonth() - (count - 1 - i),
      1,
    );
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const starts = (x) => (x.date || "").startsWith(key);
    const amounts = spending({
      fills: records.fills.filter(starts),
      services: records.services.filter(starts),
      expenses: records.expenses.filter(starts),
    });
    return {
      key,
      label: new Intl.DateTimeFormat("fr-FR", { month: "short" })
        .format(d)
        .replace(".", ""),
      ...amounts,
    };
  });
}


