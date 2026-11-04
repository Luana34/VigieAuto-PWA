import test from 'node:test';
import assert from 'node:assert/strict';
import {sameStoredValue} from '../js/db.js';
import {
  DETAIL_KEY,CATEGORIES_KEY,SUBTYPE_KEY,SERVICE_FAMILIES,CUSTOM_CATEGORY_PREFIX,
  categoryKey,searchCategories,legacyCategory,inspectCategories,parseCents,formatCents,
  centsAsNumber,sumCents,inspectDetails,fuelSuggestions,mapsSearchUrl,
} from '../js/maintenance.js';

test('neuf familles standard et toute la nomenclature fournie', () => {
  assert.equal(SERVICE_FAMILIES.length, 9);
  const all=SERVICE_FAMILIES.flatMap(f=>f.items);
  for (const word of ['Additif FAP','Kit de frein arrière','Permutation des pneus','Butée hydraulique',
    'Neiman','Bouteille déshydratante','Crit’Air','Faisceau attelage'])
    assert.ok(all.some(x=>x.includes(word)),word);
});
test('recherche immédiate sans accent avec famille et catégories personnelles', () => {
  const personnalise={id:CUSTOM_CATEGORY_PREFIX+'test',label:'Porte-vélo'};
  const result=searchCategories('boug');
  assert.equal(result.length,2);assert.ok(result.every(x=>x.family==='moteur'&&x.familyLabel.includes('Moteur')));
  assert.equal(searchCategories('porte velo',[personnalise])[0].label,'Porte-vélo');
  assert.equal(searchCategories('VÉLO',[personnalise])[0].label,'Porte-vélo');
  assert.equal(searchCategories('sans resultat').length,0);
});
test('identité par famille et libellé ; correspondance ancien code', () => {
  assert.equal(categoryKey({family:'freinage',label:'ÉTRIER'}),categoryKey({family:'freinage',label:'étrier'}));
  assert.notEqual(categoryKey({family:'freinage',label:'ÉTRIER'}),categoryKey({family:'autre',label:'ÉTRIER'}));
  assert.equal(legacyCategory({family:'moteur',label:'Courroie de distribution + Pompe à eau'}),'distribution');
  assert.equal(legacyCategory({family:'personnalise',label:'Porte-vélo'}),'autre');
  assert.equal(legacyCategory({family:'historique',legacy:'code-inconnu',label:'inconnu'}),'code-inconnu');
});
test('catégories absentes, version future ou inconnue : refus d’interprétation sans effacement', () => {
  assert.equal(inspectCategories({}).state,'absent');
  const newer={ [CATEGORIES_KEY]:{version:2,items:[{label:'X'}],unknown:5} };
  assert.equal(inspectCategories(newer).state,'unsupported');assert.equal(newer[CATEGORIES_KEY].unknown,5);
  assert.equal(inspectCategories({[CATEGORIES_KEY]:{version:1,items:[{family:'perso',label:'Libellé'}]}}).state,'valid');
});
test('centimes exacts et total exemple demandé, sans somme binaire flottante', () => {
  assert.equal(parseCents('.5'),50);assert.equal(parseCents('42.50'),4250);
  const sum=sumCents(['42.50','14.00','22.00','22.00'].map(parseCents));
  assert.equal(sum,10050);assert.equal(formatCents(sum),'100.50');assert.equal(centsAsNumber(sum),100.5);
  assert.equal(sumCents([parseCents('0.10'),parseCents('0.20')]),30);
  for(const invalid of ['-1','0.001','NaN','1e3','90071992547410.00','']) assert.throws(()=>parseCents(invalid),invalid);
});
test('détail ancien absent, cohérent, divergent ou futur ne modifie pas le total', () => {
  assert.equal(inspectDetails({parts:90}).state,'absent');
  const detail={version:1,lines:[{label:'Huile',cents:4250,extensionFictive:{n:9}},{label:'Filtre',cents:1400}]};
  assert.equal(inspectDetails({parts:56.5,[DETAIL_KEY]:detail}).state,'valid');
  assert.equal(inspectDetails({parts:60,[DETAIL_KEY]:detail}).state,'conflict');
  assert.equal(detail.lines[0].extensionFictive.n,9);
  assert.equal(inspectDetails({parts:60,[DETAIL_KEY]:{version:7,lines:[]}}).state,'unsupported');
  assert.equal(inspectDetails({parts:60,[DETAIL_KEY]:{version:1,lines:[{label:'X',cents:new Uint8Array([1])}]}}).state,'unsupported');
});
test('sous-types suggérés et derniers choix limités au véhicule, saisie libre possible', () => {
  const v={id:'a',fuel:'diesel'};
  const fills=[{vehicleId:'a',date:'2026-10-30',[SUBTYPE_KEY]:'Excellium'},
    {vehicleId:'b',date:'2026-10-31',[SUBTYPE_KEY]:'Station étrangère'},
    {vehicleId:'a',date:'2026-11-01',[SUBTYPE_KEY]:'Diesel personnel'}];
  const labels=fuelSuggestions(v,fills);assert.deepEqual(labels.slice(0,2),['Diesel personnel','Excellium']);
  assert.equal(labels.filter(x=>x==='Excellium').length,1);assert.ok(!labels.includes('Station étrangère'));
  assert.ok(fuelSuggestions({id:'e',fuel:'electrique'},[]).includes('Supercharge'));
  assert.ok(fuelSuggestions({id:'h',fuel:'hybride'},[]).includes('SP95-E10'));
  assert.ok(fuelSuggestions({id:'x',fuel:'autre',fuelDetail:'E85'},[]).includes('Superéthanol E85'));
});
test('détection structurelle des changements, y compris marqueurs numériques', () => {
  const a={id:'a',lines:[{v:new Uint8Array([86,65,1])}],other:{x:2}};
  const equal={other:{x:2},lines:[{v:new Uint8Array([86,65,1])}],id:'a'};
  const changed={other:{x:2},lines:[{v:new Uint8Array([86,65,2])}],id:'a'};
  assert.equal(sameStoredValue(a,equal),true);assert.equal(sameStoredValue(a,changed),false);
  assert.equal(sameStoredValue([],new Array(2)),false);assert.equal(sameStoredValue(null,{}),false);
});
test('lien Google Maps explicite, encodé ; nom vide refusé', () => {
  assert.throws(()=>mapsSearchUrl('  '));
  assert.equal(mapsSearchUrl(' Feu Vert & fils '),'https://www.google.com/maps/search/?api=1&query=Feu%20Vert%20%26%20fils');
});
