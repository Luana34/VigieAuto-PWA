/* Vérifie la copie réellement publiable, servie dans un sous-chemin GitHub Pages. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const http = require('node:http');
const {spawnSync} = require('node:child_process');
const {chromium, webkit} = require('playwright');
const source = path.resolve(__dirname, '..');
const useWebkit = process.env.VIGIE_BROWSER === 'webkit';
const engine = useWebkit ? webkit : chromium;
const mime = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.webmanifest':'application/manifest+json'};
function copySite(destination) {
  const python = `import sys, shutil\nfrom pathlib import Path\nsys.path.insert(0, str(Path(sys.argv[1])/'scripts'))\nfrom publication import publication_sources\nroot=Path(sys.argv[2]); root.mkdir()\nfor rel,p in publication_sources(Path(sys.argv[1])).items():\n q=root/rel; q.parent.mkdir(parents=True,exist_ok=True); shutil.copyfile(p,q)\n`;
  const proc = spawnSync('python3', ['-c', python, source, destination], {encoding:'utf8'});
  if (proc.status !== 0) throw Error(proc.stderr || 'Impossible de préparer le site de test.');
}
async function serve(root) {
  const prefix = '/depot/VigieAuto/';
  const missing = [];
  const server = http.createServer((req, res) => {
    if (server.disconnect) {req.socket.destroy(); return;}
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (!pathname.startsWith(prefix)) return res.writeHead(404).end();
    let file = path.resolve(root, '.' + pathname.slice(prefix.length - 1));
    if (file !== root && !file.startsWith(root + path.sep)) return res.writeHead(403).end();
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file,'index.html');
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) { missing.push(pathname); return res.writeHead(404).end(); }
    res.writeHead(200, {'content-type':mime[path.extname(file)]||'application/octet-stream','cache-control':'no-store'});
    fs.createReadStream(file).pipe(res);
  });
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  return {server, url:`http://127.0.0.1:${server.address().port}${prefix}`, missing};
}
async function exportData(p) {
  await p.locator('.mobile-nav [data-route=parametres]').click();
  await p.waitForFunction(()=>document.title==='Paramètres — VigieAuto');
  const download=p.waitForEvent('download'); await p.locator('[data-action=export]').click();
  return JSON.parse(fs.readFileSync(await (await download).path(),'utf8')).data;
}
(async()=>{
  const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'vigie-site-'));
  const site=process.env.VIGIE_SITE_DIR ? path.resolve(process.env.VIGIE_SITE_DIR) : path.join(tmp,'site');
  if (!process.env.VIGIE_SITE_DIR) copySite(site);
  let browser; const {server,url,missing}=await serve(site);
  try {
    browser=await engine.launch(useWebkit?{headless:true}:{headless:true,args:['--no-sandbox']});
    const ctx=await browser.newContext({viewport:{width:390,height:844},locale:'fr-FR',timezoneId:'Europe/Paris',acceptDownloads:true});
    const p=await ctx.newPage(), errors=[]; p.on('pageerror',e=>errors.push(e.message)); p.on('dialog',d=>d.accept());
    await p.goto(url,{waitUntil:'networkidle'});
    assert.equal(await p.locator('.mobile-nav button').count(),5);
    await p.locator('[data-action=start-real]').click();
    await p.locator('#modal [name=brand]').fill('Citroën');
    await p.locator('#modal [name=model]').fill('C3');
    await p.locator('#modal [name=odometer]').fill('12345');
    await p.locator('#modal button[type=submit]').click(); await p.locator('#modal').waitFor({state:'hidden'});
    const before=await exportData(p); assert.ok(before.vehicles.some(v=>v.brand==='Citroën' && v.model==='C3'));
    await p.evaluate(async()=>navigator.serviceWorker.ready); await p.waitForFunction(()=>!!navigator.serviceWorker.controller);
    const cached=await p.evaluate(async()=>{const names=await caches.keys();const c=await caches.open(names.find(n=>n.endsWith('v1.5.2-beta.13')));return (await c.keys()).map(r=>new URL(r.url).pathname)});
    assert.ok(cached.some(x=>x.endsWith('/js/catalogue.js'))); assert.ok(cached.some(x=>x.endsWith('/data/brands_models_fr.json')));
    assert.ok(cached.some(x=>x.endsWith('/assets/garage.jpg')));
    if(useWebkit) server.disconnect=true; else await ctx.setOffline(true);
    await p.reload({waitUntil:'load'}); const offline=await exportData(p);
    assert.deepEqual(offline,before,'les données locales exportées restent identiques hors ligne');
    assert.deepEqual(missing,[],'aucune ressource publique manquante en ligne');
    assert.deepEqual(errors,[]); await ctx.close();
    console.log(`✓ ${engine.name()} : copie publique dans un sous-dossier, création locale, cache et export hors ligne.`);
  } finally {
    if(browser) await browser.close(); await new Promise(r=>server.close(r)); fs.rmSync(tmp,{recursive:true,force:true});
  }
})().catch(e=>{console.error(e);process.exitCode=1;});
