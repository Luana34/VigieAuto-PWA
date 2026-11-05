/* Données fictives : PWA réelle, IndexedDB et deux onglets en navigateur Linux. */
const assert=require('node:assert/strict'), fs=require('node:fs'), http=require('node:http'), path=require('node:path');
const {chromium,webkit}=require('playwright');
const root=path.resolve(__dirname,'..'), useWebkit=process.env.VIGIE_BROWSER==='webkit';
const png=fs.readFileSync(path.join(__dirname,'fixtures/justificatif.png'));
const jpeg=fs.readFileSync(path.join(__dirname,'fixtures/justificatif-gps-fictif.jpg'));
const pngUrl='data:image/png;base64,'+png.toString('base64'), jpegUrl='data:image/jpeg;base64,'+jpeg.toString('base64');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.webmanifest':'application/manifest+json'};
const labels={depenses:'Dépenses',parametres:'Paramètres',accueil:'Tableau de bord'};
const go=async(p,r)=>{await p.evaluate(v=>{location.hash=v;},r);await p.waitForFunction(v=>document.title===`${v} — VigieAuto`,labels[r]);};
const field=(p,n,v)=>p.locator(`#modal [name="${n}"]`).fill(String(v));
const submit=async p=>{await p.locator('#modal button[type=submit]').click();await p.locator('#modal').waitFor({state:'hidden',timeout:15000});};
const expectError=async(p,rx)=>{await p.locator('#modal button[type=submit]').click();await p.locator('#modal .form-error.visible').waitFor();assert.match(await p.locator('#modal .form-error').innerText(),rx);};
const close=async p=>{await p.locator('#modal [data-action=close-modal]').first().click();await p.locator('#modal').waitFor({state:'hidden'});};
const open=async(p,id='e1')=>p.locator(`[data-action=expense-receipt][data-id="${id}"]`).click();
const choose=async(p,buf,name,type)=>p.locator('#modal [name=receiptPhoto]').setInputFiles({name,mimeType:type,buffer:buf});
async function download(p){await go(p,'parametres');const event=p.waitForEvent('download');await p.locator('[data-action=export]').click();return fs.readFileSync(await (await event).path(),'utf8');}
async function getExpense(p,id='e1') {return p.evaluate(id=>new Promise((resolve,reject)=>{const r=indexedDB.open('cq-auto-local');r.onerror=()=>reject(r.error);r.onsuccess=()=>{const db=r.result,tx=db.transaction('expenses','readonly'),q=tx.objectStore('expenses').get(id);q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error);tx.oncomplete=()=>db.close();};}),id);}
(async()=>{
 const server=http.createServer((req,res)=>{if(server.simulateDisconnect){req.socket.destroy();return;}let f=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
  if(f!==root&&!f.startsWith(root+path.sep))return res.writeHead(403).end();if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=path.join(f,'index.html');
  if(!fs.existsSync(f)||!fs.statSync(f).isFile())return res.writeHead(404).end();res.writeHead(200,{'content-type':mime[path.extname(f)]||'application/octet-stream','cache-control':'no-store'});fs.createReadStream(f).pipe(res);
 });await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{
  browser=await (useWebkit?webkit:chromium).launch(useWebkit?{headless:true}:{headless:true,args:['--no-sandbox']});
  const ctx=await browser.newContext({viewport:{width:390,height:844},locale:'fr-FR',timezoneId:'Europe/Paris',acceptDownloads:true});
  const p=await ctx.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('dialog',d=>d.accept());
  const address=`http://127.0.0.1:${server.address().port}/`;
  await p.goto(address,{waitUntil:'networkidle'});await p.locator('[data-action=start-real]').click();
  await field(p,'brand','Renault');await field(p,'model','Clio');await field(p,'odometer','1000');await submit(p);
  const backup=JSON.parse(await download(p)),v=backup.data.vehicles[0].id;
  backup.data.expenses=[{id:'e1',vehicleId:v,title:'Péage',date:'2026-11-05',category:'peage',amount:7.5,notes:'',future:{code:'garder'},vigieExpenseReceipt:{version:1,source:'PRECISION'}} ,
   {id:'e2',vehicleId:v,title:'Futur',date:'2026-11-05',category:'autre',amount:2,notes:'',vigieExpenseReceipt:{version:2,payload:{a:['intact']}}},
   {id:'e3',vehicleId:v,title:'Image illisible',date:'2026-11-05',category:'autre',amount:2,notes:'',vigieExpenseReceipt:{version:1,dataUrl:'data:image/png;base64,AAAA'}}];
  const input=JSON.stringify(backup).replace('"PRECISION"','12345678901234567890.125');
  await p.locator('#import-file').setInputFiles({name:'fictif.json',mimeType:'application/json',buffer:Buffer.from(input)});
  await p.waitForFunction(()=>document.querySelector('#toast')?.textContent.includes('importée'),null,{timeout:15000});await go(p,'depenses');
  const before=await getExpense(p);
  // Choisir un fichier puis annuler ne déclenche aucune écriture.
  await open(p);await choose(p,png,'ticket.png','image/png');await close(p);assert.deepEqual(await getExpense(p),before);
  // Une structure future est consultable mais aucun contrôle ne peut la remplacer.
  await open(p,'e2');assert.match(await p.locator('#modal').innerText(),/autre version|structure inconnue/);
  assert.equal(await p.locator('#modal input[type=file]').count(),0);await close(p);
  // Une image importée endommagée reste stockée et affiche un message sûr.
  await open(p,'e3');await p.locator('.receipt-preview-error').waitFor({state:'visible'});assert.equal(await p.locator('.receipt-preview').isVisible(),false);
  await close(p);assert.equal((await getExpense(p,'e3')).vigieExpenseReceipt.dataUrl,'data:image/png;base64,AAAA');
  // Un faux fichier et un fichier trop grand sont refusés sans toucher à l'enveloppe.
  await open(p);await choose(p,Buffer.from('pas une image'),'faux.png','image/png');await expectError(p,/image.*lisible/);
  assert.deepEqual(await getExpense(p),before);
  await choose(p,Buffer.alloc(5*1024*1024+1),'grand.png','image/png');await expectError(p,/5 Mio/);assert.deepEqual(await getExpense(p),before);
  // Une panne de quota simulée annule toute la transaction et garde l'ancien objet.
  await choose(p,png,'ticket.png','image/png');
  await p.evaluate(()=>{window.__oldReceiptPut=IDBObjectStore.prototype.put;IDBObjectStore.prototype.put=function(value,...rest){if(this.name==='expenses')throw new DOMException('quota fictif','QuotaExceededError');return window.__oldReceiptPut.call(this,value,...rest);};});
  await expectError(p,/Espace de stockage insuffisant/);assert.deepEqual(await getExpense(p),before);
  await p.evaluate(()=>{IDBObjectStore.prototype.put=window.__oldReceiptPut;delete window.__oldReceiptPut;});
  // Pendant une lecture lente, une fermeture ou Échap ne donne pas l'illusion d'une annulation.
  await p.evaluate(()=>{window.__oldReceiptRead=FileReader.prototype.readAsDataURL;FileReader.prototype.readAsDataURL=function(file){setTimeout(()=>window.__oldReceiptRead.call(this,file),1800);};});
  await p.locator('#modal button[type=submit]').click();assert.equal(await p.locator('#modal [data-action=close-modal]').first().isDisabled(),true);
  await p.keyboard.press('Escape');assert.equal(await p.locator('#modal').isVisible(),true);await p.locator('#modal').waitFor({state:'hidden',timeout:10000});
  await p.evaluate(()=>{FileReader.prototype.readAsDataURL=window.__oldReceiptRead;delete window.__oldReceiptRead;});
  // Ajout effectif, aperçu sans accès réseau et conservation des extensions exactes.
  let row=await getExpense(p);assert.equal(row.vigieExpenseReceipt.dataUrl,pngUrl);
  await open(p);await p.waitForFunction(()=>document.querySelector('.receipt-preview')?.naturalWidth>0);assert.match(await p.locator('#modal').innerText(),/métadonnées.*position GPS/);
  // Une demande contradictoire ne retire rien, puis le remplacement est explicite.
  await p.locator('#modal [name=removeReceipt]').check();await choose(p,jpeg,'ticket.jpg','image/jpeg');await expectError(p,/pas les deux/);
  assert.equal((await getExpense(p)).vigieExpenseReceipt.dataUrl,pngUrl);
  await p.locator('#modal [name=removeReceipt]').uncheck();await submit(p);row=await getExpense(p);assert.equal(row.vigieExpenseReceipt.dataUrl,jpegUrl);
  assert.ok(Buffer.from(row.vigieExpenseReceipt.dataUrl.split(',')[1],'base64').includes(Buffer.from('FAUSSE METADONNEE LOCALE')));
  // Modifier la dépense conserve le justificatif.
  await p.locator('[data-action=edit-expense][data-id=e1]').click();await field(p,'notes','Édition sans perte');await submit(p);assert.equal((await getExpense(p)).vigieExpenseReceipt.dataUrl,jpegUrl);
  const exported=await download(p);assert.match(exported,/"source"\s*:\s*12345678901234567890\.125/);assert.equal(JSON.parse(exported).data.expenses.find(x=>x.id==='e2').vigieExpenseReceipt.version,2);
  // Enlever explicitement la photo ne supprime pas les métadonnées futures.
  await go(p,'depenses');await open(p);await p.locator('#modal [name=removeReceipt]').check();await submit(p);
  row=await getExpense(p);assert.equal(Object.hasOwn(row.vigieExpenseReceipt,'dataUrl'),false);assert.ok(row.vigieExpenseReceipt.source);
  // Deux onglets : un formulaire photo périmé ne peut pas effacer une édition.
  const q=await ctx.newPage();q.on('pageerror',e=>errors.push(e.message));q.on('dialog',d=>d.accept());await q.goto(address,{waitUntil:'networkidle'});await go(q,'depenses');
  await open(p);await choose(p,png,'ticket.png','image/png');
  await q.locator('[data-action=edit-expense][data-id=e1]').click();await field(q,'notes','Autre onglet');await submit(q);
  await expectError(p,/changé dans un autre onglet/);assert.equal((await getExpense(p)).notes,'Autre onglet');assert.equal(Object.hasOwn((await getExpense(p)).vigieExpenseReceipt,'dataUrl'),false);await close(p);
  // Et un ancien formulaire de dépense ne peut pas écraser une photo ajoutée depuis l'autre onglet.
  await p.reload({waitUntil:'networkidle'});await go(p,'depenses');await p.locator('[data-action=edit-expense][data-id=e1]').click();
  await open(q);await choose(q,png,'ticket.png','image/png');await submit(q);
  await field(p,'notes','Ne doit pas passer');await expectError(p,/changé dans un autre onglet/);
  row=await getExpense(p);assert.equal(row.notes,'Autre onglet');assert.equal(row.vigieExpenseReceipt.dataUrl,pngUrl);await close(p);
  // Même protection à la suppression depuis un onglet dont la liste est périmée.
  await p.locator('[data-action=delete-expense][data-id=e1]').click();await p.waitForFunction(()=>document.querySelector('#toast')?.textContent.includes('changé'));
  assert.equal((await getExpense(p)).vigieExpenseReceipt.dataUrl,pngUrl);
  // Une édition ordinaire d'une extension future la conserve exactement.
  await q.locator('[data-action=edit-expense][data-id=e2]').click();await field(q,'notes','Future conservée');await submit(q);
  assert.deepEqual((await getExpense(q,'e2')).vigieExpenseReceipt,{version:2,payload:{a:['intact']}});
  const final=await download(q);if(process.env.VIGIE_RECEIPT_OUT)fs.writeFileSync(process.env.VIGIE_RECEIPT_OUT,final);
  assert.match(final,/"source"\s*:\s*12345678901234567890\.125/);assert.deepEqual(errors,[]);
  // Le module et l'édition sont réellement utilisables après mise en cache, sans réseau.
  await q.evaluate(()=>navigator.serviceWorker.ready);await q.waitForFunction(()=>!!navigator.serviceWorker.controller);
  if(useWebkit)server.simulateDisconnect=true;else await ctx.setOffline(true);
  await q.reload({waitUntil:'load'});await go(q,'depenses');await open(q);await choose(q,jpeg,'hors-ligne.jpg','image/jpeg');await submit(q);
  assert.equal((await getExpense(q)).vigieExpenseReceipt.dataUrl,jpegUrl);
  console.log(`✓ Justificatifs PWA (${useWebkit?'WebKit':'Chromium'} Linux) : ajout, aperçu, remplacement, retrait, annulation, quota, hors ligne, données futures et conflits entre onglets.`);
  await ctx.close();
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
