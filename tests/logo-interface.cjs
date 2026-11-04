/* Vérification des PNG corrigés dans un navigateur (npm ci et Playwright Chromium nécessaires). */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try {
  const p=await browser.newPage();
  for(const [name,size,transparent] of [['icon-192.png',192,true],['icon-512.png',512,true],['maskable-512.png',512,false],['apple-touch-icon.png',180,false]]) {
   const data=fs.readFileSync(path.join(root,'icons',name)).toString('base64');
   const result=await p.evaluate(async data=>{
    const img=new Image();img.src='data:image/png;base64,'+data;await img.decode();
    const canvas=document.createElement('canvas');canvas.width=img.width;canvas.height=img.height;
    const ctx=canvas.getContext('2d');ctx.drawImage(img,0,0);return {width:img.width,height:img.height,pixel:[...ctx.getImageData(0,0,1,1).data]};
   },data);
   assert.equal(result.width,size);assert.equal(result.height,size);
   if(transparent) assert.equal(result.pixel[3],0,`${name} doit garder le coin transparent`);
   else {assert.equal(result.pixel[3],255);assert.ok(result.pixel.slice(0,3).some(c=>c<220),`${name} ne doit pas avoir de coin blanc`);}
  }
  const version=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8')).version;
  const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.webmanifest'),'utf8'));
  assert.ok(manifest.icons.every(x=>x.src.includes(`vigie-${version}`)));
  assert.match(fs.readFileSync(path.join(root,'index.html'),'utf8'),new RegExp(`apple-touch-icon\\.png\\?v=vigie-${version.replaceAll('.','\\.')}`));
  console.log('✓ Logo corrigé : coins transparents ; icônes iOS/masquable sans fond blanc ; cache versionné.');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
