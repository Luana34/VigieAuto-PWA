# Kilométrage des dépenses — PWA 1.5.2-beta.5 / Android 0.4.0-beta.30

## Utilisation

Dans **Dépenses → Ajouter une dépense**, le champ **Kilométrage (facultatif)** peut être laissé vide. Dans une dépense existante, modifiez-le ou videz-le puis enregistrez. Il apparaît dans la liste lorsqu’il est utilisable. Ce champ décrit la dépense : **il ne modifie pas le compteur du véhicule** et ne crée ni plein ni intervention. Le justificatif et les autres propriétés de la dépense sont conservés lors des scénarios testés.

Android permettait déjà ce champ depuis beta.28. La beta.30 Android est une mise à jour de version, documentation et tests d’échange ; **le code métier et les écrans Android sont inchangés depuis beta.29**. Il n’est donc pas nécessaire d’installer Android beta.30 simplement pour saisir un kilométrage, si beta.29 est déjà utilisée. La PWA beta.5 échange aussi avec les versions Android précédentes qui connaissent ce champ.

## Sauvegarde et limites

Le même champ JSON v3 facultatif `data.expenses[].odometer` est utilisé sur les deux plateformes. À l’édition, une propriété absente reste absente et une propriété `null` reste nulle tant que l’utilisateur ne change pas ce champ ; effacer volontairement une valeur le retire. Une valeur d’un type futur, négative ou trop grande/précise pour la PWA reste enregistrée sans être affichée ni modifiée par ce formulaire. Aucune conversion approximative n’est effectuée ; les autres champs restent modifiables. Une valeur décimale non négative est acceptée si elle peut être conservée sans arrondi.

Les écritures de la PWA continuent de vérifier la dépense et le véhicule dans la transaction ; une modification concurrente est refusée. Les anciennes versions ne disposent pas nécessairement de cette protection : fermez leurs onglets. Room reste en version 15, IndexedDB en version 4 et le format de sauvegarde en version 3, sans nouvelle migration. **L’import confirmé remplace le carnet destinataire**, ce n’est pas une fusion. Conservez une sauvegarde externe vérifiée avant chaque essai et n’effacez pas les données du navigateur pour forcer une mise à jour.

Pas de changement sur la devise : elle reste en euros. Aucun lien automatique entre plein et dépense, ni détection ou correction des doublons ; ces éléments restent à développer.

## Vérifications

Sous Linux, **49 tests unitaires PWA réussis**. Parcours de dépenses et de justificatifs sous Chromium et WebKit Linux : ajout, modification, retrait du kilométrage, compteur du véhicule inchangé, valeurs futures ou imprécises conservées, justificatif préservé, hors-ligne, quota et conflits simulés. Migration beta.4 → beta.5 et cache hors ligne vérifiés sous les deux moteurs. Les échanges sont faits uniquement avec des données fictives ; WebKit Linux ne remplace pas Safari iOS, et Robolectric ne remplace pas un appareil Android.

**Android beta.30 :** APK debug assemblé, `com.vigieauto.app`, code 34, min 26/target 36, 12 450 081 octets ; seul le droit interne du récepteur est déclaré. Les 87 fichiers de `app/src/main`, les 15 schémas Room, le manifeste et les règles de sauvegarde ont été comparés à beta.29 : identiques. **13 tests JVM ciblés sur 13** réussis, zéro échec ou ignoré (domaine, dépôt, pont). L’échange fictif Room → PWA → Room → PWA avec kilométrage modifié a été exécuté sous Chromium et WebKit Linux, avec extensions futures et nombre exact. Les archiveurs Android et PWA ont réussi respectivement 23/23 et 17/17 tests synthétiques.

La suite JVM complète, lint et tests instrumentés **n’ont pas été relancés pour beta.30**. Le dernier lint et la compilation des instrumentés concernent beta.29. Aucun essai Windows, GitHub, émulateur, téléphone ou Safari iOS ; aucune mesure de performance réelle ni release signée. APK debug non inclus dans le ZIP source.
