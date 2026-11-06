# Architecture — Android 0.4.0-beta.20

Cette préversion ajoute Room 15 et l’Undo transactionnel du carnet après les migrations de contenu Room 14, sans changer le format d’échange. Elle n’est pas la 0.4.0 stable. L’architecture est **améliorée, mais pas entièrement normalisée** : le moteur de sauvegarde reste commun aux modules.

```text
Activity @AndroidEntryPoint → Compose → MainViewModel @HiltViewModel
                                        ↓
          contrats métier + JournalActions / AddVehicle
                                        ↓
 adaptateurs véhicule, entretien, plein, trajet, rappel, affichage,
 catalogue, réglages et sauvegarde → DAO typés ou moteur JSON commun
                                        ↓
                une base Room 15 injectée par Hilt + fichiers temporaires privés
```

- `VigieAutoApplication` est annotée `@HiltAndroidApp`. Le module Hilt fournit **une instance Room par processus**, en WAL, le moteur `BackupRepository`, un registre des imports actifs et les dispatchers. Il ne conserve aucune Activity.
- `domain/model/` expose des modèles tels que `RecordSummary`, `Suggestion` et les cinq index métier. `domain/repository/` contient les interfaces. Les écrans et le ViewModel n’importent plus les entités Room. Les conversions sont dans `data/mapper/` et les adaptateurs dans `data/repository/`.
- `JournalActions` dirige ouvertures, enregistrements et suppressions vers le module approprié ; `AddVehicle` délègue au contrat véhicules. Le ViewModel reçoit ses dépendances et peut être testé avec de faux dépôts, sans base ni `Application`.
- Les contrats spécialisés ne sont **pas** encore des stockages indépendants complets : leurs écritures utilisent toutes le même `BackupRepository`, garant des transactions et de la compatibilité JSON. Il reste à le décomposer proprement si cela apporte une valeur démontrée. Les contrats de dépôt ne renvoient pas encore tous `RepositoryResult` directement et les autres phases fonctionnelles restent à faire.

**Périmètre beta.20 :** tests et documentation du pont de précision, code métier Android et Room 15 identiques à beta.19. PWA candidate IndexedDB v3 ; détails et limites dans `PRECISION-SAUVEGARDES.md`.

## Tests JVM et fermeture des scénarios (beta.9)

Sous Windows x64, les tests Gradle utilisent le SQLite natif de Robolectric au lieu de son shadow LEGACY par défaut. Les tests de navigation ferment leur Activity et attendent la fin du `viewModelScope`, sans désactiver les assertions. Cela ne modifie pas la base de l’application réelle. Après livraison, l’utilisateur a réussi le test ciblé et la tâche de tests JVM sur Windows ; l’intermittence ne permet pas de garantir l’absence définitive de l’échec et l’architecture de sa JVM n’apparaît pas dans l’extrait. Voir `TESTS-WINDOWS.md`.

## Données : projections typées et réserve de compatibilité

Les 11 collections restent prises en charge. Les anciennes tables `records`/`payload_chunks` ont été remplacées en 2→3 par `compat_records`/`compat_chunks`. En Room 14, `complete_vehicles`, `complete_services`, `complete_fills`, `complete_trips`, `complete_reminders`, `complete_expenses`, `complete_symptoms`, `complete_documents`, `complete_templates`, `complete_checks` et `complete_settings`, avec leurs tables de valeurs, points, résultats ou nœuds et blocs, constituent les sources complètes des collections. `compat_records` sert aux résumés et empreintes ; `compat_chunks` reste dans le schéma pour la compatibilité des migrations mais ne contient plus les objets complets des onze collections normalement migrées ou importées. Les cinq tables `vehicles`, `services`, `fills`, `trips`, `reminders` restent des projections, non des fiches complètes. Une collection locale inconnue est refusée.

Les modèles `*Index` exposent des résumés, dont certains textes sont limités à 512 caractères. Pour éditer un véhicule, le dépôt reconstruit ses champs complets et vérifie son empreinte, pas sa projection. Les formulaires ont leurs propres limites : un texte importé trop long peut empêcher l’édition, sans troncature silencieuse.

Les migrations 1→2→3→4→5→6→7→8→9→10→11→12→13→14→15 et les remplacements confirmés restent transactionnels ; blocs, empreintes et relations sont contrôlés. En particulier 11→12 migre les modèles, 12→13 les contrôles et 13→14 les réglages : chacune relit et compare avant retrait des anciens blocs. La migration 14→15 initialise les tables nécessaires à l’Undo. Aucun repli destructif n’est configuré. Les versions JSON 1 à 3 sont distinctes des versions Room. Voir les guides `MIGRATION-V*.md` et `FORMAT-PONT.md`.

## Résultats et état de l’interface (beta.8)

`RepositoryResult.Success` / `Error` sont créés au bord des opérations des dépôts appelées par `MainViewModel` ; `repositoryResult` propage `CancellationException` et ne capture pas les erreurs fatales. Les erreurs sont transformées en messages sûrs à l’interface, tandis que `InteractionState.busy` représente le chargement. Si une opération qui a activé `busy` est annulée, elle le libère avant de propager l’annulation ; une annulation du catalogue ou de l’initialisation ne déverrouille pas une autre écriture en cours. Les contrats des dépôts retournent encore leurs types et exceptions existants : ce n’est pas une uniformisation complète de toutes leurs signatures ni un `UiState` générique unique. Le nettoyage des copies temporaires garde son traitement particulier.

`RecordFidelity`, préparatoire en beta.8, est utilisé lors des migrations et écritures des onze collections depuis beta.18 ; l’export vérifie la reconstruction et l’empreinte. Les décimales, présence/null, champs inconnus et médias sont détaillés dans `PLAN-MIGRATION-TYPEE.md`. Le contrôle strict refuse certaines entrées autrefois lues de façon ambiguë ; sauvegarder l’original.

## Coroutines et durée de vie

- Le répertoire des copies temporaires, leur nettoyage, la lecture du catalogue et les opérations du moteur sont sollicités sur un dispatcher IO injecté. Les conversions de listes Room utilisent `flowOn(Default)` ; Room possède aussi ses propres exécutors. Ce découpage **ne prouve pas** un gain ni l’absence de travail principal : mesurer avec StrictMode et un profilage réel.
- Le catalogue est chargé lors de l’ouverture du formulaire véhicule, puis gardé dans le ViewModel ; si sa lecture échoue, un catalogue vide et les énergies de base permettent toujours la saisie libre. La fermeture du ViewModel annule son chargement.
- Une copie d’import ou de vérification reste protégée pendant sa validation et jusqu’à la décision. Un registre injecté coordonne les copies actives avec le nettoyage des orphelins. Annulation, fermeture de l’écran et arrêt avant validation sont testés ; le nettoyage est demandé hors du thread principal. `ImportLeaseRegistry.release` ne vérifie pas le résultat de `File.delete()` : un échec peut être silencieux et une copie privée non chiffrée peut rester. Les fichiers orphelins sont retentés au prochain nettoyage si le stockage le permet. L’annulation est vérifiée entre blocs et enregistrements ; une lecture système bloquée ou le décodage d’un très grand objet ne sont pas interrompus instantanément.
- `Flow<List<…>>` charge encore des listes complètes ; il n’y a pas de pagination. Aucun résultat chiffré n’est garanti pour 1 000 éléments ou des fichiers de 10 Mo.

## Édition de la fiche véhicule (beta.7)

`VehicleEditForm` conserve temporairement les champs modifiables avec `rememberSaveable` ; le ViewModel garde la cible et l’empreinte pendant une recréation ordinaire. Annuler ou Retour après modification demande confirmation. Le brouillon n’est pas une sauvegarde durable après arrêt du processus.

`openVehicleEdit` reconstruit en IO le véhicule complet et vérifie son empreinte, sans utiliser la projection tronquée. `applyVehicleEdit` compare chaque champ au brouillon initial : ceux qui n’ont pas changé (y compris énergie atypique, null ou absent) ne sont pas réécrits ; aucun changement signifie aucune écriture ni date nouvelle. Les champs courts dépassant 500 caractères, les notes dépassant 8 000 ou une représentation de l’année dépassant 128 caractères empêchent l’ouverture sans les tronquer. La photo n’est pas chargée dans l’état Compose, mais l’objet complet est reconstruit en mémoire : sa taille peut avoir un coût non mesuré.

`updateVehicleDetails` vérifie l’empreinte dans une transaction Room, refuse un conflit, valide le résultat et actualise valeurs complètes, blocs éventuels, résumé et projection sans remplacement destructif du véhicule. Si marque ou modèle changent, le réglage et l’index de suggestions sont mis à jour dans la même transaction. Compteur, photo, identifiants, rubriques liées et champs non exposés sont conservés. Les suppressions, la photo et les champs enrichis restent à développer. Ces mécanismes et leurs essais simulés ne garantissent pas une absence de panne matérielle ; des copies externes restent nécessaires.

## Calcul de consommation et observation Room (beta.38)

`CalculateConsumption` reste un cas d’usage pur partagé par les tests avec la PWA. Depuis beta.38, `TypedRecordDao.observeConsumptionSources` lit pour le véhicule les champs complets bornés, les masques, les affectations de devise et la génération du véhicule, sans charger notes ni extensions. Une jointure gauche conserve les lignes dont la source complète manque : elles rendent le calcul indisponible au lieu d'être écartées.

`ConsumptionDashboard` vérifie identité, date, unité, champs, précision et éventuelles égalités d’ordre ; il applique le calcul séparément à L et kWh **avec toutes les opérations** pour détecter les changements d’unité. Les valeurs `Double` restent des estimations, pas des nombres monétaires exacts ; champs atypiques ou ambigus bloqués prudemment. La PWA peut traiter différemment certains anciens champs manquants ou invalides. La carte Compose compare les versions calculées avec celles de la liste : actualisation et erreurs ne deviennent jamais une moyenne partielle ou un faux zéro.

Ces lectures ne modifient pas Room ni JSON ; des tests incluent un parcours Compose → ViewModel → Room simulé, l’Undo, l’import et la comparaison de sept scénarios avec la PWA. Les deux tris et données en mémoire ne sont pas paginés et leur coût n’est pas mesuré. Voir [le guide](CONSOMMATION-ANDROID-BETA38.md).

## Retour Android

Depuis beta.8, `NavHost` de Navigation Compose 2.8.9 utilise six routes Kotlin `@Serializable` sans concaténation d’identifiants : accueil, entretien, pleins, trajets, réglages et CQ. Les onglets conservent une pile simple depuis l’accueil ; CQ est ajouté à la pile au-dessus de l’onglet qui l’a ouvert. `rememberNavController` sauvegarde/restaure l’état de navigation lors d’une recréation ordinaire. Les futures routes de détail avec identifiant ne sont pas encore développées.

`BackHandler` retourne de CQ à son parent, des autres rubriques à l’accueil, et laisse Android gérer Retour sur l’accueil. Les dialogues modaux restent prioritaires et un Retour est ignoré pendant une opération occupée. Depuis beta.4, un formulaire modifié demande confirmation avant abandon. Ce n’est ni une sauvegarde automatique des brouillons ni une garantie après arrêt du processus. Les essais du geste prédictif et du comportement tactile sur appareil restent à effectuer.

## Listes du carnet

Depuis beta.2, `JournalPage` utilise `LazyColumn` pour les entretiens, rappels, pleins et trajets, avec des clés stables par collection et identifiant. Un changement de rubrique ou de véhicule remet le défilement en haut. Les rappels sont évalués une fois avant le tri, puis mémorisés tant que les données, le véhicule et la date ne changent pas. Les autres écrans ne sont pas tous virtualisés ; les enregistrements sont toujours collectés dans une `List` en mémoire, filtrée/triée côté interface. Il ne s’agit ni de pagination SQL ni d’une preuve de fluidité.

## Observation et confidentialité

StrictMode n’est actif qu’en debug. Des rapports du compilateur Compose sont générés sous `app/build/compose_compiler_*` : le résumé `RecordSummary` est inféré stable, mais les `List` restent considérées instables. L’activation de Strong Skipping n’est ni une mesure de recomposition ni une preuve de fluidité ; aucune annotation `@Immutable` trompeuse n’a été ajoutée.

LeakCanary 2.14 est **désactivé par défaut**, et dépendance `debugImplementation` uniquement si `-PenableLeakCanary=true` est explicitement passé. Ce build de diagnostic ajoute des permissions de stockage et de notifications ainsi que des composants spécifiques, dont une Activity exportée. Les dumps mémoire peuvent contenir les données des véhicules, documents et autres informations privées : n’utiliser que des données fictives sur un appareil de test, ne pas les partager et supprimer ensuite les dumps de test. Ce n’est pas un suivi d’erreurs distant et aucune analyse de fuite sur téléphone n’est revendiquée.

Les builds debug par défaut et release vérifiés ne demandent pas Internet, GPS, Bluetooth, NFC ou notifications ; seul le droit interne des récepteurs Android est présent. Le sélecteur peut ouvrir un fournisseur en ligne choisi par la personne. Les exports restent non chiffrés et nécessitent des copies externes sûres. Voir la checklist de `PERFORMANCES.md`.


## Suppression immédiate et Undo du carnet (beta.19)

`JournalActions.delete` déclenche une transaction Room qui vérifie l’empreinte, reconstruit et contrôle l’élément, écrit et relit un arbre typé `journal_undo*`, puis retire l’entrée active et sa projection. Le nouvel Undo remplace le précédent uniquement si toute la transaction réussit. L’export lit les seules entrées actives.

`JournalUndoRepository` restaure dans une autre transaction après contrôles de jeton, expiration, identité d’entrée et génération du véhicule ; aucun élément récent ni kilométrage du véhicule n’est écrasé. Un deuxième trajet en cours est refusé. Un import réussi invalide l’image dans sa transaction ; un import échoué la conserve. Une seule image, non exportée, reste sensible et n’est pas une sauvegarde.

Le bandeau Compose propose « Annuler » et « Terminer », annonce le changement aux aides techniques et adapte son délai aux préférences d’accessibilité. Au moins 10 s au premier plan ; pause pendant dialogue/transaction ou arrière-plan et redémarrage du délai. L’image survit à une réouverture avant 24 h, puis nettoyage paresseux lors de l’ouverture/tentative ; une horloge reculée peut retarder ce nettoyage. Voir `UNDO-CARNET.md` pour la politique complète et ses limites. La suppression d’un véhicule Android reste à réaliser.

## Vérification JSON non destructive (beta.6)

Dans Réglages, la zone défilante des actions de sauvegarde s’arrête au-dessus du « + » flottant ; un snackbar peut toutefois recouvrir temporairement une action. Les clics sont testés en environnement simulé, pas sur téléphone.

`BackupReview` associe explicitement `IMPORT` ou `VERIFY` à un `PreparedBackup`. Les deux modes utilisent `prepareFromStream` : copie temporaire bornée sur IO, puis `BackupCodec.read` en flux et décompte, sans écriture Room. En mode `VERIFY`, le dialogue n’offre pas de remplacement ; `confirmImport` refuse aussi ce mode indépendamment de l’interface. Fermeture, Retour et destruction du ViewModel demandent la libération de la copie ; une erreur de préparation déclenche également son nettoyage. Les autres modifications sont bloquées pendant l’analyse et la prévisualisation.

Le validateur ne démontre pas que le fichier contient tout ce qui est attendu, qu’il est récent ou authentique, que les pièces jointes s’ouvrent, ou qu’une restauration aboutira. En particulier, certaines vérifications et écritures n’ont lieu que lors de `replace`, dans la transaction : une limite en octets ou un échec de stockage peut encore apparaître. Le nettoyage du cache est tenté, non garanti ; la copie n’est pas chiffrée par l’application.
