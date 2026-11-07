# Marques et modèles : recherche dans la PWA beta.14

## Comment l’utiliser

Dans l’ajout ou la modification d’un véhicule, commencez par saisir une **marque**, puis un **modèle**. Des propositions apparaissent sous le champ : touchez celle qui convient. Par exemple, avec Renault, `cio` peut proposer **Clio**. Le texte n’est jamais corrigé ni choisi automatiquement.

Vous pouvez toujours écrire librement un autre nom et utiliser **Autre marque…** ou **Autre modèle…**. Le bouton vide le champ du formulaire pour permettre une nouvelle saisie ; il ne supprime pas un véhicule enregistré. Une modification n’est enregistrée que lorsque vous confirmez le formulaire.

La marque saisie ou choisie détermine les modèles proposés. Si vous avez écrit `renult`, il faut **sélectionner Renault** pour accéder aux modèles Renault : une marque approchante n’est pas résolue seule. Un modèle personnel reste associé à sa propre marque. Le modèle est indisponible tant que la marque est vide.

Au clavier, les flèches parcourent la liste, **Entrée** choisit la proposition active et **Échap** ferme d’abord la liste sans fermer le formulaire. Le texte saisi reste libre si aucune proposition n’est sélectionnée. L’interface fonctionne aussi au toucher ; la validation avec VoiceOver et sur un iPhone réel reste à faire.

## Ordre et limites des suggestions

- Les correspondances **exactes** passent d’abord, puis celles qui **contiennent** la saisie, puis certaines correspondances approchantes. À qualité égale, les noms déjà mémorisés passent en premier ; ce n’est pas un classement par fréquence.
- Une seule petite erreur peut être reconnue : lettre oubliée, ajoutée, remplacée ou échange de deux lettres voisines. Un mot isolé d’un nom composé peut aussi correspondre.
- L’approximation est limitée aux recherches normalisées de **3 à 64 caractères**, contenant au moins une lettre, et aux noms normalisés d’au plus **128 caractères**. Pas de rapprochement pour une recherche purement numérique : `208` ne devient pas `308`.
- Les recherches courtes, longues ou numériques gardent la recherche directe. Toutes les fautes ne sont pas reconnues et une suggestion peut être incorrecte : vérifiez toujours votre choix.
- Au plus **80 propositions** sont affichées par champ. Pour affiner une longue liste, saisissez davantage de caractères ; la saisie libre reste possible.

Le comportement est rapproché de celui d’Android beta.44. Les deux utilisent le même référentiel et les mêmes limites principales ; leurs normalisations restent celles de chaque plateforme et certains caractères Unicode rares peuvent donc se comporter différemment. Les noms et modèles sauvegardés ne sont pas modifiés par la recherche.

## Données et publication

Les dernières valeurs et les suggestions personnelles continuent d’être enregistrées uniquement à la confirmation du véhicule ; les champs inconnus de la sauvegarde restent conservés. Aucun schéma IndexedDB, format JSON ou référentiel n’est changé par ce lot. La recherche est locale et fonctionne hors ligne après mise en cache. Sauvegardez toujours avant une mise à jour ; un import confirmé **remplace** la base du destinataire, il ne fusionne pas.

Pour GitHub Pages, le ZIP contient toujours `VigieAuto/A-METTRE-SUR-GITHUB/` : déposez **son contenu**, en conservant les sous-dossiers. Gardez le ZIP complet pour les sources et tests. N’y ajoutez jamais de sauvegarde personnelle. La candidate familiale s’essaie sur un appareil ou une origine différente, après export vérifié : deux chemins `nom.github.io/...` peuvent partager IndexedDB. [Guide de publication](QUOI-PUBLIER-GITHUB.md).

## Vérifications et limites

Les tests logiciels couvrent les fautes, le classement, les limites, les modèles par marque, la conservation des données, les listes effectivement visibles et sélectionnables, le clavier, des actions tactiles simulées, les quatre thèmes, l’affichage à 320/390 px et le hors-ligne sous Chromium et WebKit Linux. La mise à jour utilise le vrai ZIP beta.13 avec des données fictives, dont un export v5. WebKit Linux ne remplace pas Safari sur un vrai iPhone ; lecteur d’écran, téléphone réel et performances sur appareil ne sont pas validés. La phase 2 reste ouverte : avatars/couleurs et vue combinée à étudier, champs enrichis à cadrer et historique du compteur à étudier avant développement.
