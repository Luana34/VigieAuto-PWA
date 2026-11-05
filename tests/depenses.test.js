import test from "node:test";
import assert from "node:assert/strict";
import { EXPENSE_CATEGORIES, expenseMileage } from "../js/data.js";
import { parseBackupJson, stringifyBackupJson } from "../js/precise-json.js";
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

test("kilométrage de dépense facultatif et valeurs futures non interprétées", () => {
  assert.deepEqual(expenseMileage({}), {editable:true,input:"",display:""});
  assert.deepEqual(expenseMileage({odometer:null}), {editable:true,input:"",display:""});
  assert.deepEqual(expenseMileage({odometer:0}), {editable:true,input:"0",display:"0"});
  assert.deepEqual(expenseMileage({odometer:1234.5}), {editable:true,input:"1234.5",display:"1234,5"});
  for (const value of [{format:"future"},new Uint8Array([86,65]),"1234",-1,-0,Infinity,Number.MAX_SAFE_INTEGER+1])
    assert.equal(expenseMileage({odometer:value}).editable,false);
});

test("un kilométrage importé trop précis reste exact sans devenir éditable", () => {
  const raw='{"data":{"expenses":[{"odometer":12345678901234567890.125}]}}';
  const backup=parseBackupJson(raw), row=backup.data.expenses[0];
  assert.equal(expenseMileage(row).editable,false);
  assert.match(stringifyBackupJson(backup), /"odometer"\s*:\s*12345678901234567890\.125/);
});
