# Cahier des charges — VigieAuto

**Actualisation du 5 novembre 2026 — Android 0.4.0-beta.29 et PWA 1.5.2-beta.4 candidate :** une photo facultative par dépense, à ajouter depuis la liste après enregistrement ; aperçu, remplacement et retrait explicites. Android convertit les nouvelles photos en JPEG sans EXIF ; la PWA garde le fichier et ses métadonnées éventuelles. Sauvegardes JSON non chiffrées. Room 15, IndexedDB 4 et JSON v3 inchangés. Devise réglable et liaison plein/dépense sans double comptage restent à faire. [Détails, limites et confidentialité](JUSTIFICATIFS-BETA29.md). [Contrôles et limites des essais](VALIDATION-BETA29.md).

**Historique du 5 novembre 2026 — Android 0.4.0-beta.28 et PWA 1.5.2-beta.3 candidate :** premier lot dépenses Android : liste par véhicule, tri, total, ajout, édition, suppression avec Undo, kilométrage facultatif sans changer le compteur. La PWA candidate reprend les catégories et avertissements ; Room 15 et JSON v3 restent inchangés. Aucun lien automatique avec un plein ni détection des doublons ; photo de justificatif et choix de devise restent à développer. Sauvegarder chaque appareil avant import ou essai. [Détails et limites](DEPENSES-BETA28.md).

**Android beta.27 et PWA 1.5.2-beta.2 candidate — carnet enrichi :** lignes de pièces et total, catégories multiples avec sélecteur plein écran, sous-type libre et recherche Google Maps volontaire existent dans les deux préversions. JSON v3 et Room 15 restent inchangés. La PWA candidate utilise IndexedDB 4 : sauvegarde externe avant essai, sans retour direct à l’ancienne base. Les vérifications automatisées ne remplacent pas les essais Android réel ou Safari iOS. Voir [Android beta.27](CARNET-ANDROID-BETA27.md) et [PWA beta.2](CARNET-PWA-BETA2.md).

**Contrôles Android beta.27 :** suite JVM Linux 581 tests, **573 réussis et 8 ignorés** faute des anciennes fixtures, aucun échec ; 84 classes. Le nouveau parcours fictif Room → candidate PWA → Room → PWA a réussi séparément sous Chromium et WebKit Linux ; 7 tests Compose du formulaire ont réussi séparément. Aucun essai sur téléphone, émulateur, iPhone, Windows ou GitHub ni aucune mesure réelle de performances. Voir [CARNET-ANDROID-BETA27.md](CARNET-ANDROID-BETA27.md).

**État du produit : PWA familiale 1.5.1, candidate 1.5.2-beta.4 et Android 0.4.0-beta.29 · Mise à jour : 5 novembre 2026**

Ce document distingue les besoins exprimés de ce qui fonctionne réellement. Il évolue avec les décisions de l’utilisateur ; une idée, une étude ou une demande ne doit pas être marquée « réalisée » avant son développement et ses vérifications.

**Récapitulatif des demandes après beta.16 :** l’utilisateur détaille huit priorités, incluant un sous-lot distinct pour chacune des quatre catégories restantes, Undo immédiat, essais réels, finitions et CI/performance, correction de la précision numérique PWA, véhicule complet, carnet, statistiques, GPS facultatif, stations après le socle stable, confort et bonus. La création automatique d’une dépense liée à un plein doit éviter tout double comptage. Choix initial : terminer d’abord la phase 1 ; ordre actualisé en beta.26 ci-dessous. Les nouvelles demandes et leurs limites sont consignées dans [PLAN-PRIORITES-APRES-BETA16.md](PLAN-PRIORITES-APRES-BETA16.md) ; cette décision documentaire n’implémentait rien à elle seule ; le sous-lot Documents est ensuite traité en beta.17.

**Légende :** ✅ réalisé dans la version indiquée · 🟠 demandé ou envisagé, à étudier/développer · ❓ décision ou priorité à préciser. Les sections 2 à 6 décrivent les fonctions de la **PWA** ; les nouveaux détails du carnet sont spécifiques à la candidate beta.2, pas à 1.5.1 ; l’état distinct du projet **Android 0.4.0-beta.29** est précisé en sections 7 et 9.

**Décision carnet phase 3 :** multi-pièces, sélecteur plein écran, catégories, lien cartes et sous-types implémentés dans la candidate PWA beta.2 ; portés sur Android beta.27 ; compatibilité JSON vérifiée sur jeux fictifs et essais réels à poursuivre. Les dix familles et la proposition technique sont conservées dans [la spécification](ENTRETIEN-FORMULAIRE-SPECIFICATION.md).

## État beta.26 et progression

**Beta.26 — photo du véhicule actif :** depuis l’accueil, choisir dans le sélecteur système une image d’au plus 12 Mio ; l’application applique l’orientation EXIF lorsqu’elle est reconnue, la réduit en JPEG de 1 600 px au plus et 3 Mio au plus, sans recopier les métadonnées, puis affiche un aperçu. Remplacement et retrait sont confirmés et sans Undo ; la photo précédente n’est pas perdue si l’import échoue. Les photos importées illisibles ou trop grosses sont conservées. Room 15, JSON v3 et PWA ne changent pas ; aucune permission générale de galerie, caméra, GPS, Bluetooth ou réseau n’est ajoutée. Prise de vue directe et aperçus de tous les véhicules restent à faire. [Détails](PHOTO-VEHICULE.md).

**Décision actualisée du 4 novembre :** avancer par lots fonctionnels cohérents (véhicules, carnet, statistiques, puis GPS natif et Bluetooth d’autoradio assisté) sans attendre les essais sur téléphone. Le scénario d’autoradio déjà associé propose le démarrage, l’utilisateur confirme, le GPS du téléphone mesure vitesse, distance et durée ; la déconnexion propose l’arrêt et l’enregistrement, sans OBD ni démarrage silencieux. GPS et Bluetooth restent facultatifs, avec permissions au bon moment et recours manuel. Ce parcours est **à développer** ; voir [BLUETOOTH-GPS-VOITURE.md](BLUETOOTH-GPS-VOITURE.md). La phase 1 reste ouverte : ni les validations réelles ni la stabilité ne sont acquises.

Avant la correction EXIF : suite JVM complète **548 réussis et 8 ignorés**, lint zéro erreur/20 avertissements et 61 scénarios instrumentés compilés mais non exécutés. Après remplacement par AndroidX : APK debug compilé, **73/73 tests ciblés réussis** et pont photo fictif Android ↔ PWA stable et candidate vérifié sous Chromium. La suite complète et le lint n’ont pas été relancés après la correction ; la recompilation des instrumentés après correction n’est pas confirmée. Aucun essai Android beta.26 sur Windows, GitHub, émulateur ou téléphone.

## État du socle beta.25 — essai R8 isolé

**Beta.25 — essai R8 séparé :** une variante de recherche minifiée est préparée sous l’identifiant distinct `com.vigieauto.app.r8test`, avec le nom « TEST R8 - VigieAuto » et la clé de debug du poste ; elle possède sa propre base et ne met pas à jour l’installation habituelle `com.vigieauto.app`. La version debug normale et la release habituelle ne sont pas remplacées. Le contrôle statique du paquet ne prouve pas son fonctionnement réel : les sauvegardes, migrations et parcours sous R8 restent à tester sur appareil/émulateur avec des données fictives. Aucun serveur, migration Room ou changement JSON/PWA ; phase 1 toujours en cours. Voir [VALIDATION-R8.md](VALIDATION-R8.md).

## État du socle beta.24 — chargement prolongé

**Contrôles beta.25 :** l’APK `r8Test` isolé a été compilé et contrôlé statiquement, avec lint vital séparé sans anomalie ; taille locale **1 989 477 octets**, avec signature de debug, non représentative d’une release validée ou d’un AAB. La variante debug normale est compilée : **76 tests JVM ciblés réussis sur 76** (six classes, code non minifié), zéro ignoré ; pas de nouvelle suite JVM complète pour ce lot de configuration. Les 57 scénarios instrumentés debug sont compilés, non exécutés ; lint debug : zéro erreur et 17 avertissements. Tests Python : contrôleur R8 22/22, rapports CI 21/21, workflow 7/7, archiveur 19/19. Aucun essai réel de l’application R8, GitHub, Windows, émulateur, téléphone ou PWA pour ce lot.

**Beta.24 — chargement prolongé :** après 10 secondes de chargement, « Réessayer » est proposé aussi sur l’écran d’état et au-dessus d’un formulaire ouvert. Ce délai ne signifie pas que les données sont perdues et ne déclenche aucune reprise automatique. La tentative précédente doit se terminer avant une nouvelle lecture ; si elle ne peut pas être interrompue, la reprise peut continuer à attendre. Les formulaires restent en mémoire, mais un arrêt de l’application peut faire perdre une saisie non enregistrée. Aucun effacement de base ; Room 15, JSON v3 et PWA inchangés. Voir [LECTURE-DU-CARNET.md](LECTURE-DU-CARNET.md).

## État du socle beta.23 — lecture du carnet

**Contrôles beta.24 :** sous Linux, la suite JVM a compté **534 tests : 526 réussis, huit ignorés faute de fixtures de retour PWA, aucun échec**, sur 76 classes ; durée incrémentale 8 min 12 s hors compilation et téléchargements, non prédictive de Windows. Un contrôle tactile a ensuite été ajouté : les deux classes ViewModel/Compose ont été relancées séparément, **50/50 réussis** (42 + 8). En regroupant les rapports réels de la suite et de ce reciblage, le contrôleur valide 527 réussis et les mêmes huit ignorés ; ce n’est pas une seule suite de 535 tests. Aucun marqueur CloseGuard reconnu, sans preuve d’absence de fuite. APK debug et 57 scénarios instrumentés compilés ; instrumentés non exécutés. Lint : zéro erreur, 17 avertissements. Tests Python : rapports 20/20, workflow 6/6 et archiveur 18/18. Pas de nouveau parcours PWA, ni essai GitHub, Windows, émulateur ou téléphone pour ce lot.

**Beta.23 — lecture fiable du carnet :** chargement explicite, erreur sans données techniques privées et bouton « Réessayer » ; un état inconnu ou une surveillance interrompue ne sont plus présentés comme un carnet vide. Les modifications manuelles et la confirmation d’import sont bloquées jusqu’au retour d’une lecture fiable et de l’Undo. Les formulaires déjà ouverts restent en mémoire sous le message, sans garantie après arrêt du processus. Room 15 et JSON v3 inchangés ; PWA inchangée. Voir [LECTURE-DU-CARNET.md](LECTURE-DU-CARNET.md).

Suite JVM Linux beta.23 : **530 tests, 522 réussis, huit ignorés faute de fixtures PWA et aucun échec**, sur 76 classes. Lancement incrémental : 6 min 59 s, hors compilations et téléchargements ; ce temps ne prédit pas Windows. Le contrôleur accepte uniquement ces huit omissions attendues ; aucun marqueur CloseGuard reconnu, sans preuve d’absence de fuite. Aucun nouveau parcours PWA n’a été exécuté pour ce lot. Les tests Python réussissent : rapports 19/19, workflow 6/6, archiveur 18/18. APK debug, tests JVM et 57 scénarios instrumentés compilés ; scénarios instrumentés non exécutés. Lint : 0 erreur et 17 avertissements.

## État du socle beta.22 — fiabilisation des tests

La fermeture des ressources du processus simulé de navigation est désormais ordonnée : Activity, ViewModel, scope applicatif, puis base Room. Trois tests couvrent cet ordre, la recréation d’Activity et un nettoyage applicatif en cours. Le point d’entrée Hilt est limité aux sources debug ; la base normale reste liée au processus. Deux avertissements CloseGuard reproduits avant correction ne sont pas réapparus sur deux lancements ciblés ; le contrôleur les signale de manière non bloquante. Cette détection n’est pas exhaustive et ne prouve pas l’absence de fuite sur appareil. Aucun changement métier, base Room 15 ou JSON v3 ; voir [TESTS-RESSOURCES.md](TESTS-RESSOURCES.md).

517 tests JVM réussis sur 75 classes, aucun échec ni ignoré, avec huit fixtures fictives de pont réutilisées depuis les validations PWA antérieures ; aucun marqueur CloseGuard reconnu. APK debug et 57 scénarios instrumentés compilés, sans exécution instrumentée ; lint 0 erreur et 17 avertissements. Windows beta.22, émulateur, téléphone et GitHub non testés ici ; pas de mesure de performance ni de phase 1 déclarée terminée.

## État du socle beta.21 — CI préparée

**Beta.21 — CI préparée :** un workflow GitHub Actions compile Android, lance lint et la suite JVM, puis vérifie les rapports. Huit retours de pont sans PWA sont annoncés ignorés, jamais comptés comme réussis ; toute autre omission inattendue bloque le contrôle. Deux émulateurs API 26/36 peuvent être demandés manuellement, avec comparaison des 57 scénarios attendus. Les actions sont épinglées, aucun secret ni APK n’est publié, et les noms d’export habituels sont ajoutés à `.gitignore` sans remplacer une vérification manuelle. Le workflow n’a pas encore tourné sur GitHub ; les émulateurs et téléphones ne sont pas testés ici. Aucun changement métier Android, Room 15 et JSON v3 inchangés ; PWA familiale 1.5.1 et candidate 1.5.2-beta.1 inchangées. La phase 1 reste ouverte. Voir [CI-VERIFICATIONS.md](CI-VERIFICATIONS.md). La suite JVM locale recense 514 tests sur 75 classes : **506 réussis, huit ignorés faute de fixtures PWA et aucun échec** ; les rapports réels ont été contrôlés. APK debug et 57 scénarios instrumentés compilés ; lint : 0 erreur et 17 avertissements. Les tests de scripts passent (rapports 17/17, workflow 6/6 et archiveur 16/16), ainsi que l’analyse statique actionlint. Deux avertissements CloseGuard SQLite/Room subsistaient alors dans une simulation ; voir le diagnostic beta.22 ci-dessus.

## État du socle beta.20 et PWA candidate

**Beta.20 / PWA 1.5.2-beta.1 candidate :** les nombres très précis des extensions restent numériques et sont réexportés sans arrondi dans les scénarios testés. Un nombre fonctionnel trop précis ou trop grand est refusé avant remplacement ; les données déjà arrondies ne peuvent pas être reconstituées. Le thème et les propriétés supplémentaires des points CQ édités sont préservés. Base PWA IndexedDB 2→3 ; retour direct à 1.5.1 sur la même base bloqué. La PWA 1.5.1 demeure la référence familiale jusqu’aux essais réels ; aucun iPhone n’a été testé. Room 15 et JSON v3 inchangés côté Android. Voir [PRECISION-SAUVEGARDES.md](PRECISION-SAUVEGARDES.md).

Deux tests ciblés Android `PrecisionBridgeTest` réussis par Gradle (retour Chromium), retour WebKit contrôlé séparément par Gradle dans Room, 30 tests unitaires PWA, parcours d’interface et migration 1.5.1 → candidate testés sur Chromium et WebKit automatisés, sept scénarios consommation et archives Android/PWA 15/15 chacune. APK debug beta.20 et 57 scénarios instrumentés compilés ; lint 0 erreur/17 avertissements. Aucun scénario instrumenté n’a été exécuté. La suite Android complète beta.20, Windows beta.20 et les appareils réels ne sont pas revendiqués. Une première tentative Gradle a perdu son daemon ; les contrôles ciblés séparés ont ensuite réussi, sans diagnostic certain ni gain Windows mesuré. La phase 1 reste ouverte.

## État du socle beta.19

✅ Room 15 et migration 14→15 : suppression immédiate des entretiens, pleins, trajets et rappels ; image typée relue et conservée dans la même transaction, restauration complète dans une autre transaction. Une seule annulation, au moins 10 secondes au premier plan ; reprise après réouverture avant 24 h. Une deuxième suppression réussie ou un import réussi invalide l’annulation précédente ; export sans élément supprimé. Conflits d’identifiant, véhicule recréé et second trajet actif refusés ; sauvegarde externe indispensable. Voir `UNDO-CARNET.md` et `MIGRATION-V14-V15.md`.

512 tests JVM sur 74 classes réussis, sans échec ni ignoré, avec sept fichiers fictifs ; lint 0 erreur/17 avertissements. La suite incrémentale Linux a pris 7 min 35 s, hors compilations initiales et génération des fixtures ; ce temps ne prédit pas Windows. Pont fictif Undo Room → vraie PWA Chromium → Room vérifié ; PWA 20/20, consommation 7/7, archiveurs Android 14/14 et PWA 11/11. APK debug compilé et 57 scénarios instrumentés compilés mais non exécutés sur appareil ou émulateur. Trois avertissements CloseGuard SQLite/Room en tests simulés restent à diagnostiquer ; aucun essai Windows beta.19 ni benchmark physique. `forkEvery=1` inchangé. La phase 1 reste ouverte : essais physiques, finitions, CI/R8/profils et mesures, précision PWA. Ces contrôles ne constituent pas une garantie sur tous les téléphones.

## État du socle beta.18

✅ Room 14 : trois migrations séparées 11→12 (modèles CQ), 12→13 (contrôles effectués) et 13→14 (réglages). Chaque migration valide, écrit, relit dans SQLite et compare avant de retirer les anciens blocs de sa collection, en transaction. Les onze collections reconnues sont désormais reconstruites depuis des champs ou nœuds typés et leurs seules valeurs/extensions, sans copie JSON complète auxiliaire. Les projections et la table historique `compat_chunks` restent dans le schéma ; des blocs pour valeurs longues et pièces jointes restent nécessaires. Aucun nouvel écran ni modification du format JSON v3 ou de la PWA 1.5.1. 490 tests JVM sur 72 classes réussis, zéro échec ni ignoré, avec sept fichiers fictifs ; lint 0 erreur/17 avertissements. La suite incrémentale a pris 9m 28s sous Linux, hors compilation initiale et génération des fixtures ; cette durée ne prédit pas le temps Windows. APK debug compilé et 54 scénarios instrumentés compilés mais non exécutés sur appareil ou émulateur. Aucun essai Windows beta.18 ni benchmark physique ; `forkEvery=1` inchangé.

⚠️ Les tests réels de la PWA sous Chromium confirment deux limites : les nombres JSON très grands ou précis peuvent être arrondis, et changer de thème peut supprimer les propriétés inconnues du réglage `theme`. L’édition PWA des points CQ peut également reconstruire leurs objets et perdre leurs extensions. Ces limites subsistent dans la PWA 1.5.1 ; la candidate les traite dans les scénarios testés. Conserver les sauvegardes originales et les vérifier avant tout échange.

🟠 À l’étape beta.18, Undo immédiat transactionnel, validation sur émulateur puis téléphone, finitions, CI/R8/profils et mesures, et fidélité numérique PWA restaient à faire. Ces onze catégories concernent le rangement des données, pas un pourcentage d’avancement de l’application.

## État du socle beta.17

✅ Room 11 : les documents rejoignent les sept collections déjà typées comme huitième source complète ; migration 10→11 transactionnelle, contrôle et relecture SQLite puis comparaison avant retrait des anciens blocs complets. Les pièces jointes longues restent découpées et vérifiées ; trois collections conservent leur JSON complet auxiliaire. 428 tests JVM réussis sans échec ni ignoré avec cinq fichiers fictifs ; lint 0 erreur/17 avertissements. 59 tests ciblés réussis. APK debug et 39 scénarios instrumentés compilés ; aucun scénario instrumenté n’a été exécuté sur appareil ou émulateur. Aucun benchmark physique ; Undo immédiat et trois sous-lots restent à réaliser ; sauvegarde externe vérifiée indispensable.

🟠 À cette étape restaient trois collections, les tests instrumentés sur appareil et la suppression immédiate avec Undo. Pas d’écran Documents Android ajouté ; JSON v3 et PWA 1.5.1 inchangés.

## État du socle beta.16

✅ Room 10 : les symptômes rejoignent véhicules, interventions, pleins/recharges, trajets, rappels et dépenses comme septième source complète typée ; migration 9→10 transactionnelle, contrôle et relecture SQLite puis comparaison avant retrait des anciens blocs complets des symptômes. Quatre collections conservent leur JSON complet auxiliaire. 395 tests JVM réussis sans échec ni ignoré avec quatre fichiers fictifs ; lint 0 erreur/17 avertissements. 126 tests ciblés réussis. APK debug et 34 scénarios instrumentés compilés ; aucun scénario instrumenté n’a été exécuté sur appareil ou émulateur. Aucun benchmark physique ; Undo immédiat encore à faire ; sauvegarde externe vérifiée indispensable.

🟠 À cette étape, restaient quatre collections, les tests instrumentés sur appareil et la suppression immédiate avec Undo. Pas d’écran symptômes Android ajouté ; le format JSON reste v3, la PWA 1.5.1 est inchangée.

## État du socle beta.15

✅ Room 9 : les dépenses rejoignent véhicules, interventions, pleins/recharges, trajets et rappels comme sixième source complète typée ; migration 8→9 transactionnelle, contrôle et relecture SQLite puis comparaison avant retrait des anciens blocs complets des dépenses. Cinq collections conservent leur JSON complet auxiliaire. 365 tests JVM réussis sans échec ni ignoré avec quatre fichiers fictifs ; lint 0 erreur/17 avertissements. 116 tests ciblés réussis. APK debug et 29 scénarios instrumentés compilés ; aucun scénario instrumenté n’a été exécuté sur appareil ou émulateur. Aucun benchmark physique ; Undo immédiat encore à faire ; sauvegarde externe vérifiée indispensable.

🟠 À cette étape, restaient cinq collections, les tests instrumentés sur appareil et la suppression immédiate avec Undo. Pas d’écran dépenses Android ajouté ; le format JSON reste v3, la PWA 1.5.1 est inchangée.

## État du socle beta.14

✅ Room 8 : les rappels rejoignent les véhicules, interventions, pleins/recharges et trajets comme sources complètes typées ; migration 7→8 transactionnelle, contrôle et relecture SQLite puis comparaison avant retrait des anciens blocs complets des rappels. Six collections conservent leur JSON complet auxiliaire. 337 tests JVM réussis sans échec ni ignoré avec quatre fichiers fictifs ; lint 0 erreur/17 avertissements. 84 tests ciblés réussis. APK debug et 25 scénarios instrumentés compilés ; aucun scénario instrumenté n’a été exécuté sur appareil ou émulateur. Aucun benchmark physique ; Undo immédiat encore à faire ; sauvegarde externe vérifiée indispensable.

🟠 À cette étape, restaient six collections, les tests instrumentés sur appareil et la suppression immédiate avec Undo. Le format JSON reste v3, la PWA 1.5.1 est inchangée.

## État du socle beta.13

✅ Room 7 : véhicules, interventions, pleins/recharges et trajets ont une source complète typée ; migration 6→7 transactionnelle avec vérification, relecture SQLite et comparaison avant retrait des anciens blocs des trajets. Sept collections gardent leur JSON complet auxiliaire. 304 tests JVM réussis sans échec ni ignoré avec quatre fichiers fictifs ; lint 0 erreur/17 avertissements. 34 tests ciblés réussis. APK debug et 21 scénarios instrumentés compilés ; aucun scénario instrumenté n’a été exécuté sur appareil ou émulateur. Aucun benchmark physique ; Undo immédiat encore à faire ; sauvegarde externe vérifiée indispensable.

🟠 À cette étape, restaient sept collections, les tests instrumentés sur appareil et la suppression immédiate avec Undo. Le format JSON reste v3, les données GPS manuelles atypiques déjà acceptées sont préservées, la PWA 1.5.1 est inchangée.

## État du socle beta.12

✅ Room 6 : véhicules, interventions et pleins/recharges complets typés ; migration 5→6 transactionnelle, relecture de SQLite et comparaison avant retrait des anciens blocs complets des pleins. Huit collections gardent leur JSON complet auxiliaire. 270 tests JVM réussis, sans échec ni ignoré avec les fichiers fictifs ; lint 0 erreur/17 avertissements. 108 tests ciblés réussis ; 17 tests instrumentés compilés, non exécutés sur appareil ou émulateur ; aucune mesure physique. Undo immédiat encore à faire ; sauvegarde externe vérifiée indispensable.

🟠 À cette étape, restaient huit collections, les tests instrumentés sur appareil et la suppression immédiate avec Undo. Le format JSON reste v3 et la PWA 1.5.1 n’est pas modifiée.

### Retour Windows beta.11 après livraison

Sur le Windows de l’utilisateur, la commande `:app:assembleDebug :app:testDebugUnitTest` présentée comme beta.11 a terminé par `BUILD SUCCESSFUL` en 24 min 27 s, avec 25 tâches exécutées et 27 à jour. L’extrait ne précise ni le nombre de tests réussis ou ignorés, ni la durée des tâches ; lint et tests instrumentés ne figuraient pas dans la commande. Pour le lancement correspondant au rapport Windows de 270 tests, l’utilisateur indique **25 min 26 s** au total : 266 tests réussis, 4 ignorés, aucun échec, et 11 min 19,12 s de durée cumulée des classes. Le rapport contient `CompleteFillCodecTest`, `RoomCompleteFillTest` et `RoomMigrationV6Test`, absents de la beta.11 livrée et présents en beta.12 ; le dossier Windows actuel indique beta.12 (code 16). La durée précédemment indiquée de 24 min 27 s ne doit pas être attribuée à ce rapport sans autre précision. La lecture du numéro de version ne prouve pas que tous les fichiers soient identiques au ZIP livré. La durée doit être analysée et réduite sans masquer de tests ni modifier l’isolation sans validation.

## État du socle beta.11

✅ Room 5 : véhicules et interventions complets typés ; migration 4→5 transactionnelle, relecture et comparaison avant retrait des anciens blocs des interventions. Neuf collections gardent leur JSON complet auxiliaire. 244 tests JVM réussis, sans échec ni ignoré avec les jeux de pont fictifs ; lint 0 erreur/17 avertissements. 72 tests ciblés réussis ; tests instrumentés compilés mais non exécutés sur appareil ou émulateur ; aucune mesure physique. Undo immédiat encore à faire ; sauvegarde externe vérifiée indispensable.

🟠 À cette étape, restaient neuf collections, les tests instrumentés sur appareil et la suppression transactionnelle immédiate avec Undo. Le format JSON reste v3 et la PWA 1.5.1 n’est pas modifiée.

## État du socle beta.10

✅ Room 4 : véhicules complets typés, migration 3→4 transactionnelle avec contrôle de fidélité ; 10 autres collections encore en JSON complet auxiliaire. 224 tests JVM réussis sans échec ni ignoré, avec les jeux de pont fictifs ; lint 0 erreur/17 avertissements. Tests instrumentés compilés mais non exécutés sur appareil/émulateur ; aucune mesure physique.

🟠 À cette étape, les dix autres collections restaient à migrer vers des sources complètes typées, ainsi que la suppression immédiate avec Undo fiable. Des tests sur appareil et des sauvegardes externes vérifiées restent indispensables ; le repli Room 4→3 n’est pas automatique. Le format JSON reste v3 et la PWA 1.5.1 n’est pas modifiée.

## État du socle beta.9

✅ Correctif ciblé des tests Robolectric/Room sur Windows x64 : mode natif et attente de l’arrêt des flux du ViewModel ; aucun test désactivé. Deux commandes de test ont depuis réussi sur le Windows de l’utilisateur, sans garantie d’absence définitive d’un incident intermittent ; voir `TESTS-WINDOWS.md` dans les sources Android. Le schéma et les fonctions disponibles ne changent pas.

✅ Identité `com.vigieauto.app` fixée ; navigation des écrans existants par routes Kotlin sérialisables et Navigation Compose. Résultats succès/erreur harmonisés au bord du ViewModel, avec annulation coroutine propagée ; état et signatures des dépôts restent à harmoniser complètement. Une garde de fidélité JSON prépare la migration.

⚠️ La PWA familiale 1.5.1 peut arrondir des nombres précis. La candidate 1.5.2-beta.1 les préserve dans les extensions testées ou refuse les champs fonctionnels non fiables ; essais iPhone réels encore nécessaires. Garder les originaux.

🟠 À l’étape beta.9, la priorité était de créer des tables typées **complètes** pour les 11 collections, import et export reconstruits depuis elles, puis retrait sûr des JSON complets auxiliaires ; suppression transactionnelle immédiate et vrai Undo après suppression. En beta.9, le JSON complet restait la source des 11 collections ; en beta.10, les seuls véhicules avaient basculé ; en beta.11, les interventions ont suivi ; en beta.12, les pleins ; en beta.13, les trajets ; en beta.14, les rappels ; en beta.15, les dépenses ; en beta.16, les symptômes ; en beta.17, les documents. La suppression reste différée. Exécuter les migrations instrumentées et le pont complet sur des appareils de test. Voir `PLAN-MIGRATION-TYPEE.md` dans le projet Android.

## 1. Vision et contraintes

- Carnet de bord automobile gratuit, en français, simple sur téléphone, utilisable avec plusieurs véhicules et inspiré des fonctions de suivi de Drivvo, sans en reprendre le fonctionnement au détriment des besoins de l’utilisateur.
- Sans publicité ni abonnement, sans compte obligatoire dans VigieAuto. Données de l’application stockées localement sur l’appareil ; pas de télémétrie ni de synchronisation imposée.
- PWA installable et utilisable hors ligne **après une première visite et mise en cache**. Le stockage et le cache du navigateur peuvent être supprimés : une sauvegarde externe reste indispensable.
- Interface responsive et contrastée, lisible sur Android et les autres écrans compatibles. Projet statique HTML/CSS/JavaScript, IndexedDB, manifest et service worker ; ces technologies peuvent évoluer si l’utilisateur approuve une évolution d’architecture.
- Pour la base, pas de GPS ni d’OBD imposés. Le GPS des trajets est désormais facultatif et local ; une éventuelle copie cloud personnelle reste envisagée, non réalisée et ne doit pas devenir obligatoire.

## 2. Identité, apparence et navigation

| Exigence | État et critères actuels |
|---|---|
| Nom **VigieAuto** et logo bouclier + voiture + coche fourni par l’utilisateur | ✅ Image originale conservée dans `assets/logo-original.png`, icônes PNG dérivées de l’image corrigée sans bord blanc ajouté ; logo SVG retracé qui suit la couleur du thème. L’OS peut adapter l’icône sur l’écran d’accueil. |
| Sauge clair/sombre et Cyan clair/sombre selon le téléphone | ✅ Sélection et changement système en direct ; préférence locale et présente dans les sauvegardes réelles. Cyan conserve une carte véhicule sombre. |
| Ancien mode mixte | ✅ « Automatique (mixte) » : Sauge clair / Cyan sombre, pour compatibilité. |
| Cinq onglets mobiles | ✅ Accueil, Entretien, Pleins, Trajets, Réglages. Les contrôles **CQ** restent accessibles directement en haut ; le **+** central donne les ajouts rapides et « … » les autres rubriques. |
| Accueil pratique | ✅ Véhicule actif, rappels fondés sur les données, contrôle suggéré et bouton de trajet manuel. Les exemples sont identifiés comme fictifs. |
| Retours de design | ✅ Proposition 1 écartée ; présentation de 2 retenue avec les palettes Sauge/Cyan appréciées. Les propositions devenues inutiles sont supprimées, pas le code actuel. |

## 3. Fonctions du carnet

| Domaine | Exigences et état |
|---|---|
| Véhicules | ✅ Créer, modifier, sélectionner et supprimer plusieurs véhicules ; identité, énergie, kilométrage, photo et notes. Supprimer un véhicule supprime ses données associées. |
| Suggestions véhicule | ✅ Référentiel commun v1 hors ligne : 48 marques, 432 modèles et 7 énergies. Recherche sans casse/accents, modèles par marque, saisie libre, « Autre… », mémoire locale et derniers choix ; jamais de générations imposées. Année facultative, kilométrage obligatoire. Exemple Clio proposé explicitement sans kilométrage inventé. |
| Entretien | ✅ Ajouter et modifier interventions, dates, kilométrages, coûts et échéances facultatives ; rappels définis par la personne selon le constructeur. 🟡 Dans la candidate PWA beta.2 : détail multi-pièces, sélecteur de catégories et lien Google Maps volontaire ; portés sur Android beta.27, mais pas encore validés sur appareils réels. Voir [§3.6](PLAN-PRIORITES-APRES-BETA16.md#enrichissement-carnet). |
| Pleins et consommation | ✅ Historique carburant/recharges ; calcul entre pleins complets incluant les pleins partiels et excluant les intervalles incohérents. Litres et kWh ne sont pas mélangés. Les recharges électriques nécessitent deux charges complètes cohérentes ; suivi séparé de l’hybride rechargeable non implémenté. 🟡 Candidate PWA beta.2 : sous-types libres et suggestions par véhicule, lien Google Maps volontaire ; portés sur Android beta.27, mais pas encore validés sur appareils réels. Voir [§3.6](PLAN-PRIORITES-APRES-BETA16.md#enrichissement-carnet). |
| Dépenses et statistiques | ✅ Coûts saisis, totaux et historique. Coût énergétique moyen au kilomètre issu des intervalles valides ; les chiffres ne garantissent pas le coût complet de possession. |
| Rappels | ✅ Échéances par date et/ou kilométrage, récurrence en jours et/ou kilomètres et affichage dans l’application. 🟠 Mémorisation des habitudes par véhicule et type d’entretien : pré-remplissage du rappel à la saisie, confirmation explicite, pas de base constructeur ; récurrence en mois calendaires à développer. ❌ Pas de notification garantie lorsque l’application est fermée. |
| Contrôles qualité | ✅ Six listes de départ, listes personnalisables, exécution et historique ; accès CQ direct. |
| Symptômes | ✅ Journal d’observations et informations de prudence. ❌ Pas de diagnostic automatisé ; en cas de doute de sécurité, consulter un professionnel. |
| Documents | ✅ Images et PDF stockés localement, 5 Mo maximum par fichier, inclus dans les sauvegardes. ❌ Rattachement à une intervention précise non réalisé. |
| Export/import | ✅ Export JSON complet non chiffré, import validé et confirmé qui remplace atomiquement les données. Les sauvegardes CQ Auto compatibles sont acceptées. |

## 3 bis. Module futur Stations & Prix carburants

- **Stations & Prix carburants (futur Android)** : afficher les stations autour de l’utilisateur avec les prix officiels des carburants. Localisation ponctuelle à l’ouverture de la carte, objectif sans pistage par VigieAuto, source open data gouvernementale, fonctionnement partiel hors ligne. **Statut : spécifié, non implémenté**, après le socle 0.4.0 stable ; aucun changement de la PWA n’est prévu par cette fiche. Voir [`module-stations-carburants.md`](module-stations-carburants.md).
- La confidentialité des services réseau de carte, de recherche et de données devra être vérifiée : ils reçoivent notamment l’adresse IP et la zone demandée peut être déduite des tuiles ; un GPS externe reçoit les données nécessaires à l’itinéraire. Une carte ou une recherche de ville hors ligne exige ses propres données locales, distinctes du cache de prix.

## 4. Module Trajets

### Disponible actuellement

- ✅ Trajet saisi après coup ou chronomètre démarré et terminé manuellement ; date et distance saisie, durée modifiable, nom, départ, arrivée et notes facultatifs.
- ✅ Historique et filtre par type pour le véhicule ; un chronomètre en cours reste associé au véhicule de départ et peut être retrouvé après rechargement.
- ✅ Trois types **déclarés** par l’utilisateur : trafic haché, roulant, croisière. Ils ne mesurent pas une grandeur mécanique.
- ✅ Estimation indicative du coût énergétique du trajet si les pleins fournissent une moyenne cohérente. Ce n’est pas une consommation mesurée et l’estimation peut évoluer avec l’historique des pleins.
- ✅ GPS de premier plan **facultatif** : explication, choix et autorisation ; estimation de la distance, arrêt/pause, correction manuelle à la fin et signalement des interruptions détectées. La page masquée ne mesure pas ; la reprise après fermeture/rechargement/import demande une action à l’arrêt.
- ✅ Les coordonnées et la trace GPS ne sont pas enregistrées automatiquement : seul un résumé est conservé. Les textes de départ/arrivée ajoutés par l’utilisateur peuvent naturellement contenir des informations personnelles.
- ⚠️ Distance et durée approximatives, suivi continu écran éteint/application fermée non garanti ; l’obtention d’une position sans Internet dépend du téléphone. Ne pas utiliser le téléphone en conduisant.
- ❌ Bluetooth et NFC ne sont pas activés dans la version actuelle.

### Demandé ou proposé pour la suite

- 🟠 Tester le GPS sur le téléphone réel : précision, interruptions, consommation de batterie, signal et permission. Ajuster les filtres si nécessaire ; les catégories de mouvement automatiques ne sont pas réalisées.
- 🟠 Déclenchement par Bluetooth associé au véhicule ou badge NFC, pour éviter les trajets attribués au mauvais véhicule. Étudier la faisabilité réelle et le recours manuel : **un déclenchement silencieux universel ne peut pas être promis en PWA**.
- 🟠 Statistiques et filtres étendus, trajets récurrents et questions facultatives adaptées au véhicule sur la charge, la climatisation ou une opération déclarée.
- ❓ Score éco : souhait non arbitré. S’il est retenu, définir une méthode transparente et testée ; ne pas présenter un score comme un diagnostic.
- ❓ Fréquence des questions à l’arrivée et ordre de réalisation à préciser. Le choix initial est de conserver uniquement un résumé ; toute trace précise exigerait un nouveau choix explicite.

Les limites de faisabilité sont détaillées dans `plan-trajets.md`. Le GPS seul ne détermine ni l’état des injecteurs/EGR, ni la consommation réelle d’un trajet, ni la cause d’une panne.

## 5. Sauvegardes et confidentialité

- ✅ Sauvegarde JSON manuelle et restauration après confirmation ; le JSON n’est pas chiffré. Garder régulièrement une copie dans un emplacement sûr **hors du téléphone** et vérifier sa restauration.
- 🟠 Rappel de sauvegarde dans l’application, éventuellement après 30 jours, proposé mais non réalisé. Un téléchargement démarré ne prouve pas qu’une copie externe est disponible.
- 🟠 Sauvegarde automatique dans un dossier choisi et/ou Google Drive personnel demandée. À étudier séparément : permissions, réussite/échec visibles, compatibilité, accès éventuellement redemandé, copie manuelle de secours et confidentialité. Une option Drive nécessite une connexion et les autorisations du service ; elle ne serait pas 100 % locale/hors ligne et doit rester facultative.
- 🟠 PDF d’entretien proposé ; il ne remplacerait pas une sauvegarde JSON complète et restaurable.
- ❌ Aucune sauvegarde automatique ni synchronisation Drive n’est actuellement opérationnelle.

## 6. Compatibilité, fiabilité et tests

- ✅ La base IndexedDB conserve son nom interne historique ; migration vers sa version 2 avec collection `trips`. Le manifest conserve son identité et sa portée pour la mise à jour sur la même origine.
- ✅ Les sauvegardes CQ Auto/VigieAuto au format 1 et VigieAuto au format 2 sont importables ; VigieAuto exporte au format 3. Les anciennes versions ne savent pas forcément lire la nouvelle base ou les nouvelles sauvegardes : sauvegarder avant migration et ne pas effacer le stockage pour forcer une mise à jour.
- ✅ Tests automatisés : calculs GPS et métier ; thèmes ; navigation et formulaires ; trajets, plusieurs véhicules, permissions/interruptions GPS simulées ; imports/exports, données invalides, suppression et hors-ligne. Migrations réelles depuis les ZIP 1.3.2 et 1.4.0 et sous-dossier testées dans Chromium automatisé ; formulaire et coupure serveur aussi testés avec WebKit automatisé (pas sur un iPhone réel) ; l’API Geolocation de Chromium est aussi exercée avec une position émulée.
- ✅ L’utilisateur indique avoir effectué l’installation/publication Android. Les détails des essais ne sont pas rapportés ici. 🟠 La version 1.5.1 et son GPS restent à publier au même emplacement puis à tester sur son téléphone réel ; l’aperçu de la conversation n’est pas un hébergement permanent.
- ❌ La PWA ne comprend ni OBD, OCR, carte des stations, import Drivvo, synchronisation multi-appareils ou diagnostic automatique. L’APK de contrôle du socle Android est distinct et n’est pas une version de publication.

## 7. Deux branches : Android natif et PWA familiale

- ✅ L’utilisateur retient **Kotlin + Jetpack Compose pour Android** et conserve la PWA pour le carnet familial sur iPhone. Les deux bases sont indépendantes ; leur échange est un JSON manuel, sans synchronisation ni serveur obligatoire.
- ✅ Android 0.3.0 : création/sélection de véhicules et suggestions libres ; correction explicite du kilométrage ; ajout, modification et suppression confirmée des entretiens, rappels, pleins/recharges et trajets manuels. Un entretien peut créer un rappel dans la même transaction. Les listes sont limitées au véhicule actif et le compteur augmente si une intervention ou un plein indique une valeur supérieure.
- ✅ Rappels par date et/ou kilométrage, seuils et récurrence en jours et/ou kilomètres, affichés dans l’app ; action « fait » avec prochaine échéance calculée dans le rappel existant depuis la date et le compteur actuels. La récurrence en mois calendaires et la mémorisation des habitudes restent à développer. ❌ **Aucune notification lorsque l’application est fermée.**
- ✅ Trajet passé ou chronomètre manuel persisté : distance à saisir et durée corrigeable. Un trajet GPS PWA importé en cours est marqué interrompu et peut être terminé manuellement sans relance du GPS. ❌ GPS natif, Bluetooth et NFC non implémentés.
- ✅ Import des exports PWA formats 1, 2 et 3, conservation des photos, documents et champs supplémentaires, export format 3 ; import après confirmation et transaction. Les éditions conservent les champs supplémentaires des entrées. En 0.3.0 le schéma restait v2 ; 0.4.0-alpha.1 introduit Room v3 et des projections typées avec blocs de compatibilité sans réécriture des JSON. Voir `MIGRATION-V2-V3.md`.
- ✅ Beta.7 : édition de la fiche du véhicule actif (marque, modèle, année, énergie, finition, immatriculation, VIN, notes) en conservant compteur, photo, données liées et propriétés non exposées ; contrôle de conflit et transaction. ✅ Beta.26 : choix, remplacement et retrait confirmés de la photo du véhicule actif. 🟠 Prise de vue directe, suppression de véhicule et autres champs enrichis restent à développer.
- 🟠 La saisie complète des CQ, symptômes, documents et statistiques Android reste à développer. Un premier écran dépenses existe depuis beta.28 et les justificatifs photo depuis beta.29 ; devise et lien sans double comptage restent à faire. La PWA 1.5.1 reste plus complète pour ces rubriques. Sauvegarder les deux côtés avant chaque import qui **remplace** le destinataire ; pas de fusion.
- ✅ Le build Android 0.2.0 a réussi sur le PC de l’utilisateur après création de `local.properties`. Android 0.3.0 est construit et testé en environnement simulé ; aucun essai sur téléphone physique ou iPhone n’est confirmé. Le ZIP source ne contient pas son `local.properties` propre au PC.
- ✅ Identifiant Android `com.vigieauto.app` **fixé par l’utilisateur** ; sa disponibilité sur un store n’est pas vérifiée. La signature debug dépend de l’ordinateur : ne pas désinstaller en cas d’incompatibilité sans sauvegarde Android vérifiée. Une signature de production reste à définir.
- ❌ Pas de chiffrement SQLCipher ou des exports, sauvegarde automatique ou synchronisation. Les exports sont non chiffrés. La PWA n’a pas été publiée par l’agent ; l’adresse publique observée précédemment renvoyait 404 depuis son accès. Ne pas effacer les données pour forcer une mise à jour.

## 8. Documents et gestion du workspace

- `HISTORIQUE.md` : journal daté des demandes, décisions, réalisations, corrections, tests et limites.
- `CAHIER-DES-CHARGES.md` : besoins et statut réel de chaque exigence.
- `FEUILLE-DE-ROUTE.md` : étapes réalisées, suites proposées et arbitrages ; aucune date non validée n’est présentée comme un engagement.
- `plan-trajets.md` : annexe technique encore utile pour les trajets et sauvegardes envisagés ; `INSTALLER.md` à la racine : guide d’installation.
- Après chaque évolution : mettre à jour les trois documents **et `RECAPITULATIF-FONCTIONS.md`**, la feuille de route Android et les objectifs de performance, supprimer les fichiers temporaires/anciennes propositions inutiles et conserver normalement **trois ZIP de projet de versions distinctes**, en protégeant la PWA familiale et un repli Android stable pendant les préversions. Ne pas supprimer les données de l’utilisateur, les sauvegardes personnelles ou les sources nécessaires.
- Le dossier de travail est conservé sous `cq-auto` pour préserver les liens et l’aperçu ; l’application et son archive portent le nom VigieAuto.

## 9. Demande de socle et de performances — Android 0.4.0

- ✅ Le ZIP Android utilise une racine `VigieAuto` ; les ZIP PWA et Android sont à extraire dans deux dossiers parents distincts. Un document récapitulatif complet distingue les fonctions réellement disponibles et **doit être mis à jour à chaque évolution**.
- 🟠 Feuille de route en sept phases conservée dans `FEUILLE-DE-ROUTE-ANDROID.md` : socle, véhicule, carnet, statistiques, GPS, expérience et extras. Le 0.4.0 est découpé en alpha/bêta/stable ; une bêta partielle est présente, la stable reste à développer.
- ✅ Alpha : projections Room typées, relations/index, migration 1→2→3 et pont JSON conservateur, WAL et StrictMode debug. ⚠️ En beta.10, les JSON complets auxiliaires restent la source pour dix collections ; seuls les véhicules ont basculé vers des champs complets typés. L’export n’est donc pas encore reconstruit exclusivement depuis les tables métier.
- ✅ Beta.1 : 123 tests JVM et ponts fictifs ; beta.2 à beta.4 : tests ciblés. Beta.5 : 60 tests JVM ciblés réussis sans échec ni ignoré, compilation debug réussie et lint 0 erreur/16 avertissements. Suite complète non relancée pour ce lot sans changement du stockage ; quatre tests MigrationTestHelper compilés en beta.1 mais **non exécutés sur appareil**.
- ✅ Beta.3 : bouton Retour vers l’accueil depuis les onglets, vers l’onglet précédent depuis CQ ; dialogues prioritaires et comportement système à l’accueil. Beta.4 demande confirmation avant d’abandonner un formulaire modifié ; pas de sauvegarde automatique des brouillons. Navigation typée ajoutée en beta.8 ; validation sur téléphone toujours à faire.
- ✅ Beta.7 : 181 tests JVM réussis sans échec ni ignoré, compilation debug réussie et lint 0 erreur/16 avertissements. Passage fictif via la vraie PWA 1.5.1 sous Chromium et retour en Room ; 20 tests métier PWA et parcours catalogue Chromium réussis. Tests instrumentés recompilés mais non exécutés ; aucun essai physique.
- ✅ Beta.6 : vérification structurelle JSON sans restauration, avec quantités de chaque collection et garde explicite interdisant la confirmation d’import dans ce mode. Le contrôle ne prouve pas que la sauvegarde est complète/récente, que les pièces jointes s’ouvrent ni qu’une future restauration réussira. Une copie temporaire privée non chiffrée est créée ; son nettoyage est tenté, non garanti. 98 tests JVM ciblés réussis sans échec ni ignoré, compilation debug réussie et lint 0 erreur/16 avertissements.
- ✅ Beta.5 (historique, remplacé en beta.19) : suppression différée d’un entretien, plein, trajet ou rappel après confirmation ; sans autre action, annulation possible durant au moins 10 secondes au premier plan, puis suppression définitive ; « Supprimer maintenant » abrège le délai. Le délai redémarre au retour au premier plan ; si l’application s’arrête avant l’écriture, l’élément reste conservé. Écritures et import/export suspendus pendant l’attente. 🟠 Pas de corbeille ni de restauration après suppression effective.
- ✅ Beta.2 : listes du carnet composées au besoin avec clés stables ; pas de pagination Room, ni de performance chiffrée sans mesure sur appareil.
- ✅ Hilt, modèles et contrats de modules, adaptateurs, ViewModel testable, nettoyage/chargement IO et rapports Compose. LeakCanary est optionnel et désactivé par défaut en debug ; son build ajoute des permissions et peut contenir des données sensibles. 🟠 Moteur JSON toujours commun ; undo généralisé, CI, VACUUM périodique sûr, pagination, R8, analyses de fuites et benchmarks réels restent à faire. Les objectifs de temps et de fluidité ne sont pas mesurés ; voir `PERFORMANCES.md`.
- ✅ Conserver systématiquement les sauvegardes externes, les exports personnels et les champs inconnus ; les étapes futures ne doivent pas effacer les données simplement parce qu’un écran Android n’existe pas encore.
