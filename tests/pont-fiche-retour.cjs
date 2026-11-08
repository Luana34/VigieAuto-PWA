/* Retour fictif PWA beta.16 → Android beta.45 / Room → PWA.
 * node tests/pont-fiche-retour.cjs chemin-vers-retour-android.json
 * Ne jamais utiliser de sauvegarde personnelle pour ce test. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const {chromium,webkit}=require('playwright');
const input=process.argv[2];if(!input)throw Error('Usage : node tests/pont-fiche-retour.cjs retour-android.json');
const root=process.env.VIGIE_SITE_DIR?path.resolve(process.env.VIGIE_SITE_DIR):path.resolve(__dirname,'..');
const useWebkit=process.env.VIGIE_BROWSER==='webkit',engine=useWebkit?webkit:chromium;
const raw=fs.readFileSync(input,'utf8'),android=JSON.parse(raw),id='0fd9a931-a838-40c6-a7f4-0471b9430eb6';
const original=android.data.vehicles.find(v=>v.id===id), profile=original.vigieVehicleProfile;
assert.equal(original.notes,'Note fictive modifiée sous Android');
assert.equal(profile.bodyColor,'Gris perle');assert.equal(profile.insurance.company,'Fictive');assert.equal(profile.insurance.policyNumber,'ABC');
assert.equal(profile.purchase.amount,'12345678901234567890.125');assert.equal(profile.purchase.currency,'CHF');
const occurrences=x=>(x.match(/12345678901234567890\.125/g)||[]).length;
assert.equal(occurrences(raw),4,'montant et nombres futurs exacts après le passage Android');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.webmanifest':'application/manifest+json'};
const go=async(p,route,label)=>{await p.evaluate(v=>location.hash=v,route);await p.waitForFunction(v=>document.title===`${v} — VigieAuto`,label);};
const exp=async p=>{await go(p,'parametres','Paramètres');const ev=p.waitForEvent('download');await p.locator('[data-action=export]').click();return fs.readFileSync(await(await ev).path(),'utf8');};
(async()=>{
 const s=http.createServer((req,res)=>{let f=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(f!==root&&!f.startsWith(root+path.sep))return res.writeHead(403).end();if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=path.join(f,'index.html');if(!fs.existsSync(f)||!fs.statSync(f).isFile())return res.writeHead(404).end();res.writeHead(200,{'content-type':mime[path.extname(f)]||'application/octet-stream','cache-control':'no-store'});fs.createReadStream(f).pipe(res);});
 await new Promise(r=>s.listen(0,'127.0.0.1',r));let browser;
 try{
  browser=await engine.launch(useWebkit?{headless:true}:{headless:true,args:['--no-sandbox']});
  const ctx=await browser.newContext({viewport:{width:390,height:844},locale:'fr-FR',timezoneId:'Europe/Paris',acceptDownloads:true}),p=await ctx.newPage(),errors=[];
  p.on('pageerror',e=>errors.push(e.message));p.on('dialog',d=>d.accept());await p.goto(`http://127.0.0.1:${s.address().port}/`,{waitUntil:'networkidle'});
  await p.locator('[data-action=start-real]').click();await p.locator('#modal [name=brand]').fill('Fictif');await p.locator('#modal [name=model]').fill('Temporaire');await p.locator('#modal [name=odometer]').fill('1');await p.locator('#modal button[type=submit]').click();await p.locator('#modal').waitFor({state:'hidden'});
  await go(p,'parametres','Paramètres');await p.locator('#import-file').setInputFiles({name:'retour-android-fictif.json',mimeType:'application/json',buffer:Buffer.from(raw)});await p.waitForFunction(()=>document.querySelector('#toast')?.textContent.includes('importée'));
  const beforeRaw=await exp(p),before=JSON.parse(beforeRaw);assert.deepEqual(before.data,android.data,'retour Android intact avant modification');assert.equal(occurrences(beforeRaw),4);
  await go(p,'garage','Mes véhicules');const tile=p.locator('.vehicle-tile').filter({has:p.locator(`[data-action=vehicle-profile][data-id="${id}"]`)});
  await tile.locator('[data-action=vehicle-profile]').click();
  assert.equal(await p.locator('#modal [name=profileBodyColor]').inputValue(),'Gris perle');
  assert.equal(await p.locator('#modal [name=profilePolicyNumber]').inputValue(),'ABC');
  assert.equal(await p.locator('#modal [name=profilePurchaseAmount]').inputValue(),'12345678901234567890.125');
  assert.equal(await p.locator('#modal [name=profileCurrency]').inputValue(),'CHF');
  await p.locator('#modal [name=profileBodyColor]').fill('Rouge bordeaux');await p.locator('#modal button[type=submit]').click();await p.locator('#modal').waitFor({state:'hidden'});
  const changedRaw=await exp(p),changed=JSON.parse(changedRaw),expected=structuredClone(before.data);
  expected.vehicles.find(v=>v.id===id).vigieVehicleProfile.bodyColor='Rouge bordeaux';
  assert.deepEqual(changed.data,expected,'seule la couleur de carrosserie choisie change');assert.equal(occurrences(changedRaw),4,'nombres précis inchangés après le second passage PWA');assert.deepEqual(errors,[]);
  await ctx.close();console.log(`✓ ${engine.name()} : retour Android/Room fictif importé ; fiche, notes et nombres exacts conservés puis une seule couleur modifiée.`);
 }finally{if(browser)await browser.close();await new Promise(r=>s.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
