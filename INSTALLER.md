# Installer la PWA VigieAuto sur Android ou iPhone

**Candidate beta.13 :** le ZIP complet contient désormais un dossier `A-METTRE-SUR-GITHUB` prêt à publier. Les fonctionnalités et le modèle de données de la PWA ne changent pas ; le numéro de version, les références d’icônes et le cache sont actualisés. [Quels fichiers garder ou publier ?](docs/QUOI-PUBLIER-GITHUB.md).

Depuis beta.12, des boutons ⓘ expliquent les pleins, les recharges et le VIN. La case « Plein complet » reste cochée par défaut : décochez-la pour un plein partiel. La mise à jour ne corrige pas automatiquement les entrées existantes. [Détails et limites](docs/AIDES-PLEINS-VIN.md).

## À quoi sert le ZIP ?

Le ZIP contient les **fichiers du projet**, pas une application Android `.apk`. Le ZIP Android a aussi une racine `VigieAuto` : extrayez les deux projets dans **deux dossiers parents différents** pour ne pas les mélanger. Il ne s’installe donc pas en touchant le ZIP, et il n’est pas nécessaire de l’ouvrir dans Android Studio pour utiliser la version PWA.

Ce ZIP ne met pas automatiquement à jour GitHub Pages : la publication, si vous la décidez après sauvegarde et essais, doit être réalisée par vous. Lorsqu’un aperçu de l’application est proposé dans la conversation, il est temporaire : ne le considérez pas comme un hébergement permanent de vos données.

Pour installer durablement la PWA, il faut publier ses fichiers à une **adresse HTTPS stable**, puis ouvrir cette adresse avec Chrome sur Android. La première visite demande Internet ; après mise en cache, l’application peut fonctionner hors ligne.

**Cette archive est une candidate de test.** Pour préserver l’installation familiale 1.5.1, utilisez un appareil de test ou une **origine réellement différente** (protocole, domaine ou port différent) après avoir sauvegardé les données. Un simple autre chemin ou dépôt sur le même domaine peut partager la base IndexedDB : `https://famille.github.io/VigieAuto/` et `https://famille.github.io/test/` ont la même origine. Ne remplacez pas le site familial pour ce premier essai.

## Exemple : publication gratuite avec GitHub Pages

Cette méthode demande un compte GitHub à la personne qui **publie le code**. En revanche, VigieAuto ne demande pas de compte à ses utilisateurs et leurs données restent dans leur navigateur. Vérifiez les conditions et limites en vigueur du service choisi.

1. Sur un ordinateur, téléchargez et extrayez le ZIP. Ouvrez `VigieAuto`, puis **`A-METTRE-SUR-GITHUB`**. Gardez aussi le ZIP complet en lieu sûr : les sources, tests et documents sont en dehors de ce dossier prêt à publier.
2. Si vous utilisez GitHub Pages pour la candidate, vérifiez d’abord que le site obtenu aura un **domaine différent** de l’installation familiale : deux dépôts `nom.github.io/...` du même compte partagent la même origine. Sinon, utilisez un autre hébergement/origine ou un appareil de test. Créez ensuite le dépôt public ; n’y déposez jamais vos sauvegardes JSON ni vos documents personnels.
3. Dans le dépôt, choisissez l’ajout de fichiers, puis téléversez **le contenu de `A-METTRE-SUR-GITHUB`**, sans son dossier parent et en préservant les sous-dossiers et noms des fichiers. Vérifiez que `index.html` apparaît à la racine du dépôt, au même niveau que `sw.js` et les dossiers `js` et `css`. Validez l’envoi (« Commit changes »). Ne supprimez rien d’un dépôt existant sans avoir d’abord vérifié vos sauvegardes et son rôle.
4. Dans les paramètres du dépôt, ouvrez **Pages**. Sélectionnez une publication depuis la branche `main` et le dossier `/ (root)`, puis enregistrez. Attendez la fin de la publication : GitHub affiche alors une adresse HTTPS.
5. Sur le téléphone Android, ouvrez cette adresse HTTPS dans **Chrome**. Dans son menu **⋮**, choisissez « Installer l’application » ou « Ajouter à l’écran d’accueil », selon le libellé proposé, puis confirmez.
6. Ouvrez l’application installée une première fois avec Internet. Ensuite, activez temporairement le mode avion et vérifiez que l’accueil et vos données sont encore accessibles. Désactivez le mode avion après le test.

Sur **iPhone**, ouvrez la même adresse HTTPS dans Safari, puis choisissez **Partager → Sur l’écran d’accueil**. Le stockage de l’application installée peut être distinct de l’onglet Safari : vérifiez puis utilisez l’import JSON si nécessaire. L’export reste manuel et chaque iPhone conserve ses propres données.

Les libellés exacts et le délai de publication peuvent évoluer. Android et iOS peuvent adapter la forme de l’icône, et une installation existante peut mettre du temps à actualiser son image. L’icône 1.5.1 utilise le logo corrigé sans bord blanc ajouté ; ne supprimez pas l’application pour forcer son rafraîchissement sans avoir d’abord exporté et vérifié vos données.

## Si CQ Auto était déjà installé

- Dans l’ancienne application, ouvrez **Paramètres → Exporter mes données** et gardez le JSON en lieu sûr avant la mise à jour.
- Pour une mise à jour ultérieure seulement, si vous remplacez les fichiers à **exactement la même adresse**, VigieAuto reprend la base locale et ajoute si nécessaire la collection des trajets. Ne faites pas ce remplacement pour le premier essai de la candidate : la base passerait de la version 2, 3, 4 ou 5 à 6 et le retour direct serait bloqué. Fermez les anciens onglets, ouvrez l’application en ligne, laissez-la se mettre à jour puis rechargez-la. Il peut être nécessaire de la fermer et de la rouvrir en ligne.
- Si vous utilisez **une origine différente**, un autre navigateur ou un autre téléphone, le stockage peut être différent. Un simple changement de chemin sur le même domaine ne garantit pas une séparation. Ouvrez VigieAuto, puis importez la sauvegarde depuis **Réglages → Importer une sauvegarde**. L’import remplace les données déjà présentes après confirmation.
- Ne videz pas les données du navigateur et ne désinstallez pas l’ancienne application pour forcer une mise à jour : cela peut effacer le carnet. Les versions anciennes ne reconnaissent pas toutes les nouveautés ; certaines ne lisent pas les formats plus récents. Ne revenez pas en arrière sans copie vérifiée.

## Sauvegardes

Dans **Réglages → Exporter mes données**, téléchargez régulièrement le fichier JSON, puis conservez-en une copie sur un autre support sûr. La sauvegarde inclut des informations personnelles et n’est pas chiffrée par VigieAuto. Aucune sauvegarde automatique sur Google Drive n’est incluse actuellement.

## Essayer la candidate 1.5.2-beta.13 — sauvegarde préalable indispensable

Après création d’une dépense, ajoutez si besoin un justificatif photo depuis sa ligne. La PWA conserve le fichier et ses métadonnées éventuelles ; l’export JSON n’est pas chiffré. Les justificatifs peuvent rendre la sauvegarde volumineuse. Voir `docs/JUSTIFICATIFS-BETA29.md`.

La version familiale 1.5.1 reste la référence. La candidate n’a pas été testée sur iPhone réel. Pour cet essai, ne modifiez pas le site familial et ne partagez pas sa base ; voir `docs/PRECISION-SAUVEGARDES.md`.

1. Dans l’application déjà installée sur **chaque appareil concerné**, ouvrez **Réglages → Exporter mes données**. Conservez le JSON original hors du téléphone, dans un lieu sûr. Il est personnel et non chiffré ; ne le publiez pas.
2. Extrayez le ZIP candidat dans un dossier parent distinct du projet Android. Ouvrez `VigieAuto/A-METTRE-SUR-GITHUB` et publiez **son contenu** sur une origine HTTPS de test différente de l’origine familiale, ou utilisez un appareil distinct de test. Un autre sous-dossier sur le même domaine ne suffit pas à isoler IndexedDB.
3. Ouvrez l’adresse de test en ligne, puis vérifiez **Réglages → version 1.5.2-beta.13**. Sur iPhone, Safari propose **Partager → Sur l’écran d’accueil** ; le stockage de l’application installée peut être distinct de celui de l’onglet Safari.
4. Commencez de préférence avec des données fictives. Pour essayer une copie réelle, utilisez une **copie** de la sauvegarde originale et **Réglages → Importer une sauvegarde** : l’import confirmé remplace les données de cette installation de test. Vérifiez véhicules, carnet, documents et export ; conservez l’original séparément.
5. Après la première mise en cache, testez l’accès en mode avion, puis désactivez-le. Un essai en sécurité du GPS, à l’arrêt et facultatif, demande une autorisation explicite ; aucune position n’est enregistrée. La mesure peut être interrompue et l’écran éteint n’est pas garanti.

**Attention au retour arrière :** si la candidate ouvre la base familiale sur la même origine et dans le même stockage, elle la met à niveau d’IndexedDB 2, 3, 4 ou 5 vers 6. Les anciennes PWA, y compris beta.6 et 1.5.1, ne peuvent ensuite plus ouvrir directement cette base. Un retour nécessite une sauvegarde externe compatible antérieure et une installation séparée ; ne videz pas les données du navigateur et ne désinstallez pas l’application pour forcer le retour.

Les lignes de pièces, les catégories multiples, le sous-type de carburant et le bouton de recherche Google Maps sont décrits dans [le guide du carnet](docs/CARNET-PWA-BETA2.md). Le bouton de carte est facultatif, transmet le texte à un service externe et nécessite généralement Internet ; il ne garantit pas Apple Maps ni l’application par défaut.

Le suivi GPS fonctionne seulement de façon opportuniste lorsque l’application est visible. Les interruptions détectées sont indiquées ; les portions non mesurées ne sont pas reconstruites. Le GPS peut consommer de la batterie et l’obtention d’une position sans Internet dépend du téléphone. N’utilisez pas le téléphone en conduisant.

## Devises et échange Android

La candidate beta.13 permet de choisir la devise de chaque dépense, plein/recharge et intervention ; anciens montants en euros, totaux séparés et aucune conversion. Sans affectation : v3 ; dépenses seules : v4 ; plein ou entretien affecté : v5. Android beta.37 accepte ces formats ; beta.35 refuse v5. Gardez l’original et ne modifiez jamais le numéro du format. [Guide](docs/DEVISES-ANDROID-BETA36.md).
