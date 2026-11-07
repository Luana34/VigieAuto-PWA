// Repère visuel facultatif du carnet : ce n'est pas la couleur de carrosserie.
// Seule une valeur reconnue est modifiable ; les extensions futures restent intactes.
export const VEHICLE_MARKER_KEY = "vigieVehicleMarker";
export const VEHICLE_MARKER_COLORS = Object.freeze({
  vert: "Vert",
  turquoise: "Turquoise",
  bleu: "Bleu",
  orange: "Orange",
  violet: "Violet",
  rose: "Rose",
});

export function inspectVehicleMarker(vehicle) {
  if (!vehicle || typeof vehicle !== "object" || !Object.hasOwn(vehicle, VEHICLE_MARKER_KEY))
    return { state: "absent", color: "" };
  const value = vehicle[VEHICLE_MARKER_KEY];
  if (!value || Object.prototype.toString.call(value) !== "[object Object]" || value.version !== 1)
    return { state: "unsupported", color: "" };
  if (!Object.hasOwn(value, "color") || value.color === null)
    return { state: "valid", color: "", value };
  if (typeof value.color !== "string" || !Object.hasOwn(VEHICLE_MARKER_COLORS, value.color))
    return { state: "unsupported", color: "" };
  return { state: "valid", color: value.color, value };
}

/** Retourne une copie seulement si le choix change. Ne détruit aucune extension. */
export function withVehicleMarker(vehicle, color) {
  if (!vehicle || typeof vehicle !== "object" || Array.isArray(vehicle))
    throw new Error("Véhicule invalide : repère non enregistré.");
  if (typeof color !== "string" || (color && !Object.hasOwn(VEHICLE_MARKER_COLORS, color)))
    throw new Error("Ce repère de couleur n’est pas proposé. Aucune donnée modifiée.");
  const existing = inspectVehicleMarker(vehicle);
  if (existing.state === "unsupported")
    throw new Error("Ce repère provient d’un format non reconnu : il est conservé sans modification.");
  if (existing.color === color) return vehicle;
  return { ...vehicle, [VEHICLE_MARKER_KEY]: { ...(existing.value || {}), version: 1, color: color || null } };
}
