# Essai R8 isolé — Android 0.4.0-beta.25

**Historique :** les résultats ci-dessous concernent beta.25. La photo et les changements de beta.26 n’ont pas été validés par ces contrôles ; reconstruire et retester avant toute décision d’utilisation de R8.

## À quoi sert cette variante ?

La phase 1 prévoit d’étudier R8 avant une version stable. La variante **r8Test** construit le code de l’application avec réduction/obfuscation R8 et réduction des ressources. Elle est destinée à rechercher les incompatibilités ; **ce n’est pas la release familiale ni une version validée pour des données personnelles**.

- Identifiant d’essai : `com.vigieauto.app.r8test`, distinct de l’application habituelle `com.vigieauto.app`. L’installation d’essai utilise sa propre base et n’affiche pas les véhicules de l’installation habituelle ; elle ne la met pas à jour.
- Nom du lanceur : **TEST R8 - VigieAuto**. Elle est signée par la clé de debug du poste de compilation et ne demande aucune clé de production. Cette clé n’est pas fournie dans le projet. Un autre ordinateur a normalement une autre clé et ne peut pas forcément mettre à jour la même installation d’essai.
- `debuggable` est désactivé pour rapprocher l’essai du comportement d’une release. La variante habituelle `debug`, l’identifiant définitif et la configuration `release` habituelle ne sont pas remplacés.
- C’est une installation indépendante : **ses données ne sont ni synchronisées ni transférées automatiquement**. Ne la confondez pas avec votre carnet et ne la désinstallez pas si vous y avez saisi des données à conserver. Faites les essais avec des données fictives sur un appareil de test, après sauvegarde externe vérifiée de vos installations habituelles.

## Construire et contrôler sans installer

Depuis le dossier du projet extrait, avec Java 17, le SDK 36 et les build-tools 35.0.0 :

```powershell
.\gradlew.bat "-Dorg.gradle.jvmargs=-Xmx1024m -Dfile.encoding=UTF-8" :app:assembleR8Test -x :app:lintVitalR8Test
if ($LASTEXITCODE -ne 0) { throw "Échec de l’assemblage R8" }
.\gradlew.bat :app:lintVitalR8Test
if ($LASTEXITCODE -ne 0) { throw "Échec du lint vital R8" }
python scripts\verifier-apk-r8.py --sdk "CHEMIN_REEL_DU_SDK_ANDROID"
if ($LASTEXITCODE -ne 0) { throw "Échec du contrôle statique R8" }
```

Remplacer `CHEMIN_REEL_DU_SDK_ANDROID` par le dossier réel de votre SDK ; le chemin se trouve dans le `local.properties` de votre installation Android Studio. Si `ANDROID_HOME` ou `ANDROID_SDK_ROOT` est déjà défini, l’option `--sdk` peut être omise. Python 3.9+ est nécessaire pour ce contrôle, pas pour utiliser l’application. Sous Linux, utiliser `bash ./gradlew` avec le même paramètre mémoire.

La limite `-Xmx1024m` ne s’applique qu’à cette commande expérimentale ; la mémoire totale utilisée peut dépasser 1 Gio. Une première tentative locale avec 640 Mio de tas a fortement sollicité le ramasse-miettes et a été interrompue. La tentative avec 1 Gio a achevé R8 mais est restée bloquée lors du lint vital, sous forte pression mémoire. Les commandes ci-dessus séparent donc l’assemblage et **l’exécution obligatoire du lint vital juste après** : l’option `-x` n’est pas une suppression du contrôle. Ce réglage ne garantit pas une construction sur toutes les machines. La configuration habituelle reste inchangée.

Le paquet d’essai est généré localement dans `app/build/outputs/apk/r8Test/` et la correspondance R8 dans `app/build/outputs/mapping/r8Test/`. Ils ne sont pas inclus dans le ZIP source, ni publiés par la CI. Le contrôleur utilise `aapt` et `apksigner` du SDK pour vérifier statiquement signature, identifiant isolé, absence d’identifiant utilisateur partagé, nom affiché, versions, API, absence de permissions inattendues, drapeaux de sauvegarde, catalogue embarqué et correspondance apparente de l’implémentation Room. Il vérifie que R8 a renommé au moins une classe du projet et rapproche l’identifiant court du fichier de correspondance du marqueur R8 dans l’APK ; cet identifiant court n’est pas une garantie cryptographique. Le nom « Android Debug » du certificat est un indice de diagnostic, pas une preuve de l’identité du propriétaire de la clé.

**Aucune de ces vérifications ne lance l’APK.** Les tests JVM portent sur le code non minifié, et les scénarios instrumentés actuellement préparés ciblent `debug`, pas cette variante. Une compilation R8, une signature valide, une correspondance Room ou une petite taille ne prouvent pas que les sauvegardes, l’interface et les migrations fonctionnent sous R8.

## Résultat local de beta.25

La variante a été assemblée sous Linux après séparation du lint vital, puis le contrôle statique est passé. L’APK de recherche signé avec la clé de debug locale pèse **1 989 477 octets** ; cette valeur peut varier selon la clé, les outils et la compilation. Elle ne démontre ni la taille d’une release signée de production ni son bon fonctionnement. Le lint vital séparé n’a trouvé aucune anomalie. Le debug ordinaire a aussi été compilé ; 76 tests JVM ciblés non minifiés ont réussi. Les 57 scénarios instrumentés debug sont seulement compilés, sans exécution. Pas de suite JVM complète beta.25, ni d’exécution sur appareil/émulateur, Windows ou GitHub.

## Avant de retenir une version optimisée

Sur des appareils/émulateurs de test API 26 et récents, après sauvegarde externe et avec des données fictives, vérifier au minimum :

1. démarrage, rotation/reprise, navigation et thèmes ;
2. création/édition de véhicules, entretien, plein, rappel et trajet ; suppression puis annulation, fermeture et réouverture ;
3. import JSON v1/v2/v3, refus d’un fichier invalide sans remplacement, export puis comparaison des champs inconnus, nombres précis et documents ;
4. migration de **copies fictives** des anciennes bases jusqu’à Room 15, y compris corruption et rollback ; ne pas supposer que l’installation isolée migre la base de l’application habituelle ;
5. fichiers temporaires, absence de permissions ajoutées, taille et profilage sur appareil ; inspecter les avertissements et conserver `mapping.txt` pour déchiffrer les rapports de cette compilation.

Les profils, mesures de fluidité/mémoire, signature de production, vrais parcours R8 et première exécution GitHub restent à effectuer. Les objectifs de performance ne sont pas garantis. La phase 1 n’est pas terminée.
