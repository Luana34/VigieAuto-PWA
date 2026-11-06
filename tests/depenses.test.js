import test from "node:test";
import assert from "node:assert/strict";
import { EXPENSE_CATEGORIES, expenseMileage, expenseCategoryLabel, orderedExpenses } from "../js/data.js";
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

test("tri des dépenses : date récente, libellé de catégorie ou montant décroissant sans modifier la source", () => {
  const rows=[
    {id:"a",date:"2026-01-01",category:"assurance",amount:7,extra:{future:true}},
    {id:"b",date:"2026-03-01",category:"carburant",amount:2},
    {id:"c",date:"2026-02-01",category:"assurance",amount:30},
    {id:"d",date:"2026-04-01",category:"inconnu",amount:0},
    {id:"e",date:"2026-05-01",category:null,amount:null},
    {id:"f",date:"2026-05-02",category:"__proto__",amount:{valueOf:null,toString:null}},
  ];
  const original=structuredClone(rows), ids=(order)=>orderedExpenses(rows,order).map(x=>x.id);
  assert.deepEqual(ids("date"),["f","e","d","b","c","a"]);
  assert.deepEqual(ids("category"),["c","a","b","e","f","d"]);
  assert.deepEqual(ids("amount"),["c","a","b","d","f","e"]);
  assert.deepEqual(rows,original);assert.equal(expenseCategoryLabel("__proto__"),"Personnalisée : __proto__");
  assert.deepEqual(ids("valeur-future"),ids("date"));
});
