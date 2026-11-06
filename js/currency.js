// Une devise est une unité, pas un taux de change. Aucune conversion automatique.
// Les anciennes opérations sans affectation restent en euros.
export const CURRENCY_STORE = "currencyAssignments";
export const DEFAULT_CURRENCY = "EUR";
export const MAX_CURRENCIES = 32; // euro compris, pour toute la base
export const CURRENCY_COLLECTIONS = Object.freeze(["expenses", "fills", "services"]);
export const CURRENCY_CHOICES = Object.freeze({
  EUR: "Euro (€)", CHF: "Franc suisse (CHF)", GBP: "Livre sterling (GBP)",
  USD: "Dollar américain (USD)", CAD: "Dollar canadien (CAD)", AUD: "Dollar australien (AUD)",
  JPY: "Yen japonais (JPY)", MAD: "Dirham marocain (MAD)", DZD: "Dinar algérien (DZD)", TND: "Dinar tunisien (TND)",
  XOF: "Franc CFA Afrique de l’Ouest (XOF)", XAF: "Franc CFA Afrique centrale (XAF)",
});
export const validCurrencyCode = (code) => typeof code === "string" && /^[A-Z]{3}$/.test(code);
// Le préfixe qualifié évite les collisions entre un plein et une dépense de même ID.
export const currencyAssignmentId = (id, collection = "expenses") => `${collection}:${id}`;
export const compareCurrency = (a, b) => a === b ? 0 : a === "EUR" ? -1 : b === "EUR" ? 1 : a.localeCompare(b, "en");

// Les associations sont une collection distincte : une vieille extension appelée
// « currency » dans une opération n’est jamais interprétée comme devise.
export function indexCurrencyAssignments(assignments) {
  if (!Array.isArray(assignments)) throw new Error("Affectations de devises invalides.");
  const result = new Map(), currencies = new Set([DEFAULT_CURRENCY]);
  for (const x of assignments) {
    if (!x || typeof x !== "object" || Array.isArray(x) || !CURRENCY_COLLECTIONS.includes(x.collection) ||
        typeof x.recordId !== "string" || !x.recordId || x.id !== currencyAssignmentId(x.recordId, x.collection) ||
        !validCurrencyCode(x.currency) || result.has(x.id))
      throw new Error("Affectation de devise invalide ou non prise en charge ; aucune donnée remplacée.");
    result.set(x.id, x);
    currencies.add(x.currency);
    if (currencies.size > MAX_CURRENCIES) throw new Error(`Plus de ${MAX_CURRENCIES} devises : données non prises en charge.`);
  }
  return result;
}
export function currencyOf(index, recordId, collection = "expenses") {
  return index.get(currencyAssignmentId(recordId, collection))?.currency ?? DEFAULT_CURRENCY;
}
export function validateCurrencyAssignments(assignments, records) {
  // Un tableau seul désigne l’ancien contrat de dépenses v4.
  const data = Array.isArray(records) ? {expenses: records, fills: [], services: []} : records;
  const index = indexCurrencyAssignments(assignments);
  const ids = Object.fromEntries(CURRENCY_COLLECTIONS.map((name) => [name, new Set((data?.[name] || []).map((x) => x.id))]));
  for (const value of index.values()) {
    if (!ids[value.collection].has(value.recordId))
      throw new Error("Devise associée à une opération absente ; import annulé.");
  }
  return index;
}
export function spendingByCurrency(records, index) {
  const groups = new Map();
  const get = (code) => {
    if (!groups.has(code)) groups.set(code, { currency: code, fuel: 0, service: 0, other: 0, total: 0 });
    return groups.get(code);
  };
  for (const x of records.fills) get(currencyOf(index, x.id, "fills")).fuel += Number(x.total) || 0;
  for (const x of records.services) get(currencyOf(index, x.id, "services")).service += (Number(x.parts) || 0) + (Number(x.labor) || 0);
  for (const x of records.expenses) get(currencyOf(index, x.id, "expenses")).other += Number(x.amount) || 0;
  if (!groups.size) get("EUR");
  return [...groups.values()].map((g) => ({ ...g, total: g.fuel + g.service + g.other }))
    .sort((a, b) => compareCurrency(a.currency, b.currency));
}
export function expenseTotalsByCurrency(expenses, index) {
  return spendingByCurrency({ fills: [], services: [], expenses }, index)
    .map(({ currency, other }) => ({ currency, total: other }));
}
