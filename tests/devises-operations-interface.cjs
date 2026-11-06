/* Devises par opération : vraie interface, IndexedDB et fichiers JSON.
   L'ancienne PWA beta.7 est lue depuis son ZIP, pas simulée. */
const assert=require('node:assert/strict'),fs=require('node:fs'),http=require('node:http'),path=require('node:path'),os=require('node:os');
const {spawnSync}=require('node:child_process'),{chromium,webkit}=require('playwright');
const root=path.resolve(__dirname,'..'), oldZip=process.env.VIGIE_PREVIOUS_PWA || path.join(root,'..','VigieAuto-v1.5.2-beta.7.zip');
const useWebkit=process.env.VIGIE_BROWSER==='webkit', engine=useWebkit?webkit:chromium;
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.webmanifest':'application/manifest+json'};
const labels={accueil:'Tableau de bord',entretien:'Entretien',pleins:'Pleins & conso',trajets:'Trajets',depenses:'Dépenses',statistiques:'Statistiques',parametres:'Paramètres'};
const go=async(p,r)=>{await p.evaluate(v=>{location.hash=v;},r);await p.waitForFunction(v=>document.title===`${v} — VigieAuto`,labels[r]);};
const field=(p,n,v)=>p.locator(`#modal [name="${n}"]`).fill(String(v));
const submit=async p=>{await p.locator('#modal button[type=submit]').click();await p.locator('#modal').waitFor({state:'hidden',timeout:10000});};
const waitToast=async(p,text)=>p.waitForFunction(t=>document.querySelector('#toast')?.textContent.includes(t),text,{timeout:10000});
const upload=async(p,data)=>{await go(p,'parametres');await p.locator('#toast').evaluate(x=>x.textContent='');await p.locator('#import-file').setInputFiles({name:'fixture.json',mimeType:'application/json',buffer:Buffer.from(typeof data==='string'?data:JSON.stringify(data))});};
const downloadRaw=async p=>{await go(p,'parametres');const event=p.waitForEvent('download');await p.locator('[data-action=export]').click();return fs.readFileSync(await (await event).path(),'utf8');};
const download=async p=>JSON.parse(await downloadRaw(p));
const norm=s=>s.replace(/\s/g,'');
const row=(p,kind,id)=>p.locator(`.list-row:has([data-action="edit-${kind}"][data-id="${id}"])`);
const metric=(p,name)=>p.locator('.metric-card').filter({hasText:name}).locator('.metric-value');
async function serve(dir){const s=http.createServer((req,res)=>{if(s.simulateDisconnect){req.socket.destroy();return;}const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 const dir=s.hybrid && ['/js/db.js','/js/currency.js'].includes(pathname) ? root : s.dir;
 let f=path.resolve(dir,'.'+pathname);
 if(f!==dir&&!f.startsWith(dir+path.sep))return res.writeHead(403).end();if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=path.join(f,'index.html');
 if(!fs.existsSync(f)||!fs.statSync(f).isFile())return res.writeHead(404).end();res.writeHead(200,{'content-type':mime[path.extname(f)]||'application/octet-stream','cache-control':'no-store'});fs.createReadStream(f).pipe(res);});
 s.dir=dir;await new Promise(r=>s.listen(0,'127.0.0.1',r));return {s,url:`http://127.0.0.1:${s.address().port}/`};}
const opts={viewport:{width:390,height:844},locale:'fr-FR',timezoneId:'Europe/Paris',acceptDownloads:true};
(async()=>{
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'vigie-operations-'));if(!fs.existsSync(oldZip))throw new Error(`ZIP beta.7 manquant : ${oldZip}`);
 const unzip=spawnSync('python3',['-c','import sys,zipfile;zipfile.ZipFile(sys.argv[1]).extractall(sys.argv[2])',oldZip,temp],{encoding:'utf8'});if(unzip.status)throw new Error(unzip.stderr);
 const oldRoot=path.join(temp,'VigieAuto'), old=await serve(oldRoot), current=await serve(root), migration=await serve(oldRoot);let browser;
 try {
  browser=await engine.launch(useWebkit?{headless:true}:{headless:true,args:['--no-sandbox']});
  const ctx=await browser.newContext(opts),p=await ctx.newPage(),errors=[];let dismissNext=false;
  p.on('pageerror',e=>errors.push(e.message));p.on('dialog',d=>{if(dismissNext){dismissNext=false;return d.dismiss();}return d.accept();});
  await p.goto(current.url,{waitUntil:'networkidle'});await p.locator('[data-action=start-real]').click();
  await field(p,'brand','Renault');await field(p,'model','Clio');await field(p,'odometer','1000');await submit(p);
  const base=await download(p),v=base.data.vehicles[0].id;assert.equal(base.formatVersion,3);
  base.data.fills=[{id:'même-id',vehicleId:v,date:'2026-01-01',odometer:1000,volume:40,unit:'L',unitPrice:1.5,total:60,full:true,station:'Ancien',currency:'CHF'}];
  base.data.services=[{id:'même-id',vehicleId:v,date:'2026-01-01',odometer:1000,title:'Ancien entretien',category:'autre',parts:4,labor:6,currency:'USD'}];
  base.data.expenses=[{id:'même-id',vehicleId:v,date:'2026-01-01',title:'Ancienne dépense',category:'assurance',amount:3,notes:''}];
  base.data.trips=[{id:'trajet',vehicleId:v,date:'2026-01-04',status:'complete',method:'manual',startedAt:null,title:'Trajet fictif',from:'',to:'',distanceKm:100,durationMin:60,profile:'inconnu',notes:''}];
  await upload(p,base);await waitToast(p,'importée');await go(p,'pleins');assert.match(await row(p,'fill','même-id').innerText(),/60,00\s*€/);
  await go(p,'entretien');assert.match(await row(p,'service','même-id').innerText(),/10,00\s*€/);
  // Export v4 toujours possible si seules les dépenses possèdent une affectation.
  await go(p,'depenses');await p.locator('[data-action=add-expense]').first().click();await field(p,'title','Péage fictif');await field(p,'amount',7);
  await p.locator('#modal [name=currency]').selectOption('USD');await submit(p);const v4=await download(p);assert.equal(v4.formatVersion,4);
  async function addFill({date,km,vol,total,code,full=true,station}){
    await go(p,'pleins');await p.locator('[data-action=add-fill]').first().click();assert.equal(await p.locator('#modal [name=currency]').inputValue(),'EUR');
    await field(p,'date',date);await field(p,'odometer',km);await field(p,'volume',vol);await field(p,'total',total);await field(p,'station',station);
    if(!full)await p.locator('#modal [name=full]').uncheck();await p.locator('#modal [name=currency]').selectOption(code);await submit(p);
  }
  await addFill({date:'2026-01-02',km:1200,vol:10,total:20,code:'CHF',full:false,station:'Partiel suisse'});
  await addFill({date:'2026-01-03',km:1500,vol:20,total:40,code:'USD',station:'Complet américain'});
  await go(p,'entretien');await p.locator('[data-action=add-service]').first().click();await field(p,'title','Entretien suisse');
  await field(p,'date','2026-01-03');await field(p,'odometer',1500);await field(p,'labor',5);await p.locator('#modal [name=currency]').selectOption('CHF');
  await p.locator('#modal [data-action=add-service-line]').click();await p.locator('#modal [data-service-label]').fill('Filtre');await p.locator('#modal [data-service-price]').fill('12');
  assert.match(await p.locator('#modal [data-service-total]').innerText(),/17,00\s*CHF/);await submit(p);
  let b=await download(p);assert.equal(b.formatVersion,5);assert.equal(b.data.currencyAssignments.length,4);
  const partial=b.data.fills.find(x=>x.station==='Partiel suisse'),full=b.data.fills.find(x=>x.station==='Complet américain'),svc=b.data.services.find(x=>x.title==='Entretien suisse');
  assert.ok(partial&&full&&svc);for(const [coll,id,code] of [['fills',partial.id,'CHF'],['fills',full.id,'USD'],['services',svc.id,'CHF']])assert.ok(b.data.currencyAssignments.some(x=>x.id===`${coll}:${id}`&&x.collection===coll&&x.currency===code));
  await go(p,'pleins');assert.match(await row(p,'fill',partial.id).innerText(),/20,00\s*CHF/);assert.match(await row(p,'fill',full.id).innerText(),/40,00\s*USD/);
  assert.match(await metric(p,'Consommation moyenne').innerText(),/6,00/);assert.match(await metric(p,'Coût énergie moyen').innerText(),/—/);
  let total=norm(await metric(p,'Dépenses énergie').innerText());for(const value of ['60,00€','20,00CHF','40,00USD'])assert.ok(total.includes(value),total);
  await go(p,'entretien');assert.match(await row(p,'service',svc.id).innerText(),/17,00\s*CHF/);
  total=norm(await metric(p,'Dépenses entretien').innerText());for(const value of ['10,00€','17,00CHF'])assert.ok(total.includes(value),total);
  await go(p,'accueil');let text=norm(await p.locator('body').innerText());for(const value of ['73,00€','37,00CHF','47,00USD'])assert.ok(text.includes(value),text);
  await go(p,'statistiques');text=norm(await p.locator('body').innerText());for(const value of ['73,00€','37,00CHF','47,00USD'])assert.ok(text.includes(value),text);
  for(const code of ['EUR','CHF','USD'])assert.match(await p.locator('body').innerText(),new RegExp(`Évolution ${code}`));
  assert.match(await metric(p,'Énergie par kilomètre').innerText(),/—/);
  await go(p,'trajets');assert.doesNotMatch(await row(p,'trip','trajet').innerText(),/Énergie estimée/);
  await p.setViewportSize({width:320,height:720});assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await p.setViewportSize({width:390,height:844});
  // Refus d'une nouvelle devise pour une opération existante, puis sélection acceptée.
  await go(p,'pleins');await row(p,'fill',partial.id).locator('[data-action=edit-fill]').click();await p.locator('#modal [name=currency]').selectOption('__other');await field(p,'currencyOther','sek');
  dismissNext=true;await p.locator('#modal button[type=submit]').click();assert.equal(await p.locator('#modal').isVisible(),true);
  await submit(p);assert.match(await row(p,'fill',partial.id).innerText(),/20,00\s*SEK/);
  // Lorsque tous les coûts du seul intervalle valide sont dans la même devise,
  // le coût par kilomètre et l'estimation sont libellés dans cette devise.
  await row(p,'fill',full.id).locator('[data-action=edit-fill]').click();await p.locator('#modal [name=currency]').selectOption('__other');await field(p,'currencyOther','sek');await submit(p);
  assert.match(await metric(p,'Coût énergie moyen').innerText(),/0,120\s*SEK/);
  await go(p,'trajets');assert.match(await row(p,'trip','trajet').innerText(),/Énergie estimée[^\n]*12,00\s*SEK/);
  await go(p,'pleins');await row(p,'fill',full.id).locator('[data-action=edit-fill]').click();await p.locator('#modal [name=currency]').selectOption('USD');await submit(p);
  // Conservation de nombres exacts et d'extensions inconnues, même lors du retour en EUR.
  b=await download(p);const af=b.data.currencyAssignments.find(x=>x.id===`fills:${partial.id}`);af.futur={precise:'EXACT_MARKER',extra:[null,true]};
  const withExact=JSON.stringify(b).replace('"precise":"EXACT_MARKER"','"precise":12345678901234567890.125');
  await upload(p,withExact);await waitToast(p,'importée');let raw=await downloadRaw(p);assert.match(raw,/"precise"\s*:\s*12345678901234567890\.125/);
  // Fixture effectivement exportée par la PWA pour le test Android, sans donnée personnelle.
  if(process.env.VIGIE_V5_FIXTURE){fs.mkdirSync(path.dirname(process.env.VIGIE_V5_FIXTURE),{recursive:true});fs.writeFileSync(process.env.VIGIE_V5_FIXTURE,raw);}
  const realV5=raw, snapshot=JSON.parse(raw);
  await go(p,'pleins');await row(p,'fill',partial.id).locator('[data-action=edit-fill]').click();assert.equal(await p.locator('#modal [name=currency]').inputValue(),'SEK');
  await p.locator('#modal [name=currency]').selectOption('EUR');await submit(p);raw=await downloadRaw(p);
  assert.match(raw,/"precise"\s*:\s*12345678901234567890\.125/);assert.equal(JSON.parse(raw).data.currencyAssignments.find(x=>x.id===af.id).currency,'EUR');
  // Fichiers incohérents refusés avant remplacement, y compris v4 travesti en v5.
  const invalids=[x=>x.formatVersion=4,x=>x.formatVersion=3,x=>{x.data.currencyAssignments[0].currency='usd';},x=>{const a=x.data.currencyAssignments.find(y=>y.collection==='fills');a.recordId='absent';a.id='fills:absent';},x=>x.data.currencyAssignments.push({...x.data.currencyAssignments[0]}),x=>delete x.data.currencyAssignments];
  const before=await download(p);
  for(const mutate of invalids){const value=structuredClone(snapshot);mutate(value);await upload(p,value);await p.waitForFunction(()=>!!document.querySelector('#toast')?.textContent,null,{timeout:10000});assert.doesNotMatch(await p.locator('#toast').innerText(),/importée avec succès/);assert.deepEqual((await download(p)).data,before.data);}
  // Ancien lecteur réel : refus du format 5 sans remplacer le véhicule préexistant.
  const legacyCtx=await browser.newContext(opts),legacy=await legacyCtx.newPage();legacy.on('dialog',d=>d.accept());await legacy.goto(old.url,{waitUntil:'networkidle'});
  await legacy.locator('[data-action=start-real]').click();await field(legacy,'brand','Peugeot');await field(legacy,'model','208');await field(legacy,'odometer',5000);await submit(legacy);
  const oldBefore=await download(legacy);await upload(legacy,realV5);await waitToast(legacy,'pas une sauvegarde VigieAuto compatible');assert.deepEqual((await download(legacy)).data,oldBefore.data);await legacyCtx.close();
  // Même identifiant dans les trois collections, puis suppression sélective.
  const colliding=structuredClone(snapshot);for(const [collection,currency] of [['fills','CHF'],['services','USD'],['expenses','SEK']])colliding.data.currencyAssignments.push({id:`${collection}:même-id`,collection,recordId:'même-id',currency});
  await upload(p,colliding);await waitToast(p,'importée');await go(p,'pleins');assert.match(await row(p,'fill','même-id').innerText(),/60,00\s*CHF/);
  await row(p,'fill','même-id').locator('[data-action=delete-fill]').click();let after=await download(p);assert.ok(!after.data.currencyAssignments.some(x=>x.id==='fills:même-id'));assert.ok(after.data.currencyAssignments.some(x=>x.id==='services:même-id'));
  await go(p,'entretien');assert.match(await row(p,'service','même-id').innerText(),/10,00\s*USD/);await row(p,'service','même-id').locator('[data-action=delete-service]').click();after=await download(p);
  assert.ok(!after.data.currencyAssignments.some(x=>x.id==='services:même-id'));assert.ok(after.data.currencyAssignments.some(x=>x.id==='expenses:même-id'));
  // Conflit sur l'affectation seule d'un plein puis d'une intervention.
  await upload(p,realV5);await waitToast(p,'importée');const other=await ctx.newPage();other.on('dialog',d=>d.accept());await other.goto(current.url,{waitUntil:'networkidle'});
  for(const [route,kind,id] of [['pleins','fill',full.id],['entretien','service',svc.id]]){
    await go(p,route);await row(p,kind,id).locator(`[data-action=edit-${kind}]`).click();
    await other.evaluate(async({kind,id})=>{const {LocalDatabase, DB_CONTRACT}=await import('./js/db.js');const db=await new LocalDatabase().open(DB_CONTRACT),all=await db.readAll();const collection=kind==='fill'?'fills':'services',a=all.currencyAssignments.find(x=>x.id===`${collection}:${id}`);await db.apply([{store:'currencyAssignments',type:'put',value:{...a,currency:'GBP'}}]);db.db.close();},{kind,id});
    await field(p,'notes','Ne doit pas écraser');await p.locator('#modal button[type=submit]').click();await p.locator('#modal .form-error.visible').waitFor();assert.match(await p.locator('#modal .form-error').innerText(),/changées|changé/);
    await p.locator('#modal [data-action=close-modal]').first().click();await p.reload({waitUntil:'networkidle'});await go(p,route);assert.match(await row(p,kind,id).innerText(),/GBP/);
  }
  await other.close();
  // Cascade véhicule : ne conserve que les affectations d'un second véhicule.
  const multi=structuredClone(snapshot),v2='vehicule-2';multi.data.vehicles.push({...multi.data.vehicles[0],id:v2,model:'Autre voiture'});
  for(const [collection,currency] of [['fills','CAD'],['services','GBP'],['expenses','SEK']]){const source=multi.data[collection][0],id=`other-${collection}`;multi.data[collection].push({...source,id,vehicleId:v2});multi.data.currencyAssignments.push({id:`${collection}:${id}`,collection,recordId:id,currency});}
  await upload(p,multi);await waitToast(p,'importée');const remaining=await p.evaluate(async({v,v2})=>{const {LocalDatabase, DB_CONTRACT}=await import('./js/db.js');const d=await new LocalDatabase().open(DB_CONTRACT);await d.deleteVehicleCascade(v,{activeId:v2,wasActive:true});const result=await d.readAll();d.db.close();return result;},{v,v2});
  assert.deepEqual(remaining.vehicles.map(x=>x.id),[v2]);assert.deepEqual(remaining.currencyAssignments.map(x=>x.id).sort(),['expenses:other-expenses','fills:other-fills','services:other-services']);
  await p.reload({waitUntil:'networkidle'});await go(p,'pleins');assert.match(await row(p,'fill','other-fills').innerText(),/CAD/);
  // Hors ligne : nouveau plein et export v5.
  await p.evaluate(()=>navigator.serviceWorker.ready);await p.waitForFunction(()=>!!navigator.serviceWorker.controller);
  if(useWebkit)current.s.simulateDisconnect=true;else await ctx.setOffline(true);
  await p.reload({waitUntil:'load'});await addFill({date:'2026-01-05',km:1600,vol:10,total:9,code:'CHF',station:'Hors ligne'});after=await download(p);
  assert.equal(after.formatVersion,5);assert.ok(after.data.fills.some(x=>x.station==='Hors ligne'));
  if(useWebkit)current.s.simulateDisconnect=false;else await ctx.setOffline(false);
  // Course entre deux collections pour la 32e devise : transaction indivisible.
  const near=structuredClone(v4),expense=near.data.expenses[0],codes=Array.from({length:30},(_,i)=>'A'+String.fromCharCode(65+Math.floor(i/26))+String.fromCharCode(65+i%26));
  near.data.expenses=codes.map((c,i)=>({...expense,id:`limit-${i}`,title:`limite ${i}`}));near.data.currencyAssignments=codes.map((currency,i)=>({id:`expenses:limit-${i}`,recordId:`limit-${i}`,collection:'expenses',currency}));
  await upload(p,near);await waitToast(p,'importée');const race=await ctx.newPage();race.on('dialog',d=>d.accept());await race.goto(current.url,{waitUntil:'networkidle'});
  await go(p,'pleins');await p.locator('[data-action=add-fill]').first().click();await field(p,'date','2026-02-01');await field(p,'odometer',1000);await field(p,'volume',1);await field(p,'total',1);
  await p.locator('#modal [name=currency]').selectOption('__other');await field(p,'currencyOther','ZZX');
  await go(race,'entretien');await race.locator('[data-action=add-service]').first().click();await field(race,'title','Course devise');await field(race,'date','2026-02-01');await field(race,'odometer',1000);
  await race.locator('#modal [name=currency]').selectOption('__other');await field(race,'currencyOther','ZZY');
  await Promise.all([p.locator('#modal button[type=submit]').click(),race.locator('#modal button[type=submit]').click()]);
  for(const page of [p,race])await page.waitForFunction(()=>!document.querySelector('#modal').open || !!document.querySelector('#modal .form-error.visible'),null,{timeout:10000});
  const statuses=await Promise.all([p,race].map(page=>page.evaluate(()=>({open:document.querySelector('#modal').open,error:document.querySelector('#modal .form-error').textContent}))));
  assert.equal(statuses.filter(x=>!x.open).length,1);assert.equal(statuses.filter(x=>x.open&&/32 devises/.test(x.error)).length,1);
  await race.close();if(await p.locator('#modal').isVisible())await p.locator('#modal [data-action=close-modal]').first().click();await p.reload({waitUntil:'networkidle'});after=await download(p);assert.equal(after.data.currencyAssignments.length,31);
  assert.deepEqual(errors,[]);await ctx.close();
  // Migration réelle beta.7 (IndexedDB 5) -> beta.8 (6) sur la même origine.
  const migCtx=await browser.newContext(opts),mig=await migCtx.newPage();mig.on('dialog',d=>d.accept());await mig.goto(migration.url,{waitUntil:'networkidle'});
  await mig.locator('[data-action=start-real]').click();await field(mig,'brand','Citroën');await field(mig,'model','C3');await field(mig,'odometer',500);await submit(mig);
  await upload(mig,v4);await waitToast(mig,'importée');const oldData=await download(mig);
  assert.equal(await mig.evaluate(()=>new Promise(resolve=>{const q=indexedDB.open('cq-auto-local');q.onsuccess=()=>{resolve(q.result.version);q.result.close();};})),5);
  await mig.evaluate(async()=>{for(const r of await navigator.serviceWorker.getRegistrations())await r.unregister();for(const key of await caches.keys())await caches.delete(key);});await mig.close();migration.s.dir=root;
  const newer=await migCtx.newPage();newer.on('dialog',d=>d.accept());await newer.goto(migration.url,{waitUntil:'networkidle'});assert.deepEqual((await download(newer)).data,oldData.data);
  const downgrade=await newer.evaluate(()=>new Promise(resolve=>{const q=indexedDB.open('cq-auto-local',5);q.onerror=()=>resolve(q.error.name);q.onsuccess=()=>{q.result.close();resolve('ouvert');};}));assert.equal(downgrade,'VersionError');
  await newer.evaluate(async()=>{for(const r of await navigator.serviceWorker.getRegistrations())await r.unregister();for(const key of await caches.keys())await caches.delete(key);});await newer.close();migration.s.dir=oldRoot;
  const oldAgain=await migCtx.newPage();await oldAgain.goto(migration.url,{waitUntil:'networkidle'});await oldAgain.locator('.fatal').waitFor();assert.match(await oldAgain.locator('.fatal').innerText(),/Impossible d’ouvrir VigieAuto/);await oldAgain.close();
  migration.s.dir=root;const final=await migCtx.newPage();final.on('dialog',d=>d.accept());await final.goto(migration.url,{waitUntil:'networkidle'});assert.deepEqual((await download(final)).data,oldData.data);
  // Interface beta.7 + module DB beta.8, comme lors d'un changement de cache
  // au milieu du chargement : le contrat interdit explicitement cette combinaison.
  await upload(final,realV5);await waitToast(final,'importée');const hybridBefore=await download(final);
  const unauthorized=await final.evaluate(async()=>{const {LocalDatabase}=await import('./js/db.js');try{await new LocalDatabase().open();return 'ouvert';}catch(e){return e.message;}});
  assert.match(unauthorized,/Mise à jour en cours/);
  await final.evaluate(async()=>{for(const r of await navigator.serviceWorker.getRegistrations())await r.unregister();for(const key of await caches.keys())await caches.delete(key);});await final.close();
  migration.s.dir=oldRoot;migration.s.hybrid=true;const mixed=await migCtx.newPage();await mixed.goto(migration.url,{waitUntil:'networkidle'});await mixed.locator('.fatal').waitFor();
  assert.match(await mixed.locator('.fatal').innerText(),/Mise à jour en cours/);await mixed.close();
  migration.s.hybrid=false;migration.s.dir=root;const recovered=await migCtx.newPage();recovered.on('dialog',d=>d.accept());await recovered.goto(migration.url,{waitUntil:'networkidle'});
  assert.deepEqual((await download(recovered)).data,hybridBefore.data);await migCtx.close();
  console.log(`✓ ${useWebkit?'WebKit':'Chromium'} : devises pleins/entretiens/dépenses, calculs mixtes, v3/v4/v5, ancien lecteur réel, migration 5→6, refus retour/cache mixte, extensions, conflits, cascade et hors ligne.`);
 } finally {if(browser)await browser.close();for(const server of [old,current,migration])await new Promise(r=>server.s.close(r));fs.rmSync(temp,{recursive:true,force:true});}
})().catch(e=>{console.error(e);process.exitCode=1;});
