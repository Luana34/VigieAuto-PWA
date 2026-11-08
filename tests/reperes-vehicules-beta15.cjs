/* Parcours fictifs : repères locaux, sauvegarde, conflits entre onglets et hors ligne.
 * VIGIE_SITE_DIR permet de servir la copie publique extraite de l'archive.
 * VIGIE_MARKER_BRIDGE_OUT écrit un export fictif pour le contrôle séparé Android/Room. */
const assert = require('node:assert/strict');
const fs = require('node:fs'), http = require('node:http'), path = require('node:path');
const { chromium, webkit } = require('playwright');
const useWebkit = process.env.VIGIE_BROWSER === 'webkit', engine = useWebkit ? webkit : chromium;
const root = process.env.VIGIE_SITE_DIR ? path.resolve(process.env.VIGIE_SITE_DIR) : path.resolve(__dirname, '..');
const mime = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.webmanifest':'application/manifest+json'};
async function serve() {
  const s=http.createServer((req,res)=>{
    if(s.offline){req.socket.destroy();return;}
    let file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
    if(file!==root&&!file.startsWith(root+path.sep))return res.writeHead(403).end();
    if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
    if(!fs.existsSync(file)||!fs.statSync(file).isFile())return res.writeHead(404).end();
    res.writeHead(200,{'content-type':mime[path.extname(file)]||'application/octet-stream','cache-control':'no-store'});fs.createReadStream(file).pipe(res);
  });
  await new Promise(r=>s.listen(0,'127.0.0.1',r));return {s,url:`http://127.0.0.1:${s.address().port}/`};
}
const go=async(p,route,label)=>{await p.evaluate(v=>location.hash=v,route);await p.waitForFunction(v=>document.title===`${v} — VigieAuto`,label);};
const garage=async p=>go(p,'garage','Mes véhicules');
const records=p=>p.evaluate(async()=>{const {LocalDatabase,DB_CONTRACT}=await import('./js/db.js');const db=await new LocalDatabase().open(DB_CONTRACT, "corrections-compteur-v1");const value=await db.readAll();db.db.close();return value;});
const markerButton=(p,id)=>p.locator(`[data-action="vehicle-marker"][data-id="${id}"]`);
const editButton=(p,id)=>p.locator(`[data-action="edit-vehicle"][data-id="${id}"]`);
const select=p=>p.locator('#modal [name="vehicleMarker"]');
const submit=async p=>{await p.locator('#modal button[type=submit]').click();await p.locator('#modal').waitFor({state:'hidden'});};
const close=async p=>{await p.locator('#modal [data-action=close-modal]').first().click();await p.locator('#modal').waitFor({state:'hidden'});};
const exportRaw=async p=>{await go(p,'parametres','Paramètres');const ev=p.waitForEvent('download');await p.locator('[data-action=export]').click();return fs.readFileSync(await(await ev).path(),'utf8');};
const byId=(data,id)=>data.vehicles.find(v=>v.id===id);
function contrast(foreground,background){
 const luminance=value=>{const c=value.match(/\d+(?:\.\d+)?/g).slice(0,3).map(Number).map(n=>n/255).map(n=>n<=.04045?n/12.92:((n+.055)/1.055)**2.4);return .2126*c[0]+.7152*c[1]+.0722*c[2];};
 const a=luminance(foreground),b=luminance(background);return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);
}
async function create(p,brand,model,km){
 await garage(p);await p.locator('[data-action=add-vehicle]').first().click();
 await p.locator('#modal [name=brand]').fill(brand);await p.locator('#modal [name=model]').fill(model);await p.locator('#modal [name=odometer]').fill(String(km));await submit(p);
 const all=await records(p);return all.vehicles.find(v=>v.brand===brand&&v.model===model).id;
}
async function changeMarker(p,id,value){await garage(p);await markerButton(p,id).click();await select(p).selectOption(value);await submit(p);}
(async()=>{
 const {s,url}=await serve();let browser;
 try{
  browser=await engine.launch(useWebkit?{headless:true}:{headless:true,args:['--no-sandbox']});
  const ctx=await browser.newContext({viewport:{width:390,height:844},locale:'fr-FR',timezoneId:'Europe/Paris',acceptDownloads:true});
  const p=await ctx.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('dialog',d=>d.accept());
  await p.goto(url,{waitUntil:'networkidle'});await p.locator('[data-action=start-real]').click();
  await p.locator('#modal [name=brand]').fill('Renault');await p.locator('#modal [name=model]').fill('Clio');await p.locator('#modal [name=odometer]').fill('12345');await submit(p);
  let all=await records(p),first=all.vehicles[0].id;assert.ok(!Object.hasOwn(all.vehicles[0],'vigieVehicleMarker'));
  await garage(p);assert.equal(await p.locator('.vehicle-marker').count(),0,'aucun repère sans choix');
  const beforeCancel=await records(p);await markerButton(p,first).click();
  assert.equal(await select(p).inputValue(),'');assert.match(await p.locator('#modal').innerText(),/ce n’est pas la couleur de la carrosserie/i);
  await select(p).selectOption('rose');await close(p);assert.deepEqual(await records(p),beforeCancel,'annulation sans écriture');
  await changeMarker(p,first,'bleu');all=await records(p);
  assert.deepEqual(byId(all,first),{...byId(beforeCancel,first),vigieVehicleMarker:{version:1,color:'bleu'}});
  for(const name of Object.keys(all).filter(n=>n!=='vehicles'))assert.deepEqual(all[name],beforeCancel[name],`aucune autre collection modifiée : ${name}`);
  const second=await create(p,'Peugeot','208',23456),beforeSecond=await records(p);
  await changeMarker(p,second,'orange');all=await records(p);
  assert.equal(byId(all,first).vigieVehicleMarker.color,'bleu');assert.equal(byId(all,second).vigieVehicleMarker.color,'orange');
  assert.deepEqual(all.settings,beforeSecond.settings,'un repère ne change pas le véhicule actif');

  // Les couleurs sont aussi nommées et lisibles dans les quatre thèmes.
  for(const width of [320,390])for(const theme of ['sauge','cyan','sauge-dark','cyan-dark']){
    await p.setViewportSize({width,height:844});await p.evaluate(t=>{document.documentElement.dataset.theme=t;},theme);await garage(p);
    assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`débordement ${theme}/${width}`);
    for(const id of [first,second]){
      const button=markerButton(p,id);await button.scrollIntoViewIfNeeded();assert.ok((await button.boundingBox()).height>=44);
    }
    const badges=p.locator('.vehicle-tile .vehicle-marker');assert.equal(await badges.count(),2);
    for(let i=0;i<2;i++){
      const b=badges.nth(i);await b.scrollIntoViewIfNeeded();
      const st=await b.evaluate(el=>({fg:getComputedStyle(el).color,bg:getComputedStyle(el).backgroundColor,weight:Number(getComputedStyle(el).fontWeight),size:parseFloat(getComputedStyle(el).fontSize),dot:el.querySelector('.vehicle-marker-dot').getBoundingClientRect().width}));
      assert.ok(contrast(st.fg,st.bg)>=4.5,`contraste du texte ${theme}/${width}`);assert.ok(st.weight>=700&&st.size>=13&&st.dot>=15);
      assert.match(await b.innerText(),/Repère (bleu|orange)/);
    }
    await go(p,'accueil','Tableau de bord');assert.match(await p.locator('.garage-hero .vehicle-marker').innerText(),/Repère orange/);
  }
  await p.setViewportSize({width:390,height:844});await garage(p);
  await p.locator(`[data-action=select-vehicle][data-id="${first}"]`).click();
  await p.waitForFunction(id=>document.querySelector(`[data-action="vehicle-marker"][data-id="${id}"]`)?.closest('.vehicle-tile')?.querySelector('.tag')?.textContent==='Actif',first);
  await go(p,'accueil','Tableau de bord');assert.match(await p.locator('.garage-hero .vehicle-marker').innerText(),/Repère bleu/);

  // Une future extension inconnue reste lisible par les autres champs et ne peut pas être écrasée.
  await p.evaluate(async(id)=>{
    const {LocalDatabase,DB_CONTRACT}=await import('./js/db.js'),db=await new LocalDatabase().open(DB_CONTRACT, "corrections-compteur-v1"),data=await db.readAll(),v=data.vehicles.find(x=>x.id===id);
    v.vigieVehicleMarker={version:2,color:'<svg onload=alert(1)>',future:{garder:[1,2]}};v.futureVehicule={garder:true};
    await db.apply([{store:'vehicles',type:'put',value:v}]);db.db.close();
  },first);
  await p.reload({waitUntil:'networkidle'});await garage(p);await markerButton(p,first).click();
  assert.equal(await p.locator('#f-vehicleMarker').isDisabled(),true);assert.equal(await p.locator('#modal button[type=submit]').count(),0);
  assert.match(await p.locator('#modal').innerText(),/conservé sans modification/i);assert.equal(await p.locator('#modal svg[onload]').count(),0);await close(p);
  await editButton(p,first).click();await p.locator('#modal [name=notes]').fill('Note locale fictive');await submit(p);
  all=await records(p);assert.deepEqual(byId(all,first).vigieVehicleMarker,{version:2,color:'<svg onload=alert(1)>',future:{garder:[1,2]}});assert.deepEqual(byId(all,first).futureVehicule,{garder:true});
  // Restaurer une valeur connue uniquement pour l'essai fictif de concurrence.
  await p.evaluate(async(id)=>{const {LocalDatabase,DB_CONTRACT}=await import('./js/db.js'),db=await new LocalDatabase().open(DB_CONTRACT, "corrections-compteur-v1"),data=await db.readAll(),v=data.vehicles.find(x=>x.id===id);v.vigieVehicleMarker={version:1,color:'bleu',futur:{ok:true}};await db.apply([{store:'vehicles',type:'put',value:v}]);db.db.close();},first);
  await p.reload({waitUntil:'networkidle'});await garage(p);
  const q=await ctx.newPage();q.on('dialog',d=>d.accept());q.on('pageerror',e=>errors.push(e.message));await q.goto(url,{waitUntil:'networkidle'});await garage(q);
  await editButton(p,first).click();await changeMarker(q,first,'vert');const afterQ=await records(q);
  await p.locator('#modal [name=notes]').fill('Brouillon trop ancien');await p.locator('#modal button[type=submit]').click();
  await p.locator('#modal .form-error.visible').waitFor();assert.match(await p.locator('#modal .form-error').innerText(),/a changé ou a été supprimé/i);
  assert.deepEqual(await records(p),afterQ,'la fiche périmée n’écrase pas le repère');await close(p);
  await p.reload({waitUntil:'networkidle'});await garage(p);await q.reload({waitUntil:'networkidle'});await garage(q);
  await markerButton(p,first).click();await select(p).selectOption('turquoise');await changeMarker(q,first,'rose');const afterOther=await records(q);
  await p.locator('#modal button[type=submit]').click();await p.locator('#modal .form-error.visible').waitFor();
  assert.match(await p.locator('#modal .form-error').innerText(),/ont changé dans un autre onglet/i);assert.deepEqual(await records(p),afterOther,'repère concurrent préservé');await close(p);

  // Un ancien formulaire de symptôme ou de contrôle peut aussi mettre à jour
  // le compteur : il ne doit pas effacer le repère créé par un autre onglet.
  await p.reload({waitUntil:'networkidle'});await q.reload({waitUntil:'networkidle'});
  await go(p,'symptomes','Symptômes');await p.locator('[data-action=add-symptom]').first().click();
  await p.locator('#modal [name=title]').fill('Observation fictive');await p.locator('#modal [name=odometer]').fill('12400');
  await changeMarker(q,first,'violet');const afterSymptomConflict=await records(q);
  await p.locator('#modal button[type=submit]').click();await p.locator('#modal .form-error.visible').waitFor();
  assert.match(await p.locator('#modal .form-error').innerText(),/ont changé dans un autre onglet/i);
  assert.deepEqual(await records(p),afterSymptomConflict,'symptôme périmé : aucun écrasement ni enregistrement partiel');await close(p);
  await p.reload({waitUntil:'networkidle'});await go(p,'symptomes','Symptômes');await p.locator('[data-action=add-symptom]').first().click();
  await p.locator('#modal [name=title]').fill('Observation après relecture');await p.locator('#modal [name=odometer]').fill('12400');await submit(p);
  let saved=await records(p);assert.equal(byId(saved,first).vigieVehicleMarker.color,'violet');assert.equal(byId(saved,first).odometer,12400);assert.equal(saved.symptoms.length,1);

  await p.reload({waitUntil:'networkidle'});await q.reload({waitUntil:'networkidle'});
  await go(p,'controles','Contrôles qualité');await p.locator('[data-action=run-check]').first().click();
  for(const radio of await p.locator('#modal input[type=radio][value=ok]').all())await radio.check();
  await p.locator('#modal [name=odometer]').fill('12500');await changeMarker(q,first,'orange');const afterCheckConflict=await records(q);
  await p.locator('#modal button[type=submit]').click();await p.locator('#modal .form-error.visible').waitFor();
  assert.match(await p.locator('#modal .form-error').innerText(),/ont changé dans un autre onglet/i);
  assert.deepEqual(await records(p),afterCheckConflict,'contrôle périmé : aucun écrasement ni enregistrement partiel');await close(p);
  await p.reload({waitUntil:'networkidle'});await go(p,'controles','Contrôles qualité');await p.locator('[data-action=run-check]').first().click();
  for(const radio of await p.locator('#modal input[type=radio][value=ok]').all())await radio.check();
  await p.locator('#modal [name=odometer]').fill('12500');await submit(p);
  saved=await records(p);assert.equal(byId(saved,first).vigieVehicleMarker.color,'orange');assert.equal(byId(saved,first).odometer,12500);assert.equal(saved.checks.length,1);

  await p.reload({waitUntil:'networkidle'});await q.reload({waitUntil:'networkidle'});
  await go(p,'symptomes','Symptômes');await p.locator('[data-action=add-symptom]').first().click();
  await p.locator('#modal [name=title]').fill('Ne doit pas être créé');await p.locator('#modal [name=odometer]').fill('13000');
  await garage(q);await q.locator(`[data-action=delete-vehicle][data-id="${first}"]`).click();
  await q.waitForFunction(id=>!document.querySelector(`[data-action="vehicle-marker"][data-id="${id}"]`),first);const afterVehicleDelete=await records(q);
  await p.locator('#modal button[type=submit]').click();await p.locator('#modal .form-error.visible').waitFor();
  assert.deepEqual(await records(p),afterVehicleDelete,'symptôme périmé : pas de véhicule recréé ni d’observation orpheline');await close(p);

  await p.reload({waitUntil:'networkidle'});await garage(p);await q.reload({waitUntil:'networkidle'});await garage(q);
  await markerButton(p,second).click();await select(p).selectOption('violet');await q.locator(`[data-action=delete-vehicle][data-id="${second}"]`).click();
  await q.waitForFunction(id=>!document.querySelector(`[data-action="vehicle-marker"][data-id="${id}"]`),second);const afterDelete=await records(q);
  await p.locator('#modal button[type=submit]').click();await p.locator('#modal .form-error.visible').waitFor();assert.deepEqual(await records(p),afterDelete,'aucune recréation après suppression concurrente');await close(p);await q.close();

  // Import v5 fictif avec extension très précise ; une seule couleur change.
  const fixturePath=path.join(__dirname,'fixtures','pwa-v5-operations.json');
  const originalId='0fd9a931-a838-40c6-a7f4-0471b9430eb6';
  const raw=fs.readFileSync(fixturePath,'utf8').replace(`"id": "${originalId}",`,`"vigieVehicleMarker": {"version":1,"color":"vert","future":{"precise":12345678901234567890.125,"conserver":true}},\n        "id": "${originalId}",`);
  assert.ok(raw.includes('"vigieVehicleMarker"'));
  await go(p,'parametres','Paramètres');await p.locator('#import-file').setInputFiles({name:'fictif-v5.json',mimeType:'application/json',buffer:Buffer.from(raw)});
  await p.waitForFunction(()=>document.querySelector('#toast')?.textContent.includes('importée'));
  const beforeRaw=await exportRaw(p),before=JSON.parse(beforeRaw).data;
  await changeMarker(p,originalId,'bleu');const afterRaw=await exportRaw(p),after=JSON.parse(afterRaw).data;
  const expected=structuredClone(before);expected.vehicles.find(v=>v.id===originalId).vigieVehicleMarker.color='bleu';
  assert.deepEqual(after,expected,'seul le repère choisi diffère de l’export précédent');
  assert.match(afterRaw,/"precise"\s*:\s*12345678901234567890\.125/);assert.equal(JSON.parse(afterRaw).formatVersion,5);
  if(process.env.VIGIE_MARKER_BRIDGE_OUT)fs.writeFileSync(process.env.VIGIE_MARKER_BRIDGE_OUT,afterRaw);
  await p.evaluate(()=>navigator.serviceWorker.ready);await p.waitForFunction(()=>!!navigator.serviceWorker.controller);
  if(useWebkit)s.offline=true;else await ctx.setOffline(true);
  await p.reload({waitUntil:'load'});await garage(p);assert.match(await p.locator('.vehicle-tile .vehicle-marker').innerText(),/Repère bleu/);
  await changeMarker(p,originalId,'turquoise');const offline=await exportRaw(p);assert.match(offline,/12345678901234567890\.125/);
  assert.equal(JSON.parse(offline).data.vehicles[0].vigieVehicleMarker.color,'turquoise');assert.deepEqual(errors,[]);
  await ctx.close();console.log(`✓ ${engine.name()} : choix, annulation, deux véhicules, 4 thèmes, sauvegarde v5, conflits, suppression et hors ligne.`);
 }finally{if(browser)await browser.close();await new Promise(r=>s.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
