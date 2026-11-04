# Performance et fluidité — objectifs et méthode

**Document vivant · 4 novembre 2026.** Intégré à la phase 1, à réviser à chaque version. Ces chiffres sont des **objectifs souhaités**, pas des mesures actuelles ni des garanties sur tous les appareils. Aucun profilage sur téléphone réel ni benchmark macro n’est revendiqué pour l’alpha ou la bêta. Une migration de plusieurs années de données peut exceptionnellement durer plus longtemps ; l’information et la préservation priment sur le délai.

**Précisions après beta.16 :** profils de référence, R8, CI et mesures restent à réaliser dans la phase 1. Le gain hypothétique de 20 à 40 % avec des profils n’est pas garanti ; une photo de 12 Mo ramenée vers 100 Ko est une cible indicative dépendant de la qualité et de l’image. Tester séparément sur émulateur et téléphone ; les 34 scénarios instrumentés beta.16 sont compilés, non exécutés ici. Voir [PLAN-PRIORITES-APRES-BETA16.md](PLAN-PRIORITES-APRES-BETA16.md).

## Cibles proposées par l’utilisateur

| Mesure | Cible souhaitée | Comment mesurer |
|---|---|---|
| Démarrage à froid | < 1 seconde | Macrobenchmark release/profileable, plusieurs essais sur appareils définis, après installation/migration séparée |
| Démarrage à chaud | < 300 ms | Idem, préciser état du processus |
| Ouverture écran | < 100 ms | Traces et distribution des temps, ne pas inclure artificiellement un écran vide sans données |
| Liste 1 000 entrées | 60 images/s avec le moins de frames ratées possible | FrameTimingMetric en défilement réel, 60/90/120 Hz et appareil précisés ; zéro frame perdue ne peut pas être garanti |
| Enregistrer un plein | < 50 ms ressenti | Mesurer jusqu’à confirmation durable, base et appareil indiqués ; pas seulement le retour optimiste |
| Import/export JSON de 10 Mo | < 3 s / < 2 s ; progression visible | Mesurer lecture, validation, transaction, écriture et stockage réel, avec pièces jointes représentatives |
| APK / téléchargement | APK release < 15 Mo ; téléchargement AAB < 8 Mo | Mesurer une release minifiée et l’APK par appareil ; un APK debug n’est pas comparable |
| RAM | < 100 Mo en usage normal | Profiler scénario et modèle précis, distinguer PSS/RSS et système |
| Batterie hors GPS | Négligeable | Mesure longue, services et conditions documentés ; aucune valeur n’est garantie à ce stade |

Ne pas annoncer « instantané », « 0 crash », « aucune saccade », « 60 fps garanti sur 10 000 éléments », « 100× plus rapide » ou un gain de baseline profile sans mesures. Les machines, états de stockage, tailles de fichiers, chiffrement matériel et versions Android changent les résultats.

## Mise en œuvre par étapes

### Alpha : base et sécurité

- Requêtes typées indexées par véhicule/date et autres champs utiles ; transactions d’import et de modifications conservées. Les blocs JSON complets sont encore lus pour les écrans/le pont : **la refonte n’a pas encore supprimé tout parsing**. Les calculs de stats et la pagination ne sont pas disponibles en alpha.
- Room est utilisé hors du thread principal pour les opérations du dépôt ; les migrations peuvent être coûteuses et leur affichage pendant l’ouverture devra être étudié. `Flow` et les requêtes suspendues Room disposent de leurs propres exécutors : vérifier les traces plutôt que de supposer qu’un `flowOn` rend automatiquement toute opération sûre.
- Le constructeur Room de production demande **WAL**. **StrictMode est activé uniquement en build debug** : détection des lectures/écritures disque et accès réseau sur le thread principal, journal et flash visuel. Il est absent en release et peut aussi signaler des accès des bibliothèques ou du système. C’est une aide, pas une preuve d’absence de blocage ; éviter les données personnelles dans les journaux.
- `VACUUM` réécrit la base et peut bloquer, consommer du temps, de la batterie et de l’espace temporaire ; il ne doit pas être lancé dans une transaction ou systématiquement sans mesure. Un compactage périodique automatique reste à tester et à arbitrer après mesures de fragmentation, espace libre, contraintes d’inactivité/charge et protection des données. Il n’est **pas garanti ni annoncé actif** dans cette alpha. WAL ne garantit pas un gain chiffré et ses fichiers doivent être pris en compte.

### Bêta : architecture et observation

- **Réalisé dans beta.1 :** Hilt, contrats et adaptateurs par module, mappers, ViewModel testable ; catalogue et gestion des copies d’import sur IO, mappings de flux sur Default, annulation des imports testée. Le JSON complet reste dans le moteur commun ; les `Flow<List<…>>` ne sont pas paginés. Ces choix ne prouvent aucun gain sans mesure.
- **Réalisé dans beta.2 :** cartes Entretien/rappels, Pleins et Trajets composées au besoin (`LazyColumn` avec clés stables), tri des rappels calculé une fois par changement pertinent et retour en haut lors du changement de rubrique/véhicule. 9 tests ciblés JVM réussis sans ignoré, compilation debug réussie et lint 0 erreur/16 avertissements. Pas de pagination SQL : le flux complet des résumés et le filtrage restent en mémoire ; les autres écrans ne sont pas tous virtualisés. Le test simulé de 1 000 cartes ne mesure pas les FPS, temps ou mémoire sur un appareil.
- **Beta.3 :** adaptation du bouton Retour sans changement de stockage ni de stratégie de chargement. 5 tests ciblés JVM réussis sans ignoré, compilation debug réussie et lint 0 erreur/16 avertissements. Aucun temps de navigation, frame ou consommation mémoire n’a été mesuré sur téléphone.
- **Beta.4 :** dialogue local de confirmation pour les formulaires modifiés, sans changement de stockage ni stratégie de chargement. 38 tests JVM ciblés réussis sans échec ni ignoré, compilation debug réussie et lint 0 erreur/16 avertissements. Aucun temps, frame ou usage mémoire n’a été mesuré sur téléphone.
- **Beta.7 :** la fiche relit le JSON complet sur IO et calcule son empreinte ; une photo volumineuse est conservée mais peut coûter du temps et de la mémoire. Aucun temps, débit, FPS ou usage mémoire n’est mesuré sur appareil. 181 tests JVM réussis sans échec ni ignoré, compilation debug réussie et lint 0 erreur/16 avertissements.
- **Beta.6 :** vérification JSON sur IO, avec copie privée bornée et lecture en flux réutilisées de l’import ; pas de mesure de temps ou mémoire. 98 tests JVM ciblés réussis sans échec ni ignoré, compilation debug réussie et lint 0 erreur/16 avertissements. Le nettoyage de la copie est tenté mais son succès n’est pas garanti.
- **Beta.5 :** état de suppression en attente limité à une référence et à son empreinte, sans chargement d’une copie JSON en mémoire ; aucun changement à la stratégie de chargement. 60 tests JVM ciblés réussis sans échec ni ignoré, compilation debug réussie et lint 0 erreur/16 avertissements. Aucun temps, FPS ou usage mémoire n’a été mesuré sur appareil.
- Le compilateur Compose écrit des rapports sous `app/build/compose_compiler_reports` et `app/build/compose_compiler_metrics` : `RecordSummary` est inféré stable, tandis que les `List` demeurent instables ; Strong Skipping est actif. Une décision du compilateur n’est pas une observation des recompositions. Aucune annotation `@Immutable` trompeuse n’a été ajoutée.
- **LeakCanary 2.14 :** absent par défaut, activable uniquement en debug avec `-PenableLeakCanary=true`. Cette variante ajoute `READ_EXTERNAL_STORAGE`, `WRITE_EXTERNAL_STORAGE` et `POST_NOTIFICATIONS` ainsi que des composants spécifiques, dont une Activity exportée. Les dumps mémoire peuvent contenir les données privées et documents : tester exclusivement sur un appareil de test et avec des données fictives, ne pas partager les dumps, les supprimer après usage. Pour revenir au build normal après diagnostic, utiliser `clean :app:assembleDebug` sans propriété. La désactivation ne supprime pas nécessairement les anciens dumps déjà présents sur l’appareil. Aucune analyse réelle de fuite n’a encore été effectuée.
- Les builds normaux debug/release vérifiés ne déclarent ni Internet, GPS, Bluetooth, NFC ni notification ; seul le droit interne des récepteurs est présent. À titre indicatif, le build debug normal incrémental beta.7 fait **11 576 429 octets** ; beta.6 fait **11 830 948 octets** ; beta.5 faisait **11 808 804 octets** ; beta.4 faisait **11 780 613 octets** et beta.3 **11 527 277 octets**, comme beta.2. En beta.1, le debug depuis une extraction propre faisait **11 527 273 octets** et la release d’essai non signée **7 894 029 octets**. Aucune release beta.7 n’a été assemblée ; ces fichiers ne sont ni une release signée ni une taille de téléchargement AAB et ne démontrent pas l’objectif de distribution.

### Stable : mesures et optimisation ciblée

Étendre les listes paresseuses et les clés stables aux autres écrans après examen ; étudier Paging si les volumes et le profilage le justifient. Observer la durée des requêtes avec les index et le coût de grandes images. Prévoir Macrobenchmark startup/défilement, baseline profile mesuré, captures avant/après, CI compatible et vérifications sur appareils représentatifs. R8 et réduction de ressources sur une configuration release testée ; ne pas confondre une clé debug avec une signature de production. Optimiser les dépendances sans SDK publicitaire ni analytique imposé.

Pour les autres futures photos et pièces jointes, lire les dimensions et l’orientation, décoder à une taille bornée et fermer les flux ; respecter le choix de qualité et conserver les documents originaux lorsqu’ils doivent pouvoir être réexportés à l’identique. `Size.ORIGINAL` ne réduit pas automatiquement une image Coil. Ne pas modifier avec perte les pièces jointes importées pour atteindre une cible de taille.

Un calcul SQL ne doit pas mélanger des agrégats imbriqués incorrectement : la consommation est fondée sur des **intervalles de pleins complets**, avec partiels intermédiaires, distances strictement positives et unités séparées ; les moyennes sont pondérées par la distance. Tester aussi les dates égales, corrections de compteur et montants facultatifs. Le parallélisme de plusieurs requêtes n’est pas nécessairement plus rapide sur une même base SQLite : mesurer.

## Note documentaire — rappels semi-automatiques, 2 novembre 2026

- [x] Décision de phase 3 consignée dans [le plan des priorités](PLAN-PRIORITES-APRES-BETA16.md#35-enrichissement-des-écrans-existants) ; aucun code, aucune version ni aucune donnée de l’application modifiés.
- [ ] Les mesures sur appareil, la validation de la CI et les éléments non cochés ci-dessous restent à faire. Aucun nouveau benchmark ou test d’application n’est revendiqué pour cette mise à jour documentaire.

## Checklist PWA 1.5.2-beta.2 — 4 novembre 2026

- [x] Détail de pièces, catégories, recherche plein écran, sous-types libres et lien Google Maps volontaire disponibles dans la candidate PWA ; écriture contrôlée en transaction et anciennes valeurs globales conservées dans les cas couverts.
- [ ] Mesurer sur appareils réels le chargement, la recherche dans la liste, le défilement et la mémoire ; aucun chiffre ni 60 fps garanti. Mesurer l’import/export 10 Mo reste à faire.
- [ ] Valider Safari iOS réel, les gestes système, Google/Apple Maps et les échanges détaillés avec Android beta.26. Sauvegarder avant le passage IndexedDB 2/3→4 ; retour direct ancien code impossible.
- [x] 39/39 tests unitaires, 17/17 tests d’archive et scénarios automatiques du carnet, précision et migrations Chromium/WebKit Linux ; les parcours interface, trajets, GPS simulé, catalogue et logo ont été testés sous Chromium. Aucun téléphone réel.

## Décision documentaire du 4 novembre — carnet PWA puis Android

- [x] Six enrichissements demandés et nomenclature complète consignés ; aucun de ces changements de carnet n’est encore implémenté.
- [ ] Mesurer sur appareils réels le sélecteur plein écran, recherche, saisies et conservation des données après développement ; Android PWA a fait l’objet d’un retour utilisateur d’installation/import, pas d’un benchmark. iPhone indisponible.

## Checklist beta.26 — 4 novembre 2026

- [x] Images sélectionnées bornées à 12 Mio, décodage sous-échantillonné, sortie à 1 600 px/3 Mio maximum et aperçu à 600 px ; traitement et lecture sur IO. Ce sont des limites de traitement, pas une mesure sur appareil ou une garantie contre toute mémoire insuffisante.
- [x] Après correction AndroidX : APK debug compilé, 73/73 tests JVM ciblés et pont photo fictif Android ↔ PWA candidate et stable réussis. Avant correction : suite complète 548 réussis/8 ignorés, lint zéro erreur/20 avertissements, 61 scénarios instrumentés compilés mais non exécutés.
- [x] APK debug local **16 121 476 octets**, soit environ **16,12 Mo décimaux / 15,37 Mio** : il dépasse l’objectif indicatif de 15 Mo. C’est un APK debug ; ce n’est ni la taille d’une release optimisée ni celle d’un AAB.
- [ ] Après correction EXIF : relancer la suite JVM complète et le lint ; recompilation des instrumentés non confirmée et exécution sur appareil toujours à faire.
- [ ] Taille release, démarrage froid/chaud, latence écran, défilement 1 000 éléments, RAM, batterie, import/export 10 Mo et fuites sur appareil : **non mesurés**. L’APK debug local ne valide pas la cible de distribution.
- [ ] Tests Windows, émulateur/téléphone, première CI GitHub, PWA iPhone et performances à réaliser ; R8 beta.25 n’est pas une validation de beta.26. `forkEvery=1` est inchangé ; compatibilité Windows des nouveaux graphiques natifs simulés non vérifiée ici.

## Checklist beta.25 — 4 novembre 2026

- [x] Variante d’essai R8 isolée de l’installation normale compilée et contrôlée statiquement ; lint vital séparé sans anomalie. L’APK de test signé debug fait 1 989 477 octets localement : **ni release de production, ni objectif de taille démontré, ni test de fonctionnement réel**. La configuration release habituelle n’est pas modifiée.
- [x] Debug compilé ; 76/76 tests JVM ciblés non minifiés ; lint debug zéro erreur/17 avertissements ; les 57 instrumentés debug sont compilés mais non exécutés. Pas de suite JVM complète beta.25.
- [ ] Démarrage, sauvegardes, migrations et navigation dans la variante R8 : essais sur émulateur/téléphone à faire. Taille signée de production, R8 de production, AAB, profils, RAM, fluidité et durée d’import/export non validés.
- [ ] Première exécution GitHub, essai Windows et validation iPhone de la candidate PWA non effectués.

## Checklist beta.24 — 4 novembre 2026

- [x] Compilation debug et contrôle fonctionnel Linux : Suite JVM Linux : 534 tests, 526 réussis, huit retours PWA ignorés faute de fixtures et aucun échec. Un test tactile ajouté ensuite a été vérifié avec un reciblage de 50/50 tests ; ces deux lancements ne sont pas une unique suite de 535 tests. Les 57 scénarios instrumentés sont compilés, pas exécutés ; aucun nouvel essai Windows, GitHub, émulateur, téléphone ou PWA pour ce lot.
- [x] Lint : zéro erreur et 17 avertissements ; aucun nouveau benchmark. L’APK **debug** construit localement pèse 12 217 651 octets, ce n’est ni l’APK release ni une mesure de performance sur appareil.
- [x] Après 10 secondes, reprise manuelle proposée sans pourcentage fictif ni redémarrage automatique. Le délai est un choix d’interface, **pas une mesure** de démarrage ou une garantie de récupération.
- [ ] R8, profils, démarrages, fluidité, RAM, import/export 10 Mo, batterie et taille release : non mesurés sur appareil. Aucun gain Windows ni sur téléphone revendiqué.
- [ ] Tests sur émulateur/téléphone/Windows, première exécution GitHub et validation de la PWA candidate sur iPhone à réaliser.

## Checklist beta.23 — 3 novembre 2026

- [x] Affichage indéterminé pendant la lecture des résumés et de l’Undo ; aucun faux pourcentage, aucune mesure de vitesse ou de fluidité déduite de cet affichage. La navigation reste composée mais masquée durant l’attente.
- [x] Suite JVM Linux beta.23 : **530 tests, 522 réussis, huit ignorés faute de fixtures PWA et aucun échec**, sur 76 classes. Lancement incrémental : 6 min 59 s, hors compilations et téléchargements ; ce temps ne prédit pas Windows. Le contrôleur accepte uniquement ces huit omissions attendues ; aucun marqueur CloseGuard reconnu, sans preuve d’absence de fuite. Aucun nouveau parcours PWA n’a été exécuté pour ce lot. Les tests Python réussissent : rapports 19/19, workflow 6/6, archiveur 18/18. APK debug, tests JVM et 57 scénarios instrumentés compilés ; scénarios instrumentés non exécutés. Lint : 0 erreur et 17 avertissements.
- [x] Ciblage final ViewModel et Undo : 41/41.
- [x] APK **debug** construit : 12 554 435 octets ; applicationId `com.vigieauto.app`, code 27, min 26, target 36. Ce n’est ni une release optimisée, ni une mesure de téléchargement AAB.
- [ ] Démarrage à froid/chaud, ouvertures, défilement à 1 000 éléments, import/export 10 Mo, RAM, batterie, taille release, R8, baseline profile et fuites sur appareils : **non mesurés** ; les cibles restent des objectifs, pas des garanties.
- [ ] Aucun gain de performance Windows ou physique revendiqué ; validation Windows beta.23, GitHub, émulateur, téléphone et iPhone pour la candidate PWA encore à faire. `forkEvery=1` reste inchangé.

## Checklist beta.22 — 2 novembre 2026

- [x] Nettoyage ordonné en tests simulés, sans modification du cycle de vie Room réel ; trois scénarios de régression. Sur Linux, deux avertissements CloseGuard reproduits avant correction ne réapparaissent pas lors de deux ciblages après correction. Le marqueur connu est signalé de façon non bloquante dans les rapports ; sa recherche n’est pas exhaustive. `forkEvery=1` est inchangé.
- [x] Suite JVM complète : 517 réussis, aucun ignoré ou échec, sur 75 classes ; huit fixtures PWA fictives réutilisées de validations antérieures. Durée incrémentale Linux : 8 min 33 s, hors compilation initiale et génération antérieure des fixtures ; aucune extrapolation Windows. Aucun marqueur CloseGuard reconnu dans ces rapports, sans preuve d’absence de fuite.
- [x] APK **debug** beta.22 compilé : 12 184 883 octets ; cette taille ne mesure ni une release optimisée ni un téléchargement AAB. Les 57 scénarios instrumentés sont compilés, pas exécutés ici ; lint rapporte 0 erreur et 17 avertissements.
- [ ] R8, profilage mémoire, fuites sur appareil, baseline profile, mesures de démarrage, défilement, import/export, batterie et taille release : **non mesurés**. Aucun gain de performance de l’application ou des tests sur Windows n’est revendiqué.
- [ ] Essais sur émulateur et téléphone, validation Windows beta.22, première exécution GitHub et validation iPhone de la PWA candidate : à faire.

## Checklist beta.21 — 2 novembre 2026

- [x] Workflow de compilation/lint/tests JVM préparé ; contrôle strict des résultats et 57 tests instrumentés compilés. Option manuelle API 26 et 36 préparée. Voir [CI-VERIFICATIONS.md](CI-VERIFICATIONS.md).
- [x] La suite JVM locale recense 514 tests sur 75 classes : **506 réussis, huit ignorés faute de fixtures PWA et aucun échec** ; les rapports réels ont été contrôlés. APK debug et 57 scénarios instrumentés compilés ; lint : 0 erreur et 17 avertissements. Les tests de scripts passent (rapports 17/17, workflow 6/6 et archiveur 16/16), ainsi que l’analyse statique actionlint. Deux avertissements CloseGuard SQLite/Room subsistent dans une simulation, sans cause déterminée.
- [ ] Diagnostiquer les deux avertissements CloseGuard SQLite/Room vus dans la suite simulée, sans présumer d’une fuite réelle. L’isolation `forkEvery=1` est inchangée.
- [ ] Première exécution GitHub, tests sur émulateur et téléphone, mesures Windows et performances physiques non effectués ; aucun gain ou objectif chiffré revendiqué. R8 et profils restent à étudier. Les huit ponts peuvent être ignorés en CI si les fixtures PWA sont absentes, sans être comptés comme réussis.

## Checklist beta.20 / PWA 1.5.2-beta.1 — 2 novembre 2026

- [x] Pont fictif Room → PWA Chromium/WebKit → IndexedDB après réouverture/édition → Room, 11 collections et nombres exacts ; refus avant remplacement et migration PWA 1.5.1 vérifiés. 30 tests unitaires PWA ; 2 tests Android ciblés Gradle et retour WebKit séparé ; archiveurs Android/PWA 15/15 chacun.
- [x] APK debug beta.20 et 57 scénarios instrumentés compilés ; lint 0 erreur/17 avertissements. Aucune modification métier Android, Room 15 ni format JSON v3. Playwright de test 1.55.1 ; `npm audit` sans vulnérabilité à ce contrôle.
- [ ] Aucun benchmark iPhone/Android physique, aucun test instrumenté exécuté, aucune suite Android complète beta.20 ni mesure Windows beta.20. La candidate n’est pas validée sur iPhone.
- [ ] Finitions, CI, R8, profils et mesures des cibles restent à faire. Le fichier de 7 Mio traité localement par Node n’est pas un benchmark sur téléphone et ne valide pas la cible 10 Mo.
- [ ] Une première tentative Gradle a perdu son daemon ; essais ciblés réussis ensuite séparément. Aucun gain de temps ou cause certaine n’est revendiqué. Les trois avertissements CloseGuard historiques restent à diagnostiquer.
- [ ] Faire les copies externes avant migration PWA IndexedDB 2→3 ; le retour direct à 1.5.1 sur la même base est bloqué. Conserver les originaux, les valeurs fonctionnelles non représentables sont refusées.

## Checklist beta.19 — 2 novembre 2026

- [x] Suppression, image typée et restauration transactionnelles testées sur données fictives, y compris valeurs de plusieurs Mio et rollback. 512 tests JVM sur 74 classes réussis, sans échec ni ignoré, avec sept fichiers fictifs ; lint 0 erreur/17 avertissements. La suite incrémentale Linux a pris 7 min 35 s, hors compilations initiales et génération des fixtures ; ce temps ne prédit pas Windows. Pont fictif Undo Room → vraie PWA Chromium → Room vérifié ; PWA 20/20, consommation 7/7, archiveurs Android 14/14 et PWA 11/11. APK debug compilé et 57 scénarios instrumentés compilés mais non exécutés sur appareil ou émulateur. Trois avertissements CloseGuard SQLite/Room en tests simulés restent à diagnostiquer ; aucun essai Windows beta.19 ni benchmark physique. `forkEvery=1` inchangé.
- [x] Pont fictif Android → PWA Chromium → Android pour un élément avant/après suppression puis après Undo ; PWA et JSON v3 inchangés. Les tests ne garantissent pas le comportement sur téléphone.
- [x] APK debug et tests instrumentés compilés : APK debug 12 184 828 octets, SHA-256 `c4315638af38e679dfd25f52db4282e34c01aff6cf04e4ecc18cedc9cc444658`, `com.vigieauto.app`, versionCode 23, min API 26/target 36 ; ni release signée ni mesure AAB ; 57 scénarios instrumentés compilés, aucun exécuté sur appareil ou émulateur
- [ ] Aucun essai sur appareil/émulateur, Windows beta.19 ou Safari iPhone réel ici. Exécuter les tests instrumentés après sauvegarde externe.
- [ ] Durée d’Undo, migration, démarrage, FPS, RAM, batterie, import/export 10 Mo, taille release/AAB : non mesurés sur appareil ; aucun objectif chiffré n’est déclaré atteint. Les images de plusieurs Mio peuvent avoir un coût mémoire/stockage à mesurer.
- [ ] Corriger et vérifier séparément la précision des grands nombres PWA ; conserver les originaux. Changement du thème et édition de points CQ PWA ont aussi les limites documentées.
- [ ] Le manifeste de test historique PWA fixe Playwright 1.55.0, signalé par `npm audit` pour [GHSA-7mvr-c777-76hp](https://github.com/advisories/GHSA-7mvr-c777-76hp). Tests beta.19 relancés avec 1.55.1 installé localement sans modifier le manifeste ; correction permanente à faire. Ni runtime PWA ni APK ne contiennent Playwright.

## Checklist beta.18 — 1er novembre 2026

- [x] Trois migrations distinctes CQ/réglages vérifiées en JVM avec jeux fictifs ; 490 tests JVM sur 72 classes réussis, zéro échec ni ignoré, avec sept fichiers fictifs ; lint 0 erreur/17 avertissements. La suite incrémentale a pris 9m 28s sous Linux, hors compilation initiale et génération des fixtures ; cette durée ne prédit pas le temps Windows. APK debug compilé et 54 scénarios instrumentés compilés mais non exécutés sur appareil ou émulateur. Aucun essai Windows beta.18 ni benchmark physique ; `forkEvery=1` inchangé.
- [x] Ponts fictifs Room ↔ PWA Chromium, dont modèle CQ créé, contrôle effectué puis suppression du modèle ; les deux retours sont importés en Room. PWA 20/20 et sept scénarios consommation.
- [x] APK debug : 12152060 octets, SHA-256 `f1e8a18abf5566f5d04691ecedff1457eae0c3dfcd630df8b9046593c10d2360`, `com.vigieauto.app`, versionCode 22, min API 26/target 36. Ce n’est ni une release signée ni une mesure AAB.
- [ ] Aucun des 54 scénarios instrumentés n’a été exécuté sur appareil/émulateur ; aucun essai Windows beta.18, ni Safari iPhone réel.
- [ ] Durée de migration, démarrage, FPS, RAM, batterie, import/export sur téléphone et taille release/AAB : non mesurés ; aucun objectif chiffré n’est déclaré atteint. Undo immédiat et précision PWA restent à réaliser.
- [ ] Conserver les sauvegardes originales : la PWA peut arrondir certains grands nombres et perd des champs inconnus lors du changement de thème ; les points CQ modifiés peuvent perdre leurs extensions.

## Checklist beta.17 — 1er novembre 2026

- [x] Documents et migration 10→11 vérifiés sur données fictives : 428 tests JVM réussis sans échec ni ignoré avec cinq fichiers fictifs ; lint 0 erreur/17 avertissements. 59 tests ciblés réussis. APK debug et 39 scénarios instrumentés compilés ; aucun scénario instrumenté n’a été exécuté sur appareil ou émulateur. Précision, absence/null, pièce jointe de 5 Mio, extensions, corruption et rollback sont couverts.
- [x] Suite complète incrémentale, avec cinq fixtures et un worker : 7 min 18 s sous Linux ; hors première compilation et génération des ponts. Cette mesure n’est pas extrapolable à Windows.
- [x] APK debug : 12086524 octets, `com.vigieauto.app`, versionCode 21, min API 26/target 36. Ce n’est ni une release signée ni une taille de téléchargement.
- [x] Pont fictif Android → PWA sous Chromium → Android ; téléchargement de 5 Mio vérifié en SHA, ajout d’un autre document, aucune mesure sur iPhone. `forkEvery=1` et un worker restent inchangés.
- [ ] Aucun des 39 scénarios instrumentés n’a été exécuté sur appareil/émulateur ; beta.17 n’a pas été vérifiée sur Windows ici. Le rapport utilisateur de beta.12 reste à 25 min 26 s et n’est pas une mesure beta.17.
- [ ] Durée de migration, démarrage, FPS, RAM, batterie, import/export sur téléphone et taille release/AAB : non mesurés. Aucun objectif chiffré n’est déclaré atteint. Trois collections et l’Undo immédiat restent à réaliser.

## Checklist beta.16 — 1er novembre 2026

- [x] Symptômes et migration 9→10 vérifiés sur données fictives : 395 tests JVM réussis sans échec ni ignoré avec quatre fichiers fictifs ; lint 0 erreur/17 avertissements. 126 tests ciblés réussis. APK debug et 34 scénarios instrumentés compilés ; aucun scénario instrumenté n’a été exécuté sur appareil ou émulateur. Précision, absence/null, grandes valeurs, extensions, corruption et rollback sont couverts.
- [x] Suite complète incrémentale, avec fixtures et un worker : 6 min 40 s sous Linux ; hors première compilation et génération du pont. Cette mesure n’est pas extrapolable à Windows.
- [x] APK debug : 12070136 octets, `com.vigieauto.app`, versionCode 20, min API 26/target 36. Ce n’est ni une release signée ni une taille de téléchargement.
- [x] Pont fictif Android → PWA sous Chromium → Android, dont édition et résolution d’un symptôme ; aucune mesure sur iPhone. `forkEvery=1` et un worker restent inchangés.
- [ ] Aucun des 34 scénarios instrumentés n’a été exécuté sur appareil/émulateur ; beta.16 n’a pas été vérifiée sur Windows ici. Le rapport utilisateur de beta.12 reste à 25 min 26 s et n’est pas une mesure beta.16.
- [ ] Durée de migration, démarrage, FPS, RAM, batterie, import/export sur téléphone et taille release/AAB : non mesurés. Aucun objectif chiffré n’est déclaré atteint. Quatre collections et l’Undo immédiat restent à réaliser.

## Checklist beta.15 — 1er novembre 2026

- [x] Dépenses et migration 8→9 vérifiées sur données fictives : 365 tests JVM réussis sans échec ni ignoré avec quatre fichiers fictifs ; lint 0 erreur/17 avertissements. 116 tests ciblés réussis. APK debug et 29 scénarios instrumentés compilés ; aucun scénario instrumenté n’a été exécuté sur appareil ou émulateur. Précision, absence/null, grandes valeurs, extensions, corruption et rollback sont couverts.
- [x] Suite complète incrémentale, avec fixtures et un worker : 5 min 49 s sous Linux ; hors première compilation et génération du pont. Cette mesure n’est pas extrapolable à Windows.
- [x] APK debug : 12053756 octets, `com.vigieauto.app`, versionCode 19, min API 26/target 36. Ce n’est ni une release signée ni une taille de téléchargement.
- [x] Pont fictif Android → PWA sous Chromium → Android, dont modification d’une dépense ; aucune mesure sur iPhone. `forkEvery=1` et un worker restent inchangés.
- [ ] Aucun des 29 scénarios instrumentés n’a été exécuté sur appareil/émulateur ; beta.15 n’a pas été vérifiée sur Windows ici. Le rapport utilisateur de beta.12 reste à 25 min 26 s et n’est pas une mesure beta.15.
- [ ] Durée de migration, démarrage, FPS, RAM, batterie, import/export sur téléphone et taille release/AAB : non mesurés. Aucun objectif chiffré n’est déclaré atteint. Cinq collections et l’Undo immédiat restent à réaliser.

## Checklist beta.14 — 1er novembre 2026

- [x] Rappels et migration 7→8 vérifiés sur données fictives : 337 tests JVM réussis sans échec ni ignoré avec quatre fichiers fictifs ; lint 0 erreur/17 avertissements. 84 tests ciblés réussis. APK debug et 25 scénarios instrumentés compilés ; aucun scénario instrumenté n’a été exécuté sur appareil ou émulateur. Édition, « fait », précision, absence/null, grandes valeurs, extensions, corruption et rollback sont couverts.
- [x] Suite complète incrémentale, avec fixtures et un worker : 5 min 41 s sous Linux ; hors première compilation et génération du pont. Cette mesure n’est pas extrapolable à Windows.
- [x] APK debug : 12037368 octets, `com.vigieauto.app`, versionCode 18, min API 26/target 36. Ce n’est ni une release signée ni une taille de téléchargement.
- [x] Pont fictif Android → PWA sous Chromium → Android, dont modification et achèvement d’un rappel non récurrent ; aucune mesure sur iPhone. `forkEvery=1` et un worker restent inchangés.
- [ ] Aucun des 25 scénarios instrumentés n’a été exécuté sur appareil/émulateur ; beta.14 n’a pas été vérifiée sur Windows ici. Le rapport utilisateur de beta.12 reste à 25 min 26 s et n’est pas une mesure beta.14.
- [ ] Durée de migration, démarrage, FPS, RAM, batterie, import/export sur téléphone et taille release/AAB : non mesurés. Aucun objectif chiffré n’est déclaré atteint. Six collections et l’Undo immédiat restent à réaliser.

## Checklist beta.13 — 1er novembre 2026

- [x] Trajets manuels, GPS importés et migration 6→7 contrôlés sur données fictives ; 304 tests JVM réussis sans échec ni ignoré avec quatre fichiers fictifs ; lint 0 erreur/17 avertissements. 34 tests ciblés réussis. APK debug et 21 scénarios instrumentés compilés ; aucun scénario instrumenté n’a été exécuté sur appareil ou émulateur. Données atypiques historiquement valides sur les trajets manuels, null/absence, lexèmes, extensions et rollback sont couverts.
- [x] APK debug : 12208555 octets, `com.vigieauto.app`, versionCode 17, min API 26/target 36. Ce n’est ni une release signée ni une mesure de téléchargement.
- [x] Les quatre scénarios de pont restent présents ; garde précoce contrôlée avec fixtures présentes, absentes, partielles et chemin personnel invalide. `forkEvery=1` et un worker restent inchangés. Ce n’est pas un gain Windows mesuré.
- [ ] Aucun des 21 scénarios instrumentés n’a été exécuté sur appareil/émulateur ; beta.13 n’a pas été vérifiée sur Windows ici. Le rapport utilisateur de beta.12 reste à 25 min 26 s et n’est pas une mesure beta.13.
- [ ] Durée de migration, démarrage, FPS, RAM, batterie, import/export sur téléphone et taille release/AAB : non mesurés. Aucun objectif chiffré n’est déclaré atteint. Sept collections et l’Undo immédiat restent à réaliser.

## Checklist beta.12 — 1er novembre 2026

- [x] Pleins et migration 5→6 contrôlés sur données fictives, dont fidélité, gros champs, rollback, édition et corruption : 108 tests ciblés réussis ; 270 tests JVM réussis, sans échec ni ignoré avec les fichiers fictifs ; lint 0 erreur/17 avertissements. APK debug et tests instrumentés compilés ; pont fictif vers la PWA sous Chromium et retour Android.
- [x] APK debug : 12066035 octets, `com.vigieauto.app`, versionCode 16, min API 26/target 36. Ce n’est ni une release signée, ni une mesure de téléchargement.
- [ ] Aucun des 17 tests instrumentés n’a été exécuté sur appareil/émulateur ; beta.12 n’a pas été testée sur Windows ici. Une commande présentée comme beta.11 a terminé en 24 min 27 s ; le rapport Windows reçu depuis indique 270 tests, dont 266 réussis et 4 ignorés, avec les classes beta.12 ; l’utilisateur indique 25 min 26 s pour le lancement de ce rapport.
- [ ] Temps de migration, démarrage, FPS, RAM, batterie, import/export sur téléphone et taille release/AAB : non mesurés. Aucun objectif chiffré n’est déclaré atteint.
- [ ] Huit collections à migrer et Undo immédiat à réaliser ; `forkEvery=1` reste inchangé, sans nouveau gain Windows revendiqué.

## Checklist beta.11 — 1er novembre 2026

- [x] Migration des interventions, longs champs et rollback contrôlés sur données fictives ; 244 tests JVM réussis, sans échec ni ignoré avec les jeux de pont fictifs ; lint 0 erreur/17 avertissements ; 72 tests ciblés réussis. APK debug et tests instrumentés compilés ; pont fictif PWA sous Chromium.
- [x] APK debug : 11971832 octets, `com.vigieauto.app`, versionCode 15, min API 26/target 36. Ce n’est pas une release signée ni un AAB.
- [ ] Tests instrumentés sur appareil/émulateur non réalisés ici ; commande annoncée beta.11 réussie sur le Windows de l’utilisateur en 24 min 27 s ; rapport reçu depuis sur des classes beta.12, pour lequel l’utilisateur indique une durée totale de 25 min 26 s. Temps de migration, démarrage, FPS, RAM, batterie et import/export sur téléphone : non mesurés.
- [ ] Taille release signée/AAB, neuf collections typées restantes et Undo immédiat : à faire. Aucun objectif de performance n’est déclaré atteint.
- [ ] Performance des tests Windows : une commande annoncée beta.11 a pris 24 min 27 s pour build + tests et beta.10 avait pris 15 min 28 s ; rapport 8 min 44,10 s et 4 ignorés sur 224. La configuration de tests reste inchangée. Sur 93 tests ciblés Linux, un essai de regroupement faisait 67,75 → 43,56 s ; il ne prouve pas un gain Windows et l’essai complet initial a perdu son daemon sous forte pression mémoire. Réduire les initialisations reste à fiabiliser sans perdre de tests ou d’isolation.

### Rapport Windows de 270 tests communiqué ensuite

- [x] 266 tests réussis, 4 ignorés, zéro échec ; durée des classes cumulée 11 min 19,12 s. La présence des tests Room 6 / pleins et le `versionName` courant concordent avec beta.12. L’utilisateur indique 25 min 26 s pour le lancement correspondant, soit 14 min 06,88 s d’écart arithmétique avec les durées de classes ; cet écart ne peut pas être attribué à la seule compilation.
- [ ] D’après les noms et annotations beta.12, 33 classes Robolectric cumulent 11 min 15,63 s ; 12 classes hors Robolectric réalisent 114 tests en 3,49 s. Mesurer séparément initialisation et scénarios Compose/Room avant tout changement.
- [ ] Les trois classes de pont 100 % ignorées totalisent 42,654 s dans le rapport. Étudier une vérification précoce des fixtures sans masquer les tests ni leur statut ; conserver le vrai aller-retour PWA lorsque les fixtures sont fournies.

### Confirmation de version et prototype de pont

- [x] Le dossier actuellement montré par l’utilisateur, `C:\Users\lixe\Documents\VigieAuto`, indique `versionCode = 16` et `versionName = "0.4.0-beta.12"` ; c’est cohérent avec les classes du rapport de 270 tests. L’utilisateur précise que ce lancement a duré 25 min 26 s. Cette lecture ne prouve pas que tous les fichiers sont identiques au ZIP livré.
- [ ] Essai exploratoire Linux sur les trois classes de pont, sans fichiers de retour : dans un même lancement Gradle, la tâche de référence a pris 10,84 s et le prototype de vérification précoce 2,20 s, avec `forkEvery=1` et un worker ; un passage par mode, dans cet ordre. Les deux rapports gardent les mêmes 4 tests, tous ignorés. Avec les quatre fixtures fictives, les quatre tests ont réellement réussi sous Gradle ; en JUnit, une fixture présente et une absente donnent une réussite et un ignoré, et un chemin personnel invalide échoue toujours. À ce stade, avant beta.13, ce prototype extérieur n’était pas intégré ; une garde équivalente est ensuite entrée dans le projet en beta.13, sans mesure Windows ni preuve d’un gain global. Les assertions ont été conservées ; les quatre ignorés ne sont pas des réussites.

### Mesure exploratoire après le retour beta.11

- [ ] Sur Linux et un échantillon identique de 75 tests / 9 classes de beta.12 : tâche de tests 84,41 s (`forkEvery=1`) puis 70,95 s (`forkEvery=2`), un passage par mode. Le second mode a aussi émis cinq avertissements CloseGuard ; cela n’est pas un gain validé sur Windows ni une preuve sur l’application réelle.
- [ ] Une autre sélection de 78 tests incluait `BackupVerificationTest` : délai dépassé sous `forkEvery=1`, succès sous `forkEvery=2`. La comparaison à 75 tests omettait explicitement cette classe, mais aucun test n’a été désactivé dans le projet. Comprendre l’intermittence et la fermeture des ressources, répéter puis valider toute la suite avant de changer l’isolation. Ne pas demander à l’utilisateur de relancer 24 minutes pour un diagnostic dont le rapport existe déjà.

## Checklist beta.10 — 1er novembre 2026

- [x] Migration et reconstruction des véhicules couvertes par des essais fictifs, dont une photo étiquetée PNG de 5 Mio de données ; 224 tests JVM réussis sans échec ni ignoré, avec les jeux de pont fictifs ; lint 0 erreur/17 avertissements. Compilation debug et des tests instrumentés réussie ; 89 tests ciblés également réussis. Cela ne mesure ni temps d’import/export sur appareil ni consommation mémoire.
- [x] APK debug incrémental : 12084372 octets, `com.vigieauto.app`, versionCode 14, min API 26/target 36. Ce n’est pas une release signée ni une taille de téléchargement AAB.
- [ ] Tests instrumentés Room sur appareil/émulateur : non réalisés ici. Depuis la livraison, beta.10 a réussi sur Windows avec 220 tests réussis et 4 ignorés, sans lint ni test instrumenté dans la commande. Aucune compatibilité physique API 26 affirmée.
- [ ] Temps de migration, démarrage, frames, RAM, batterie et import/export de 10 Mo sur appareil : non mesurés. La reconstruction d’une grande photo crée plusieurs copies en mémoire ; aucun gain n’est promis.
- [ ] Taille release signée/AAB et performances de distribution : non mesurées. Undo immédiat et les dix autres sources complètes restent à développer.

## Checklist beta.9 — 1er novembre 2026

- [x] Correction limitée aux tests et à leur configuration ; aucune modification des stratégies de chargement ou du stockage métier. Sur Linux : 204 tests JVM réussis, sans échec ni ignoré, avec les jeux de pont fictifs déjà générés ; lint 0 erreur/17 avertissements. Les 10 tests ciblés ont aussi réussi quatre fois en mode NATIVE et quatre fois en mode LEGACY, avec un processeur actif.
- [x] APK debug incrémental : 11 922 680 octets, `com.vigieauto.app`, versionCode 13, min API 26/target 36. Ce n’est ni une release ni une mesure de téléchargement ou de performance ; la taille varie selon le build.
- [ ] Durées de démarrage, frames, RAM, batterie et import/export de 10 Mo sur appareil : non mesurés.
- [x] Après livraison, test ciblé et tâche complète de tests JVM avec assemblage debug réussis sur le Windows de l’utilisateur ; temps respectifs 3 min 31 s et 5 min 7 s, deuxième commande incrémentale (47 tâches à jour sur 52). Ce ne sont pas des benchmarks comparables.
- [ ] Taille release signée/AAB et compatibilité physique API 26 : non mesurées/non effectuées ; persistance de l’absence de l’échec intermittent Windows non garantie.

## Checklist beta.8 — 1er novembre 2026

- [x] Compilation et contrôles automatisés organisés par lots ; détails dans l’historique. La navigation utilise une bibliothèque supplémentaire : impact sur démarrage et mémoire **non mesuré sur appareil**.
- [x] Aucun raccourci destructif sur les données pour accélérer la livraison ; Room/JSON restent inchangés.
- [x] APK debug incrémental beta.8 : 12 233 209 octets, applicationId `com.vigieauto.app`, min API 26 et target 36. Il ne s’agit pas d’une mesure de release signée ou de téléchargement, ni d’une preuve de l’objectif de taille.
- [ ] Tests physiques de démarrage, fluidité/1 000 lignes, RAM, batterie et import/export de 10 Mo : non effectués.
- [ ] Taille et performances d’une release signée/AAB et compatibilité physique API 26 : non mesurées.

## Checklist de release

- [ ] Appareil(s), version Android, fréquence écran, build, jeu de données, état de stockage et protocole documentés.
- [ ] Cold/warm start et ouverture d’écran mesurés ; distinguer toute migration du lancement ordinaire.
- [ ] Défilement d’un jeu de 1 000 entrées mesuré avec FrameTimingMetric et percentiles.
- [ ] StrictMode debug et fuites examinés ; faux positifs et exceptions justifiés.
- [ ] Stabilité et recompositions Compose examinées sans annotations trompeuses.
- [ ] Import/export 10 Mo mesurés, progression et réactivité vérifiées.
- [ ] RAM, batterie et taille de release/AAB mesurées dans des scénarios reproductibles.
- [ ] Aucune régression fonctionnelle, confidentialité et sauvegardes testées avant optimisation.
- [ ] Rapports et limites résumés dans l’historique et le récapitulatif fonctionnel ; ne pas cocher sans preuve.
