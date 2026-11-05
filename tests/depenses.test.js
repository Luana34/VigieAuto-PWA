import test from "node:test";
import assert from "node:assert/strict";
import { EXPENSE_CATEGORIES } from "../js/data.js";
import { spending } from "../js/calc.js";

test("les catégories de dépenses historiques et demandées restent reconnues", () => {
  assert.deepEqual(EXPENSE_CATEGORIES, {
    entretien: "Entretien", carburant: "Carburant", assurance: "Assurance", taxes: "Taxes", peage: "Péage",
    stationnement: "Stationnement", lavage: "Lavage", pieces: "Accessoires / pièces", amende: "Amende",
    controle: "Contrôle technique", autre: "Autre",
  });
});

test("les saisies séparées ne sont pas automatiquement liées ni dédoublonnées", () => {
  const result = spending({ fills: [{total:30}], services: [{parts:4,labor:6}], expenses: [{category:"carburant",amount:30}] });
  assert.deepEqual(result, {fuel:30, service:10, other:30, total:70});
});
