# Marques et modèles : recherche Android beta.44

## Comment l’utiliser

Dans l’ajout ou la modification d’un véhicule, commencez par saisir ou choisir une **marque**, puis un **modèle**. Par exemple, avec Renault, saisir `cio` peut proposer **Clio**. Vous choisissez vous-même la proposition ; le texte saisi n’est jamais corrigé automatiquement. Il est toujours possible de saisir un autre nom ou d’utiliser **Autre marque…** et **Autre modèle…**.

La marque choisie ou saisie détermine les modèles proposés. Une marque approximative doit être **sélectionnée explicitement** pour voir les modèles de cette marque : saisir `renult` ne sélectionne pas Renault tout seul. Les modèles personnels restent associés à leur marque. Aucune génération n’est imposée.

## Ce qui change

- La recherche reste locale et fonctionne hors ligne. Elle ignore les accents et la casse, comme auparavant.
- Une correspondance exacte est présentée d’abord, puis les noms contenant la recherche, puis certains noms approchants. Une petite faute est acceptée : une lettre manquante ou supplémentaire, remplacée, ou deux caractères voisins inversés. Pour un nom composé, un mot peut aussi correspondre.
- Dans chacun de ces groupes, les marques et modèles déjà **mémorisés** sont proposés avant les autres, y compris lorsqu’ils figurent dans le catalogue. Pour une recherche vide, ils sont donc en tête de liste. L’ordre ne prétend pas mesurer la fréquence d’utilisation : une suggestion peut provenir d’une sauvegarde importée et rester mémorisée après suppression d’un véhicule.
- L’ancien préremplissage des dernières valeurs lors de l’ajout est conservé. Les doublons sont évités sans modifier les noms enregistrés. Jusqu’à 80 propositions sont affichées ; la saisie libre et le bouton « Autre… » restent accessibles.

### Limites volontaires

Pour éviter trop de propositions trompeuses, la recherche approchante n’est appliquée qu’à une saisie normalisée de **3 à 64 caractères contenant au moins une lettre**, comparée à des noms normalisés d’au plus 128 caractères. Les saisies plus courtes ou purement numériques et les noms plus longs conservent la recherche directe par texte inclus, sans rapprochement approximatif. Toutes les fautes ne sont donc pas reconnues ; une proposition peut aussi ne pas être celle recherchée. La personne vérifie avant de la choisir.

## Données et compatibilité

La recherche ne crée ni véhicule ni suggestion, n’écrit pas dans la base et ne change pas les noms. Les suggestions continuent d’être mémorisées lors de l’enregistrement d’un véhicule, avec les données existantes. Aucun nouveau champ ni historique d’usage n’est ajouté ; Room reste en version 17 et le format JSON ne change pas. Comme toujours, exporter et vérifier une sauvegarde externe avant d’essayer une préversion ou d’importer des données ; un import confirmé remplace la base du destinataire, il ne la fusionne pas.

Le fichier de marques et modèles reste le **même référentiel partagé** sur Android et dans la PWA. La PWA **1.5.2-beta.12** n’est pas modifiée dans ce lot : elle recherche encore par texte inclus, sans recherche approchante ni cette priorité d’affichage. L’échange de sauvegardes reste manuel et sans serveur.

## État et validations

Sous Linux, **86 tests JVM ciblés ont réussi** sans échec ni ignoré dans 11 classes, dont 18 nouveaux scénarios : fautes, limites, accents, ordre, doublons, modèles personnels, choix explicite, saisie libre, édition et conservation des sauvegardes. La suite complète n’a pas été relancée. L’APK debug a été assemblé ; les 69 scénarios instrumentés ont été compilés, **pas exécutés**. Lint : 0 erreur, 24 avertissements et 5 indications. Les scripts d’archive (33), de contrôle CI (32), de workflow (7) et de vérification R8 (22) ont réussi. Aucun ancien fichier de test JVM ni méthode `@Test` n’a été retiré. Windows, GitHub, émulateur et téléphone n’ont pas été validés pour ce lot.

Ceci complète seulement une partie de la phase 2.3. La couleur ou l’avatar par véhicule et une éventuelle vue combinée restent à étudier ; les champs complémentaires demandent une vérification de compatibilité avant ajout et l’historique du compteur une étude préalable. Des essais sur émulateur et téléphone, ainsi que des mesures de performance sur appareil, restent nécessaires.
