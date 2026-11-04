/* Enrichissement du carnet. Les noms historiques, parts et labor restent la
 * source lue par les anciennes versions ; ces champs optionnels sont des
 * extensions d'enregistrements, jamais de nouvelles collections JSON. */
import { normalise } from './catalogue.js';
import { survivesUserNumber } from './precise-json.js';

export const DETAIL_KEY = 'vigieServiceDetails';
export const CATEGORIES_KEY = 'vigieServiceCategories';
export const SUBTYPE_KEY = 'vigieFuelSubtype';
export const CUSTOM_CATEGORY_PREFIX = 'serviceCategory:';
export const MAX_DETAIL_LINES = 100;
export const MAX_SERVICE_CATEGORIES = 30;
export const MAX_CATEGORY_LENGTH = 160;

export const SERVICE_FAMILIES = [
  { id:'filtres', icon:'💧', title:'Filtres & liquides', legacy:'vidange', items:[
    'Vidange huile moteur','Filtre à huile','Filtre à air moteur',"Filtre d’habitacle (pollen / charbon actif)",
    'Filtre à carburant (gazole / essence)','Liquide de refroidissement (purge / appoint)',
    'Liquide de frein (purge / remplacement)','Liquide de direction assistée',
    'Liquide lave-glace (appoint / liquide été-hiver)','AdBlue (appoint / traitement réservoir)','Additif FAP / Cérine (recharge)',
  ]},
  { id:'freinage', icon:'🛑', title:'Freinage', legacy:'freins', items:[
    'Plaquettes de frein avant','Plaquettes de frein arrière','Disques de frein avant','Disques de frein arrière',
    'Kit de frein arrière (tambours / mâchoires / récepteurs)','Flexibles de frein','Étrier de frein (avant / arrière)',
    'Câble de frein à main / Réglage','Capteur ABS / Témoin d’usure de frein',
  ]},
  { id:'roues', icon:'🛞', title:'Roues, pneus & suspension', legacy:'pneus', items:[
    'Pneus avant (changement / montage)','Pneus arrière (changement / montage)','Pneus été / hiver / 4 saisons','Permutation des pneus (AV/AR)',
    'Géométrie / Parallélisme / Équilibrage','Amortisseurs avant','Amortisseurs arrière','Coupelles / Butées d’amortisseur',
    'Ressorts de suspension','Rotules de direction / Rotules de suspension','Biellettes de barre stabilisatrice',
    'Triangles / Bras de suspension','Roulements de roue','Remplacement jante / Valve / Pression',
  ]},
  { id:'moteur', icon:'⚙️', title:'Moteur, échappement & alimentation', legacy:'revision', items:[
    'Courroie de distribution + Pompe à eau (Kit distribution)','Courroie d’accessoires / Galets tendeurs',
    'Bougies d’allumage (moteur essence)','Bougies de préchauffage (moteur diesel)','Injecteurs / Joints d’injecteur',
    'Turbo / Durites de suralimentation','Vanne EGR (nettoyage / remplacement)',
    'Filtre à particules (FAP) / Catalyseur / Décalaminage','Échappement (silencieux, pot intermédiaire, tube)',
    'Joint de culasse / Étanchéité moteur','Radiateur moteur / Durites / Thermostat (Calorstat)',
    'Alternateur / Démarreur','Supports moteur (silentblocs)',
  ]},
  { id:'transmission', icon:'🔧', title:'Transmission & embrayage', legacy:'revision', items:[
    'Kit d’embrayage','Volant moteur (bi-masse / rigide)','Vidange boîte de vitesses (manuelle)',
    'Vidange / Vidange intégrale boîte automatique (BVA)','Cardan / Soufflet de cardan',
    'Butée hydraulique d’embrayage','Vidange pont / Différentiel / Boîte de transfert (4x4)',
  ]},
  { id:'visibilite', icon:'💡', title:'Visibilité, électricité & électronique', legacy:'autre', items:[
    'Batterie 12V (remplacement)','Ampoules / Optiques de phare (feux de croisement, route, stop, clignotants)',
    'Balais d’essuie-glace (avant / arrière)','Mécanisme / Moteur d’essuie-glace',
    'Pare-brise / Remplacement vitrage / Réparation impact','Rétroviseurs (glace / coquille / mécanisme électrique)',
    'Capteurs de stationnement / Caméra de recul','Fusibles / Faisceau électrique / Neiman',
    'Diagnostic électronique / Passage valise (effacement défauts)',
  ]},
  { id:'climatisation', icon:'❄️', title:'Climatisation & chauffage', legacy:'autre', items:[
    'Recharge gaz climatisation (R134a / R1234yf)','Désinfection / Traitement antibactérien circuit clim',
    'Compresseur de climatisation','Condenseur / Évaporateur / Bouteille déshydratante',
    'Pulseur d’air / Résistance de chauffage / Ventilation',
  ]},
  { id:'controles', icon:'📋', title:'Contrôles & administratif', legacy:'controle', items:[
    'Contrôle Technique (CT)','Contre-visite CT','Révision constructeur / Entretien périodique complet',
    'Contrôle anti-pollution','Check-up sécurité / Pré-contrôle technique',
    'Carte grise / Frais d’immatriculation / Plaque d’immatriculation','Assurance auto (cotisation / franchise)',
    'Péage / Vignette / Crit’Air',
  ]},
  { id:'carrosserie', icon:'🎨', title:'Carrosserie, attelage & intérieur', legacy:'carrosserie', items:[
    'Nettoyage / Lavage / Detailing (intérieur / extérieur)','Peinture / Débosselage / Retouche rayure',
    'Pare-chocs / Calandre / Aile / Rétro','Serrure / Télécommande / Pile de clé (plip)',
    'Attelage / Faisceau attelage','Sellerie / Sièges','Tapis / Housses / Accessoires habitacle',
  ]},
];

export function categoryKey(item) { return `${normalise(item.family)}\u0000${normalise(item.label)}`; }
export function familyName(id) {
  return SERVICE_FAMILIES.find((family) => family.id === id)?.title ||
    (id === 'personnalise' ? 'Mes catégories' : id === 'historique' ? 'Catégorie précédente' : id);
}
export function allCategoryOptions(settings = []) {
  const rows = SERVICE_FAMILIES.flatMap((f) => f.items.map((label) => ({family:f.id, label, familyLabel:f.title, icon:f.icon})));
  const known = new Set();
  for (const item of settings) {
    if (!item || typeof item.id !== 'string' || !item.id.startsWith(CUSTOM_CATEGORY_PREFIX) ||
        typeof item.label !== 'string' || !item.label.trim()) continue;
    const key = normalise(item.label);
    if (known.has(key)) continue;
    known.add(key);
    rows.push({family:'personnalise', label:item.label, familyLabel:'Mes catégories', icon:'➕'});
  }
  return rows;
}
function searchKey(text) {
  return normalise(text).replace(/[’'‐‑–—-]+/g, ' ').replace(/\s+/g, ' ').trim();
}
export function searchCategories(query, settings = []) {
  const key = searchKey(query);
  return allCategoryOptions(settings).filter((item) => !key || searchKey(item.label).includes(key) || searchKey(item.familyLabel).includes(key));
}
export function legacyCategory(item) {
  if (!item) return 'autre';
  if (item.family === 'historique' && typeof item.legacy === 'string') return item.legacy;
  const label = normalise(item.label);
  if (item.family === 'moteur' && label.includes('distribution')) return 'distribution';
  if (item.family === 'visibilite' && label.startsWith('batterie')) return 'batterie';
  return SERVICE_FAMILIES.find((f) => f.id === item.family)?.legacy || 'autre';
}
const plain = (v) => !!v && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Uint8Array);
export function inspectCategories(record = {}) {
  if (!Object.hasOwn(record, CATEGORIES_KEY)) return {state:'absent'};
  const value = record[CATEGORIES_KEY];
  if (!plain(value) || value.version !== 1 || !Array.isArray(value.items) || value.items.length > MAX_SERVICE_CATEGORIES ||
      value.items.some((x) => !plain(x) || typeof x.family !== 'string' || typeof x.label !== 'string' || !x.label.trim()))
    return {state:'unsupported'};
  return {state:'valid', value};
}

/** Les montants détaillés sont des centimes entiers ; aucune addition binaire arrondie. */
export function parseCents(raw) {
  const value = String(raw ?? '').trim();
  if (value.length > 24) throw new Error('Montant trop grand.');
  const match = /^(?:([0-9]+)(?:\.([0-9]{0,2}))?|\.([0-9]{1,2}))$/.exec(value);
  if (!match) throw new Error('Saisissez un prix positif avec au plus deux décimales.');
  const whole = match[1] || '0', decimals = (match[2] ?? match[3] ?? '').padEnd(2, '0');
  const cents = BigInt(whole) * 100n + BigInt(decimals);
  if (cents > BigInt(Number.MAX_SAFE_INTEGER)) throw new Error('Montant trop grand pour être enregistré sans arrondi.');
  return Number(cents);
}
export function formatCents(cents) {
  if (!Number.isSafeInteger(cents) || cents < 0) throw new Error('Montant détaillé invalide.');
  const n = BigInt(cents);
  return `${n / 100n}.${String(n % 100n).padStart(2, '0')}`;
}
export function centsAsNumber(cents) {
  const token = formatCents(cents);
  if (!survivesUserNumber(token)) throw new Error('Le total est trop grand ou trop précis pour être enregistré sans arrondi.');
  return Number(token);
}
export function sumCents(values) {
  let sum = 0n;
  for (const value of values) {
    if (!Number.isSafeInteger(value) || value < 0) throw new Error('Montant détaillé invalide.');
    sum += BigInt(value);
    if (sum > BigInt(Number.MAX_SAFE_INTEGER)) throw new Error('La somme des pièces est trop grande.');
  }
  return Number(sum);
}
export function inspectDetails(record = {}) {
  if (!Object.hasOwn(record, DETAIL_KEY)) return {state:'absent'};
  const value = record[DETAIL_KEY];
  if (!plain(value) || value.version !== 1 || !Array.isArray(value.lines) || value.lines.length > MAX_DETAIL_LINES ||
      value.lines.some((x) => !plain(x) || typeof x.label !== 'string' || !x.label.trim() ||
        !Number.isSafeInteger(x.cents) || x.cents < 0)) return {state:'unsupported'};
  try {
    // Une liste vide signifie « aucun détail » : le coût global historique reste libre.
    if (!value.lines.length) return {state:'valid', value, totalCents:null};
    const totalCents = sumCents(value.lines.map((x) => x.cents));
    const total = centsAsNumber(totalCents);
    if (typeof record.parts !== 'number' || record.parts !== total) return {state:'conflict', value, totalCents};
    return {state:'valid', value, totalCents};
  } catch { return {state:'unsupported'}; }
}

export const FUEL_SUGGESTIONS = {
  diesel:['B7','B10','Excellium','V-Power Diesel','Ultimate Diesel','GNR'],
  essence:['SP95','SP95-E10','SP98','Excellium 98','V-Power','Ultimate 98'],
  gpl:['GPL'], e85:['Superéthanol E85'],
  electrique:['Charge lente AC','Charge rapide DC','Supercharge'],
};
export function fuelSuggestions(vehicle = {}, fills = []) {
  const energy = vehicle.fuel || 'autre';
  const detail = normalise(vehicle.fuelDetail);
  let proposed = FUEL_SUGGESTIONS[energy] || [];
  if (energy === 'hybride') proposed = [...FUEL_SUGGESTIONS.essence, ...FUEL_SUGGESTIONS.diesel];
  else if (energy === 'autre' && (detail.includes('e85') || detail.includes('ethanol'))) proposed = FUEL_SUGGESTIONS.e85;
  const recent = fills.filter((x) => x.vehicleId === vehicle.id && typeof x[SUBTYPE_KEY] === 'string' && x[SUBTYPE_KEY].trim())
    .slice().sort((a,b) => String(b.date || '').localeCompare(String(a.date || '')) || String(b.createdAt || '').localeCompare(String(a.createdAt || '')))
    .map((x) => x[SUBTYPE_KEY]);
  const seen = new Set();
  return [...recent, ...proposed].filter((value) => {
    const key = normalise(value); if (!key || seen.has(key)) return false; seen.add(key); return true;
  });
}
export function mapsSearchUrl(name) {
  const value = String(name ?? '').trim();
  if (!value) throw new Error('Saisissez d’abord le nom du lieu ou de la station.');
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(value)}`;
}
