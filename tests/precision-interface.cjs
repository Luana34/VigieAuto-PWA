/* Pont fictif : fixture Room, vraie PWA/IndexedDB, édition, refus atomiques, export.
 * node tests/precision-interface.cjs <fixture-android.json> <retour-pwa.json>
 * VIGIE_BROWSER=webkit pour WebKit Playwright (ne remplace pas Safari sur iPhone).
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium, webkit } = require('playwright');
const root = path.resolve(__dirname, '..');
const [fixtureArg, outputArg] = process.argv.slice(2);
if (!fixtureArg || !outputArg) throw new Error('Usage : fixture-android.json retour-pwa.json');
const source = fs.readFileSync(fixtureArg, 'utf8');
const useWebkit = process.env.VIGIE_BROWSER === 'webkit';
const engine = useWebkit ? webkit : chromium;
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.webmanifest':'application/manifest+json'};
const labels={garage:'Mes véhicules',entretien:'Entretien',pleins:'Pleins & conso',trajets:'Trajets',depenses:'Dépenses',rappels:'Rappels',controles:'Contrôles qualité',symptomes:'Symptômes',parametres:'Paramètres'};
async function serve() {
  const server=http.createServer((req,res)=>{
    if(server.disconnected){req.socket.destroy();return;}
    let file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
    if(file!==root&&!file.startsWith(root+path.sep))return res.writeHead(403).end();
    if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
    if(!fs.existsSync(file)||!fs.statSync(file).isFile())return res.writeHead(404).end();
    res.writeHead(200,{'content-type':mime[path.extname(file)]||'application/octet-stream','cache-control':'no-store'});
    fs.createReadStream(file).pipe(res);
  });
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  return {server,url:`http://127.0.0.1:${server.address().port}/`};
}
async function go(p,route) {
  await p.evaluate(r=>{location.hash=r},route);
  await p.waitForFunction(label=>document.title===`${label} — VigieAuto`,labels[route]);
}
async function submit(p) {
  await p.locator('#modal button[type=submit]').click();
  await p.locator('#modal').waitFor({state:'hidden'});
}
async function upload(p,raw,expected) {
  await p.locator('#import-file').setInputFiles({name:'fictive.json',mimeType:'application/json',buffer:Buffer.from(raw)});
  await p.waitForFunction(text=>document.querySelector('#toast')?.textContent.includes(text),expected,{timeout:10000});
}
async function exportText(p) {
  const event=p.waitForEvent('download');
  await p.locator('[data-action=export]').click();
  return fs.readFileSync(await (await event).path(),'utf8');
}
(async()=>{
 const codec=await import(pathToFileURL(path.join(root,'js/precise-json.js')).href);
 const ref=codec.parseBackupJson(source);
 const collections=Object.keys(ref.data);
 for(const name of collections) assert.ok(ref.data[name].length, `fixture non vide : ${name}`);
 const {server,url}=await serve();let browser;
 try {
  browser=await engine.launch(useWebkit ? {headless:true} : {headless:true,args:['--no-sandbox']});
  const ctx=await browser.newContext({viewport:{width:390,height:844},locale:'fr-FR',timezoneId:'Europe/Paris',acceptDownloads:true});
  let p=await ctx.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('dialog',d=>d.accept());
  await p.goto(url,{waitUntil:'networkidle'});
  await p.locator('[data-action=start-real]').click();
  await p.locator('#modal [name=brand]').fill('Fictif');await p.locator('#modal [name=model]').fill('Essai');await p.locator('#modal [name=odometer]').fill('123');await submit(p);
  await go(p,'parametres');await upload(p,source,'importée');
  await p.evaluate(async()=>navigator.serviceWorker.ready);await p.waitForFunction(()=>!!navigator.serviceWorker.controller);
  // Fermer la page et rouvrir la base, y compris sans serveur : pas de mémoire de page.
  await p.close();
  if(useWebkit)server.disconnected=true;else await ctx.setOffline(true);
  p=await ctx.newPage();p.on('pageerror',e=>errors.push(e.message));p.on('dialog',d=>d.accept());
  await p.goto(url,{waitUntil:'load'});await go(p,'parametres');
  let reopened=await exportText(p);let data=codec.parseBackupJson(reopened).data;
  for(const name of collections) {
    const original=ref.data[name].find(x=>Object.hasOwn(x,'precisionFictive'));
    assert.ok(original,`extension fictive ${name}`);
    const row=data[name].find(x=>x.id===original.id);
    assert.ok(row,`enregistrement ${name}/${original.id}`);
    assert.equal(codec.stringifyBackupJson(row.precisionFictive),codec.stringifyBackupJson(original.precisionFictive),`réouverture IndexedDB ${name}`);
  }
  // Downgrade direct interdit : l'ancienne PWA 1.5.1 ouvre IndexedDB en version 2.
  const downgrade=await p.evaluate(()=>new Promise(resolve=>{
    const request=indexedDB.open('cq-auto-local',2);
    request.onsuccess=()=>{request.result.close();resolve('ouvert');};
    request.onerror=()=>resolve(request.error.name);
    request.onblocked=()=>resolve('bloqué');
  }));
  assert.equal(downgrade,'VersionError');
  if(useWebkit)server.disconnected=false;else await ctx.setOffline(false);

  // Les refus arrivent avant confirmation et avant la transaction de remplacement.
  const before=codec.stringifyBackupJson(data);
  const cases=[
    [source.replace('"odometer":244327','"odometer":9007199254740993'),'sans arrondi'],
    [source.replace('"id":"demo-clio"','"id":"demo-clio","id":"demo-clio"'),'propriété JSON est répétée'],
    [source.replace(/"data"\s*:\s*\{/,match=>`${match}"collectionFuture":[{"id":"f"}],`),'Collection inconnue'],
    [source.replace(/"app"\s*:\s*"VigieAuto"/,match=>`"champRacineFutur":1,${match}`),'champ racine'],
    [source.replace(/("formatVersion"\s*:\s*)3/,(_match,prefix)=>prefix+'1'),'Trajets inattendus'],
    [source.replace('"id":"demo-clio"',`"id":"demo-clio","nombreGeant":${'1'.repeat(1001)}`),'1000 caractères'],
    [Buffer.from([0x7b,0x22,0x61,0x22,0x3a,0x22,0xff,0x22,0x7d]),'UTF-8 valide'],
  ];
  for(const [bad,reason] of cases) {
    assert.notEqual(bad,source,`mutation de fixture : ${reason}`);
    await upload(p,bad,reason);
    const current=codec.parseBackupJson(await exportText(p)).data;
    assert.equal(codec.stringifyBackupJson(current),before,`import refusé sans mutation : ${reason}`);
  }

  // Un formulaire ne peut pas arrondir silencieusement une saisie trop précise.
  await go(p,'garage');await p.locator('[data-action=edit-vehicle][data-id="demo-clio"]').click();
  await p.locator('#modal [name=odometer]').fill('9007199254740993');
  await p.locator('#modal button[type=submit]').click();
  await p.locator('#modal .form-error').waitFor({state:'visible'});
  assert.match(await p.locator('#modal .form-error').innerText(),/sans arrondi/);
  await p.locator('#modal [name=odometer]').fill('244327');
  await p.locator('#modal [name=notes]').fill('Note modifiée au test de précision');await submit(p);

  // Les extensions suivent les enregistrements édités, y compris le premier point CQ.
  const edits=[
    ['entretien','service','demo-s1','notes'], ['pleins','fill','demo-f1','notes'],
    ['trajets','trip','demo-trip1','notes'], ['depenses','expense','demo-e1','notes'],
    ['rappels','reminder','demo-r1','title'], ['symptomes','symptom','demo-y1','description'],
  ];
  for(const [route,kind,id,field] of edits) {
    await go(p,route);await p.locator(`[data-action=edit-${kind}][data-id="${id}"]`).click();
    await p.locator(`#modal [name="${field}"]`).fill(`Modification fictive ${kind}`);await submit(p);
  }
  await go(p,'controles');await p.locator('[data-action=edit-template][data-id="cq-quick"]').click();
  await p.locator('#modal [data-template-point]').nth(0).locator('[data-template-title]').fill('Premier point modifié');
  await submit(p);
  await go(p,'parametres');await p.locator('input[name=theme][value=sauge]').check();
  await p.waitForFunction(()=>document.documentElement.dataset.themePreference==='sauge');
  await p.reload({waitUntil:'networkidle'});await go(p,'parametres');
  const returned=await exportText(p);data=codec.parseBackupJson(returned).data;
  for(const name of collections) {
    const original=ref.data[name].find(x=>Object.hasOwn(x,'precisionFictive'));
    assert.equal(codec.stringifyBackupJson(data[name].find(x=>x.id===original.id).precisionFictive),codec.stringifyBackupJson(original.precisionFictive),`édition puis réouverture : ${name}`);
  }
  const point=data.templates.find(x=>x.id==='cq-quick').items[0];
  const refPoint=ref.data.templates.find(x=>x.id==='cq-quick').items[0];
  assert.equal(point.title,'Premier point modifié');
  assert.equal(codec.stringifyBackupJson(point.precisionPoint),codec.stringifyBackupJson(refPoint.precisionPoint));
  const theme=data.settings.find(x=>x.id==='theme'), originalTheme=ref.data.settings.find(x=>x.id==='theme');
  assert.equal(theme.value,'sauge');assert.equal(theme.extraTheme,originalTheme.extraTheme);
  assert.equal(codec.stringifyBackupJson(theme.precisionTheme),codec.stringifyBackupJson(originalTheme.precisionTheme));
  assert.match(returned,/"grand":\s*12345678901234567890\.1234567890123456789/);
  assert.match(returned,/-0\.000/);assert.match(returned,/1e-324/);assert.match(returned,/1e309/);
  fs.mkdirSync(path.dirname(path.resolve(outputArg)),{recursive:true});fs.writeFileSync(outputArg,returned);

  // Une échéance recalculée trop grande ne doit pas être écrite approximativement.
  const maxKm=source.replace('"odometer":244327','"odometer":9007199254740991');
  assert.notEqual(maxKm,source);await upload(p,maxKm,'importée');
  const snapshot=codec.stringifyBackupJson(codec.parseBackupJson(await exportText(p)).data);
  await go(p,'rappels');await p.locator('[data-action=done-reminder][data-id="demo-r1"]').click();
  await p.waitForFunction(()=>document.querySelector('#toast')?.textContent.includes('prochaine échéance'));
  await go(p,'parametres');
  assert.equal(codec.stringifyBackupJson(codec.parseBackupJson(await exportText(p)).data),snapshot,'rappel inchangé après somme non représentable');
  const gpsOverflow=await p.evaluate(async()=>{
    const {LocalDatabase, DB_CONTRACT}=await import('./js/db.js');const d=await new LocalDatabase().open(DB_CONTRACT);
    const trip=(await d.readAll()).trips.find(x=>x.id==='gps-fictif');
    await d.apply([{store:'trips',type:'put',value:{...trip,gpsDistanceM:Number.MAX_SAFE_INTEGER}}]);
    let reason='';try{await d.updateGpsTrip(trip.id,{addedM:1});}catch(error){reason=error.message;}
    const saved=await d.getTrip(trip.id);d.db.close();return {reason,value:saved.gpsDistanceM};
  });
  assert.match(gpsOverflow.reason,/Distance GPS trop grande/);assert.equal(gpsOverflow.value,Number.MAX_SAFE_INTEGER);

  // Les identifiants de points CQ peuvent être vides/répétés, et un titre peut
  // être vide ou contenir CRLF. Déplacer/supprimer agit sur le point complet.
  const edge=codec.parseBackupJson(source);
  const originalPoints=edge.data.templates.find(x=>x.id==='cq-quick').items;
  originalPoints[0].id='';originalPoints[0].title='';
  originalPoints[0].precisionPoint.marque='premier';
  originalPoints[1].id='';originalPoints[1].title='Deuxième\r\nligne';
  originalPoints[1].precisionPoint={...originalPoints[0].precisionPoint,marque:'deuxième'};
  originalPoints[2].precisionPoint={...originalPoints[0].precisionPoint,marque:'supprimé'};
  const removedId=originalPoints[2].id;
  await upload(p,codec.stringifyBackupJson(edge),'importée');
  await go(p,'controles');await p.locator('[data-action=edit-template][data-id="cq-quick"]').click();
  let rows=p.locator('#modal [data-template-point]');
  await rows.nth(1).locator('[data-action=move-template-point-up]').click();
  await rows.nth(2).locator('[data-action=remove-template-point]').click();
  await p.locator('#modal [data-action=add-template-point]').click();
  await rows.last().locator('[data-template-title]').fill('Nouveau point');await submit(p);
  await go(p,'parametres');await p.reload({waitUntil:'networkidle'});await go(p,'parametres');
  const edgeReturned=codec.parseBackupJson(await exportText(p)).data.templates.find(x=>x.id==='cq-quick').items;
  assert.equal(edgeReturned[0].id,'');assert.equal(edgeReturned[0].title,'Deuxième\r\nligne');
  assert.equal(edgeReturned[1].id,'');assert.equal(edgeReturned[1].title,'');
  assert.equal(codec.stringifyBackupJson(edgeReturned[0].precisionPoint),codec.stringifyBackupJson(originalPoints[1].precisionPoint));
  assert.equal(codec.stringifyBackupJson(edgeReturned[1].precisionPoint),codec.stringifyBackupJson(originalPoints[0].precisionPoint));
  assert.equal(edgeReturned.some(x=>x.id===removedId),false);
  assert.equal(edgeReturned.at(-1).title,'Nouveau point');assert.ok(edgeReturned.at(-1).id);
  assert.deepEqual(errors,[]);
  await ctx.close();
  console.log(`✓ ${useWebkit?'WebKit':'Chromium'} : 11 collections fictives, extensions numériques exactes et types conservés après IndexedDB, édition, réouverture et export.`);
  console.log('✓ Refus avant remplacement : champs utilisés non fidèles, doublons, nouvelles collections/racine, v1 avec trajets, nombre trop long ; rétrogradation IndexedDB v2 bloquée.');
  console.log('✓ CQ : identifiants vides/répétés, titre vide/CRLF, déplacement, suppression et ajout sans mélanger les extensions.');
  console.log('✓ Véhicule, six rubriques, point CQ et thème modifiés ; cache hors ligne simulé. Aucun téléphone réel testé.');
 } finally {if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
