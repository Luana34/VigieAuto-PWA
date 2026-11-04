# Migration Room 12 → 13 — contrôles effectués

Cette migration indépendante de 0.4.0-beta.18 concerne uniquement l’historique des **contrôles CQ effectués**. Elle ne crée pas d’écran. Avant toute mise à jour d’une base réelle, exporter une sauvegarde JSON externe et en vérifier l’ouverture ; une version Android antérieure ne sait pas ouvrir directement la base migrée.

## Structure et fidélité

`complete_checks` contient l’identité, le véhicule, les champs connus et leurs masques. Le kilométrage est conservé sous forme de texte numérique JSON exact, et non de `Double`. `complete_check_results` conserve chaque résultat par sa position, y compris une liste vide, avec statut, note et éventuelles propriétés inconnues. Un `itemId` historiquement non validé peut être absent, nul, textuel ou d’un autre type JSON : il est gardé tel quel. Les statuts des points restent ceux du contrat d’import existant (`ok`, `nok`, `na`).

Le lien au véhicule est vérifié. En revanche, aucun lien obligatoire vers un modèle encore existant n’est ajouté : la PWA permet de supprimer une liste tout en gardant les contrôles historiques et leur contenu. `complete_check_values` et `complete_check_value_chunks` conservent en blocs vérifiés les valeurs individuelles longues et les seules extensions ; aucun bloc ne constitue une copie complète du contrôle.

## Transaction

Pour chaque ancien contrôle, la migration vérifie les blocs et leur SHA-256, valide l’objet et son identité, le décompose, compare la reconstruction, l’insère puis le **relit depuis SQLite et le compare**. Après vérification des clés étrangères et de tous les contrôles, les anciens blocs complets sont retirés. Tout échec annule l’ensemble de la migration. Des tailles de blocs historiques irrégulières sont admises si ordre, taille et empreinte sont cohérents.

Les tests JVM ciblent notamment les liens vers un modèle supprimé, les résultats ordonnés, les notes et types atypiques, les grands champs, les extensions, la corruption et l’annulation après un échec partiel. Les scénarios instrumentés fournis sont distincts des tests JVM ; ils doivent être exécutés sur émulateur puis téléphone pour valider les conditions réelles. Les limites de lecture JSON stricte et de précision PWA sont détaillées dans `MIGRATION-V11-V12.md` et `FORMAT-PONT.md`.
