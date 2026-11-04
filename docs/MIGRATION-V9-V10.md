# Migration Room 9 → 10 — symptômes complets typés

**Version Android : 0.4.0-beta.16.** Le schéma Room 10 exporté a pour identité `64f7bdee3fd2c3b7386eb8de23bd8f32`. Cette évolution interne à Android ne change ni le format d’échange JSON v3 ni la PWA 1.5.1 ; les imports JSON v1/v2 restent pris en charge sous réserve des contrôles stricts décrits ci-dessous. Une version de schéma Room et une version de sauvegarde JSON ne sont pas la même chose.

## Avant de mettre à jour

Exporter un JSON, vérifier sa lisibilité et conserver une copie intacte **hors de l’appareil**. Tester d’abord cette préversion sur un émulateur ou un appareil distinct avec des données fictives ou une copie restaurable. Une transaction SQLite ne remplace pas une sauvegarde externe : une panne matérielle ou un manque d’espace peuvent nécessiter une restauration. Garder la même clé de signature et ne pas désinstaller l’ancienne application pour forcer l’installation, car cela peut effacer la base.

Une ancienne application Room 9 ou antérieure ne peut pas ouvrir directement une base migrée en Room 10. Le retour en arrière exige une restauration séparée, testée à partir de la sauvegarde d’avant mise à jour. La migration n’a pas été exécutée sur téléphone ou émulateur dans cet environnement.

## Source des symptômes

Après les véhicules, interventions, pleins/recharges, trajets, rappels et dépenses, les **symptômes** sont la septième collection dont les champs connus sont stockés dans une source Room complète plutôt que dans un JSON complet auxiliaire. Quatre collections (`templates`, `checks`, `documents`, `settings`) gardent leurs blocs JSON de compatibilité ; le chantier des onze collections n’est pas terminé. Aucun écran symptômes Android n’est ajouté par ce lot.

- `complete_symptoms` conserve `id`, `vehicleId`, `title`, `category`, `severity`, `status`, `date`, `odometer`, `description`, `createdAt` et `updatedAt`. Un index relie le symptôme à son véhicule. Le contrat existant exige un titre textuel (qui peut être vide), une date valide et un kilométrage numérique accepté par le validateur ; les autres champs connus peuvent être absents ou nuls. Une catégorie, un statut ou une gravité textuels inconnus ne sont pas remplacés par une liste imposée côté Android.
- Des masques distinguent champ absent, `null` explicite, valeur présente et valeur externalisée. Le kilométrage est conservé comme **jeton numérique JSON exact en texte**, pas comme un `Double` pour sa reconstruction. Le validateur existant convertit toutefois ce nombre en `Double` pour vérifier qu’il est fini et non négatif ; il ne faut pas en déduire que tout nombre arbitraire est accepté.
- Les valeurs longues et unités Unicode isolées sont conservées en blocs contrôlés de 128 Kio au maximum, avec taille et SHA-256. Seules les propriétés inconnues sont regroupées en extensions JSON : il ne s’agit pas d’une copie complète de l’enregistrement. Par exemple, un éventuel champ supplémentaire `notes` garde son type et n’est pas promu implicitement dans le contrat des symptômes.
- `compat_records` reste un index de métadonnées, avec identité, résumé et empreinte de l’objet reconstruit. Les anciens blocs `compat_chunks` des symptômes sont retirés après vérification ; les autres collections qui en ont encore besoin restent inchangées.

## Migration transactionnelle et limites

Room crée les nouvelles tables à côté des anciennes. Pour chaque symptôme, la migration vérifie les blocs, leur taille et SHA-256, l’UTF-8, les champs, l’identité et la référence du véhicule ; elle encode, décode, relit ensuite depuis SQLite et compare les valeurs à l’arbre JSON initial. Présence/absence et `null`, types, textes, précision numérique, ordre des tableaux et propriétés inconnues sont comparés ; l’ordre des propriétés d’un objet n’est pas significatif. Les relations sont contrôlées avant le retrait final de **tous** les anciens blocs de symptômes. Une erreur annule la transaction ; aucun repli destructif sur l’index n’est prévu.

Les clés répétées, y compris dans les extensions imbriquées, ou les nombres trop longs pour être lus fidèlement par le lecteur strict sont refusés à l’import et en migration. Ce refus peut empêcher l’ouverture d’une ancienne base mais vise à éviter une conversion silencieuse : conserver l’original, ne pas effacer les données et demander un diagnostic. La garde ne répare pas une donnée déjà modifiée par une ancienne application ; aucune protection logicielle ne couvre toutes les pannes matérielles.

## Vérifications

Les scénarios JVM couvrent notamment une base v9 créée avec les migrations antérieures, deux symptômes, kilométrages précis et zéro négatif, valeurs absentes/nulles, catégorie, gravité, statut, textes longs, Unicode, extensions, ordre des collections, corruption, relations et rollback avant et pendant le retrait des anciens blocs. Les imports synthétiques JSON v1 et les fixtures réelles v2 sont vérifiés séparément des migrations Room historiques. Le pont sur données fictives importe un symptôme provenant de Room dans la vraie PWA sous Chromium, le modifie et le marque résolu, puis réimporte le résultat dans Room. La compilation des scénarios `MigrationTestHelper` n’est pas une exécution sur appareil ou émulateur : voir le changelog et `PERFORMANCES.md` pour les résultats précis.

La PWA utilise `JSON.parse` et peut arrondir des nombres très grands ou précis, même dans des propriétés inconnues. L’exactitude numérique intégrale n’est donc **pas garantie lors d’un aller-retour PWA**. Son formulaire peut également normaliser certains champs ; les statuts atypiques conservés côté Android ne sont pas tous testés dans la PWA. Conserver et vérifier les originaux.
