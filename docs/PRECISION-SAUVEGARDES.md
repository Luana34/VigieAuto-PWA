# Précision des sauvegardes — PWA candidate et Android

**PWA 1.5.2-beta.1 candidate · Android 0.4.0-beta.20 · 2 novembre 2026**

La PWA 1.5.1 reste la version familiale de référence. La candidate apporte une protection des nombres, mais **aucun iPhone réel n’a été testé**. Ne remplacez pas une installation familiale unique sans sauvegarde indépendante vérifiée et essai préalable. Android beta.20 ne change ni le format JSON v3, ni Room 15, ni les fonctions métier de beta.19 : il ajoute le test de pont et la documentation de ce lot.

## Ce qui change

1. L’import lit le texte UTF-8 et examine les jetons JSON originaux avant toute confirmation ou écriture. Pour les sauvegardes compatibles, les propriétés supplémentaires autorisées des enregistrements sont gardées, même dans des objets et tableaux imbriqués. Les nombres que JavaScript arrondirait restent **des nombres dans le JSON exporté**, jamais des chaînes ; le signe d’un zéro négatif est conservé.
2. Les champs numériques utilisés par les écrans et calculs restent des nombres JavaScript ordinaires. Si une valeur ne peut pas être réémise à la même valeur décimale, est non finie, a un zéro négatif ou dépasse `9007199254740991` en valeur absolue, l’import est **refusé avant remplacement**. Les formulaires appliquent aussi ce garde-fou à la saisie ; une échéance de rappel n’est pas écrite si sa somme exacte serait arrondie. La limite n’est pas un changement silencieux en texte.
3. Les doublons de propriétés JSON, l’UTF-8 invalide, les nouvelles collections ou champs racine inconnus, les trajets non vides dans une sauvegarde v1, les nombres de plus de 1 000 caractères et l’imbrication de plus de 256 niveaux sont refusés avant remplacement. Les formats v1, v2 et v3 compatibles restent acceptés. Ces limites peuvent refuser prudemment un fichier qui était accepté par 1.5.1.
4. Changer le thème fusionne le réglage courant transactionnellement, sans effacer ses extensions. Pour modifier une liste CQ existante, chaque point possède désormais son propre champ et des boutons pour le déplacer ou le supprimer : son identifiant et ses propriétés supplémentaires le suivent, même avec des identifiants vides ou répétés. Supprimer un point retire aussi ses propriétés après enregistrement. Un titre déjà vide ou contenant des retours chariot est conservé tant qu’il n’est pas modifié ; un point ajouté ou modifié doit avoir un titre non vide.
5. L’export utilise un instantané IndexedDB. Les nombres non finis, marqueurs numériques illisibles et objets internes non reconnus sont refusés explicitement plutôt que convertis silencieusement. Comme dans la sérialisation JSON standard, un champ d’objet `undefined` est omis et un élément `undefined` de tableau devient `null` ; ces valeurs ne sont pas présentes dans un fichier JSON valide importé. Les calculs habituels et la mesure GPS restent approximatifs : cette correction n’est pas un moteur de calcul décimal arbitraire.

Les trajets GPS ont une liste de champs autorisés : un champ supplémentaire non reconnu y est refusé, et un trajet GPS en cours est marqué interrompu à l’import pour éviter une reprise silencieuse du capteur.

La PWA 1.5.1 a déjà pu arrondir un nombre avant son stockage ou son export. **La candidate ne peut pas retrouver les chiffres déjà perdus** ; seul un fichier original antérieur à l’arrondi peut les conserver. Gardez chaque original et vérifiez les copies, même quand les tests réussissent. L’import remplace toujours les données après confirmation, sans fusion ni synchronisation ; le JSON n’est pas chiffré.

## Représentation locale et retour à une ancienne version

L’interface continue à employer des `Number` pour les champs fonctionnels. Dans les seules extensions inconnues, un nombre non représentable est enregistré localement sous forme d’un marqueur interne `Uint8Array` clonable par IndexedDB ; cette forme ne peut pas être produite par un objet ou tableau JSON ordinaire. À l’export, le jeton est contrôlé puis réécrit comme nombre JSON. Aucun marqueur, champ réservé ou chaîne de remplacement n’apparaît dans le fichier échangé.

La base PWA reste `cq-auto-local` et garde les 11 collections, mais sa version IndexedDB passe **de 2 à 3** pour empêcher une ancienne PWA de lire ces marqueurs sans les comprendre. Les données existantes sont reprises ; une PWA 1.5.1 ne peut plus ouvrir directement cette base mise à niveau sur la même origine. Fermer les autres onglets si une mise à niveau est bloquée. Pour revenir à 1.5.1, disposer d’une sauvegarde externe compatible faite **avant** la mise à jour et tester une installation sur un appareil distinct ou une origine distincte ; ne pas effacer l’unique base ou désinstaller pour forcer un retour. Une origine change si le protocole, le domaine ou le port change : deux chemins ou dépôts différents sur le même domaine, par exemple `famille.github.io/VigieAuto/` et `famille.github.io/test/`, peuvent partager la même base IndexedDB. Un sous-dossier seul n’isole donc pas la candidate. Le stockage dépend aussi du navigateur et de l’installation.

Pour les développeurs : si un champ d’extension devient utilisé par l’interface dans une version future, il faut actualiser la liste de `js/precise-json.js` et prévoir une migration/validation des marqueurs existants avant de l’interpréter. Un ancien code ne doit pas ouvrir directement la base v3. La sauvegarde reste au format commun v3 ; Android conserve ses limites propres (256 Mio/fichier, 100 000 entrées et limites par objet).

## Vérifications de ce lot

- Jeu entièrement fictif : Android Room → JSON → PWA sous **Chromium** et **WebKit Playwright sur Linux** → réouverture IndexedDB, cache hors ligne simulé, édition du véhicule, de six rubriques, d’un point CQ et du thème → export → réimport Room. Les extensions exactes des 11 collections, le type numérique, les fractions longues, les exposants et le zéro négatif sont comparés ; chaque retour a été contrôlé dans Room.
- Édition CQ : titres vides ou avec retour chariot, identifiants vides et répétés, déplacement, suppression et ajout de points, avec contrôle des extensions propres à chaque point.
- Refus avant mutation testés : valeur fonctionnelle non représentable, doublons, collection/racine inconnue, v1 avec trajets, nombre trop long et UTF-8 invalide. Le retour direct à IndexedDB v2 est refusé. Rappel et GPS : somme trop grande refusée sans écriture.
- Migration du ZIP PWA 1.5.1 vers la candidate sur la même origine et en sous-dossier, avec véhicule, document, thème et trajet, testée sous Chromium et WebKit ; ce ne sont **ni Safari iOS réel, ni un essai iPhone**.
- PWA : 30 tests unitaires réussis ; parcours d’interface, catalogue, GPS simulé et logo ; sept scénarios de consommation ; ponts fictifs véhicules, carnet, documents, CQ et Undo. Dépendance de test Playwright mise à jour de 1.55.0 à 1.55.1 ; `npm audit` ne rapporte pas de vulnérabilité au contrôle effectué. Elle n’est pas incluse dans l’application utilisée au quotidien.
- Android : deux tests ciblés `PrecisionBridgeTest` réussis par Gradle avec le retour Chromium, et retour WebKit vérifié séparément par Gradle/JUnit/Robolectric. APK debug et 57 scénarios instrumentés compilés ; lint 0 erreur/17 avertissements. Aucun scénario instrumenté exécuté sur téléphone/émulateur ; la suite Android complète beta.20, un test Windows beta.20 et les mesures physiques ne sont pas revendiqués. La suite beta.19 précédente comptait 512 tests réussis ; elle n’a pas été rerelancée entièrement pour ce lot sans modification métier Android.
- Une première tentative Gradle mêlant recompilation et test s’est arrêtée par disparition du daemon dans l’environnement limité ; la cause précise n’est pas établie. Les tests ciblés ont ensuite réussi en séparant les opérations et en limitant la mémoire. Cela ne prouve ni une amélioration des temps Windows ni l’absence d’autres défauts.

## Refaire le pont avec des données fictives

Dans le dossier PWA candidat : `npm ci`, puis `npx playwright install chromium`. Depuis le dossier Android, sous Windows :

```powershell
.\gradlew.bat :app:testDebugUnitTest --rerun --tests "com.vigieauto.app.PrecisionBridgeTest.exportFixtureFromRoom"
node scripts/test-pont-precision.cjs ..\cq-auto app\build\bridge\android-precision.json app\build\bridge\pwa-precision.json
.\gradlew.bat :app:testDebugUnitTest --rerun --tests "com.vigieauto.app.PrecisionBridgeTest" "-PbridgePrecisionReturn=$PWD\app\build\bridge\pwa-precision.json"
```

Adapter le chemin vers le dossier PWA extrait, différent du dossier Android. `--rerun` force la tâche de test : le fichier de retour peut avoir changé sans que son chemin change, et Gradle pourrait autrement la considérer à jour. Pour WebKit automatisé, installer le navigateur Playwright et définir `VIGIE_BROWSER=webkit` avant le script ; cela reste un test de moteur, pas un iPhone. Les fichiers sous `app/build/bridge` sont des exemples artificiels, jamais des sauvegardes réelles.
