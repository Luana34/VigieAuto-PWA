import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { brandSuggestions, modelSuggestions, normalise, rememberVehicle } from '../js/catalogue.js';
const catalogue = JSON.parse(await readFile(new URL('../data/brands_models_fr.json', import.meta.url), 'utf8'));
const setting = (brands = [], models = []) => ({id:'vehicleSuggestions',version:1,brands,models,lastBrand:null,lastModel:null});

test('une omission, insertion, substitution ou transposition propose Clio', () => {
  for (const query of ['cio','cliio','clao','cloi']) assert.ok(modelSuggestions(catalogue,null,'Renault',query).includes('Clio'),query);
  for (const query of ['renult','renualt']) assert.ok(brandSuggestions(catalogue,null,query).includes('Renault'),query);
});
test('un mot dans un nom composé est également recherché', () => {
  const result=modelSuggestions(catalogue,null,'Citroën','aicross');
  assert.ok(result.includes('C3 Aircross')); assert.ok(result.includes('C5 Aircross'));
});
test('accents, casse et correspondances directes restent disponibles', () => {
  assert.ok(brandSuggestions(catalogue,null,'SKODA').includes('Škoda'));
  assert.ok(modelSuggestions(catalogue,null,'renault','MEGANE').includes('Mégane'));
  assert.ok(modelSuggestions(catalogue,null,'renault','gan').includes('Mégane'));
});
test('choix mémorisés en tête pour une recherche vide, sans doublons normalisés', () => {
  const memory=setting(['dacia','PEUGEOT','dáCia','Garage Libre']);
  const found=brandSuggestions(catalogue,memory);
  assert.deepEqual(found.slice(0,3),['Peugeot','Dacia','Garage Libre']);
  assert.equal(found.filter(x=>normalise(x)==='dacia').length,1);
});
test('exact avant inclus avant approchant ; mémoire prioritaire à qualité égale', () => {
  const tiny={brands:[{name:'Maison',models:['Clio','Clio Plus','Cleo','Clio Sport']}]};
  const memory=setting([],['Cleo','Clio Sport','Cleo'].map(model=>({brand:'Maison',model})));
  assert.deepEqual(modelSuggestions(tiny,memory,'Maison','clio'),['Clio','Clio Sport','Clio Plus','Cleo']);
  const more=setting([],memory.models.concat(['Cio','Cio Plus'].map(model=>({brand:'Maison',model}))));
  const found=modelSuggestions(tiny,more,'Maison','cio');
  assert.deepEqual(found.slice(0,2),['Cio','Cio Plus']);
  assert.ok(found.indexOf('Clio Sport')<found.indexOf('Clio'));
});
test('les modèles personnels restent liés à leur marque normalisée', () => {
  const memory=setting([], [{brand:'RENAULT',model:'MÉGANE'},{brand:'Citroën',model:'Clio'},{brand:'Maison',model:'Modèle Étoile'}]);
  const renault=modelSuggestions(catalogue,memory,'Renault');
  assert.equal(renault[0],'Mégane'); assert.equal(renault.filter(x=>normalise(x)==='megane').length,1);
  assert.ok(!renault.includes('Modèle Étoile'));
  assert.deepEqual(modelSuggestions(catalogue,memory,'MAISON','etole'),['Modèle Étoile']);
  assert.deepEqual(modelSuggestions(catalogue,memory,'citroen','clio'),['Clio']);
});
test('une marque approchante ne sélectionne pas automatiquement la marque connue', () => {
  assert.ok(brandSuggestions(catalogue,null,'renult').includes('Renault'));
  assert.deepEqual(modelSuggestions(catalogue,null,'renult','cio'),[]);
  assert.ok(modelSuggestions(catalogue,null,'Renault','cio').includes('Clio'));
});
test('pas de recherche approchante sur les entrées de moins de trois caractères', () => {
  assert.ok(!modelSuggestions(catalogue,null,'Renault','ci').includes('Clio'));
  assert.ok(modelSuggestions(catalogue,null,'Renault','cl').includes('Clio'));
});
test('pas de correction approximative des requêtes purement numériques', () => {
  const values=modelSuggestions(catalogue,null,'Peugeot','208');
  assert.ok(values.includes('208')); assert.ok(!values.includes('308')); assert.ok(!values.includes('2008'));
});
test('deux erreurs ne sont pas traitées comme une seule', () => {
  assert.ok(!modelSuggestions(catalogue,null,'Renault','qio').includes('Clio'));
  assert.deepEqual(brandSuggestions(catalogue,null,'marque sans correspondance xyz'),[]);
});
test('les saisies longues conservent la recherche directe, sans approximation non bornée', () => {
  const label='a'.repeat(80)+'-fin', memory=setting([label]);
  assert.deepEqual(brandSuggestions(null,memory,'a'.repeat(65)),[label]);
  assert.deepEqual(brandSuggestions(null,memory,'a'.repeat(64)+'b'),[]);
  const veryLong='b'.repeat(129);
  assert.deepEqual(brandSuggestions(null,setting([veryLong]),'b'.repeat(63)+'c'),[]);
  assert.deepEqual(brandSuggestions(null,setting([veryLong]),'b'.repeat(64)),[veryLong]);
});
test('la recherche ne modifie aucune suggestion ni propriété future', () => {
  const memory=rememberVehicle(null,'Maison','Étoile');memory.future={conserver:true};memory.models[0].futureModel='intact';
  const before=structuredClone(memory);
  assert.deepEqual(modelSuggestions(catalogue,memory,'maison','etole'),['Étoile']);
  brandSuggestions(catalogue,memory,'maison');
  assert.deepEqual(memory,before);
});
test('les correspondances directes précédentes ne sont pas perdues', () => {
  for (const query of ['a','re','cit','skoda','',' ','z']) {
    const previous=catalogue.brands.map(x=>x.name).filter(x=>normalise(x).includes(normalise(query)));
    const current=brandSuggestions(catalogue,setting(['Personnelle']),query);
    assert.ok(previous.every(x=>current.includes(x)));assert.equal(current.length,new Set(current.map(normalise)).size);
  }
  for(const brand of catalogue.brands) for(const query of ['a','i','2','','zz']) {
    const old=brand.models.filter(x=>normalise(x).includes(normalise(query)));
    const now=modelSuggestions(catalogue,null,brand.name,query);assert.ok(old.every(x=>now.includes(x)));
  }
});
test('algorithme borné comparé à une distance indépendante sur 600 mots fictifs', () => {
  function distance(a,b) {
    const d=Array.from({length:a.length+1},()=>Array(b.length+1).fill(0));
    for(let i=0;i<=a.length;i++)d[i][0]=i;for(let j=0;j<=b.length;j++)d[0][j]=j;
    for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++){
      d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));
      if(i>1&&j>1&&a[i-1]===b[j-2]&&a[i-2]===b[j-1])d[i][j]=Math.min(d[i][j],d[i-2][j-2]+1);
    }return d[a.length][b.length];
  }
  let seed=44;const random=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;};
  const word=n=>Array.from({length:n},()=> 'abcde'[random(5)]).join('');
  for(let k=0;k<100;k++) {
    const name=word(4+random(5)),i=random(name.length-1), tiny={brands:[{name:'Maison',models:[name]}]};
    const queries=[name,name.slice(0,i)+name.slice(i+1),name.slice(0,i)+'z'+name.slice(i),name.slice(0,i)+'z'+name.slice(i+1),name.slice(0,i)+name[i+1]+name[i]+name.slice(i+2),word(3+random(6))];
    for(const q of queries) assert.equal(modelSuggestions(tiny,null,'Maison',q).includes(name),name.includes(q)||distance(name,q)<=1,`${name}/${q}`);
  }
});
