/* Vérifications fictives de l'historique hybride : UI réelle, transactions,
 * conflits, annulations, sauvegardes et hors ligne. Ne remplace pas un iPhone. */
const assert=require('node:assert/strict'),fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const {chromium,webkit}=require('playwright');
const useWebkit=process.env.VIGIE_BROWSER==='webkit',engine=useWebkit?webkit:chromium;
const root=process.env.VIGIE_SITE_DIR?path.resolve(process.env.VIGIE_SITE_DIR):path.resolve(__dirname,'..');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.webmanifest':'application/manifest+json'};
async function serve(){const s=http.createServer((req,res)=>{if(s.offline){req.socket.destroy();return;}let f=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(f!==root&&!f.startsWith(root+path.sep))return res.writeHead(403).end();if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=path.join(f,'index.html');if(!fs.existsSync(f)||!fs.statSync(f).isFile())return res.writeHead(404).end();res.writeHead(200,{'content-type':mime[path.extname(f)]||'application/octet-stream','cache-control':'no-store'});fs.createReadStream(f).pipe(res);});await new Promise(r=>s.listen(0,'127.0.0.1',r));return{s,url:`http://127.0.0.1:${s.address().port}/`};}
const go=async(p,r,label)=>{await p.evaluate(x=>location.hash=x,r);await p.waitForFunction(x=>document.title===`${x} — VigieAuto`,label);};
const garage=p=>go(p,'garage','Mes véhicules');
const field=(p,n)=>p.locator(`#modal [name="${n}"]`);
const records=p=>p.evaluate(async()=>{const {LocalDatabase,DB_CONTRACT}=await import('./js/db.js');const db=await new LocalDatabase().open(DB_CONTRACT,'corrections-compteur-v1');const r=await db.readAll();db.db.close();return r;});
const ops=(p,operations)=>p.evaluate(async operations=>{const {LocalDatabase,DB_CONTRACT}=await import('./js/db.js');const db=await new LocalDatabase().open(DB_CONTRACT,'corrections-compteur-v1');await db.apply(operations);db.db.close();},operations);
const car=(data,id)=>data.vehicles.find(v=>v.id===id);
const close=async p=>{await p.locator('#modal [data-action=close-modal]').first().click();await p.locator('#modal').waitFor({state:'hidden'});};
const submit=async p=>{await p.locator('#modal button[type=submit]').click();await p.locator('#modal').waitFor({state:'hidden'});};
const history=async(p,id)=>{await garage(p);await p.locator(`[data-action="vehicle-odometer-history"][data-id="${id}"]`).click();await p.getByRole('heading',{name:'Historique kilométrique'}).waitFor();};
const edit=async(p,id)=>{await garage(p);await p.locator(`[data-action="edit-vehicle"][data-id="${id}"]`).click();await p.locator('#modal form[data-form=vehicle]').waitFor();};
const askCorrection=async(p,km)=>{await field(p,'odometer').fill(String(km));await p.locator('#modal button[type=submit]').click();await p.locator('#modal form[data-form=odometer-correction]').waitFor();};
const confirmCorrection=async(p,{reason='Erreur de saisie',actor='',date='2026-01-04'}={})=>{await field(p,'correctionDate').fill(date);await field(p,'correctionReason').fill(reason);await field(p,'correctionActor').fill(actor);await submit(p);};
const exportRaw=async p=>{await go(p,'parametres','Paramètres');const e=p.waitForEvent('download');await p.locator('[data-action=export]').click();return fs.readFileSync(await(await e).path(),'utf8');};
const importRaw=async(p,raw)=>{await go(p,'parametres','Paramètres');await p.locator('#import-file').setInputFiles({name:'fictif.json',mimeType:'application/json',buffer:Buffer.from(raw)});await p.waitForFunction(()=>document.querySelector('#toast.visible')?.textContent.includes('importée') || document.querySelector('#toast.error'));const t=await p.locator('#toast').innerText();if(!t.includes('importée'))throw Error('Import refusé : '+t);};
(async()=>{
 const {s,url}=await serve();let browser;
 try {
  browser=await engine.launch(useWebkit?{headless:true}:{headless:true,args:['--no-sandbox']});
  const ctx=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,locale:'fr-FR',timezoneId:'Europe/Paris',colorScheme:useWebkit?'dark':'light',acceptDownloads:true});
  const p=await ctx.newPage(),errors=[],dialogs=[];let allow=true;
  p.on('pageerror',e=>errors.push(e.message));p.on('dialog',async d=>{dialogs.push(d.message());const answer=allow;allow=true;if(answer)await d.accept();else await d.dismiss();});
  await p.goto(url,{waitUntil:'networkidle'});await p.locator('[data-action=start-real]').click();
  await field(p,'brand').fill('Renault');await field(p,'model').fill('Clio');await field(p,'odometer').fill('100000');await submit(p);
  let before=await records(p),first=before.vehicles[0].id;
  await garage(p);await p.locator('[data-action=add-vehicle]').first().click();await field(p,'brand').fill('Peugeot');await field(p,'model').fill('208');await field(p,'odometer').fill('200000');await submit(p);
  const second=(await records(p)).vehicles.find(v=>v.model==='208').id;before=await records(p);
  assert.deepEqual(before.odometerCorrections,[],'aucune correction n’est créée pour le compteur initial');
  // Un ancien véhicule sans kilométrage initial ne reçoit pas une valeur inventée lors d'une édition.
  const legacy=structuredClone(car(before,first));delete legacy.initialKm;await ops(p,[{type:'put',store:'vehicles',value:legacy}]);await p.reload({waitUntil:'networkidle'});
  await edit(p,first);await field(p,'vin').fill('ANCIEN');await submit(p);before=await records(p);assert.equal(Object.hasOwn(car(before,first),'initialKm'),false);assert.equal(before.odometerCorrections.length,0);
  // Pendant une lecture de photo ralentie, les champs ne peuvent pas être retouchés et perdus silencieusement.
  await edit(p,first);await field(p,'vin').fill('BROUILLON PHOTO');await field(p,'odometer').fill('99000');await field(p,'photo').setInputFiles(path.join(__dirname,'fixtures/justificatif.png'));
  await p.evaluate(()=>{window.__originalRead=FileReader.prototype.readAsDataURL;FileReader.prototype.readAsDataURL=function(file){setTimeout(()=>window.__originalRead.call(this,file),500);};});
  await p.locator('#modal button[type=submit]').click();await p.waitForFunction(()=>document.querySelector('#modal form[data-form=vehicle] [name=vin]')?.disabled);assert.equal(await field(p,'odometer').isDisabled(),true);assert.deepEqual(await records(p),before);
  await p.locator('#modal form[data-form=odometer-correction]').waitFor();await p.evaluate(()=>{FileReader.prototype.readAsDataURL=window.__originalRead;delete window.__originalRead;});
  await p.locator('#modal [data-action=close-modal]').first().click();await p.locator('#modal form[data-form=vehicle]').waitFor();assert.equal(await field(p,'vin').inputValue(),'BROUILLON PHOTO');assert.equal(await field(p,'photo').evaluate(e=>e.files.length),1);await close(p);assert.deepEqual(await records(p),before);
  // Annuler la confirmation reprend le formulaire original avec les saisies, sans écrire.
  await edit(p,first);await field(p,'vin').fill('BROUILLON');await askCorrection(p,98000);
  assert.match(await p.locator('#modal').innerText(),/Le compteur va diminuer/);
  assert.match(await p.locator('#modal').innerText(),/100\s?000 km/);
  assert.equal(await p.evaluate(()=>!window.dispatchEvent(new Event('beforeunload',{cancelable:true}))),true);
  await p.locator('#modal [data-action=close-modal]').first().click();
  await p.locator('#modal form[data-form=vehicle]').waitFor();assert.equal(await field(p,'vin').inputValue(),'BROUILLON');assert.equal(await field(p,'odometer').inputValue(),'98000');
  assert.deepEqual(await records(p),before,'annulation sans aucune écriture');
  await askCorrection(p,98000);assert.equal(await field(p,'correctionReason').getAttribute('required'),'');
  await confirmCorrection(p,{reason:'Erreur <img src=x onerror=alert(1)>',actor:'Moi',date:'2026-01-04'});
  let after=await records(p);assert.equal(car(after,first).odometer,98000);assert.equal(car(after,first).vin,'BROUILLON');assert.equal(after.odometerCorrections.length,1);
  assert.equal(after.odometerCorrections[0].entry.before,100000);assert.equal(after.odometerCorrections[0].entry.after,98000);
  assert.equal(after.odometerCorrections[0].entry.actor,'Moi');assert.equal(car(after,first).vigieOdometerCorrections.entries.length,0,'table locale séparée des sources');
  assert.equal(after.settings.find(x=>x.id==='activeVehicle').value,first);
  await history(p,first);assert.match(await p.locator('#modal').innerText(),/Correction manuelle/);assert.match(await p.locator('#modal').innerText(),/Erreur <img/);
  assert.equal(await p.locator('#modal img').count(),0,'motif échappé');assert.match(await p.locator('#modal').innerText(),/n’est pas certifié/);
  for(const width of [320,390])for(const theme of ['sauge','cyan','sauge-dark','cyan-dark']){
   await p.setViewportSize({width,height:844});await p.evaluate(t=>document.documentElement.dataset.theme=t,theme);
   assert.equal(await p.locator('#modal .modal-body').evaluate(e=>e.scrollWidth<=e.clientWidth),true,`dialogue ${theme}/${width}`);
   const contrast=await p.locator('.odometer-history-item').first().evaluate(e=>{const rgb=s=>s.match(/[0-9.]+/g).slice(0,3).map(x=>{x=Number(x)/255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4});const lum=s=>{const x=rgb(s);return .2126*x[0]+.7152*x[1]+.0722*x[2]};const style=getComputedStyle(e),a=lum(style.color),b=lum(style.backgroundColor);return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);});
   assert.ok(contrast>=4.5,`contraste historique ${theme}/${width} : ${contrast}`);
  }
  await close(p);await p.setViewportSize({width:390,height:844});
  // Injecter des sources fictives ; la chronologie lit les originaux et signale la baisse inter-jours.
  await ops(p,[
    {type:'put',store:'fills',value:{id:'plein-test',vehicleId:first,date:'2026-01-01',odometer:100000,volume:18.04,unitPrice:1.5,total:27.06,station:'Station fictive',unit:'L',full:false,vigieFuelSubtype:'SP95-E10'}},
    {type:'put',store:'services',value:{id:'entretien-test',vehicleId:first,date:'2026-01-02',odometer:95000,title:'Vidange fictive',category:'vidange',parts:0,labor:0}},
    {type:'put',store:'checks',value:{id:'cq-test',vehicleId:first,date:'2026-01-03',odometer:96000,templateName:'Départ',results:[]}},
    {type:'put',store:'symptoms',value:{id:'symptome-test',vehicleId:first,date:'2026-01-05',odometer:99000,title:'Bruit fictif'}},
    {type:'put',store:'expenses',value:{id:'depense-test',vehicleId:first,date:'2026-01-06',odometer:99500,title:'Péage fictif',amount:2,category:'autre'}}
  ]);
  await p.reload({waitUntil:'networkidle'});await history(p,first);
  let text=await p.locator('#modal').innerText();for(const label of ['Plein','SP95-E10','Partiel','Entretien','Vidange fictive','Contrôle CQ','Symptôme','Dépense'])assert.ok(text.includes(label),label);
  assert.match(text,/Relevé inférieur/);assert.equal((await records(p)).odometerCorrections.length,1,'les sources ne sont pas dupliquées en corrections');
  await close(p);
  // Modification puis suppression réelles du plein : seule sa source change.
  await go(p,'pleins','Pleins & conso');await p.locator('[data-action=edit-fill][data-id="plein-test"]').click();
  await field(p,'odometer').fill('97000');await submit(p);await history(p,first);
  text=await p.locator('#modal').innerText();assert.match(text,/97\s?000 km · Plein/);assert.doesNotMatch(text,/100\s?000 km · Plein/);await close(p);
  await go(p,'pleins','Pleins & conso');allow=false;await p.locator('[data-action=delete-fill][data-id="plein-test"]').click();assert.ok((await records(p)).fills.some(x=>x.id==='plein-test'));
  await p.locator('[data-action=delete-fill][data-id="plein-test"]').click();await history(p,first);assert.doesNotMatch(await p.locator('#modal').innerText(),/SP95-E10/);await close(p);
  // Le même comportement s'applique aux entretiens, sans copie à synchroniser.
  await go(p,'entretien','Entretien');await p.locator('[data-action=edit-service][data-id="entretien-test"]').click();await field(p,'odometer').fill('97001');await field(p,'title').fill('Vidange modifiée');await submit(p);
  await history(p,first);text=await p.locator('#modal').innerText();assert.match(text,/97\s?001 km · Entretien/);assert.match(text,/Vidange modifiée/);assert.doesNotMatch(text,/Vidange fictive/);await close(p);
  await go(p,'entretien','Entretien');await p.locator('[data-action=delete-service][data-id="entretien-test"]').click();await history(p,first);assert.doesNotMatch(await p.locator('#modal').innerText(),/Vidange modifiée/);await close(p);
  // Supprimer une correction demande confirmation et ne réécrit pas le compteur.
  await history(p,first);const del=p.locator('[data-action=delete-odometer-correction]');allow=false;await del.click();assert.match(dialogs.at(-1),/compteur actuel.*ne changeront pas/i);assert.equal((await records(p)).odometerCorrections.length,1);
  await del.click();assert.equal((await records(p)).odometerCorrections.length,0);assert.equal(car(await records(p),first).odometer,98000);await close(p);
  // Rollback provoqué au moment de l'ajout : aucune des écritures de la transaction ne survit.
  await edit(p,first);await field(p,'vin').fill('NE PAS ENREGISTRER');await askCorrection(p,97000);await field(p,'correctionReason').fill('Test transaction');await field(p,'correctionDate').fill('2026-01-07');
  before=await records(p);
  await p.evaluate(()=>{window.__oldAdd=IDBObjectStore.prototype.add;IDBObjectStore.prototype.add=function(v,...args){if(this.name==='odometerCorrections')throw Error('Échec fictif');return window.__oldAdd.call(this,v,...args);};});
  await p.locator('#modal button[type=submit]').click();await p.locator('#modal .form-error.visible').waitFor();
  await p.evaluate(()=>{IDBObjectStore.prototype.add=window.__oldAdd;delete window.__oldAdd;});
  assert.match(await p.locator('#modal .form-error').innerText(),/Échec fictif/);assert.deepEqual(await records(p),before,'rollback compteur, suggestions, actif et correction');
  await submit(p);after=await records(p);assert.equal(car(after,first).odometer,97000);assert.equal(after.odometerCorrections.length,1);
  // Concurrence : changement d'un autre onglet du véhicule.
  await edit(p,first);await askCorrection(p,96000);
  let current=await records(p),changed=structuredClone(car(current,first));changed.vin='DEPUIS AUTRE ONGLET';await ops(p,[{type:'put',store:'vehicles',value:changed}]);
  before=await records(p);await field(p,'correctionReason').fill('Conflit');await p.locator('#modal button[type=submit]').click();await p.locator('#modal .form-error.visible').waitFor();assert.match(await p.locator('#modal .form-error').innerText(),/autre fenêtre/);assert.deepEqual(await records(p),before);
  await p.locator('#modal [data-action=close-modal]').first().click();await p.locator('#modal form[data-form=vehicle]').waitFor();await close(p);await p.reload({waitUntil:'networkidle'});
  // Concurrence sur la table de corrections, même si le véhicule n'a pas changé.
  await edit(p,first);await askCorrection(p,95000);
  await p.evaluate(async id=>{const {LocalDatabase,DB_CONTRACT}=await import('./js/db.js');const {prepareManualCorrection}=await import('./js/odometer-history.js');const db=await new LocalDatabase().open(DB_CONTRACT,'corrections-compteur-v1');const d=await db.readAll(),v=d.vehicles.find(x=>x.id===id);const x=prepareManualCorrection(v,{...v,odometer:v.odometer-1},d.odometerCorrections,{id:'concurrent',date:'2026-01-08',recordedAt:'2026-01-08T10:00:00.000Z',reason:'Autre fenêtre'});await db.apply([{type:'put',store:'odometerCorrections',value:x.row}]);db.db.close();},first);
  before=await records(p);await field(p,'correctionReason').fill('Conflit historique');await p.locator('#modal button[type=submit]').click();await p.locator('#modal .form-error.visible').waitFor();assert.match(await p.locator('#modal .form-error').innerText(),/historique a changé/i);assert.deepEqual(await records(p),before);
  await p.locator('#modal [data-action=close-modal]').first().click();await p.locator('#modal form[data-form=vehicle]').waitFor();await close(p);await p.reload({waitUntil:'networkidle'});
  // L'affichage est paginé mais ne masque pas les relevés supplémentaires.
  const batch=Array.from({length:85},(_,i)=>({type:'put',store:'expenses',value:{id:`lot-${i}`,vehicleId:first,date:'2026-01-10',odometer:100000+i,title:`Dépense ${i}`,amount:1,category:'autre'}}));
  await ops(p,batch);await p.reload({waitUntil:'networkidle'});await history(p,first);assert.equal(await p.locator('.odometer-history-item').count(),80);assert.match(await p.locator('#modal').innerText(),/80 sur/);
  await p.locator('[data-action=more-odometer-history]').click();await p.waitForFunction(()=>document.querySelectorAll('.odometer-history-item').length>80);assert.ok(await p.locator('.odometer-history-item').count()>=85);await close(p);
  await ops(p,batch.map(x=>({type:'delete',store:'expenses',id:x.value.id})));await p.reload({waitUntil:'networkidle'});
  // Suppression du véhicule : avertissement, annulation puis suppression en cascade des corrections.
  await garage(p);await p.locator('[data-action=add-vehicle]').first().click();await field(p,'brand').fill('Test');await field(p,'model').fill('À supprimer');await field(p,'odometer').fill('500');await submit(p);
  const third=(await records(p)).vehicles.find(v=>v.model==='À supprimer').id;await edit(p,third);await askCorrection(p,400);await confirmCorrection(p,{reason:'Essai cascade',date:'2026-01-09'});
  assert.equal((await records(p)).odometerCorrections.filter(x=>x.vehicleId===third).length,1);await garage(p);allow=false;await p.locator(`[data-action=delete-vehicle][data-id="${third}"]`).click();assert.match(dialogs.at(-1),/corrections du compteur/);assert.ok(car(await records(p),third));
  await p.locator(`[data-action=delete-vehicle][data-id="${third}"]`).click();await p.waitForFunction(id=>!document.querySelector(`[data-action="delete-vehicle"][data-id="${id}"]`),third);
  assert.equal(car(await records(p),third),undefined);assert.equal((await records(p)).odometerCorrections.filter(x=>x.vehicleId===third).length,0);
  // Une suppression concurrente ne peut pas être annulée par le formulaire périmé.
  await garage(p);await p.locator('[data-action=add-vehicle]').first().click();await field(p,'brand').fill('Test');await field(p,'model').fill('Conflit');await field(p,'odometer').fill('800');await submit(p);
  const fourth=(await records(p)).vehicles.find(v=>v.model==='Conflit').id;await edit(p,fourth);await askCorrection(p,700);
  await p.evaluate(async([gone,next])=>{const {LocalDatabase,DB_CONTRACT}=await import('./js/db.js'),db=await new LocalDatabase().open(DB_CONTRACT,'corrections-compteur-v1');await db.deleteVehicleCascade(gone,{wasActive:true,activeId:next});db.db.close();},[fourth,first]);
  before=await records(p);await field(p,'correctionReason').fill('Conflit suppression');await p.locator('#modal button[type=submit]').click();await p.locator('#modal .form-error.visible').waitFor();assert.match(await p.locator('#modal .form-error').innerText(),/supprimé|changé/i);assert.deepEqual(await records(p),before);assert.equal(car(before,fourth),undefined);
  await p.locator('#modal [data-action=close-modal]').first().click();await p.locator('#modal form[data-form=vehicle]').waitFor();await close(p);await p.reload({waitUntil:'networkidle'});
  before=await records(p);
  // Une collection locale manquante ne peut jamais être remplacée par [].
  const incomplete=await p.evaluate(async()=>{const {LocalDatabase,DB_CONTRACT}=await import('./js/db.js');const db=await new LocalDatabase().open(DB_CONTRACT,'corrections-compteur-v1');const r=await db.readAll();delete r.odometerCorrections;try{await db.replaceAll(r);return 'ERREUR : acceptée';}catch(e){return e.message;}finally{db.db.close();}});
  assert.match(incomplete,/incomplète/i);assert.deepEqual(await records(p),before);
  // Sauvegarde interopérable : extension par véhicule, jamais collection racine.
  const backup=await exportRaw(p), parsed=JSON.parse(backup);assert.equal(Object.hasOwn(parsed.data,'odometerCorrections'),false);
  assert.equal(parsed.data.vehicles.find(v=>v.id===first).vigieOdometerCorrections.entries.length,2);
  // Import remplacement complet et chiffres inconnus exacts, puis réexport.
  let enhanced=backup.replace('"vigieOdometerCorrections": {','"vigieOdometerCorrections": {\n        "futurExact": 9007199254740993,');
  assert.notEqual(enhanced,backup);
  await ops(p,[{type:'put',store:'expenses',value:{id:'surplus',vehicleId:first,date:'2026-01-10',title:'À remplacer',amount:1,category:'autre'}}]);
  assert.ok((await records(p)).expenses.some(x=>x.id==='surplus'));await importRaw(p,enhanced);assert.ok(!(await records(p)).expenses.some(x=>x.id==='surplus'),'l’import remplace tout, il ne fusionne pas');
  const round=await exportRaw(p);assert.match(round,/"futurExact": 9007199254740993/);
  assert.equal(JSON.parse(round).data.vehicles.find(v=>v.id===first).vigieOdometerCorrections.entries.length,2);
  assert.equal((await records(p)).odometerCorrections.length,2);
  // Format futur : il reste exportable, mais toute correction est bloquée.
  let d=await records(p),future=structuredClone(car(d,second));future.vigieOdometerCorrections={version:99,entries:[{futur:'ne pas toucher'}]};
  await ops(p,[{type:'put',store:'vehicles',value:future}]);await p.reload({waitUntil:'networkidle'});await history(p,second);assert.match(await p.locator('#modal').innerText(),/format non reconnu/);await close(p);
  await edit(p,second);await field(p,'odometer').fill('199999');await p.locator('#modal button[type=submit]').click();await p.locator('#modal .form-error.visible').waitFor();assert.match(await p.locator('#modal .form-error').innerText(),/pas reconnu/i);
  assert.deepEqual(car(await records(p),second).vigieOdometerCorrections,future.vigieOdometerCorrections);await close(p);
  await edit(p,second);await field(p,'vin').fill('SANS TOUCHER LE FUTUR');await submit(p);assert.deepEqual(car(await records(p),second).vigieOdometerCorrections,future.vigieOdometerCorrections);
  // Hors ligne : le nouveau module est dans le cache et une correction fonctionne.
  await p.evaluate(()=>navigator.serviceWorker.ready);await p.waitForFunction(()=>!!navigator.serviceWorker.controller);
  if(useWebkit)s.offline=true;else await ctx.setOffline(true);
  await p.reload({waitUntil:'load'});await edit(p,first);await askCorrection(p,94000);await confirmCorrection(p,{reason:'Correction hors ligne',date:'2026-01-09'});
  await history(p,first);assert.match(await p.locator('#modal').innerText(),/Correction hors ligne/);await close(p);
  const offline=await exportRaw(p);assert.match(offline,/"futurExact": 9007199254740993/);assert.equal(JSON.parse(offline).data.vehicles.find(v=>v.id===first).vigieOdometerCorrections.entries.length,3);
  if(process.env.VIGIE_ODOMETER_BRIDGE_OUT)fs.writeFileSync(process.env.VIGIE_ODOMETER_BRIDGE_OUT,offline);
  assert.deepEqual(errors,[],'pas d’erreur JS non capturée');await ctx.close();
  console.log(`✓ ${engine.name()} : correction et abandon, sources vives, alerte, rollback, concurrence, formats futurs, sauvegarde et hors ligne.`);
 } finally {if(browser)await browser.close();await new Promise(r=>s.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
