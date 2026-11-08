# Pont de sauvegarde PWA / Android : compatibilité par format

**PWA beta.16 / Android beta.45 :** extension facultative `vehicles[].vigieVehicleProfile` v1 pour carrosserie, assurance et achat. Le prix est une chaîne décimale exacte avec devise explicite, sans affectation d’opération ni nouveau numéro d’enveloppe. Android beta.45 n’affiche pas ces champs. Un aller-retour fictif PWA beta.16 → dépôt Android beta.45/Room → PWA a conservé la fiche, une note modifiée par le dépôt Android et les nombres précis après édition et Undo ; le retour PWA a été vérifié sous Chromium et WebKit Linux. Ce test ne valide pas une interface ni un appareil Android réels. L’import remplace toujours le carnet destinataire ; une sauvegarde externe reste nécessaire. [Guide](FICHE-VEHICULE-PWA-BETA16.md).


**Contrat actuel :** v3 sans affectation ; v4 pour devises de dépenses seules ; v5 dès qu’un plein/recharge ou entretien porte une affectation. PWA beta.16 et Android beta.45 lisent et écrivent ces formats ; Android beta.35 et PWA beta.7 refusent v5. Ne changez pas le numéro et ne supprimez pas les affectations pour contourner un refus. [Guide](DEVISES-ANDROID-BETA36.md).

**Historique beta.7/beta.32 :** une sauvegarde PWA beta.7 avec affectation de devise est en **format 4** et n’est pas importable sur Android beta.32. Sans affectation, la PWA exporte encore en v3. Ne pas convertir le numéro de format ni supprimer les affectations pour contourner le refus. [Contrat et limites](DEVISES-PWA-BETA7.md).

**PWA beta.6 / Android beta.31 :** le nouveau tri des dépenses est local à l’affichage, sans champ ni modification du JSON ; voir [TRI-DEPENSES-BETA31.md](TRI-DEPENSES-BETA31.md).

**PWA beta.5 / Android beta.30 :** `expenses[].odometer` est un champ facultatif déjà utilisé sur Android ; la PWA l’édite désormais sans changer le compteur du véhicule. Structures inconnues ou valeurs trop précises : conserver sans modifier. [Détails](KILOMETRAGE-DEPENSES-BETA30.md).

**Beta.29 / PWA beta.4 :** extension facultative `vigieExpenseReceipt` version 1 pour une photo par dépense ; les structures futures sont conservées mais non éditées. Voir [JUSTIFICATIFS-BETA29.md](JUSTIFICATIFS-BETA29.md). JSON v3, Room 15 et IndexedDB 4 restent inchangés.

**Actualisation PWA beta.2 :** le contrat JSON v3 reste identique en enveloppe ; de nouveaux champs facultatifs d’entretien et de plein sont documentés dans [CARNET-PWA-BETA2.md](CARNET-PWA-BETA2.md). Leurs échanges avec les anciennes PWA ont été vérifiés sur jeux fictifs ; pour le portage beta.27 voir [CARNET-ANDROID-BETA27.md](CARNET-ANDROID-BETA27.md). Les résultats Room/beta.20 ci-dessous sont historiques. IndexedDB de la candidate passe à 4, avec sauvegarde externe préalable.

**Beta.20 / PWA 1.5.2-beta.1 candidate :** les nombres très précis des extensions restent numériques et sont réexportés sans arrondi dans les scénarios testés. Un nombre fonctionnel trop précis ou trop grand est refusé avant remplacement ; les données déjà arrondies ne peuvent pas être reconstituées. Le thème et les propriétés supplémentaires des points CQ édités sont préservés. Base PWA IndexedDB 2→3 ; retour direct à 1.5.1 sur la même base bloqué. La PWA 1.5.1 demeure la référence familiale jusqu’aux essais réels ; aucun iPhone n’a été testé. Room 15 et JSON v3 inchangés côté Android. Voir [PRECISION-SAUVEGARDES.md](PRECISION-SAUVEGARDES.md).

## Contrat et historique du stockage

Historiquement, beta.19 garde le format d’échange JSON v3 et utilise Room 15 : les onze collections sont reconstruites depuis leurs sources typées, valeurs et extensions ; les anciennes copies JSON complètes des collections sont retirées après contrôle. Les propriétés répétées dans ces collections et certains nombres trop longs pour le lecteur strict sont refusés. Le format JSON v1/v2 est distinct du schéma Room v1/v2. Voir `MIGRATION-V11-V12.md`, `MIGRATION-V12-V13.md`, `MIGRATION-V13-V14.md` et `PLAN-MIGRATION-TYPEE.md`.


Les PWA 1.4.0, 1.5.0 et 1.5.1 exportent un JSON UTF-8 non chiffré sous cette forme :

```json
{
  "app": "VigieAuto",
  "formatVersion": 3,
  "exportedAt": "2026-10-31T12:00:00.000Z",
  "data": {
    "vehicles": [], "services": [], "fills": [], "trips": [],
    "expenses": [], "reminders": [], "symptoms": [], "templates": [],
    "checks": [], "documents": [], "settings": []
  }
}
```

Le schéma ci-dessus décrit l’historique v3 ; v4 ajoute `currencyAssignments` pour les dépenses et v5 étend les affectations aux pleins et entretiens. Chaque entrée a un `id` unique dans sa collection ; les huit collections liées à un véhicule possèdent un `vehicleId` présent dans `vehicles`. Photos et documents sont des `data:` URL base64, incluses dans la sauvegarde.

Android accepte :

- `CQ Auto` ou `VigieAuto` **format 1** sans `trips` ; un tableau `trips` non vide en format 1 est refusé pour éviter de le perdre (la PWA le viderait).
- `VigieAuto` **format 2** avec trajets manuels ; **format 3** avec trajets manuels ou GPS ; **format 4** avec devises de dépenses ; **format 5** avec devises de pleins et interventions, à partir d’Android beta.36.
- Android beta.38 exporte en **v3** sans affectation, **v4** pour les seules dépenses, **v5** dès qu’un plein ou entretien est affecté. PWA beta.9 lit et écrit ces formats ; les anciennes versions ne lisent pas nécessairement v4/v5.

Les champs supplémentaires d’un enregistrement sont conservés par Android, y compris les objets inconnus et les pièces jointes, sous réserve des limites de validation. Exception pour les trajets GPS : liste de champs autorisés conforme à la PWA 1.4.0 ; un champ de coordonnées ajouté est refusé. Les champs racine ou collections inconnus sont refusés plutôt que supprimés. Les espaces et l’ordre du JSON original ne sont pas garantis ; les métadonnées `app`, `formatVersion`, `exportedAt` sont réémises à l’export.

**Limite avérée de la PWA 1.5.1 :** JavaScript lit les nombres JSON avec une précision finie. Dans un essai fictif réel sous Chromium, le champ numérique inconnu `12345678901234567890.1234567890123456789` a été réexporté `12345678901234567000` ; `2.37` est resté `2.37` dans cet essai. L’import/export Room Android a conservé la décimale de ce jeu sans conversion `Double`, mais on ne peut pas promettre un aller-retour PWA exact pour tous les nombres ou opérations. Garder les JSON originaux et éviter de remplacer une sauvegarde par un retour PWA sans vérification. Cette observation est historique et reste vraie pour 1.5.1. Le script actuel teste maintenant le contrat prudent de la candidate, avec la fixture exacte générée depuis Room ; voir `PRECISION-SAUVEGARDES.md`.

Un trajet GPS en cours est conservé mais marqué `gpsInterrupted: true` pendant l’import. Ni Android 0.4.0-beta.20 ni l’import ne démarre automatiquement le suivi. Le trajet GPS interrompu et le chronomètre manuel importé peuvent être terminés en saisissant la distance et en vérifiant la durée. La méthode GPS et ses champs autorisés restent préservés ; Android ne reprend pas le capteur.

Les interventions, pleins/recharges, trajets et rappels ajoutés ou modifiés sur Android utilisent les mêmes collections et champs que la PWA. Une édition part du JSON existant pour conserver les propriétés supplémentaires ; l’identifiant du véhicule ne change pas. L’intervention et son rappel facultatif sont écrits avec la mise à jour éventuelle du compteur dans une même transaction. Le JSON exporté ne contient pas les index d’affichage internes. En beta.18, cinq projections historiques sont maintenues en transaction et le pont reconstruit les onze collections depuis leurs sources complètes typées ; voir `MIGRATION-V11-V12.md`, `MIGRATION-V12-V13.md` et `MIGRATION-V13-V14.md`. La dépense dispose depuis beta.28 d’un premier formulaire Android ; le symptôme reste éditable seulement en PWA. Aucun lien plein/dépense ni anti-doublon n’est réalisé : voir [DEPENSES-BETA28.md](DEPENSES-BETA28.md). La PWA ajoute, télécharge ou supprime un document, sans éditer un document existant.

## Suppression et annulation du carnet

En beta.19, la suppression confirmée est immédiate. Tant qu’une entrée est supprimée, les exports contiennent uniquement les données actives, pas l’image locale d’Undo. Une fois restaurée, elle reparaît dans les exports suivants. Une sauvegarde déjà créée n’est jamais réécrite. Un import réussi remplace les données et invalide l’Undo ; un import échoué le conserve. Une seconde suppression réussie remplace la précédente image. Voir `UNDO-CARNET.md`.

## Fiche véhicule Android beta.7

L’éditeur recharge l’objet complet et ne modifie que les champs choisis : marque, modèle, année, finition, immatriculation, énergie/détail, VIN et notes ; le compteur est séparé. La photo, les champs supplémentaires et toutes les collections liées restent conservés. Un champ éditable excessivement long empêche l’ouverture sans troncature ; un changement concurrent refuse l’enregistrement. Une énergie ou valeur atypique non modifiée reste intacte **côté Android**. L’ordre et les espaces du fichier JSON ne sont pas garantis.

La PWA 1.5.1 a son propre formulaire : en modifiant une fiche, elle peut normaliser des champs optionnels ou une énergie inconnue, même si Android les préserve. Le test d’édition PWA ci-dessous couvre une énergie libre standard « autre/Bioéthanol », pas tous les cas atypiques. Faire des sauvegardes distinctes et vérifier les données après chaque échange.

## Suggestions et énergies

Les marques/modèles finaux demeurent des chaînes libres. Le réglage supplémentaire, dans `data.settings`, est par exemple :

```json
{"id":"vehicleSuggestions","version":1,"brands":["Fabrique Libre"],"models":[{"brand":"Fabrique Libre","model":"Modèle X"}],"lastBrand":"Fabrique Libre","lastModel":"Modèle X"}
```

Les propriétés inconnues de cet objet et de chaque modèle sont préservées ; une structure ou une version incompatible est refusée avant remplacement, au lieu d’être écrasée. Le tableau est mémorisé après validation ; Android reconstruit sa table Room locale à partir du réglage. Le référentiel français v1 est un fichier identique embarqué séparément dans les deux applications ; il ne limite pas les saisies.

Les codes d’énergie historiques restent inchangés. Une hybride rechargeable est stockée avec `fuel: "hybride"` et `fuelDetail: "Hybride rechargeable"` ; une énergie libre avec `fuel: "autre"` et `fuelDetail` contenant son texte. L’ancienne PWA 1.4.0 peut importer/réexporter ces données et conserve le détail à la modification, mais **ne l’affiche pas**. Si une ancienne PWA change le code sans connaître ce champ, la nouvelle PWA donne priorité au code actuel pour éviter d’afficher un ancien détail contradictoire. Utiliser de préférence les deux versions à jour et vérifier le véhicule après échange.

## Limites des modifications effectuées dans la PWA 1.5.1

Les tests réels de la PWA sous Chromium confirment deux limites : les nombres JSON très grands ou précis peuvent être arrondis, et changer de thème peut supprimer les propriétés inconnues du réglage `theme`. L’édition PWA des points CQ peut également reconstruire leurs objets et perdre leurs extensions. Ces limites concernent toujours 1.5.1 ; la candidate traite les scénarios testés sans prétendre réparer un arrondi antérieur. Conserver les sauvegardes originales. Les objets `activeVehicle` et `vehicleSuggestions` fusionnent, eux, leurs propriétés existantes dans les parcours vérifiés. L’ancien pont CQ ne modifiait pas les points possédant des extensions ; le nouveau pont de précision vérifie leur édition, leur déplacement et leur suppression dans la candidate.

## Sécurité et limites

- Sélecteur système : pas d’accès large au stockage ni de permission Internet dans l’application. Le fournisseur choisi peut être en ligne ; cela dépend du choix de l’utilisateur.
- Copie temporaire privée et non chiffrée sur l’appareil, analysée sans modifier la base ; confirmation explicite ; seconde analyse dans une transaction Room. Échec = retour à la base antérieure. Nettoyage de la copie temporaire demandé hors du thread principal après annulation, vérification ou import ; les copies orphelines sont retentées au prochain démarrage si le stockage le permet, mais un échec de suppression peut être silencieux. Un registre injecté protège les imports actifs. Une lecture système bloquée ne s’interrompt pas toujours immédiatement.
- Depuis beta.6, **Vérifier un JSON** affiche le format et les quantités des 11 catégories sans confirmation ni écriture de la base. Ce contrôle structurel ne prouve ni complétude, ni fraîcheur, ni authenticité, ni ouverture des pièces jointes, ni succès d’une restauration Android ou PWA. Certaines limites en octets et écritures sont contrôlées seulement au moment de la restauration réelle.
- Taille maximale du fichier : **256 Mio**. Un seul élément est également limité à environ **16 Mio de caractères JSON** et 32 Mio en UTF-8. Maximum 100 000 éléments. Limites destinées à éviter l’épuisement des ressources ; le fichier source reste intact en cas de refus.
- Découpage en blocs de 128 Kio pour éviter les lignes SQLite trop volumineuses ; SHA-256 vérifié au réexport pour détecter une corruption accidentelle. Une collection locale inconnue interrompt aussi l’export plutôt que d’être ignorée. Ce contrôle n’est ni un chiffrement ni une signature d’authenticité.
- Les deux applications ont leurs propres bases. L’import remplace le destinataire après confirmation ; **aucune fusion, aucun serveur et aucune synchronisation**. Sauvegarder les deux côtés avant un aller-retour.
- Export interrompu : le sélecteur peut laisser un fichier partiel à l’emplacement choisi. L’application affiche un échec ; ne pas utiliser ce fichier, le supprimer et réessayer.

## Test du vrai pont, données fictives

Dans la source PWA historique, lancer `npm ci`, puis `npm install --no-save --package-lock=false playwright@1.55.1` avant `npx playwright install chromium` : Playwright 1.55.0 fixé par le fichier historique est concerné par [GHSA-7mvr-c777-76hp](https://github.com/advisories/GHSA-7mvr-c777-76hp) lors du téléchargement des navigateurs. Cette correction locale est à répéter après chaque `npm ci` ; elle ne modifie pas le code PWA exécuté par les utilisateurs et la candidate PWA fixe désormais 1.55.1 dans son verrou de test. Ensuite, depuis le dossier Android (exemples Bash) : remplacez `../cq-auto` par le chemin réel du dossier Web extrait si nécessaire. Sous Windows, utiliser `gradlew.bat` et un chemin absolu adapté pour `-PbridgeReturn`.

```bash
# Export fictif réellement créé par la PWA, avec suggestions et énergie libre
node scripts/test-pont-web.cjs generate-personal ../cq-auto app/build/bridge/web-personal.json
./gradlew :app:testDebugUnitTest --tests com.vigieauto.app.PersonalBridgeTest \
  -PbridgePersonal="$(pwd)/app/build/bridge/web-personal.json"
node scripts/test-pont-web.cjs accept ../cq-auto app/build/bridge/android-personal.json app/build/bridge/web-personal-retour.json

# CQ : modèle et contrôle créés dans la vraie PWA, puis modèle supprimé
./gradlew :app:testDebugUnitTest --tests com.vigieauto.app.CqBridgeTest.exportRoomFixtureForPwa
node scripts/test-cq-reglages-pont.cjs ../cq-auto app/build/bridge/android-cq.json app/build/bridge/pwa-cq.json app/build/bridge/pwa-cq-deleted.json
./gradlew :app:testDebugUnitTest --tests com.vigieauto.app.CqBridgeTest \
  -PbridgeCqReturn="$(pwd)/app/build/bridge/pwa-cq.json" \
  -PbridgeCqDeleted="$(pwd)/app/build/bridge/pwa-cq-deleted.json"

# Document de 5 Mio : Android → téléchargement et ajout PWA → Android
./gradlew :app:testDebugUnitTest --tests com.vigieauto.app.RoomBackupTest
node scripts/test-documents-pont.cjs ../cq-auto app/build/bridge/android-big.json app/build/bridge/web-documents.json
./gradlew :app:testDebugUnitTest --tests com.vigieauto.app.DocumentsBridgeReturnTest \
  -PbridgeDocumentsReturn="$(pwd)/app/build/bridge/web-documents.json"

# Parcours des six rubriques : Android → vraies éditions PWA → retour Android
./gradlew :app:testDebugUnitTest --tests com.vigieauto.app.JournalRepositoryTest
node scripts/test-journal-pont.cjs ../cq-auto app/build/bridge/android-journal.json app/build/bridge/web-journal-edited.json
./gradlew :app:testDebugUnitTest --tests com.vigieauto.app.JournalBridgeReturnTest \
  -PbridgeJournalReturn="$(pwd)/app/build/bridge/web-journal-edited.json"

# Fiche Android → import et modification réelle de la PWA → retour Android
./gradlew :app:testDebugUnitTest --tests com.vigieauto.app.VehicleEditTest \
  -PbridgeVehicleEditOut="$(pwd)/app/build/bridge/android-vehicle-edit.json"
node scripts/test-vehicle-edit-pont.cjs ../cq-auto app/build/bridge/android-vehicle-edit.json app/build/bridge/web-vehicle-edit.json
./gradlew :app:testDebugUnitTest --tests com.vigieauto.app.BridgeReturnTest.webReturnCanBeImportedAgainOnAndroid \
  -PbridgeReturn="$(pwd)/app/build/bridge/web-vehicle-edit.json"

# Autre parcours : fixture historique PWA → Room → Web → Room
./gradlew :app:testDebugUnitTest --tests com.vigieauto.app.RoomBackupTest
node scripts/test-pont-web.cjs accept ../cq-auto app/build/bridge/android.json app/build/bridge/web.json
./gradlew :app:testDebugUnitTest --tests com.vigieauto.app.BridgeReturnTest -PbridgeReturn="$(pwd)/app/build/bridge/web.json"
```

Les fixtures `pwa-v2.json` et `pwa-v3.json` fournies proviennent de véritables exports fictifs des PWA 1.3.2 et 1.4.0 ; le format 1 est testé avec une fixture synthétique. Si le ZIP historique 1.4.0 est disponible, `scripts/test-ancienne-pwa.cjs` teste aussi un aller-retour et des modifications avec cette version extraite (Playwright doit être accessible depuis son dossier). Ce test ne remplace pas un essai sur Android ou Safari réels. Le calcul préparatoire de consommation est comparé à la PWA avec `node scripts/test-consommation-pont.cjs ../cq-auto`, mais aucun écran de statistiques Android n’est encore branché dessus.
