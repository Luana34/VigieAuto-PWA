# Vérifications automatiques Android

**Android 0.4.0-beta.28 · 5 novembre 2026**

**Beta.28 :** le contrôleur exige aussi les scénarios critiques de dépenses : validation, total fiable, isolation véhicule, conflit, rollback et conservation de l’Undo, navigation simulée et retour PWA en Room. La fixture fictive de retour dépenses est livrée ; les huit anciens retours sans fichiers externes peuvent toujours être ignorés et sont comptés séparément. Aucun lancement GitHub ni essai physique n’est sous-entendu. Voir [DEPENSES-BETA28.md](DEPENSES-BETA28.md).

**Beta.27 :** le contrôleur de rapports exige les scénarios critiques du carnet enrichi : précision, conversion confirmée, préservation des extensions et conflits, transaction, recherche et navigation du sélecteur. Le test de retour Room utilise une fixture locale par défaut ; il ne remplace pas le parcours PWA séparé. Les huit anciens tests de pont sans fixtures externes restent explicitement ignorables. Aucun lancement GitHub ou essai physique n’est sous-entendu.

**Beta.26 :** le contrôleur JVM exige sept nouveaux scénarios critiques photo, dont la présence du lecteur AndroidX ; le manifeste compte 57 migrations et quatre tests photo instrumentés. Les tests graphiques natifs Robolectric API 34 n’ont pas été validés sur Windows ici. Avant la correction EXIF : suite JVM complète **548 réussis et 8 ignorés**, lint zéro erreur/20 avertissements et 61 scénarios instrumentés compilés mais non exécutés. Après remplacement par AndroidX : APK debug compilé, **73/73 tests ciblés réussis** et pont photo fictif Android ↔ PWA stable et candidate vérifié sous Chromium. La suite complète et le lint n’ont pas été relancés après la correction ; la recompilation des instrumentés après correction n’est pas confirmée. Aucun essai Android beta.26 sur Windows, GitHub, émulateur ou téléphone. Aucun lancement GitHub n’est revendiqué.

Les contrôles rapides Python du 4 novembre réussissent : vérificateur de rapports CI **22/22**, workflow **7/7**, contrôleur R8 **22/22**, archiveur **20/20**. Ils ne remplacent pas les compilations ni les tests Android réels.

**Beta.25 — essai R8 séparé :** une variante de recherche minifiée est préparée sous l’identifiant distinct `com.vigieauto.app.r8test`, avec le nom « TEST R8 - VigieAuto » et la clé de debug du poste ; elle possède sa propre base et ne met pas à jour l’installation habituelle `com.vigieauto.app`. La version debug normale et la release habituelle ne sont pas remplacées. Le contrôle statique du paquet ne prouve pas son fonctionnement réel : les sauvegardes, migrations et parcours sous R8 restent à tester sur appareil/émulateur avec des données fictives. Aucun serveur, migration Room ou changement JSON/PWA ; phase 1 toujours en cours. Voir [VALIDATION-R8.md](VALIDATION-R8.md). Le workflow prépare une compilation et un contrôle statique de cette variante, sans publier l’APK ni inclure de clé personnelle. Aucun lancement GitHub n’est revendiqué.

**Contrôles beta.25 :** l’APK `r8Test` isolé a été compilé et contrôlé statiquement, avec lint vital séparé sans anomalie ; taille locale **1 989 477 octets**, avec signature de debug, non représentative d’une release validée ou d’un AAB. La variante debug normale est compilée : **76 tests JVM ciblés réussis sur 76** (six classes, code non minifié), zéro ignoré ; pas de nouvelle suite JVM complète pour ce lot de configuration. Les 57 scénarios instrumentés debug sont compilés, non exécutés ; lint debug : zéro erreur et 17 avertissements. Tests Python : contrôleur R8 22/22, rapports CI 21/21, workflow 7/7, archiveur 19/19 ; `actionlint` 1.7.12 ne signale pas d’erreur de syntaxe. Aucun essai réel de l’application R8, GitHub, Windows, émulateur, téléphone ou PWA pour ce lot.

**Beta.24 — chargement prolongé :** après 10 secondes de chargement, « Réessayer » est proposé aussi sur l’écran d’état et au-dessus d’un formulaire ouvert. Ce délai ne signifie pas que les données sont perdues et ne déclenche aucune reprise automatique. La tentative précédente doit se terminer avant une nouvelle lecture ; si elle ne peut pas être interrompue, la reprise peut continuer à attendre. Les formulaires restent en mémoire, mais un arrêt de l’application peut faire perdre une saisie non enregistrée. Aucun effacement de base ; Room 15, JSON v3 et PWA inchangés. Voir [LECTURE-DU-CARNET.md](LECTURE-DU-CARNET.md). Cinq scénarios essentiels de reprise lente et de protection tactile sont requis dans le contrôleur de rapports. Aucun lancement GitHub n’est revendiqué.

**Contrôles beta.24 :** sous Linux, la suite JVM a compté **534 tests : 526 réussis, huit ignorés faute de fixtures de retour PWA, aucun échec**, sur 76 classes ; durée incrémentale 8 min 12 s hors compilation et téléchargements, non prédictive de Windows. Un contrôle tactile a ensuite été ajouté : les deux classes ViewModel/Compose ont été relancées séparément, **50/50 réussis** (42 + 8). En regroupant les rapports réels de la suite et de ce reciblage, le contrôleur valide 527 réussis et les mêmes huit ignorés ; ce n’est pas une seule suite de 535 tests. Aucun marqueur CloseGuard reconnu, sans preuve d’absence de fuite. APK debug et 57 scénarios instrumentés compilés ; instrumentés non exécutés. Lint : zéro erreur, 17 avertissements. Tests Python : rapports 20/20, workflow 6/6 et archiveur 18/18. Pas de nouveau parcours PWA, ni essai GitHub, Windows, émulateur ou téléphone pour ce lot.

**Beta.22 :** fermeture ordonnée des ressources de navigation en fin de test simulé, trois scénarios supplémentaires obligatoires dans les rapports, et signalement non bloquant du marqueur CloseGuard connu. Le ciblage a réussi deux fois sans ce marqueur après deux avertissements reproduits avant correction. La recherche n’est pas exhaustive et ne prouve rien sur un appareil réel : voir [TESTS-RESSOURCES.md](TESTS-RESSOURCES.md).

**Contrôles beta.23 :** Suite JVM Linux beta.23 : **530 tests, 522 réussis, huit ignorés faute de fixtures PWA et aucun échec**, sur 76 classes. Lancement incrémental : 6 min 59 s, hors compilations et téléchargements ; ce temps ne prédit pas Windows. Le contrôleur accepte uniquement ces huit omissions attendues ; aucun marqueur CloseGuard reconnu, sans preuve d’absence de fuite. Aucun nouveau parcours PWA n’a été exécuté pour ce lot. Les tests Python réussissent : rapports 19/19, workflow 6/6, archiveur 18/18. APK debug, tests JVM et 57 scénarios instrumentés compilés ; scénarios instrumentés non exécutés. Lint : 0 erreur et 17 avertissements. Les nouveaux scénarios essentiels de lecture et de reprise sont obligatoires dans le contrôleur ; le workflow reste non exécuté sur GitHub.

**Contrôles beta.22 :** compilation debug et compilation des 57 scénarios instrumentés réussies, sans exécution des scénarios instrumentés. La suite JVM complète recense **517 réussis, zéro ignoré et zéro échec sur 75 classes** ; aucun marqueur CloseGuard reconnu dans les rapports. Huit fichiers de pont fictifs issus de validations PWA antérieures ont été réutilisés : deux issus des essais 1.5.1 et six des essais pendant le développement beta.20 de la candidate ; aucun nouveau lancement PWA n’est revendiqué ici. Lancement incrémental Linux : 8 min 33 s, hors compilation et génération antérieure des fichiers, non transposable à Windows. Lint : 0 erreur et 17 avertissements. Vérificateur Python : 19 tests ; workflow : 6 ; archiveur : 17 ; actionlint réussi. GitHub, Windows beta.22 et les appareils réels restent à vérifier.

**Rappel beta.21 :** ce lot préparait le socle de tests, sans ajouter de compte ni de réseau à l’application. Le workflow GitHub Actions est fourni dans `.github/workflows/android.yml`, mais **il n’a pas encore été exécuté sur GitHub** : son fonctionnement effectif et les limites du runner restent à confirmer. Les essais sur téléphone réel restent indispensables. La PWA familiale 1.5.1 et la candidate 1.5.2-beta.1 ne sont pas modifiées par ce lot.

Lors d’une première tentative locale, la compilation Kotlin a manqué de mémoire avec une limite expérimentale de 384 Mio ; elle a ensuite réussi avec 640 Mio, comme la limite configurée dans le projet, puis les tests ont été lancés séparément. Sur Linux, la suite complète a recensé **514 tests : 506 réussis, 8 retours de pont ignorés, zéro échec** sur 75 classes. Durée du lancement : 8 min 55 s, hors compilation initiale et sans génération des ponts PWA. Le contrôleur a accepté les rapports réels et refusé sur des copies un scénario ignoré sans justification et un rapport de précision manquant. Deux avertissements CloseGuard SQLite/Room étaient apparus dans le test de navigation simulé ; l’enquête et le nettoyage de beta.22 sont décrits ci-dessus. L’APK debug et les 57 scénarios instrumentés sont compilés ; lint rapporte 0 erreur et 17 avertissements. Les scripts de contrôle, du workflow et de l’archiveur ont réussi respectivement 17, 6 et 16 tests ; la syntaxe Actions a été vérifiée avec actionlint. Ces résultats ne prédisent pas la mémoire, la durée ni le comportement sur Windows, GitHub ou téléphone.

## Que fait la vérification automatique ?

Lors d’un `push` ou d’une `pull request`, le job Linux proposé :

1. prépare Java 17, le SDK de compilation Android 36 et Gradle ; valide le wrapper et utilise le cache GitHub de façon facultative ;
2. vérifie les scripts Python de rapport, du paquet R8 et d’archivage ;
3. compile l’APK **debug**, lance lint et compile les tests instrumentés ;
4. construit et vérifie statiquement la variante **r8Test** isolée, sans exécuter cette application ;
5. exécute toute la suite JVM/Robolectric, puis lit les rapports XML afin de refuser un test en échec, un test essentiel absent ou un test ignoré non autorisé ;
6. conserve les seuls rapports de test et de lint pendant sept jours. Il ne publie ni APK, ni AAB, ni clé et ne signe ou ne diffuse rien sur un store.

Les tests JVM ne nécessitent pas de téléphone et ne prouvent pas le fonctionnement d’un vrai appareil. Les scénarios instrumentés sont **compilés mais non exécutés** dans ce job. Le projet Android seul ne contient pas la PWA : huit retours de pont conditionnels sont donc explicitement marqués **ignorés**, pas réussis. Le contrôleur vérifie que ces huit tests figurent bien dans le rapport et refuse tout autre test ignoré ; un de ces huit tests peut aussi réussir si sa fixture correcte est fournie. Les autres scénarios continuent à s’exécuter. La liste des huit tests est dans `scripts/verifier-rapports-ci.py`.

Le contrôleur cherche aussi dans les sorties JUnit le marqueur CloseGuard précis observé en navigation et affiche le nombre de messages par rapport, sans recopier les traces. Ce signal est **non bloquant, mais à examiner** ; il ne détecte pas toutes les fuites et n’équivaut pas à une analyse sur appareil. Les trois scénarios de fermeture ajoutés en beta.22 sont obligatoires dans la liste des tests essentiels. Les rapports eux-mêmes peuvent contenir des traces techniques : les contrôler avant partage.

Les tests réels Room → PWA → Room restent séparés : utiliser des données fictives et les commandes de [PHOTO-VEHICULE.md](PHOTO-VEHICULE.md), [PRECISION-SAUVEGARDES.md](PRECISION-SAUVEGARDES.md) et [TESTS-WINDOWS.md](TESTS-WINDOWS.md). Ne jamais remplacer une sauvegarde personnelle par une fixture et ne pas interpréter un pont ignoré comme validé.

## Option manuelle : deux émulateurs

Une fois le workflow présent sur la branche par défaut du dépôt, dans l’onglet **Actions**, choisir « VigieAuto Android — vérifications », puis **Run workflow**, cocher « Lancer aussi les tests instrumentés sur deux émulateurs Android » et confirmer. L’option est désactivée par défaut pour ne pas lancer systématiquement deux émulateurs coûteux à chaque modification. Le workflow prépare deux appareils virtuels séparés, API 26 et API 36, et lance `connectedDebugAndroidTest` sur chacun. KVM et les images système doivent être disponibles sur le runner ; sinon le job doit échouer clairement plutôt que prétendre réussir.

Le manifeste `scripts/tests-instrumentes-attendus.txt` énumère les **61** scénarios actuellement déclarés dans `RoomMigrationInstrumentedTest.kt` et `VehiclePhotoInstrumentedTest.kt`. Le contrôleur compare leurs noms aux rapports : zéro test, test manquant, supplémentaire, ignoré ou en échec bloque le job. Il faut actualiser le manifeste et son test à chaque ajout ou suppression volontaire de scénario. Cette vérification des rapports a été essayée sur XML synthétiques, pas encore sur un rapport d’émulateur réel. Un test sur émulateur ne remplace ni un test sur les téléphones de la famille ni une mesure de performance.

Les tests instrumentés installent une application de test et peuvent ouvrir ou migrer une base. **Sur un téléphone physique, ne les lancez pas sur l’unique installation contenant vos données** : utilisez un appareil de test et conservez auparavant une sauvegarde externe vérifiée. Une différence de clé de signature peut aussi empêcher l’installation ou la mise à jour.

## Activer la CI sans exposer ses données

1. Extraire le ZIP Android dans un dossier parent propre. Son dossier racine est `VigieAuto`.
2. Dans un dépôt GitHub choisi par le développeur, placer **le contenu** de ce dossier à la racine du dépôt, avec `gradlew`, `app`, `gradle`, `scripts` et le dossier caché `.github`. Sous Windows, afficher les fichiers cachés si nécessaire. Mettre uniquement le ZIP lui-même, ou mettre `VigieAuto` comme sous-dossier, ne déclenche pas le workflow à la racine.
3. Avant chaque envoi, inspecter les fichiers : **aucune sauvegarde JSON personnelle, photo, pièce d’identité, document, fichier de clé ou `local.properties`** ne doit être ajouté. Les fichiers JSON de schéma et les fixtures fournis dans le projet sont techniques et fictifs. `.gitignore` bloque les noms habituels d’export et certaines clés ; l’archiveur refuse aussi ces noms dans le projet. Aucun des deux ne peut reconnaître toutes les sauvegardes ou photos personnelles renommées : l’inspection reste obligatoire.
4. Activer les Actions si le dépôt ou l’organisation les bloque. La publication du projet et l’activation de ce service demandent un compte et une connexion au développeur, mais l’utilisation de VigieAuto reste sans compte et hors ligne. Les disponibilités et quotas GitHub dépendent du type de dépôt et des conditions du service.
5. Ouvrir l’onglet **Actions**, consulter le premier lancement puis ses rapports. Tant que ce premier lancement ne s’est pas terminé, la CI est **préparée, pas validée à distance**. Un dépôt public peut rendre le code et les journaux accessibles : ne jamais y placer de données personnelles.

La politique du workflow accorde seulement `contents: read`, ne conserve pas les identifiants de checkout, ne demande aucun secret et n’utilise pas `pull_request_target`. Les actions externes sont fixées à des empreintes complètes ; leurs versions doivent être mises à jour et revérifiées périodiquement. Le cache choisi est le mode GitHub `basic`, sans service de cache commercial supplémentaire. Les dépendances et le SDK sont téléchargés pour la compilation : cela ne change pas le fonctionnement hors ligne de l’application installée.

## Commandes locales équivalentes

Sous Windows dans PowerShell, depuis le dossier racine du projet (Python 3.9 ou plus récent est nécessaire uniquement pour les contrôles Python ; l’application Android n’en dépend pas) :

```powershell
python scripts\test_verifier_rapports_ci.py
python scripts\test_verifier_apk_r8.py
python scripts\test_workflow_ci.py
python scripts\test_archive.py
.\gradlew.bat :app:assembleDebug :app:lintDebug :app:compileDebugAndroidTestKotlin
.\gradlew.bat "-Dorg.gradle.jvmargs=-Xmx1024m -Dfile.encoding=UTF-8" :app:assembleR8Test -x :app:lintVitalR8Test
if ($LASTEXITCODE -ne 0) { throw "Échec de l’assemblage R8" }
.\gradlew.bat :app:lintVitalR8Test
if ($LASTEXITCODE -ne 0) { throw "Échec du lint vital R8" }
python scripts\verifier-apk-r8.py --sdk "CHEMIN_REEL_DU_SDK_ANDROID"
if ($LASTEXITCODE -ne 0) { throw "Échec du contrôle statique R8" }
.\gradlew.bat :app:testDebugUnitTest --rerun
python scripts\verifier-rapports-ci.py jvm app\build\test-results\testDebugUnitTest
```

Les appels Gradle distincts évitent de garder en mémoire le compilateur, R8 et les tests Robolectric dans un seul lancement. Remplacer le chemin du SDK par le vôtre. `--rerun` force la tâche de tests plutôt qu’un résultat déclaré à jour ; la commande complète peut être longue sur Windows et aucun gain de temps n’est promis. Sur un appareil de test ou émulateur déjà connecté, seulement après sauvegarde :

```powershell
.\gradlew.bat :app:connectedDebugAndroidTest
python scripts\verifier-rapports-ci.py instrumentes app\build\outputs\androidTest-results\connected
```

Les rapports doivent correspondre à **un seul appareil** pour le contrôle instrumenté. Effacer uniquement les anciens **rapports de build** avant un nouveau contrôle si plusieurs appareils ou exécutions y sont présents ; ne jamais effacer les données de l’application pour nettoyer les rapports.

## Références pour la maintenance

- [GitHub : runners hébergés, ressources et accélération Android](https://docs.github.com/en/actions/reference/runners/github-hosted-runners).
- [Android : tâches Gradle et emplacement des rapports de tests](https://developer.android.com/studio/test/command-line).
- [Android Emulator Runner : options et configuration KVM](https://github.com/ReactiveCircus/android-emulator-runner).
- [Gradle : configuration de l’action et validation du wrapper](https://github.com/gradle/actions/tree/main/setup-gradle).
