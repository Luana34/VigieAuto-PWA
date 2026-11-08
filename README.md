# VigieAuto — carnet de bord automobile

**PWA beta.18 — historique kilométrique :** dans **Mes véhicules → Historique km**, consultez les relevés des sources et les corrections manuelles ; une baisse suspecte est signalée en orange. Pour corriger : crayon, nouveau kilométrage, date et motif, puis confirmation. L’historique peut être incomplet ; Android beta.47 ne l’affiche pas encore. [Mode d’emploi](docs/HISTORIQUE-COMPTEUR-PWA-BETA18.md).

**PWA beta.17 — notes du véhicule :** dans **Mes véhicules → Notes**, saisissez du texte et appliquez du gras ou de l’italique à une sélection. Android beta.47 propose aussi le gras et l’italique ; les anciennes structures ou mises en forme devenues périmées sont protégées. Sauvegardez chaque appareil avant un essai. [Mode d’emploi et limites](docs/NOTES-VEHICULE-PWA-BETA17.md).

**Depuis PWA beta.16 et Android beta.46 :** « Infos véhicule » ajoute facultativement couleur réelle, assurance et achat avec devise explicite, sans conversion, rappel ni dépense automatique. [Utilisation et limites](docs/FICHE-VEHICULE-PWA-BETA16.md).


**Depuis PWA beta.15 et Android beta.45 :** un repère de couleur facultatif permet de distinguer les véhicules ; il ne décrit pas la carrosserie. [Utilisation et limites](docs/REPERES-VEHICULES-PWA-BETA15.md).

**Depuis beta.14 :** la recherche locale des marques et modèles accepte certaines petites fautes, par exemple `cio` pour proposer Clio. Le choix reste explicite et la saisie libre est conservée. [Utilisation et limites](docs/RECHERCHE-CATALOGUE-PWA-BETA14.md).

**Depuis beta.13 :** le ZIP source complet fournit `VigieAuto/A-METTRE-SUR-GITHUB/` ; publiez uniquement **le contenu** de ce dossier, et gardez le ZIP pour les tests et la documentation. Aucun dépôt n’est modifié automatiquement. [Quels fichiers garder ou publier ?](docs/QUOI-PUBLIER-GITHUB.md).

**Depuis beta.12 :** des aides ⓘ expliquent le plein complet ou partiel, le calcul de consommation et le VIN. Le bouton d’aide ne change pas la case. [Guide](docs/AIDES-PLEINS-VIN.md).

**Depuis beta.11 :** la case « Plein complet » est plus grande et en gras ; son libellé reste cliquable en dehors du bouton d’aide. Elle reste cochée par défaut : décochez-la pour un plein partiel. Les pleins enregistrés ne sont pas modifiés automatiquement. [Détails](docs/PLEIN-COMPLET-PWA-BETA11.md).

VigieAuto est la suite de CQ Auto : une application web installable (PWA), version candidate 1.5.2-beta.18, en français, sans publicité ni compte utilisateur. Les informations saisies sont enregistrées localement dans le navigateur de l’appareil. Le projet utilise HTML, CSS, JavaScript et IndexedDB, sans bibliothèque ni serveur applicatif à l’exécution.

**Candidate de test, non validée sur iPhone réel.** La version familiale 1.5.1 reste disponible. Cette candidate protège les nombres précis des extensions JSON, refuse avant remplacement les valeurs fonctionnelles impossibles à utiliser sans arrondi, et conserve les extensions du thème et des points CQ édités. Elle ne reconstitue pas les chiffres déjà perdus. La candidate ajoute le carnet enrichi ; l’IndexedDB passe à 7 : les anciennes PWA ne peuvent pas rouvrir directement la base mise à niveau. Sauvegardez chaque appareil avant tout essai ; voir [Précision des sauvegardes](docs/PRECISION-SAUVEGARDES.md).

Pour savoir quoi faire du ZIP et installer la PWA sur Android, consultez [INSTALLER.md](INSTALLER.md).

**Devises :** dépenses, pleins/recharges et interventions conservent chacun leur devise ; anciens montants en EUR, sans taux ni conversion. Sauvegarde v3 sans affectation, v4 pour dépenses seules, v5 si plein ou intervention affecté ; Android beta.47 et PWA beta.18 prennent en charge ces formats. Android beta.35 refuse v5. [Détails](docs/DEVISES-ANDROID-BETA36.md).

### Documents de suivi du projet

- [Bilan du projet](BILAN-PROJET.md)
- [Historique kilométrique PWA beta.18](docs/HISTORIQUE-COMPTEUR-PWA-BETA18.md)
- [Notes du véhicule PWA beta.17 : utilisation et limites](docs/NOTES-VEHICULE-PWA-BETA17.md)
- [Informations véhicule PWA beta.16](docs/FICHE-VEHICULE-PWA-BETA16.md)
- [Repères de véhicules PWA beta.15](docs/REPERES-VEHICULES-PWA-BETA15.md)
- [Aides Pleins et VIN : utilisation et limites](docs/AIDES-PLEINS-VIN.md)
- [Case « Plein complet » : utilisation et tests](docs/PLEIN-COMPLET-PWA-BETA11.md)

- [Totaux Android beta.37 et limites d’échange](docs/TOTAUX-ANDROID-BETA37.md)
- [Portage historique des devises beta.36](docs/DEVISES-ANDROID-BETA36.md)
- [Guide historique PWA beta.8](docs/DEVISES-OPERATIONS-BETA8.md)

- [Trier les dépenses par date, catégorie ou montant](docs/TRI-DEPENSES-BETA31.md)

- [Kilométrage facultatif des dépenses : usage et limites](docs/KILOMETRAGE-DEPENSES-BETA30.md)

- [Justificatifs photo des dépenses : usage, confidentialité et limites](docs/JUSTIFICATIFS-BETA29.md)
- [Tests et limites historiques beta.29](docs/VALIDATION-BETA29.md)
- [Premier lot dépenses Android et compatibilité PWA beta.3](docs/DEPENSES-BETA28.md)
- [Nouveautés et limites du carnet PWA beta.2](docs/CARNET-PWA-BETA2.md)
- [Récapitulatif complet des fonctions Android et PWA](docs/RECAPITULATIF-FONCTIONS.md) — à actualiser à chaque mise à jour
- [Feuille de route technique Android en sept phases](docs/FEUILLE-DE-ROUTE-ANDROID.md)
- [Objectifs de performance et mesures à réaliser](docs/PERFORMANCES.md)
- [Historique des demandes, décisions, réalisations et corrections](docs/HISTORIQUE.md)
- [Cahier des charges et état réel des fonctions](docs/CAHIER-DES-CHARGES.md)
- [Feuille de route et étapes à décider](docs/FEUILLE-DE-ROUTE.md)
- [Annexe technique : trajets et sauvegardes envisagés](docs/plan-trajets.md)

Ces documents, notamment le récapitulatif, sont à mettre à jour à chaque évolution. Les ZIP Web et Android ont tous deux une racine `VigieAuto` : extraire dans deux dossiers parents séparés. Conserver le dossier de code et les trois derniers ZIP de versions distinctes ; supprimer les anciens aperçus et fichiers de travail devenus inutiles sans effacer les données personnelles.

Pour préparer une nouvelle archive après avoir actualisé la version et exécuté les tests, utiliser Python 3.10 ou ultérieur :

```bash
python3 scripts/creer-archive.py --dry-run         # aperçu sans rien modifier
python3 scripts/creer-archive.py --sans-nettoyage  # crée et vérifie, sans supprimer d’anciennes archives
python3 scripts/creer-archive.py                   # crée et vérifie, puis applique la rétention
```

Le script n’écrase pas une archive existante ; il conserve les ZIP inconnus et les sauvegardes personnelles. Un alias historique n’est supprimé que s’il est identique à une archive connue. En cas de deux archives différentes d’une même version, il conserve les deux et signale le conflit à vérifier manuellement.

## Commencer

1. Ouvrez l’application. Le véhicule présenté est **fictif** : en mode découverte, les modifications du carnet d’exemple ne sont pas conservées après rechargement. La préférence de thème, elle, est enregistrée sur l’appareil, même dans ce mode.
2. Choisissez **« Commencer avec mon véhicule »** pour quitter ce mode et ajouter votre véhicule.
3. Sur téléphone, les cinq onglets sont **Accueil, Entretien, Pleins, Trajets et Réglages**. Le bouton **CQ** en haut ouvre directement les contrôles qualité. Le **+** central ouvre les ajouts rapides et le bouton **« … »** les autres rubriques.
4. Ajoutez vos informations. Le kilométrage du véhicule est mis à jour quand une entrée d’entretien ou de plein contient une valeur supérieure ; les trajets ne modifient pas automatiquement le compteur.
5. Dans **Paramètres → Exporter mes données**, téléchargez régulièrement une sauvegarde. Conservez-la dans un endroit sûr.

### Choisir l’apparence

Dans **Paramètres → Thème de l’application** :

- **Sauge** : une palette verte, en version claire ou sombre selon le réglage du téléphone.
- **Cyan** : une palette cyan, en version claire ou sombre selon le réglage du téléphone. La carte véhicule reste sombre dans les deux cas.
- **Automatique (mixte)** : Sauge lorsque le téléphone est en mode clair et Cyan lorsque le téléphone est en mode sombre. Ce choix conserve le comportement de la version précédente et reste celui par défaut si aucune préférence n’est enregistrée.

Les trois choix suivent le mode clair/sombre du téléphone en direct tant que l’application est ouverte. Sauge et Cyan restent dans leur palette respective lors du changement.

La préférence est enregistrée localement dans IndexedDB. Elle est incluse dans les exports de données réelles et restaurée à l’import. Une sauvegarde plus ancienne sans préférence de thème reste compatible : elle utilise alors **Automatique**. Un effacement complet rétablit ce choix par défaut.

### Fonctions de cette version

- Deux thèmes (Sauge et Cyan), chacun en clair ou sombre selon le téléphone ; navigation mobile avec ajout rapide et logo adaptatif.
- Plusieurs véhicules, avec changement de véhicule et suppression de leurs données associées. Marques et modèles recherchables, suggérés par marque, toujours libres et mémorisés localement après validation ; derniers choix repris. Un exemple Renault Clio 2008 est proposé sans création automatique ni kilométrage inventé.
- Référentiel français commun avec Android (48 marques et 432 modèles) ; hybride rechargeable et énergie libre conservées tout en restant compatibles avec les anciens codes d’énergie.
- Trajets **manuels** : chronomètre démarré et terminé par l’utilisateur, ou trajet ajouté après coup ; distance et profil saisis, historique et coût énergétique indicatif fondé sur les pleins valides.
- Trajets **GPS facultatifs** : depuis Trajets, choisissez « Avec GPS » et confirmez avant la demande d’autorisation. L’app estime la distance pendant que la page est visible ; elle enregistre le total et les interruptions, **sans stocker automatiquement les coordonnées ni une trace de l’itinéraire**. À l’arrêt, terminez le trajet et vérifiez/corrigez la distance proposée. La mesure peut être incomplète ou imprécise ; le mode manuel reste disponible.
- Entretiens avec lignes de pièces/opérations chiffrées et main-d’œuvre séparée, plusieurs catégories et recherche plein écran ; pleins avec sous-types de carburant libres ; autres dépenses et rappels par date et/ou kilométrage. Le détail est facultatif et les anciens montants sont conservés.
- **Dépenses :** tri par date, catégorie ou montant, devise par dépense et totaux séparés sans conversion. La PWA permet aussi une devise par plein/recharge ou intervention ; Android beta.37 accepte v4/v5 et affiche les totaux par devise des pleins et entretiens. Les catégories de la candidate correspondent à celles du premier écran Android beta.28. Une dépense et un plein restent indépendants ; les doublons manuels ne sont pas détectés et les statistiques peuvent les additionner deux fois. La candidate PWA permet d’ajouter ou de modifier un kilométrage facultatif sans changer le compteur du véhicule. Après enregistrement, une photo facultative est ajoutée depuis la liste ; JPG, PNG, WebP ou GIF jusqu’à 5 Mio. Elle reste incluse dans les sauvegardes non chiffrées et peut conserver des métadonnées GPS. [Détails](docs/JUSTIFICATIFS-BETA29.md).
- Bouton facultatif de recherche Google Maps depuis le lieu d’intervention ou la station : il envoie le texte au service externe, qui nécessite généralement Internet ; aucun choix d’application de cartes ni résultat exact n’est garanti.
- Six listes de contrôle préchargées, listes personnalisables, exécution et historique.
- Journal de symptômes, documents locaux (images ou PDF de 5 Mo maximum par fichier), statistiques et graphique des six derniers mois.
- Export et import JSON de l’ensemble des données, y compris les photos, documents et listes personnalisées.
- Fonctionnement hors ligne après une première visite complète et la mise en cache de l’application.

## Points importants

- **Sauvegardez régulièrement.** La perte de l’appareil, l’effacement des données du navigateur ou une suppression par le système peuvent effacer le stockage local. Il n’y a aucune sauvegarde automatique ni synchronisation. L’export JSON contient des données personnelles **non chiffrées** ; ne le partagez pas sans précaution.
- L’import accepte les sauvegardes compatibles VigieAuto et les anciennes sauvegardes CQ Auto (qui ne contenaient pas de trajets), et **remplace** les données existantes après confirmation. Il ne s’agit pas d’un import Drivvo. Le remplacement de la base est effectué dans une transaction IndexedDB.
- Les rappels sont vérifiés et affichés **dans l’application**, à son ouverture et lors de son utilisation. Il n’y a pas de notification lorsque l’application est fermée. La récurrence est recalculée à partir de la date et du kilométrage actuels lorsque l’on marque un rappel comme fait.
- Les intervalles d’entretien sont à renseigner selon le constructeur et l’usage ; aucune valeur universelle n’est imposée.
- La consommation est calculée entre deux pleins complets : les volumes des pleins partiels intermédiaires sont inclus. Il faut saisir tous les ravitaillements avec un kilométrage cohérent. La moyenne est pondérée par la distance. Pour les véhicules électriques, le calcul suppose deux charges à 100 % et tient compte de l’énergie rechargée, pertes comprises : il s’agit d’une estimation. Le suivi séparé des recharges d’une hybride rechargeable n’est pas encore proposé.
- Les dépenses affichées sont les **montants enregistrés**, pas un coût total de possession garanti. L’application n’est pas un outil de diagnostic : en cas de voyant rouge, d’odeur de carburant, de fumée anormale ou de doute sur la sécurité, arrêtez-vous en sécurité et consultez un professionnel.
- La position n’est demandée **qu’en choisissant le GPS** et après l’autorisation du navigateur. VigieAuto ne transmet pas les coordonnées à un service tiers et ne les enregistre pas ; le navigateur ou le système peut utiliser ses propres services de localisation. Une connexion n’est pas requise par l’app pour calculer la distance, mais l’obtention d’une position hors ligne dépend du matériel et des réglages du téléphone.
- Le suivi GPS s’arrête lorsque l’application est masquée ; il peut reprendre à son retour à l’écran dans la même session si une position avait été obtenue. Après fermeture, rechargement ou import d’un trajet en cours, reprenez explicitement le GPS à l’arrêt. Il n’y a pas de garantie de suivi écran éteint ou en arrière-plan ; les portions manquantes ne sont pas reconstruites et les interruptions détectées sont signalées. Le téléphone peut consommer plus de batterie.
- Pas de synchronisation cloud ou d’analyse publicitaire dans ce code. L’hébergeur choisi peut toutefois conserver ses propres journaux de connexion. Les données locales et les sauvegardes ne sont pas chiffrées par l’application. Ne manipulez pas le téléphone en conduisant.

## Lancer en local pour développer

Avec Python installé, dans le dossier du projet :

```bash
python3 -m http.server 8000
```

Puis ouvrez **http://localhost:8000/** sur le même ordinateur. `localhost` est un contexte sécurisé pour le développement. Une adresse HTTP du type `http://adresse-ip-de-l-ordinateur:8000` ouverte sur un téléphone n’est généralement **pas** considérée comme sécurisée : le service worker et l’installation hors ligne peuvent ne pas fonctionner. Pour un téléphone, utilisez une adresse HTTPS.

On ne peut pas installer correctement la PWA en ouvrant simplement `index.html` en `file://`.

## Publier en HTTPS

Les fichiers sont statiques ; aucun serveur applicatif n’est nécessaire. Un hébergement statique HTTPS tel que GitHub Pages ou Netlify convient, sous réserve des conditions et limites de son offre.

### Exemple avec GitHub Pages

1. Créez un dépôt GitHub et déposez à sa racine **le contenu** de `VigieAuto/A-METTRE-SUR-GITHUB/`, notamment `index.html`, `sw.js`, `manifest.webmanifest` et les dossiers `js`, `css`, `data`, `assets` et `icons`. Conservez séparément le ZIP source complet ; ne publiez aucune sauvegarde personnelle.
2. Dans **Settings → Pages**, sélectionnez la publication depuis la branche et le dossier qui contiennent ces fichiers.
3. Une fois la publication terminée, ouvrez l’adresse HTTPS indiquée par GitHub Pages. Les chemins relatifs permettent de servir l’application dans un sous-dossier de type `/VigieAuto/`.
4. Laissez la première visite se terminer en ligne ; le service worker met en cache les ressources nécessaires. Vérifiez ensuite le fonctionnement hors ligne.

Pour tester sans toucher à la base familiale, choisissez un appareil de test ou une **origine différente** (protocole, domaine ou port). Un autre chemin sur le même domaine — par exemple deux dépôts du même compte GitHub Pages — peut partager IndexedDB. Un changement de domaine, de port, de navigateur ou d’appareil peut entraîner un stockage différent. **Exportez avant le changement, puis importez la sauvegarde dans la nouvelle installation.** L’aperçu fourni pendant le développement n’est pas un hébergement pérenne.

**Après validation de la candidate uniquement**, une mise à jour de l’installation existante sur la même adresse exige d’abord une sauvegarde externe vérifiée. Ne faites pas cet essai sur l’unique installation familiale. Une base plus ancienne migre vers IndexedDB 7 ; fermez les autres onglets, puis laissez la PWA se mettre en cache en ligne. L’ancienne version ne peut plus rouvrir directement cette base. Les formats compatibles v1 à v5 restent importables. L’export est en v3 sans affectation, v4 pour les dépenses seules, et v5 si un plein ou entretien est affecté. Android beta.37 accepte v5, beta.35 le refuse. Vérifiez Réglages → version 1.5.2-beta.18 et ne supprimez pas les données du navigateur pour forcer une mise à jour. [Détails](docs/DEVISES-OPERATIONS-BETA8.md).

### Installer sur téléphone

- **Android :** ouvrez l’adresse HTTPS dans un navigateur compatible, puis utilisez son menu « Installer l’application » ou « Ajouter à l’écran d’accueil ».
- **iPhone :** ouvrez l’adresse HTTPS dans Safari, choisissez **Partager → Sur l’écran d’accueil**. Le stockage de l’application installée peut être séparé de celui de l’onglet Safari : vérifiez vos données et, si nécessaire, passez par l’export/import.

Les intitulés et possibilités exacts dépendent du navigateur et de sa version. Une première connexion est nécessaire ; l’installation et le cache ne garantissent pas à eux seuls la conservation des données.

## Tests et maintenance

Les calculs critiques disposent de tests sans dépendance. Avec Node.js 18 ou plus récent :

```bash
npm test
```

Pour le test `test:devises-operations`, fournir le ZIP PWA beta.7 via `VIGIE_PREVIOUS_PWA` si nécessaire ; ce contrôle refuse de le simuler. Pour l’ancien test `test:devises`, le ZIP beta.6 facultatif utilise la même variable.

Des tests d’interface Playwright sont également fournis pour les thèmes, la navigation, les formulaires, l’import/export et le hors-ligne. Ils nécessitent les dépendances de développement et Chromium ; ils démarrent un serveur local de test :

```bash
npm install
npx playwright install chromium
npm run test:interface
npm run test:carnet
npm run test:justificatifs
npm run test:devises
npm run test:devises-operations
npm run test:catalogue
npm run test:logo
npm run test:archive
npm run test:publication
npm run test:recherche-catalogue
npm run test:reperes-vehicules
npm run test:fiche-vehicule
npm run test:notes-vehicule
npm run test:compteur
# Mise à jour beta.17 -> beta.18 : fournir le vrai ZIP beta.17 via VIGIE_PREVIOUS_PWA si nécessaire.
npm run test:mise-a-jour-beta18
# Mise à jour beta.16 -> beta.17 : fournir le vrai ZIP beta.16.
npm run test:mise-a-jour-beta17
# Mise à jour réelle beta.15 -> beta.16 : vrai ZIP beta.15 requis.
npm run test:mise-a-jour-beta16
# Mise à jour réelle beta.14 -> beta.15 : fournir le vrai ZIP beta.14
# par VIGIE_PREVIOUS_PWA s’il n’est plus conservé à côté du projet.
npm run test:mise-a-jour-beta15
# Pont PWA/Android fictif : voir docs/REPERES-VEHICULES-PWA-BETA15.md.
# Test historique beta.13 -> beta.14 : nécessite le ZIP beta.13 non simulé,
# à indiquer par VIGIE_PREVIOUS_PWA s’il n’est plus présent à côté du projet.
npm run test:mise-a-jour-beta14
# L’ancien test beta.12 -> beta.13 est aussi conservé :
# npm run test:mise-a-jour-beta13
# Facultatif : installer WebKit puis VIGIE_BROWSER=webkit npm run test:catalogue
# Test facultatif d’une mise à jour réelle à partir du ZIP précédent :
npm run test:migration -- /chemin/VigieAuto-v1.5.1.zip
```

Sur certains systèmes Linux, des bibliothèques système supplémentaires peuvent être nécessaires pour Chromium. Ces dépendances ne sont pas nécessaires à l’utilisation normale de l’application.

Le pont compteur est un **test de développement sur données fictives uniquement** : `VIGIE_ODOMETER_BRIDGE_OUT` permet au test `test:compteur` de créer son entrée ; copiez ensuite uniquement `tests/android/OdometerBridge47Test.kt` dans un dossier de test temporaire et chargez `tests/android/pont-compteur-beta47.init.gradle` depuis le projet Android beta.47. Configurez `VIGIE_COMPTEUR_TEST_DIR`, `VIGIE_COMPTEUR_INPUT` et `VIGIE_COMPTEUR_OUTPUT` avec des chemins absolus, puis exécutez la classe ciblée `com.vigieauto.app.OdometerBridge47Test`. Si les dépendances Robolectric sont déjà disponibles localement, `VIGIE_ROBOLECTRIC_DIR` active leur utilisation hors ligne. Le retour se vérifie par `npm run test:pont-compteur-retour -- /chemin/retour-fictif.json`, avec les deux moteurs. Ne fournissez jamais une sauvegarde personnelle à ce scénario.

- `css/themes.css` : palettes, mode sombre et adaptation de l’interface.
- `js/calc.js` : dates, consommation, échéances et dépenses.
- `js/maintenance.js` : familles d’entretien, recherche, montants détaillés en centimes, extensions facultatives, sous-types de carburant et recherche Google Maps.
- `js/gps.js` : estimation et filtres GPS en mémoire, sans persistance des points.
- `data/brands_models_fr.json` et `js/catalogue.js` : référentiel partagé hors ligne, recherche et mémoire des suggestions.
- `js/db.js` : accès IndexedDB, migration CQ Auto → VigieAuto et transactions.
- `js/odometer-history.js` : corrections manuelles, conversion pour le JSON et chronologie calculée à partir des sources.
- `js/vehicle-marker.js` : repère facultatif par véhicule, inspection prudente et préservation des extensions inconnues.
- `js/vehicle-profile.js` : informations complémentaires facultatives, prix exact et devise explicite, contrôle prudent des formats.
- `js/logo.js` et `assets/logo-vigieauto.svg` : vectorisation du logo fourni, adaptée au thème ; les icônes PNG dérivent de l’image fournie (`assets/logo-original.png`).
- `js/data.js` : catégories, listes par défaut et données fictives.
- `js/app.js` : écrans, formulaires, sauvegarde, suivi GPS et navigation ; `APP_VERSION` doit être mis à jour avec les autres versions.
- `sw.js` : liste des ressources mises en cache. Lors d’une nouvelle version, mettre à jour le nom du cache et la liste des fichiers si nécessaire. Les migrations futures de la base devront conserver les données et être testées avant publication.

## Hors périmètre de cette version

Suivi GPS garanti en arrière-plan ou écran éteint, conservation d’une trace GPS, déclenchement Bluetooth ou NFC, sauvegarde automatique ou Google Drive, notifications en arrière-plan, aide au diagnostic automatisée, OCR, liaison OBD, carte des stations, synchronisation multi-appareils, prévisions budgétaires, import Drivvo et rattachement d’un document à une intervention précise ne sont pas implémentés. Les pistes et limites pour la suite du module Trajets figurent dans `docs/plan-trajets.md`.
