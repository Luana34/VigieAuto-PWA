// Les devises sont des unités, pas des taux de change. Aucune conversion.
// Les montants historiques sans affectation sont en euros.
export const CURRENCY_STORE = "currencyAssignments";
export const DEFAULT_CURRENCY = "EUR";
// Borne pour éviter des milliers de graphiques après import d'un fichier hostile.
export const MAX_CURRENCIES = 32;
export const CURRENCY_CHOICES = Object.freeze({
  EUR: "Euro (€)", CHF: "Franc suisse (CHF)", GBP: "Livre sterling (GBP)",
  USD: "Dollar américain (USD)", CAD: "Dollar canadien (CAD)", AUD: "Dollar australien (AUD)",
  JPY: "Yen japonais (JPY)", MAD: "Dirham marocain (MAD)", DZD: "Dinar algérien (DZD)", TND: "Dinar tunisien (TND)",
  XOF: "Franc CFA Afrique de l’Ouest (XOF)", XAF: "Franc CFA Afrique centrale (XAF)",
});
export const validCurrencyCode = (code) => typeof code === "string" && /^[A-Z]{3}$/.test(code);
export const currencyAssignmentId = (id) => `expenses:${id}`;
export const compareCurrency = (a, b) => a === b ? 0 : a === "EUR" ? -1 : b === "EUR" ? 1 : a.localeCompare(b, "en");

// Cette collection séparée évite d'interpréter comme devise une ancienne
// extension inconnue portant le même nom dans une dépense importée en v1–v3.
export function indexCurrencyAssignments(assignments) {
  if (!Array.isArray(assignments)) throw new Error("Affectations de devises invalides.");
  const result = new Map(), currencies = new Set([DEFAULT_CURRENCY]);
  for (const x of assignments) {
    if (!x || typeof x !== "object" || Array.isArray(x) || x.collection !== "expenses" ||
        typeof x.recordId !== "string" || !x.recordId || x.id !== currencyAssignmentId(x.recordId) ||
        !validCurrencyCode(x.currency) || result.has(x.recordId))
      throw new Error("Affectation de devise invalide ou non prise en charge ; aucune donnée remplacée.");
    result.set(x.recordId, x);
    currencies.add(x.currency);
    if (currencies.size > MAX_CURRENCIES) throw new Error(`Plus de ${MAX_CURRENCIES} devises : données non prises en charge.`);
  }
  return result;
}
export function currencyOf(index, expenseId) {
  return index.get(expenseId)?.currency ?? DEFAULT_CURRENCY;
}
export function validateCurrencyAssignments(assignments, expenses) {
  const index = indexCurrencyAssignments(assignments), ids = new Set(expenses.map((x) => x.id));
  for (const id of index.keys()) if (!ids.has(id)) throw new Error("Devise associée à une dépense absente ; import annulé.");
  return index;
}
// Les pleins et interventions restent pour l'instant en euros. Seules les
// dépenses peuvent changer d'unité ; leur montant n'est jamais converti.
export function spendingByCurrency(records, index) {
  const groups = new Map();
  const get = (code) => {
    if (!groups.has(code)) groups.set(code, { currency: code, fuel: 0, service: 0, other: 0, total: 0 });
    return groups.get(code);
  };
  for (const x of records.fills) get("EUR").fuel += Number(x.total) || 0;
  for (const x of records.services) get("EUR").service += (Number(x.parts) || 0) + (Number(x.labor) || 0);
  for (const x of records.expenses) get(currencyOf(index, x.id)).other += Number(x.amount) || 0;
  if (!groups.size) get("EUR");
  return [...groups.values()].map((g) => ({ ...g, total: g.fuel + g.service + g.other }))
    .sort((a, b) => compareCurrency(a.currency, b.currency));
}
export function expenseTotalsByCurrency(expenses, index) {
  const groups = spendingByCurrency({ fills: [], services: [], expenses }, index);
  return groups.map(({ currency, other }) => ({ currency, total: other }));
}
