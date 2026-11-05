# Spécification proposée — entretiens et pleins

**Décision du 4 novembre 2026 · phase 3.** Premier lot disponible dans la **PWA 1.5.2-beta.2 candidate** ; le portage Android est disponible en beta.27, avec ses limites décrites dans [CARNET-ANDROID-BETA27.md](CARNET-ANDROID-BETA27.md). Le détail des champs réellement utilisés, des limites et des tests est dans [CARNET-PWA-BETA2.md](CARNET-PWA-BETA2.md). L’utilisateur indique avoir installé la candidate PWA 1.5.2-beta.1 depuis GitHub Pages sur Android et importé sa sauvegarde sans perte constatée. C’est son retour d’usage, pas un contrôle indépendant exhaustif. Aucun iPhone n’étant disponible, Safari iOS reste à valider ultérieurement. Le texte ci-dessous conserve la demande et les exemples de conception ; l’état réel de la candidate, qui n’est pas la version stable, figure dans le document lié.

## 1. Nomenclature complète proposée par l’utilisateur

Les icônes et libellés sont indicatifs et à vérifier pour l’accessibilité et l’usage. Certaines opérations apparaissent dans plusieurs familles ; choisir une règle d’identité/recherche qui évite de perdre ou confondre les catégories personnelles.

### 💧 1. Filtres & Liquides — entretien régulier / vidange

- Vidange huile moteur
- Filtre à huile
- Filtre à air moteur
- Filtre d’habitacle (pollen / charbon actif)
- Filtre à carburant (gazole / essence)
- Liquide de refroidissement (purge / appoint)
- Liquide de frein (purge / remplacement)
- Liquide de direction assistée
- Liquide lave-glace (appoint / liquide été-hiver)
- AdBlue (appoint / traitement réservoir)
- Additif FAP / Cérine (recharge)

### 🛑 2. Freinage

- Plaquettes de frein avant
- Plaquettes de frein arrière
- Disques de frein avant
- Disques de frein arrière
- Kit de frein arrière (tambours / mâchoires / récepteurs)
- Flexibles de frein
- Étrier de frein (avant / arrière)
- Câble de frein à main / Réglage
- Capteur ABS / Témoin d’usure de frein

### 🛞 3. Roues, Pneus & Suspension

- Pneus avant (changement / montage)
- Pneus arrière (changement / montage)
- Pneus été / hiver / 4 saisons
- Permutation des pneus (AV/AR)
- Géométrie / Parallélisme / Équilibrage
- Amortisseurs avant
- Amortisseurs arrière
- Coupelles / Butées d’amortisseur
- Ressorts de suspension
- Rotules de direction / Rotules de suspension
- Biellettes de barre stabilisatrice
- Triangles / Bras de suspension
- Roulements de roue
- Remplacement jante / Valve / Pression

### ⚙️ 4. Moteur, Échappement & Alimentation

- Courroie de distribution + Pompe à eau (Kit distribution)
- Courroie d’accessoires / Galets tendeurs
- Bougies d’allumage (moteur essence)
- Bougies de préchauffage (moteur diesel)
- Injecteurs / Joints d’injecteur
- Turbo / Durites de suralimentation
- Vanne EGR (nettoyage / remplacement)
- Filtre à particules (FAP) / Catalyseur / Décalaminage
- Échappement (silencieux, pot intermédiaire, tube)
- Joint de culasse / Étanchéité moteur
- Radiateur moteur / Durites / Thermostat (Calorstat)
- Alternateur / Démarreur
- Supports moteur (silentblocs)

### 🔧 5. Transmission & Embrayage

- Kit d’embrayage
- Volant moteur (bi-masse / rigide)
- Vidange boîte de vitesses (manuelle)
- Vidange / Vidange intégrale boîte automatique (BVA)
- Cardan / Soufflet de cardan
- Butée hydraulique d’embrayage
- Vidange pont / Différentiel / Boîte de transfert (4x4)

### 💡 6. Visibilité, Électricité & Électronique

- Batterie 12V (remplacement)
- Ampoules / Optiques de phare (feux de croisement, route, stop, clignotants)
- Balais d’essuie-glace (avant / arrière)
- Mécanisme / Moteur d’essuie-glace
- Pare-brise / Remplacement vitrage / Réparation impact
- Rétroviseurs (glace / coquille / mécanisme électrique)
- Capteurs de stationnement / Caméra de recul
- Fusibles / Faisceau électrique / Neiman
- Diagnostic électronique / Passage valise (effacement défauts)

### ❄️ 7. Climatisation & Chauffage

- Recharge gaz climatisation (R134a / R1234yf)
- Désinfection / Traitement antibactérien circuit clim
- Compresseur de climatisation
- Condenseur / Évaporateur / Bouteille déshydratante
- Pulseur d’air / Résistance de chauffage / Ventilation

### 📋 8. Contrôles & Administratif

- Contrôle Technique (CT)
- Contre-visite CT
- Révision constructeur / Entretien périodique complet
- Contrôle anti-pollution
- Check-up sécurité / Pré-contrôle technique
- Carte grise / Frais d’immatriculation / Plaque d’immatriculation
- Assurance auto (cotisation / franchise)
- Péage / Vignette / Crit’Air

### 🎨 9. Carrosserie, Attelage & Intérieur

- Nettoyage / Lavage / Detailing (intérieur / extérieur)
- Peinture / Débosselage / Retouche rayure
- Pare-chocs / Calandre / Aile / Rétro
- Serrure / Télécommande / Pile de clé (plip)
- Attelage / Faisceau attelage
- Sellerie / Sièges
- Tapis / Housses / Accessoires habitacle

### ➕ 10. Autre / Personnalisé

- Saisie libre : si l’élément recherché n’existe pas, possibilité de créer une catégorie personnalisée mémorisée localement pour les utilisations futures. Les catégories personnelles importées doivent rester visibles et conservées.

## 2. Sélecteur plein écran et recherche — comportement demandé

- Ouverture par le champ « Catégorie », dans une vue plein écran superposée au formulaire. La liste défile verticalement sans qu’un glissement vers le bas ou latéral ne déclenche volontairement sa fermeture.
- Fermeture prévue par flèche « ← », retour du téléphone ou sélection explicite d’une catégorie. Le texte initial indiquait seulement flèche/retour ; la précision ultérieure inclut aussi la sélection explicite.
- Recherche fixe en haut, filtrage immédiat dès la saisie : hors recherche, afficher les familles et leurs en-têtes ; pendant la recherche, masquer les en-têtes de familles et rappeler la famille parente de chaque résultat. Si aucun résultat ne correspond, proposer en premier « Créer la catégorie “…” », avec saisie libre enregistrée localement.
- La candidate PWA utilise une vue HTML/CSS plein écran et l’historique `popstate` ; sur Android beta.27, `DialogProperties(usePlatformDefaultWidth = false)` et `BackHandler` sont utilisés ; les gestes réels restent à valider. Tailwind n’est pas une dépendance imposée ; la PWA est actuellement en CSS/JS vanilla.
- **Limite :** les gestes du système et du navigateur, particulièrement le retour Safari iOS, ne peuvent pas être garantis interceptables dans tous les cas. Il faudra tester les gestes réellement disponibles, préserver le brouillon et éviter de promettre qu’aucune fermeture système n’est possible.

## 3. Structure JSON proposée par l’utilisateur — exemple conceptuel

Cet exemple est conservé tel que demandé pour discuter des données ; **il n’est pas le format d’import actuel et ne doit pas être importé**. Le contrat réel utilise `app`, `formatVersion`, `exportedAt` et `data` avec `vehicles`, `services`, `fills`, etc. ; les champs actuels sont notamment `vehicleId`, `title`, `category`, `date`, `odometer`, `parts`, `labor`, `place`, ainsi que `volume`, `total`, `unit`, `full`, `station`. Voir [FORMAT-PONT.md](FORMAT-PONT.md). En particulier, les anciennes versions calculent le total d’entretien avec **`parts + labor`**, et non avec un champ français `cout_total`.

```json
{
  "version_schema": 3,
  "entretiens": [
    {
      "id": "ent_20261104_001",
      "vehicule_id": "veh_01",
      "date": "2026-11-04",
      "kilometrage": 142500,
      "categorie": "Vidange + Filtres",
      "cout_total": 145.50,
      "cout_main_oeuvre": 45.00,
      "garage": "Garage Central - Feu Vert",
      "lieu_url": "https://www.google.com/maps/search/?api=1&query=Garage+Central+Feu+Vert+Montpellier",
      "pieces_operations": [
        {"libelle": "Huile Moteur 5W30 5L", "famille": "Filtres & liquides", "cout": 42.50},
        {"libelle": "Filtre à huile", "famille": "Filtres & liquides", "cout": 14.00},
        {"libelle": "Filtre à air", "famille": "Filtres & liquides", "cout": 22.00},
        {"libelle": "Filtre d'habitacle", "famille": "Filtres & liquides", "cout": 22.00}
      ],
      "notes": "Vidange annuelle + remplacement de l'ensemble des filtres."
    }
  ],
  "pleins": [
    {
      "id": "pln_20261104_001",
      "vehicule_id": "veh_01",
      "date": "2026-11-02",
      "kilometrage": 142100,
      "energie": "Gasoil",
      "sous_type_carburant": "Excellium",
      "volume_litres": 45.20,
      "prix_total": 76.84,
      "station": "TotalEnergies Relais Croix d'Argent",
      "lieu_url": "https://www.google.com/maps/search/?api=1&query=TotalEnergies+Relais+Croix+d'Argent",
      "plein_complet": true
    }
  ]
}
```

**Conception initiale et état réalisé :** conserver l’enveloppe et les champs obligatoires réels de JSON v3 ; placer les détails facultatifs à l’intérieur des enregistrements existants, pas dans de nouvelles collections ou propriétés racine que le lecteur Android refuse. Pour l’ancienne lecture, `parts` reste la somme des pièces et `labor` la main-d’œuvre ; le total global affiché est leur somme. Les noms et garde-fous retenus sont décrits dans [CARNET-PWA-BETA2.md](CARNET-PWA-BETA2.md) et [CARNET-ANDROID-BETA27.md](CARNET-ANDROID-BETA27.md). Les cas couverts par les tests ne garantissent pas tous les échanges réels. Les anciens entretiens sans détail ne sont pas convertis automatiquement.

L’exemple contient `lieu_url`, mais le choix retenu en beta.2/beta.27 est l’envoi du **nom saisi** seulement, sans stockage supplémentaire d’URL, d’adresse ni de coordonnées par VigieAuto. Les champs de lieu/station existants restent conservés. Garder les sauvegardes originales : les anciennes versions peuvent normaliser des champs, et la PWA 1.5.1 peut arrondir certains nombres précis.

## 4. Exemple initial JavaScript pour une recherche cartographique

Code initial fourni par l’utilisateur, non repris tel quel. La candidate PWA et Android beta.27 ouvrent une recherche Google Maps équivalente après action explicite :

```javascript
/**
 * Ouvre une recherche cartographique à partir du nom saisi.
 * @param {string} nomLieu - Ex: "Garage Feu Vert Montpellier" ou "TotalEnergies RN113"
 */
function ouvrirCarte(nomLieu) {
    if (!nomLieu || nomLieu.trim() === "") {
        alert("Veuillez d'abord saisir le nom du garage ou de la station.");
        return;
    }
    const requeteFormatee = encodeURIComponent(nomLieu.trim());
    const urlGoogleMaps = `https://www.google.com/maps/search/?api=1&query=${requeteFormatee}`;
    window.open(urlGoogleMaps, '_blank', 'noopener,noreferrer');
}
```

Ce lien HTTPS vise **Google Maps** : il ne garantit ni Apple Maps par défaut, ni Waze, ni l’ouverture d’une application plutôt que du navigateur. `geo:` n’est pas universel sur tous les iPhone ; les liens propres à chaque plateforme et les applications réellement installées devront être étudiés. Un nom ambigu peut donner plusieurs résultats. L’ouverture est volontaire, nécessite généralement Internet et transmet le nom au fournisseur de cartes, qui peut aussi recevoir l’adresse IP et d’autres données selon ses propres règles et permissions ; ce n’est pas un service local. Aucun GPS, compte ou clé d’API ne doit être obligatoire pour le carnet de base.
