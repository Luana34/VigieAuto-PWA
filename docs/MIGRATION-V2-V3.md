# Migration Room 2 → 3 — étape historique avant Room 4

> Document historique : beta.11 poursuit les migrations jusqu’à Room 5. Voir `MIGRATION-V4-V5.md` pour l’état courant.

**Préversion `0.4.0-beta.10`** : ce document décrit l’étape 2→3 introduite en alpha et inchangée jusqu’à beta.9. La beta.10 enchaîne ensuite 3→4 pour les véhicules : voir `MIGRATION-V3-V4.md`. Les migrations doivent être essayées avec prudence. Avant de l’installer, exportez depuis Android et chaque PWA concernée, vérifiez les fichiers et gardez des copies sûres hors téléphone. N’effacez pas les données et ne désinstallez pas l’ancienne application pour résoudre une erreur de signature ; contactez l’assistant avec le message d’erreur. Le JSON n’est pas chiffré.

## Pourquoi les six tables demandées ne suffisent pas

Les bases précédentes conservent déjà **11 collections** PWA, notamment dépenses, symptômes, modèles de CQ, contrôles, documents et réglages en plus des cinq modules principaux. Elles contiennent aussi des photos/documents multi-Mio, des valeurs inconnues et des champs GPS importés. Supprimer tout JSON après avoir créé uniquement cinq tables métier et les suggestions ferait perdre une partie de ces données.

L’alpha crée donc `vehicles`, `services`, `fills`, `trips`, `reminders` et conserve `suggestions_perso`, **plus** deux tables auxiliaires `compat_records` et `compat_chunks`. Les anciennes tables `records` et `payload_chunks` sont supprimées après copie et vérifications dans la même transaction Room. Ces tables auxiliaires conservent le JSON complet en blocs de 128 Kio et leur empreinte SHA-256 ; elles sont la source des champs complets en alpha jusqu’à beta.9 ; en beta.10, elles restent source des dix collections autres que les véhicules. Les cinq tables sont des projections typées synchronisées lors des écritures transactionnelles, avec clés étrangères différées et index utiles. Leur texte d’index est borné à 512 caractères pour limiter les risques de dépassement de fenêtre SQLite ; en Room 3, les identifiants complets et les textes originaux restent dans les blocs.

**Repli :** Android 0.3.0 utilise Room 2 et ne sait pas ouvrir directement la base déjà migrée en Room 3. Conserver son ZIP n’est pas une restauration automatique. Ne pas forcer une rétrogradation ou désinstaller sur l’appareil principal ; garder des exports externes vérifiés et tester toute restauration séparément.

Conséquence importante : ce n’est **pas encore** l’architecture finale où l’export est reconstruit uniquement depuis les tables métier. Les écrans utilisent encore une partie des index génériques ; les gains de performance ne sont pas mesurés et aucune accélération n’est promise. La future refonte des autres rubriques et du pont devra préserver toutes les valeurs et vérifier leur compatibilité avant retrait éventuel des blocs.

## Déroulement

1. Room ouvre le schéma 2 et lance une migration **dans une transaction**. La migration 1→2 existante peut la précéder si la base est plus ancienne.
2. Copie des en-têtes et de tous les blocs sans transformer les pièces jointes. Création des tables typées, relations et index.
3. Lecture de chaque objet historique, vérification du nombre/ordre/taille des blocs, de la longueur, de l’empreinte SHA-256, de l’UTF-8, du contrat JSON, des identifiants et des liens véhicule. Projections insérées depuis les données vérifiées ; propriétés inconnues et toutes les autres collections restent dans les blocs intacts.
4. Vérification des clés étrangères ; suppression des anciennes tables en fin de transaction. Le JSON d’origine n’est pas réécrit par la migration.
5. Une erreur stoppe la migration : Room doit annuler l’ensemble et laisser le schéma 2. L’application peut alors refuser de s’ouvrir : ne pas forcer une suppression, conserver la sauvegarde et demander de l’aide. Aucun système ne peut promettre zéro perte en cas de panne matérielle, base déjà corrompue ou absence de sauvegarde ; la copie externe est indispensable.

La beta.6 ajoute un contrôle structurel séparé, sans restauration ni écriture Room ; ce contrôle n’assure pas qu’une sauvegarde est complète ou récente ni qu’une restauration ultérieure réussira. La copie temporaire non chiffrée est privée et son nettoyage est tenté, non garanti.

La beta.7 ajoute l’édition de la fiche depuis le JSON complet, vérifie l’empreinte et écrit fiche/projection/suggestions dans une transaction sans supprimer les éléments liés. Elle ne change pas le schéma Room. Les champs absents, atypiques et non exposés restent conservés lorsqu’ils ne sont pas modifiés ; un champ éditable excessivement long peut empêcher l’ouverture, sans troncature.

À l’import d’un JSON, le dépôt valide le fichier avant confirmation puis écrit les sources complètes et projections dans une seule transaction ; depuis Room 4, la source des véhicules est typée. Les relations typées sont différées pour accepter des collections présentées dans n’importe quel ordre. À l’édition, l’enregistrement et sa projection changent ensemble ; ne pas utiliser `REPLACE` sur un véhicule, qui pourrait déclencher une cascade non voulue. Les suppressions de journal doivent également retirer leur projection dans la même transaction.

La beta.8 ajoute une garde de comparaison JSON préparatoire ; la beta.10 l’utilise pour la migration et les écritures des véhicules, sans supprimer les tables `compat_records`/`compat_chunks` elles-mêmes. Les conditions détaillées, et la distinction entre migration Room et import JSON v1/v2, figurent dans `PLAN-MIGRATION-TYPEE.md`.

## Vérifications à mener et limites

- Schémas historiques réellement exportés par Room : `app/schemas/com.vigieauto.app.data.AppDatabase/1.json`, `2.json`, `3.json` et `4.json`.
- Jeux fictifs à couvrir : base vide, plusieurs véhicules et toutes les collections, au moins 100 pleins, ancien schéma 1, fichier/document de 5 Mio, propriétés inconnues et GPS importé, liens absents, bloc manquant/corrompu et rollback, édition/suppression atomiques et retour vers la PWA réelle.
- Les tests Robolectric exécutent une simulation Android sur ordinateur ; ils ne remplacent ni `MigrationTestHelper` instrumenté ni les essais sur appareil réel. Les résultats précis de la livraison sont indiqués dans l’historique, pas supposés par ce document.
- Version cible minSdk 26 / target 36 : une simulation API 26 et un lint sont utiles, mais ne prouvent pas à eux seuls le comportement sur tous les appareils Android 8.
- Une version Android Room 2 ou 3 ne sait pas ouvrir directement une base Room 4 ; Room 2 ne sait pas non plus ouvrir une base Room 3. Un retour arrière par réinstallation est risqué ; conserver l’export JSON d’avant mise à jour et la version précédente, sans désinstaller ni écraser les données sans plan de restauration vérifié.
