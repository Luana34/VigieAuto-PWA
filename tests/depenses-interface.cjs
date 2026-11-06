/* Données fictives ; vraie PWA, IndexedDB et édition en navigateur Linux. */
const assert=require('node:assert/strict'), fs=require('node:fs'), http=require('node:http'), path=require('node:path');
const { chromium, webkit }=require('playwright');
const root=path.resolve(__dirname,'..'), useWebkit=process.env.VIGIE_BROWSER==='webkit';
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.webmanifest':'application/manifest+json'};
const labels={depenses:'Dépenses',parametres:'Paramètres',accueil:'Tableau de bord',statistiques:'Statistiques'};
const go=async(p,r)=>{await p.evaluate(v=>{location.hash=v;},r);await p.waitForFunction(v=>document.title===`${v} — VigieAuto`,labels[r]);};
const field=(p,name,value)=>p.locator(`#modal [name="${name}"]`).fill(String(value));
const submit=async p=>{await p.locator('#modal button[type=submit]').click();await p.locator('#modal').waitFor({state:'hidden'});};
async function download(p){await go(p,'parametres');const event=p.waitForEvent('download');await p.locator('[data-action=export]').click();return fs.readFileSync(await (await event).path(),'utf8');}
(async()=>{
 const server=http.createServer((req,res)=>{let f=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
  if(f!==root&&!f.startsWith(root+path.sep))return res.writeHead(403).end();
  if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=path.join(f,'index.html');
  if(!fs.existsSync(f)||!fs.statSync(f).isFile())return res.writeHead(404).end();
  res.writeHead(200,{'content-type':mime[path.extname(f)]||'application/octet-stream','cache-control':'no-store'});fs.createReadStream(f).pipe(res);
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{
  browser=await (useWebkit?webkit:chromium).launch(useWebkit?{headless:true}:{headless:true,args:['--no-sandbox']});
  const ctx=await browser.newContext({viewport:{width:390,height:844},locale:'fr-FR',timezoneId:'Europe/Paris',acceptDownloads:true});
  const p=await ctx.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('dialog',d=>d.accept());
  await p.goto(`http://127.0.0.1:${server.address().port}/`,{waitUntil:'networkidle'});
  await p.locator('[data-action=start-real]').click();await field(p,'brand','Renault');await field(p,'model','Clio');await field(p,'odometer','1000');await submit(p);
  const initial=JSON.parse(await download(p)), v=initial.data.vehicles[0].id;
  const common={vehicleId:v,date:'2026-10-01',notes:''};
  initial.data.expenses=[
   {...common,id:'e1',date:'2026-11-05',title:'Énergie séparée',category:'carburant',amount:12.34,odometer:1111,future:{nombre:'EXACT_MARKER'}},
   {...common,id:'e2',title:'Catégorie future',category:'__proto__',amount:3.25,odometer:{format:'futur',valueOf:null,toString:null}},
   {...common,id:'e3',date:'2026-11-02',title:'Catégorie absente',amount:5,createdAt:null},
   {...common,id:'e4',date:'2026-09-01',title:'Catégorie longue',category:'X'.repeat(9000),amount:30,odometer:null},
   {...common,id:'e5',date:'2026-10-10',title:'Catégorie nulle',category:null,amount:7,vigieExpenseReceipt:{version:1,dataUrl:'data:image/png;base64,AAAA'}},
   {...common,id:'e6',date:'2026-10-15',title:'Compteur très précis',category:'autre',amount:2,odometer:'MILEAGE_MARKER'},
   {...common,id:'e7',date:'2026-11-01',title:'Compteur négatif historique',category:'autre',amount:1,odometer:-1},
  ];
  const raw=JSON.stringify(initial).replace('"EXACT_MARKER"','12345678901234567890.125').replace('"MILEAGE_MARKER"','12345678901234567890.125');
  await p.locator('#import-file').setInputFiles({name:'depenses-fictives.json',mimeType:'application/json',buffer:Buffer.from(raw)});
  await p.waitForFunction(()=>document.querySelector('#toast')?.textContent.includes('importée'),null,{timeout:15000});
  await go(p,'accueil'); assert.equal(errors.length,0,'un kilométrage futur ne doit pas casser le tableau de bord');
  await go(p,'depenses');assert.match(await p.locator('body').innerText(),/doublons saisis manuellement ne sont pas détectés/);
  assert.match(await p.locator('body').innerText(),/Personnalisée : __proto__/);
  const beforeSort=JSON.parse(await download(p));await go(p,'depenses');
  const ids=()=>p.locator('.list-card .list-row [data-action=edit-expense]').evaluateAll(els=>els.map(e=>e.dataset.id));
  const metric=label=>p.locator('.metric-card').filter({hasText:label}).locator('.metric-value').innerText();
  const beforeTotal=await metric('Total enregistré');assert.match(await metric('Dernière dépense'),/05\/11\/2026/);
  assert.equal(await p.getByLabel('Trier les dépenses').inputValue(),'date');
  assert.deepEqual(await ids(),['e1','e3','e7','e6','e5','e2','e4']);
  await p.getByLabel('Trier les dépenses').selectOption('category');
  assert.equal(await p.evaluate(()=>document.activeElement?.id),'expense-order');
  assert.deepEqual(await ids(),['e7','e6','e1','e4','e3','e5','e2']);
  assert.equal(await metric('Total enregistré'),beforeTotal);assert.match(await metric('Dernière dépense'),/05\/11\/2026/);
  await p.getByLabel('Trier les dépenses').selectOption('amount');
  assert.deepEqual(await ids(),['e4','e1','e5','e3','e2','e6','e7']);
  assert.equal(await metric('Total enregistré'),beforeTotal);assert.match(await metric('Dernière dépense'),/05\/11\/2026/);
  // Simulation du pointeur tactile : ne pas refocaliser et risquer de rouvrir le sélecteur natif.
  await p.evaluate(()=>{window.__oldMedia=window.matchMedia;window.matchMedia=q=>q==='(pointer: coarse)'?{matches:true}:window.__oldMedia.call(window,q);});
  await p.getByLabel('Trier les dépenses').selectOption('category');assert.notEqual(await p.evaluate(()=>document.activeElement?.id),'expense-order');
  await p.evaluate(()=>{window.matchMedia=window.__oldMedia;delete window.__oldMedia;});await p.getByLabel('Trier les dépenses').selectOption('amount');
  const afterSort=JSON.parse(await download(p));assert.deepEqual(afterSort.data,beforeSort.data);
  await go(p,'depenses');assert.equal(await p.getByLabel('Trier les dépenses').inputValue(),'amount');
  await p.setViewportSize({width:320,height:720});assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await p.setViewportSize({width:390,height:844});
  await p.locator('[data-action=edit-expense][data-id=e1]').click();
  assert.equal(await p.locator('#modal [name=category]').inputValue(),'carburant');
  assert.equal(await p.locator('#modal [name=odometer]').inputValue(),'1111');
  await p.locator('#modal [name=category]').selectOption('controle');await field(p,'amount','15.75');await field(p,'odometer','1234.5');await submit(p);
  assert.match(await p.locator('[data-action=edit-expense][data-id=e1]').locator('xpath=ancestor::div[contains(@class,"list-row")]').innerText(),/1234,5 km/);
  await p.locator('[data-action=edit-expense][data-id=e2]').click();
  assert.equal(await p.locator('#modal [name=odometer]').count(),0);assert.match(await p.locator('#modal').innerText(),/conservé sans modification/);
  assert.equal(await p.locator('#modal [name=category]').inputValue(),'__proto__');await field(p,'notes','Conservée');await submit(p);
  await p.locator('[data-action=edit-expense][data-id=e3]').click();
  assert.equal(await p.locator('#modal [name=category]').inputValue(),'');await field(p,'notes','Sans catégorie');await submit(p);
  await p.locator('[data-action=edit-expense][data-id=e4]').click();
  assert.equal(await p.locator('#modal [name=category]').count(),0);assert.match(await p.locator('#modal').innerText(),/Catégorie trop longue/);
  await field(p,'notes','Longue préservée');await submit(p);
  await p.locator('[data-action=edit-expense][data-id=e5]').click();await field(p,'notes','Nulle préservée');await field(p,'odometer','0');await submit(p);
  for(const id of ['e6','e7']){await p.locator(`[data-action=edit-expense][data-id=${id}]`).click();assert.equal(await p.locator('#modal [name=odometer]').count(),0);await field(p,'notes','Historique intact');await submit(p);}
  // Retirer puis rétablir un kilométrage, sans toucher au compteur du véhicule.
  await p.locator('[data-action=edit-expense][data-id=e1]').click();await field(p,'odometer','');await submit(p);
  let snapshot=JSON.parse(await download(p));assert.equal(Object.hasOwn(snapshot.data.expenses.find(x=>x.id==='e1'),'odometer'),false);assert.equal(snapshot.data.vehicles[0].odometer,1000);
  await go(p,'depenses');await p.locator('[data-action=edit-expense][data-id=e1]').click();await field(p,'odometer','1234.5');await submit(p);
  await p.locator('[data-action=add-expense]').first().click();await field(p,'title','Nouvelle dépense');await field(p,'amount','3');await field(p,'odometer','2222');await submit(p);
  await go(p,'statistiques');assert.match(await p.locator('body').innerText(),/sans détecter les doublons entre dépenses, pleins et entretiens/);
  const outRaw=await download(p), out=JSON.parse(outRaw), rows=Object.fromEntries(out.data.expenses.map(x=>[x.id,x]));
  assert.equal(rows.e1.category,'controle');assert.equal(rows.e1.amount,15.75);assert.equal(rows.e1.odometer,1234.5);
  assert.equal(rows.e2.category,'__proto__');assert.equal(rows.e2.notes,'Conservée');assert.deepEqual(rows.e2.odometer,{format:'futur',valueOf:null,toString:null});
  assert.equal(Object.hasOwn(rows.e2,'createdAt'),false);assert.equal(Object.hasOwn(rows.e3,'category'),false);assert.equal(rows.e3.createdAt,null);
  assert.equal(rows.e4.category.length,9000);assert.equal(rows.e4.odometer,null);assert.equal(rows.e5.category,null);assert.equal(rows.e5.odometer,0);
  assert.equal(rows.e5.vigieExpenseReceipt.dataUrl,'data:image/png;base64,AAAA');assert.equal(rows.e7.odometer,-1);
  assert.equal(out.data.expenses.find(x=>x.title==='Nouvelle dépense').odometer,2222);assert.equal(out.data.vehicles[0].odometer,1000);assert.equal(out.data.fills.length,0);
  assert.match(outRaw,/"odometer"\s*:\s*12345678901234567890\.125/);assert.match(outRaw,/"nombre"\s*:\s*12345678901234567890\.125/);assert.deepEqual(errors,[]);
  // Cas non associatif en flottants : le total garde l'ordre historique par date,
  // même si l'ordre d'import et le tri choisi sont différents.
  const probe=structuredClone(initial);probe.data.expenses=[
    {...common,id:'s1',date:'2026-10-01',title:'Petit 1',category:'autre',amount:0.01},
    {...common,id:'s2',date:'2026-10-02',title:'Petit 2',category:'carburant',amount:0.01},
    {...common,id:'s3',date:'2026-11-05',title:'Grand',category:'assurance',amount:100000000000000},
  ];
  await p.locator('#import-file').setInputFiles({name:'tri-flottant.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(probe))});
  await p.waitForFunction(()=>document.querySelector('#toast')?.textContent.includes('importée'));await go(p,'depenses');
  const expected='100000000000000,03';const tot=async()=>(await metric('Total enregistré')).replace(/\s/g,'');
  assert.match(await tot(),new RegExp(expected));
  for(const order of ['date','category','amount']){await p.getByLabel('Trier les dépenses').selectOption(order);assert.match(await tot(),new RegExp(expected));}
  assert.deepEqual(errors,[]);
  console.log(`✓ PWA dépenses : tris, kilométrage facultatif, compteur véhicule intact, extensions et non-dédoublonnage (${useWebkit?'WebKit':'Chromium'} Linux).`);
  await ctx.close();
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
