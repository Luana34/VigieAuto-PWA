# Migration Room 14 → 15 — annulation locale du carnet

## Périmètre

Beta.19 passe la base de Room 14 à 15 sans changement du format de sauvegarde JSON v3, de l’identifiant `com.vigieauto.app`, des onze collections actives ni de la PWA. La migration ajoute cinq tables :

1. `vehicle_generations` : identité propre à l’existence d’un véhicule ; une génération aléatoire est attribuée aux véhicules déjà présents, reste stable lors d’une édition et disparaît avec leur enregistrement parent.
2. `journal_undo` : métadonnées de la dernière suppression annulable, y compris son véhicule et sa génération.
3. `journal_undo_nodes` : arbre de valeurs typées ordonnées ; pas de JSON complet auxiliaire.
4. `journal_undo_values` : métadonnées des valeurs individuelles volumineuses.
5. `journal_undo_value_chunks` : blocs bornés avec empreinte SHA-256.

L’image d’Undo n’est pas une collection active : elle ne figure pas dans l’export JSON. Elle est indépendante de la clé étrangère du véhicule afin de pouvoir refuser explicitement une restauration si le parent disparaît. Elle est créée et relue dans la même transaction que le retrait de l’élément actif ; voir `UNDO-CARNET.md`.

## Sécurité

La migration n’efface ni ne transforme les entrées actives existantes. Elle initialise les générations depuis les identifiants de véhicules existants et exécute `foreign_key_check` ; la transaction est abandonnée si la base est incohérente. Les schémas précédents restent archivés. Les migrations Room historiques et l’import de JSON v1/v2/v3 sont des parcours distincts.

Une migration transactionnelle ne remplace pas une sauvegarde : avant installation, exporter et vérifier un JSON sur un autre support. Une base 15 ne se rétrograde pas automatiquement en 14 ; revenir à une ancienne application exige de repartir d’une sauvegarde JSON compatible et peut perdre les modifications postérieures. Conserver une copie originale, non chiffrée, dans un emplacement sûr.

## Validation attendue

Tests JVM : migration d’une base 14 vide et d’une base 14 remplie, fidélité des onze collections et générations, annulation après migration, échec et rollback d’une base relationnellement incohérente ; chaîne des migrations antérieures. Des scénarios `MigrationTestHelper` 14→15 et 1→15 sont compilés pour appareil/émulateur ; leur compilation seule ne prouve pas leur exécution. Voir les résultats précis dans le changelog et la checklist de performances de la version livrée.
