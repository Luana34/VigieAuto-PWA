# VigieAuto Android — demandes et priorités après 0.4.0-beta.16

**Document de référence des demandes · 1er novembre 2026.** Ce plan reprend le récapitulatif détaillé fourni par l’utilisateur après la beta.16 et complète, sans l’effacer, la [feuille de route Android](FEUILLE-DE-ROUTE-ANDROID.md). Il s’agit de besoins et d’objectifs **à réaliser**, pas de fonctions déjà disponibles. La base du projet au moment de la décision était Android **0.4.0-beta.16** ; le sous-lot Documents a ensuite été traité en **0.4.0-beta.17**, puis les trois autres sous-lots en **0.4.0-beta.18**, identifiant inchangé `com.vigieauto.app`. La PWA familiale reste **1.5.1** et l’échange est manuel par JSON.

**Beta.20 / PWA 1.5.2-beta.1 candidate :** les nombres très précis des extensions restent numériques et sont réexportés sans arrondi dans les scénarios testés. Un nombre fonctionnel trop précis ou trop grand est refusé avant remplacement ; les données déjà arrondies ne peuvent pas être reconstituées. Le thème et les propriétés supplémentaires des points CQ édités sont préservés. Base PWA IndexedDB 2→3 ; retour direct à 1.5.1 sur la même base bloqué. La PWA 1.5.1 demeure la référence familiale jusqu’aux essais réels ; aucun iPhone n’a été testé. Room 15 et JSON v3 inchangés côté Android. Voir [PRECISION-SAUVEGARDES.md](PRECISION-SAUVEGARDES.md).

## Choix de progression

L’utilisateur présente deux possibilités et laisse le choix : finir d’abord le socle, ou repousser les quatre migrations pour passer aux écrans visibles. **Choix retenu : terminer la phase 1 d’abord**, sans sacrifier la sécurité des données, puis passer aux véhicules et au carnet. La phase 1 comprend aussi les finitions de base, l’automatisation, la mesure et le problème de précision PWA indiqués ci-dessous ; elle ne sera pas déclarée complète simplement parce que les quatre catégories sont migrées.

Pour rester clair et éviter le rythme de sept petites livraisons successives, les quatre catégories font chacune l’objet d’un **sous-lot distinct**, avec sa propre migration et ses tests. Des sous-lots validés peuvent être réunis dans une livraison cohérente : ce n’est pas la fusion de leurs migrations. Tests ciblés pour chaque sous-lot ; suite complète normalement par livraison, contrôle lint, documents et archive vérifiée. Exception beta.20 : seuls le numéro de version, les tests et les documents Android changent, sans modification métier Android ; suite ciblée et ponts pour ce lot, dernière suite complète beta.19 512/512, suite complète à reprendre pour la prochaine modification métier Android. Ne pas retirer de contrôles pertinents pour gagner du temps. Si un sous-lot échoue ou ne peut pas être vérifié, ne pas le présenter comme terminé ; adapter le regroupement au risque et à la disponibilité des moyens de test.

Les pourcentages proposés dans la demande — environ 80 % pour la phase 1 et 40 % pour les véhicules — sont des **repères non mesurés**, pas des indicateurs fiables de charge ou d’avancement global. Au moment de la décision, sept catégories de données typées sur onze concernaient le rangement interne, pas l’achèvement de 7/11 de l’application. Aucun délai, absence totale de défaut ou objectif de performance n’est garanti.

## Priorité 1 — Terminer les fondations

### 1.1 Quatre sous-lots de données, dans l’ordre retenu

1. **Documents — sous-lot beta.17 :** cartes grises, assurances, contrôles techniques, factures et autres documents/photos déjà importés. Étudier les champs réellement acceptés et leurs pièces jointes avant d’écrire la table complète et la migration. Préserver les fichiers et métadonnées, les valeurs longues, les extensions, les références aux véhicules et les formats existants.
2. **Modèles de checklists CQ** : listes réutilisables, points ordonnés, identifiants, textes et éventuelles extensions, y compris les modèles personnels et historiques.
3. **Contrôles effectués** : historique, liens au véhicule et au modèle, résultats et notes par point dans leur ordre, avec les champs connus et inconnus.
4. **Réglages** : préférences et valeurs de types variés, y compris thème, véhicule actif et suggestions personnelles. Préserver aussi les réglages et propriétés inconnus ; ne pas inventer rétroactivement de nouvelles préférences.

Pour **chaque** sous-lot : table(s) complète(s) appropriée(s), migration propre et transactionnelle, relecture/comparaison avant retrait des anciens blocs complets, sauvegarde externe, tests avec des jeux de données réalistes fictifs, absence/null, champs inconnus, grandes valeurs, corruption, références, échec et rollback. Vérifier les chemins des anciens schémas Room et les imports JSON v1/v2/v3 séparément. Les pièces jointes peuvent rester découpées en blocs : cela ne doit pas constituer une deuxième copie JSON complète de l’objet. Les numéros retenus sont rappelés ci-dessous ; les migrations restent à valider sur appareil et émulateur.

**Avancement beta.18 :** Documents a sa migration 10→11 en beta.17 ; modèles CQ, contrôles effectués et réglages ont chacun leurs tables, migrations 11→12, 12→13 et 13→14, relecture, comparaison et tests. À cette étape, Undo immédiat, essais sur appareils, finitions, CI/R8/mesures et précision PWA restaient à faire. Voir `MIGRATION-V11-V12.md`, `MIGRATION-V12-V13.md`, `MIGRATION-V13-V14.md`.

**Avancement beta.19 :** Room 15 et migration 14→15 : suppression immédiate des entretiens, pleins, trajets et rappels ; image typée relue et conservée dans la même transaction, restauration complète dans une autre transaction. Une seule annulation, au moins 10 secondes au premier plan ; reprise après réouverture avant 24 h. Une deuxième suppression réussie ou un import réussi invalide l’annulation précédente ; export sans élément supprimé. Conflits d’identifiant, véhicule recréé et second trajet actif refusés ; sauvegarde externe indispensable. Voir `UNDO-CARNET.md` et `MIGRATION-V14-V15.md`. La phase 1 reste ouverte pour les essais physiques, finitions, CI/R8/mesures et précision PWA.

### 1.2 Suppression immédiate et véritable Undo

Demande initiale, implémentée pour le carnet en beta.19 mais restant à valider sur appareil : remplacer la suppression différée par une suppression effective immédiatement après confirmation et un bandeau inférieur « Annuler » pendant quelques secondes. L’image nécessaire à la restauration doit être gardée de façon fiable avec la suppression dans une transaction ; l’action Annuler restaure complètement l’entrée et ses données associées dans une transaction. Tester la durée accessible, les échecs, conflits, suppressions multiples, import/export concurrent, recréation, arrière-plan, arrêt du processus, expiration et suppression du véhicule parent. Aucun écrasement silencieux d’une donnée plus récente. La durée et la persistance sont précisées dans `UNDO-CARNET.md` ; une sauvegarde externe reste nécessaire.

### 1.3 Tests sur émulateur et téléphone, et mesures

Les **scénarios instrumentés de beta.19 sont compilés mais pas exécutés par l’assistant sur appareil ou émulateur** ; des versions antérieures essayées par l’utilisateur ne valident pas automatiquement beta.19. Exécuter les migrations sur émulateur puis téléphone de test après sauvegarde externe, et mesurer les objectifs dans [PERFORMANCES.md](PERFORMANCES.md). Beta.19 n’a pas été vérifiée sur Windows ici ; ne pas supposer la cause du temps Windows précédent.

### 1.4 Finitions visuelles de base

- Messages de confirmation et d’erreur homogènes : style, emplacement et durées cohérents, adaptés à l’accessibilité et à la possibilité d’annuler.
- Écrans vides explicites avec illustration et action, par exemple « Aucun plein enregistré. Ajoutez-en un ! ».
- Indicateurs de chargement et progression pour les imports lorsque techniquement mesurable ; ne pas afficher un pourcentage inventé.
- Transitions douces entre écrans, avec prise en compte des préférences de réduction des animations.
- Boutons, champs, cartes et autres composants réutilisables et homogènes.

### 1.5 Automatisation, qualité et fluidité

- CI GitHub Actions pour compilation et tests à chaque modification du code, une fois le dépôt et les permissions disponibles ; pas de service distant imposé à l’utilisateur de l’application.
- Le verrou de la candidate PWA fixe désormais Playwright 1.55.1, corrigeant la dépendance de test 1.55.0 concernée par [GHSA-7mvr-c777-76hp](https://github.com/advisories/GHSA-7mvr-c777-76hp) ; `npm audit` est sans vulnérabilité au contrôle effectué. La PWA familiale 1.5.1 historique reste inchangée. Playwright n’est pas une dépendance runtime ni de l’APK.
- Étudier et valider R8/minification pour la version release, les sauvegardes, les migrations et la taille réelle.
- Étudier les profils de référence pour le démarrage. Un gain de 20 à 40 % est une **hypothèse à mesurer**, non une promesse.
- Mesurer les cibles demandées : démarrage à froid < 1 s, chaud < 300 ms, ouverture écran < 100 ms, défilement à 60 images/s avec 1 000 éléments, import/export 10 Mo < 3 s/< 2 s, APK release < 15 Mo et RAM < 100 Mo. Les mesures dépendent du téléphone et des données ; ne pas annoncer ces seuils atteints avant mesure.

### 1.6 Fidélité numérique PWA ↔ Android

Résoudre le cas identifié : la PWA 1.5.1 arrondit certains très grands nombres JSON, y compris dans des champs inconnus. Étudier une solution compatible avec les sauvegardes existantes et les calculs usuels, sans changer silencieusement les types ; vérifier import, édition et réexport de bout en bout entre Android et PWA ainsi que sur les navigateurs concernés. Les originaux doivent être conservés durant les essais. **La fidélité totale est l’objectif**, mais ne peut être garantie pour des valeurs illimitées ou des versions tierces non contrôlées ; si ce point reste ouvert, ne pas présenter la phase 1 comme pleinement achevée sans décision explicite.

**Avancement beta.20 :** **Beta.20 / PWA 1.5.2-beta.1 candidate :** les nombres très précis des extensions restent numériques et sont réexportés sans arrondi dans les scénarios testés. Un nombre fonctionnel trop précis ou trop grand est refusé avant remplacement ; les données déjà arrondies ne peuvent pas être reconstituées. Le thème et les propriétés supplémentaires des points CQ édités sont préservés. Base PWA IndexedDB 2→3 ; retour direct à 1.5.1 sur la même base bloqué. La PWA 1.5.1 demeure la référence familiale jusqu’aux essais réels ; aucun iPhone n’a été testé. Room 15 et JSON v3 inchangés côté Android. Voir [PRECISION-SAUVEGARDES.md](PRECISION-SAUVEGARDES.md). Les exemples de bout en bout sous Chromium et WebKit ont réussi ; les valeurs fonctionnelles non sûres sont refusées plutôt qu’importées. Validation iPhone et décision sur les limites restent ouvertes ; conserver les originaux.

## Priorité 2 — Véhicules complets

### 2.1 Suppression d’un véhicule

Bouton dans la fiche, confirmation qui annonce clairement le nombre d’entretiens, pleins, trajets et autres données liées, suppression cohérente sans orphelins et bandeau d’annulation. Tester la restauration complète des données associées et des pièces jointes, les conflits et la capacité de stockage.

### 2.2 Photo du véhicule

Choix depuis appareil photo ou galerie, redimensionnement/compression, affichage dans la fiche et la liste, remplacement et suppression. L’exemple d’une image de 12 Mo ramenée vers 100 Ko est une **cible indicative** : préserver une qualité utile et ne pas garantir ce poids pour chaque photo. Tester orientation, permissions, mémoire, stockage local et sauvegardes PWA/Android.

### 2.3 Champs et historique

Couleur ; compagnie d’assurance, numéro et échéance ; date et prix d’achat ; notes libres enrichies avec mise en forme basique ; historique des corrections de compteur avec qui, quand et pourquoi lorsque l’information est disponible. L’identité d’un intervenant ne doit pas imposer de compte obligatoire ; ne pas inventer de valeurs manquantes.

### 2.4 Multivéhicule et catalogue

Sélecteur visible en haut pour changer rapidement, avatar ou couleur par véhicule, dernier véhicule rouvert au lancement, vue combinée facultative. La sélection et le dernier véhicule existent déjà partiellement ; vérifier leur ergonomie. Recherche approximative (exemple « cio » → Clio), priorité aux choix déjà utilisés et mémorisation locale. Toujours permettre « Autre marque… » et « Autre modèle… », saisie libre, modèles personnels liés à leur marque et fonctionnement hors ligne ; ne pas imposer de génération.

## Priorité 3 — Carnet complet Android

### 3.1 Dépenses

Liste triable par date, catégorie et montant ; ajout avec date, catégorie, montant, description, kilométrage et photo de justificatif. Catégories : entretien, carburant, assurance, péage, stationnement, amende, contrôle technique, accessoire, autre. Demande d’un lien automatique entre un plein et une dépense carburant, avec mécanisme empêchant tout double comptage, y compris après modification, suppression et import/réimport. Devise paramétrable, euro par défaut. Les dépenses importées sont déjà conservées, mais l’écran Android complet reste à faire.

### 3.2 CQ et checklists

Modèles demandés : quotidien rapide (~5 points), hebdomadaire (~12), avant long trajet (20+), retour long trajet (~10), saisonnier (~15). Les six modèles déjà présents dans la PWA ne sont pas forcément ces nouveaux modèles : ne pas les écraser. Créer ses modèles, nommer et réorganiser les points par glisser-déposer ; lancer un contrôle, cocher chaque point, ajouter des notes et un résultat global (OK/à surveiller/action requise) ; historique par date/résultat. Points types : liquides, pneus, éclairage, freins, batterie, courroie visible, fuites, bruits, voyants, carrosserie, rétroviseurs, ceintures, sécurité et documents à bord. Préserver les statuts et anciens résultats compatibles PWA.

### 3.3 Symptômes

Date, description, catégorie (bruit, vibration, odeur, voyant, fuite, comportement, visuel, autre), sévérité et conditions ; statut actif/en diagnostic/résolu et date de résolution ; notes, photos et lien avec un entretien ; timeline par véhicule. Il s’agit d’une aide à l’organisation, pas d’un diagnostic mécanique. Les données importées sont déjà conservées ; l’écran Android reste à créer.

### 3.4 Documents

Types carte grise, assurance, contrôle technique, facture, permis et autre ; photo/scan via appareil ou galerie ; échéance et rappel automatique demandé ; galerie en miniatures, aperçu plein écran et zoom ; classement par type, date et véhicule. Préserver les documents historiques même s’ils n’ont pas les nouveaux champs. Vérifier l’espace disponible, les permissions et la confidentialité.

### 3.5 Enrichissement des écrans existants

- **Entretiens** : catégories détaillées, pièces (nom/référence/prix/fournisseur), main-d’œuvre ou fait soi-même, intervalles recommandés modifiables, génération du rappel suivant.
- **Pleins/recharges** : complet/partiel, prix unitaire et total, station mémorisée et calcul entre pleins complets incluant les partiels intermédiaires, sans mélanger litres et kWh. La saisie complet/partiel, prix et station existe déjà ; le suivi de consommation Android reste à relier à un écran et la mémorisation à compléter.
- **Rappels** : récurrence tous les X mois ou X km, notifications locales et lien avec un entretien lors du marquage « fait ». Les rappels et une récurrence date/km existent déjà ; vérifier notamment la récurrence calendaire en mois et les restrictions des notifications.
- **Trajets** : type domicile-travail/pro/loisir/vacances, conditions pluie/neige/nuit/bouchons, péages et notes. Des champs et trajets manuels existent déjà ; compléter sans écraser les valeurs importées.

## Priorité 4 — Statistiques et tableaux de bord

- **Accueil** : photo, kilométrage, énergie ; consommation moyenne et coût du mois ; rappels en retard/à venir, symptômes actifs ; trois à cinq derniers événements et prochain rappel.
- **Statistiques** : consommation L/100 km par période ; coûts par catégorie et par mois ; coût au kilomètre ; coût de possession ; kilomètres parcourus ; distance, durée, moyenne et types de trajets ; prix moyen/évolution/station la moins chère ; autonomie estimée à partir de la consommation et de la capacité connue.
- **Calculs** : la formule « (achat + dépenses) / km parcourus » donnée dans la demande est un **coût par kilomètre**, pas un montant total de possession. Afficher distinctement le total et son quotient par la distance lorsque les données nécessaires sont disponibles ; documenter période et hypothèses, ne pas compter deux fois les pleins liés à des dépenses.
- **Graphiques** : courbes de consommation, barres mensuelles, camembert de répartition, timeline des entretiens ; périodes 3 mois/6 mois/1 an/tout et détail au toucher.
- **Exports** : PDF récapitulatif mensuel ou annuel, CSV pour tableur et JSON complet restaurable déjà existant. PDF/CSV ne remplacent pas une sauvegarde JSON.

## Priorité 5 — Trajets GPS Android facultatifs

Démarrage explicite par bouton à l’arrêt, jamais automatique ; service de premier plan avec notification visible ; positions à fréquence configurable ciblée de 5 à 10 secondes, pause/reprise/arrêt ; résumé distance, durée, vitesses et dénivelé si les données le permettent. Un trajet interrompu par crash ou redémarrage doit être signalé ; la reprise automatique n’est pas garantie par Android.

Carte OpenStreetMap du tracé, vue temps réel facultative, historique et détection d’arrêts envisagée à partir d’une pause > 2 minutes. Demandes progressives de permissions, explications et fonctionnement du reste du carnet sans autorisation. Choix explicite entre conservation de la trace et simple résumé ; **pas de trace conservée par défaut**. Fréquence réelle, précision, batterie, autorisations et restrictions d’arrière-plan dépendent du système et doivent être mesurées ; carte et tuiles peuvent nécessiter du réseau ou un cache préalable. La PWA possède une estimation GPS limitée quand la page est visible, pas ce service natif.

## Priorité 6 — Stations & Prix carburants (phase 5 bis)

À développer **après le socle 0.4.0 stable**, selon la fiche [module-stations-carburants.md](module-stations-carburants.md) ; aucun module Android n’est actuellement implémenté.

- **M1 données** : étudier le téléchargement de la source open data officielle française, les licences, le stockage local d’un ordre de grandeur d’environ 10 000 stations, mises à jour manuelle/quotidienne/hebdomadaire et permission Internet. Volumes et disponibilité sont à vérifier, pas des mesures.
- **M2 carte** : carte OpenStreetMap, pastilles de prix du carburant du véhicule sélectionné, couleurs de comparaison et détail de tous les prix avec leur date.
- **M3 localisation/tris** : localisation ponctuelle si autorisée, rayons 5/10/25/50 km, tri par distance/prix, mode manuel si refus.
- **M4 intégration** : « Enregistrer un plein ici », nom/prix préremplis et lien avec le carnet, sans double comptage.
- **M5 confort** : cache pour accès hors ligne partiel, actualisation manuelle, économie de batterie et réglages.

La source et les cartes peuvent voir l’adresse IP et la zone demandée : choisir les services, licences et informations de confidentialité avant développement. Un cache de prix ne rend pas automatiquement les cartes ou la recherche d’adresse disponibles hors ligne. Les horaires d’actualisation dépendent du système.

## Priorité 7 — Confort et expérience (phase 6)

- **Premier lancement** : bienvenue, premier véhicule simplifié, présentation des cinq onglets, possibilité de passer.
- **Notifications locales** : canaux rappels et documents, activation et délai par type, regroupement, permissions et limites Android.
- **Widgets** : petit 2×1 (véhicule, km, prochain rappel) ; moyen 4×2 (véhicule, consommation, coût du mois, rappel, bouton +), avec fréquence dépendant du système.
- **Recherche globale** : barre sur l’accueil, recherche dans entretiens, pleins, trajets, symptômes, documents et notes, résultats regroupés.
- **Accessibilité** : descriptions des icônes, cibles tactiles au moins 48 dp, contrastes WCAG AA, taille de police système, test TalkBack et mode paysage.
- **Thèmes** : étudier Material You Android 12+ ; conserver Sauge/Cyan et modes clair/sombre. L’icône monochrome existe déjà : vérifier son rendu réel Android 13+ plutôt que l’annoncer à créer.
- **Paramètres** : langue, km/miles, L/gallons et devise ; thème/couleurs/taille de police ; notifications et délais ; export JSON/CSV/PDF, import et purge doublement confirmée ; taille de base, photos et nettoyage ; fréquence GPS et choix de conservation ; version, licences et lien GitHub lorsque disponibles. Ne jamais supprimer de données sans confirmation et sauvegarde adaptée.

## Priorité 8 — Bonus à étudier (phase 7)

- **Bluetooth BLE assisté** : beacon compatible, coût indicatif à vérifier (~10 € dans la proposition), notification suggérant de démarrer un trajet, jamais démarrage automatique sans confirmation ; disponibilité et fonctionnement en arrière-plan dépendent du matériel et du système. NFC reste une piste distincte, facultative.
- **Partage familial** : export sélectif des véhicules/données, QR pour petits volumes, compatibilité PWA ; pas de synchronisation directe ou serveur obligatoire.
- **Flotte/entreprise** : plusieurs conducteurs, rapports km pro/perso et indemnités kilométriques, avec respect du stockage local.
- **Carnet d’adresses** : stations favorites (nom/adresse/prix moyen), garages (nom/téléphone/spécialité/notes), saisie manuelle locale.
- **Rappels intelligents** : estimation d’une échéance selon le rythme kilométrique et suggestions saisonnières, avec hypothèses explicites et réglages.
- **Tablette** : liste et détail côte à côte, navigation latérale sur grand écran.

## Règles permanentes

Français, application gratuite sans publicité, abonnement ou compte obligatoire ; base locale et utilisable hors ligne. GPS, Bluetooth, NFC et services en ligne sont facultatifs et consentis ; aucun traçage, OBD ou serveur n’est requis pour le carnet de base. Android et PWA ont des bases séparées : un import JSON confirmé **remplace** les données du destinataire, ce n’est pas une fusion. Vérifier et conserver séparément les sauvegardes avant mise à jour ou échange ; les fichiers ne sont pas chiffrés par l’application.

Ce document consigne une décision et une demande : **sa rédaction seule n’a implémenté aucune fonction**. La livraison beta.16 reste immuable et ne contient pas ce plan ajouté après sa publication ; le plan figure dans l’archive beta.17. À chaque nouvelle livraison, mettre à jour l’historique, le cahier des charges, les feuilles de route, le récapitulatif des fonctions et la checklist de performance ; garder les trois ZIP de projet prévus sans toucher aux sauvegardes personnelles.
