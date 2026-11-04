# Migration Room 8 → 9 — dépenses complètes typées

**Version Android : 0.4.0-beta.15.** Le schéma Room 9 exporté a pour identité `ddb5fc6b0cad9fcb9257880121433b38`. Cette évolution interne à Android ne change pas la version du format d’échange JSON v3 ni la PWA 1.5.1 ; les imports JSON v1/v2 restent pris en charge sous réserve des contrôles stricts décrits ci-dessous. Une version de schéma Room et une version de sauvegarde JSON ne sont pas la même chose.

## Avant de mettre à jour

Exporter un JSON, vérifier sa lisibilité et conserver une copie intacte **hors de l’appareil**. Tester d’abord cette préversion sur un émulateur ou un appareil distinct avec des données fictives ou une copie restaurable. Une transaction SQLite ne remplace pas une sauvegarde externe : une panne matérielle ou un manque d’espace peuvent nécessiter une restauration. Garder la même clé de signature et ne pas désinstaller l’ancienne application pour forcer l’installation, car cela peut effacer la base.

Une ancienne application Room 8 ou antérieure ne peut pas ouvrir directement une base migrée en Room 9. Le retour en arrière exige une restauration séparée, testée à partir de la sauvegarde d’avant mise à jour. La migration n’a pas été exécutée sur téléphone ou émulateur dans cet environnement.

## Source des dépenses

Après les véhicules, interventions, pleins/recharges, trajets et rappels, les **dépenses** sont la sixième collection dont les champs connus sont stockés dans une source Room complète plutôt que dans un JSON complet auxiliaire. Cinq collections (`symptoms`, `templates`, `checks`, `documents`, `settings`) gardent leurs blocs JSON de compatibilité ; le chantier des onze collections n’est pas terminé. Aucun écran dépenses Android n’est ajouté par ce lot.

- `complete_expenses` conserve `id`, `vehicleId`, `title`, `category`, `date`, `amount`, `notes`, `createdAt` et `updatedAt`. Un index relie la dépense à son véhicule. Le contrat existant exige un titre textuel (qui peut être vide), une date valide et un montant numérique accepté par le validateur ; les autres champs connus peuvent être absents ou nuls.
- Des masques distinguent champ absent, `null` explicite, valeur présente et valeur externalisée. Le montant est conservé comme **jeton numérique JSON exact en texte**, pas comme un `Double` pour sa reconstruction. Le validateur existant convertit toutefois ce nombre en `Double` pour vérifier qu’il est fini et non négatif ; il ne faut pas en déduire que tout nombre arbitraire est accepté.
- Les valeurs longues et unités Unicode isolées sont conservées en blocs contrôlés de 128 Kio au maximum, avec taille et SHA-256. Seules les propriétés inconnues sont regroupées en extensions JSON : il ne s’agit pas d’une copie complète de l’enregistrement. Par exemple, un éventuel champ supplémentaire `odometer` garde son type et n’est pas promu implicitement dans le contrat des dépenses.
- `compat_records` reste un index de métadonnées, avec identité, résumé et empreinte de l’objet reconstruit. Les anciens blocs `compat_chunks` des dépenses sont retirés après vérification ; les autres collections qui en ont encore besoin restent inchangées.

## Migration transactionnelle et limites

Room crée les nouvelles tables à côté des anciennes. Pour chaque dépense, la migration vérifie les blocs, leur taille et SHA-256, l’UTF-8, les champs, l’identité et la référence du véhicule ; elle encode, décode, relit ensuite depuis SQLite et compare les valeurs à l’arbre JSON initial. Présence/absence et `null`, types, textes, précision numérique, ordre des tableaux et propriétés inconnues sont comparés ; l’ordre des propriétés d’un objet n’est pas significatif. Les relations sont contrôlées avant le retrait final de **tous** les anciens blocs de dépenses. Une erreur annule la transaction ; aucun repli destructif sur l’index n’est prévu.

Les clés répétées, y compris dans les extensions imbriquées, ou les nombres trop longs pour être lus fidèlement par le lecteur strict sont refusés à l’import et en migration. Ce refus peut empêcher l’ouverture d’une ancienne base mais vise à éviter une conversion silencieuse : conserver l’original, ne pas effacer les données et demander un diagnostic. La garde ne répare pas une donnée déjà modifiée par une ancienne application ; aucune protection logicielle ne couvre toutes les pannes matérielles.

## Vérifications

Les scénarios JVM couvrent notamment une base v8 créée avec les migrations antérieures, deux dépenses, montants précis et zéro négatif, valeurs absentes/nulles, textes longs, Unicode, extensions, ordre des collections, corruption, relations et rollback avant et pendant le retrait des anciens blocs. Le pont sur données fictives importe une dépense provenant de Room dans la vraie PWA sous Chromium, la modifie, puis réimporte le résultat dans Room. La compilation des scénarios `MigrationTestHelper` n’est pas une exécution sur appareil ou émulateur : voir le changelog et `PERFORMANCES.md` pour les résultats précis.

La PWA utilise `JSON.parse` et peut arrondir des nombres très grands ou précis, même dans des propriétés inconnues. L’exactitude numérique intégrale n’est donc **pas garantie lors d’un aller-retour PWA**. Conserver et vérifier les originaux.
