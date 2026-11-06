/* Tests de couleurs sur l'application PWA réelle. npm run test:themes */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium, webkit } = require('playwright');
const root = path.resolve(__dirname, '..');
const types = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css', '.json':'application/json', '.webmanifest':'application/manifest+json', '.png':'image/png', '.svg':'image/svg+xml' };
const labels = { accueil:'Tableau de bord', garage:'Mes véhicules', entretien:'Entretien', pleins:'Pleins & conso', trajets:'Trajets', depenses:'Dépenses', rappels:'Rappels', controles:'Contrôles qualité', symptomes:'Symptômes', documents:'Documents', statistiques:'Statistiques', parametres:'Paramètres', plus:'Toutes les rubriques' };
async function serve() {
  const s=http.createServer((req,res)=>{
    const url=new URL(req.url, 'http://localhost'); const f=path.resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));
    if ((!f.startsWith(root+path.sep)) || !fs.existsSync(f) || !fs.statSync(f).isFile()) return res.writeHead(404).end();
    res.writeHead(200,{'content-type':types[path.extname(f)]||'application/octet-stream','cache-control':'no-store'});fs.createReadStream(f).pipe(res);
  });
  await new Promise(r=>s.listen(0,'127.0.0.1',r));return {s,base:`http://127.0.0.1:${s.address().port}`};
}
const nav=async(p,route)=>{
  await p.evaluate(r=>{location.hash=r},route);
  await p.waitForFunction(label=>document.title===`${label} — VigieAuto`,labels[route]);
};
const waitTheme=(p,value)=>p.waitForFunction(v=>document.documentElement.dataset.theme===v,value);
async function selectTheme(p,pref,actual) {
  await nav(p,'parametres'); await p.locator(`input[name=theme][value=${pref}]`).check(); await waitTheme(p,actual);
}
async function check(p,theme,expected) {
  const actual=await p.evaluate(()=>{
    const root=getComputedStyle(document.documentElement), body=getComputedStyle(document.body), workspace=getComputedStyle(document.querySelector('.workspace'));
    return { bg:root.getPropertyValue('--bg').trim(), body:body.backgroundColor, html:root.backgroundColor, workspace:workspace.backgroundColor,
      garage:document.querySelector('.garage-hero') ? getComputedStyle(document.querySelector('.garage-hero')).backgroundColor : null,
      card:document.querySelector('.settings-section.card') ? getComputedStyle(document.querySelector('.settings-section.card')).backgroundColor : null,
      surface:root.getPropertyValue('--surface').trim(), vehicle:root.getPropertyValue('--vehicle-bg').trim(), button:root.getPropertyValue('--button-bg').trim(),
      scrollWidth:document.documentElement.scrollWidth, width:document.documentElement.clientWidth,
      current:document.documentElement.dataset.theme };
  });
  assert.equal(actual.current,theme);
  for(const [key,value] of Object.entries(expected)) assert.equal(actual[key],value,`${theme} : ${key}`);
  const rgb=hex=>`rgb(${[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)).join(', ')})`;
  if(actual.garage) assert.equal(actual.garage,rgb(expected.vehicle),'la carte véhicule garde sa couleur');
  if(actual.card) assert.equal(actual.card,rgb(expected.surface),'les cartes de réglages gardent leur surface');
  assert.equal(actual.workspace,'rgba(0, 0, 0, 0)','la zone de page laisse apparaître le fond');
  assert.ok(actual.scrollWidth <= actual.width, `défilement horizontal ${actual.scrollWidth} > ${actual.width}`);
}
const darkSage={ bg:'#121212', body:'rgb(18, 18, 18)', html:'rgb(18, 18, 18)', surface:'#193128',vehicle:'#1b3b2b',button:'#91d2a5' };
const darkCyan={ bg:'#121212', body:'rgb(18, 18, 18)', html:'rgb(18, 18, 18)', surface:'#142f36',vehicle:'#09242b',button:'#54c7d0' };
const lightSage={ bg:'#edf4ee',body:'rgb(237, 244, 238)',html:'rgb(246, 248, 244)',surface:'#ffffff',vehicle:'#dbeade',button:'#286f4f' };
const lightCyan={ bg:'#eef6f7',body:'rgb(238, 246, 247)',html:'rgb(246, 248, 244)',surface:'#ffffff',vehicle:'#0c2d36',button:'#00798a' };
(async()=>{
  const {s,base}=await serve();const engine=process.env.VIGIE_BROWSER==='webkit'?webkit:chromium;
  let browser;
  try{
    browser=await engine.launch(engine===webkit?{headless:true}:{headless:true,args:['--no-sandbox']});
    const c=await browser.newContext({viewport:{width:390,height:844},locale:'fr-FR',colorScheme:'dark'});
    const p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
    await p.goto(base,{waitUntil:'networkidle'});await waitTheme(p,'cyan-dark');
    for(const [pref,theme,expected] of [['sauge','sauge-dark',darkSage],['cyan','cyan-dark',darkCyan]]) {
      await selectTheme(p,pref,theme);
      for(const route of Object.keys(labels)) { await nav(p,route); await check(p,theme,expected); }
      await p.reload({waitUntil:'networkidle'});await waitTheme(p,theme);await check(p,theme,expected);
      await p.setViewportSize({width:320,height:700});await check(p,theme,expected);
      await p.setViewportSize({width:1440,height:900});await check(p,theme,expected);
      await p.setViewportSize({width:390,height:844});
    }
    await p.emulateMedia({colorScheme:'light'});await waitTheme(p,'cyan');await check(p,'cyan',lightCyan);
    await selectTheme(p,'sauge','sauge');await check(p,'sauge',lightSage);
    await selectTheme(p,'auto','sauge');await check(p,'sauge',lightSage);
    await p.emulateMedia({colorScheme:'dark'});await waitTheme(p,'cyan-dark');await check(p,'cyan-dark',darkCyan);
    await p.reload({waitUntil:'networkidle'});await waitTheme(p,'cyan-dark');
    await nav(p,'parametres');assert.ok(await p.locator('input[name=theme][value=auto]').isChecked());
    assert.deepEqual(errors,[],'aucune erreur JavaScript');
    console.log(`✓ ${engine.name()} : 13 rubriques × Sauge/Cyan sombres, couleurs des cartes/boutons, clair, auto, persistance, 320/390/1440 px`);
    await c.close();
  }finally{if(browser)await browser.close();await new Promise(r=>s.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1});
