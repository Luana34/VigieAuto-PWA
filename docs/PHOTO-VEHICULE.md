# Photo du véhicule — Android 0.4.0-beta.26

## Utilisation

Depuis l’accueil, choisissez le véhicule actif puis **Choisir une photo**. Le sélecteur Android propose les images ou fichiers disponibles sur l’appareil ; un fournisseur que vous choisissez peut lui-même utiliser Internet. La photo apparaît dans la section du véhicule actif. Les autres véhicules conservent leur propre photo ; sélectionnez-les pour les consulter.

La photo peut être remplacée ou retirée après confirmation. Le remplacement ne devient effectif qu’après lecture, conversion et enregistrement réussis. **La photo précédente dans le carnet n’a pas d’annulation** : gardez une sauvegarde JSON précédente. Le fichier source dans la galerie, les autres données du véhicule et les sauvegardes existantes ne sont pas supprimés. Si le sélecteur est annulé ou si la conversion échoue, la photo précédente reste en place.

La prise de vue directe par l’appareil photo n’est **pas encore ajoutée** ; une photo déjà prise peut être choisie depuis la galerie ou un fichier. La photo n’est pas encore affichée pour tous les véhicules simultanément dans la liste, uniquement pour le véhicule actif. Aucun test du sélecteur ou du rendu sur téléphone n’est revendiqué pour cette version.

## Traitement et limites

- Fichier choisi limité à **12 Mio** en entrée ; les images illisibles, vides ou aux dimensions anormales sont refusées. La taille est vérifiée pendant la copie, même si le fournisseur n’annonce pas de taille.
- Sous-échantillonnage avant décodage, plus grand côté ramené à **1 600 pixels maximum**, puis JPEG de **3 Mio maximum** avec plusieurs niveaux de qualité. Aucune taille précise ni qualité particulière n’est garantie. Si l’image ne peut pas respecter la limite, elle est refusée sans écriture.
- Orientation EXIF appliquée lorsqu’elle est reconnue par la bibliothèque [AndroidX ExifInterface 1.4.2](https://developer.android.com/jetpack/androidx/releases/exifinterface#1.4.2) ; le JPEG produit ne recopie pas les métadonnées EXIF, y compris l’éventuelle position GPS d’origine. La bibliothèque est embarquée ; l’application ne requiert pas Internet, mais sa récupération initiale par Gradle peut nécessiter une connexion. Elle remplace l’ancienne API système que lint déconseille sur les anciens Android, sans garantir l’absence de tous les défauts. Une image animée devient une image fixe ; la transparence est convertie sur fond blanc. Ces comportements restent à vérifier sur un vrai téléphone, avec différents fournisseurs et formats.
- L’image est enregistrée dans le champ `photo` existant du JSON commun sous forme de `data:image/jpeg;base64,...`, et dans les blocs Room typés existants. Aucun nouveau schéma Room ni nouvelle version JSON. Les photos importées restent inchangées tant que vous ne les remplacez pas.
- L’aperçu se limite au véhicule actif et est chargé hors du fil d’interface. Une photo importée très volumineuse ou illisible peut être conservée sans aperçu ; elle n’est pas modifiée automatiquement. Le résultat dépend des décodeurs disponibles sur Android.
- Une copie privée temporaire bornée est utilisée pendant la conversion. Son retrait est tenté même en cas d’échec ou d’annulation ; en cas d’arrêt brutal, un nettoyage est tenté au démarrage suivant sans supprimer une copie encore active. Une suppression de fichier peut toutefois échouer et le cache n’est pas chiffré par VigieAuto.
- La cible et son empreinte sont conservées lors d’une rotation ordinaire. Si le véhicule a changé pendant le choix, l’enregistrement est refusé plutôt que d’écraser une version plus récente. Après une destruction complète du processus, le choix peut devoir être recommencé : aucune écriture ne doit être supposée réussie.
- Aucune permission générale de galerie, caméra, GPS, Bluetooth ou Internet n’est ajoutée pour ce lot. Le sélecteur donne accès au fichier explicitement choisi.

## Sauvegardes et essais

La photo fait partie de l’export JSON existant ; le fichier et la base locale ne sont pas chiffrés par VigieAuto. Vérifiez et gardez une copie externe avant mise à jour ou remplacement d’une photo. Un import confirmé **remplace**, il ne fusionne pas.

Avec une fixture fictive, l’édition du véhicule dans les PWA 1.5.1 et 1.5.2-beta.1 a ajouté des champs facultatifs `vin` et `fuelDetail` vides qui étaient absents. La photo, les champs déjà présents et les autres collections vérifiées (hors réglages) sont restés identiques dans ce scénario. Il ne s’agit pas d’une preuve de fidélité pour toutes les sauvegardes : garder les originaux, notamment en raison de la limite connue de précision numérique de la PWA 1.5.1.

Les tests JVM et les tests Android instrumentés sont distincts. `:app:testDebugUnitTest` s’exécute sur l’ordinateur avec des simulations ; `:app:connectedDebugAndroidTest` s’exécute sur un appareil ou émulateur connecté. Les tests instrumentés photographiques, la galerie réelle, les rotations d’écran et les limites de mémoire restent à valider sur Android. L’utilisation de la PWA et de son navigateur sur iPhone reste également à vérifier séparément.

### Reproduire le pont photo avec des données fictives

Ces commandes sont destinées à un environnement de développement : Node.js, Playwright et Chromium doivent être installés dans un dossier de développement PWA séparé ; l’installation de ces outils peut nécessiter Internet, pas l’application. Ne pas utiliser de sauvegarde personnelle. Sous PowerShell, dans le dossier Android extrait :

```powershell
$fixtureAndroid = Join-Path $PWD 'app/build/bridge/android-photo.json'
$fixtureRetour = Join-Path $PWD 'app/build/bridge/web-photo.json'
# $pwa : dossier contenant index.html, js/ et node_modules/playwright
.\gradlew "-PbridgePhotoOut=$fixtureAndroid" :app:testDebugUnitTest --tests 'com.vigieauto.app.VehiclePhotoProcessorTest.processedPhotoIsStoredInRoomAndExportedAsCommonJson'
node scripts/test-photo-pont.cjs $pwa $fixtureAndroid $fixtureRetour $pwa
.\gradlew "-PbridgePhotoReturn=$fixtureRetour" :app:testDebugUnitTest --tests 'com.vigieauto.app.VehiclePhotoRepositoryTest.webPhotoOrLocalFixtureRoundTripsThroughRoom'
```

Définissez `$pwa` comme le chemin réel du projet PWA installé, et examinez les échecs éventuels. La fixture exportée est créée par le test Room ; le script importe, affiche et édite dans la PWA servie localement, puis exporte ; le dernier test lit ce retour dans Room. Utiliser une copie de test : l’import d’une sauvegarde réelle remplace les données du destinataire. Un résultat réussi sous Chromium automatisé ne valide pas Safari ou iPhone.
