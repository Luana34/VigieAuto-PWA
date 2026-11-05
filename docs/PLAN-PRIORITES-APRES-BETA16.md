# VigieAuto Android — demandes et priorités après 0.4.0-beta.16

**Actualisation du 5 novembre 2026 — PWA 1.5.2-beta.5 candidate / Android 0.4.0-beta.30 :** ajout, modification et retrait du kilométrage facultatif des dépenses dans la PWA, déjà disponibles sur Android ; ce champ ne change pas le compteur du véhicule. La beta.30 Android ne modifie pas le code métier. Devise réglable et liaison sans double comptage restent à développer. [Usage et limites](KILOMETRAGE-DEPENSES-BETA30.md).

**Historique du 5 novembre 2026 — Android 0.4.0-beta.29 et PWA 1.5.2-beta.4 candidate :** une photo facultative par dépense, à ajouter depuis la liste après enregistrement ; aperçu, remplacement et retrait explicites. Android convertit les nouvelles photos en JPEG sans EXIF ; la PWA garde le fichier et ses métadonnées éventuelles. Sauvegardes JSON non chiffrées. Room 15, IndexedDB 4 et JSON v3 inchangés. Devise réglable et liaison plein/dépense sans double comptage restent à faire. [Détails, limites et confidentialité](JUSTIFICATIFS-BETA29.md).

**Historique du 5 novembre 2026 — Android 0.4.0-beta.28 et PWA 1.5.2-beta.3 candidate :** premier lot dépenses Android : liste par véhicule, tri, total, ajout, édition, suppression avec Undo, kilométrage facultatif sans changer le compteur. La PWA candidate reprend les catégories et avertissements ; Room 15 et JSON v3 restent inchangés. Aucun lien automatique avec un plein ni détection des doublons ; photo de justificatif et choix de devise restent à développer. Sauvegarder chaque appareil avant import ou essai. [Détails et limites](DEPENSES-BETA28.md).

**Document de référence des demandes · actualisé le 4 novembre 2026.** Ce plan reprend le récapitulatif détaillé fourni par l’utilisateur après la beta.16 et complète, sans l’effacer, la [feuille de route Android](FEUILLE-DE-ROUTE-ANDROID.md). Il s’agit de besoins et d’objectifs **à réaliser**, pas de fonctions déjà disponibles. La base du projet au moment de la décision était Android **0.4.0-beta.16** ; le sous-lot Documents a ensuite été traité en **0.4.0-beta.17**, puis les trois autres sous-lots en **0.4.0-beta.18**, identifiant inchangé `com.vigieauto.app`. La PWA familiale reste **1.5.1** et l’échange est manuel par JSON.

## Actualisation des priorités — beta.27

Le carnet enrichi est maintenant porté sur Android, après la PWA candidate ; vérifier [ses limites](CARNET-ANDROID-BETA27.md). La priorité suivante reste la progression des phases principales, puis GPS natif et Bluetooth autoradio avec confirmation, sans OBD. Les tests physiques et la stabilité du socle restent ouverts.

## Bilan antérieur — beta.26

**Décision actualisée du 4 novembre :** avancer par lots fonctionnels cohérents (véhicules, carnet, statistiques, puis GPS natif et Bluetooth d’autoradio assisté) sans attendre les essais sur téléphone. Le scénario d’autoradio déjà associé propose le démarrage, l’utilisateur confirme, le GPS du téléphone mesure vitesse, distance et durée ; la déconnexion propose l’arrêt et l’enregistrement, sans OBD ni démarrage silencieux. GPS et Bluetooth restent facultatifs, avec permissions au bon moment et recours manuel. Ce parcours est **à développer** ; voir [BLUETOOTH-GPS-VOITURE.md](BLUETOOTH-GPS-VOITURE.md). La phase 1 reste ouverte : ni les validations réelles ni la stabilité ne sont acquises.

**Beta.26 — photo du véhicule actif :** depuis l’accueil, choisir dans le sélecteur système une image d’au plus 12 Mio ; l’application applique l’orientation EXIF lorsqu’elle est reconnue, la réduit en JPEG de 1 600 px au plus et 3 Mio au plus, sans recopier les métadonnées, puis affiche un aperçu. Remplacement et retrait sont confirmés et sans Undo ; la photo précédente n’est pas perdue si l’import échoue. Les photos importées illisibles ou trop grosses sont conservées. Room 15, JSON v3 et PWA ne changent pas ; aucune permission générale de galerie, caméra, GPS, Bluetooth ou réseau n’est ajoutée. Prise de vue directe et aperçus de tous les véhicules restent à faire. [Détails](PHOTO-VEHICULE.md).

Avant la correction EXIF : suite JVM complète **548 réussis et 8 ignorés**, lint zéro erreur/20 avertissements et 61 scénarios instrumentés compilés mais non exécutés. Après remplacement par AndroidX : APK debug compilé, **73/73 tests ciblés réussis** et pont photo fictif Android ↔ PWA stable et candidate vérifié sous Chromium. La suite complète et le lint n’ont pas été relancés après la correction ; la recompilation des instrumentés après correction n’est pas confirmée. Aucun essai Android beta.26 sur Windows, GitHub, émulateur ou téléphone.

**Beta.25 — essai R8 séparé :** une variante de recherche minifiée est préparée sous l’identifiant distinct `com.vigieauto.app.r8test`, avec le nom « TEST R8 - VigieAuto » et la clé de debug du poste ; elle possède sa propre base et ne met pas à jour l’installation habituelle `com.vigieauto.app`. La version debug normale et la release habituelle ne sont pas remplacées. Le contrôle statique du paquet ne prouve pas son fonctionnement réel : les sauvegardes, migrations et parcours sous R8 restent à tester sur appareil/émulateur avec des données fictives. Aucun serveur, migration Room ou changement JSON/PWA ; phase 1 toujours en cours. Voir [VALIDATION-R8.md](VALIDATION-R8.md).

**Contrôles beta.25 :** l’APK `r8Test` isolé a été compilé et contrôlé statiquement, avec lint vital séparé sans anomalie ; taille locale **1 989 477 octets**, avec signature de debug, non représentative d’une release validée ou d’un AAB. La variante debug normale est compilée : **76 tests JVM ciblés réussis sur 76** (six classes, code non minifié), zéro ignoré ; pas de nouvelle suite JVM complète pour ce lot de configuration. Les 57 scénarios instrumentés debug sont compilés, non exécutés ; lint debug : zéro erreur et 17 avertissements. Tests Python : contrôleur R8 22/22, rapports CI 21/21, workflow 7/7, archiveur 19/19. Aucun essai réel de l’application R8, GitHub, Windows, émulateur, téléphone ou PWA pour ce lot.

**Beta.24 — chargement prolongé :** après 10 secondes de chargement, « Réessayer » est proposé aussi sur l’écran d’état et au-dessus d’un formulaire ouvert. Ce délai ne signifie pas que les données sont perdues et ne déclenche aucune reprise automatique. La tentative précédente doit se terminer avant une nouvelle lecture ; si elle ne peut pas être interrompue, la reprise peut continuer à attendre. Les formulaires restent en mémoire, mais un arrêt de l’application peut faire perdre une saisie non enregistrée. Aucun effacement de base ; Room 15, JSON v3 et PWA inchangés. Voir [LECTURE-DU-CARNET.md](LECTURE-DU-CARNET.md).

**Contrôles beta.24 :** sous Linux, la suite JVM a compté **534 tests : 526 réussis, huit ignorés faute de fixtures de retour PWA, aucun échec**, sur 76 classes ; durée incrémentale 8 min 12 s hors compilation et téléchargements, non prédictive de Windows. Un contrôle tactile a ensuite été ajouté : les deux classes ViewModel/Compose ont été relancées séparément, **50/50 réussis** (42 + 8). En regroupant les rapports réels de la suite et de ce reciblage, le contrôleur valide 527 réussis et les mêmes huit ignorés ; ce n’est pas une seule suite de 535 tests. Aucun marqueur CloseGuard reconnu, sans preuve d’absence de fuite. APK debug et 57 scénarios instrumentés compilés ; instrumentés non exécutés. Lint : zéro erreur, 17 avertissements. Tests Python : rapports 20/20, workflow 6/6 et archiveur 18/18. Pas de nouveau parcours PWA, ni essai GitHub, Windows, émulateur ou téléphone pour ce lot.

**Beta.23 — lecture fiable du carnet :** chargement explicite, erreur sans données techniques privées et bouton « Réessayer » ; un état inconnu ou une surveillance interrompue ne sont plus présentés comme un carnet vide. Les modifications manuelles et la confirmation d’import sont bloquées jusqu’au retour d’une lecture fiable et de l’Undo. Les formulaires déjà ouverts restent en mémoire sous le message, sans garantie après arrêt du processus. Room 15 et JSON v3 inchangés ; PWA inchangée. Voir [LECTURE-DU-CARNET.md](LECTURE-DU-CARNET.md).

**Contrôles beta.23 :** Suite JVM Linux beta.23 : **530 tests, 522 réussis, huit ignorés faute de fixtures PWA et aucun échec**, sur 76 classes. Lancement incrémental : 6 min 59 s, hors compilations et téléchargements ; ce temps ne prédit pas Windows. Le contrôleur accepte uniquement ces huit omissions attendues ; aucun marqueur CloseGuard reconnu, sans preuve d’absence de fuite. Aucun nouveau parcours PWA n’a été exécuté pour ce lot. Les tests Python réussissent : rapports 19/19, workflow 6/6, archiveur 18/18. APK debug, tests JVM et 57 scénarios instrumentés compilés ; scénarios instrumentés non exécutés. Lint : 0 erreur et 17 avertissements.

**Beta.20 / PWA 1.5.2-beta.1 candidate :** les nombres très précis des extensions restent numériques et sont réexportés sans arrondi dans les scénarios testés. Un nombre fonctionnel trop précis ou trop grand est refusé avant remplacement ; les données déjà arrondies ne peuvent pas être reconstituées. Le thème et les propriétés supplémentaires des points CQ édités sont préservés. Base PWA IndexedDB 2→3 ; retour direct à 1.5.1 sur la même base bloqué. La PWA 1.5.1 demeure la référence familiale jusqu’aux essais réels ; aucun iPhone n’a été testé. Room 15 et JSON v3 inchangés côté Android. Voir [PRECISION-SAUVEGARDES.md](PRECISION-SAUVEGARDES.md).

## Choix de progression

Initialement, après beta.16, le choix était de terminer d’abord le socle sans sacrifier la sécurité des données. La décision actualisée ci-dessus permet désormais d’avancer sur les autres phases sans attendre les essais sur téléphone. La phase 1 comprend toujours les validations réelles, finitions, automatisation, mesures et précision PWA : elle ne sera pas déclarée complète simplement parce que les migrations sont faites.

Pour rester clair et éviter le rythme de sept petites livraisons successives, les quatre catégories font chacune l’objet d’un **sous-lot distinct**, avec sa propre migration et ses tests. Des sous-lots validés peuvent être réunis dans une livraison cohérente : ce n’est pas la fusion de leurs migrations. Tests ciblés pour chaque sous-lot ; suite complète normalement par livraison, contrôle lint, documents et archive vérifiée. Exception beta.20 : seuls le numéro de version, les tests et les documents Android ont changé, sans modification métier Android ; suite ciblée et ponts pour ce lot. La suite complète beta.21 a obtenu 506 réussis et huit ponts ignorés ; en beta.22, 517 tests ont réussi sans ignoré avec huit fixtures fictives PWA de validations antérieures réutilisées. Reprendre une suite adaptée aux risques pour la prochaine modification métier Android. Ne pas retirer de contrôles pertinents pour gagner du temps. Si un sous-lot échoue ou ne peut pas être vérifié, ne pas le présenter comme terminé ; adapter le regroupement au risque et à la disponibilité des moyens de test.

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

- CI GitHub Actions pour compilation et tests à chaque modification du code, une fois le dépôt et les permissions disponibles ; pas de service distant imposé à l’utilisateur de l’application. **Beta.21 : workflow préparé, non exécuté sur GitHub**, avec émulateurs API 26/36 sur demande et contrôle explicite des tests ignorés. **Beta.22 :** fermeture ordonnée des ressources simulées, trois tests obligatoires et signalement non bloquant du marqueur CloseGuard reconnu, non exhaustif ; voir [TESTS-RESSOURCES.md](TESTS-RESSOURCES.md) et [CI-VERIFICATIONS.md](CI-VERIFICATIONS.md).
- Le verrou de la candidate PWA fixe désormais Playwright 1.55.1, corrigeant la dépendance de test 1.55.0 concernée par [GHSA-7mvr-c777-76hp](https://github.com/advisories/GHSA-7mvr-c777-76hp) ; `npm audit` est sans vulnérabilité au contrôle effectué. La PWA familiale 1.5.1 historique reste inchangée. Playwright n’est pas une dépendance runtime ni de l’APK.
- Étudier et valider R8/minification pour la version release, les sauvegardes, les migrations et la taille réelle. Beta.25 prépare une variante isolée d’essai ; sa construction et ses contrôles statiques ne remplacent pas la validation des parcours ni des migrations sur appareil.
- Étudier les profils de référence pour le démarrage. Un gain de 20 à 40 % est une **hypothèse à mesurer**, non une promesse.
- Mesurer les cibles demandées : démarrage à froid < 1 s, chaud < 300 ms, ouverture écran < 100 ms, défilement à 60 images/s avec 1 000 éléments, import/export 10 Mo < 3 s/< 2 s, APK release < 15 Mo et RAM < 100 Mo. Les mesures dépendent du téléphone et des données ; ne pas annoncer ces seuils atteints avant mesure.

### 1.6 Fidélité numérique PWA ↔ Android

Résoudre le cas identifié : la PWA 1.5.1 arrondit certains très grands nombres JSON, y compris dans des champs inconnus. Étudier une solution compatible avec les sauvegardes existantes et les calculs usuels, sans changer silencieusement les types ; vérifier import, édition et réexport de bout en bout entre Android et PWA ainsi que sur les navigateurs concernés. Les originaux doivent être conservés durant les essais. **La fidélité totale est l’objectif**, mais ne peut être garantie pour des valeurs illimitées ou des versions tierces non contrôlées ; si ce point reste ouvert, ne pas présenter la phase 1 comme pleinement achevée sans décision explicite.

**Avancement beta.20 :** **Beta.20 / PWA 1.5.2-beta.1 candidate :** les nombres très précis des extensions restent numériques et sont réexportés sans arrondi dans les scénarios testés. Un nombre fonctionnel trop précis ou trop grand est refusé avant remplacement ; les données déjà arrondies ne peuvent pas être reconstituées. Le thème et les propriétés supplémentaires des points CQ édités sont préservés. Base PWA IndexedDB 2→3 ; retour direct à 1.5.1 sur la même base bloqué. La PWA 1.5.1 demeure la référence familiale jusqu’aux essais réels ; aucun iPhone n’a été testé. Room 15 et JSON v3 inchangés côté Android. Voir [PRECISION-SAUVEGARDES.md](PRECISION-SAUVEGARDES.md). Les exemples de bout en bout sous Chromium et WebKit ont réussi ; les valeurs fonctionnelles non sûres sont refusées plutôt qu’importées. Validation iPhone et décision sur les limites restent ouvertes ; conserver les originaux.

## Priorité 2 — Véhicules complets

### 2.1 Suppression d’un véhicule

Bouton dans la fiche, confirmation qui annonce clairement le nombre d’entretiens, pleins, trajets et autres données liées, suppression cohérente sans orphelins et bandeau d’annulation. Tester la restauration complète des données associées et des pièces jointes, les conflits et la capacité de stockage.

### 2.2 Photo du véhicule

En beta.26 : choix depuis galerie/fichiers, redimensionnement et affichage du véhicule actif, remplacement et retrait confirmés. La prise de vue directe et l’affichage simultané dans la liste restent à faire. Voir [PHOTO-VEHICULE.md](PHOTO-VEHICULE.md). L’exemple d’une image de 12 Mo ramenée vers 100 Ko est une **cible indicative** : préserver une qualité utile et ne pas garantir ce poids pour chaque photo. Tester orientation, permissions, mémoire, stockage local et sauvegardes PWA/Android.

### 2.3 Champs et historique

Couleur ; compagnie d’assurance, numéro et échéance ; date et prix d’achat ; notes libres enrichies avec mise en forme basique ; historique des corrections de compteur avec qui, quand et pourquoi lorsque l’information est disponible. L’identité d’un intervenant ne doit pas imposer de compte obligatoire ; ne pas inventer de valeurs manquantes.

### 2.4 Multivéhicule et catalogue

Sélecteur visible en haut pour changer rapidement, avatar ou couleur par véhicule, dernier véhicule rouvert au lancement, vue combinée facultative. La sélection et le dernier véhicule existent déjà partiellement ; vérifier leur ergonomie. Recherche approximative (exemple « cio » → Clio), priorité aux choix déjà utilisés et mémorisation locale. Toujours permettre « Autre marque… » et « Autre modèle… », saisie libre, modèles personnels liés à leur marque et fonctionnement hors ligne ; ne pas imposer de génération.

## Priorité 3 — Carnet complet Android

### 3.1 Dépenses

Liste triable par date, catégorie et montant ; ajout avec date, catégorie, montant, description, kilométrage et photo de justificatif. Catégories : entretien, carburant, assurance, péage, stationnement, amende, contrôle technique, accessoire, autre. Demande d’un lien automatique entre un plein et une dépense carburant, avec mécanisme empêchant tout double comptage, y compris après modification, suppression et import/réimport. Devise paramétrable, euro par défaut. Un premier écran Android existe depuis beta.28 ; un justificatif photo par dépense est ajouté depuis beta.29 et PWA beta.4. Depuis beta.5, la PWA édite aussi le kilométrage facultatif. Devise et liaison sans double comptage restent à faire.

### 3.2 CQ et checklists

Modèles demandés : quotidien rapide (~5 points), hebdomadaire (~12), avant long trajet (20+), retour long trajet (~10), saisonnier (~15). Les six modèles déjà présents dans la PWA ne sont pas forcément ces nouveaux modèles : ne pas les écraser. Créer ses modèles, nommer et réorganiser les points par glisser-déposer ; lancer un contrôle, cocher chaque point, ajouter des notes et un résultat global (OK/à surveiller/action requise) ; historique par date/résultat. Points types : liquides, pneus, éclairage, freins, batterie, courroie visible, fuites, bruits, voyants, carrosserie, rétroviseurs, ceintures, sécurité et documents à bord. Préserver les statuts et anciens résultats compatibles PWA.

### 3.3 Symptômes

Date, description, catégorie (bruit, vibration, odeur, voyant, fuite, comportement, visuel, autre), sévérité et conditions ; statut actif/en diagnostic/résolu et date de résolution ; notes, photos et lien avec un entretien ; timeline par véhicule. Il s’agit d’une aide à l’organisation, pas d’un diagnostic mécanique. Les données importées sont déjà conservées ; l’écran Android reste à créer.

### 3.4 Documents

Types carte grise, assurance, contrôle technique, facture, permis et autre ; photo/scan via appareil ou galerie ; échéance et rappel automatique demandé ; galerie en miniatures, aperçu plein écran et zoom ; classement par type, date et véhicule. Préserver les documents historiques même s’ils n’ont pas les nouveaux champs. Vérifier l’espace disponible, les permissions et la confidentialité.

### 3.5 Enrichissement des écrans existants

- **Entretiens** : catégories détaillées, pièces (nom/référence/prix/fournisseur), main-d’œuvre ou fait soi-même, intervalles saisis par la personne ou suggérés d’après ses habitudes, modifiables, et rappel suivant facultatif.

**Rappels semi-automatiques par mémorisation des habitudes (décidé, non implémenté)**

*Décision du 2 novembre 2026.* L’application apprendra des intervalles de rappel saisis par l’utilisateur, par véhicule et par type d’entretien normalisé.

**Fonctionnement prévu :**
- À la saisie d’un entretien, si un profil existe pour ce véhicule et ce type (par exemple « Vidange » sur la Clio : 15 000 km / 12 mois), pré-remplir le rappel et activer par défaut l’interrupteur « Créer un rappel ». L’échéance proposée doit rester visible avant l’enregistrement.
- L’utilisateur confirme, modifie ou désactive le rappel à chaque fois. **Aucun rappel n’est créé silencieusement.**
- L’apprentissage est progressif : deux ou trois saisies cohérentes peuvent signaler une habitude répétée, sans prouver que l’intervalle est adapté au véhicule. Ce seuil est un repère à valider, pas une garantie de fiabilité mécanique. La première fois, ne rien proposer ou présenter une valeur générique clairement identifiée comme indicative ; elle ne doit pas être imposée ni créer de rappel sans choix explicite.
- La récurrence existante « fait → recalcul de l’échéance » est conservée et complétée : marquer un rappel « fait » proposera d’ouvrir un formulaire d’entretien pré-rempli, puis de reconduire le rappel suivant une fois l’entretien enregistré. Le parcours, encore à concevoir, doit éviter tout doublon avec le recalcul existant et préserver les données et l’échéance si l’utilisateur abandonne ou si l’enregistrement échoue.
- Étudier la normalisation des libellés et une liste de types courants : vidange, filtres, freins, courroie, pneus, contrôle technique, distribution, liquide de refroidissement, etc. La saisie libre et « Autre… » restent disponibles ; les rapprochements ambigus ne doivent pas être imposés.
- Utiliser la date et le compteur confirmés pour l’entretien, tenir compte d’une éventuelle correction du compteur et ne jamais réécrire silencieusement l’historique. La beta.26 permet de corriger le compteur sans modifier les anciennes entrées ; elle ne fournit pas d’historique détaillé des corrections.

**Ce qui est exclu :**
- **Pas de base de préconisations constructeur.** Les intervalles varient notamment selon l’année, la motorisation et l’usage ; VigieAuto ne remplace ni le carnet d’entretien du véhicule ni l’avis d’un professionnel.
- Pas de suggestion imposée, de valeur par défaut non confirmée ou de création silencieuse.
- Pas de connexion à un service externe de préconisations : les habitudes restent locales, sans compte ni serveur obligatoire.

**Données nécessaires :** envisager une table de profils d’entretien par véhicule : véhicule + type normalisé → intervalle en kilomètres et/ou mois, date de dernière observation et nombre d’observations. Schéma, modification ou suppression d’un profil, cas ambigus, calcul calendaire, migrations et échange manuel JSON avec la PWA restent à concevoir et à tester. Les entretiens et rappels existants ne seront pas modifiés rétroactivement.

**Positionnement :** phase 3 — Carnet complet, après le travail sur les véhicules ; ne pas attendre les essais sur téléphone pour avancer. Non inclus dans la phase 1, qui reste à valider avant d’être déclarée stable.

**Précision sur l’existant :** Android beta.26 et la PWA saisissent aujourd’hui la récurrence en **jours et/ou kilomètres**, pas en mois calendaires. Marquer un rappel récurrent « fait » recalcule l’échéance dans le rappel existant, sans créer une nouvelle fiche d’entretien ; les mois calendaires et le nouveau parcours restent à développer.

- **Pleins/recharges** : complet/partiel, prix unitaire et total, station mémorisée et calcul entre pleins complets incluant les partiels intermédiaires, sans mélanger litres et kWh. La saisie complet/partiel, prix et station existe déjà ; le suivi de consommation Android reste à relier à un écran et la mémorisation à compléter.
- **Rappels** : récurrence future tous les X mois ou X km, notifications locales et lien avec un entretien lors du marquage « fait ». La récurrence actuelle est en jours/km ; la récurrence calendaire en mois et les restrictions des notifications restent à traiter.
- **Trajets** : type domicile-travail/pro/loisir/vacances, conditions pluie/neige/nuit/bouchons, péages et notes. Des champs et trajets manuels existent déjà ; compléter sans écraser les valeurs importées.

<a id="enrichissement-carnet"></a>
### 3.6 Enrichissement du formulaire d’entretien (PWA candidate et Android beta.27)

Décision du 4 novembre 2026, après essai de la PWA 1.5.2-beta.1 installée depuis GitHub Pages sur Android, **selon le retour de l’utilisateur**. La comparaison avec Drivvo a fait apparaître des manques ergonomiques et fonctionnels à combler, d’abord dans la PWA puis dans Android. L’iPhone n’a pas pu être testé, faute d’appareil disponible. La décision initiale était documentaire ; **la PWA candidate 1.5.2-beta.2 en réalise depuis un premier lot**, détaillé dans [CARNET-PWA-BETA2.md](CARNET-PWA-BETA2.md). Le portage Android est disponible en beta.27 ; les essais réels restent à faire. Voir [CARNET-ANDROID-BETA27.md](CARNET-ANDROID-BETA27.md).

#### 3.6.1 Détail multi-pièces et multi-opérations

Avant la candidate PWA beta.2, le formulaire ne proposait qu’un coût global pour les pièces et un pour la main-d’œuvre : une révision avec distribution, pompe à eau et filtres obligeait à additionner et ne conservait pas ce détail. Android beta.26 conservait ce fonctionnement global ; beta.27 propose le détail.

**Comportement demandé :** bouton « + Ajouter une pièce / opération » ; chaque ligne comporte un libellé et un coût en euros et peut être supprimée par « × ». Le coût total des pièces est la somme des lignes ; la main-d’œuvre reste distincte et s’ajoute au total global. Plusieurs catégories peuvent être associées au même entretien.

**Toujours à préciser pour une prochaine évolution :** quantité par pièce (par exemple quatre bougies × 8 €) ou total saisi par ligne ; fournisseur ou référence par pièce facultatifs, pas obligatoires pour le premier lot.

#### 3.6.2 Sélection de catégorie plein écran, classée et verrouillée contre les fermetures accidentelles

Au clic sur « Catégorie », ouvrir une page plein écran superposée au formulaire. Une flèche « ← » et le bouton ou geste Retour du téléphone permettent d’en sortir ; **la sélection explicite d’une catégorie ferme aussi la vue**, conformément à la précision ultérieure. Le glissement vertical sert au défilement et ne doit pas déclencher volontairement la fermeture ; même objectif pour le glissement latéral. Recherche en haut avec filtrage en direct : hors recherche, afficher les familles et leurs en-têtes ; pendant la recherche, masquer ces en-têtes et rappeler la famille de chaque résultat. Prévoir « Autre… » pour une saisie libre mémorisée localement. Quand la recherche n’a aucun résultat, proposer en premier « Créer la catégorie “…” ».

Les catégories personnelles ne doivent pas être écrasées. Les gestes imposés par le navigateur ou le système ne sont pas tous interceptables de façon garantie ; préserver le brouillon et vérifier notamment Safari iOS et les gestes de retour réels. La PWA candidate et Android beta.27 fournissent ce sélecteur ; gestes système et Safari iOS restent à tester sur appareils réels.

#### 3.6.3 Liste de catégories organisée par familles

| Famille | Exemples de catégories |
|---|---|
| ⚙️ Moteur & échappement | Vidange huile, Courroie de distribution, Courroie d’accessoire, Bougies, Pompe à eau, Échappement, Turbo, Injecteurs |
| 🛑 Freinage | Plaquettes avant, Plaquettes arrière, Disques avant, Disques arrière, Liquide de frein, Tambours, Étriers |
| 🛞 Roues & suspension | Pneus saisonniers, 4 saisons ou hiver, Équilibrage, Géométrie / parallélisme, Amortisseurs, Rotules, Biellettes |
| 💧 Filtres & liquides | Filtre à air, Filtre habitacle, Filtre à carburant, Filtre à huile, Liquide de refroidissement, Liquide de direction, AdBlue |
| 💡 Visibilité & électricité | Balais d’essuie-glace, Ampoules, Batterie, Alternateur, Démarreur, Fusibles |
| ❄️ Climatisation | Recharge gaz, Nettoyage circuit, Filtre habitacle climatisé, Compresseur |
| 🔧 Transmission | Embrayage, Boîte de vitesses, Cardans, Soufflets, Huile de boîte |
| 📋 Contrôles & administratif | Contrôle technique, Contre-visite, Révision constructeur, Assurance |
| 🎨 Carrosserie & intérieur | Peinture, Pare-brise, Rétroviseur, Sellerie, Nettoyage complet |
| ➕ Autre | Saisie libre |

Liste à valider et compléter selon l’usage réel. Les anciennes catégories personnelles importées doivent être conservées et visibles dans « Autre » ou « Mes catégories ». Les emojis sont indicatifs ; leur accessibilité et leur rendu restent à vérifier. **Nomenclature complète des dix familles et toutes les catégories fournies :** [ENTRETIEN-FORMULAIRE-SPECIFICATION.md](ENTRETIEN-FORMULAIRE-SPECIFICATION.md#1-nomenclature-complète-proposée-par-lutilisateur).

#### 3.6.4 Lien vers une application de cartes

À côté de Lieu / Intervenant dans Entretien et Station dans Plein, proposer 📍 ou « Voir sur la carte ». Sur action explicite, transmettre le nom saisi à une application ou page de cartes : Google Maps ou carte par défaut sur Android, Apple Maps de préférence sur iPhone, avec Google Maps si installé selon les choix disponibles. Les liens `geo:` ou HTTPS sont des pistes techniques, pas une garantie de comportement identique sur chaque appareil.

La PWA candidate ouvre actuellement une recherche Google Maps sur action explicite, sans garantir l’application de cartes par défaut ni Apple Maps. Ne pas imposer de coordonnées, d’adresse supplémentaire, de GPS, de compte ou de clé d’API dans le carnet. Un nom ambigu peut donner plusieurs résultats. L’ouverture d’un service de cartes demande généralement Internet et **transmet le nom au fournisseur**, qui peut aussi recevoir l’adresse IP et d’autres données selon ses règles. Le code proposé et les différences Google/Apple sont détaillés dans [la spécification](ENTRETIEN-FORMULAIRE-SPECIFICATION.md#4-exemple-initial-javascript-pour-une-recherche-cartographique).

#### 3.6.5 Sous-types de carburant pour les pleins

La PWA candidate propose un sous-type libre, suggéré selon l’énergie actuelle du véhicule et les pleins précédents du même véhicule ; anciens pleins sans sous-type valides et non modifiés rétroactivement. Elle n’ajoute pas encore de sélecteur d’énergie par plein ; Android beta.27 propose le sous-type libre et les suggestions de charge pour les kWh.

| Énergie | Sous-types proposés |
|---|---|
| Gasoil | B7 (standard), B10, Excellium, V-Power Diesel, Ultimate Diesel, GNR |
| Essence | SP95, SP95-E10, SP98, Excellium 98, V-Power, Ultimate 98 |
| GPL | GPL |
| E85 | Superéthanol E85 |
| Électrique | Charge lente AC, Charge rapide DC, Supercharge |
| Hybride rechargeable | selon moteur essence ou diesel |

Le sous-type ne change pas automatiquement le calcul de consommation : comparaison éventuelle ultérieure. Les suggestions ne sont ni une recommandation de compatibilité ni une autorisation d’usage routier ; vérifier les prescriptions et la réglementation applicables.

#### 3.6.6 Compatibilité des données

**Objectif permanent à démontrer :** conserver le JSON v3 et la lecture des anciennes sauvegardes ; nouveaux détails, catégories multiples et sous-types facultatifs ; anciens entretiens globaux inchangés. Un entretien détaillé doit aussi conserver les totaux lisibles par les anciennes versions ; catégories et sous-types inconnus doivent être préservés à l’import/réexport, sans double comptage. Les anciennes sauvegardes restent à vérifier par restauration sur copie.

**Précision indispensable :** le JSON d’exemple français fourni est conceptuel et **non importable tel quel** : le format réel utilise `formatVersion` et `data.services`/`data.fills`, avec notamment `parts` et `labor`, pas les racines `version_schema` ou `entretiens`. L’application ancienne calcule le total depuis `parts + labor`. Les noms des extensions optionnelles de la candidate sont documentés dans [CARNET-PWA-BETA2.md](CARNET-PWA-BETA2.md). Des échanges fictifs PWA 1.5.1 et beta.1 ont été testés ; aucun nouvel aller-retour réel avec Android n’est revendiqué. Il serait prématuré de garantir toute compatibilité. Voir [l’exemple et les limites](ENTRETIEN-FORMULAIRE-SPECIFICATION.md#3-structure-json-proposée-par-lutilisateur--exemple-conceptuel) et [FORMAT-PONT.md](FORMAT-PONT.md).

#### 3.6.7 Priorité PWA avant Android

Pour **ces évolutions du carnet**, un premier lot est développé dans la PWA 1.5.2-beta.2 candidate et porté sur Android beta.27 ; essais réels à poursuivre. L’utilisateur indique que la candidate 1.5.2-beta.1 a été installée depuis GitHub Pages et que l’import de son JSON personnel s’est déroulé sans perte constatée ; ce retour n’est pas une certification indépendante de toutes les données. L’iPhone étant indisponible, revalider plus tard gestes Safari, écrans plein écran, ouverture des cartes et persistance locale. Le GPS natif puis Bluetooth autoradio sans OBD restent distinctement prévus avant l’essai en voiture ; le socle n’est pas déclaré stable.

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

- **Bluetooth autoradio assisté :** après le GPS natif, choix du périphérique déjà associé et du véhicule, propositions de démarrage puis d’arrêt/sauvegarde avec confirmations explicites ; GPS du téléphone, pas d’OBD ni beacon nécessaires. Facultatif et non implémenté ; restrictions d’arrière-plan, permissions et recours manuel à étudier/tester. [Détails](BLUETOOTH-GPS-VOITURE.md). NFC reste une piste distincte.
- **Partage familial** : export sélectif des véhicules/données, QR pour petits volumes, compatibilité PWA ; pas de synchronisation directe ou serveur obligatoire.
- **Flotte/entreprise** : plusieurs conducteurs, rapports km pro/perso et indemnités kilométriques, avec respect du stockage local.
- **Carnet d’adresses** : stations favorites (nom/adresse/prix moyen), garages (nom/téléphone/spécialité/notes), saisie manuelle locale.
- **Rappels intelligents** : estimation d’une échéance selon le rythme kilométrique et suggestions saisonnières, avec hypothèses explicites et réglages.
- **Tablette** : liste et détail côte à côte, navigation latérale sur grand écran.

## Règles permanentes

Français, application gratuite sans publicité, abonnement ou compte obligatoire ; base locale et utilisable hors ligne. GPS, Bluetooth, NFC et services en ligne sont facultatifs et consentis ; aucun traçage, OBD ou serveur n’est requis pour le carnet de base. Android et PWA ont des bases séparées : un import JSON confirmé **remplace** les données du destinataire, ce n’est pas une fusion. Vérifier et conserver séparément les sauvegardes avant mise à jour ou échange ; les fichiers ne sont pas chiffrés par l’application.

Ce document consigne une décision et une demande : **sa rédaction seule n’a implémenté aucune fonction**. La livraison beta.16 reste immuable et ne contient pas ce plan ajouté après sa publication ; le plan figure dans l’archive beta.17. À chaque nouvelle livraison, mettre à jour l’historique, le cahier des charges, les feuilles de route, le récapitulatif des fonctions et la checklist de performance ; garder les trois ZIP de projet prévus sans toucher aux sauvegardes personnelles.
