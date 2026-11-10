import test from 'node:test';
import assert from 'node:assert/strict';
import { parseBackupJson, stringifyBackupJson } from '../js/precise-json.js';
import { CORRECTION_STORE as STORE, ODOMETER_HISTORY_KEY as KEY, MAX_CORRECTIONS,
  inspectOdometerHistory, splitWireVehicle, splitWireRecords, mergeWireRecords,
  prepareManualCorrection, buildOdometerTimeline, validOdometerDate, validOdometerNumber } from '../js/odometer-history.js';
const car = () => ({id:'v1',brand:'Fictive',model:'A',odometer:100000,notes:'à garder',unknown:{n:'intact'}});
const event = (id='c1', before=100000, after=102000, date='2026-02-03') =>
  ({id,date,recordedAt:'2026-02-03T15:04:05.123Z',before,after,reason:'Saisie corrigée',actor:''});
const records = v => ({vehicles:[v],fills:[],services:[],checks:[],symptoms:[],expenses:[],[STORE]:[]});
function split(v) { const x=splitWireVehicle(v); return {...records(x.vehicle),[STORE]:x.rows}; }

test('absence, null et versions futures sont distincts et jamais écrasés', () => {
  assert.equal(inspectOdometerHistory(car()).state,'absent');
  for (const value of [null, {}, {version:2,entries:[]}, {version:1,entries:'futur'}, {version:1,entries:[{future:true}]}]) {
    const v={...car(),[KEY]:value}, snap=structuredClone(v), output=splitWireVehicle(v);
    assert.equal(inspectOdometerHistory(v).state,'unsupported');assert.deepEqual(output.vehicle,snap);assert.deepEqual(output.rows,[]);
    assert.throws(()=>prepareManualCorrection(v,{...v,odometer:1},[],{id:'c',date:'2026-02-03',recordedAt:'2026-02-03T15:04:05.123Z'}),/non reconnu/);
  }
});
test('une extension valide est éclatée sans dupliquer ses lignes et reconstruite sans perte', () => {
  const original={...car(),[KEY]:{version:1,entries:[event(),event('c2',102000,103000)],future:{garder:true}}};
  original[KEY].entries[0].future={a:[1,'x']};const data=split(original);
  assert.deepEqual(data.vehicles[0][KEY].entries,[]);assert.equal(data[STORE].length,2);
  assert.deepEqual(mergeWireRecords(data).vehicles[0],original);assert.equal(Object.hasOwn(mergeWireRecords(data),STORE),false);
  assert.equal(original[KEY].entries.length,2);
});
test('les nombres précis inconnus restent numériques après découpage, clonage et reconstruction', () => {
  const raw='{"data":{"vehicles":[{"id":"v","odometer":12,"vigieOdometerCorrections":{"version":1,"entries":[{"id":"x","date":"2026-01-02","recordedAt":"2026-01-02T00:00:00.000Z","before":11,"after":12,"future":9007199254740993}],"extra":-0}}]}}';
  const data=splitWireRecords(parseBackupJson(raw).data), out=stringifyBackupJson({data:mergeWireRecords(structuredClone(data))});
  assert.match(out,/"future": 9007199254740993/);assert.match(out,/"extra": -0/);
  assert.doesNotMatch(out,/"future": "9007199254740993"/);
});
test('un conteneur vide et ses champs futurs demeurent présents', () => {
  const v={...car(),[KEY]:{version:1,entries:[],future:['a']}};
  assert.deepEqual(mergeWireRecords(split(v)).vehicles[0],v);
});
test('les identifiants identiques de véhicules différents ne se heurtent pas', () => {
  const a={...car(),id:'a', [KEY]:{version:1,entries:[event()]}},b={...car(),id:'b',[KEY]:{version:1,entries:[event()]}};
  const d=splitWireRecords({vehicles:[a,b]});assert.equal(d[STORE].length,2);assert.notEqual(d[STORE][0].id,d[STORE][1].id);
  assert.deepEqual(mergeWireRecords(d).vehicles,[a,b]);
});
test('doublons ou données trop volumineuses restent dans le véhicule sans troncature', () => {
  const dup={...car(),[KEY]:{version:1,entries:[event(),event()]}};
  const large={...car(),[KEY]:{version:1,entries:Array.from({length:MAX_CORRECTIONS+1},(_,i)=>event('x'+i))}};
  for(const v of [dup,large]){const d=split(v);assert.deepEqual(d.vehicles[0],v);assert.equal(d[STORE].length,0);assert.deepEqual(mergeWireRecords(d).vehicles[0],v);}
});
test('état local orphelin, incohérent ou doublé refuse l’export', () => {
  const v={...car(),[KEY]:{version:1,entries:[event()]}},d=split(v),row=d[STORE][0];
  for(const damaged of [
    {...d,[STORE]:[{...row,vehicleId:'autre'}]}, {...d,[STORE]:[row,row]},
    {...d,[STORE]:[{...row,id:'mauvais'}]}, {...d,vehicles:[car()]},
    {...d,vehicles:[{...car(),[KEY]:{version:77,entries:[]}}]},
  ]) assert.throws(()=>mergeWireRecords(damaged),/annulé/i);
});
test('une correction manuelle ajoute exactement une ligne et conserve les champs du véhicule', () => {
  const v=car(), updated={...v,odometer:95000,updatedAt:'2026-02-03T15:04:05.123Z'};
  const x=prepareManualCorrection(v,updated,[],{id:'nouveau',date:'2026-02-03',recordedAt:'2026-02-03T15:04:05.123Z',reason:'Correction de frappe',actor:'Moi'});
  assert.equal(v.odometer,100000);assert.equal(Object.hasOwn(v,KEY),false);
  assert.equal(x.vehicle.odometer,95000);assert.deepEqual(x.vehicle.unknown,v.unknown);
  assert.equal(x.row.entry.before,100000);assert.equal(x.row.entry.after,95000);assert.equal(x.row.entry.reason,'Correction de frappe');
  const out=mergeWireRecords({...records(x.vehicle),[STORE]:[x.row]});
  assert.equal(out.vehicles[0][KEY].entries.length,1);assert.deepEqual(out.vehicles[0][KEY].entries[0],x.row.entry);
});
test('aucune correction si la valeur numérique n’a pas changé', () => {
  const v=car(), r=prepareManualCorrection(v,{...v},[],{id:'inutilisé',date:'2026-02-03',recordedAt:'2026-02-03T15:04:05.123Z'});
  assert.equal(r.row,null);assert.equal(Object.hasOwn(r.vehicle,KEY),false);
});
test('valeurs non fiables ou motif trop long refusés avant écriture', () => {
  const v=car(), args={id:'x',date:'2026-02-03',recordedAt:'2026-02-03T15:04:05.123Z'};
  for(const n of [Infinity,NaN,-1,-0,9007199254740992]) assert.throws(()=>prepareManualCorrection(v,{...v,odometer:n},[],args));
  assert.throws(()=>prepareManualCorrection(v,{...v,odometer:2},[],{...args,reason:'x'.repeat(501)}),/trop long/);
  assert.throws(()=>prepareManualCorrection(v,{...v,odometer:2},[],{...args,date:'2026-02-30',reason:'Erreur'}),/invalide/);
  assert.throws(()=>prepareManualCorrection(v,{...v,odometer:2},[],{...args,reason:'  '}),/motif/i);
  assert.throws(()=>prepareManualCorrection(v,{...v,odometer:2},[],{...args,recordedAt:'2026-02-03T24:00:00.000Z',reason:'Erreur'}),/invalide/);
});
test('dates calendaires, limites et nombres de compteur sont validés', () => {
  for(const d of ['2024-02-29','2026-01-01'])assert.equal(validOdometerDate(d),true);
  for(const d of ['2026-02-29','2026-13-01','abc','0001-01-01'])assert.equal(validOdometerDate(d),false);
  for(const n of [0,0.1,250000.5,Number.MAX_SAFE_INTEGER])assert.equal(validOdometerNumber(n),true);
  for(const n of [-0,-1,NaN,Infinity,Number.MAX_SAFE_INTEGER+1,'123'])assert.equal(validOdometerNumber(n),false);
});
test('le flux est calculé depuis les sources, sans doublon permanent des pleins ou contrôles', () => {
  const v={...car(),[KEY]:{version:1,entries:[event('c',105000,104000,'2026-01-04')]}}, d=split(v);
  d.fills=[{id:'f',vehicleId:'v1',date:'2026-01-01',odometer:100000,unit:'L',full:false,vigieFuelSubtype:'SP95-E10'}];
  d.services=[{id:'s',vehicleId:'v1',date:'2026-01-02',odometer:103000,title:'Vidange'}];
  d.checks=[{id:'q',vehicleId:'v1',date:'2026-01-03',odometer:105000,templateName:'Avant départ'}];
  d.symptoms=[{id:'y',vehicleId:'v1',date:'2026-01-05',odometer:106000,title:'Bruit'}];
  d.expenses=[{id:'e',vehicleId:'v1',date:'2026-01-06',odometer:107000,title:'Péage'}];
  const h=buildOdometerTimeline(d,'v1');assert.equal(h.entries.length,6);assert.equal(d[STORE].length,1);
  assert.equal(h.entries.find(x=>x.id==='f').detail,'SP95-E10 · Partiel');assert.equal(h.entries.find(x=>x.kind==='correction').before,105000);
  d.fills[0].date='2026-01-07';d.fills[0].odometer=108000;
  assert.equal(buildOdometerTimeline(d,'v1').entries[0].id,'f');
  d.fills=[];assert.equal(buildOdometerTimeline(d,'v1').entries.some(x=>x.id==='f'),false);assert.equal(d[STORE].length,1);
});
test('seules les baisses certaines entre jours différents sont signalées', () => {
  const d=records(car());
  d.fills=[{id:'a',vehicleId:'v1',date:'2026-01-01',odometer:100,unit:'L'},
    {id:'b',vehicleId:'v1',date:'2026-01-02',odometer:90,unit:'L'},
    {id:'c',vehicleId:'v1',date:'2026-01-02',odometer:80,unit:'L'},
    {id:'d',vehicleId:'v1',date:'2026-01-03',odometer:85,unit:'L'}];
  const h=buildOdometerTimeline(d,'v1');assert.equal(h.entries.find(x=>x.id==='b').anomaly,true);assert.equal(h.entries.find(x=>x.id==='c').anomaly,true);
  assert.equal(h.entries.find(x=>x.id==='d').anomaly,false,'ordre du 2 janvier indéterminé : pas de faux positif');
});
test('une baisse manuelle expliquée ne crée pas de fausse alerte pour son jour', () => {
  const v={...car(),[KEY]:{version:1,entries:[event('c',100,80,'2026-01-02')]}},d=split(v);
  d.fills=[{id:'a',vehicleId:'v1',date:'2026-01-01',odometer:100,unit:'L'},
    {id:'b',vehicleId:'v1',date:'2026-01-02',odometer:85,unit:'L'},
    {id:'c',vehicleId:'v1',date:'2026-01-03',odometer:90,unit:'L'}];
  const h=buildOdometerTimeline(d,'v1');assert.ok(h.entries.every(x=>!x.anomaly));
});
test('un relevé inutilisable est annoncé, les dépenses sans kilométrage ne sont pas inventées', () => {
  const d=records(car());d.fills=[{id:'x',vehicleId:'v1',date:'2026-01-01',odometer:'inconnu'}];
  d.expenses=[{id:'e',vehicleId:'v1',date:'2026-01-01',title:'Péage'}];
  const h=buildOdometerTimeline(d,'v1');assert.equal(h.entries.length,0);assert.equal(h.omitted,1);
});
test('un très grand groupe d’une même date ne déborde pas la pile', () => {
  const d=records(car());d.fills=Array.from({length:105000},(_,i)=>({id:'f'+i,vehicleId:'v1',date:'2026-01-01',odometer:i,unit:'L',full:false}));
  const h=buildOdometerTimeline(d,'v1');assert.equal(h.entries.length,105000);assert.equal(h.omitted,0);
});
