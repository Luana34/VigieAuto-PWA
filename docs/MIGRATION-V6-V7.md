# Room 6 → 7 : trajets complets typés

## Portée

Android 0.4.0-beta.13 étend la source complète typée aux **trajets manuels et aux trajets GPS importés**, après les véhicules, interventions et pleins. Les cinq projections de consultation restent maintenues, mais les trajets sont reconstruits depuis `complete_trips` et non depuis la projection ni depuis une copie JSON complète. Sept collections conservent encore leurs blocs JSON complets : dépenses, rappels, symptômes, modèles CQ, contrôles, documents et réglages.

L’échange reste JSON v3, avec lecture des formats 1 à 3 selon les règles existantes. La migration interne Room 6→7 est distincte d’un import JSON v1 ou v2. La PWA 1.5.1 n’est pas modifiée. Aucun GPS natif, Bluetooth, NFC, carte ou module Stations n’est ajouté par ce lot.

## Champs et fidélité

Les 16 champs connus de trajet sont stockés séparément : `date`, `status`, `method`, `startedAt`, `title`, `from`, `to`, `distanceKm`, `durationMin`, `profile`, `notes`, `createdAt`, `updatedAt`, `gpsDistanceM`, `gpsHasFix` et `gpsInterrupted`. Les identifiants du trajet et du véhicule sont distincts. Les masques indiquent l’absence, `null` ou la présence ; les trois nombres connus sont stockés par leurs jetons textuels exacts et les deux indicateurs GPS comme booléens SQLite. La projection d’affichage peut utiliser `Double` mais n’est pas la source complète.

Les valeurs longues sont découpées et contrôlées par SHA-256. Les seuls champs inconnus sont préservés dans un bloc d’extensions : ce n’est pas une copie complète du trajet. Les champs inconnus restent soumis aux règles de validation du format : notamment les trajets GPS respectent la liste autorisée, qui exclut les coordonnées et traces. Sur un vrai trajet GPS, un type incompatible pour un champ GPS connu est refusé. Sur un trajet **manuel**, l’ancien validateur acceptait tout JSON dans ces trois champs : les valeurs atypiques (chaînes, nombres ou booléens de type inattendu, objets et tableaux) sont conservées séparément comme valeurs JSON associées à leur champ, sans conversion ni copie complète du trajet. Les absences et `null` restent distincts. Les propriétés dupliquées, nombres illisibles fidèlement et références incohérentes sont refusés plutôt qu’altérés silencieusement.

L’import d’un trajet GPS actif marque comme avant son suivi interrompu ; aucune localisation ni trace n’est ajoutée. Lorsqu’un trajet terminé est modifié, les champs inchangés conservent leur absence, `null`, type et précision ; lorsqu’un trajet actif est finalisé, la méthode et les indicateurs GPS existants restent conservés.

## Migration transactionnelle

1. Room crée les nouvelles tables et lit les trajets de l’ancien `compat_chunks` sans les retirer.
2. Chaque ancien bloc, sa taille, son ordre, son empreinte, l’UTF-8, le JSON, l’identité et la référence au véhicule sont contrôlés.
3. Le trajet est encodé dans les nouvelles tables, reconstruit, relu depuis SQLite et comparé à l’original ; sa nouvelle empreinte est consignée. Les relations SQLite sont vérifiées.
4. Les anciens blocs complets des trajets ne sont supprimés qu’après ces contrôles, dans la transaction de migration. Une erreur bloque la migration et entraîne le rollback. Les autres collections ne sont pas effacées.

L’import, la modification et la suppression mettent à jour les données typées, leur empreinte et leur projection dans une transaction. L’export vérifie leur identité et leur empreinte : une source complète manquante ou altérée ne peut pas être remplacée silencieusement par la projection.

## Sécurité de mise à jour et validations

Une sauvegarde JSON **externe et vérifiée** reste indispensable avant mise à jour. Une application ancienne ne peut pas ouvrir directement une base déjà migrée en Room 7 ; conserver aussi une sauvegarde exploitable avant la migration. Une restauration est une opération explicite, pas une rétrogradation automatique de la base.

Les tests JVM couvrent les trajets manuels et GPS fictifs, la précision, les champs optionnels, les extensions, les données longues, les refus d’ambiguïté, la relecture et le rollback : **304 tests réussis**, aucun échec ni ignoré, avec les quatre fichiers de pont fictifs ; **34 tests ciblés** réussis. Un aller-retour de carnet a été essayé dans la vraie PWA sous Chromium puis en Android, avec des valeurs GPS atypiques de trajet manuel. Les **21 scénarios instrumentés sont compilés mais n’ont pas été exécutés** sur appareil ou émulateur ; leur compilation ne prouve pas leur fonctionnement réel. Aucun essai Windows beta.13 ni benchmark physique ici. Les détails et incidents de validation sont consignés dans la checklist de performance et le changelog.

**Limite PWA connue :** JavaScript peut arrondir de très grands nombres à l’import puis à l’export ; la conservation numérique exacte d’un aller-retour PWA n’est pas garantie pour ces cas extrêmes. Ne pas partager de sauvegardes personnelles dans les tests fictifs.
