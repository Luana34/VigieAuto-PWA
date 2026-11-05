# Dépenses — Android 0.4.0-beta.28 et PWA 1.5.2-beta.3

## Périmètre de ce premier lot

Sur Android, l’accueil mène à **Voir les dépenses** et le bouton central `+` permet aussi d’ajouter une dépense. Les cinq onglets habituels ne changent pas. La liste ne montre que le véhicule actif et propose un tri par date, catégorie ou montant. Elle affiche le total de **cette liste uniquement**, avec addition décimale ; une valeur inaccessible ou excessivement longue rend le total indisponible plutôt que d’être ignorée. Le chargement et une erreur de lecture sont distincts d’une liste vide.

Une dépense saisie demande un **intitulé**, une date, une catégorie et un montant en euros ; les notes et le kilométrage sont facultatifs. Le kilométrage décrit cette dépense et **ne modifie pas** le compteur du véhicule. Le champ numérique optionnel est conservé dans l’extension JSON `odometer` de la dépense ; les anciennes dépenses sans ce champ restent valides. Un `odometer` importé d’un autre type est conservé mais non modifiable ici. Les très longs textes ne sont pas tronqués dans le stockage : le formulaire refuse leur ouverture si nécessaire.

La suppression est confirmée, immédiate et annulable par le même mécanisme local que les autres entrées : une seule image complète d’Undo, transactionnelle, au moins dix secondes au premier plan, reprise jusqu’à 24 heures. Elle n’est pas exportée ; un import confirmé la remplace. La suppression d’une dépense ne supprime ni plein ni entretien. Une ancienne beta Android ne sait pas restaurer l’image d’une dépense supprimée avec beta.28 : terminer ou annuler la suppression avant un éventuel retour à une version antérieure.

## Compatibilité et précision

Les onze codes de catégories sont communs aux deux candidates : entretien, carburant, assurance, taxes, péage, stationnement, lavage, amende, contrôle technique, accessoires/pièces et autre. Les catégories historiques inconnues restent intactes sur Android si elles ne sont pas modifiées. La PWA beta.3 les présente comme personnalisées ; celles de plus de 500 caractères restent conservées mais non modifiables dans son formulaire. Les catégories absentes ou nulles restent distinctes lors des éditions testées.

Sur Android, les nouveaux montants ou les montants changés sont non négatifs, au maximum à deux décimales et contrôlés pour un échange numérique sans arrondi sur le chemin PWA testé ; le zéro négatif est refusé. Un ancien montant à plus de deux décimales est conservé si on modifie un autre champ. Les jetons numériques et les propriétés inconnues de l’enregistrement complet sont conservés sur les scénarios testés ; une édition devenue périmée est refusée. Les copies de sauvegarde restent nécessaires : aucune vérification ne garantit tous les échanges ou ne répare des données déjà arrondies.

La PWA beta.3 reconnaît les nouvelles catégories et conserve les propriétés supplémentaires dans les parcours vérifiés. Elle ne propose pas encore d’édition du kilométrage de dépense. Les anciennes PWA peuvent afficher ces nouveaux codes comme « Autre » et modifier une catégorie inconnue lors de l’édition ; la PWA familiale 1.5.1 a aussi ses limites de précision. Le format racine JSON reste `app`, `formatVersion`, `exportedAt`, `data` et la collection reste `data.expenses`. Room demeure en version 15 et IndexedDB en version 4. Les deux bases sont indépendantes : **l’import confirmé remplace les données**, sans fusion.

## Important : pas encore de liaison ni d’anti-doublon

**Aucune dépense carburant n’est créée automatiquement lors d’un plein.** Un plein, un entretien et une dépense indépendante restent trois saisies distinctes. Les totaux PWA additionnent les trois catégories de saisie ; enregistrer manuellement deux fois le même coût peut donc le compter deux fois. Un avertissement est affiché, mais il ne détecte ni ne corrige les doublons. La création automatique d’une dépense liée et un mécanisme partagé empêchant le double comptage après édition, suppression, import et réimport sont **encore à concevoir et à tester dans les deux applications**. Ne pas les déclarer réalisés.

Les justificatifs photo, le choix de devise, la liaison à un plein ou à une intervention, les notifications et les statistiques Android globales restent à développer. Cette version utilise l’euro, sans conversion monétaire. Les justificatifs déjà conservés comme extensions ou documents ne sont pas supprimés par l’édition testée, mais aucun écran de justificatif de dépense n’est fourni ici.

## Vérifications et limites

Les tests concernent uniquement des données fictives. Le lot Room, interface et navigation a réussi **20 tests ciblés sur 20** après correction de trois erreurs dans les scénarios eux-mêmes. L’échange Room → vraie PWA → Room → PWA a été exécuté séparément sous Chromium et WebKit Linux : catégorie connue/future/absente, compteur futur, extensions numériques exactes et absence de création automatique entre plein et dépense sont vérifiés. La PWA a réussi **41 tests unitaires**, le nouveau scénario dépenses sous les deux moteurs, ainsi que les migrations 1.5.1 → beta.3 et beta.2 → beta.3 sur les deux moteurs. Ses scénarios carnet ont réussi, sauf l’échange avec le ZIP historique beta.1 absent ; l’interface générale, les trajets et le GPS simulé ont aussi été contrôlés sous Chromium. Les résultats complémentaires figurent dans l’historique et la checklist de performances.

Un test WebKit Linux n’est pas un test Safari sur iPhone ; Robolectric n’est ni un émulateur ni un téléphone. Aucune validation physique, mesure de performance, release Android signée ou publication GitHub Pages n’est déduite de ces essais.

Pour le pont réel sur ordinateur, depuis le dossier Android et après installation des outils Playwright dans la PWA : remplacez `../cq-auto` par le chemin réel du dossier PWA extrait, qui peut être dans un autre dossier parent.

```bash
# 1. Construire la fixture Room fictive (utiliser bash gradlew si nécessaire).
bash gradlew :app:testDebugUnitTest --rerun --tests 'com.vigieauto.app.ExpenseRepositoryTest.exportExpensesFixtureFromRoom'
# 2. Importer et modifier dans la vraie PWA candidate.
node scripts/test-depenses-pont.cjs edit ../cq-auto app/build/bridge/android-depenses.json app/build/bridge/web-depenses.json
# 3. Importer le retour en Room et l’éditer ; fournir un chemin absolu.
bash gradlew :app:testDebugUnitTest --rerun --tests 'com.vigieauto.app.ExpenseBridgeTest' -PbridgeExpensesReturn="$(pwd)/app/build/bridge/web-depenses.json"
# 4. Réimporter et vérifier en PWA.
node scripts/test-depenses-pont.cjs verify ../cq-auto app/build/bridge/android-depenses-retour.json
# Pour WebKit Linux, ajouter VIGIE_BROWSER=webkit avant les commandes node.
```

Sous Windows, employer `gradlew.bat` / `.\gradlew` et un chemin absolu Windows pour `-PbridgeExpensesReturn`. Les tests ordinaires incluent une fixture fictive stockée dans les ressources ; ces commandes supplémentaires lancent la véritable PWA locale pour vérifier le pont.

Conserver des sauvegardes JSON séparées, non chiffrées par VigieAuto, avant toute mise à jour ou import. Ne pas effacer les données ni désinstaller pour forcer une mise à jour.
