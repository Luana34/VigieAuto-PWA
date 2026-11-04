# Migration Room 7 → 8 — rappels complets typés

**Version Android : 0.4.0-beta.14.** Le schéma Room 8 exporté a pour identité `9ba8b7202b8dc3083e2dd0812d23c738`. Ce changement est interne à Android. Il ne modifie ni le format d’échange JSON v3, ni les formats JSON v1/v2 acceptés à l’import, ni la PWA 1.5.1. Les versions de schéma Room et de sauvegarde JSON sont deux notions différentes.

## Sauvegarder et essayer avant installation

Exporter un JSON **en dehors de l’application et de l’appareil si possible**, vérifier sa lisibilité et conserver une copie intacte. Tester d’abord cette préversion sur un émulateur ou appareil distinct et une base fictive ou une copie restaurable. Une transaction SQLite ne remplace pas une sauvegarde externe ; espace insuffisant, panne matérielle ou arrêt peuvent nécessiter une restauration. Vérifier la signature de l’APK et ne pas désinstaller l’ancienne application pour forcer l’installation : cela peut effacer la base. Une ancienne application Room 7 ou antérieure ne peut pas ouvrir directement une base migrée en Room 8 ; le retour en arrière exige une restauration séparée, testée à partir de la sauvegarde d’avant mise à jour.

## Source des rappels

Après véhicules, interventions, pleins/recharges et trajets, les **rappels** deviennent la cinquième collection dont les champs connus sont conservés dans une source Room complète, et non dans un JSON complet auxiliaire. Les six autres collections (`expenses`, `symptoms`, `templates`, `checks`, `documents`, `settings`) restent sur leurs blocs JSON de compatibilité ; le chantier des onze collections n’est donc pas terminé.

- `complete_reminders` conserve `id`, `vehicleId`, le titre, la catégorie, la date et le kilométrage d’échéance, les seuils en jours/kilomètres, les récurrences en jours/kilomètres, l’état actif et les dates `createdAt`/`updatedAt`.
- Des masques distinguent champ absent, `null` explicite, valeur présente et valeur conservée en blocs. Le booléen garde son type ; les nombres restent des **jetons JSON exacts** enregistrés en texte, pas un `Double` utilisé pour reconstruire la valeur. Les projections d’index peuvent utiliser des valeurs arrondies mais ne sont jamais la source de reconstruction.
- Les textes et nombres trop longs pour les colonnes, ainsi que les unités Unicode isolées, sont découpés en blocs limités à 128 Kio, avec taille et SHA-256 contrôlés. Seules les propriétés inconnues du rappel sont stockées ensemble en extensions JSON ; ce n’est pas une copie complète du rappel.
- `compat_records` conserve identité, résumé et empreinte du rappel reconstruit. Les blocs `compat_chunks` de cette collection sont supprimés après vérification ; les autres collections qui en ont encore besoin restent inchangées. La table `reminders` reste une projection pour l’affichage et les index, pas la source complète.

## Migration transactionnelle et limites

Room crée les nouvelles tables à côté des anciennes et, pour chaque rappel, vérifie les blocs, leur SHA-256, l’UTF-8, les types, l’identité et la référence véhicule. Le rappel est encodé, décodé, relu depuis SQLite puis comparé à l’arbre JSON initial. L’absence et `null`, les types, textes, valeurs numériques et l’ordre des tableaux des extensions sont comparés ; l’ordre des propriétés d’un objet n’est pas significatif. Le contrôle des liens étrangers précède le retrait final de tous les anciens blocs `reminders`. Une erreur annule l’ensemble de la transaction ; il n’y a pas de repli destructif automatique.

Les clés répétées, y compris dans des extensions imbriquées, ou les jetons numériques trop longs pour être lus fidèlement par le lecteur strict sont refusés à l’import et en migration. Un tel refus évite une conversion silencieuse mais peut empêcher l’ouverture d’une ancienne base : conserver l’original, ne pas effacer les données et demander un diagnostic. Cette garde ne répare pas une donnée déjà modifiée par une ancienne application. Les contrôles portent sur les entrées et limites documentées, pas sur toutes les pannes matérielles possibles.

L’édition d’un rappel existant ne réécrit que les champs du formulaire effectivement modifiés : les autres valeurs, leur précision, les extensions et `createdAt` restent inchangés. `updatedAt` est actualisé lors de l’enregistrement. Un ancien rappel accepté sans échéance peut être édité sans en inventer une, tant que ses deux échéances ne sont pas modifiées. Les échéances modifiées et les nouveaux rappels gardent les validations du formulaire. Des récurrences fractionnaires ou hors limites acceptées à l’import peuvent nécessiter une correction avant « Marquer comme fait » ; l’application refuse plutôt que de calculer un résultat trompeur. L’action « fait » conserve les extensions et recalcule les échéances récurrentes selon les règles existantes.

## Vérifications à mener

Les tests JVM utilisent notamment une base v7 créée avec les migrations précédentes, des rappels longs, valeurs absentes et nulles, décimales, extensions, modifications, « fait », corruption et échec transactionnel ; le pont est aussi vérifié avec des fichiers fictifs. Des scénarios `MigrationTestHelper` pour 7→8 et la chaîne historique sont compilés séparément, mais une compilation ne constitue pas une exécution sur appareil ou émulateur. Voir le changelog et `PERFORMANCES.md` pour les résultats précis de cette version. La PWA utilise `JSON.parse` et peut arrondir des nombres extrêmement précis ; le transport aller-retour n’est pas garanti exact pour ces nombres.
