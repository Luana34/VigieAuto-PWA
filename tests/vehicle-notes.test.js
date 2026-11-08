import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash, webcrypto } from 'node:crypto';
import { VEHICLE_NOTES_KEY as K, VEHICLE_NOTES_LIMIT as LIMIT, VEHICLE_NOTES_MARK_LIMIT as MARK_LIMIT,
  VEHICLE_NOTES_HASH_ALGORITHM, inspectVehicleNotes, vehicleNotesHash, withVehicleNotes,
  toggleNoteMark, normalizeNoteMarks, rebaseNoteMarks } from '../js/vehicle-notes.js';
if (!globalThis.crypto?.subtle) Object.defineProperty(globalThis, 'crypto', { value:webcrypto, configurable:true });
const bold = (start, end) => ({ start, end, style:'bold' });
const italic = (start, end) => ({ start, end, style:'italic' });
const car = (notes = '  Bonjour 🚙\n<em>non</em>  ') => ({ id:'v1', brand:'Fictive', notes, unknown:{keep:[1,'x']} });
async function styled(v = car(), marks = [bold(2,9)]) { return withVehicleNotes(v, { text:v.notes, marks }); }

test('empreinte UTF-16BE exacte, y compris surrogates isolés', async () => {
  for (const text of ['', 'été 🚙\n', '\ud800x\udc00', '\ud83d\ude99']) {
    const bytes=Buffer.alloc(text.length*2); for(let i=0;i<text.length;i++)bytes.writeUInt16BE(text.charCodeAt(i),i*2);
    assert.equal(await vehicleNotesHash(text), createHash('sha256').update(bytes).digest('hex'));
  }
});
test('une ancienne note conserve espaces et identité sans métadonnées', async () => {
  const v=car(); assert.deepEqual(await inspectVehicleNotes(v), {state:'absent',text:v.notes,marks:[]});
  assert.equal(await withVehicleNotes(v,{text:v.notes,marks:[]}),v); assert.equal(Object.hasOwn(v,K),false);
});
test('null et absence restent distincts en cas de non-modification', async () => {
  for(const v of [{id:'a'}, {id:'b',notes:null}, {id:'c',notes:''}]) assert.equal(await withVehicleNotes(v,{text:'',marks:[]}),v);
});
test('création de style sans modifier le texte ni recopier la note', async () => {
  const v=car(), w=await styled(v); assert.equal(w.notes,v.notes);assert.deepEqual(w.unknown,v.unknown);
  assert.equal(w[K].version,1);assert.equal(w[K].algorithm,VEHICLE_NOTES_HASH_ALGORITHM);
  assert.deepEqual(w[K].marks,[bold(2,9)]);assert.equal(JSON.stringify(w[K]).includes('Bonjour'),false);
  assert.equal((await inspectVehicleNotes(w)).state,'valid'); assert.equal(Object.hasOwn(v,K),false);
});
test('note texte seule modifiée sans ajout de métadonnées', async () => {
  const v=car(), w=await withVehicleNotes(v,{text:' nouveau  \n',marks:[]});
  assert.equal(w.notes,' nouveau  \n'); assert.equal(Object.hasOwn(w,K),false);
});
test('styles associés à la note et extensions supérieures inconnues conservés', async () => {
  const v=await styled();v[K].future={flag:true};v.other={local:true};
  const w=await withVehicleNotes(v,{text:'Ajout '+v.notes,marks:[bold(8,15)]});
  assert.deepEqual(w[K].future,{flag:true});assert.deepEqual(w.other,{local:true});assert.equal(w.notes,'Ajout '+v.notes);
  assert.equal((await inspectVehicleNotes(w)).state,'valid');
});
test('la réouverture sans changement ne réécrit pas les plages existantes', async () => {
  const v=await styled(); v[K].marks=[bold(2,5),bold(5,9)]; const info=await inspectVehicleNotes(v);
  assert.deepEqual(info.marks,[bold(2,9)]); assert.equal(await withVehicleNotes(v,{text:v.notes,marks:info.marks}),v);
  assert.equal(v[K].marks.length,2);
});
test('texte changé par une autre version : périmé sans écrasement', async () => {
  const v=await styled();const before=structuredClone(v[K]);v.notes='Modifié sur Android';
  assert.equal((await inspectVehicleNotes(v)).state,'stale');
  await assert.rejects(withVehicleNotes(v,{text:v.notes,marks:[]}),/autre version/i);assert.deepEqual(v[K],before);
});
test('réinitialisation périmée explicitement acceptée : texte et extensions préservés', async () => {
  const v=await styled();v[K].future=['conserver'];v.notes='Texte repris sur Android';
  const w=await withVehicleNotes(v,{text:v.notes,marks:[]},{resetStale:true});
  assert.equal(w.notes,v.notes);assert.deepEqual(w[K].future,['conserver']);assert.deepEqual(w[K].marks,[]);
  assert.equal((await inspectVehicleNotes(w)).state,'valid');
});
test('version et formats inconnus protégés, sans réinitialisation possible', async () => {
  const base=await styled();
  for(const box of [null,{}, {...base[K],version:2}, {...base[K],algorithm:'autre'},
    {...base[K],marks:[{...bold(2,9),unknown:'keep'}]}, {...base[K],marks:[{start:2,end:9,style:'future'}]}]) {
    const v={...base,[K]:box};assert.equal((await inspectVehicleNotes(v)).state,'unsupported');
    await assert.rejects(withVehicleNotes(v,{text:v.notes,marks:[]},{resetStale:true}),/pas reconnus/);
  }
});
test('bornes invalides, chaîne trop longue et limites ne tronquent rien', async () => {
  assert.throws(()=>normalizeNoteMarks([bold(1,3)],'🚙'),/non reconnue/);
  assert.throws(()=>normalizeNoteMarks([bold(0,1)],'🚙'),/non reconnue/);
  assert.throws(()=>normalizeNoteMarks([bold(0,1)],'x'.repeat(LIMIT+1)),/non reconnue/);
  assert.throws(()=>normalizeNoteMarks(Array.from({length:MARK_LIMIT+1},()=>bold(0,1)),'x'),/non reconnue/);
  const v=car('x'.repeat(LIMIT+1));assert.equal((await inspectVehicleNotes(v)).reason,'length');
  await assert.rejects(withVehicleNotes(v,{text:'x',marks:[]}),/pas reconnus/);assert.equal(v.notes.length,LIMIT+1);
});
test('onglets de style sélectionnés, cumulables et réversibles', () => {
  let m=toggleNoteMark('abcdef',[],'bold',1,5);assert.deepEqual(m,[bold(1,5)]);
  m=toggleNoteMark('abcdef',m,'italic',2,4);assert.deepEqual(m,[bold(1,5),italic(2,4)]);
  m=toggleNoteMark('abcdef',m,'bold',2,4);assert.deepEqual(m,[bold(1,2),italic(2,4),bold(4,5)]);
  m=toggleNoteMark('abcdef',m,'bold',1,5);assert.deepEqual(m,[bold(1,5),italic(2,4)]);
});
test('sélection vide ou scindant un emoji refusée sans mutation', () => {
  const m=[bold(0,1)], old=structuredClone(m);
  assert.throws(()=>toggleNoteMark('a🚙',m,'bold',1,1),/Sélectionnez/);
  assert.throws(()=>toggleNoteMark('a🚙',m,'bold',1,2),/Sélectionnez/);assert.deepEqual(m,old);
});
test('styles déplacés après insertion, suppression et remplacement', () => {
  assert.deepEqual(rebaseNoteMarks('abCDef','x abCDef',[bold(2,4)]),[bold(4,6)]);
  assert.deepEqual(rebaseNoteMarks('abCDef','abC++Def',[bold(2,4)]),[bold(2,6)]);
  assert.deepEqual(rebaseNoteMarks('abCDef','abef',[bold(2,4)]),[]);
  assert.deepEqual(rebaseNoteMarks('abCDef','abZef',[bold(2,4)]),[bold(2,3)]);
});
test('styles aux frontières : une insertion adjacente reste hors sélection', () => {
  assert.deepEqual(rebaseNoteMarks('abc','Xabc',[bold(0,2)]),[bold(1,3)]);
  assert.deepEqual(rebaseNoteMarks('abc','abXc',[bold(0,2)]),[bold(0,2)]);
});
test('changement autour de surrogates ne coupe pas un emoji', () => {
  assert.deepEqual(rebaseNoteMarks('a\ud83dx','a🚙x',[bold(1,2)]),[bold(1,3)]);
  assert.deepEqual(rebaseNoteMarks('a🚙x','a🙂x',[bold(1,3)]),[bold(1,3)]);
});
test('absence de crypto : lecture et écriture simples possibles, extension protégée', async () => {
  const v=await styled(), descriptor=Object.getOwnPropertyDescriptor(globalThis,'crypto');
  try { Object.defineProperty(globalThis,'crypto',{value:undefined,configurable:true});
    assert.equal((await inspectVehicleNotes(v)).state,'unavailable');
    await assert.rejects(withVehicleNotes(v,{text:v.notes,marks:[]}),/pas reconnus/);
    const plain=car('bonjour');assert.equal((await inspectVehicleNotes(plain)).state,'absent');
    assert.equal((await withVehicleNotes(plain,{text:'bonjour !',marks:[]})).notes,'bonjour !');
    await assert.rejects(withVehicleNotes(plain,{text:'bonjour',marks:[bold(0,1)]}),/indisponible/);
  } finally { if(descriptor)Object.defineProperty(globalThis,'crypto',descriptor);else delete globalThis.crypto; }
});
