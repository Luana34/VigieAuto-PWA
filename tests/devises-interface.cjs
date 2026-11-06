/* Scénarios fictifs sur la vraie PWA, deux moteurs Linux et l'ancienne PWA beta.6. */
const assert=require('node:assert/strict'), fs=require('node:fs'), http=require('node:http'), path=require('node:path'), os=require('node:os');
const {spawnSync}=require('node:child_process'), {chromium,webkit}=require('playwright');
const root=path.resolve(__dirname,'..'), oldZip=process.env.VIGIE_PREVIOUS_PWA || path.join(root,'..','VigieAuto-v1.5.2-beta.6.zip');
const useWebkit=process.env.VIGIE_BROWSER==='webkit', engine=useWebkit?webkit:chromium;
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.webmanifest':'application/manifest+json'};
const labels={depenses:'Dépenses',parametres:'Paramètres',accueil:'Tableau de bord',statistiques:'Statistiques'};
const go=async(p,r)=>{await p.evaluate(v=>{location.hash=v;},r);await p.waitForFunction(v=>document.title===`${v} — VigieAuto`,labels[r]);};
const field=(p,n,v)=>p.locator(`#modal [name="${n}"]`).fill(String(v));
const submit=async p=>{await p.locator('#modal button[type=submit]').click();await p.locator('#modal').waitFor({state:'hidden'});};
const downloadRaw=async p=>{await go(p,'parametres');const e=p.waitForEvent('download');await p.locator('[data-action=export]').click();return fs.readFileSync(await (await e).path(),'utf8');};
const download=async p=>JSON.parse(await downloadRaw(p));
// Le test ne doit pas arrondir lui-même le nombre exact en réimportant la fixture.
const wire=backup=>typeof backup==='string'?backup:JSON.stringify(backup).replace('"precise":"EXACT_MARKER"','"precise":12345678901234567890.125').replace('"precise":12345678901234567000','"precise":12345678901234567890.125');
const upload=async(p,backup,name='donnees.json')=>{await go(p,'parametres');await p.locator('#toast').evaluate(el=>el.textContent='');await p.locator('#import-file').setInputFiles({name,mimeType:'application/json',buffer:Buffer.from(wire(backup))});};
const waitToast=async(p,text)=>p.waitForFunction(t=>document.querySelector('#toast')?.textContent.includes(t),text,{timeout:15000});
async function serve(dir){const s=http.createServer((req,res)=>{if(s.simulateDisconnect){req.socket.destroy();return;}let f=path.resolve(dir,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
 if(f!==dir&&!f.startsWith(dir+path.sep))return res.writeHead(403).end();if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=path.join(f,'index.html');
 if(!fs.existsSync(f)||!fs.statSync(f).isFile())return res.writeHead(404).end();res.writeHead(200,{'content-type':mime[path.extname(f)]||'application/octet-stream','cache-control':'no-store'});fs.createReadStream(f).pipe(res);});
 await new Promise(r=>s.listen(0,'127.0.0.1',r));return {s,url:`http://127.0.0.1:${s.address().port}/`};}
(async()=>{
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'vigie-devise-old-'));
 let old=null;
 if(fs.existsSync(oldZip)) {
   const unpack=spawnSync('python3',['-c','import sys,zipfile; zipfile.ZipFile(sys.argv[1]).extractall(sys.argv[2])',oldZip,temp],{encoding:'utf8'});
   if(unpack.status!==0)throw new Error(unpack.stderr);
   old=await serve(path.join(temp,'VigieAuto'));
 } else console.warn('Ancienne PWA non fournie : le refus par beta.6 ne sera pas retesté (VIGIE_PREVIOUS_PWA=/chemin/vers/son.zip).');
 const current=await serve(root);let browser;
 try{
  browser=await engine.launch(useWebkit?{headless:true}:{headless:true,args:['--no-sandbox']});
  const ctx=await browser.newContext({viewport:{width:390,height:844},locale:'fr-FR',timezoneId:'Europe/Paris',acceptDownloads:true});
  const p=await ctx.newPage(), errors=[];let dismissNext=false;
  p.on('pageerror',e=>errors.push(e.message));p.on('dialog',d=>{if(dismissNext){dismissNext=false;return d.dismiss();}return d.accept();});
  await p.goto(current.url,{waitUntil:'networkidle'});await p.locator('[data-action=start-real]').click();
  await field(p,'brand','Renault');await field(p,'model','Clio');await field(p,'odometer','1000');await submit(p);
  const initial=await download(p), v=initial.data.vehicles[0].id;
  const date=await p.evaluate(()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;});
  initial.data.expenses=[{id:'historique',vehicleId:v,date,title:'Historique euro',category:'assurance',amount:20,currency:'USD',vigieCurrency:'CHF',notes:'Anciennes extensions',futureExact:{precise:'EXACT_MARKER'},vigieExpenseReceipt:{version:1,dataUrl:'data:image/png;base64,AAAA'}}];
  initial.data.fills=[{id:'plein',vehicleId:v,date,odometer:900,volume:30,unit:'L',unitPrice:1,total:30,full:true,station:'Fictive'}];
  initial.data.services=[{id:'entretien',vehicleId:v,date,odometer:950,title:'Entretien euro',category:'autre',parts:4,labor:6}];
  initial.data.trips=[{id:'gps-fictif',vehicleId:v,date,status:'complete',method:'gps',startedAt:`${date}T10:00:00.000Z`,title:'GPS fictif',from:'',to:'',distanceKm:1.2,durationMin:2,profile:'inconnu',notes:'',gpsDistanceM:1200,gpsHasFix:true,gpsInterrupted:true}];
  await upload(p,initial,'v3-historique.json');await waitToast(p,'importée');await go(p,'depenses');
  const row=(page,title)=>page.locator('.list-card .list-row').filter({hasText:title});
  assert.match(await row(p,'Historique euro').innerText(),/20,00\s*€/);
  await row(p,'Historique euro').locator('[data-action=edit-expense]').click();
  assert.equal(await p.locator('#modal [name=currency]').inputValue(),'EUR');await field(p,'notes','Montant historique inchangé');await submit(p);
  async function add(title,amount,code,custom=''){
    await p.locator('[data-action=add-expense]').first().click();await field(p,'title',title);await field(p,'amount',String(amount));
    assert.equal(await p.locator('#modal [name=currency]').inputValue(),'EUR');
    await p.locator('#modal [name=currency]').selectOption(code);
    if(code==='__other')await field(p,'currencyOther',custom);
    await submit(p);
  }
  await add('Dépense suisse',20,'CHF');await add('Dépense américaine',40,'USD');await add('Dépense suédoise',7,'__other','sek');
  for(const [name,expected] of [['Dépense suisse',/20,00\s*CHF/],['Dépense américaine',/40,00\s*USD/],['Dépense suédoise',/7,00\s*SEK/]])assert.match(await row(p,name).innerText(),expected);
  const total=()=>p.locator('.metric-card').filter({hasText:'Total enregistré'}).locator('.metric-value').innerText();
  const norm=s=>s.replace(/\s/g,'');
  let totals=norm(await total());for(const value of ['20,00€','20,00CHF','7,00SEK','40,00USD'])assert.ok(totals.includes(value),totals);
  await p.getByLabel('Trier les dépenses').selectOption('amount');
  const titles=await p.locator('.list-card .list-title').allInnerTexts();assert.deepEqual(titles,['Historique euro','Dépense suisse','Dépense suédoise','Dépense américaine']);
  assert.equal(norm(await total()),totals);
  await p.setViewportSize({width:320,height:720});assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await p.setViewportSize({width:390,height:844});
  await go(p,'accueil');const home=norm(await p.locator('body').innerText());for(const value of ['60,00€','20,00CHF','7,00SEK','40,00USD'])assert.ok(home.includes(value),home);
  await go(p,'statistiques');const stats=norm(await p.locator('body').innerText());for(const value of ['60,00€','20,00CHF','7,00SEK','40,00USD'])assert.ok(stats.includes(value),stats);
  for(const code of ['EUR','CHF','USD','SEK'])assert.match(await p.locator('body').innerText(),new RegExp(`Évolution ${code}`));
  const backupRaw=await downloadRaw(p);assert.match(backupRaw,/"precise"\s*:\s*12345678901234567890\.125/);
  let backup=JSON.parse(backupRaw);assert.equal(backup.formatVersion,4);assert.equal(backup.data.trips[0].method,'gps');assert.equal(backup.data.currencyAssignments.length,3);
  const historical=backup.data.expenses.find(x=>x.id==='historique');assert.equal(historical.currency,'USD');assert.equal(historical.vigieCurrency,'CHF');assert.equal(historical.vigieExpenseReceipt.dataUrl,'data:image/png;base64,AAAA');
  for(const assignment of backup.data.currencyAssignments){assert.equal(assignment.id,`expenses:${assignment.recordId}`);assert.equal(assignment.collection,'expenses');assert.ok(backup.data.expenses.some(x=>x.id===assignment.recordId));}
  if(process.env.VIGIE_CURRENCY_FIXTURE){fs.mkdirSync(path.dirname(process.env.VIGIE_CURRENCY_FIXTURE),{recursive:true});fs.writeFileSync(process.env.VIGIE_CURRENCY_FIXTURE,backupRaw);}
  // L'ancienne PWA refuse le vrai fichier v4 avant toute suppression, sur une autre origine.
  if (old) {
  const oldCtx=await browser.newContext({viewport:{width:390,height:844},locale:'fr-FR',timezoneId:'Europe/Paris',acceptDownloads:true});
  const legacy=await oldCtx.newPage();legacy.on('dialog',d=>d.accept());await legacy.goto(old.url,{waitUntil:'networkidle'});
  await legacy.locator('[data-action=start-real]').click();await field(legacy,'brand','Peugeot');await field(legacy,'model','208');await field(legacy,'odometer','5000');await submit(legacy);
  const beforeLegacy=await download(legacy);await upload(legacy,backup,'nouveau-format.json');await waitToast(legacy,'pas une sauvegarde VigieAuto compatible');
  const afterLegacy=await download(legacy);assert.deepEqual(afterLegacy.data,beforeLegacy.data);await oldCtx.close();
  }
  // Restauration v4 suivie d'un aller-retour, y compris les extensions inconnues.
  await upload(p,backupRaw,'v4.json');await waitToast(p,'importée');const returnedRaw=await downloadRaw(p);
  assert.match(returnedRaw,/"precise"\s*:\s*12345678901234567890\.125/);assert.deepEqual(JSON.parse(returnedRaw).data,backup.data);
  for(const mutate of [
    b=>{b.data.currencyAssignments[0].currency='chf';},
    b=>{b.data.currencyAssignments[0].recordId='absente';b.data.currencyAssignments[0].id='expenses:absente';},
    b=>{b.data.currencyAssignments[0].collection='fills';},
    b=>{b.data.currencyAssignments.push({...b.data.currencyAssignments[0]});},
    b=>{b.formatVersion=3;},
  ]){const bad=structuredClone(backup);mutate(bad);await upload(p,bad,'invalide.json');
    await p.waitForFunction(()=>{const t=document.querySelector('#toast')?.textContent||'';return /invalide|absente|devise|devises/i.test(t)},null,{timeout:15000});
    assert.deepEqual((await download(p)).data,backup.data);}
  // Une extension future de l'affectation n'est jamais supprimée lors d'un retour en EUR.
  const withExtra=structuredClone(backup), swiss=withExtra.data.currencyAssignments.find(x=>x.currency==='CHF');
  swiss.futur={conserver:true,texte:'inchangé'};
  await upload(p,withExtra,'v4-extension.json');await waitToast(p,'importée');await go(p,'depenses');
  await row(p,'Dépense suisse').locator('[data-action=edit-expense]').click();await p.locator('#modal [name=currency]').selectOption('EUR');await submit(p);
  const preserved=await download(p), kept=preserved.data.currencyAssignments.find(x=>x.id===swiss.id);
  assert.equal(preserved.formatVersion,4);assert.equal(kept.currency,'EUR');assert.deepEqual(kept.futur,swiss.futur);
  await upload(p,backup,'v4-restore.json');await waitToast(p,'importée');await go(p,'depenses');
  // Deux onglets : une affectation changée entre ouverture et enregistrement ne doit pas être écrasée.
  await row(p,'Dépense suisse').locator('[data-action=edit-expense]').click();
  const other=await ctx.newPage();await other.goto(current.url,{waitUntil:'networkidle'});
  await other.evaluate(async(id)=>{const {LocalDatabase}=await import('./js/db.js');const d=await new LocalDatabase().open();
    const all=await d.readAll(), a=all.currencyAssignments.find(x=>x.id===id);await d.apply([{store:'currencyAssignments',type:'put',value:{...a,currency:'GBP'}}]);d.db.close();},swiss.id);
  await field(p,'notes','Tentative obsolète');await p.locator('#modal button[type=submit]').click();
  await p.locator('#modal .form-error.visible').waitFor();assert.match(await p.locator('#modal .form-error').innerText(),/changées|changé/);
  await p.locator('#modal [data-action=close-modal]').first().click();await p.reload({waitUntil:'networkidle'});await go(p,'depenses');
  assert.match(await row(p,'Dépense suisse').innerText(),/20,00\s*GBP/);await other.close();
  await upload(p,backup,'v4-restore2.json');await waitToast(p,'importée');
  // Une annulation ou un refus de conversion ne réétiquette pas l'historique.
  await go(p,'depenses');await row(p,'Historique euro').locator('[data-action=edit-expense]').click();
  await p.locator('#modal [name=currency]').selectOption('CHF');dismissNext=true;await p.locator('#modal button[type=submit]').click();
  assert.equal(await p.locator('#modal').isVisible(),true);await p.locator('#modal [name=currency]').selectOption('EUR');await submit(p);
  assert.match(await row(p,'Historique euro').innerText(),/20,00\s*€/);
  // Modification explicite : aucune conversion, les données associées demeurent intactes.
  await row(p,'Dépense suisse').locator('[data-action=edit-expense]').click();await p.locator('#modal [name=currency]').selectOption('GBP');await submit(p);
  assert.match(await row(p,'Dépense suisse').innerText(),/20,00\s*GBP/);
  // Une suppression enlève sa seule affectation ; les autres devises restent.
  await row(p,'Dépense américaine').locator('[data-action=delete-expense]').click();
  const afterDelete=await download(p);assert.equal(afterDelete.data.currencyAssignments.length,2);assert.ok(!afterDelete.data.currencyAssignments.some(x=>x.currency==='USD'));
  // Suppression d'un véhicule : ses affectations sont supprimées dans la même transaction,
  // celles d'un autre véhicule ne sont pas touchées.
  const multi=structuredClone(backup), otherVehicle='vehicule-2', otherExpense='dépense-v2';
  multi.data.vehicles.push({...multi.data.vehicles[0],id:otherVehicle,model:'Autre voiture'});
  multi.data.expenses.push({...multi.data.expenses.find(x=>x.id==='historique'),id:otherExpense,vehicleId:otherVehicle,title:'Autre véhicule'});
  multi.data.currencyAssignments.push({id:`expenses:${otherExpense}`,recordId:otherExpense,collection:'expenses',currency:'CAD'});
  await upload(p,multi,'v4-deux-vehicules.json');await waitToast(p,'importée');
  const remaining=await p.evaluate(async({deleted,active})=>{const {LocalDatabase}=await import('./js/db.js');const d=await new LocalDatabase().open();
    await d.deleteVehicleCascade(deleted,{activeId:active,wasActive:true});const result=await d.readAll();d.db.close();return result;},{deleted:v,active:otherVehicle});
  assert.deepEqual(remaining.vehicles.map(x=>x.id),[otherVehicle]);assert.deepEqual(remaining.currencyAssignments.map(x=>x.id),[`expenses:${otherExpense}`]);
  await p.reload({waitUntil:'networkidle'});await go(p,'depenses');assert.match(await row(p,'Autre véhicule').innerText(),/20,00\s*CAD/);
  // Création et export après passage hors ligne ; le nouveau module est bien en cache.
  await p.evaluate(()=>navigator.serviceWorker.ready);await p.waitForFunction(()=>!!navigator.serviceWorker.controller);
  if(useWebkit)current.s.simulateDisconnect=true;else await ctx.setOffline(true);
  await p.reload({waitUntil:'load'});await go(p,'depenses');await add('Hors ligne dollar',12,'USD');
  assert.match(await row(p,'Hors ligne dollar').innerText(),/12,00\s*USD/);
  const offline=await download(p);assert.equal(offline.formatVersion,4);assert.ok(offline.data.currencyAssignments.some(x=>x.currency==='USD'));
  if(useWebkit)current.s.simulateDisconnect=false;else await ctx.setOffline(false);
  // Deux créations simultanées près de la limite sont sérialisées :
  // une seule peut ajouter la 32e devise, sans dépense partielle dans l'autre onglet.
  const nearLimit=structuredClone(backup), baseExpense=nearLimit.data.expenses.find(x=>x.id==='historique');
  const codes=Array.from({length:30},(_,i)=>'A'+String.fromCharCode(65+Math.floor(i/26))+String.fromCharCode(65+i%26));
  nearLimit.data.expenses=[baseExpense,...codes.map((c,i)=>({...baseExpense,id:`limit-${i}`,title:`limite ${i}`,amount:1}))];
  nearLimit.data.currencyAssignments=codes.map((currency,i)=>({id:`expenses:limit-${i}`,recordId:`limit-${i}`,collection:'expenses',currency}));
  await upload(p,nearLimit,'v4-limite.json');await waitToast(p,'importée');
  const race=await ctx.newPage();race.on('dialog',d=>d.accept());await race.goto(current.url,{waitUntil:'networkidle'});
  for(const [page,code] of [[p,'ZZX'],[race,'ZZY']]){
    await go(page,'depenses');await page.locator('[data-action=add-expense]').first().click();await field(page,'title',`Course ${code}`);
    await field(page,'amount','1');await page.locator('#modal [name=currency]').selectOption('__other');await field(page,'currencyOther',code);
  }
  await Promise.all([p.locator('#modal button[type=submit]').click(),race.locator('#modal button[type=submit]').click()]);
  for(const page of [p,race])await page.waitForFunction(()=>!document.querySelector('#modal').open || !!document.querySelector('#modal .form-error.visible'),null,{timeout:15000});
  const statuses=await Promise.all([p,race].map(page=>page.evaluate(()=>({open:document.querySelector('#modal').open,error:document.querySelector('#modal .form-error')?.textContent||''}))));
  assert.equal(statuses.filter(x=>!x.open).length,1);assert.equal(statuses.filter(x=>x.open&&/32 devises/.test(x.error)).length,1);
  await race.close();await p.reload({waitUntil:'networkidle'});const atLimit=await download(p);
  assert.equal(atLimit.data.currencyAssignments.length,31);assert.equal(atLimit.data.expenses.filter(x=>x.title.startsWith('Course ')).length,1);
  // Retour vers une ancienne IndexedDB impossible sur la même origine.
  const downgrade=await p.evaluate(()=>new Promise(resolve=>{const q=indexedDB.open('cq-auto-local',4);q.onerror=()=>resolve(q.error.name);q.onsuccess=()=>{q.result.close();resolve('ouvert');};}));assert.equal(downgrade,'VersionError');
  assert.deepEqual(errors,[]);await ctx.close();
  console.log(`✓ Devises PWA ${useWebkit?'WebKit':'Chromium'} : anciens euros, choix par dépense, totaux et graphiques séparés, v4, ${old?'refus ancien vérifié':'refus ancien non retesté'}, import/export, conflit, cascade et hors ligne.`);
 }finally{if(browser)await browser.close();await new Promise(r=>current.s.close(r));if(old)await new Promise(r=>old.s.close(r));fs.rmSync(temp,{recursive:true,force:true});}
})().catch(e=>{console.error(e);process.exitCode=1;});
