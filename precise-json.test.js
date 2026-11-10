import test from "node:test";
import assert from "node:assert/strict";
import { parseBackupJson, stringifyBackupJson, survivesNumber, survivesUserNumber, addNumbersForUse } from "../js/precise-json.js";

const wrap = (body) => `{"app":"VigieAuto","formatVersion":3,"data":${body}}`;
const parse = (body) => parseBackupJson(wrap(body));

test("nombres décimaux usuels et écritures équivalentes restent des Number utilisables", () => {
  for (const n of ["0", "0.00", "2.37", "1e3", "1.25e-2", "9007199254740991", "0e9999999999999999999999"]) {
    assert.equal(survivesNumber(n, { forUse: true }), true, n);
  }
  const obj = parse('{"vehicles":[{"id":"v","odometer":25000,"year":2008.0,"future":2.370}]}');
  assert.equal(typeof obj.data.vehicles[0].odometer, "number");
  assert.equal(typeof obj.data.vehicles[0].future, "number");
  assert.equal(JSON.parse(stringifyBackupJson(obj)).data.vehicles[0].future, 2.37);
});

test("détecte arrondi, dépassement, sous-flux et zéro négatif dans les valeurs utilisées", () => {
  for (const n of ["9007199254740993", "9007199254740992", "1.0000000000000001", "1e309", "1e-324", "-0", "-0.000e50", "01", "NaN", "Infinity", "1".repeat(1001)]) {
    assert.equal(survivesNumber(n, { forUse: true }), false, n);
  }
  assert.equal(survivesNumber("9007199254740992"), true, "ce nombre exact est néanmoins trop grand pour un champ utilisé");
  for (const n of ["00123", ".5", "0.50", "1e+2", "+1", "000.001"]) assert.equal(survivesUserNumber(n), true, n);
  for (const n of ["0009007199254740993", ".10000000000000001", "-0", "NaN", "1".repeat(1001)]) assert.equal(survivesUserNumber(n), false, n);
});

test("la prochaine échéance est additionnée en décimal sans arrondi silencieux", () => {
  assert.equal(addNumbersForUse(0.1, 0.2), 0.3);
  assert.equal(addNumbersForUse(244327, 15000), 259327);
  assert.equal(addNumbersForUse(0, 5e-324), 5e-324);
  assert.throws(() => addNumbersForUse(9007199254740991, 1), /sans arrondi/);
  assert.throws(() => addNumbersForUse(1, 1e-20), /sans arrondi/);
  assert.throws(() => addNumbersForUse(Infinity, 1), /sans arrondi/);
});

test("extensions imbriquées : entiers, fractions, exposants et zéro négatif sont des nombres exacts à l’export", () => {
  const source = wrap('{"vehicles":[{"id":"v","odometer":5,"futur":{"a":[9007199254740993,-0,-0.000e50,1e-324,1e309,-12345678901234567890.1234567890123456789,{"b":0.10000000000000001}]},"prix":2.37}]}');
  const obj = parseBackupJson(source);
  const nested = obj.data.vehicles[0].futur.a;
  assert.ok(nested[0] instanceof Uint8Array);
  assert.ok(nested[6].b instanceof Uint8Array);
  assert.equal(obj.data.vehicles[0].prix, 2.37);
  const output = stringifyBackupJson(obj);
  for (const token of ["9007199254740993", "-0", "-0.000e50", "1e-324", "1e309", "-12345678901234567890.1234567890123456789", "0.10000000000000001"]) {
    assert.ok(output.includes(token), token);
    assert.ok(!output.includes(`"${token}"`), "un nombre ne devient pas une chaîne");
  }
  assert.equal(typeof JSON.parse(output).data.vehicles[0].futur.a[0], "number");
  assert.match(output, /"prix": 2\.37/);
});

test("les champs numériques fonctionnels de chaque collection refusent une perte avant remplacement", () => {
  const fields = {
    vehicles: ["year", "initialKm", "odometer"], services: ["odometer", "parts", "labor"],
    fills: ["odometer", "volume", "unitPrice", "total"], trips: ["distanceKm", "durationMin", "gpsDistanceM"],
    expenses: ["amount"], reminders: ["dueKm", "warnDays", "warnKm", "repeatDays", "repeatKm"],
    symptoms: ["odometer"], checks: ["odometer"], documents: ["size"],
  };
  for (const [collection, names] of Object.entries(fields)) for (const name of names) {
    const input = wrap(`{"${collection}":[{"id":"test","${name}":9007199254740993}]}`);
    assert.throws(() => parseBackupJson(input), new RegExp(`${collection}\\.${name}.*sans arrondi`), `${collection}.${name}`);
  }
  assert.throws(() => parse('{"settings":[{"id":"vehicleSuggestions","version":1.0000000000000001}]}'), /settings\.version/);
  assert.throws(() => parseBackupJson('{"app":"VigieAuto","formatVersion":3.0000000000000001,"data":{}}'), /version de sauvegarde/);
});

test("les clés répétées, même échappées et profondément imbriquées, sont refusées", () => {
  for (const input of [
    '{"a":1,"a":2}', '{"a":1,"\\u0061":2}',
    '{"outer":[{"nested":{"x":1,"x":2}}]}',
    '{"data":{},"data":{}}',
  ]) assert.throws(() => parseBackupJson(input), /propriété JSON est répétée/);
});

test("chaînes échappées et propriété __proto__ restent ordinaires et ne polluent aucun prototype", () => {
  const source = '{"data":{"vehicles":[{"id":"v","odometer":4,"text":"\\\"[{\\\\\\\"x\\\":1}]","__proto__":{"danger":9007199254740993},"constructor":{"prototype":{"polluted":true}}}]}}';
  const parsed = parseBackupJson(source);
  assert.equal(Object.hasOwn(parsed.data.vehicles[0], "__proto__"), true);
  assert.equal({}.polluted, undefined);
  const output = stringifyBackupJson(parsed);
  assert.match(output, /"danger": 9007199254740993/);
  assert.equal(JSON.parse(output).data.vehicles[0].text, JSON.parse(source).data.vehicles[0].text);
  assert.equal({}.polluted, undefined);
});

test("la représentation interne ne peut pas être imitée par un objet ou tableau JSON", () => {
  const source = '{"data":{"vehicles":[{"id":"v","odometer":1,"bytes":[86,65,45,78,49,58,49],"like":{"0":86,"length":1},"num":9007199254740993}]}}';
  const out = stringifyBackupJson(parseBackupJson(source));
  const actual = JSON.parse(out).data.vehicles[0];
  assert.deepEqual(actual.bytes, [86,65,45,78,49,58,49]);
  assert.deepEqual(actual.like, {"0":86,"length":1});
  assert.match(out, /"num": 9007199254740993/);
});

test("limites explicites de taille, profondeur, types internes et références circulaires", () => {
  assert.throws(() => parseBackupJson(`{"n":${"1".repeat(1001)}}`), /1000 caractères/);
  assert.doesNotThrow(() => parseBackupJson(`{"n":${"1".repeat(1000)}}`));
  const deep = "[".repeat(257) + "0" + "]".repeat(257);
  assert.throws(() => parseBackupJson(deep), /profondément imbriquée/);
  assert.throws(() => stringifyBackupJson({ n: new Uint8Array([1, 2, 3]) }), /illisible/);
  assert.throws(() => stringifyBackupJson({ n: Number.POSITIVE_INFINITY }), /pas fini/);
  assert.throws(() => stringifyBackupJson({ n: new Date() }), /inconnue/);
  const circular = {}; circular.self = circular;
  assert.throws(() => stringifyBackupJson(circular), /circulaire/);
  assert.throws(() => parseBackupJson('{"a":1,}'), SyntaxError);
});

test("les nombres exacts survivent au clonage structuré utilisé par IndexedDB", () => {
  const value = parse('{"templates":[{"id":"t","items":[{"id":"a","title":"Point","future":9007199254740993}]}]}');
  const cloned = structuredClone(value);
  assert.ok(cloned.data.templates[0].items[0].future instanceof Uint8Array);
  assert.match(stringifyBackupJson(cloned), /"future": 9007199254740993/);
});
