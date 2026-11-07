/* Mise à jour réelle beta.11 -> beta.12 sur la même origine, puis hors ligne.
 * Archive antérieure externe : VIGIE_PREVIOUS_PWA=/chemin/vers/beta11.zip.
 * Après nettoyage des ZIP, fournir ce fichier soi-même pour rejouer ce test. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const os = require('node:os');
const {spawnSync} = require('node:child_process');
const {chromium, webkit} = require('playwright');
const root = path.resolve(__dirname, '..');
const zip = process.env.VIGIE_PREVIOUS_PWA || path.join(root, '..', 'VigieAuto-v1.5.2-beta.11.zip');
const useWebkit = process.env.VIGIE_BROWSER === 'webkit', engine = useWebkit ? webkit : chromium;
const mime = {'.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css', '.json':'application/json', '.png':'image/png', '.jpg':'image/jpeg', '.svg':'image/svg+xml', '.webmanifest':'application/manifest+json'};
const go = async (p,r,label) => { await p.evaluate(v => { location.hash = v; },r); await p.waitForFunction(v => document.title === `${v} — VigieAuto`,label); };
const field = (p,n,v) => p.locator(`#modal [name="${n}"]`).fill(String(v));
const exportRaw = async p => { await go(p,'parametres','Paramètres'); const ev=p.waitForEvent('download'); await p.locator('[data-action=export]').click(); return fs.readFileSync(await (await ev).path(),'utf8'); };
async function serve(dir) {
  const s = http.createServer((req,res) => {
    if (s.disconnect) { req.socket.destroy(); return; }
    let f = path.resolve(s.dir,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
    if (f !== s.dir && !f.startsWith(s.dir+path.sep)) return res.writeHead(403).end();
    if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f=path.join(f,'index.html');
    if (!fs.existsSync(f) || !fs.statSync(f).isFile()) return res.writeHead(404).end();
    res.writeHead(200,{'content-type':mime[path.extname(f)]||'application/octet-stream','cache-control':'no-store'}); fs.createReadStream(f).pipe(res);
  });
  s.dir=dir; await new Promise(r=>s.listen(0,'127.0.0.1',r)); return {s,url:`http://127.0.0.1:${s.address().port}/`};
}
async function inspectPartial(p) {
  await go(p,'pleins','Pleins & conso');
  const row=p.locator('.list-row').filter({hasText:'Partiel suisse'});
  assert.match(await row.innerText(),/Partiel/); await row.locator('[data-action=edit-fill]').click();
  const box=p.getByLabel('Plein complet',{exact:true}); assert.equal(await box.isChecked(),false,'un plein déjà partiel reste décoché');
  const dimensions=await box.evaluate(e=>({width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height,weight:Number(getComputedStyle(e.closest('label')).fontWeight)}));
  assert.ok(dimensions.width>=24 && dimensions.height>=24 && dimensions.weight>=700,'style de la case préservé');
  await p.locator('#modal [data-topic=full-fuel]').click();
  assert.match(await p.locator('#info-dialog').innerText(),/décochez si le réservoir/i);
  assert.equal(await box.isChecked(),false,'l’aide n’a pas modifié le plein partiel');
  await p.locator('#info-dialog [data-action=close-info]').click();
  await p.waitForFunction(()=>!document.querySelector('#info-dialog').open && !history.state?.vigieInfo);
  await p.locator('#modal .modal-header [data-action=close-modal]').click();
}
(async()=>{
  if (!fs.existsSync(zip)) throw Error(`Ancien ZIP beta.11 manquant : ${zip} (ou définir VIGIE_PREVIOUS_PWA)`);
  const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'vigie-beta11-'));
  const unzip=spawnSync('python3',['-c','import sys,zipfile;zipfile.ZipFile(sys.argv[1]).extractall(sys.argv[2])',zip,tmp],{encoding:'utf8'});
  if (unzip.status) throw Error(unzip.stderr);
  const old=path.join(tmp,'VigieAuto');
  assert.match(fs.readFileSync(path.join(old,'js/app.js'),'utf8'),/const APP_VERSION = "1\.5\.2-beta\.11"/);
  const fixture=fs.readFileSync(path.join(root,'tests/fixtures/pwa-v5-operations.json'));
  const {s,url}=await serve(old); let browser;
  try {
    browser=await engine.launch(useWebkit?{headless:true}:{headless:true,args:['--no-sandbox']});
    const ctx=await browser.newContext({viewport:{width:390,height:844},locale:'fr-FR',timezoneId:'Europe/Paris',acceptDownloads:true,colorScheme:'dark'});
    const p=await ctx.newPage(),errors=[]; p.on('pageerror',e=>errors.push(e.message)); p.on('dialog',d=>d.accept());
    await p.goto(url,{waitUntil:'networkidle'}); await p.locator('[data-action=start-real]').click();
    await field(p,'brand','Renault'); await field(p,'model','Clio'); await field(p,'odometer',1000);
    await p.locator('#modal button[type=submit]').click(); await p.locator('#modal').waitFor({state:'hidden'});
    await go(p,'parametres','Paramètres'); await p.locator('#import-file').setInputFiles({name:'fictif-v5.json',mimeType:'application/json',buffer:fixture});
    await p.waitForFunction(()=>document.querySelector('#toast')?.textContent.includes('importée'));
    const before=await exportRaw(p); assert.equal(JSON.parse(before).formatVersion,5); assert.match(before,/12345678901234567890\.125/);
    assert.ok(JSON.parse(before).data.fills.some(x=>x.full===false));
    assert.ok(JSON.parse(before).data.fills.some(x=>x.full===true));
    assert.match(await p.locator('#app-version').innerText(),/beta\.11/);
    await p.evaluate(()=>navigator.serviceWorker.ready); await p.waitForFunction(()=>!!navigator.serviceWorker.controller);
    s.dir=root;
    await p.evaluate(async()=>{await new Promise((resolve,reject)=>{
      const t=setTimeout(()=>reject(Error('Service worker non actualisé')),20000);
      navigator.serviceWorker.addEventListener('controllerchange',()=>{clearTimeout(t);resolve();},{once:true});
      navigator.serviceWorker.ready.then(r=>r.update()).catch(reject);
    });});
    await p.reload({waitUntil:'networkidle'}); await go(p,'parametres','Paramètres');
    assert.match(await p.locator('#app-version').innerText(),/beta\.12/);
    const after=await exportRaw(p); assert.match(after,/12345678901234567890\.125/);
    assert.deepEqual(JSON.parse(after).data,JSON.parse(before).data,'stockage exporté inchangé');
    const cache=await p.evaluate(()=>caches.keys());
    assert.ok(cache.some(x=>x.endsWith('v1.5.2-beta.12'))); assert.ok(!cache.some(x=>x.endsWith('v1.5.2-beta.11')));
    await inspectPartial(p);
    if (useWebkit) s.disconnect=true; else await ctx.setOffline(true);
    await p.reload({waitUntil:'load'}); await inspectPartial(p);
    const offline=await exportRaw(p); assert.deepEqual(JSON.parse(offline).data,JSON.parse(after).data);
    assert.deepEqual(errors,[]); await ctx.close();
    console.log(`✓ ${engine.name()} : beta.11 réelle → beta.12, pleins et export v5 intacts, aide et données hors ligne.`);
  } finally { if (browser) await browser.close(); await new Promise(r=>s.close(r)); fs.rmSync(tmp,{recursive:true,force:true}); }
})().catch(e=>{console.error(e);process.exitCode=1;});
