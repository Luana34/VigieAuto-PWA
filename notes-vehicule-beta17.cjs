/* Notes fictives : ancien texte, sélection tactile, aperçu sûr, concurrence,
 * sauvegarde et fonctionnement hors ligne. Aucun téléphone réel requis. */
const assert=require('node:assert/strict'),fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const {chromium,webkit}=require('playwright');
const useWebkit=process.env.VIGIE_BROWSER==='webkit',engine=useWebkit?webkit:chromium;
const root=process.env.VIGIE_SITE_DIR?path.resolve(process.env.VIGIE_SITE_DIR):path.resolve(__dirname,'..');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.webmanifest':'application/manifest+json'};
async function serve(){const s=http.createServer((req,res)=>{if(s.offline){req.socket.destroy();return;}let f=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(f!==root&&!f.startsWith(root+path.sep))return res.writeHead(403).end();if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=path.join(f,'index.html');if(!fs.existsSync(f)||!fs.statSync(f).isFile())return res.writeHead(404).end();res.writeHead(200,{'content-type':mime[path.extname(f)]||'application/octet-stream','cache-control':'no-store'});fs.createReadStream(f).pipe(res);});await new Promise(r=>s.listen(0,'127.0.0.1',r));return{s,url:`http://127.0.0.1:${s.address().port}/`};}
const go=async(p,r,label)=>{await p.evaluate(x=>location.hash=x,r);await p.waitForFunction(x=>document.title===`${x} — VigieAuto`,label);};
const garage=p=>go(p,'garage','Mes véhicules');
const records=p=>p.evaluate(async()=>{const {LocalDatabase,DB_CONTRACT}=await import('./js/db.js');const db=await new LocalDatabase().open(DB_CONTRACT, "corrections-compteur-v1");const r=await db.readAll();db.db.close();return r;});
const replaceCar=async(p,vehicle)=>p.evaluate(async v=>{const {LocalDatabase,DB_CONTRACT}=await import('./js/db.js');const db=await new LocalDatabase().open(DB_CONTRACT, "corrections-compteur-v1");await db.apply([{type:'put',store:'vehicles',value:v}]);db.db.close();},vehicle);
const getCar=(data,id)=>data.vehicles.find(v=>v.id===id);
const field=(p,n)=>p.locator(`#modal [name="${n}"]`);
const notesButton=(p,id)=>p.locator(`[data-action="vehicle-notes"][data-id="${id}"]`);
const close=async p=>{await p.locator('#modal [data-action=close-modal]').first().click();await p.locator('#modal').waitFor({state:'hidden'});};
const submit=async p=>{await p.locator('#modal button[type=submit]').click();await p.locator('#modal').waitFor({state:'hidden'});};
const openNotes=async(p,id)=>{await notesButton(p,id).click();await p.locator('#modal form[data-form=vehicle-notes]').waitFor();};
const select=async(p,text)=>{await field(p,'noteText').evaluate((e,t)=>{const i=e.value.indexOf(t);if(i<0)throw Error('Texte de sélection absent');e.focus();e.setSelectionRange(i,i+t.length);e.dispatchEvent(new Event('select',{bubbles:true}));},text);};
const exportRaw=async p=>{await go(p,'parametres','Paramètres');const e=p.waitForEvent('download');await p.locator('[data-action=export]').click();return fs.readFileSync(await(await e).path(),'utf8');};
async function addCar(p,brand,model){await garage(p);await p.locator('[data-action=add-vehicle]').first().click();await field(p,'brand').fill(brand);await field(p,'model').fill(model);await field(p,'odometer').fill('12000');await submit(p);return (await records(p)).vehicles.find(v=>v.brand===brand&&v.model===model).id;}
(async()=>{
 const {s,url}=await serve();let browser;
 try {
  browser=await engine.launch(useWebkit?{headless:true}:{headless:true,args:['--no-sandbox']});
  const ctx=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,locale:'fr-FR',timezoneId:'Europe/Paris',colorScheme:useWebkit?'dark':'light',acceptDownloads:true});
  const p=await ctx.newPage(),errors=[],dialogs=[];let allow=true;
  p.on('pageerror',e=>errors.push(e.message));p.on('dialog',async d=>{dialogs.push(d.message());const answer=allow;allow=true;if(answer)await d.accept();else await d.dismiss();});
  await p.goto(url,{waitUntil:'networkidle'});await p.locator('[data-action=start-real]').click();
  await field(p,'brand').fill('Renault');await field(p,'model').fill('Clio');await field(p,'odometer').fill('12345');await submit(p);
  const first=(await records(p)).vehicles[0].id,second=await addCar(p,'Peugeot','208');
  let state=await records(p),v=getCar(state,first);
  const oldText='\n  Bonjour 🚙 <img src=x onerror="window.__vigie_xss=1">\r\n  Fin  ';
  v.notes=oldText;v.unknownFictif={keep:'propriété',nested:[1,'é']};await replaceCar(p,v);await p.reload({waitUntil:'networkidle'});await garage(p);
  // L'ancien formulaire ne rogne ni les espaces ni les retours à la ligne inchangés.
  await p.locator(`[data-action=edit-vehicle][data-id="${first}"]`).click();
  assert.ok((await field(p,'notes').inputValue()).startsWith('\n  Bonjour'));
  await field(p,'vin').fill('VIN-FICTIF');await submit(p);
  state=await records(p);assert.equal(getCar(state,first).notes,oldText);assert.equal(state.settings.find(x=>x.id==='activeVehicle').value,first);
  // Repasser sur le véhicule précédent pour vérifier l'édition d'un véhicule inactif.
  await p.locator(`[data-action=select-vehicle][data-id="${second}"]`).click();state=await records(p);
  await openNotes(p,first);assert.match(await p.locator('#modal').innerText(),/Android actuel/);
  const contrasts=await p.locator('[data-note-preview]').evaluate(e=>{const root=document.documentElement,old=root.dataset.theme;const rgb=x=>x.match(/[\d.]+/g).slice(0,3).map(Number);const lum=c=>{const v=c.map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4});return .2126*v[0]+.7152*v[1]+.0722*v[2]};const out={};for(const name of ['sauge','cyan','sauge-dark','cyan-dark']){root.dataset.theme=name;const s=getComputedStyle(e),a=lum(rgb(s.color)),b=lum(rgb(s.backgroundColor));out[name]=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);}root.dataset.theme=old;return out;});
  for(const [theme,contrast] of Object.entries(contrasts))assert.ok(contrast>=4.5,`contraste de l'aperçu ${theme}: ${contrast}`);
  await p.setViewportSize({width:320,height:700});assert.ok(await p.locator('#modal .modal-body').evaluate(e=>e.scrollWidth<=e.clientWidth),'pas de débordement horizontal à 320 px');await p.setViewportSize({width:390,height:844});
  assert.equal(await p.evaluate(()=>!window.dispatchEvent(new Event('beforeunload',{cancelable:true}))),false);
  await select(p,'Bonjour');await p.locator('[data-action=vehicle-notes-style][data-style=bold]').tap();
  assert.equal(await p.locator('[data-note-preview] strong').innerText(),'Bonjour');
  assert.equal(await p.locator('[data-note-preview] img').count(),0);assert.equal(await p.evaluate(()=>window.__vigie_xss||0),0);
  assert.equal(await p.evaluate(()=>!window.dispatchEvent(new Event('beforeunload',{cancelable:true}))),true);
  allow=false;if(useWebkit)await p.locator('#modal [data-action=close-modal]').first().click();else await p.keyboard.press('Escape');assert.equal(await p.locator('#modal').isVisible(),true);assert.match(dialogs.at(-1),/non enregistrées/);
  await close(p);assert.deepEqual(await records(p),state,'annulation confirmée sans écriture');
  // Mise en forme volontaire ; la normalisation des CR/LF est annoncée et annulable.
  await openNotes(p,first);await select(p,'Bonjour');await p.locator('[data-action=vehicle-notes-style][data-style=bold]').tap();
  allow=false;await p.locator('#modal button[type=submit]').click();assert.match(dialogs.at(-1),/anciens retours à la ligne seront normalisés/i);assert.deepEqual(await records(p),state);
  assert.equal(await field(p,'noteText').getAttribute('readonly'),null,'le brouillon redevient modifiable après refus');
  if(!useWebkit){
    await p.evaluate(()=>{const old=crypto.subtle.digest;crypto.subtle.digest=async function(...args){await new Promise(r=>setTimeout(r,300));return old.apply(this,args);};window.__restoreDigest=()=>{crypto.subtle.digest=old;};});
    await p.locator('#modal button[type=submit]').click();
    await p.waitForFunction(()=>document.querySelector('#modal [name=noteText]')?.readOnly);
    assert.equal(await p.locator('[data-action=vehicle-notes-style][data-style=bold]').isDisabled(),true);
    await p.locator('#modal').waitFor({state:'hidden'});await p.evaluate(()=>window.__restoreDigest());
  }else await submit(p);
  let after=await records(p),changed=structuredClone(state);v=getCar(after,first);
  const expectedText=oldText.replace(/\r\n?/g,'\n');assert.equal(v.notes,expectedText);assert.equal(v.vigieVehicleNotes.version,1);
  assert.equal(v.vigieVehicleNotes.algorithm,'sha256-utf16be-v1');assert.equal(JSON.stringify(v.vigieVehicleNotes).includes('Bonjour'),false);
  getCar(changed,first).notes=expectedText;getCar(changed,first).vigieVehicleNotes=v.vigieVehicleNotes;
  assert.deepEqual(after,changed,'seules note et extension choisie ont changé');assert.equal(after.settings.find(x=>x.id==='activeVehicle').value,second);
  // Le formulaire historique protège toute note enrichie et conserve la structure.
  await p.locator(`[data-action=edit-vehicle][data-id="${first}"]`).click();assert.equal(await field(p,'notes').getAttribute('readonly'),'');
  await field(p,'version').fill('Finition fictive');await submit(p);after=await records(p);assert.deepEqual(getCar(after,first).vigieVehicleNotes,v.vigieVehicleNotes);
  await openNotes(p,first);assert.equal(await p.locator('[data-note-preview] strong').innerText(),'Bonjour');await submit(p);
  assert.deepEqual(await records(p),after,'enregistrement sans changement : aucune écriture');
  await openNotes(p,first);await select(p,'Fin');await p.locator('[data-action=vehicle-notes-style][data-style=italic]').tap();
  assert.equal(await p.locator('[data-note-preview] em').innerText(),'Fin');allow=false;await p.locator('#modal button[type=submit]').click();assert.deepEqual(await records(p),after);await submit(p);after=await records(p);
  assert.equal(getCar(after,first).vigieVehicleNotes.marks.length,2);
  // Dépassement de limite : le brouillon reste visible, les données intactes.
  await openNotes(p,first);await field(p,'noteText').fill('X'.repeat(8001));
  assert.match(await p.locator('[data-note-count]').innerText(),/8001/);await p.locator('#modal button[type=submit]').click();
  assert.match(await p.locator('#modal .form-error').innerText(),/8000/);assert.deepEqual(await records(p),after);await close(p);
  // Export/import JSON volontaire, y compris extensions et marques.
  const raw=await exportRaw(p);assert.equal(JSON.parse(raw).data.vehicles.find(x=>x.id===first).notes,expectedText);
  if(process.env.VIGIE_NOTES_BRIDGE_OUT)fs.writeFileSync(process.env.VIGIE_NOTES_BRIDGE_OUT,raw);
  await p.locator('#import-file').setInputFiles({name:'notes-fictives.json',mimeType:'application/json',buffer:Buffer.from(raw)});
  await p.waitForFunction(()=>document.querySelector('#toast')?.textContent.includes('importée'));
  assert.deepEqual((await records(p)),after);await garage(p);await openNotes(p,first);
  assert.equal(await p.locator('[data-note-preview] strong').innerText(),'Bonjour');assert.equal(await p.locator('[data-note-preview] em').innerText(),'Fin');await close(p);
  // Test du service worker et d'une modification réellement hors réseau.
  await p.evaluate(()=>navigator.serviceWorker.ready);await p.waitForFunction(()=>!!navigator.serviceWorker.controller);
  if(useWebkit)s.offline=true;else await ctx.setOffline(true);
  await p.reload({waitUntil:'load'});await garage(p);await openNotes(p,first);
  await field(p,'noteText').fill('Ajout hors ligne\n'+expectedText);await submit(p);const offline=await records(p);
  assert.equal(getCar(offline,first).notes,'Ajout hors ligne\n'+expectedText);assert.equal(getCar(offline,first).vigieVehicleNotes.marks.length,2);
  if(useWebkit)s.offline=false;else await ctx.setOffline(false);
  // Deux véritables pages, transaction contrôlée contre le véhicule initial.
  await openNotes(p,first);await field(p,'noteText').fill(getCar(offline,first).notes+' Brouillon A');
  const p2=await ctx.newPage();p2.on('dialog',d=>d.accept());p2.on('pageerror',e=>errors.push(e.message));
  await p2.goto(url,{waitUntil:'networkidle'});await garage(p2);await p2.locator(`[data-action=edit-vehicle][data-id="${first}"]`).click();await field(p2,'vin').fill('VIN-GAGNANT');await submit(p2);
  const winner=await records(p2);await p.locator('#modal button[type=submit]').click();
  await p.locator('#modal .form-error.visible').waitFor();assert.match(await p.locator('#modal .form-error').innerText(),/modifi|chang|recharg|fenêtre/i);assert.deepEqual(await records(p),winner,'le brouillon ne remplace pas la modification concurrente');await close(p);await p2.close();
  // Simule un texte modifié par une ancienne version Android : l'extension est intacte mais périmée.
  v=getCar(winner,first);const oldExtension=structuredClone(v.vigieVehicleNotes);v.notes='Texte modifié sur Android 🚗';await replaceCar(p,v);await p.reload({waitUntil:'networkidle'});await garage(p);
  await openNotes(p,first);assert.match(await p.locator('[data-stale-note]').innerText(),/autre version/);
  assert.equal(await field(p,'noteText').getAttribute('readonly'),'');assert.equal(await p.locator('#modal button[type=submit]').isDisabled(),true);
  allow=false;await p.locator('[data-action=vehicle-notes-reset]').click();assert.deepEqual(getCar(await records(p),first).vigieVehicleNotes,oldExtension);
  await p.locator('[data-action=vehicle-notes-reset]').click();assert.match(await p.locator('[data-stale-note]').innerText(),/tant que vous ne validez pas/);
  allow=false;await p.locator('#modal [data-action=close-modal]').first().click();assert.equal(await p.locator('#modal').isVisible(),true);await close(p);
  assert.deepEqual(getCar(await records(p),first).vigieVehicleNotes,oldExtension);
  await openNotes(p,first);await p.locator('[data-action=vehicle-notes-reset]').click();allow=false;await p.locator('#modal button[type=submit]').click();
  assert.deepEqual(getCar(await records(p),first).vigieVehicleNotes,oldExtension);await submit(p);
  v=getCar(await records(p),first);assert.equal(v.notes,'Texte modifié sur Android 🚗');assert.deepEqual(v.vigieVehicleNotes.marks,[]);
  // Extensions inconnues et notes trop longues ne sont jamais écrasées.
  v.vigieVehicleNotes={version:99,contenu:'inconnu',future:{keep:true}};await replaceCar(p,v);await p.reload({waitUntil:'networkidle'});await garage(p);
  await notesButton(p,first).click();assert.match(await p.locator('#modal').innerText(),/pas reconnues/);await close(p);
  await p.locator(`[data-action=edit-vehicle][data-id="${first}"]`).click();assert.equal(await field(p,'notes').getAttribute('readonly'),'');await field(p,'vin').fill('VIN-AUTRE');await submit(p);
  v=getCar(await records(p),first);assert.deepEqual(v.vigieVehicleNotes,{version:99,contenu:'inconnu',future:{keep:true}});assert.equal(v.notes,'Texte modifié sur Android 🚗');
  delete v.vigieVehicleNotes;v.notes='X'.repeat(8001);await replaceCar(p,v);await p.reload({waitUntil:'networkidle'});await garage(p);
  await notesButton(p,first).click();assert.match(await p.locator('#modal').innerText(),/dépassent 8000/);await close(p);
  assert.equal(getCar(await records(p),first).notes.length,8001);
  // Absence et null historiques restent distincts lorsque seul un autre champ est édité.
  for(const marker of ['absent','null']){
    v=getCar(await records(p),second);if(marker==='absent')delete v.notes;else v.notes=null;await replaceCar(p,v);await p.reload({waitUntil:'networkidle'});await garage(p);
    await p.locator(`[data-action=edit-vehicle][data-id="${second}"]`).click();await field(p,'vin').fill(`VIN-${marker}`);await submit(p);
    v=getCar(await records(p),second);if(marker==='absent')assert.equal(Object.hasOwn(v,'notes'),false);else assert.equal(v.notes,null);
  }
  // Une suppression concurrente ne doit jamais recréer le véhicule du brouillon.
  const third=await addCar(p,'Marque fictive','Modèle temporaire');await openNotes(p,third);await field(p,'noteText').fill('Brouillon non enregistré');
  const deleter=await ctx.newPage();deleter.on('dialog',d=>d.accept());deleter.on('pageerror',e=>errors.push(e.message));await deleter.goto(url,{waitUntil:'networkidle'});await garage(deleter);
  await deleter.locator(`[data-action=delete-vehicle][data-id="${third}"]`).click();await deleter.waitForFunction(key=>!document.querySelector(`[data-action=vehicle-notes][data-id="${key}"]`),third);
  await p.locator('#modal button[type=submit]').click();await p.locator('#modal .form-error.visible').waitFor();
  assert.equal((await records(p)).vehicles.some(x=>x.id===third),false);await close(p);await deleter.close();
  assert.deepEqual(errors,[]);await ctx.close();
  console.log(`✓ ${engine.name()} : anciennes notes, tactile, aperçu sûr, annulations, conflits, formats inconnus, export/import et hors ligne.`);
 }finally{if(browser)await browser.close();await new Promise(r=>s.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
