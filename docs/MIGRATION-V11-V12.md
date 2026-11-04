# Migration Room 11 → 12 — modèles de contrôle

Cette migration indépendante de 0.4.0-beta.18 transforme uniquement les **modèles CQ**. Elle n’ajoute pas d’écran ni ne change le format JSON d’échange v3. Faire une sauvegarde JSON externe et vérifier qu’elle s’ouvre avant de migrer une base réelle : une ancienne application ne sait pas rouvrir directement une base Room 12 ou ultérieure.

## Stockage

`complete_templates` contient l’identité, les champs connus et leurs masques de présence/null/externalisation. `complete_template_items` stocke chaque point selon sa **position** : un identifiant de point peut être vide ou répété comme dans les sauvegardes précédemment acceptées. Le nombre de points reste celui du contrat historique, de 1 à 30. Le champ `builtin`, historiquement non restreint par l’import Android, conserve aussi les autres types JSON, sans les forcer en booléen.

`complete_template_values` et `complete_template_value_chunks` conservent seulement des valeurs individuelles longues, les valeurs non booléennes de `builtin` et les propriétés inconnues du modèle ou d’un point. Les blocs de 128 Kio au plus ont longueur, ordre et SHA-256 contrôlés. Les chaînes avec demi-surrogate isolé sont conservées par unités UTF-16. Ces fragments ne sont pas une copie JSON complète du modèle ; l’index `compat_records` sert toujours aux listes et à l’intégrité de l’objet reconstruit.

## Sécurité de la migration

Room exécute 11→12 dans une transaction : chaque ancien objet en blocs est relu, vérifié, analysé strictement et validé ; la conversion est reconstruite et comparée, insérée, **relue depuis SQLite et comparée à nouveau**. Le contrôle des clés étrangères est effectué avant de retirer les anciens blocs complets de cette collection. Une erreur à n’importe quelle étape, y compris sur le deuxième objet ou lors de la suppression des blocs, annule tout. Les blocs historiques peuvent avoir des tailles différentes tant que leur ordre, leur taille totale et leur empreinte sont cohérents.

Les champs absents, nulls, vides et les extensions de chaque point restent distincts. Des clés JSON répétées ou certains jetons numériques trop longs pour la lecture stricte sont refusés au lieu d’être réécrits de façon ambiguë ; conserver le fichier d’origine. Les nombres suffisamment lisibles sont reconstruits sans passage par `Double` dans les champs et extensions conservés.

## Vérifications et limites

Les tests JVM ciblent ordre, identifiants répétés, champs longs et inhabituels, extensions, corruption, migration d’une vraie base 11 et retour arrière. Les essais Android instrumentés de ce sous-lot sont fournis séparément : leur compilation ne vaut pas exécution sur appareil. La PWA reste une application distincte ; la préservation de ses propres modifications et la précision des très grands nombres y ont leurs limites documentées dans `FORMAT-PONT.md`.
