# Repères de couleur des véhicules — PWA 1.5.2-beta.15

## Ce qui change

Dans **Mes véhicules**, chaque véhicule possède un bouton **Repère de couleur**. Il ouvre un choix indépendant de la fiche du véhicule : aucun repère, vert, turquoise, bleu, orange, violet ou rose. Le repère est facultatif, modifiable ou retirable. Son nom accompagne la pastille dans le garage et sur la carte du véhicule actif à l’accueil : on ne dépend donc pas uniquement de la perception de la couleur. Les choix restent lisibles dans les quatre thèmes Sauge/Cyan, clair/sombre.

Ce repère sert à **distinguer les véhicules dans l’application**. Il ne décrit pas la couleur de la carrosserie et ne modifie ni la photo, ni la peinture, ni les autres champs du véhicule. Il ne s’agit pas de la vue combinée multivéhicule, qui reste à étudier.

## Utilisation

1. Ouvrir **Mes véhicules** depuis le garage ou le menu.
2. Sur le véhicule voulu, toucher **Repère de couleur**.
3. Choisir une couleur et **Enregistrer**. Pour l’enlever, choisir **Aucun repère**. **Annuler** ne change rien.

La sélection fonctionne hors ligne après installation et mise en cache. Les anciennes fiches sont inchangées tant qu’un choix n’est pas enregistré.

## Données et sécurité

- La PWA enregistre seulement le véhicule visé, par une transaction vérifiant l’instantané lu à l’ouverture. La fiche générale du véhicule profite de la même protection ; les formulaires de symptômes et de contrôles, qui peuvent mettre à jour le compteur, vérifient aussi le véhicule avant écriture : si le véhicule a changé ou a été supprimé entre-temps, le formulaire refuse l’enregistrement plutôt que d’écraser le changement ou de recréer la fiche. L’utilisateur est invité à rouvrir le formulaire. Cela ne protège pas d’une ancienne version ouverte dans un autre onglet : fermer les anciens onglets avant la mise à jour.
- Dans une sauvegarde JSON, le repère est une extension facultative du véhicule : `vigieVehicleMarker: { version: 1, color: "bleu" }`, par exemple. `color: null` signifie aucun repère si l’objet existe. Les autres propriétés de cette extension sont conservées ; une version, une couleur ou un format inconnu est conservé et rendu non modifiable plutôt que transformé en silence. Ce champ n’est créé que lors d’une action explicite.
- Il n’y a pas de nouvelle version de base IndexedDB pour ce lot : version 6 conservée. Les formats de sauvegarde v3/v4/v5 restent ceux déjà utilisés, notamment v5 si une opération de carburant ou d’entretien a une devise affectée.
- L’import JSON **remplace toutes les données locales** après confirmation ; il ne fusionne pas et ne synchronise pas deux appareils. Faire d’abord une sauvegarde externe sur chaque appareil. Les transferts restent manuels, sans serveur ni compte.

## Compatibilité Android : vérification ciblée

Android **beta.44 n’a pas changé et n’affiche pas encore le repère**. Un test automatisé avec une sauvegarde fictive v5 a exercé le passage PWA → import Android/Room → modification des notes du véhicule → suppression et annulation → export Android → réimport PWA. Le repère bleu, une extension numérique de grande précision et les données liées ont été conservés ; la PWA a ensuite pu changer le repère en rose. Chromium et WebKit Linux ont exécuté les étapes PWA ; Android a été exercé avec Room et Robolectric, pas sur un appareil. Ce test ciblé ne garantit pas tous les échanges possibles avec toutes les anciennes versions.

## Vérifications de cette version

- Tests unitaires Node de la PWA, y compris les formats inconnus et les extensions du repère.
- Sous Chromium et WebKit Linux : deux véhicules, création, changement, suppression et annulation du repère ; quatre thèmes ; format v5 ; deux fenêtres concurrentes, y compris symptôme ou contrôle en cours de saisie et changement du repère ; suppression pendant une édition, sans recréer le véhicule ni ajouter d’observation orpheline ; fonctionnement et modification hors ligne.
- Mise à jour réelle beta.14 → beta.15 sur la même origine : données, recherche, suggestions et précision conservées, puis ajout d’un repère hors ligne.
- Aller-retour fictif avec Room beta.44, décrit ci-dessus. Le test source Android est conservé dans `tests/android/MarkerBridge15Test.kt`, sans modifier les sources Android livrées.
- Dans les parcours historiques, l’échange avec le ZIP beta.1 et le refus par beta.6 n’ont pas été rejoués, car ces deux anciennes archives ne sont plus conservées.
- WebKit Linux n’est **pas** Safari sur iPhone. Lecteur d’écran réel, téléphone, Windows et performances ne sont pas validés par ces essais. Le socle reste à valider indépendamment.

## Rejouer l’aller-retour fictif

Ces commandes sont destinées à une personne qui développe et aux fichiers de test uniquement ; elles ne sont pas nécessaires pour utiliser l’application. Prévoir Node/npm, Playwright et Android Studio/JDK 17. Depuis la racine de cette PWA :

```sh
npm ci
npx playwright install chromium webkit
VIGIE_MARKER_BRIDGE_OUT=/chemin/accessible/aller-fictif.json node tests/reperes-vehicules-beta15.cjs
```

Dans une **copie de travail séparée** des sources Android beta.44, copier `tests/android/MarkerBridge15Test.kt` de cette PWA dans `app/src/test/java/com/vigieauto/app/MarkerBridge15Test.kt`. Depuis la racine de cette copie Android :

```sh
VIGIE_MARKER_INPUT=/chemin/accessible/aller-fictif.json \
VIGIE_MARKER_OUTPUT=/chemin/accessible/retour-fictif.json \
bash ./gradlew :app:testDebugUnitTest --tests 'com.vigieauto.app.MarkerBridge15Test'
```

Puis, depuis la racine de la PWA :

```sh
node tests/pont-reperes-retour.cjs /chemin/accessible/retour-fictif.json
VIGIE_BROWSER=webkit node tests/pont-reperes-retour.cjs /chemin/accessible/retour-fictif.json
```

Adapter les chemins et la syntaxe des variables d’environnement au système ; sous Windows PowerShell, utiliser `$env:VIGIE_MARKER_INPUT = '…'`, `$env:VIGIE_MARKER_OUTPUT = '…'` et `./gradlew.bat`. Ne pas utiliser de sauvegarde personnelle pour ce test automatisé.
