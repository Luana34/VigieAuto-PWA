/* PWA réelle : visibilité et comportement du choix de plein/recharge.
 * npm run test:plein-complet ; VIGIE_BROWSER=webkit pour WebKit Linux. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium, webkit } = require('playwright');
const root = path.resolve(__dirname, '..');
const types = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.json':'application/json', '.webmanifest':'application/manifest+json', '.png':'image/png', '.svg':'image/svg+xml', '.jpg':'image/jpeg' };
const labels = { accueil:'Tableau de bord', garage:'Mes véhicules', pleins:'Pleins & conso', parametres:'Paramètres', rappels:'Rappels' };
async function serve() {
  const server = http.createServer((req, res) => {
    let f = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
    if (f !== root && !f.startsWith(root + path.sep)) return res.writeHead(403).end();
    if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
    if (!fs.existsSync(f) || !fs.statSync(f).isFile()) return res.writeHead(404).end();
    res.writeHead(200, {'content-type':types[path.extname(f)] || 'application/octet-stream', 'cache-control':'no-store'});
    fs.createReadStream(f).pipe(res);
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  return {server, base:`http://127.0.0.1:${server.address().port}/`};
}
const nav = async (p, route) => {
  await p.evaluate(r => { location.hash = r; }, route);
  await p.waitForFunction(label => document.title === `${label} — VigieAuto`, labels[route]);
};
const field = (p, name, value) => p.locator(`#modal [name="${name}"]`).fill(String(value));
const submit = async p => { await p.locator('#modal button[type=submit]').click(); await p.locator('#modal').waitFor({state:'hidden'}); };
const close = async p => { await p.locator('#modal .modal-header [data-action=close-modal]').click(); await p.locator('#modal').waitFor({state:'hidden'}); };
const addFill = async p => { await p.locator('.mobile-floating-add').click(); await p.locator('#modal [data-action=add-fill]').click(); };
const fills = p => p.evaluate(() => new Promise((resolve, reject) => {
  const open = indexedDB.open('cq-auto-local', 6);
  open.onerror = () => reject(open.error);
  open.onsuccess = () => {
    const db = open.result, tx = db.transaction('fills', 'readonly'), req = tx.objectStore('fills').getAll();
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => { const result = req.result; db.close(); resolve(result); };
    tx.onabort = () => { db.close(); reject(tx.error); };
  };
}));
function contrast(a, b) {
  const lum = s => {
    const rgb = s.match(/[\d.]+/g).slice(0, 3).map(n => Number(n) / 255).map(x => x <= .04045 ? x / 12.92 : ((x + .055) / 1.055) ** 2.4);
    return .2126 * rgb[0] + .7152 * rgb[1] + .0722 * rgb[2];
  };
  const [lo, hi] = [lum(a), lum(b)].sort((x, y) => x - y);
  return (hi + .05) / (lo + .05);
}
async function checkAppearance(p, labelText, theme) {
  const label = p.locator('#modal form[data-form=fill] label.checkbox-line');
  const box = p.getByLabel(labelText, {exact:true});
  assert.equal(await box.count(), 1, `${theme} : libellé accessible`);
  assert.equal(await box.isChecked(), true, `${theme} : nouveau plein/recharge coché par défaut`);
  const details = await label.evaluate(e => {
    const s = getComputedStyle(e), input = e.querySelector('input'), is = getComputedStyle(input), r = e.getBoundingClientRect(), ir = input.getBoundingClientRect();
    return { size:parseFloat(s.fontSize), weight:Number(s.fontWeight), color:s.color, bg:s.backgroundColor,
      w:r.width, h:r.height, iw:ir.width, ih:ir.height, iwStyle:is.width,
      width:document.documentElement.clientWidth, scrollWidth:document.documentElement.scrollWidth };
  });
  assert.ok(details.size >= 16 && details.weight >= 700, `${theme} : texte suffisamment grand et gras ${JSON.stringify(details)}`);
  assert.ok(details.iw >= 24 && details.ih >= 24, `${theme} : case 24 × 24 min.`);
  assert.ok(details.h >= 56 && details.w >= 44, `${theme} : zone de contact confortable`);
  assert.ok(contrast(details.color, details.bg) >= 4.5, `${theme} : contraste du texte insuffisant`);
  assert.ok(details.scrollWidth <= details.width, `${theme} : défilement horizontal`);
  // Cliquer loin du petit carré active aussi le label ; le clavier reste fonctionnel.
  // Le bouton d’aide occupe désormais le bord droit ; le reste du libellé coche toujours la case.
  await label.click({position:{x:details.w / 2, y:details.h / 2}});
  assert.equal(await box.isChecked(), false, `${theme} : clic sur la zone`);
  await box.focus(); await p.keyboard.press('Space');
  assert.equal(await box.isChecked(), true, `${theme} : utilisation au clavier`);
  const outline = await box.evaluate(e => ({style:getComputedStyle(e).outlineStyle, width:parseFloat(getComputedStyle(e).outlineWidth)}));
  assert.ok(outline.style !== 'none' && outline.width >= 2, `${theme} : focus clavier visible`);
}
(async () => {
  const {server, base} = await serve();
  const engine = process.env.VIGIE_BROWSER === 'webkit' ? webkit : chromium;
  let browser;
  try {
    browser = await engine.launch(engine === webkit ? {headless:true} : {headless:true, args:['--no-sandbox']});
    const context = await browser.newContext({viewport:{width:390, height:844}, locale:'fr-FR', timezoneId:'Europe/Paris', colorScheme:'light'});
    const p = await context.newPage(), errors = [];
    p.on('pageerror', e => errors.push(e.message));
    await p.goto(base, {waitUntil:'networkidle'});
    await p.locator('[data-action=start-real]').click();
    await field(p, 'brand', 'Renault'); await field(p, 'model', 'Clio'); await field(p, 'odometer', 1000); await submit(p);
    for (const [preference, scheme, theme, width] of [
      ['sauge', 'light', 'sauge', 320], ['cyan', 'light', 'cyan', 390],
      ['sauge', 'dark', 'sauge-dark', 390], ['cyan', 'dark', 'cyan-dark', 320],
    ]) {
      await p.setViewportSize({width, height:844});
      await p.emulateMedia({colorScheme:scheme});
      await nav(p, 'parametres'); await p.locator(`input[name=theme][value=${preference}]`).check();
      await p.waitForFunction(t => document.documentElement.dataset.theme === t, theme);
      await nav(p, 'pleins'); await addFill(p);
      await checkAppearance(p, 'Plein complet', theme);
      assert.match(await p.locator('#modal .form-help').allTextContents().then(a => a.join(' ')), /Décochez si le réservoir/);
      await close(p);
    }
    await p.setViewportSize({width:390, height:844});
    await nav(p, 'pleins');
    // Données fictives : un plein complet puis un plein partiel.
    await addFill(p); await field(p, 'date', '2026-01-01'); await field(p, 'odometer', 1000);
    await field(p, 'volume', 40); await field(p, 'total', 70); await submit(p);
    await addFill(p); await field(p, 'date', '2026-01-02'); await field(p, 'odometer', 1500);
    await field(p, 'volume', 20); await field(p, 'total', 36); await field(p, 'notes', 'Exemple fictif');
    await p.getByLabel('Plein complet', {exact:true}).uncheck(); await submit(p);
    const before = (await fills(p)).sort((a,b) => a.date.localeCompare(b.date));
    assert.equal(before.length, 2); assert.equal(before[0].full, true); assert.equal(before[1].full, false);
    let partial = p.locator('.list-row').filter({hasText:'20,00 L'});
    assert.match(await partial.innerText(), /Partiel/);
    assert.match(await p.locator('.metric-card').filter({hasText:'Consommation moyenne'}).locator('.metric-value').innerText(), /—/);
    await partial.locator('[data-action=edit-fill]').click();
    assert.equal(await p.getByLabel('Plein complet', {exact:true}).isChecked(), false, 'le partiel enregistré reste décoché à la modification');
    await p.getByLabel('Plein complet', {exact:true}).check(); await submit(p);
    const afterChecked = (await fills(p)).sort((a,b) => a.date.localeCompare(b.date));
    assert.equal(afterChecked[1].full, true);
    const omit = x => { const y = {...x}; delete y.full; delete y.updatedAt; return y; };
    assert.deepEqual(omit(afterChecked[1]), omit(before[1]), 'cocher ne change aucune autre propriété du plein');
    assert.deepEqual(afterChecked[0], before[0], 'le précédent plein ne change pas');
    assert.match(await p.locator('.metric-card').filter({hasText:'Consommation moyenne'}).locator('.metric-value').innerText(), /4,00/);
    partial = p.locator('.list-row').filter({hasText:'20,00 L'});
    await partial.locator('[data-action=edit-fill]').click();
    assert.equal(await p.getByLabel('Plein complet', {exact:true}).isChecked(), true);
    await p.getByLabel('Plein complet', {exact:true}).uncheck(); await submit(p);
    await p.reload({waitUntil:'networkidle'}); await nav(p, 'pleins');
    const restored = (await fills(p)).sort((a,b) => a.date.localeCompare(b.date));
    assert.equal(restored[1].full, false); assert.deepEqual(omit(restored[1]), omit(before[1]));
    assert.match(await p.locator('.list-row').filter({hasText:'20,00 L'}).innerText(), /Partiel/);
    assert.match(await p.locator('.metric-card').filter({hasText:'Consommation moyenne'}).locator('.metric-value').innerText(), /—/);
    // La règle CSS ne s'étend pas aux cases des autres formulaires.
    await nav(p, 'rappels'); await p.locator('[data-action=add-reminder]').first().click();
    assert.equal(await p.locator('#modal .checkbox-line').evaluate(e => parseFloat(getComputedStyle(e).fontSize)), 11);
    await close(p);
    // Même confort pour la case équivalente d'un véhicule électrique.
    await nav(p, 'garage'); await p.locator('[data-action=add-vehicle]').first().click();
    await field(p, 'brand', 'Exemple'); await field(p, 'model', 'Électrique');
    await p.locator('#modal [name=fuel]').selectOption('electrique'); await field(p, 'odometer', 2000); await submit(p);
    await nav(p, 'pleins'); await addFill(p);
    await checkAppearance(p, 'Batterie rechargée à 100 %', 'recharge électrique');
    assert.match(await p.locator('#modal .form-help').allTextContents().then(a => a.join(' ')), /Décochez si la batterie/);
    await close(p);
    assert.deepEqual(errors, [], 'aucune erreur JavaScript');
    console.log(`✓ ${engine.name()} : 4 thèmes, 320/390 px, contraste, zone cliquable et clavier ; création, modification, sauvegarde et calcul ; recharge électrique et portée CSS`);
    await context.close();
  } finally {
    if (browser) await browser.close();
    await new Promise(r => server.close(r));
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
