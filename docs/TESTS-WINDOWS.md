# Tests Android sur Windows — diagnostic Robolectric

**Beta.26 :** utilisez les commandes habituelles d’assemblage et de tests JVM depuis une extraction propre. Les tests photo emploient des graphiques natifs Robolectric API 34 : le paquet de test contient une DLL Windows x64, mais sa présence ne valide pas son chargement ni ces tests sur votre PC. Leur exécution sur Windows n’a pas été vérifiée ici ; en cas d’échec, conserver et communiquer le rapport sans effacer les données ni exclure silencieusement le test. L’émulateur ouvert ne transforme pas `testDebugUnitTest` en test instrumenté. Voir [PHOTO-VEHICULE.md](PHOTO-VEHICULE.md).

**Beta.25 :** la variante R8 isolée se construit en option ; ses contrôles statiques ne lancent pas l’application. Guide : [VALIDATION-R8.md](VALIDATION-R8.md). Aucun essai Windows beta.25 ici.

**Beta.24 :** les tests ciblés ci-dessous couvrent aussi la reprise après chargement prolongé et un formulaire dont la saisie reste conservée. Aucun essai Windows beta.24 n’a été effectué ici.

**Beta.23 :** les tests du ViewModel et de l’état de lecture couvrent notamment chargement, erreur, reprise, fin inattendue du flux et protection de l’import. Depuis la racine du nouveau projet, un ciblage facultatif est :

```powershell
.\gradlew.bat :app:testDebugUnitTest --rerun --tests "com.vigieauto.app.MainViewModelUnitTest" --tests "com.vigieauto.app.StorageStatusTest"
```

Aucun lancement Windows beta.23 n’a été effectué ici.

**Beta.22 :** les ressources du processus simulé sont fermées en fin de test de navigation ; trois régressions supplémentaires vérifient notamment la recréation d’Activity. Le marqueur CloseGuard observé est désormais signalé dans les rapports CI, sans être traité comme preuve de fuite sur appareil ni rendre le signal bloquant. Voir [TESTS-RESSOURCES.md](TESTS-RESSOURCES.md) et [CI-VERIFICATIONS.md](CI-VERIFICATIONS.md). Aucun essai Windows beta.22 ni exécution GitHub n’est revendiqué ici.

## Ce qui a été observé

Sur Windows, un essai de beta.7 (181 tests, 1 échec, 4 ignorés) et un essai de beta.8 (200 tests, 1 échec, 4 ignorés) ont échoué dans `MainNavigationBackTest`. Pour beta.8, la cause rapportée sous `UncaughtExceptionsBeforeTest` est `Illegal connection pointer` dans `ShadowLegacySQLiteConnection`, pendant un flux d’invalidation Room sur `arch_disk_io_2`. Le test indiqué peut être celui qui reçoit l’exception d’une tâche précédente : la trace ne prouve pas quel scénario a créé le flux ni une corruption de données réelles. Un autre build beta.7 avait précédemment réussi chez l’utilisateur.

Avec Robolectric 4.14.1, le mode SQLite par défaut est `LEGACY` sous Windows et `NATIVE` sur les autres plateformes prises en charge. Le chargement du runtime natif Windows x86_64 est pris en charge depuis [Robolectric 4.12](https://github.com/robolectric/robolectric/releases/tag/robolectric-4.12) ; notre dépendance de test 4.14.1 contient bien une DLL Windows x64, dont la présence seule ne démontre pas qu’elle se charge sur un ordinateur donné.

## Modification de beta.9

- Pour une JVM Windows `amd64`/`x86_64`, les tâches de tests JVM demandent explicitement `robolectric.sqliteMode=NATIVE` ; sinon le choix reste celui de Robolectric. Ce réglage de test ne modifie pas la base SQLite de l’application sur téléphone. Un Windows/JDK ARM64 natif ou 32 bits n’est pas couvert par ce forçage.
- Les tests de navigation ferment explicitement leur scénario Activity et attendent que le `viewModelScope` correspondant ait effectivement fini. Le temps d’attente est borné et une exception ou un dépassement font échouer le test : aucun test ni aucune exception ne sont masqués. Un test contrôle aussi l’annulation du scope après fermeture.
- Des vérifications dédiées contrôlent le mode réellement retenu sur Windows x64, la présence de la DLL dans la dépendance de test et une requête SQLite réelle dans le simulateur ; seul un lancement sur le Windows concerné confirme le chargement de la DLL. La suite utilise toujours la vraie Activity et Room simulée.

Le problème initial est intermittent. La correction est une mesure ciblée plausible, **pas une preuve que la cause exacte a été reproduite ou que les échecs ont disparu sur tous les Windows**. Aucun Windows n’était disponible dans notre environnement pour cette livraison ; voir le retour utilisateur ci-dessous.

## Retour Windows de l’utilisateur après livraison

La commande ciblée ci-dessous a terminé par `BUILD SUCCESSFUL` en 3 min 31 s. Ensuite, `:app:assembleDebug :app:testDebugUnitTest` a également réussi en 5 min 7 s ; la seconde commande réutilisait 47 tâches à jour sur 52. Le nombre de tests éventuellement ignorés et l’architecture de la JVM ne figurent pas dans l’extrait ; `lintDebug` et les tests instrumentés ne figurent pas non plus dans les commandes. Ces deux passages sont encourageants, sans prouver qu’un incident intermittent est impossible.

Des avertissements de version XML du SDK et de dossiers d’outils SDK supplémentaires apparaissent, mais n’ont pas empêché les builds. Ne rien supprimer dans le SDK sur la seule base de ces avertissements.

## Retour Windows beta.10 et temps d’exécution

L’utilisateur a lancé `:app:assembleDebug :app:testDebugUnitTest` : `BUILD SUCCESSFUL` en **15 min 28 s**, 25 tâches exécutées et 27 à jour. Son rapport contient **224 tests déclarés, 220 réussis, 4 ignorés, 0 échec**, pour 8 min 44,10 s de durée comptabilisée. Les quatre ignorés sont des retours PWA dont les fichiers fictifs ne sont pas fournis par la commande ordinaire. La durée des autres tâches ne peut pas être déduite précisément ; ne pas attribuer la différence à la seule compilation ou aux avertissements SDK.

La suite utilise un seul worker et `forkEvery=1`. Sur les 39 classes de ce rapport, les 29 classes Robolectric totalisent environ 8 min 41 s dans le rapport ; les 10 autres classes et leurs 98 tests environ 3,15 s. Une mesure isolée Linux sur 93 tests ciblés a donné 67,75 s pour `forkEvery=1` contre 43,56 s pour `forkEvery=4`. Ce n’est pas un benchmark Windows : un premier essai complet de regroupement a perdu son daemon sous pression mémoire, avec avertissements de ressources dans les tests. Beta.11 et beta.12 **ne modifient pas** l’isolation ; optimisation et contrôle sur Windows restent à faire. Depuis, l’utilisateur a transmis une commande annoncée comme beta.11 en 24 min 27 s, puis un rapport Windows contenant les classes beta.12 ; il précise que le lancement correspondant à ce rapport a duré 25 min 26 s.

## Pont de précision beta.20

Aucun test Windows beta.20 n’a été réalisé ici. Les commandes ciblées de génération du jeu fictif, du parcours PWA et du retour Room figurent dans `PRECISION-SAUVEGARDES.md`. Elles ne remplacent ni la suite complète ni les tests sur appareils. Ne pas relancer une longue suite uniquement pour confirmer une durée déjà communiquée.

## Retour Windows beta.11 — après livraison de beta.12

Sur le Windows de l’utilisateur, la commande `:app:assembleDebug :app:testDebugUnitTest` présentée comme beta.11 a terminé par `BUILD SUCCESSFUL` en 24 min 27 s, avec 25 tâches exécutées et 27 à jour. L’extrait de commande ne précisait ni le nombre de tests réussis ou ignorés, ni la durée des tâches ; lint et tests instrumentés ne figuraient pas dans la commande. Un rapport détaillé a ensuite été communiqué, mais il contient des classes beta.12 : voir ci-dessous.

C’est 8 min 59 s de plus que les 15 min 28 s rapportées en beta.10, mais les tâches réellement exécutées, caches et circonstances ne sont pas documentés : on ne peut pas attribuer cet écart à une cause précise. La configuration utilise un seul worker Gradle et `forkEvery=1`, donc une nouvelle JVM de test par classe : c’est une piste sérieuse, pas une mesure des 24 minutes. Les avertissements SDK XML, `emulator.backup` et `platform-tools-2` ne démontrent pas à eux seuls la cause ; ne rien supprimer dans le SDK à l’aveugle.

Le rapport existant `app/build/reports/tests/testDebugUnitTest/index.html` permet de voir les comptes, les classes et leurs durées **sans relancer le build** ; ces durées ne mesurent pas toujours tout le temps de démarrage des JVM ou des autres tâches Gradle. Un futur essai `--profile` peut mesurer les tâches lors d’un vrai build, sans prétendre retrouver la répartition du build déjà terminé. Le code beta.12 et son archive livrée sont inchangés ; les documents du dossier source ont été mis à jour après ce retour.

### Rapport Windows reçu ensuite — version et durées à distinguer

Pour le lancement correspondant au rapport Windows de 270 tests, l’utilisateur indique **25 min 26 s** au total : 266 tests réussis, 4 ignorés, aucun échec, et 11 min 19,12 s de durée cumulée des classes. Le rapport contient `CompleteFillCodecTest`, `RoomCompleteFillTest` et `RoomMigrationV6Test`, absents de la beta.11 livrée et présents en beta.12 ; le dossier Windows actuel indique beta.12 (code 16). La durée précédemment indiquée de 24 min 27 s ne doit pas être attribuée à ce rapport sans autre précision.

Le rapport classe les durées par classe : en rapprochant les noms du code beta.12, **33 classes Robolectric totalisent environ 11 min 15,63 s**, tandis que **12 classes non Robolectric totalisent 3,49 s pour 114 tests**. Ce sont des durées cumulées par classe, pas un chronométrage de toutes les tâches Gradle ; elles incluent les tests réellement effectués et leurs préparatifs, pas seulement le coût de démarrage. Les classes les plus longues sont `JournalNavigationTest` (54,887 s, un test), `JournalFormTest` (51,680 s, cinq tests) et `BackupVerificationTest` (41,287 s, trois tests).

Les 4 tests ignorés concernent les trois classes de retours fictifs PWA dont les fichiers ne sont pas fournis dans la commande standard. Ces trois classes totalisent **42,654 s** dans le rapport malgré leur statut ignoré ; les hypothèses sont évaluées dans des tests Robolectric. Étudier un contrôle préalable sans démarrer la simulation et **conserver les quatre ignorés visibles**, tout en exécutant réellement ces tests lorsque les fichiers sont fournis. Ne pas filtrer ni faire disparaître des tests du rapport.

Pour les **25 min 26 s** communiquées par l’utilisateur, l’écart arithmétique avec les durées cumulées des classes est **14 min 06,88 s**. Cet écart n’est pas une mesure directe de la compilation : initialisations de JVM, orchestration, autres tâches et éventuellement compilation ne sont pas séparées ici. Un profil Gradle lors d’un futur lancement utile permettra de mesurer les tâches de ce lancement ; inutile de relancer immédiatement le travail seulement pour produire ce profil.

Le dossier actuellement montré par l’utilisateur, `C:\Users\lixe\Documents\VigieAuto`, indique `versionCode = 16` et `versionName = "0.4.0-beta.12"` ; c’est cohérent avec les classes du rapport de 270 tests. L’utilisateur précise que ce lancement a duré 25 min 26 s. Cette lecture ne prouve pas que tous les fichiers sont identiques au ZIP livré. Une même arborescence contenant des fichiers d’anciennes et nouvelles versions doit être évitée ; ne rien effacer sans préserver les sauvegardes personnelles.

### Prototype ciblé : ne pas initialiser Robolectric quand la fixture manque

Essai exploratoire Linux sur les trois classes de pont, sans fichiers de retour : dans un même lancement Gradle, la tâche de référence a pris 10,84 s et le prototype de vérification précoce 2,20 s, avec `forkEvery=1` et un worker ; un passage par mode, dans cet ordre. Les deux rapports gardent les mêmes 4 tests, tous ignorés. Avec les quatre fixtures fictives, les quatre tests ont réellement réussi sous Gradle ; en JUnit, une fixture présente et une absente donnent une réussite et un ignoré, et un chemin personnel invalide échoue toujours. À ce stade, avant beta.13, ce prototype extérieur n’était pas intégré ; une garde équivalente est ensuite entrée dans le projet en beta.13, sans mesure Windows ni preuve d’un gain global. Les durées rapportées par les classes sont respectivement 8,460 s et 0,004 s. Le second passage peut bénéficier du cache ; il faut des répétitions et un test Windows avant toute conclusion.

Le prototype attribue aux quatre méthodes leur propriété de fixture, vérifie la condition avant le sandbox et signale une hypothèse JUnit non satisfaite, sans filtrer le test. Les préconditions initiales restent dans les tests ; elles permettent encore de détecter une fixture modifiée ou invalide. Avant intégration : garantir la sémantique exacte et la correspondance des propriétés, contrôler les filtres et SDKs, tester absent/présent/partiel/invalide, et relancer tous les tests pertinents puis la suite complète. Ne pas présenter les ignorés comme des réussites.

Dans l’échantillon antérieur `forkEvery=2`, les cinq avertissements CloseGuard apparaissent dans le XML de `RoomBackupTest` et les traces concernent l’ouverture SQLite/Room. L’ordre des classes dans ce passage place `MainNavigationBackTest` immédiatement avant dans la même paire ; les traces asynchrones ne permettent pas de déterminer la classe propriétaire ou une fuite dans l’application. `RoomBackupTest` appelle déjà `db.close()` en fin de test. Poursuivre l’identification avant de changer l’isolation.

### Essai local ultérieur — hypothèse à fiabiliser

Sur Linux uniquement, avec beta.12 et un fichier Gradle d’initialisation temporaire extérieur au projet, un échantillon **identique de 75 tests dans 9 classes** a réussi dans les deux modes : `forkEvery=1` a pris 84,41 s pour la tâche de tests et `forkEvery=2` 70,95 s (un seul passage par mode, dans cet ordre, cache susceptible de favoriser le second). Cependant, le deuxième passage a émis **cinq avertissements CloseGuard** de ressources non fermées ; aucune conclusion sur une fuite de l’application réelle ne peut être tirée de ces seuls messages. Cet essai n’est ni un test de toute la suite, ni une mesure Windows, ni une optimisation jugée sûre.

Une première comparaison incluant une dixième classe (78 tests) a échoué dans le mode `forkEvery=1` : dépassement de délai au démarrage d’un test Compose de `BackupVerificationTest` déjà observé une fois auparavant. Une suite préparatoire beta.19 a également été interrompue après un dépassement lors de la création fictive. Les parcours de test concernés attendent désormais explicitement le chargement de l’Undo avant d’envoyer une action et font progresser le Looper Robolectric ; un test déterministe couvre également le verrou d’initialisation. Cela traite une course possible introduite par le nouveau verrou, sans établir la cause des anciens délais intermittents. Le mode `forkEvery=2` a réussi cette sélection, sans preuve que le délai soit résolu. La seconde comparaison excluait explicitement cette classe **uniquement dans l’échantillon expérimental** ; les tests concernés restent activés dans le projet. Le comportement exact et les ressources signalées restent à diagnostiquer. Aucun réglage du projet ni du ZIP livré n’a été modifié, et aucun gain Windows n’est revendiqué.

## Observation beta.19 des tests simulés

Le passage ciblé puis la suite complète Linux de beta.19 ont aussi émis des avertissements `CloseGuard` dans le XML de `MainNavigationBackTest` ; le rapport complet en contient trois, avec des traces d’ouverture SQLite/Room. Le passage complet de beta.21 en a émis deux dans cette même classe. À ce stade historique, leur cause et la propriété exacte des ressources n’étaient pas déterminées ; le résultat n’établissait ni l’existence ni l’absence d’une fuite sur téléphone. L’enquête et le nettoyage ciblé de beta.22 sont décrits dans [TESTS-RESSOURCES.md](TESTS-RESSOURCES.md), sans modification de `forkEvery=1`.

## Vérifier rapidement avant la suite complète

Dans Android Studio, extraire beta.22 dans un nouveau dossier propre, l’ouvrir comme décrit dans `INSTALLER-ANDROID.md` et attendre la synchronisation. Depuis le terminal PowerShell à la racine du dossier `VigieAuto` (copier le `local.properties` si nécessaire) :

```powershell
.\gradlew.bat :app:testDebugUnitTest --rerun --tests "com.vigieauto.app.MainNavigationBackTest" --tests "com.vigieauto.app.RobolectricSqliteConfigurationTest"
```

Attendu : `BUILD SUCCESSFUL` et les 13 tests de ces deux classes réussis, sans test ignoré. Une première compilation ou un téléchargement peut prendre du temps ; on ne promet pas de durée. En cas d’échec, transmettre la trace complète et le fichier HTML `app\build\reports\tests\testDebugUnitTest\index.html` ou l’exception et ses causes. Ne pas partager de sauvegarde personnelle ni les fichiers privés.

Pour cibler la migration et l’Undo introduits en beta.19 et conservés dans beta.22 :

```powershell
.\gradlew.bat :app:testDebugUnitTest --tests "com.vigieauto.app.RoomMigrationV15Test" --tests "com.vigieauto.app.JournalUndoIntegrationTest" --tests "com.vigieauto.app.PendingDeletionTest"
```

Ces contrôles utilisent Robolectric ou la JVM ; ils ne remplacent pas un appareil ni un émulateur. Si les tests ciblés réussissent, lancer ensuite les contrôles habituels :

```powershell
.\gradlew.bat :app:testDebugUnitTest :app:lintDebug
```

Sans les huit fichiers de retour d’échange fictifs générés séparément (sept historiques et un de précision), les huit tests de pont conditionnels sont marqués ignorés ; cela doit être distingué de tests réussis. Depuis beta.13, une garde les signale avant initialisation Robolectric ; les assertions restent présentes. Un chemin personnel invalide échoue. `forkEvery=1` reste inchangé ; aucun gain Windows ni validation Windows beta.22 n’est revendiqué ici. Les tests instrumentés Room sont séparés : `.\gradlew.bat :app:connectedDebugAndroidTest` sur émulateur ou téléphone de test, après sauvegarde, car cette commande peut installer l’APK et migrer une base existante. Le rapport utilisateur beta.12 correspond à 25 min 26 s.

## Option : exécuter aussi les huit tests de pont PWA

Ces étapes facultatives et plus longues utilisent **uniquement des données fictives**. Elles nécessitent Node.js, la PWA candidate 1.5.2-beta.1 extraite dans un autre dossier parent, et Chromium Playwright. Dans ce dossier PWA, lancer `npm ci`, puis `npx playwright install chromium` ; son verrou fixe Playwright 1.55.1. La version familiale historique 1.5.1 garde le verrou 1.55.0 concerné par [GHSA-7mvr-c777-76hp](https://github.com/advisories/GHSA-7mvr-c777-76hp) et peut arrondir des nombres : ne pas la substituer au pont de précision. Revenir ensuite dans le dossier Android et adapter le chemin `$PWA` :

```powershell
$PWA = "C:\Chemin\vers\le-dossier-PWA\VigieAuto" # à adapter
$B = Join-Path (Get-Location).Path "app\build\bridge"

# Les tests suivants créent les exports Android fictifs sous app\build\bridge.
.\gradlew.bat :app:testDebugUnitTest --rerun --tests "com.vigieauto.app.RoomBackupTest" --tests "com.vigieauto.app.VehicleRepositoryTest" --tests "com.vigieauto.app.VehicleEditTest" --tests "com.vigieauto.app.JournalRepositoryTest" --tests "com.vigieauto.app.CqBridgeTest.exportRoomFixtureForPwa" --tests "com.vigieauto.app.PrecisionBridgeTest.exportFixtureFromRoom" "-PbridgeVehicleEditOut=$B\android-vehicle-edit.json"

# Ces scripts ouvrent la vraie PWA dans Chromium et créent huit fichiers de retour fictifs.
node scripts/test-pont-web.cjs generate-personal $PWA "$B\web-personal.json"
node scripts/test-pont-web.cjs accept $PWA "$B\android-vehicles.json" "$B\web-vehicles.json"
node scripts/test-vehicle-edit-pont.cjs $PWA "$B\android-vehicle-edit.json" "$B\web-vehicle-edit.json"
node scripts/test-journal-pont.cjs $PWA "$B\android-journal.json" "$B\web-journal.json"
node scripts/test-documents-pont.cjs $PWA "$B\android-big.json" "$B\web-documents.json"

node scripts/test-cq-reglages-pont.cjs $PWA "$B\android-cq.json" "$B\pwa-cq.json" "$B\pwa-cq-deleted.json"
node scripts/test-pont-precision.cjs $PWA "$B\android-precision.json" "$B\pwa-precision.json"

# Suite complète avec les huit fichiers pour ne pas ignorer leurs tests.
.\gradlew.bat :app:testDebugUnitTest --rerun "-PbridgePersonal=$B\web-personal.json" "-PbridgeReturnVehicles=$B\web-vehicles.json" "-PbridgeReturn=$B\web-vehicle-edit.json" "-PbridgeJournalReturn=$B\web-journal.json" "-PbridgeDocumentsReturn=$B\web-documents.json" "-PbridgeCqReturn=$B\pwa-cq.json" "-PbridgeCqDeleted=$B\pwa-cq-deleted.json" "-PbridgePrecisionReturn=$B\pwa-precision.json"
```

Vérifier que **chaque commande réussit** avant la suivante ; contrôler les nombres de réussites, échecs et ignorés dans le rapport. Les huit fichiers de retour sont générés à partir de données d’essai et ne sont pas des sauvegardes personnelles. Les tests instrumentés restent séparés.

### Pont spécifique Undo (facultatif)

Avec le même `$PWA`, `$B` et Playwright 1.55.1 installé localement, les commandes suivantes comparent l’élément avant suppression, après suppression puis après restauration, avant de réimporter le résultat dans Room. Elles ne lisent aucune sauvegarde personnelle :

```powershell
.\gradlew.bat :app:testDebugUnitTest --rerun --tests "com.vigieauto.app.JournalUndoIntegrationTest.closingAndReopeningDatabaseRecoversUndoAndBridgeExports"
node scripts/test-undo-pont.cjs $PWA "$B\undo" "$B\undo\pwa-return.json"
.\gradlew.bat :app:testDebugUnitTest --rerun --tests "com.vigieauto.app.BridgeReturnTest.webReturnCanBeImportedAgainOnAndroid" "-PbridgeReturn=$B\undo\pwa-return.json"
```

Ce test Undo ne valide pas à lui seul la correction de précision ; le pont de précision est distinct. Aucun de ces tests ne remplace une sauvegarde externe ou les essais sur appareil.

Pour identifier l’architecture du JDK si nécessaire :

```powershell
java -XshowSettings:properties -version 2>&1 | Select-String "os.arch|os.name|java.version"
```

Cette commande décrit le `java` du terminal, pas nécessairement le JDK choisi par Android Studio ; les paramètres Gradle d’Android Studio indiquent ce dernier.
