import test from "node:test";
import assert from "node:assert/strict";
import { File } from "node:buffer";
import { EXPENSE_RECEIPT_KEY as KEY, inspectExpenseReceipt as inspect, withExpenseReceipt as update,
  receiptPreviewUrl, validateReceiptFile, RECEIPT_FILE_LIMIT, requireReceiptRecordSize } from "../js/expense-receipt.js";
import { parseBackupJson, stringifyBackupJson } from "../js/precise-json.js";

const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/aR0AAAAASUVORK5CYII=", "base64");
const url = `data:image/png;base64,${png.toString("base64")}`;
test("extension absente, nulle, future ou de type inconnu : pas de remplacement accidentel", () => {
  assert.equal(inspect({}).state, "empty");
  for (const raw of [null, "ancien", [], { version: 2, dataUrl: url }, { version: "1", dataUrl: url }, { version: 1, dataUrl: { data: 42 } }, { dataUrl: url }]) {
    const row = { [KEY]: raw }; assert.equal(inspect(row).state, "unsupported");
    assert.throws(() => update(row, url), /autre version/); assert.deepEqual(row[KEY], raw);
  }
  assert.equal(inspect({ [KEY]: {version: 1} }).state, "empty");
  assert.equal(inspect({ [KEY]: {version: 1, dataUrl: null} }).state, "empty");
  assert.equal(inspect({ [KEY]: {version: 1, dataUrl: url} }).state, "present");
});
test("ajout, remplacement et retrait ne modifient aucune autre donnée, même imbriquée", () => {
  const original = {id:"e", amount:12, future:{deep:"conserver"}, [KEY]:{version:1, dataUrl:url, custom:{note:"conserver"}}};
  const changed = update(original, "data:image/jpeg;base64,/9j/2Q==");
  assert.equal(original[KEY].dataUrl, url);assert.deepEqual(changed[KEY].custom,original[KEY].custom);
  const removed = update(changed, null);assert.equal(Object.hasOwn(removed[KEY],"dataUrl"),false);
  assert.deepEqual(removed[KEY].custom,original[KEY].custom);assert.deepEqual(removed.future,original.future);
  assert.deepEqual(update({id:"new"},url)[KEY], {version:1,dataUrl:url});
});
test("nombre précis futur préservé dans l'enveloppe et dans la dépense", () => {
  const backup = parseBackupJson(`{"app":"VigieAuto","formatVersion":3,"data":{"expenses":[{"id":"e","vigieExpenseReceipt":{"version":1,"extra":12345678901234567890.125},"unknown":12345678901234567890.125}]}}`);
  const row = backup.data.expenses[0];backup.data.expenses[0] = update(row,url);
  const out=stringifyBackupJson(backup);assert.equal((out.match(/12345678901234567890\.125/g)||[]).length,2);
});
test("aperçu n’accepte aucune adresse réseau, HTML ou donnée exagérément longue", () => {
  assert.equal(receiptPreviewUrl(url),url);
  for(const bad of ["https://example.invalid/image.jpg","data:image/svg+xml;base64,PHN2Zz4=","data:text/html;base64,PGgxPg==","data:image/png;base64,abc\" onload=alert(1)",`data:image/png;base64,${"A".repeat(8*1024*1024)}`]) assert.equal(receiptPreviewUrl(bad),null);
});
test("type, signature et taille sont vérifiés avant toute écriture", async () => {
  await validateReceiptFile(new File([png],"ticket.png",{type:"image/png"}));
  await assert.rejects(validateReceiptFile(new File([png],"ticket.jpg",{type:"image/jpeg"})), /image/);
  await assert.rejects(validateReceiptFile(new File([Buffer.from("texte")],"ticket.png",{type:"image/png"})), /image/);
  await assert.rejects(validateReceiptFile(new File([png],"ticket.pdf",{type:"application/pdf"})), /image/);
  await assert.rejects(validateReceiptFile(new File([new Uint8Array(RECEIPT_FILE_LIMIT+1)],"gros.png",{type:"image/png"})), /5 Mio/);
  await assert.rejects(validateReceiptFile(new File([],"vide.png",{type:"image/png"})), /non vide/);
});

test("la limite du pont bloque un ajout trop lourd en caractères ou en UTF-8", () => {
  requireReceiptRecordSize({id:"petit", [KEY]:{version:1,dataUrl:url}});
  assert.throws(() => requireReceiptRecordSize({id:"gros",future:"x".repeat(16*1024*1024)}), /trop volumineuses/);
  assert.throws(() => requireReceiptRecordSize({id:"utf8",future:"€".repeat(11_184_900)}), /trop volumineuses/);
});
