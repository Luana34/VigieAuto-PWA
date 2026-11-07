/* Interface et stockage fictifs : de vraies propositions visibles et sélectionnées,
 * pas seulement des <option> présentes dans le DOM ou filtrées par le navigateur. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const {chromium,webkit}=require('playwright');
const useWebkit=process.env.VIGIE_BROWSER==='webkit',engine=useWebkit?webkit:chromium;
const root=process.env.VIGIE_SITE_DIR?path.resolve(process.env.VIGIE_SITE_DIR):path.resolve(__dirname,'..');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.webmanifest':'application/manifest+json'};
async function serve(){
 const server=http.createServer((req,res)=>{
  if(server.offline){req.socket.destroy();return;}
  let file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
  if(file!==root&&!file.startsWith(root+path.sep))return res.writeHead(403).end();
  if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
  if(!fs.existsSync(file)||!fs.statSync(file).isFile())return res.writeHead(404).end();
  res.writeHead(200,{'content-type':mime[path.extname(file)]||'application/octet-stream','cache-control':'no-store'});fs.createReadStream(file).pipe(res);
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));return {server,url:`http://127.0.0.1:${server.address().port}/`};
}
const form=p=>p.locator('#modal form[data-form=vehicle]');
const input=(p,name)=>form(p).locator(`[name="${name}"]`);
const list=(p,name)=>form(p).locator(`#${name}-suggestions`);
const option=(p,name,value)=>list(p,name).getByRole('option',{name:value,exact:true});
const submit=async p=>{await form(p).locator('button[type=submit]').click();await p.locator('#modal').waitFor({state:'hidden'});};
const close=async p=>{await p.locator('#modal .modal-header [data-action=close-modal]').click();await p.locator('#modal').waitFor({state:'hidden'});};
const garage=async p=>{await p.evaluate(()=>location.hash='garage');await p.waitForFunction(()=>document.title==='Mes véhicules — VigieAuto');};
const add=async p=>{await garage(p);await p.locator('[data-action=add-vehicle]').first().click();};
const records=p=>p.evaluate(async()=>{const {LocalDatabase,DB_CONTRACT}=await import('./js/db.js');const db=await new LocalDatabase().open(DB_CONTRACT);const value=await db.readAll();db.db.close();return value;});
function contrast(foreground,background) {
 const luminance=value=>{
  const channels=value.match(/\d+(?:\.\d+)?/g).slice(0,3).map(Number).map(n=>n/255).map(n=>n<=.04045?n/12.92:((n+.055)/1.055)**2.4);
  return .2126*channels[0]+.7152*channels[1]+.0722*channels[2];
 };
 const a=luminance(foreground),b=luminance(background);return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);
}
async function mustBeVisibleAndTouchable(locator) {
 await locator.waitFor({state:'visible'});await locator.scrollIntoViewIfNeeded();
 const details=await locator.evaluate(el=>{
  const r=el.getBoundingClientRect(),hit=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);
  return {width:r.width,height:r.height,visible:r.top>=0&&r.bottom<=innerHeight,hit:el===hit||el.contains(hit)};
 });
 assert.ok(details.width>0 && details.height>=44,'cible visible et hauteur tactile de 44 px');
 assert.ok(details.visible && details.hit,'la proposition est réellement atteignable, pas seulement présente dans le DOM');
}
(async()=>{
 const {server,url}=await serve();let browser;
 try{
  browser=await engine.launch(useWebkit?{headless:true}:{headless:true,args:['--no-sandbox']});
  const ctx=await browser.newContext({viewport:{width:390,height:844},locale:'fr-FR',timezoneId:'Europe/Paris',acceptDownloads:true});
  const p=await ctx.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('dialog',d=>d.accept());
  await p.goto(url,{waitUntil:'networkidle'});await p.locator('[data-action=start-real]').click();
  assert.equal(await input(p,'model').isDisabled(),true);
  assert.equal(await input(p,'brand').getAttribute('role'),'combobox');
  assert.equal(await input(p,'brand').getAttribute('aria-controls'),'brand-suggestions');
  await input(p,'brand').fill('renult');
  assert.equal(await input(p,'brand').inputValue(),'renult','aucune correction automatique');
  const renault=option(p,'brand','Renault');await mustBeVisibleAndTouchable(renault);
  assert.equal(await input(p,'brand').getAttribute('aria-expanded'),'true');
  await input(p,'model').fill('cio');
  assert.equal(await option(p,'model','Clio').count(),0,'une marque approchante non choisie ne sélectionne pas les modèles de Renault');
  await input(p,'brand').focus();await option(p,'brand','Renault').click();
  assert.equal(await input(p,'brand').inputValue(),'Renault');assert.equal(await input(p,'model').inputValue(),'');
  await input(p,'model').fill('cio');const clio=option(p,'model','Clio');await mustBeVisibleAndTouchable(clio);
  assert.equal(await input(p,'model').inputValue(),'cio');await clio.click();
  assert.equal(await input(p,'model').inputValue(),'Clio');assert.equal(await input(p,'model').getAttribute('aria-expanded'),'false');
  await input(p,'odometer').fill('12345');await submit(p);
  let saved=await records(p);assert.ok(saved.vehicles.some(v=>v.brand==='Renault'&&v.model==='Clio'));

  // Clavier : sélectionner seulement après flèche + Entrée ; Échap ferme d'abord la liste.
  await add(p);await form(p).locator('[data-action=free-brand]').click();await input(p,'brand').fill('renualt');
  await input(p,'brand').press('ArrowDown');
  assert.equal(await input(p,'brand').inputValue(),'renualt','la flèche ne sélectionne pas automatiquement');
  assert.equal(await option(p,'brand','Renault').getAttribute('aria-selected'),'true');
  assert.equal(await input(p,'brand').getAttribute('aria-activedescendant'),await option(p,'brand','Renault').getAttribute('id'));
  await input(p,'brand').press('Enter');assert.equal(await input(p,'brand').inputValue(),'Renault');assert.equal(await p.locator('#modal').evaluate(x=>x.open),true);
  await input(p,'model').fill('cloi');await input(p,'model').press('ArrowDown');
  assert.equal(await input(p,'model').inputValue(),'cloi');await input(p,'model').press('Escape');
  assert.equal(await input(p,'model').getAttribute('aria-expanded'),'false');assert.equal(await p.locator('#modal').evaluate(x=>x.open),true,'Échap ne ferme pas le formulaire ouvert');
  await input(p,'model').press('ArrowDown');await input(p,'model').press('Enter');assert.equal(await input(p,'model').inputValue(),'Clio');
  await input(p,'odometer').fill('23456');await submit(p);

  // Modification : proposition visible, annulation non destructive, puis
  // enregistrement en conservant le compteur et les propriétés futures.
  saved=await records(p);const editId=saved.vehicles.find(v=>v.brand==='Renault'&&v.model==='Clio').id;
  await p.evaluate(async(id)=>{
    const {LocalDatabase,DB_CONTRACT}=await import('./js/db.js'),db=await new LocalDatabase().open(DB_CONTRACT),all=await db.readAll();
    const vehicle=all.vehicles.find(v=>v.id===id);vehicle.futureVehicule={garder:true};
    await db.apply([{store:'vehicles',type:'put',value:vehicle}]);db.db.close();
  },editId);
  await p.reload({waitUntil:'networkidle'});await garage(p);const beforeEdit=await records(p);
  await p.locator(`[data-action=edit-vehicle][data-id="${editId}"]`).click();
  await input(p,'model').fill('captr');await mustBeVisibleAndTouchable(option(p,'model','Captur'));
  await option(p,'model','Captur').click();await close(p);
  assert.deepEqual(await records(p),beforeEdit,'l’annulation de la modification ne change rien');
  await p.locator(`[data-action=edit-vehicle][data-id="${editId}"]`).click();
  await input(p,'model').fill('captr');await option(p,'model','Captur').click();await submit(p);
  saved=await records(p);const edited=saved.vehicles.find(v=>v.id===editId),original=beforeEdit.vehicles.find(v=>v.id===editId);
  assert.equal(edited.model,'Captur');assert.equal(edited.odometer,original.odometer);
  assert.equal(edited.initialKm,original.initialKm);assert.deepEqual(edited.futureVehicule,{garder:true});

  // Saisie vraiment libre, y compris un nom personnel contenant du texte HTML.
  await add(p);await form(p).locator('[data-action=free-brand]').click();
  assert.equal(await input(p,'brand').getAttribute('aria-expanded'),'false','Autre invite à écrire');
  await input(p,'brand').fill('Maison <Libre>');await input(p,'model').fill('Étoile <script>');await input(p,'odometer').fill('300');await submit(p);
  saved=await records(p);assert.ok(saved.vehicles.some(v=>v.brand==='Maison <Libre>'&&v.model==='Étoile <script>'));
  await add(p);await input(p,'brand').fill('Maison <Libre>');await input(p,'model').fill('etole');
  const personal=option(p,'model','Étoile <script>');await mustBeVisibleAndTouchable(personal);
  assert.equal(await list(p,'model').locator('script').count(),0,'le texte personnel n’est jamais interprété comme du HTML');
  await personal.click();assert.equal(await input(p,'model').inputValue(),'Étoile <script>');
  await input(p,'brand').fill('Peugeot');await input(p,'model').fill('208');
  assert.equal(await option(p,'model','308').count(),0,'les nombres ne sont pas corrigés');
  assert.equal(await option(p,'model','Étoile <script>').count(),0,'le modèle personnel ne fuit pas vers une autre marque');
  await input(p,'odometer').fill('400');await submit(p);

  // Une recherche seule ne touche jamais la base ni les champs inconnus d'une sauvegarde.
  await p.evaluate(async()=>{
    const {LocalDatabase,DB_CONTRACT}=await import('./js/db.js'),db=await new LocalDatabase().open(DB_CONTRACT),all=await db.readAll();
    const s=all.settings.find(x=>x.id==='vehicleSuggestions');s.future={garder:true};s.models[0].futureModel='intact';
    await db.apply([{store:'settings',type:'put',value:s}]);db.db.close();
  });
  await p.reload({waitUntil:'networkidle'});const before=await records(p);
  await add(p);await form(p).locator('[data-action=free-brand]').click();await input(p,'brand').fill('x');await input(p,'brand').fill('');
  const ranked=await list(p,'brand').locator('[role=option]').allTextContents();
  assert.ok(ranked.indexOf('Peugeot')<ranked.indexOf('Audi'),'marque mémorisée avant une marque non mémorisée');
  assert.ok(ranked.indexOf('Maison <Libre>')<ranked.indexOf('Audi'));
  assert.ok(ranked.length<=80);
  await input(p,'brand').fill('Renault');await input(p,'model').fill('');
  const models=await list(p,'model').locator('[role=option]').allTextContents();
  assert.equal(models[0],'Clio','modèle mémorisé en premier à qualité égale');
  await input(p,'model').fill('cio');await mustBeVisibleAndTouchable(option(p,'model','Clio'));
  await close(p);assert.deepEqual(await records(p),before,'recherche et annulation sans écriture');

  // Aucun débordement et proposition réellement cliquable dans les quatre thèmes.
  for(const width of [320,390]) for(const theme of ['sauge','cyan','sauge-dark','cyan-dark']){
    await p.setViewportSize({width,height:844});await p.evaluate(t=>{document.documentElement.dataset.theme=t;},theme);
    await add(p);await input(p,'brand').fill('Renault');await input(p,'model').fill('cio');
    await mustBeVisibleAndTouchable(option(p,'model','Clio'));
    assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`${theme}/${width}`);
    assert.equal(await form(p).evaluate(el=>el.scrollWidth<=el.clientWidth),true,`formulaire ${theme}/${width}`);
    let style=await option(p,'model','Clio').evaluate(el=>({fg:getComputedStyle(el).color,bg:getComputedStyle(el.parentElement).backgroundColor}));
    assert.ok(contrast(style.fg,style.bg)>=4.5,`contraste du texte ${theme}/${width}`);
    await input(p,'model').press('ArrowDown');
    style=await option(p,'model','Clio').evaluate(el=>({fg:getComputedStyle(el).color,bg:getComputedStyle(el).backgroundColor}));
    assert.ok(contrast(style.fg,style.bg)>=4.5,`contraste de la sélection ${theme}/${width}`);
    await close(p);
  }
  await p.setViewportSize({width:390,height:844});
  await p.evaluate(async()=>navigator.serviceWorker.ready);await p.waitForFunction(()=>!!navigator.serviceWorker.controller);
  if(useWebkit)server.offline=true;else await ctx.setOffline(true);
  await p.reload({waitUntil:'load'});await add(p);await input(p,'brand').fill('Renault');await input(p,'model').fill('cio');
  await mustBeVisibleAndTouchable(option(p,'model','Clio'));await close(p);
  assert.deepEqual(await records(p),before,'données intactes après recherche hors ligne');
  if(useWebkit)server.offline=false;else await ctx.setOffline(false);

  // Une longue mémoire ne s'affiche pas en entier, mais reste intacte et filtrable.
  await p.evaluate(async()=>{
    const {LocalDatabase,DB_CONTRACT}=await import('./js/db.js'),db=await new LocalDatabase().open(DB_CONTRACT),all=await db.readAll();
    const s=all.settings.find(x=>x.id==='vehicleSuggestions');
    s.brands.push(...Array.from({length:1000},(_,i)=>`Fictive ${String(i).padStart(4,'0')}`));
    await db.apply([{store:'settings',type:'put',value:s}]);db.db.close();
  });
  await p.reload({waitUntil:'networkidle'});const many=await records(p);await add(p);
  await form(p).locator('[data-action=free-brand]').click();await input(p,'brand').fill('x');await input(p,'brand').fill('');
  assert.equal(await list(p,'brand').locator('[role=option]').count(),80,'affichage limité à 80');
  assert.equal(await list(p,'brand').evaluate(el=>el.scrollHeight>el.clientHeight),true,'liste longue défilable');
  await input(p,'brand').fill('Fictive 0999');await mustBeVisibleAndTouchable(option(p,'brand','Fictive 0999'));
  await close(p);assert.deepEqual(await records(p),many,'aucune suggestion supprimée ou écrite par la recherche');
  assert.deepEqual(errors,[]);await ctx.close();

  // Un contexte tactile séparé teste une vraie action tap, pas uniquement click.
  const mobile=await browser.newContext({viewport:{width:320,height:800},hasTouch:true,isMobile:true,locale:'fr-FR'});
  const t=await mobile.newPage(),touchErrors=[];t.on('pageerror',e=>touchErrors.push(e.message));t.on('dialog',d=>d.accept());
  await t.goto(url,{waitUntil:'networkidle'});await t.locator('[data-action=start-real]').click();
  await input(t,'brand').fill('renult');await mustBeVisibleAndTouchable(option(t,'brand','Renault'));
  await option(t,'brand','Renault').tap();assert.equal(await input(t,'brand').inputValue(),'Renault');
  await input(t,'model').fill('cio');await mustBeVisibleAndTouchable(option(t,'model','Clio'));
  await option(t,'model','Clio').tap();assert.equal(await input(t,'model').inputValue(),'Clio');
  assert.deepEqual(touchErrors,[]);await mobile.close();
  console.log(`✓ ${engine.name()} : suggestions approchantes visibles, choisies au clic, clavier et tap ; saisie libre et modèles liés.`);
  console.log('✓ Priorités mémorisées, aucune écriture lors d’une recherche, 4 thèmes × 320/390 px, hors ligne et données fictives intactes.');
 } finally {if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
