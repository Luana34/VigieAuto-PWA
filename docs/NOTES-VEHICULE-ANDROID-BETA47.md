# Notes du véhicule — Android 0.4.0-beta.47

Cette préversion porte les **notes enrichies de la PWA 1.5.2-beta.17** sur Android. Elle ne constitue pas une version stable ni une validation sur un téléphone.

## Utilisation

1. Pour le véhicule actif, ouvrir **Accueil → Notes du véhicule**. Pour un autre véhicule, ouvrir **Voir/Choisir un véhicule → Notes** sur sa ligne : cela ne change pas le véhicule actif.
2. Saisir les notes, puis **sélectionner du texte avec le doigt** et toucher **Gras** ou **Italique**. Les deux styles peuvent se superposer. Appuyer de nouveau sur un style déjà entièrement appliqué à la sélection le retire sur cette sélection.
3. Le champ de saisie reste en texte simple ; la mise en forme apparaît dans **Aperçu**. L’aperçu traite les notes comme du texte, pas comme du HTML ou du code.
4. **Enregistrer** valide la modification. Une confirmation est demandée avant remplacement du texte antérieur ou retrait/modification d’une mise en forme existante. **Annuler** ne change pas la base ; un brouillon modifié demande confirmation avant abandon.

Le brouillon et la sélection sont conservés lors d’une rotation ordinaire. Un arrêt forcé ou la fin du processus ne garantit pas la conservation du brouillon non enregistré : rien n’est écrit automatiquement dans Room à l’ouverture. Une saisie qui dépasse la limite ou ne permet pas une mise en forme valide est refusée avec explication ; le brouillon précédent reste intact.

L’ancien formulaire **Modifier ce véhicule** reste utilisable pour les autres informations. Les notes contenant une extension, un type inattendu ou un texte trop long y sont protégées : utiliser le bouton **Notes**. Les anciennes notes simples restent modifiables dans ce formulaire ; un remplacement ou un effacement demande confirmation.

## Sauvegardes et compatibilité

- Exporter et vérifier **séparément** les données de chaque appareil avant tout essai, puis garder une copie sûre hors du téléphone. Les fichiers JSON ne sont **pas chiffrés** et peuvent contenir des données personnelles.
- L’échange reste **manuel**, sans serveur ni synchronisation. Importer une sauvegarde **remplace** le carnet destinataire après confirmation : ce n’est pas une fusion.
- Les anciennes versions peuvent lire le texte brut si elles acceptent la version du fichier. Elles ne savent pas forcément conserver la mise en forme en cas de modification du texte. Au retour, cette version et la PWA détectent la divergence : le texte courant reste visible et les anciennes plages restent conservées jusqu’à une décision explicite.
- Une note ou une extension future non reconnue, ou une note de plus de **8 000 unités UTF-16**, n’est pas modifiable dans cet éditeur. Les données restent conservées ; utiliser une version compatible. Un emoji peut compter pour deux unités. Maximum : **128 plages**.
- Les autres champs du véhicule, les propriétés inconnues et les autres collections sont conservés. Aucun changement de schéma Room ni de version de sauvegarde n’est nécessaire : Room 17, JSON v1–v5 en lecture et v3/v4/v5 en export selon les devises restent inchangés.
- Android conserve les retours CR, LF et CRLF tels qu’ils sont enregistrés, sans nettoyage implicite. Dans la PWA, certains retours anciens peuvent être normalisés lors d’une édition ; la PWA avertit avant validation.

## Contrat et sécurité

Le texte reste dans `vehicle.notes`. L’extension facultative `vigieVehicleNotes` v1 ne recopie pas la note : elle contient `algorithm: "sha256-utf16be-v1"`, une empreinte SHA-256 des unités UTF-16 en ordre big-endian et des plages `{start,end,style}`. Les demi-surrogates isolés sont inclus exactement dans l’empreinte. Les bornes sont exclusives en fin, comptées en unités UTF-16, sans couper une paire de surrogates ; les styles reconnus sont `bold` et `italic`. Les intervalles d’un même style sont fusionnés pour l’affichage et les éditions, mais une simple lecture ou un brouillon inchangé ne réécrit pas les données.

Les propriétés inconnues au niveau de l’extension sont préservées. Une plage avec un champ ou un style inconnu, un format futur, une empreinte mal formée ou une note inattendue rend l’édition indisponible sans effacement. Une empreinte valide mais différente du texte signale une mise en forme périmée ; reprendre sans les anciennes plages est une action volontaire, puis l’enregistrement demande confirmation. Les autres versions peuvent produire une divergence si elles modifient les notes sans mettre à jour leur empreinte.

Lecture et écriture Room utilisent le JSON complet et l’empreinte du véhicule ; la vérification du conflit, la validation et l’écriture sont transactionnelles. Un véhicule modifié ou supprimé entre-temps n’est ni écrasé ni recréé. Tant que l’éditeur est ouvert, les autres modifications et l’import sont bloqués ; les doubles enregistrements sont refusés. Aucune donnée n’est envoyée sur Internet.

## Vérifications effectuées et limites

- **116 tests JVM ciblés exécutés sous Linux**, sur 15 classes : aucun échec ni ignoré. Ils couvrent notamment les notes, la protection de l’ancienne fiche, Room, les conflits, le ViewModel, le sélecteur et l’activité. La **suite JVM complète n’a pas été relancée** pour ce lot.
- Le corpus commun produit à partir de la PWA beta.17 contient **202 cas, 17 opérations et six empreintes** ; il couvre les styles et les unités UTF-16. SHA-256 : `c8a471aff40b4e113335ba1abd136a12b803102f3fb4003e4bd6e404d475d5c2`.
- Échange fictif **PWA → JSON → Android/Room → JSON → PWA** : export de départ sous Chromium, modifications et réexport avec le dépôt Room en JVM, puis lecture et modification de retour sous Chromium et WebKit **Linux**. Styles, autres données et nombres précis ont été vérifiés dans ce scénario. Il ne s’agit ni d’un appareil Android ni de Safari iOS.
- L’**APK debug** a été assemblé ; l’APK instrumenté et **70 scénarios instrumentés ont été compilés, sans être exécutés**. Le manifeste CI les déclare et le contrôleur JVM exige 22 scénarios critiques des notes. Le workflow GitHub n’a pas été lancé.
- Analyse lint : **0 erreur, 24 avertissements, 5 indications**. Contrôles Python : **36 tests d’archive, 33 du contrôleur CI, 7 du workflow et 22 du contrôleur R8**. Ces derniers ne constituent pas une compilation R8 ni une exécution des appareils.
- Le premier essai avait révélé dix échecs dans des scénarios de test : interactions avec des boutons fixes, attentes d’une fixture et adaptation de l’ancien formulaire. Le test d’activité synchronise maintenant l’aperçu et vérifie le gras **avant et après rotation, puis après réouverture**. Les 15 classes ont été rejouées ; **aucun test n’a été retiré**.
- La taille de l’APK **debug**, compilé dans cet environnement, est de **12 811 112 octets** (SHA-256 `696d7699ffad042b47009cfa5a613c00e61017495d803bf43ddb34cd2b0c4efc`). Il n’est pas inclus dans le ZIP source ; cette taille ne valide pas la cible de l’APK release.
- **Non vérifié :** téléphone Android, émulateur, PC Windows réel, GitHub, Safari sur iPhone et lecteur d’écran réel. Les temps de démarrage, la fluidité, la RAM, l’import/export et la taille release restent des **objectifs non mesurés**.

## Reproduire certains contrôles

Les scénarios utilisent uniquement des données fictives. Commande ciblée facultative dans Android Studio sous Windows, sans supprimer les autres tests :

```powershell
.\gradlew.bat :app:testDebugUnitTest --tests "com.vigieauto.app.VehicleNotesDomainTest" --tests "com.vigieauto.app.VehicleNotesRoomTest" --tests "com.vigieauto.app.VehicleNotesUiTest" --tests "com.vigieauto.app.VehicleNotesLegacyUiTest" --tests "com.vigieauto.app.VehicleNotesActivityTest"
```

Ces tests sur ordinateur ne remplacent pas les essais sur Android réel, émulateur, Windows réel ou Safari iPhone. La suite complète, les essais physiques et les performances doivent être distingués des seuls tests compilés. Le relevé exact des contrôles de cette archive figure dans le bilan et l’historique.

Pour reproduire le pont fictif, générer d’abord un export synthétique PWA beta.17 avec `tests/notes-vehicule-beta17.cjs` et `VIGIE_NOTES_BRIDGE_OUT`, puis utiliser `scripts/preparer-pont-notes.cjs`. L’essai `VehicleNotesRoomTest.pwaRoomAndroidNotesBridgeKeepsOtherDataAndProducesValidPwaReturn` accepte `VIGIE_NOTES_INPUT` et `VIGIE_NOTES_OUTPUT`. Enfin `scripts/test-pont-notes-android.cjs` ouvre le résultat dans la PWA ; `VIGIE_BROWSER=webkit` sélectionne WebKit. Ces scripts ne doivent jamais recevoir de sauvegarde personnelle.
