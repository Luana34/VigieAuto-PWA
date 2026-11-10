import test from "node:test";
import assert from "node:assert/strict";
import { VEHICLE_MARKER_KEY, VEHICLE_MARKER_COLORS, inspectVehicleMarker, withVehicleMarker } from "../js/vehicle-marker.js";

const key = VEHICLE_MARKER_KEY;
const car = () => ({ id: "voiture-fictive", brand: "Maison", model: "Étoile", odometer: 123, couleur: "bleu réel", futur: { conserver: true } });

test("sans choix, aucun repère ni valeur inventée", () => {
  const original = car();
  assert.deepEqual(inspectVehicleMarker(original), { state: "absent", color: "" });
  assert.equal(withVehicleMarker(original, ""), original);
  assert.ok(!Object.hasOwn(original, key));
});

test("les six couleurs proposées sont lisibles et distinctes", () => {
  assert.deepEqual(Object.keys(VEHICLE_MARKER_COLORS), ["vert", "turquoise", "bleu", "orange", "violet", "rose"]);
  for (const [color, label] of Object.entries(VEHICLE_MARKER_COLORS)) {
    const original = car(), changed = withVehicleMarker(original, color);
    assert.equal(inspectVehicleMarker(changed).color, color);
    assert.deepEqual(changed[key], { version: 1, color });
    assert.equal(changed.couleur, "bleu réel"); assert.equal(changed.futur, original.futur);
    assert.ok(label.length > 2); assert.ok(!Object.hasOwn(original, key));
  }
});

test("choisir puis retirer ne détruit pas les extensions du repère", () => {
  const precision = new Uint8Array([1, 2, 3]);
  const original = { ...car(), [key]: { version: 1, color: "vert", futur: { precision }, drapeau: null } };
  const changed = withVehicleMarker(original, "violet"), cleared = withVehicleMarker(changed, "");
  assert.equal(changed[key].color, "violet"); assert.equal(cleared[key].color, null);
  assert.equal(cleared[key].futur.precision, precision); assert.equal(cleared[key].drapeau, null);
  assert.equal(original[key].color, "vert"); assert.equal(inspectVehicleMarker(cleared).color, "");
});

test("un repère sans couleur et un null restent inchangés si aucun choix", () => {
  for (const marker of [{ version: 1, future: [1, 2] }, { version: 1, color: null, future: true }]) {
    const original = { ...car(), [key]: marker };
    assert.equal(inspectVehicleMarker(original).state, "valid");
    assert.equal(withVehicleMarker(original, ""), original);
    assert.equal(original[key], marker);
  }
});

test("une valeur, une version ou une couleur inconnue n’est jamais remplacée", () => {
  for (const marker of [null, false, "bleu", [], new Uint8Array([1]), {}, { version: 2, color: "bleu" },
    { version: 1, color: "" }, { version: 1, color: "inconnu" }, { version: 1, color: 0 },
    { version: "1", color: "vert" }, { version: 1, color: { nom: "bleu" } }]) {
    const original = { ...car(), [key]: marker };
    assert.equal(inspectVehicleMarker(original).state, "unsupported");
    assert.throws(() => withVehicleMarker(original, "bleu"), /conservé sans modification/);
    assert.equal(original[key], marker);
  }
});

test("les codes arbitraires ou noms hérités du prototype sont refusés", () => {
  for (const value of ["constructor", "__proto__", "rose; color:red", "Bleu", 1, null, {}, []])
    assert.throws(() => withVehicleMarker(car(), value), /repère de couleur/);
});

test("un véhicule invalide est refusé et aucune mutation n’est effectuée", () => {
  for (const value of [null, undefined, "", 1, []]) assert.throws(() => withVehicleMarker(value, "vert"), /Véhicule invalide/);
});
