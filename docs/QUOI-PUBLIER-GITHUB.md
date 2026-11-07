# Quels fichiers garder ou mettre sur GitHub ?

## Le plus simple

- **Pour publier la PWA :** après extraction du ZIP PWA, ouvrez `VigieAuto/A-METTRE-SUR-GITHUB/` et envoyez **le contenu de ce dossier** à la racine du dépôt de publication. `index.html` et `sw.js` doivent se retrouver à la racine du site, pas dans un dossier supplémentaire. Ce dossier contient uniquement les fichiers utilisés par la PWA et son fonctionnement hors ligne ; il ne contient ni tests, ni documentation, ni sauvegarde personnelle.
- **Pour continuer le développement :** conservez aussi, sur votre ordinateur ou dans un endroit sûr, **le ZIP source complet**. Il contient le code d’origine, les tests et les documents demandés. Le dossier prêt à publier est une copie générée à partir de ce code ; ne modifiez pas uniquement la copie en pensant que le projet source sera mis à jour.
- **Pour Android Studio :** gardez le projet Android complet extrait dans un autre dossier parent. GitHub n’est pas obligatoire pour compiler ou utiliser l’application Android.

La PWA doit être hébergée à une adresse HTTPS stable pour une installation habituelle, notamment sur iPhone. La première visite et la mise à jour demandent Internet ; après mise en cache, les fonctions prévues localement restent accessibles hors ligne. GitHub Pages est une solution parmi d’autres ; un compte GitHub est nécessaire à la personne qui publie, pas aux utilisatrices de VigieAuto.

## Ce qu’il faut publier pour la PWA

Dans le dossier prêt à publier :

| À mettre sur le site | Utilité |
|---|---|
| `index.html`, `sw.js`, `manifest.webmanifest` | Page, fonctionnement hors ligne et installation. |
| `css/` | Apparence. |
| `js/` | Code de l’application : ne pas le retirer. |
| `data/brands_models_fr.json` | Catalogue partagé de marques et modèles : ce fichier JSON fait partie de l’application. |
| `assets/` et `icons/` présents dans ce dossier | Images, logo et icônes nécessaires au site. |

Le dossier est construit à partir de la liste de ressources locales du service worker ; les dépendances locales déclarées dans la page, le manifeste, les modules et les styles sont vérifiées avant l’archive. Si une ressource manque ou qu’un chemin dangereux est détecté, la création s’arrête sans effacer les anciennes archives.

Il n’est **pas nécessaire sur le site PWA** de publier `tests/`, `docs/`, les fichiers `.md`, `scripts/`, `package.json` ou `package-lock.json`. Ils restent dans le ZIP complet pour la maintenance et les vérifications. Une page GitHub publique peut rendre accessibles tous les fichiers publiés : ne jamais y envoyer ses **exports JSON personnels**, photos, documents, mots de passe ou clés. Il ne faut pas confondre un export personnel avec `data/brands_models_fr.json`, qui est une donnée publique nécessaire à l’application.

## Les tests : importants dans le projet, inutiles sur le site

Les tests aident à détecter une régression, notamment lors d’un import, d’une mise à jour ou d’un calcul. Ils ne remplacent pas une sauvegarde ni des essais réels, mais les garder est important. Aucun test du projet n’est retiré dans ce lot.

- PWA publiée : les tests ne sont pas chargés par l’application et ne vont pas dans le dossier à publier.
- Android Studio : la construction `:app:assembleDebug` ne nécessite pas d’**exécuter** la suite de tests, mais la commande `:app:testDebugUnitTest` que vous utilisez a besoin des fichiers de tests. Si l’on les retire, cette commande ne vérifiera plus la même chose. Gardez aussi les scénarios instrumentés et les schémas Room pour les futures validations.
- Dépôt Android avec **GitHub Actions** : conservez le projet complet, notamment `app/`, `gradle/`, `gradlew`, `gradlew.bat`, les fichiers Gradle, `.github/workflows/` et `scripts/`. Le contrôle d’archive demande aussi les documents du projet. Retirer ces éléments peut casser les contrôles ou la création d’un ZIP.

## Fichiers locaux et précautions

Les caches et dossiers générés tels que `node_modules/`, `.gradle/`, `.idea/` et `build/` ne sont pas à publier. Si vous gérez aussi les sources PWA avec Git, le fichier `.gitignore` du projet aide à exclure des caches, certaines clés et les exports VigieAuto au nom habituel ; ce n’est pas une garantie contre tous les secrets, vérifiez toujours avant un envoi. `local.properties` est un réglage local du chemin SDK : il peut être nécessaire sur votre PC mais ne doit pas être partagé. Les clés de signature et fichiers personnels ne doivent jamais être publiés. **Ne supprimez pas votre clé de signature Android** : une mise à jour par-dessus l’application existante doit être signée avec la même clé.

Si un dépôt existe déjà, ne supprimez ni ses fichiers ni une installation familiale précipitamment. Exportez et vérifiez d’abord les données de chaque appareil, gardez une copie hors téléphone et testez la candidate sur un appareil de test ou une origine différente. Deux chemins `nom.github.io/...` d’un même compte partagent la même origine et peuvent donc partager IndexedDB. Un import confirmé **remplace** la base du destinataire : il ne fusionne pas les données. Aucune modification de votre dépôt n’est effectuée automatiquement.

## Ce que ne fait pas ce lot

La PWA beta.13 ne change pas les fonctionnalités, les données, les calculs ou le schéma IndexedDB ; son numéro, le cache et les références d’icônes évoluent pour distinguer le paquet. La recherche approximative disponible sur Android beta.44 n’est pas encore portée dans la PWA. Les essais sur Android physique et sur Safari iPhone restent à faire ; les performances restent non mesurées.
