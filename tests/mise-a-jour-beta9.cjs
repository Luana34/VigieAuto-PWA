/* Vérifie une vraie mise à jour beta.8 -> beta.9 sur la même origine et hors ligne.
 * Le ZIP beta.8 de référence reste externe : VIGIE_PREVIOUS_PWA=/chemin/vers/zip. */
const assert=require('node:assert/strict'),fs=require('node:fs'),http=require('node:http'),path=require('node:path'),os=require('node:os');
const {spawnSync}=require('node:child_process'),{chromium,webkit}=require('playwright');
const root=path.resolve(__dirname,'..'),zip=process.env.VIGIE_PREVIOUS_PWA||path.join(root,'..','VigieAuto-v1.5.2-beta.8.zip');
const useWebkit=process.env.VIGIE_BROWSER==='webkit',engine=useWebkit?webkit:chromium;
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.webmanifest':'application/manifest+json'};
const go=async(p,r,label)=>{await p.evaluate(v=>location.hash=v,r);await p.waitForFunction(v=>document.title===`${v} — VigieAuto`,label);};
const field=(p,n,v)=>p.locator(`#modal [name="${n}"]`).fill(String(v));
const exportRaw=async p=>{await go(p,'parametres','Paramètres');const ev=p.waitForEvent('download');await p.locator('[data-action=export]').click();return fs.readFileSync(await(await ev).path(),'utf8');};
async function serve(dir){const s=http.createServer((req,res)=>{if(s.disconnect){req.socket.destroy();return;}let f=path.resolve(s.dir,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(f!==s.dir&&!f.startsWith(s.dir+path.sep))return res.writeHead(403).end();if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=path.join(f,'index.html');if(!fs.existsSync(f)||!fs.statSync(f).isFile())return res.writeHead(404).end();res.writeHead(200,{'content-type':mime[path.extname(f)]||'application/octet-stream','cache-control':'no-store'});fs.createReadStream(f).pipe(res);});s.dir=dir;await new Promise(r=>s.listen(0,'127.0.0.1',r));return {s,url:`http://127.0.0.1:${s.address().port}/`};}
(async()=>{
 if(!fs.existsSync(zip))throw Error(`Ancien ZIP beta.8 manquant : ${zip}`);
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'vigie-beta9-'));
 const unzip=spawnSync('python3',['-c','import sys,zipfile;zipfile.ZipFile(sys.argv[1]).extractall(sys.argv[2])',zip,tmp],{encoding:'utf8'});if(unzip.status)throw Error(unzip.stderr);
 const old=path.join(tmp,'VigieAuto');assert.match(fs.readFileSync(path.join(old,'js/app.js'),'utf8'),/const APP_VERSION = "1\.5\.2-beta\.8"/);
 const fixture=fs.readFileSync(path.join(root,'tests/fixtures/pwa-v5-operations.json')),{s,url}=await serve(old);let browser;
 try{
  browser=await engine.launch(useWebkit?{headless:true}:{headless:true,args:['--no-sandbox']});
  const ctx=await browser.newContext({viewport:{width:390,height:844},locale:'fr-FR',timezoneId:'Europe/Paris',acceptDownloads:true});
  const p=await ctx.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('dialog',d=>d.accept());
  await p.goto(url,{waitUntil:'networkidle'});await p.locator('[data-action=start-real]').click();await field(p,'brand','Renault');await field(p,'model','Clio');await field(p,'odometer',1000);await p.locator('#modal button[type=submit]').click();await p.locator('#modal').waitFor({state:'hidden'});
  await go(p,'parametres','Paramètres');await p.locator('#import-file').setInputFiles({name:'fictif-v5.json',mimeType:'application/json',buffer:fixture});await p.waitForFunction(()=>document.querySelector('#toast')?.textContent.includes('importée'));
  const before=await exportRaw(p);assert.equal(JSON.parse(before).formatVersion,5);assert.match(before,/12345678901234567890\.125/);
  assert.match(await p.locator('#app-version').innerText(),/beta\.8/);await p.evaluate(()=>navigator.serviceWorker.ready);await p.waitForFunction(()=>!!navigator.serviceWorker.controller);
  s.dir=root;
  await p.evaluate(async()=>{await new Promise((resolve,reject)=>{const t=setTimeout(()=>reject(Error('Service worker non actualisé')),20000);navigator.serviceWorker.addEventListener('controllerchange',()=>{clearTimeout(t);resolve();},{once:true});navigator.serviceWorker.ready.then(r=>r.update()).catch(reject);});});
  await p.reload({waitUntil:'networkidle'});await go(p,'parametres','Paramètres');assert.match(await p.locator('#app-version').innerText(),/beta\.9/);
  assert.match(await p.locator('body').innerText(),/Android beta\.36/);assert.match(await p.locator('body').innerText(),/Android beta\.35/);
  const after=await exportRaw(p);assert.match(after,/12345678901234567890\.125/);assert.deepEqual(JSON.parse(after).data,JSON.parse(before).data);
  const cache=await p.evaluate(()=>caches.keys());assert.ok(cache.some(x=>x.endsWith('v1.5.2-beta.9')));assert.ok(!cache.some(x=>x.endsWith('v1.5.2-beta.8')));
  if(useWebkit)s.disconnect=true;else await ctx.setOffline(true);
  await p.reload({waitUntil:'load'});await go(p,'parametres','Paramètres');const offline=await exportRaw(p);assert.deepEqual(JSON.parse(offline).data,JSON.parse(after).data);
  assert.deepEqual(errors,[]);await ctx.close();console.log(`✓ ${useWebkit?'WebKit':'Chromium'} : ancienne beta.8 réelle → beta.9, stockage intact, messages corrigés et export hors ligne.`);
 }finally{if(browser)await browser.close();await new Promise(r=>s.close(r));fs.rmSync(tmp,{recursive:true,force:true});}
})().catch(e=>{console.error(e);process.exitCode=1;});
