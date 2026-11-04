/* Scénarios fictifs PWA 1.5.2-beta.2 : navigateur, IndexedDB, ancien JSON v3 et cache.
 * node tests/carnet-enrichi.cjs ; VIGIE_BROWSER=webkit node tests/carnet-enrichi.cjs
 * Les moteurs sous Linux ne remplacent ni Safari iOS ni un appareil Android réel.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const http = require('node:http');
const {spawnSync} = require('node:child_process');
const {chromium,webkit} = require('playwright');
const useWebkit=process.env.VIGIE_BROWSER==='webkit', engine=useWebkit?webkit:chromium;
const root=path.resolve(__dirname,'..');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.webmanifest':'application/manifest+json'};
async function serve(directory) {
 const server=http.createServer((req,res)=>{
  if(server.disconnected){req.socket.destroy();return;}
  let f=path.resolve(directory,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
  if(f!==directory&&!f.startsWith(directory+path.sep))return res.writeHead(403).end();
  if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=path.join(f,'index.html');
  if(!fs.existsSync(f)||!fs.statSync(f).isFile())return res.writeHead(404).end();
  res.writeHead(200,{'content-type':mime[path.extname(f)]||'application/octet-stream','cache-control':'no-store'});fs.createReadStream(f).pipe(res);
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 return {server,url:`http://127.0.0.1:${server.address().port}/`};
}
const labels={accueil:'Tableau de bord',entretien:'Entretien',pleins:'Pleins & conso',parametres:'Paramètres',garage:'Mes véhicules'};
async function go(p,route){await p.evaluate(r=>{location.hash=r},route);await p.waitForFunction(label=>document.title===`${label} — VigieAuto`,labels[route]);}
async function value(p,name,val){await p.locator(`#modal [name="${name}"]`).fill(String(val));}
async function submit(p){await p.locator('#modal button[type=submit]').click();await p.locator('#modal').waitFor({state:'hidden',timeout:10000});}
async function createCar(p,brand='Peugeot',model='208'){
 await p.locator('[data-action=start-real]').click();await value(p,'brand',brand);await value(p,'model',model);await value(p,'odometer','100000');await p.locator('#modal [name=fuel]').selectOption('diesel');await submit(p);
}
async function download(p){await go(p,'parametres');const wait=p.waitForEvent('download');await p.locator('[data-action=export]').click();return JSON.parse(fs.readFileSync(await (await wait).path(),'utf8'));}
async function upload(p,data){await go(p,'parametres');await p.locator('#import-file').setInputFiles({name:'fictive.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(data))});await p.waitForFunction(()=>document.querySelector('#toast')?.textContent.includes('importée'),null,{timeout:10000});}
async function addLine(p,label,price){
 await p.locator('#modal [data-action=add-service-line]').click();const line=p.locator('#modal [data-service-line]').last();
 await line.locator('[data-service-label]').fill(label);await line.locator('[data-service-price]').fill(price);
}
async function picker(p){await p.locator('#modal [data-action=open-service-categories]').click();await p.locator('#category-picker').waitFor({state:'visible'});}
async function waitPickerClosed(p){await p.locator('#category-picker').waitFor({state:'hidden'});await p.waitForFunction(()=>!history.state?.vigieCategoryPicker);}
async function oldRoundtrip(browser,backup,zip,edit=false){
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'vigie-ancienne-'));
 const extracted=spawnSync('python3',['-c','import sys,zipfile;zipfile.ZipFile(sys.argv[1]).extractall(sys.argv[2])',zip,tmp],{encoding:'utf8'});
 if(extracted.status!==0)throw new Error(extracted.stderr);
 const {server,url}=await serve(path.join(tmp,'VigieAuto'));
 const context=await browser.newContext({viewport:{width:390,height:844},locale:'fr-FR',acceptDownloads:true});
 const p=await context.newPage();p.on('dialog',d=>d.accept());
 try {
  await p.goto(url,{waitUntil:'networkidle'});await createCar(p,'Fictif','Ancien');await upload(p,backup);
  if(edit){
   await go(p,'entretien');await p.locator('[data-action=edit-service]').first().click();
   await value(p,'parts','120.00');await value(p,'notes','Modification ancienne version');await submit(p);
  }
  const returned=await download(p);
  assert.equal(returned.formatVersion,3);assert.equal(returned.data.services.length,1);
  assert.deepEqual(returned.data.services[0].vigieServiceDetails,backup.data.services[0].vigieServiceDetails);
  assert.deepEqual(returned.data.services[0].vigieServiceCategories,backup.data.services[0].vigieServiceCategories);
  assert.equal(returned.data.fills[0].vigieFuelSubtype,backup.data.fills[0].vigieFuelSubtype);
  if(edit)assert.equal(returned.data.services[0].parts,120);
  return returned;
 } finally {await context.close();await new Promise(r=>server.close(r));fs.rmSync(tmp,{recursive:true,force:true});}
}
(async()=>{
 const {server,url}=await serve(root);let browser;
 try {
  browser=await engine.launch(useWebkit?{headless:true}:{headless:true,args:['--no-sandbox']});
  const ctx=await browser.newContext({viewport:{width:390,height:844},locale:'fr-FR',timezoneId:'Europe/Paris',acceptDownloads:true});
  const p=await ctx.newPage(),errors=[];let rejectNextDialog=false;
  p.on('pageerror',e=>errors.push(e.message));p.on('dialog',d=>{if(rejectNextDialog){rejectNextDialog=false;return d.dismiss();}return d.accept();});
  await p.goto(url,{waitUntil:'networkidle'});await createCar(p);await go(p,'entretien');
  await p.locator('[data-action=add-service]').first().click();await value(p,'title','Révision détaillée');
  await addLine(p,'Ligne temporaire','1.00');
  assert.equal(await p.locator('#modal [name=parts]').getAttribute('aria-readonly'),'true');
  await p.locator('#modal [data-action=remove-service-line]').click();
  assert.equal(await p.locator('#modal [name=parts]').inputValue(),'0');
  assert.equal(await p.locator('#modal [name=parts]').getAttribute('readonly'),null);
  assert.equal(await p.locator('#modal [name=parts]').getAttribute('aria-readonly'),null);
  await addLine(p,'Huile moteur','42.50');await addLine(p,'Filtre à huile','14.00');await addLine(p,'Filtre à air','22.00');await addLine(p,'Filtre habitacle','22.00');
  await value(p,'labor','45.00');
  assert.equal(await p.locator('#modal [name=parts]').inputValue(),'100.50');assert.equal(await p.locator('#modal [name=parts]').getAttribute('readonly'),'');
  assert.match((await p.locator('[data-service-total]').innerText()).replace(/\s/g,''),/145,50€/);
  await value(p,'place','Garage Feu Vert & Fils');
  await p.evaluate(()=>{window.__maps=[];window.open=(...args)=>{window.__maps.push(args);return null;};});
  await p.locator('#modal [data-action=open-place-map]').click();
  let calls=await p.evaluate(()=>window.__maps);assert.equal(calls.length,1);assert.equal(calls[0][0],'https://www.google.com/maps/search/?api=1&query=Garage%20Feu%20Vert%20%26%20Fils');assert.equal(calls[0][2],'noopener,noreferrer');
  await value(p,'place','');await p.locator('#modal [data-action=open-place-map]').click();assert.equal((await p.evaluate(()=>window.__maps)).length,1);await value(p,'place','Garage Feu Vert & Fils');
  await picker(p);
  // Une réouverture dans la même tâche ne doit pas être fermée par le retour
  // asynchrone demandé lors de la fermeture précédente.
  const previousToken=await p.evaluate(()=>history.state?.vigieCategoryPicker);
  await p.evaluate(()=>{
    document.querySelector('#category-picker [data-action=close-service-categories]').click();
    document.querySelector('#modal [data-action=open-service-categories]').click();
  });
  await p.waitForFunction(token=>document.querySelector('#category-picker').open && !!history.state?.vigieCategoryPicker && history.state.vigieCategoryPicker!==token,previousToken);
  let box=await p.locator('#category-picker').boundingBox();assert.equal(Math.round(box.width),390);assert.equal(Math.round(box.height),844);
  assert.ok(await p.locator('#category-picker .category-group h3').count()>=9);
  await p.locator('[data-category-query]').fill('boug');assert.equal(await p.locator('#category-picker .category-group h3').count(),0);
  assert.equal(await p.locator('#category-picker [data-action=choose-service-category]').count(),2);
  assert.match(await p.locator('#category-picker [data-action=choose-service-category]').first().innerText(),/Moteur/);
  await p.locator('#category-picker [data-action=choose-service-category]').first().click();await waitPickerClosed(p);
  assert.equal(await p.locator('#modal [name=title]').inputValue(),'Révision détaillée');assert.equal(await p.locator('#modal [data-service-line]').count(),4);
  await picker(p);await p.locator('[data-category-query]').fill('Porte-vélo');
  assert.match(await p.locator('[data-category-results] button').first().innerText(),/Créer la catégorie/);
  await p.locator('[data-action=create-service-category]').click();await waitPickerClosed(p);
  assert.equal(await p.locator('#modal .category-chip').count(),2);
  await picker(p);await p.evaluate(()=>history.back());await p.locator('#category-picker').waitFor({state:'hidden'});
  assert.equal(await p.locator('#modal [name=title]').inputValue(),'Révision détaillée');
  await submit(p);
  console.log('✓ 4 lignes, somme exacte, main-d’œuvre, catégories multiples, recherche et retour sans perdre le brouillon');
  await go(p,'pleins');await p.locator('[data-action=add-fill]').first().click();
  assert.equal(await p.locator('#fuel-subtype-suggestions option[value=Excellium]').count(),1);
  await value(p,'volume','45.20');await value(p,'unitPrice','1.70');await value(p,'fuelSubtype','Excellium');await value(p,'station','Total Relais');
  assert.equal(await p.locator('#modal [name=total]').inputValue(),'76.84');await submit(p);
  let saved=await download(p);assert.equal(saved.formatVersion,3);assert.equal(saved.data.services.length,1);assert.equal(saved.data.fills.length,1);
  const record=saved.data.services[0];assert.equal(record.parts,100.5);assert.equal(record.labor,45);
  assert.deepEqual(record.vigieServiceDetails.lines.map(x=>x.cents),[4250,1400,2200,2200]);
  assert.deepEqual(record.vigieServiceCategories.items.map(x=>x.label),['Bougies d’allumage (moteur essence)','Porte-vélo']);
  assert.equal(record.category,'revision');assert.ok(saved.data.settings.some(x=>x.id.startsWith('serviceCategory:')&&x.label==='Porte-vélo'));
  assert.equal(saved.data.fills[0].vigieFuelSubtype,'Excellium');assert.equal(saved.data.fills[0].total,76.84);
  console.log('✓ JSON v3 : parts + labor historiques, détails optionnels, catégories et sous-type ; carte uniquement sur demande');
  await p.reload({waitUntil:'networkidle'});await go(p,'entretien');await p.locator('[data-action=edit-service]').first().click();
  await picker(p);await p.locator('[data-category-query]').fill('Porte-vélo');
  assert.equal(await p.locator('#category-picker [data-family=personnalise]').count(),1);
  await p.locator('[data-action=close-service-categories]').click();await waitPickerClosed(p);
  await p.locator('#modal [data-action=close-modal]').first().click();
  await go(p,'pleins');await p.locator('[data-action=add-fill]').first().click();
  assert.equal(await p.locator('#fuel-subtype-suggestions option').first().getAttribute('value'),'Excellium');
  await p.locator('#modal [data-action=close-modal]').first().click();
  console.log('✓ réouverture IndexedDB : catégories personnelles et dernier sous-type mémorisés');
  for(const size of [{width:320,height:740},{width:844,height:390},{width:768,height:1024}]) {
    await p.setViewportSize(size);await go(p,'entretien');await p.locator('[data-action=edit-service]').first().click();await picker(p);
    const rect=await p.locator('#category-picker').boundingBox();assert.equal(Math.round(rect.width),size.width);assert.equal(Math.round(rect.height),size.height);
    assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    await p.locator('.category-results').evaluate(el=>{el.scrollTop=el.scrollHeight;el.dispatchEvent(new WheelEvent('wheel',{deltaY:400,bubbles:true}));});
    assert.equal(await p.locator('#category-picker').isVisible(),true);
    await p.locator('[data-action=close-service-categories]').click();await waitPickerClosed(p);await p.locator('#modal [data-action=close-modal]').first().click();
  }
  await p.setViewportSize({width:390,height:844});await p.emulateMedia({colorScheme:'dark'});await go(p,'entretien');await p.locator('[data-action=edit-service]').first().click();await picker(p);
  assert.notEqual(await p.locator('#category-picker').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(255, 255, 255)');
  await p.locator('[data-action=close-service-categories]').click();await waitPickerClosed(p);await p.locator('#modal [data-action=close-modal]').first().click();await p.emulateMedia({colorScheme:'light'});
  console.log('✓ plein écran et défilement sans fermeture aux tailles 320, paysage et tablette ; thème sombre');
  const stableZip=process.env.VIGIE_PWA_STABLE || path.join(root,'..','VigieAuto-v1.5.1.zip');
  const previousZip=process.env.VIGIE_PWA_PRECEDENTE || path.join(root,'..','VigieAuto-v1.5.2-beta.1.zip');
  let old1;
  if(fs.existsSync(stableZip)) old1=await oldRoundtrip(browser,saved,stableZip,true);
  else {console.log('⏭ ZIP PWA 1.5.1 absent : échange réel avec cette ancienne version non exécuté');old1=structuredClone(saved);old1.data.services[0].parts=120;}
  if(fs.existsSync(previousZip)) {
    const old2=await oldRoundtrip(browser,saved,previousZip,false);assert.equal(old2.data.services[0].parts,100.5);
  } else console.log('⏭ ZIP beta.1 absent : échange réel avec cette ancienne version non exécuté');
  await upload(p,old1);await go(p,'entretien');await p.locator('[data-action=edit-service]').first().click();
  assert.match(await p.locator('#modal .detail-warning').innerText(),/diffère/);
  assert.equal(await p.locator('#modal [name=parts]').inputValue(),'120');
  await value(p,'notes','Note conservée sans recalcule');await submit(p);
  let conflict=await download(p);assert.equal(conflict.data.services[0].parts,120);assert.deepEqual(conflict.data.services[0].vigieServiceDetails,record.vigieServiceDetails);
  await go(p,'entretien');await p.locator('[data-action=edit-service]').first().click();await p.locator('[data-action=reconcile-service-details]').click();
  assert.equal(await p.locator('#modal [name=parts]').inputValue(),'100.50');await submit(p);
  let fixed=await download(p);assert.equal(fixed.data.services[0].parts,100.5);assert.deepEqual(fixed.data.services[0].vigieServiceDetails,record.vigieServiceDetails);
  console.log('✓ divergence de montant détectée, conservée puis corrigée seulement après confirmation' + (fs.existsSync(stableZip) && fs.existsSync(previousZip) ? ' ; échanges fictifs avec PWA 1.5.1 et beta.1' : ' ; certains échanges anciens ont été ignorés'));
  // Les propriétés imbriquées suivent leur propre ligne même si son prix change.
  const nested=structuredClone(saved);
  nested.data.services[0].vigieServiceDetails.metaFictive={x:'garder'};
  nested.data.services[0].vigieServiceDetails.lines[0].referenceFictive={id:'r1'};
  nested.data.services[0].vigieServiceCategories.items[0].sourceFictive='préservée';
  await upload(p,nested);await go(p,'entretien');await p.locator('[data-action=edit-service]').first().click();
  await p.locator('#modal [data-service-line]').first().locator('[data-service-price]').fill('43.50');
  await picker(p);await p.locator('[data-category-query]').fill('Filtre à huile');
  await p.locator('#category-picker [data-action=choose-service-category]').first().click();await waitPickerClosed(p);await submit(p);
  const edited=await download(p);assert.equal(edited.data.services[0].parts,101.5);
  assert.deepEqual(edited.data.services[0].vigieServiceDetails.metaFictive,{x:'garder'});
  assert.deepEqual(edited.data.services[0].vigieServiceDetails.lines[0].referenceFictive,{id:'r1'});
  assert.equal(edited.data.services[0].vigieServiceCategories.items[0].sourceFictive,'préservée');
  console.log('✓ propriétés inconnues par pièce et catégorie conservées lors d’une édition ciblée');
  // Structures futures/inconnues : l’éditeur préserve, sans conversion ou suppression.
  fixed.data.services[0].vigieServiceDetails={version:7,lines:[{libre:'à préserver'}],future:42};
  fixed.data.services[0].vigieServiceCategories={version:7,items:['à préserver']};
  fixed.data.services[0].category='ancienne-valeur-personnelle';
  fixed.data.fills[0].vigieFuelSubtype={version:7,label:'future'};
  await upload(p,fixed);await go(p,'entretien');assert.match(await p.locator('body').innerText(),/ancienne-valeur-personnelle/);
  await p.locator('[data-action=edit-service]').first().click();assert.match(await p.locator('#modal .detail-warning').innerText(),/autre version/);
  assert.equal(await p.locator('#modal [name=parts]').getAttribute('readonly'),'');await value(p,'notes','Modification sans écraser les extensions');await submit(p);
  await go(p,'pleins');await p.locator('[data-action=edit-fill]').first().click();assert.equal(await p.locator('#modal [name=fuelSubtype]').isDisabled(),true);await value(p,'notes','Plein conservé');await submit(p);
  const preserved=await download(p);
  assert.deepEqual(preserved.data.services[0].vigieServiceDetails,fixed.data.services[0].vigieServiceDetails);
  assert.deepEqual(preserved.data.services[0].vigieServiceCategories,fixed.data.services[0].vigieServiceCategories);
  assert.equal(preserved.data.services[0].category,'ancienne-valeur-personnelle');
  assert.deepEqual(preserved.data.fills[0].vigieFuelSubtype,fixed.data.fills[0].vigieFuelSubtype);
  console.log('✓ catégories et extensions inconnues conservées lors des modifications, sans interprétation forcée');
  // Deux onglets ne doivent pas écraser une autre édition ni enregistrer une catégorie partielle.
  await upload(p,saved);await go(p,'entretien');await p.locator('[data-action=edit-service]').first().click();
  await value(p,'notes','Brouillon onglet A');await picker(p);await p.locator('[data-category-query]').fill('Catégorie concurrente');
  await p.locator('[data-action=create-service-category]').click();await waitPickerClosed(p);
  const p2=await ctx.newPage();p2.on('dialog',d=>d.accept());await p2.goto(url,{waitUntil:'networkidle'});
  await go(p2,'entretien');await p2.locator('[data-action=edit-service]').first().click();await value(p2,'notes','Écriture onglet B');await submit(p2);
  await p.locator('#modal button[type=submit]').click();
  await p.locator('#modal .form-error.visible').waitFor();assert.match(await p.locator('#modal .form-error').innerText(),/changé dans un autre onglet/);
  await p.locator('#modal [data-action=close-modal]').first().click();await p2.close();
  const concurrent=await download(p);assert.equal(concurrent.data.services[0].notes,'Écriture onglet B');
  assert.ok(!concurrent.data.settings.some(x=>x.label==='Catégorie concurrente'));
  console.log('✓ écriture concurrente détectée ; ni écrasement du carnet ni mémorisation partielle');
  // Ancien total global : l'option de détail demande une confirmation explicite.
  const legacy=structuredClone(saved);delete legacy.data.services[0].vigieServiceDetails;delete legacy.data.services[0].vigieServiceCategories;legacy.data.services[0].parts=77.345;legacy.data.services[0].labor=45.005;
  await upload(p,legacy);await go(p,'entretien');await p.locator('[data-action=edit-service]').first().click();
  assert.equal(await p.locator('#modal [name=parts]').inputValue(),'77.345');await value(p,'notes','Global conservé');await submit(p);
  let before=await download(p);assert.equal(before.data.services[0].parts,77.345);assert.equal(before.data.services[0].labor,45.005);assert.equal(Object.hasOwn(before.data.services[0],'vigieServiceDetails'),false);
  await go(p,'entretien');await p.locator('[data-action=edit-service]').first().click();
  rejectNextDialog=true;await p.locator('#modal [data-action=add-service-line]').click();assert.equal(await p.locator('#modal [data-service-line]').count(),0);assert.equal(await p.locator('#modal [name=parts]').inputValue(),'77.345');
  await addLine(p,'Nouvelle ligne','12.34');await p.locator('#modal [data-action=close-modal]').first().click();
  before=await download(p);assert.equal(before.data.services[0].parts,77.345);assert.equal(Object.hasOwn(before.data.services[0],'vigieServiceDetails'),false);
  console.log('✓ ancien coût global inchangé ; abandon d’une conversion vers le détail sans écriture');
  // Code et catalogue mis en cache, réouverture hors ligne, ancienne base bloquée.
  await p.evaluate(()=>navigator.serviceWorker.ready);await p.waitForFunction(()=>!!navigator.serviceWorker.controller);
  assert.equal(await p.evaluate(async()=>!!await caches.match(new URL('./js/maintenance.js',location.href))),true);
  const downgrade=await p.evaluate(()=>new Promise(resolve=>{const r=indexedDB.open('cq-auto-local',3);r.onerror=()=>resolve(r.error.name);r.onsuccess=()=>{r.result.close();resolve('ouvert');};}));assert.equal(downgrade,'VersionError');
  if(useWebkit)server.disconnected=true;else await ctx.setOffline(true);
  await p.reload({waitUntil:'load'});await go(p,'entretien');await p.locator('[data-action=edit-service]').first().click();await picker(p);
  await p.locator('[data-category-query]').fill('boug');assert.equal(await p.locator('#category-picker [data-action=choose-service-category]').count(),2);
  await p.locator('[data-action=close-service-categories]').click();await waitPickerClosed(p);await p.locator('#modal [data-action=close-modal]').first().click();
  assert.deepEqual(errors,[]);await ctx.close();
  console.log('✓ après migration IndexedDB 4 : retour direct bloqué, catalogue et saisie disponibles hors ligne après cache');
  console.log(`SUCCÈS ${useWebkit?'WebKit':'Chromium'} : carnet enrichi (données entièrement fictives)`);
 } finally {if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(error=>{console.error(error);process.exitCode=1;});
