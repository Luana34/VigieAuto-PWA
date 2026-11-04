# Module « Stations & Prix carburants »

**Statut : à faire, non entamé. Dépend du socle 0.4.0 stable (Room propre, performante, décomposée).**

Ce document décrit une fonctionnalité future. Rien n'est codé à ce jour. Les termes « affiche », « télécharge », « localise » décrivent une cible, pas un comportement actuel. Les sources, formats, permissions et limites exactes sont à vérifier au moment de l'implémentation.

---

## 1. Objectif

Permettre à l'utilisateur de **trouver une station-service autour de lui**, avec les **prix à jour** du carburant correspondant à son véhicule, sans publicité, sans compte, sans pistage, et avec un fonctionnement partiellement hors ligne.

Cette fonction ne remplace pas un GPS de navigation ; elle **aide à décider où faire le plein**.

---

## 2. Portée

### Dans le périmètre
- Carte des stations en France métropolitaine (DROM-COM à préciser selon disponibilité de la source).
- Prix de tous les carburants publiés par chaque station.
- Localisation ponctuelle de l'utilisateur (uniquement quand l'écran est ouvert).
- Filtrage par carburant du véhicule actif.
- Tri par distance ou par prix.
- Détail station avec date et heure de mise à jour.
- Mode hors ligne partiel grâce à un cache local.
- Lien vers un GPS externe (Plans Android, Google Maps, Waze, OsmAnd…) pour l'itinéraire.

### Hors périmètre
- Navigation turn-by-turn (reste du ressort des apps GPS).
- Paiement en ligne, réservation, fidélité.
- Prix hors France (source officielle non applicable).
- Pistage historique « où l'utilisateur a cherché de l'essence ».
- Compte utilisateur, partage social, avis communautaires.

---

## 3. Source de données

**Source principale envisagée :** fichier open data officiel du gouvernement français (prix-carburants.gouv.fr), mis à jour en continu.

**À vérifier à l'implémentation :**
- Format exact disponible (XML, CSV, archive compressée).
- Fréquence réelle de mise à jour.
- Volume du fichier décompressé (~10 000 stations attendues).
- Conditions d'utilisation et licence.
- Disponibilité d'une version différentielle.

**Principe retenu :** l'app télécharge le fichier officiel directement. Pas de serveur VigieAuto intermédiaire. Pas de clé API payante. Pas de dépendance à un site tiers.

**Repli manuel :** si la source gouvernementale devient indisponible, l'utilisateur conserve ses dernières données en cache et peut toujours saisir ses pleins manuellement comme aujourd'hui.

---

## 4. Permissions requises

| Permission | Quand | Pourquoi | Si refus |
|---|---|---|---|
| Localisation précise (ponctuelle) | À l'ouverture de l'écran Stations | Centrer la carte sur l'utilisateur, trier par distance | Mode manuel : saisie ville ou code postal, carte déplaçable |
| Localisation en arrière-plan | **Jamais** | Non nécessaire | — |
| Internet | Au premier lancement et aux mises à jour du cache | Télécharger le fichier open data officiel | L'app utilise le cache existant |

**Règle stricte :** la permission localisation est demandée **au moment où l'utilisateur ouvre l'écran Stations**, pas au démarrage de l'app. Un refus n'empêche jamais le reste de VigieAuto de fonctionner.

---

## 5. Vie privée

- Aucune donnée de localisation n'est envoyée à un serveur VigieAuto (il n'y en a pas).
- Le filtrage par distance se fait **localement** sur le téléphone.
- Aucun historique de recherche n'est stocké, sauf si l'utilisateur enregistre un plein lié à une station.
- Le cache local des stations ne contient aucune donnée personnelle.
- Les requêtes de téléchargement du fichier open data ne transmettent pas d'identifiant utilisateur.
- Un plein enregistré avec nom de station ne révèle rien de plus que ce que l'utilisateur a volontairement saisi.

---

## 6. Expérience utilisateur

### 6.1 Écran principal « Stations »
- Carte OpenStreetMap plein écran.
- Barre supérieure : sélecteur de carburant (prérempli selon le véhicule actif, modifiable ponctuellement).
- Barre inférieure : liste synthétique des stations visibles sur la carte, triable par distance ou par prix.
- Bouton flottant « Me localiser » pour recentrer sur la position actuelle.
- Bouton « Rayon » : 5 / 10 / 25 / 50 km.
- Pastilles sur la carte : prix du carburant sélectionné, ou icône grise si prix indisponible / trop ancien.
- Code couleur simple : vert si prix dans le quart inférieur de la zone, orange si médian, rouge si dans le quart supérieur. Gris si pas de donnée.

### 6.2 Détail d'une station (panneau glissant)
- Nom et adresse complète.
- Date et heure de la dernière mise à jour (ex. « Mis à jour aujourd'hui à 14h32 »).
- Liste de **tous** les carburants disponibles avec leur prix.
- Carburants en rupture signalés clairement.
- Horaires d'ouverture si publiés dans la source.
- Services annexes si publiés (24h/24, automate, boutique, lavage…).
- Distance depuis la position actuelle.
- Bouton « Itinéraire » → ouvre l'app de navigation choisie par le système.
- Bouton « Enregistrer un plein ici » → ouvre le formulaire plein existant, pré-rempli avec le nom de la station et le prix du carburant du véhicule.

### 6.3 États particuliers
| État | Affichage |
|---|---|
| Permission localisation refusée | Message explicatif + champ de recherche ville / code postal + bouton « Autoriser » |
| GPS trop imprécis | « Position approximative » + rayon élargi automatiquement |
| Hors ligne, cache valide | Bandeau « Prix du {date} » + fonctionnement normal avec dernière base |
| Hors ligne, cache absent | Message « Connectez-vous pour télécharger les prix » + accès possible aux pleins déjà enregistrés |
| Prix trop ancien (> 7 jours) | Prix affiché grisé + mention « Donnée ancienne » |
| Station marquée fermée ou hors service | Icône spécifique, non comptée dans les tris de prix |
| Hors France | Message « Prix officiels disponibles pour la France » + carte sans pastilles |

---

## 7. Tris et filtres

- **Les plus proches** (par défaut si position connue).
- **Les moins chères dans le rayon** choisi.
- **Meilleur compromis distance / prix** : indicateur simple du type « +3 km pour −4 ct/L → économie estimée sur un plein moyen ». Les hypothèses de calcul sont affichées (volume moyen de plein configuré par l'utilisateur ou valeur par défaut).
- **Filtre carburant** : prérempli selon le véhicule actif, mémorise la dernière sélection manuelle.
- **Filtre services** (optionnel, phase 2) : 24h/24, automate accepté hors horaires, type de paiement.

---

## 8. Comportement hors ligne

- Dernier téléchargement conservé localement en base Room (table dédiée `fuel_stations` + table `fuel_prices`).
- Mises à jour automatiques en Wi-Fi, configurable : jamais / quotidien / hebdomadaire.
- Mise à jour manuelle possible via bouton « Actualiser les prix ».
- Date du dernier téléchargement toujours visible dans l'écran Stations.
- Le cache ne grandit pas indéfiniment : remplacement complet à chaque mise à jour, pas d'historique des anciens prix (sauf lien avec un plein enregistré).

---

## 9. Intégration avec le reste de VigieAuto

### 9.1 Avec le module Pleins
- Après un plein à une station identifiée via la carte, le nom et l'adresse sont pré-remplis.
- Le prix du carburant au moment du plein peut être pré-rempli (modifiable).
- Les pleins enregistrés gardent ces informations même si la station disparaît ultérieurement du fichier officiel.

### 9.2 Avec le module Rappels
- Si un rappel « plein bientôt » est actif, un lien direct vers l'écran Stations apparaît.
- Aucun calcul d'autonomie n'est fait automatiquement sans donnée fiable (capacité réservoir et conso moyenne).

### 9.3 Avec le module Statistiques (Phase 4)
- Statistique optionnelle « Stations les moins chères où j'ai fait le plein ».
- Statistique optionnelle « Économie réalisée grâce au choix de station » (hypothèses affichées).

### 9.4 Avec le module Dépenses (Phase 3)
- Un plein saisi via la carte crée automatiquement la dépense carburant correspondante, sans double comptage.

---

## 10. Contraintes techniques

### 10.1 Dépendances
- **Carte** : OpenStreetMap via osmdroid ou MapLibre (à comparer en phase d'implémentation sur critères de poids APK, fluidité, consommation batterie).
- **Localisation** : API Android native (FusedLocationProvider si Google Play Services présent, LocationManager en repli pour les téléphones sans services Google).
- **Téléchargement** : WorkManager pour les mises à jour planifiées, OkHttp pour les requêtes.
- **Parsing** : lecteur de flux (streaming) pour ne pas charger les ~10 000 stations en mémoire d'un coup.
- **Stockage** : Room avec index géographique simple (découpage en boîtes lat/lon) pour requête rapide par zone visible.

### 10.2 Performance cible
- Ouverture de l'écran Stations en moins de 1 seconde avec cache local.
- Déplacement de la carte fluide à 60 fps.
- Filtrage par rayon et carburant en moins de 100 ms sur 10 000 stations.
- Téléchargement du fichier officiel en tâche de fond, sans bloquer l'interface.
- Taille du cache local inférieure à 10 Mo.

### 10.3 Dépendance au socle 0.4.0
Cette fonction **ne peut pas** être implémentée tant que la refonte Room du 0.4.0 n'est pas terminée. Insérer 10 000 lignes dans l'actuel moteur de sauvegarde JSON par blocs provoquerait des lenteurs et des blocages d'UI.

---

## 11. Risques et points à vérifier avant implémentation

| Risque | Mitigation |
|---|---|
| Source open data change de format | Lecteur tolérant, version du schéma stockée, repli sur dernier cache valide |
| Source open data devient payante ou indisponible | Documentation claire, saisie manuelle toujours possible, pas de dépendance critique |
| Volume de données trop lourd pour certains téléphones | Téléchargement par région optionnel, compression, purge du cache |
| Précision GPS insuffisante en ville | Rayon élargi automatique, mode saisie manuelle |
| Prix affiché faux (donnée obsolète ou incorrecte dans la source) | Mention explicite de la date de mise à jour, pas de garantie, utilisateur reste responsable de la vérification sur place |
| Carte OSM lente sur vieux téléphones | Tuiles vectorielles légères, limitation du zoom max, option « liste seulement » sans carte |
| Permission localisation refusée massivement | Mode saisie manuelle complet et confortable, pas d'insistance |
| Consommation batterie si utilisation prolongée | Mode économie : rafraîchissement de position toutes les N secondes au lieu de temps réel |

---

## 12. Ce qui n'est **pas** promis

- L'exactitude des prix affichés (dépend de la source officielle et des déclarations des stations).
- La couverture de toutes les stations (certaines petites stations peuvent ne pas déclarer).
- Le fonctionnement en zone sans réseau si le cache n'a jamais été constitué.
- La disponibilité hors France.
- Les horaires d'ouverture exacts (parfois absents de la source).
- Le fonctionnement sur Android très anciens (<8.0).

---

## 13. Découpage de livraison proposé

Cette fonction est trop grosse pour un seul lot. Proposition :

| Lot | Contenu |
|---|---|
| **M1** — Lecture et stockage | Téléchargement du fichier officiel, parsing en flux, stockage Room, mise à jour planifiée. Pas d'interface utilisateur visible. Tests sur fichier réel. |
| **M2** — Carte et affichage | Intégration osmdroid, pastilles de prix, détail station en panneau glissant, filtre carburant. Pas de localisation encore : carte centrée sur une position par défaut ou saisie manuelle. |
| **M3** — Localisation et tris | Permission ponctuelle, centrage sur position actuelle, tri par distance et par prix, bouton « Me localiser ». |
| **M4** — Intégration pleins | Pré-remplissage du formulaire plein depuis une station de la carte. Lien bidirectionnel. |
| **M5** — Confort et hors ligne | Rayons, filtres avancés, états hors ligne soignés, mode économie batterie, bouton actualiser manuel, réglages. |

Chaque lot est testable isolément et apporte une valeur mesurable. On peut livrer M1+M2 d'abord, voir si l'usage est réel, puis investir M3+M4+M5.

---

## 14. Dépendance à la feuille de route

- **Avant M1** : lot 0.4.0 stable terminé (Room propre, Hilt propre, package définitif, navigation typée).
- **Avant M4** : Phase 2 complète (fiche véhicule finalisée) et Phase 3 partielle (Pleins enrichis).
- **M3** peut arriver en parallèle de la Phase 5 GPS natif (même socle de permissions).

---

## 15. Décisions à acter avant implémentation

1. Confirmer la source open data et vérifier sa licence.
2. Choisir entre osmdroid et MapLibre après prototype rapide.
3. Décider du périmètre géographique initial (France métropolitaine seule, ou avec DROM si données disponibles).
4. Décider si le code couleur de prix est basé sur la zone visible, le rayon choisi, ou une moyenne nationale.
5. Décider de la fréquence de mise à jour par défaut (quotidien proposé).
6. Décider si on garde un historique des prix de la station où l'utilisateur a fait un plein (utile pour statistiques, pèse peu).

---

**Résumé en une phrase :** une carte sobre, honnête, locale, respectueuse, qui montre les stations autour de soi avec les prix officiels et la date de mise à jour, sans jamais pister personne.
