// Estimation locale de distance : les coordonnées ne sortent jamais de cet état en mémoire.
// Aucun point, itinéraire, vitesse ou précision GPS n'est enregistré dans la base.
export const GPS_LIMITS = Object.freeze({
  maxAccuracyM: 50,
  maxAgeMs: 30000,
  maxGapMs: 60000,
  maxSpeedMps: 70, // environ 252 km/h : filtre de saut, pas une mesure fiable de vitesse
});

export function haversineMeters(a, b) {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLon = (b.lon - a.lon) * rad;
  const x = Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371000 * Math.asin(Math.min(1, Math.sqrt(Math.max(0, x))));
}

/**
 * Reçoit une position et renvoie un nouvel état éphémère, la distance ajoutée
 * et un motif d'affichage. Les longues coupures et sauts improbables ne sont
 * jamais reliés par une ligne droite ; le mouvement sous le bruit est ignoré.
 */
export function consumeGpsFix(previous, position, now = Date.now()) {
  const coords = position?.coords;
  const lat = coords?.latitude, lon = coords?.longitude;
  const accuracy = coords?.accuracy, ts = position?.timestamp;
  const unchanged = (reason) => ({ state: previous, addedM: 0, reason, interrupted: false });
  if (![lat, lon, accuracy, ts, now].every(Number.isFinite) ||
      lat < -90 || lat > 90 || lon < -180 || lon > 180 || accuracy < 0 ||
      ts > now + 10000) return unchanged("invalid");
  if (now - ts > GPS_LIMITS.maxAgeMs) return unchanged("stale");
  if (accuracy > GPS_LIMITS.maxAccuracyM) return unchanged("inaccurate");
  const fix = { lat, lon, accuracy, ts };
  if (!previous?.anchor)
    return { state: { anchor: fix, lastTs: ts }, addedM: 0, reason: "first", interrupted: false };
  if (ts <= previous.lastTs) return unchanged("stale");
  if (ts - previous.lastTs > GPS_LIMITS.maxGapMs)
    return { state: { anchor: fix, lastTs: ts }, addedM: 0, reason: "gap", interrupted: true };
  const distance = haversineMeters(previous.anchor, fix);
  const seconds = (ts - previous.anchor.ts) / 1000;
  if (seconds <= 0 || distance / seconds > GPS_LIMITS.maxSpeedMps)
    return { state: { anchor: fix, lastTs: ts }, addedM: 0, reason: "jump", interrupted: true };
  const threshold = Math.max(8, Math.min(40, (previous.anchor.accuracy + accuracy) * 0.75));
  if (distance < threshold)
    return { state: { anchor: previous.anchor, lastTs: ts }, addedM: 0, reason: "noise", interrupted: false };
  return { state: { anchor: fix, lastTs: ts }, addedM: distance, reason: "move", interrupted: false };
}

// Seuils purs d'analyse automatique du rythme (strictement en mémoire vive).
// Aucune coordonnée, trace ni série de vitesses n'est conservée ni exportée.
export const TRIP_ANALYSIS_LIMITS = Object.freeze({
  minDistanceM: 1000,
  minActiveMs: 120000,
  minUsableFixes: 3,
  minDistanceCoverageRatio: 0.5,
  idleSpeedKmh: 5.0,
  cruiseSpeedKmh: 70.0,
  jamMinActiveMs: 600000,
  jamStoppedRatio: 0.35,
  jamSlowAvgKmh: 20.0,
  jamBurstStops: 4,
  jamBurstStoppedMs: 120000,
  cruiseMovingAvgKmh: 70.0,
  cruiseAvgKmh: 65.0,
  cruiseMinShare: 0.5,
  cruiseMaxStoppedRatio: 0.1,
});

export function createTripTelemetry(tripId) {
  return {
    tripId: String(tripId || ""),
    anchorTimeMs: null,
    lastUsableTimeMs: null,
    movingMs: 0,
    stoppedMs: 0,
    cruiseMs: 0,
    gapMs: 0,
    analyzedDistanceM: 0,
    usableFixCount: 0,
    stopEpisodes: 0,
    wasMoving: false,
    maxSpeedKmh: 0,
    interruptedInSession: false,
  };
}

export function pauseTripTelemetry(telemetry) {
  if (!telemetry) return;
  telemetry.anchorTimeMs = null;
  telemetry.lastUsableTimeMs = null;
  telemetry.wasMoving = false;
}

export function recordTripTelemetry(telemetry, fixResult, position = null, now = Date.now()) {
  if (!telemetry || !fixResult) return;
  const reason = fixResult.reason;
  if (reason === "invalid" || reason === "stale") return;
  const rawTs = position?.timestamp;
  const fixTimeMs = Number.isFinite(rawTs) ? rawTs : now;
  if (!Number.isFinite(fixTimeMs)) return;

  if (reason === "gap" || reason === "jump" || reason === "inaccurate") {
    if (reason === "gap" && telemetry.lastUsableTimeMs !== null && fixTimeMs > telemetry.lastUsableTimeMs) {
      telemetry.gapMs += fixTimeMs - telemetry.lastUsableTimeMs;
    }
    telemetry.interruptedInSession = true;
    telemetry.wasMoving = false;
    if (reason === "inaccurate") {
      telemetry.anchorTimeMs = null;
      telemetry.lastUsableTimeMs = null;
    } else {
      telemetry.anchorTimeMs = fixTimeMs;
      telemetry.lastUsableTimeMs = fixTimeMs;
    }
    return;
  }

  telemetry.usableFixCount += 1;
  const rawSpeed = position?.coords?.speed;
  const validChipsetKmh =
    Number.isFinite(rawSpeed) && rawSpeed >= 0 && rawSpeed <= GPS_LIMITS.maxSpeedMps
      ? rawSpeed * 3.6
      : null;

  if (telemetry.lastUsableTimeMs === null) {
    telemetry.lastUsableTimeMs = fixTimeMs;
    telemetry.anchorTimeMs = fixTimeMs;
    if (validChipsetKmh !== null && validChipsetKmh > telemetry.maxSpeedKmh) {
      telemetry.maxSpeedKmh = validChipsetKmh;
    }
    telemetry.wasMoving = validChipsetKmh !== null && validChipsetKmh >= TRIP_ANALYSIS_LIMITS.idleSpeedKmh;
    return;
  }
  if (fixTimeMs <= telemetry.lastUsableTimeMs) return;

  const dtMs = fixTimeMs - telemetry.lastUsableTimeMs;
  telemetry.lastUsableTimeMs = fixTimeMs;
  if (dtMs > GPS_LIMITS.maxGapMs) {
    telemetry.gapMs += dtMs;
    telemetry.anchorTimeMs = fixTimeMs;
    telemetry.wasMoving = false;
    telemetry.interruptedInSession = true;
    return;
  }

  let instantKmh = 0;
  if (reason === "move") {
    const addedM = Math.max(0, Number(fixResult.addedM) || 0);
    telemetry.analyzedDistanceM += addedM;
    const anchorSpanSec =
      telemetry.anchorTimeMs !== null && fixTimeMs > telemetry.anchorTimeMs
        ? (fixTimeMs - telemetry.anchorTimeMs) / 1000
        : dtMs / 1000;
    const derivedKmh = anchorSpanSec > 0 ? (addedM / anchorSpanSec) * 3.6 : 0;
    instantKmh = Math.min(
      GPS_LIMITS.maxSpeedMps * 3.6,
      Math.max(0, validChipsetKmh !== null ? validChipsetKmh : derivedKmh),
    );
    telemetry.anchorTimeMs = fixTimeMs;
  } else {
    instantKmh = validChipsetKmh !== null && validChipsetKmh >= TRIP_ANALYSIS_LIMITS.idleSpeedKmh ? validChipsetKmh : 0;
  }

  if (instantKmh > telemetry.maxSpeedKmh) telemetry.maxSpeedKmh = instantKmh;
  if (instantKmh < TRIP_ANALYSIS_LIMITS.idleSpeedKmh) {
    telemetry.stoppedMs += dtMs;
    if (telemetry.wasMoving) telemetry.stopEpisodes += 1;
    telemetry.wasMoving = false;
  } else {
    telemetry.movingMs += dtMs;
    if (instantKmh >= TRIP_ANALYSIS_LIMITS.cruiseSpeedKmh) telemetry.cruiseMs += dtMs;
    telemetry.wasMoving = true;
  }
}

export function analyzeTripTelemetry(telemetry, recordedDistanceM = null) {
  const maxSpeedRounded = telemetry ? Math.round(telemetry.maxSpeedKmh) : 0;
  const fallback = {
    profile: "inconnu",
    suggestedNote: null,
    uiHint: null,
    stoppedMin: 0,
    stoppedPct: 0,
    avgSpeedKmh: 0,
    maxSpeedKmh: maxSpeedRounded,
  };
  if (!telemetry) return fallback;

  const activeMs = telemetry.movingMs + telemetry.stoppedMs;
  const recordedM = Number.isFinite(recordedDistanceM) && recordedDistanceM > 0 ? recordedDistanceM : 0;
  const effectiveM = Math.max(telemetry.analyzedDistanceM, recordedM);

  if (
    effectiveM < TRIP_ANALYSIS_LIMITS.minDistanceM ||
    activeMs < TRIP_ANALYSIS_LIMITS.minActiveMs ||
    telemetry.usableFixCount < TRIP_ANALYSIS_LIMITS.minUsableFixes ||
    telemetry.analyzedDistanceM < effectiveM * TRIP_ANALYSIS_LIMITS.minDistanceCoverageRatio ||
    telemetry.gapMs > activeMs
  ) {
    return fallback;
  }

  const avgSpeedKmh = (telemetry.analyzedDistanceM / 1000) / (activeMs / 3600000);
  const movingAvgKmh = telemetry.movingMs > 0
    ? (telemetry.analyzedDistanceM / 1000) / (telemetry.movingMs / 3600000)
    : 0;
  const stoppedRatio = telemetry.stoppedMs / activeMs;
  const cruiseRatio = telemetry.movingMs > 0 ? telemetry.cruiseMs / telemetry.movingMs : 0;
  const stoppedPct = Math.max(1, Math.min(100, Math.round(stoppedRatio * 100)));
  const stoppedMin = telemetry.stoppedMs >= 30000 ? Math.max(1, Math.round(telemetry.stoppedMs / 60000)) : 0;

  const isJam =
    (stoppedRatio >= TRIP_ANALYSIS_LIMITS.jamStoppedRatio &&
      activeMs > TRIP_ANALYSIS_LIMITS.jamMinActiveMs) ||
    (avgSpeedKmh < TRIP_ANALYSIS_LIMITS.jamSlowAvgKmh &&
      telemetry.stoppedMs >= TRIP_ANALYSIS_LIMITS.jamBurstStoppedMs &&
      (stoppedRatio >= TRIP_ANALYSIS_LIMITS.jamStoppedRatio ||
        telemetry.stopEpisodes >= TRIP_ANALYSIS_LIMITS.jamBurstStops));

  if (isJam) {
    const suggestedNote =
      stoppedMin >= 1
        ? `🚦 Bouchons : ${stoppedMin} min au ralenti (${stoppedPct}% du parcours)`
        : `🚦 Trafic haché : allure lente (~${Math.max(1, Math.round(avgSpeedKmh))} km/h en moyenne)`;
    return {
      profile: "hache",
      suggestedNote,
      uiHint: "Analyse automatique du rythme GPS appliquée (modifiable manuellement).",
      stoppedMin,
      stoppedPct,
      avgSpeedKmh,
      maxSpeedKmh: maxSpeedRounded,
    };
  }

  const isCruise =
    movingAvgKmh > TRIP_ANALYSIS_LIMITS.cruiseMovingAvgKmh &&
    avgSpeedKmh >= TRIP_ANALYSIS_LIMITS.cruiseAvgKmh &&
    cruiseRatio >= TRIP_ANALYSIS_LIMITS.cruiseMinShare &&
    stoppedRatio <= TRIP_ANALYSIS_LIMITS.cruiseMaxStoppedRatio;

  return {
    profile: isCruise ? "croisiere" : "roulant",
    suggestedNote: null,
    uiHint: "Analyse automatique du rythme GPS appliquée (modifiable manuellement).",
    stoppedMin,
    stoppedPct,
    avgSpeedKmh,
    maxSpeedKmh: maxSpeedRounded,
  };
}



