# Dépenses multidevises — Android 0.4.0-beta.33

**Étape intermédiaire, 5 novembre 2026.** PWA candidate inchangée : 1.5.2-beta.7. L’objectif est de permettre un échange manuel sans confondre ni perdre les devises. Cela ne termine pas encore le formulaire multidevise Android.

## Ce qui fonctionne

- Android accepte les sauvegardes VigieAuto de formats 1 à 4 après validation et confirmation. Une sauvegarde avec affectation de devise ressort en format 4 ; sans affectation, elle ressort en format 3. L’import **remplace** les données de l’appareil destinataire, ce n’est pas une fusion. Conserver une copie sûre et vérifiée de chaque appareil avant un essai.
- Les dépenses sans affectation explicite, notamment les anciennes, sont en **euros**. Les autres affichent leur code, par exemple CHF ou USD. Les totaux sont calculés **par devise**, sans addition entre devises et sans taux de change. Le tri par montant regroupe d’abord les devises, puis les montants.
- La PWA candidate beta.7 reste le moyen de choisir une devise, y compris un code personnalisé de trois lettres majuscules. La syntaxe est vérifiée, pas l’existence officielle du code. Au plus 32 devises distinctes, euro compris ; l’import est refusé si la limite est dépassée.
- La collection v4 `currencyAssignments` est indépendante des propriétés inconnues des dépenses : un ancien champ `currency` dans une dépense v1–v3 ne change pas son unité. Les valeurs et extensions inconnues des affectations sont conservées, en blocs vérifiés pour les données longues.
- Les dépenses sans affectation explicite restent modifiables, supprimables et annulables comme avant, en euros. Les affectations sont liées aux dépenses par une clé étrangère avec suppression en cascade ; la restauration d’une sauvegarde se fait dans une transaction.

## Limitation importante : lecture seule

Sur Android beta.33, **toute dépense possédant une affectation explicite est en lecture seule**, même si celle-ci indique EUR. Ses boutons de modification, suppression et justificatif sont désactivés ; le dépôt refuse aussi ces actions. Elle demeure incluse dans les sauvegardes. Pour la modifier, changer sa devise ou la supprimer, utiliser la PWA candidate, puis exporter/importer manuellement après sauvegarde préalable. Les nouvelles dépenses créées dans cette version Android sont en euros.

Ce blocage est volontaire : l’ancien formulaire et l’image Undo ne capturent pas encore l’affectation et ses extensions. Le lever sans adapter l’Undo et les contrôles de concurrence pourrait réétiqueter une somme ou perdre une donnée. Il reste à implémenter sur Android : choix/édition de la devise, confirmation sans conversion, contrôle de concurrence sur la dépense **et** l’affectation, suppression et Undo transactionnels incluant les extensions et la limite des devises.

Pleins et entretiens restent en euros sur les deux plateformes. La liaison plein/dépense sans double comptage n’est pas réalisée. Les doublons manuels ne sont pas détectés. Les anciennes PWA et Android beta.32 refusent les sauvegardes v4 ; ne jamais changer artificiellement leur numéro de format ni supprimer des affectations pour contourner ce refus.

## Stockage et migration

Room passe de 15 à 16 : deux tables nouvelles, une pour l’affectation typée par dépense et une pour les blocs de ses extensions inconnues. Aucun ancien enregistrement n’est réécrit ; les anciennes dépenses restent en euros implicites. La clé étrangère différée permet de lire les collections dans n’importe quel ordre au cours d’un import transactionnel ; valeurs, clés, types, précision numérique, chaînes et structures inconnues sont vérifiés. Des clés JSON répétées sont refusées. L’ordre des propriétés et la présentation du fichier ne sont pas garantis. Voir [MIGRATION-V15-V16.md](MIGRATION-V15-V16.md).

Android conserve les limites d’import existantes : 256 Mio par fichier, 100 000 enregistrements au total (affectations comprises), environ 16 Mio de caractères et 32 Mio UTF-8 par enregistrement, identifiants de dépense limités à 1 024 caractères. Une sauvegarde PWA peut donc être refusée prudemment si elle dépasse les limites Android. Les fichiers JSON sont non chiffrés et peuvent contenir des photos et d’autres données privées.

## Vérifications effectuées

- Tests JVM ciblés sous Linux en groupes : contrat v4, vraie fixture PWA, erreurs et références orphelines, limite 32, ordre des collections, propriétés futures et nombre précis, stockage en blocs, retour v3 et ancienne extension `currency`, affichage Compose et totaux séparés, dépôt, refus des écritures incompatibles, brouillon devenu obsolète, Undo des euros et import invalide atomique. Classes de migration depuis les anciennes versions jusqu’à Room 16, migration 15→16 et Undo existant relancées en groupes avec succès.
- Un lancement groupé de tests a été interrompu après dix minutes sans résultat final ; la cause n’a pas été établie. Les classes ci-dessus ont été relancées séparément/en groupes et ont réussi. **La suite JVM complète n’a pas été relancée.**
- Pont fictif : vrai export PWA beta.7 → Room → PWA Chromium/WebKit Linux → Room → PWA ; modification d’une devise en PWA, réimport, extension longue et nombre exact vérifiés dans les scénarios couverts. Cela ne garantit pas tous les fichiers possibles.
- APK debug et APK de tests instrumentés assemblés ; manifeste porté à 63 scénarios, dont deux tests de migration 15→16. **Aucun test instrumenté exécuté.** Lint debug : 0 erreur, 20 avertissements et 3 indications. Les contrôles du vérificateur de rapports et du workflow réussissent.
- Pas d’essai Windows, GitHub, émulateur, téléphone, Safari iOS ou performance réelle pour beta.33. Une simulation WebKit sur Linux n’est pas Safari sur iPhone. Phase 1 et validation physique restent ouvertes.
