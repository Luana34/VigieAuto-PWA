/* Vérifie les aides locales réelles, sans altérer les brouillons.
 * npm run test:aides ; VIGIE_BROWSER=webkit pour WebKit Linux. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const {chromium, webkit} = require('playwright');
const root = path.resolve(__dirname, '..');
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.webmanifest':'application/manifest+json','.png':'image/png','.svg':'image/svg+xml','.jpg':'image/jpeg'};
const labels = {garage:'Mes véhicules', pleins:'Pleins & conso', parametres:'Paramètres'};
async function serve() {
  const server = http.createServer((req,res) => {
    if (server.disconnect) { req.socket.destroy(); return; }
    let f = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
    if (f !== root && !f.startsWith(root + path.sep)) return res.writeHead(403).end();
    if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f=path.join(f,'index.html');
    if (!fs.existsSync(f) || !fs.statSync(f).isFile()) return res.writeHead(404).end();
    res.writeHead(200,{'content-type':types[path.extname(f)]||'application/octet-stream','cache-control':'no-store'}); fs.createReadStream(f).pipe(res);
  });
  await new Promise(r => server.listen(0,'127.0.0.1',r)); return {server,base:`http://127.0.0.1:${server.address().port}/`};
}
const nav = async (p,route) => { await p.evaluate(r => {location.hash=r},route); await p.waitForFunction(label=>document.title===`${label} — VigieAuto`,labels[route]); };
const field = (p,name,value) => p.locator(`#modal [name="${name}"]`).fill(String(value));
const submit = async p => { await p.locator('#modal button[type=submit]').click(); await p.locator('#modal').waitFor({state:'hidden'}); };
const addFill = async p => { await p.locator('.mobile-floating-add').click(); await p.locator('#modal [data-action=add-fill]').click(); };
const closeForm = async p => { await p.locator('#modal .modal-header [data-action=close-modal]').click(); await p.locator('#modal').waitFor({state:'hidden'}); };
const waitHelpClosed = async p => { await p.locator('#info-dialog').waitFor({state:'hidden'}); await p.waitForFunction(()=>!history.state?.vigieInfo); };
const open = async (p,topic) => { const button=p.locator(`[data-action=open-info][data-topic="${topic}"]`); await button.click(); await p.locator('#info-dialog').waitFor({state:'visible'}); return button; };
const stored = (p,store) => p.evaluate(name=>new Promise((resolve,reject)=>{
  const open=indexedDB.open('cq-auto-local',7);open.onerror=()=>reject(open.error);
  open.onsuccess=()=>{const db=open.result,tx=db.transaction(name,'readonly'),req=tx.objectStore(name).getAll();
    tx.oncomplete=()=>{db.close();resolve(req.result)};tx.onabort=()=>{db.close();reject(tx.error)};};
}),store);
function contrast(a,b) {
  const lum=s=>{const rgb=s.match(/[\d.]+/g).slice(0,3).map(n=>Number(n)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return .2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2];};
  const [lo,hi]=[lum(a),lum(b)].sort((x,y)=>x-y);return(hi+.05)/(lo+.05);
}
(async()=>{
  const {server,base}=await serve(); const useWebkit=process.env.VIGIE_BROWSER==='webkit',engine=useWebkit?webkit:chromium; let browser;
  try {
    browser=await engine.launch(useWebkit?{headless:true}:{headless:true,args:['--no-sandbox']});
    const ctx=await browser.newContext({viewport:{width:390,height:844},locale:'fr-FR',timezoneId:'Europe/Paris',colorScheme:'light'});
    const p=await ctx.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
    await p.goto(base,{waitUntil:'networkidle'});await p.evaluate(()=>navigator.serviceWorker.ready);await p.waitForFunction(()=>!!navigator.serviceWorker.controller);
    // VIN optionnel : le dialogue ne soumet pas le formulaire et ne change pas les valeurs.
    await p.locator('[data-action=start-real]').click(); await field(p,'brand','Renault'); await field(p,'model','Clio'); await field(p,'odometer',1000); await field(p,'vin','VIN-LIBRE');
    const vin=await open(p,'vin'); let text=await p.locator('#info-dialog').innerText();
    assert.match(text,/repère E/);assert.match(text,/souvent 17 caractères/);assert.match(text,/facultatif/);
    assert.equal(await p.locator('#modal [name=vin]').inputValue(),'VIN-LIBRE');
    await p.locator('#info-dialog [data-action=close-info]').click(); await waitHelpClosed(p);
    assert.equal(await p.evaluate(()=>document.activeElement?.dataset.topic),'vin','focus rendu au bouton VIN');
    assert.equal(await p.locator('#modal [name=vin]').inputValue(),'VIN-LIBRE'); assert.equal((await stored(p,'vehicles')).length,0);
    await submit(p); assert.equal((await stored(p,'vehicles'))[0].vin,'VIN-LIBRE');
    await nav(p,'pleins');
    // Aide globale : le retour navigateur ferme le panneau au lieu de quitter la page.
    await open(p,'consumption'); text=await p.locator('#info-dialog').innerText();
    assert.match(text,/18 L \+ 42 L/);assert.match(text,/7,5 L\/100 km/);assert.match(text,/premier plein complet/);
    assert.match(text,/coût énergie\/km/i);assert.match(text,/devises/i);assert.equal(await p.locator('#info-dialog').getAttribute('data-presentation'),'sheet');
    await p.evaluate(()=>history.back());await waitHelpClosed(p);assert.equal(await p.evaluate(()=>location.hash),'#pleins');
    // Revenir puis avancer ne doit pas garder un marqueur d’aide fantôme dans l’historique.
    await p.evaluate(()=>new Promise(resolve=>{addEventListener('popstate',()=>setTimeout(resolve,0),{once:true});history.forward()}));
    assert.equal(await p.evaluate(()=>!!history.state?.vigieInfo),false);assert.equal(await p.locator('#info-dialog').isVisible(),false);
    await open(p,'consumption');await p.locator('#info-dialog [data-action=close-info]').click();await waitHelpClosed(p);
    // Un clic sur ⓘ ne change pas la case ni les champs ; Echap ferme seulement l’aide.
    await addFill(p);await field(p,'volume','14.50');await field(p,'total','25');await field(p,'notes','Brouillon fictif');
    const full=p.getByLabel('Plein complet',{exact:true});assert.equal(await full.isChecked(),true);
    const fullHelp=await open(p,'full-fuel');text=await p.locator('#info-dialog').innerText();
    assert.match(text,/décochez si le réservoir n’est pas plein/i);assert.match(text,/cochée par défaut/i);
    assert.equal(await full.isChecked(),true,'cliquer sur ⓘ ne change pas la case');
    assert.equal(await p.locator('#modal [name=volume]').inputValue(),'14.50');assert.equal((await stored(p,'fills')).length,0,'ouvrir l’aide ne sauvegarde rien');
    await p.keyboard.press('Escape');await waitHelpClosed(p);assert.equal(await p.locator('#modal').isVisible(),true);
    assert.equal(await p.evaluate(()=>document.activeElement?.dataset.topic),'full-fuel','focus rendu au bouton plein');
    assert.equal(await p.locator('#modal [name=notes]').inputValue(),'Brouillon fictif');
    await full.uncheck(); await open(p,'full-fuel'); await p.evaluate(()=>history.back()); await waitHelpClosed(p);
    assert.equal(await full.isChecked(),false);assert.equal(await p.locator('#modal [name=total]').inputValue(),'25');
    // Fermeture et réouverture immédiate : une ancienne navigation ne ferme pas la nouvelle aide.
    await open(p,'full-fuel');const token=await p.evaluate(()=>history.state.vigieInfo);
    await p.evaluate(()=>{document.querySelector('#info-dialog [data-action=close-info]').click();document.querySelector('#modal [data-topic="full-fuel"]').click();});
    await p.waitForFunction(old=>document.querySelector('#info-dialog').open && history.state?.vigieInfo && history.state.vigieInfo!==old,token);
    assert.equal(await full.isChecked(),false);await p.locator('#info-dialog [data-action=close-info]').click();await waitHelpClosed(p);
    await submit(p);let saved=await stored(p,'fills');assert.equal(saved.length,1);assert.equal(saved[0].full,false);assert.equal(saved[0].notes,'Brouillon fictif');
    await p.reload({waitUntil:'networkidle'});await nav(p,'pleins');assert.match(await p.locator('.list-row').first().innerText(),/Partiel/);
    // Palette, contraste et tailles du panneau, y compris sur petit écran.
    for(const [preference,scheme,theme,width] of [['sauge','light','sauge',320],['cyan','light','cyan',390],['sauge','dark','sauge-dark',390],['cyan','dark','cyan-dark',320]]) {
      await p.setViewportSize({width,height:844});await p.emulateMedia({colorScheme:scheme});
      await nav(p,'parametres');await p.locator(`input[name=theme][value=${preference}]`).check();await p.waitForFunction(t=>document.documentElement.dataset.theme===t,theme);
      await nav(p,'pleins');const button=await open(p,'consumption');
      const styles=await p.evaluate(()=>{const d=document.querySelector('#info-dialog'),b=d.querySelector('.info-body'),button=document.querySelector('[data-topic=consumption]'),r=button.getBoundingClientRect();return {fg:getComputedStyle(b).color,bg:getComputedStyle(d).backgroundColor,size:parseFloat(getComputedStyle(b).fontSize),bw:r.width,bh:r.height,width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth};});
      assert.ok(contrast(styles.fg,styles.bg)>=4.5,`${theme} : contraste`);assert.ok(styles.size>=16,`${theme} : texte`);
      assert.ok(styles.bw>=44&&styles.bh>=44,`${theme} : zone de contact`);assert.ok(styles.scroll<=styles.width,`${theme} : aucun débordement`);
      await p.locator('#info-dialog [data-action=close-info]').click();await waitHelpClosed(p);assert.equal(await button.getAttribute('aria-label'),'Comprendre le calcul de consommation');
    }
    // Édition d’un VIN libre : le brouillon est préservé et peut être enregistré.
    await p.setViewportSize({width:390,height:844});await nav(p,'garage');await p.locator('[data-action=edit-vehicle]').click();await field(p,'vin','VIN-NON-STANDARD');
    await open(p,'vin');await p.locator('#info-dialog [data-action=close-info]').click();await waitHelpClosed(p);
    assert.equal(await p.locator('#modal [name=vin]').inputValue(),'VIN-NON-STANDARD');await submit(p);assert.equal((await stored(p,'vehicles'))[0].vin,'VIN-NON-STANDARD');
    // La version électrique explique séparément le 100 % et laisse le choix inchangé.
    await nav(p,'garage');await p.locator('[data-action=add-vehicle]').first().click();await field(p,'brand','Exemple');await field(p,'model','Électrique');
    await p.locator('#modal [name=fuel]').selectOption('electrique');await field(p,'odometer',2000);await submit(p);await nav(p,'pleins');await addFill(p);
    const electric=p.getByLabel('Batterie rechargée à 100 %',{exact:true});assert.equal(await electric.isChecked(),true);await open(p,'full-electric');
    text=await p.locator('#info-dialog').innerText();assert.match(text,/rechargée à 100 %/i);assert.match(text,/décochez/i);assert.equal(await electric.isChecked(),true);
    await p.locator('#info-dialog [data-action=close-info]').click();await waitHelpClosed(p);await closeForm(p);
    // Les aides sont disponibles après mise en cache, sans réseau.
    if(useWebkit)server.disconnect=true;else await ctx.setOffline(true);
    await p.reload({waitUntil:'load'});await nav(p,'pleins');await open(p,'consumption');assert.match(await p.locator('#info-dialog').innerText(),/7,5 L\/100 km/);
    await p.locator('#info-dialog [data-action=close-info]').click();await waitHelpClosed(p);await addFill(p);await open(p,'full-electric');
    assert.match(await p.locator('#info-dialog').innerText(),/100 %/);await p.locator('#info-dialog [data-action=close-info]').click();await waitHelpClosed(p);await closeForm(p);
    assert.deepEqual(errors,[],'aucune erreur JavaScript');await ctx.close();
    console.log(`✓ ${engine.name()} : aides plein, recharge, VIN et calcul ; brouillons, case, focus, retour/Echap, réouverture rapide, 4 thèmes, 320/390 px et hors ligne`);
  }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1});
