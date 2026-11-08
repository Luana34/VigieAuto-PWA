/* Jeux fictifs : fiche complémentaire, intégrité, concurrence et hors ligne.
 * VIGIE_SITE_DIR sert une copie publique extraite ; VIGIE_PROFILE_BRIDGE_OUT
 * écrit un export fictif pour un éventuel essai séparé Android/Room. */
const assert=require('node:assert/strict'),fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const {chromium,webkit}=require('playwright');
const useWebkit=process.env.VIGIE_BROWSER==='webkit',engine=useWebkit?webkit:chromium;
const root=process.env.VIGIE_SITE_DIR?path.resolve(process.env.VIGIE_SITE_DIR):path.resolve(__dirname,'..');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.webmanifest':'application/manifest+json'};
async function serve(){const s=http.createServer((req,res)=>{if(s.offline){req.socket.destroy();return;}let f=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(f!==root&&!f.startsWith(root+path.sep))return res.writeHead(403).end();if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=path.join(f,'index.html');if(!fs.existsSync(f)||!fs.statSync(f).isFile())return res.writeHead(404).end();res.writeHead(200,{'content-type':mime[path.extname(f)]||'application/octet-stream','cache-control':'no-store'});fs.createReadStream(f).pipe(res);});await new Promise(r=>s.listen(0,'127.0.0.1',r));return{s,url:`http://127.0.0.1:${s.address().port}/`};}
const go=async(p,r,label)=>{await p.evaluate(x=>location.hash=x,r);await p.waitForFunction(x=>document.title===`${x} — VigieAuto`,label);};
const garage=p=>go(p,'garage','Mes véhicules');
const records=p=>p.evaluate(async()=>{const {LocalDatabase,DB_CONTRACT}=await import('./js/db.js');const db=await new LocalDatabase().open(DB_CONTRACT, "corrections-compteur-v1");const result=await db.readAll();db.db.close();return result;});
const button=(p,id)=>p.locator(`[data-action="vehicle-profile"][data-id="${id}"]`);
const field=(p,n)=>p.locator(`#modal [name="${n}"]`);
const readCar=(data,id)=>data.vehicles.find(v=>v.id===id);
const submit=async p=>{await p.locator('#modal button[type=submit]').click();await p.locator('#modal').waitFor({state:'hidden'});};
const close=async p=>{await p.locator('#modal [data-action=close-modal]').first().click();await p.locator('#modal').waitFor({state:'hidden'});};
const exportRaw=async p=>{await go(p,'parametres','Paramètres');const evt=p.waitForEvent('download');await p.locator('[data-action=export]').click();return fs.readFileSync(await(await evt).path(),'utf8');};
async function addCar(p,brand,model,km){await garage(p);await p.locator('[data-action=add-vehicle]').first().click();await field(p,'brand').fill(brand);await field(p,'model').fill(model);await field(p,'odometer').fill(String(km));await submit(p);return (await records(p)).vehicles.find(v=>v.brand===brand&&v.model===model).id;}
(async()=>{
 const {s,url}=await serve();let browser;
 try {
  browser=await engine.launch(useWebkit?{headless:true}:{headless:true,args:['--no-sandbox']});
  const ctx=await browser.newContext({viewport:{width:390,height:844},locale:'fr-FR',timezoneId:'Europe/Paris',acceptDownloads:true});
  const p=await ctx.newPage(),errors=[],dialogs=[];let allow=true;
  p.on('pageerror',e=>errors.push(e.message));p.on('dialog',async d=>{dialogs.push(d.message());const answer=allow;allow=true;if(answer)await d.accept();else await d.dismiss();});
  await p.goto(url,{waitUntil:'networkidle'});await p.locator('[data-action=start-real]').click();
  await field(p,'brand').fill('Renault');await field(p,'model').fill('Clio');await field(p,'odometer').fill('12345');await submit(p);
  const first=(await records(p)).vehicles[0].id,second=await addCar(p,'Peugeot','208',23456);
  let before=await records(p);assert.ok(!Object.hasOwn(readCar(before,first),'vigieVehicleProfile'));
  await garage(p);await button(p,first).click();
  assert.match(await p.locator('#modal').innerText(),/Tout est facultatif/);assert.match(await p.locator('#modal').innerText(),/différente du repère/i);
  assert.equal(await field(p,'profileBodyColor').inputValue(),'');assert.equal(await field(p,'profileCurrency').inputValue(),'');
  assert.equal(await field(p,'profileCurrencyOther').isVisible(),false,'code libre masqué hors du choix Autre');
  assert.equal(await p.evaluate(()=>!window.dispatchEvent(new Event('beforeunload',{cancelable:true}))),false,'aucun avertissement sans brouillon');
  await field(p,'profileBodyColor').fill('Brouillon fictif');
  assert.equal(await p.evaluate(()=>!window.dispatchEvent(new Event('beforeunload',{cancelable:true}))),true,'rechargement averti si le navigateur le permet');
  allow=false;await p.keyboard.press('Escape');
  assert.equal(await p.locator('#modal').isVisible(),true,'Échap ne ferme pas un brouillon si le refus est choisi');assert.match(dialogs.at(-1),/non enregistrées/);
  allow=false;await p.locator('#modal [data-action=close-modal]').first().click();
  assert.equal(await p.locator('#modal').isVisible(),true);assert.match(dialogs.at(-1),/non enregistrées/);
  await close(p);assert.equal(await p.evaluate(()=>!window.dispatchEvent(new Event('beforeunload',{cancelable:true}))),false);assert.deepEqual(await records(p),before,'abandon confirmé : aucune écriture');

  // Un véhicule inactif peut recevoir une fiche sans changer la sélection ni réécrire les données existantes.
  await button(p,first).click();await field(p,'profileBodyColor').fill('Bleu métallisé');
  await field(p,'profileInsurer').fill('Assurance fictive');await field(p,'profilePolicyNumber').fill('POL-123');await field(p,'profileInsuranceExpiry').fill('2028-02-29');
  await field(p,'profilePurchaseDate').fill('2020-09-12');await field(p,'profilePurchaseAmount').fill('12345678901234567890,125');await field(p,'profileCurrency').selectOption('CHF');await submit(p);
  let after=await records(p);const expected=structuredClone(before);
  readCar(expected,first).vigieVehicleProfile={version:1,bodyColor:'Bleu métallisé',insurance:{company:'Assurance fictive',policyNumber:'POL-123',expiryDate:'2028-02-29'},purchase:{date:'2020-09-12',amount:'12345678901234567890.125',currency:'CHF'}};
  assert.deepEqual(after,expected,'seule la fiche complémentaire a changé');assert.equal(after.settings.find(x=>x.id==='activeVehicle').value,second);
  await button(p,first).click();assert.equal(await field(p,'profilePurchaseAmount').inputValue(),'12345678901234567890.125');assert.equal(await field(p,'profileCurrency').inputValue(),'CHF');
  await submit(p);assert.deepEqual(await records(p),after,'aucune écriture si aucun changement');

  // Changer de devise demande une confirmation explicite sans conversion.
  await button(p,first).click();await field(p,'profileCurrency').selectOption('USD');allow=false;
  await p.locator('#modal button[type=submit]').click();assert.equal(await p.locator('#modal').isVisible(),true);assert.match(dialogs.at(-1),/aucun montant n’est converti/i);assert.deepEqual(await records(p),after);
  await submit(p);before=after;after=await records(p);assert.equal(readCar(after,first).vigieVehicleProfile.purchase.currency,'USD');assert.equal(readCar(after,first).vigieVehicleProfile.purchase.amount,'12345678901234567890.125');
  // Effacer une valeur demande aussi une confirmation ; le reste est intact.
  await button(p,first).click();await field(p,'profilePolicyNumber').fill('');allow=false;await p.locator('#modal button[type=submit]').click();assert.match(dialogs.at(-1),/Effacer le numéro de contrat/);assert.deepEqual(await records(p),after);
  await submit(p);before=after;after=await records(p);const expectedClear=structuredClone(before);delete readCar(expectedClear,first).vigieVehicleProfile.insurance.policyNumber;assert.deepEqual(after,expectedClear);

  // Montant et devise ne sont jamais déduits l'un de l'autre.
  await button(p,second).click();await field(p,'profilePurchaseAmount').fill('0');await p.locator('#modal button[type=submit]').click();
  await p.locator('#modal .form-error.visible').waitFor();assert.match(await p.locator('#modal .form-error').innerText(),/ensemble/);assert.deepEqual(await records(p),after);
  await field(p,'profileCurrency').selectOption('__other');assert.equal(await field(p,'profileCurrencyOther').isVisible(),true);
  await field(p,'profileCurrencyOther').fill('SEK');await submit(p);
  after=await records(p);assert.deepEqual(readCar(after,second).vigieVehicleProfile,{version:1,purchase:{amount:'0',currency:'SEK'}});

  // Quatre thèmes, petites largeurs et étiquettes utilisables.
  for(const width of [320,390])for(const theme of ['sauge','cyan','sauge-dark','cyan-dark']){
   await p.setViewportSize({width,height:844});await p.evaluate(t=>document.documentElement.dataset.theme=t,theme);await garage(p);
   assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`débordement ${theme}/${width}`);
   const b=button(p,first);await b.scrollIntoViewIfNeeded();assert.ok((await b.boundingBox()).height>=44,`zone tactile ${theme}/${width}`);
   await b.click();assert.ok(await p.getByLabel('Couleur de carrosserie').isVisible());
   assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`dialogue déborde ${theme}/${width}`);await close(p);
  }
  await p.setViewportSize({width:390,height:844});

  // Format futur non interprété, conservé et sans HTML exécutable.
  await p.evaluate(async id=>{const {LocalDatabase,DB_CONTRACT}=await import('./js/db.js'),db=await new LocalDatabase().open(DB_CONTRACT, "corrections-compteur-v1"),d=await db.readAll(),v=d.vehicles.find(x=>x.id===id);v.vigieVehicleProfile={version:2,bodyColor:'<img src=x onerror=alert(1)>',future:{garder:true}};await db.apply([{store:'vehicles',type:'put',value:v}]);db.db.close();},first);
  await p.reload({waitUntil:'networkidle'});await garage(p);await button(p,first).click();assert.equal(await p.locator('#modal button[type=submit]').count(),0);assert.match(await p.locator('#modal').innerText(),/conservées sans modification/i);assert.equal(await p.locator('#modal img[onerror]').count(),0);await close(p);
  await p.locator(`[data-action="edit-vehicle"][data-id="${first}"]`).click();await field(p,'notes').fill('Note fictive');await submit(p);
  after=await records(p);assert.deepEqual(readCar(after,first).vigieVehicleProfile,{version:2,bodyColor:'<img src=x onerror=alert(1)>',future:{garder:true}});

  // Un changement ou une suppression dans un autre onglet ne peut pas être écrasé.
  await p.reload({waitUntil:'networkidle'});const q=await ctx.newPage();q.on('dialog',d=>d.accept());q.on('pageerror',e=>errors.push(e.message));await q.goto(url,{waitUntil:'networkidle'});
  await garage(p);await garage(q);await button(p,second).click();await field(p,'profileBodyColor').fill('Vert');
  await q.locator(`[data-action="vehicle-marker"][data-id="${second}"]`).click();await field(q,'vehicleMarker').selectOption('rose');await submit(q);const latest=await records(q);
  await p.locator('#modal button[type=submit]').click();await p.locator('#modal .form-error.visible').waitFor();assert.match(await p.locator('#modal .form-error').innerText(),/ont changé dans un autre onglet/i);assert.deepEqual(await records(p),latest);await close(p);
  await p.reload({waitUntil:'networkidle'});await q.reload({waitUntil:'networkidle'});await garage(p);await garage(q);await button(p,second).click();await field(p,'profileBodyColor').fill('Orange');
  await q.locator(`[data-action="delete-vehicle"][data-id="${second}"]`).click();await q.waitForFunction(id=>!document.querySelector(`[data-action="vehicle-profile"][data-id="${id}"]`),second);const deleted=await records(q);
  await p.locator('#modal button[type=submit]').click();await p.locator('#modal .form-error.visible').waitFor();assert.deepEqual(await records(p),deleted,'véhicule supprimé non recréé');await close(p);await q.close();

  // Import v5 fictif et extensions numériques exactes, puis modification d'un seul champ.
  const fixture=fs.readFileSync(path.join(__dirname,'fixtures','pwa-v5-operations.json'),'utf8'),id='0fd9a931-a838-40c6-a7f4-0471b9430eb6';
  const raw=fixture.replace(`"id": "${id}",`,`"vigieVehicleProfile":{"version":1,"bodyColor":"Vert","insurance":{"company":"Fictive","policyNumber":"ABC","expiryDate":"2028-09-05","future":12345678901234567890.125},"purchase":{"date":"2020-05-18","amount":"12345678901234567890.125","currency":"CHF","extra":{"x":true}},"future":12345678901234567890.125},\n        "id": "${id}",`);
  assert.ok(raw.includes('"vigieVehicleProfile"'));await go(p,'parametres','Paramètres');await p.locator('#import-file').setInputFiles({name:'fictif-v5.json',mimeType:'application/json',buffer:Buffer.from(raw)});await p.waitForFunction(()=>document.querySelector('#toast')?.textContent.includes('importée'));
  const rawBefore=await exportRaw(p),dataBefore=JSON.parse(rawBefore).data;await garage(p);await button(p,id).click();await field(p,'profileBodyColor').fill('Gris perle');await submit(p);
  const rawAfter=await exportRaw(p),dataAfter=JSON.parse(rawAfter).data,one=structuredClone(dataBefore);readCar(one,id).vigieVehicleProfile.bodyColor='Gris perle';assert.deepEqual(dataAfter,one);assert.match(rawAfter,/12345678901234567890\.125/);
  if(process.env.VIGIE_PROFILE_BRIDGE_OUT)fs.writeFileSync(process.env.VIGIE_PROFILE_BRIDGE_OUT,rawAfter);
  await p.evaluate(()=>navigator.serviceWorker.ready);await p.waitForFunction(()=>!!navigator.serviceWorker.controller);
  if(useWebkit)s.offline=true;else await ctx.setOffline(true);
  await p.reload({waitUntil:'load'});await garage(p);await button(p,id).click();await field(p,'profileInsurer').fill('Nouvelle fictive');await submit(p);
  const offline=await exportRaw(p);assert.match(offline,/12345678901234567890\.125/);assert.equal(JSON.parse(offline).data.vehicles[0].vigieVehicleProfile.insurance.company,'Nouvelle fictive');assert.deepEqual(errors,[]);
  await ctx.close();console.log(`✓ ${engine.name()} : fiche facultative, montants et devises, annulations, conflits, formats inconnus, quatre thèmes, sauvegarde v5 et hors ligne.`);
 }finally{if(browser)await browser.close();await new Promise(r=>s.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
