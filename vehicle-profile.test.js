import test from "node:test";
import assert from "node:assert/strict";
import { VEHICLE_PROFILE_KEY as KEY, PROFILE_FIELDS, PROFILE_TEXT_LIMIT, validProfileDate, normalizePurchaseAmount,
  inspectVehicleProfile as inspect, withVehicleProfile as update } from "../js/vehicle-profile.js";
import { parseBackupJson, stringifyBackupJson } from "../js/precise-json.js";

const car = () => ({ id:"fictif", brand:"Renault", model:"Clio", vin:"VIN initial", plate:"AB-123-CD", notes:"Note existante", vigieVehicleMarker:{version:1,color:"bleu"} });
const empty = () => Object.fromEntries(PROFILE_FIELDS.map(key => [key, ""]));

test("véhicule ancien et formulaire vide : ni objet ni valeur inventés", () => {
  const v=car(), fields=empty();
  assert.equal(inspect(v).state,"absent"); assert.deepEqual(inspect(v).fields,fields);
  assert.equal(update(v,fields,PROFILE_FIELDS),v); assert.ok(!Object.hasOwn(v,KEY));
});

test("couleur de carrosserie et assurance s'ajoutent sans toucher aux champs existants", () => {
  const v=car(), fields={...empty(),bodyColor:" Bleu métallisé ",insurer:"Assurance fictive",policyNumber:"N° 123 / A",insuranceExpiry:"2028-02-29"};
  const next=update(v,fields,["bodyColor","insurer","policyNumber","insuranceExpiry"]);
  assert.deepEqual(next[KEY],{version:1,bodyColor:"Bleu métallisé",insurance:{company:"Assurance fictive",policyNumber:"N° 123 / A",expiryDate:"2028-02-29"}});
  assert.equal(next.vigieVehicleMarker,v.vigieVehicleMarker); assert.equal(next.notes,v.notes); assert.equal(next.vin,v.vin);
  assert.equal(inspect(next).fields.insuranceExpiry,"2028-02-29"); assert.ok(!Object.hasOwn(v,KEY));
});

test("prix exact et devise explicite : aucune conversion ni arrondi", () => {
  const values={...empty(),purchaseDate:"2021-10-30",purchaseAmount:"12345678901234567890,125",purchaseCurrency:"chf"};
  const next=update(car(),values,["purchaseDate","purchaseAmount","purchaseCurrency"]);
  assert.deepEqual(next[KEY].purchase,{date:"2021-10-30",amount:"12345678901234567890.125",currency:"CHF"});
  assert.equal(normalizePurchaseAmount("00012,50"),"12.50"); assert.equal(normalizePurchaseAmount(",5"),"0.5");
  assert.equal(normalizePurchaseAmount("0"),"0");
  assert.throws(()=>update(car(),{...values,purchaseCurrency:""},["purchaseAmount"]),/ensemble/);
  assert.throws(()=>update(car(),{...values,purchaseAmount:""},["purchaseCurrency"]),/ensemble/);
  assert.throws(()=>update(car(),{...values,purchaseCurrency:"EURO"},["purchaseAmount","purchaseCurrency"]),/trois lettres/);
});

test("dates calendaires et limites : refus plutôt que correction implicite", () => {
  for (const value of ["2000-02-29","2028-02-29","0001-01-01","9999-12-31"]) assert.equal(validProfileDate(value),true,value);
  for (const value of ["1900-02-29","2027-02-29","0000-01-01","2026-13-01","2026-04-31","06/11/2026",null]) assert.equal(validProfileDate(value),false,String(value));
  for (const value of ["-1","1 234","1e2","12,1234567","1,2.3","1".repeat(25)]) assert.throws(()=>normalizePurchaseAmount(value),/Prix d’achat/);
  assert.throws(()=>update(car(),{...empty(),bodyColor:"x".repeat(PROFILE_TEXT_LIMIT+1)},["bodyColor"]),/dépasse/);
  assert.throws(()=>update(car(),{...empty(),purchaseDate:"2025-02-29"},["purchaseDate"]),/date/);
});

test("suppression explicite ne supprime pas les extensions ni les autres champs", () => {
  const precision=new Uint8Array([1,2,3]);
  const v={...car(),[KEY]:{version:1,bodyColor:"Rouge",insurance:{company:"A",policyNumber:"B",future:{precision}},purchase:{date:"2020-01-01",amount:"0",currency:"EUR",extra:null},future:{important:true}}};
  const next=update(v,{...inspect(v).fields,insurer:"",purchaseDate:"2022-02-02"},["insurer","purchaseDate"]);
  assert.equal(Object.hasOwn(next[KEY].insurance,"company"),false); assert.equal(next[KEY].insurance.policyNumber,"B");
  assert.equal(next[KEY].insurance.future.precision,precision); assert.equal(next[KEY].purchase.amount,"0"); assert.equal(next[KEY].purchase.extra,null);
  assert.deepEqual(next[KEY].future,{important:true}); assert.equal(v[KEY].insurance.company,"A");
  assert.throws(()=>update(v,{...inspect(v).fields,purchaseAmount:""},["purchaseAmount"]),/ensemble/);
  const cleared=update(v,{...inspect(v).fields,purchaseAmount:"",purchaseCurrency:""},["purchaseAmount","purchaseCurrency"]);
  assert.equal(Object.hasOwn(cleared[KEY].purchase,"amount"),false); assert.equal(Object.hasOwn(cleared[KEY].purchase,"currency"),false); assert.equal(cleared[KEY].purchase.extra,null);
});

test("null et absence restent inchangés quand un autre champ est modifié", () => {
  const v={...car(),[KEY]:{version:1,bodyColor:null,insurance:null,purchase:{date:null,custom:1}}};
  assert.equal(update(v,inspect(v).fields,PROFILE_FIELDS),v);
  const next=update(v,{...inspect(v).fields,insurer:"A"},["insurer"]);
  assert.equal(next[KEY].bodyColor,null);assert.equal(next[KEY].purchase,v[KEY].purchase);assert.equal(next[KEY].insurance.company,"A");
});

test("formats, types et versions inconnus sont protégés même lors d'une tentative d'écriture", () => {
  for (const value of [null,false,"x",[],new Uint8Array([1]),{}, {version:"1"},{version:2,bodyColor:"bleu"},
    {version:1,bodyColor:{}},{version:1,insurance:[]},{version:1,insurance:{expiryDate:"2025-02-29"}},
    {version:1,purchase:{amount:19.99,currency:"EUR"}},{version:1,purchase:{amount:"19.99"}},
    {version:1,purchase:{amount:"19.99",currency:"eur"}},{version:1,purchase:{amount:"1,00",currency:"EUR"}}]) {
    const v={...car(),[KEY]:value}; assert.equal(inspect(v).state,"unsupported");
    assert.throws(()=>update(v,{...empty(),bodyColor:"Vert"},["bodyColor"]),/conservées sans modification/);
    assert.equal(v[KEY],value);
  }
});

test("nombres inconnus précis conservés dans toute l'arborescence", () => {
  const source=`{"formatVersion":3,"data":{"vehicles":[{"id":"v","vigieVehicleProfile":{"version":1,"bodyColor":"vert","future":12345678901234567890.125,"insurance":{"company":"A","extra":12345678901234567890.125}},"extension":12345678901234567890.125}]}}`;
  const backup=parseBackupJson(source), v=backup.data.vehicles[0];
  backup.data.vehicles[0]=update(v,{...inspect(v).fields,insurer:"B"},["insurer"]);
  assert.equal((stringifyBackupJson(backup).match(/12345678901234567890\.125/g)||[]).length,3);
});

test("champs inattendus et véhicule invalide ne sont jamais traités", () => {
  for(const v of [null,undefined,"auto",42,[],new Uint8Array([1])]) assert.throws(()=>inspect(v),/Véhicule invalide/);
  assert.throws(()=>update(car(),empty(),["__proto__"]),/informations du véhicule invalides/i);
});
