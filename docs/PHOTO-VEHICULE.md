# Photo du véhicule — Android 0.4.0-beta.42

## Utilisation

Depuis **Accueil**, choisissez le véhicule actif. Dans **Photo du véhicule**, vous pouvez :

- **Choisir une photo** dans la galerie ou les fichiers, comme auparavant ;
- **Prendre une photo** avec une application photo du téléphone ;
- remplacer ou retirer la photo du carnet après confirmation.

La prise directe utilise une application photo déjà présente sur l’appareil. Si elle manque, refuse la demande, retourne une image vide ou si le traitement échoue, la tentative n’enregistre pas une nouvelle photo. En cas de doute après une interruption, vérifiez la photo actuelle avant de recommencer. Si une prise reste en attente à la réouverture et ne revient pas, **Abandonner la prise** permet de la libérer ; la photo déjà enregistrée n’est pas supprimée. Un résultat tardif d’une ancienne prise ne doit pas être attribué à une autre.

Le remplacement et le retrait n’ont **pas d’Undo**. Avant de changer une photo, exportez et vérifiez une sauvegarde externe que vous conserverez : une confirmation ne remplace pas une sauvegarde. Le fichier d’origine dans la galerie et les sauvegardes existantes ne sont pas modifiés par VigieAuto. L’application photo externe peut toutefois enregistrer sa propre copie selon ses réglages.

La photo principale affichée est celle du véhicule actif. Depuis beta.42, la liste multivéhicules montre aussi des miniatures des lignes visibles, lues à la demande et sans modifier les photos ; voir [Mes véhicules](LISTE-VEHICULES.md). Ne pas supposer les objectifs de fluidité atteints.

## Traitement et limites

- L’image traitée est limitée à **12 Mio en entrée**. Une prise trop volumineuse ou illisible est refusée sans remplacer la photo. Le fichier brut est d’abord écrit par l’application photo : VigieAuto ne peut pas en borner la taille pendant cette écriture externe, et l’espace libre reste nécessaire.
- Sous-échantillonnage avant décodage, plus grand côté ramené à **1 600 pixels maximum**, puis JPEG de **3 Mio maximum** avec plusieurs niveaux de qualité. Une image animée devient fixe et la transparence est convertie sur fond blanc. Aucune taille précise ni qualité particulière n’est garantie ; une image incompatible est refusée.
- L’orientation EXIF reconnue est appliquée via AndroidX ExifInterface ; les métadonnées EXIF, dont les éventuelles coordonnées GPS, ne sont pas recopiées dans le JPEG produit par VigieAuto. Le fichier brut ou une copie conservée par l’application photo peut encore contenir ses métadonnées. Les décodeurs et comportements des applications photo varient : à vérifier sur appareil réel.
- La photo convertie est enregistrée dans le champ `photo` existant du JSON commun, en `data:image/jpeg;base64,...`, et dans les blocs Room existants. **Room 17 et les formats JSON v1–v5 ne changent pas.** Les photos importées restent inchangées tant qu’elles ne sont pas remplacées.
- L’aperçu principal du véhicule actif est chargé hors du fil d’interface et borné à 600 pixels de côté ; les miniatures de la liste sont distinctes. Une photo importée très volumineuse ou illisible peut être conservée sans aperçu ; elle n’est pas réécrite automatiquement.

## Confidentialité, interruptions et nettoyage

La prise directe crée un fichier privé dans le cache, puis confie à l’application photo une seule URI `content://` temporaire via un `FileProvider` non exporté. Le fournisseur ne partage ni la base ni tout le cache. Des autorisations ponctuelles de lecture/écriture sont demandées pour cette URI et leur révocation est tentée au retour ou à l’abandon ; le fichier temporaire est ensuite supprimé si possible. VigieAuto n’ajoute pas de permission générale `CAMERA`, galerie, GPS, Bluetooth ou Internet. Une autre application choisie par la personne peut avoir ses propres permissions et son propre fonctionnement, y compris des copies ou des services en ligne ; VigieAuto ne les contrôle pas.

Le cache et le JSON ne sont pas chiffrés par VigieAuto, et une suppression de fichier n’est pas un effacement physique garanti. Si la révocation ne peut pas être confirmée au retour, la tentative de remplacement est refusée ; si le retrait d’accès ou l’effacement échoue, un message le signale. Après un arrêt brutal, un nettoyage et une révocation sont tentés à l’ouverture pour les prises abandonnées d’au moins **24 heures** ; une prise active ou restaurée est épargnée. Une horloge modifiée ou un problème de stockage peut retarder le nettoyage, tandis qu’Android peut lui-même vider le cache. Le fichier de conversion séparé est également nettoyé selon sa propre politique.

La cible et son empreinte sont conservées à la rotation et, lorsque Android restaure l’état, après recréation du processus. Si le carnet n’est pas encore disponible, la reprise attend sa lecture ; le bouton de reprise du chargement reste accessible. Si le véhicule a changé, l’enregistrement est refusé plutôt que d’écraser la version plus récente. Une mort de processus au mauvais moment peut rendre le résultat incertain : consultez la photo actuelle et recommencez si nécessaire ; l’état temporaire n’est pas une sauvegarde durable.

## Sauvegardes et vérifications

L’export JSON comprend la photo du véhicule. Android et PWA ne se synchronisent pas. Un import confirmé **remplace** les données du destinataire : il ne fusionne pas. Gardez les originaux dans un emplacement externe sûr ; les JSON ne sont pas chiffrés. La PWA familiale 1.5.1 peut arrondir certains grands nombres et reste une version distincte de la candidate 1.5.2-beta.10.

**Résultats historiques beta.41 — la vérification beta.42 est détaillée dans [Mes véhicules](LISTE-VEHICULES.md) :**

- **Suite complète Android sous Linux :** 741 scénarios, **733 réussis, 8 ignorés** faute des anciennes fixtures de retour PWA ; aucun échec. La suite a émis un avertissement CloseGuard indiquant qu’une connexion SQLite ouverte n’avait pas été fermée dans `BackupVerificationTest`. Ses trois tests ont ensuite réussi lors d’une reprise ciblée sans reproduire le message. La cause reste à examiner ; ce signal ne démontre ni n’exclut une fuite sur un vrai appareil.
- **Pont de photo fictive :** photo traitée et exportée par Android, puis importée et affichée par la vraie PWA candidate beta.10. Après modification des notes du véhicule et réexport PWA, photo et notes ont été réimportées et contrôlées dans Room ; parcours réussis séparément avec Chromium et WebKit Linux. Ce ne sont pas des essais d’appareil photo ni de Safari iOS.
- **Compilation et analyse :** APK debug assemblé ; **68 scénarios instrumentés compilés, aucun exécuté** faute d’appareil ou émulateur disponible. Lint : **0 erreur, 24 avertissements et 5 indications** ; quatre nouveaux avertissements proposent uniquement une écriture Kotlin `toUri`. Les 88 tests Python des contrôleurs CI, workflow, R8 et archiveur ont réussi. Les objectifs de performances ne sont pas mesurés.

Les tests JVM/Robolectric simulent Android sur l’ordinateur. Les tests instrumentés nécessitent un appareil ou émulateur et leur seule compilation ne vaut pas exécution. Une application photo réelle, les permissions, la rotation, la mort de processus, le stockage, les performances et la PWA sur Safari iPhone restent à vérifier physiquement, après sauvegarde.

### Reproduire le pont photo avec des données fictives

Node.js, Playwright et un navigateur sont nécessaires dans un dossier PWA de développement séparé ; leur installation peut demander Internet, pas l’application. Ne pas utiliser de sauvegarde personnelle. Sous PowerShell, depuis le projet Android extrait :

```powershell
$fixtureAndroid = Join-Path $PWD 'app/build/bridge/android-camera.json'
$fixtureRetour = Join-Path $PWD 'app/build/bridge/web-camera.json'
# $pwa : chemin réel d’un dossier PWA contenant index.html et node_modules/playwright
.\gradlew "-PbridgePhotoOut=$fixtureAndroid" :app:testDebugUnitTest --tests 'com.vigieauto.app.VehicleCameraIntegrationTest.cameraOutputIsRotatedCompressedWithoutExifAndExportedWithoutChangingLinkedData'
node scripts/test-photo-pont.cjs $pwa $fixtureAndroid $fixtureRetour $pwa
.\gradlew "-PbridgePhotoReturn=$fixtureRetour" :app:testDebugUnitTest --tests 'com.vigieauto.app.VehiclePhotoRepositoryTest.webPhotoOrLocalFixtureRoundTripsThroughRoom'
```

Par défaut le script utilise Chromium ; `$env:VIGIE_BROWSER='webkit'` sélectionne WebKit Linux. Il charge la vraie PWA de test, affiche la photo et la conserve après édition/export, puis Room lit le retour. Ce scénario synthétique ne remplace ni un essai d’appareil photo ni Safari sur iPhone.
