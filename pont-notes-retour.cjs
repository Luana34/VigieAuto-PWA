/* Retour des deux fichiers fictifs du test Kotlin métier Android beta.46.
 * Usage : node tests/pont-notes-retour.cjs texte-inchange.json texte-modifie.json
 * Ce banc n'utilise ni Room ni appareil ; ne pas fournir de sauvegarde personnelle. */
const assert=require('node:assert/strict'),fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const {chromium,webkit}=require('playwright');
if(process.argv.length!==4)throw Error('Deux fichiers fictifs de sortie Kotlin sont requis.');
const sameRaw=fs.readFileSync(process.argv[2],'utf8'), changedRaw=fs.readFileSync(process.argv[3],'utf8');
const same=JSON.parse(sameRaw), changed=JSON.parse(changedRaw), old=same.data.vehicles.find(v=>v.vigieVehicleNotes), id=old.id;
const updated=changed.data.vehicles.find(v=>v.id===id);assert.equal(old.vin,'VIN-ANDROID-FICTIF');assert.equal(updated.notes,'Modification Android fictive 🚗');assert.deepEqual(old.vigieVehicleNotes,updated.vigieVehicleNotes);
const root=process.env.VIGIE_SITE_DIR?path.resolve(process.env.VIGIE_SITE_DIR):path.resolve(__dirname,'..');
const useWebkit=process.env.VIGIE_BROWSER==='webkit',engine=useWebkit?webkit:chromium;
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.webmanifest':'application/manifest+json'};
const go=async(p,r,label)=>{await p.evaluate(x=>location.hash=x,r);await p.waitForFunction(x=>document.title===`${x} — VigieAuto`,label);};
const exp=async p=>{await go(p,'parametres','Paramètres');const e=p.waitForEvent('download');await p.locator('[data-action=export]').click();return JSON.parse(fs.readFileSync(await(await e).path(),'utf8'));};
(async()=>{
 const s=http.createServer((req,res)=>{let f=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(f!==root&&!f.startsWith(root+path.sep))return res.writeHead(403).end();if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=path.join(f,'index.html');if(!fs.existsSync(f)||!fs.statSync(f).isFile())return res.writeHead(404).end();res.writeHead(200,{'content-type':mime[path.extname(f)]||'application/octet-stream','cache-control':'no-store'});fs.createReadStream(f).pipe(res);});
 await new Promise(r=>s.listen(0,'127.0.0.1',r));let browser;
 try{
  browser=await engine.launch(useWebkit?{headless:true}:{headless:true,args:['--no-sandbox']});const ctx=await browser.newContext({viewport:{width:390,height:844},locale:'fr-FR',acceptDownloads:true});
  const p=await ctx.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('dialog',d=>d.accept());
  await p.goto(`http://127.0.0.1:${s.address().port}/`,{waitUntil:'networkidle'});await p.locator('[data-action=start-real]').click();
  for(const [n,v] of [['brand','Fictive'],['model','Temporaire'],['odometer','1']])await p.locator(`#modal [name=${n}]`).fill(v);
  await p.locator('#modal button[type=submit]').click();await p.locator('#modal').waitFor({state:'hidden'});
  const importRaw=async(raw,name)=>{await go(p,'parametres','Paramètres');await p.locator('#import-file').setInputFiles({name,mimeType:'application/json',buffer:Buffer.from(raw)});const note=JSON.parse(raw).data.vehicles.find(v=>v.id===id).notes;await p.waitForFunction(async([key,expected])=>{const {LocalDatabase,DB_CONTRACT}=await import('./js/db.js');const db=await new LocalDatabase().open(DB_CONTRACT, "corrections-compteur-v1");const data=await db.readAll();db.db.close();return data.vehicles.find(v=>v.id===key)?.notes===expected;},[id,note]);};
  const open=async()=>{await go(p,'garage','Mes véhicules');await p.locator(`[data-action=vehicle-notes][data-id="${id}"]`).click();await p.locator('#modal form[data-form=vehicle-notes]').waitFor();};
  await importRaw(sameRaw,'sans-changement.json');assert.deepEqual((await exp(p)).data,same.data);await open();
  assert.equal(await p.locator('#modal [name=noteText]').inputValue(),old.notes);assert.equal(await p.locator('[data-note-preview] strong').innerText(),'Bonjour');assert.equal(await p.locator('[data-note-preview] em').innerText(),'Fin');
  await p.locator('#modal [data-action=close-modal]').first().click();await p.locator('#modal').waitFor({state:'hidden'});
  await importRaw(changedRaw,'texte-modifie.json');assert.deepEqual((await exp(p)).data,changed.data);await open();
  assert.match(await p.locator('[data-stale-note]').innerText(),/autre version/);assert.equal(await p.locator('#modal [name=noteText]').inputValue(),updated.notes);
  await p.locator('#modal [data-action=close-modal]').first().click();await p.locator('#modal').waitFor({state:'hidden'});assert.deepEqual((await exp(p)).data,changed.data,'l’ouverture ne supprime aucun style ni extension');
  assert.deepEqual(errors,[]);await ctx.close();console.log(`✓ ${engine.name()} : retour du code métier Android, styles valides ou avertissement de divergence, sans écriture implicite.`);
 }finally{if(browser)await browser.close();await new Promise(r=>s.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
