import test from "node:test";
import assert from "node:assert/strict";
import { validCurrencyCode, currencyAssignmentId, indexCurrencyAssignments, validateCurrencyAssignments,
  currencyOf, spendingByCurrency, expenseTotalsByCurrency } from "../js/currency.js";
import { orderedExpenses } from "../js/data.js";

const assignment = (id, currency, extra={}) => ({ id:currencyAssignmentId(id), collection:'expenses', recordId:id, currency, ...extra });

test('devises : anciennes dépenses en euros sans interpréter leurs extensions', () => {
  const old={id:'a',amount:20,currency:'CHF',vigieCurrency:'USD',extra:{currency:'JPY'}};
  const idx=indexCurrencyAssignments([]);
  assert.equal(currencyOf(idx,old.id),'EUR');
  assert.deepEqual(expenseTotalsByCurrency([old],idx),[{currency:'EUR',total:20}]);
  assert.deepEqual(old.extra,{currency:'JPY'});
});

test('les totaux séparent les unités sans conversion ni addition entre devises', () => {
  const idx=indexCurrencyAssignments([assignment('b','CHF'),assignment('c','USD')]);
  const data={fills:[{total:30}],services:[{parts:4,labor:6}],expenses:[{id:'a',amount:20},{id:'b',amount:100},{id:'c',amount:3}]};
  assert.deepEqual(spendingByCurrency(data,idx),[
    {currency:'EUR',fuel:30,service:10,other:20,total:60},
    {currency:'CHF',fuel:0,service:0,other:100,total:100},
    {currency:'USD',fuel:0,service:0,other:3,total:3},
  ]);
  assert.deepEqual(expenseTotalsByCurrency(data.expenses,idx),[{currency:'EUR',total:20},{currency:'CHF',total:100},{currency:'USD',total:3}]);
});

test('syntaxe des devises et affectations : refus conservateur des données non prises en charge', () => {
  for (const x of ['EUR','CHF','SEK','ZZZ']) assert.equal(validCurrencyCode(x),true); // syntaxe, pas garantie de code ISO actif
  for (const x of ['eur','EU','EURO','12X','€','',null,{},new Uint8Array([65])]) assert.equal(validCurrencyCode(x),false);
  const malformed=[null,[],{},assignment('x','eur'),assignment('x','USD',{collection:'fills'}),assignment('x','USD',{id:'wrong'}),assignment('x','USD',{recordId:3})];
  for (const row of malformed) assert.throws(()=>indexCurrencyAssignments([row]));
  assert.throws(()=>indexCurrencyAssignments([assignment('x','EUR'),assignment('x','USD')]));
  assert.throws(()=>validateCurrencyAssignments([assignment('introuvable','CHF')],[{id:'ok'}]),/absente/);
  const extension=assignment('ok','CHF',{futur:{modele:1}});
  assert.deepEqual(validateCurrencyAssignments([extension],[{id:'ok'}]).get('ok'),extension);
});

test('tri par montant : regroupement par devise puis décroissant, sans comparaison de devises', () => {
  const rows=[{id:'a',amount:1,date:'2026-01-01'},{id:'b',amount:200,date:'2026-01-02'},
    {id:'c',amount:1000,date:'2026-01-03'},{id:'d',amount:4,date:'2026-01-04'}, {id:'e',amount:null,date:'2026-01-05'}];
  const idx=indexCurrencyAssignments([assignment('b','CHF'),assignment('c','USD'),assignment('d','CHF'),assignment('e','CHF')]);
  const before=structuredClone(rows), sorted=orderedExpenses(rows,'amount',id=>currencyOf(idx,id));
  assert.deepEqual(sorted.map(x=>x.id),['a','b','d','e','c']);assert.deepEqual(rows,before);
  assert.deepEqual(orderedExpenses(rows,'date',id=>currencyOf(idx,id)).map(x=>x.id),['e','d','c','b','a']);
});

test('nombre de devises borné avant import ou modification', () => {
  const codes=Array.from({length:32},(_,i)=>'A'+String.fromCharCode(65+Math.floor(i/26))+String.fromCharCode(65+i%26));
  assert.equal(indexCurrencyAssignments(codes.slice(0,31).map((c,i)=>assignment(String(i),c))).size,31);
  assert.throws(()=>indexCurrencyAssignments(codes.map((c,i)=>assignment(String(i),c))),/32 devises/);
});
