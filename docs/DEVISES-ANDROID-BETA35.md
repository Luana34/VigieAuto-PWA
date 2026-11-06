# Android 0.4.0-beta.35 — frontière de sécurité du format 5

> **Document historique :** pour l’état actuel Android beta.36 et PWA beta.9, consultez [le guide actualisé](DEVISES-ANDROID-BETA36.md).

## Ce qui change

La candidate PWA 1.5.2-beta.8 peut attribuer une devise aux pleins et aux entretiens. Android beta.35 **ne porte pas encore cette fonction** : son code métier et le schéma Room 16 sont inchangés par rapport à beta.34 ; la version de l'application passe à 0.4.0-beta.35, code 39. Cette livraison ajoute surtout des tests de refus et met à jour les documents. Le choix de devise par dépense, ses totaux séparés et son Undo restent ceux de beta.34.

| Fichier JSON | Android beta.35 | PWA beta.8 |
|---|---|---|
| v1 à v3 compatibles | import, export en v3 sans affectation | import ; export en v3 sans affectation |
| v4, devises de dépenses | import, édition et export | import, édition et export |
| v5, devises de pleins ou interventions | **refus avant remplacement** | import, édition et export |

Un fichier v5 n'est pas automatiquement convertible en v4. Ne pas modifier son numéro, supprimer ses associations ou réétiqueter ses montants : conserver le fichier original et attendre une version Android qui interprétera l'ensemble du contrat. Aucune synchronisation automatique. Une sauvegarde JSON est non chiffrée ; une restauration confirmée remplace toutes les données locales.

## Tests ciblés Linux

- Compilation de la totalité des tests unitaires ; 25 tests ciblés réussis : 3 nouveaux `CurrencyV5BoundaryTest`, 5 `CurrencyBackupCodecTest`, 6 `CurrencyRoomTest` et 11 `CurrencyEditingTest`.
- Le premier nouveau test présente à Android un véritable fichier v5 exporté par la PWA beta.8, contenant des devises sur plein et entretien : refus à la préparation, base intacte et fichier temporaire supprimé.
- Le deuxième montre que le numéro v5 est refusé même si le contenu ne contient que des collections connues d'Android. Le troisième modifie une copie de fichier déjà préparée, puis vérifie la **revalidation et le rollback de toutes les données Room**, même si la version n'est rejetée qu'après lecture des collections.
- Dans la PWA : 59 tests unitaires, interface et compatibilité beta.7 sous Chromium et WebKit Linux. Ces navigateurs ne sont ni Android réel ni Safari iOS. Les tests concernent des données fictives.
- Le pont fictif v4 Android → PWA → Android a réussi sous Chromium et WebKit ; les deux retours Room ont été revérifiés dans les deux moteurs.
- APK debug construit : **12 482 853 octets**, SHA-256 `05c9a03b97601bcf2c4790b72cc470280c12ca9cddc56a4c57941d7c4a0dc3a7` ; code 39, min 26, cible 36. Lint : 0 erreur, 20 avertissements, 3 indications. APK instrumenté construit ; 63 scénarios déclarés, aucun exécuté. Ce n'est pas une mesure release.
- La suite Android complète n'a pas été exécutée pour cette étape ; aucun Windows, émulateur, téléphone ou iPhone réel n'a été vérifié. Aucun temps d'ouverture, FPS, durée d'import/export, usage RAM ou batterie n'est mesuré.

## Prochaine étape

Implémenter réellement côté Android : lecture/stockage/export v5, devises des pleins et des interventions, affichage et édition, totaux et coûts énergétiques séparés, migrations, sauvegardes et Undo transactionnels, tests de compatibilité et de concurrence ; seulement ensuite annoncer l'échange v5 comme pris en charge. La liaison automatique plein/dépense et l'absence de double comptage restent également à réaliser et tester sur les deux plateformes.
