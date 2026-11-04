# Ressources des tests de navigation — Android beta.22 et beta.23

**Beta.23 — diagnostic local :** une première tentative de tests Compose n’a pas démarré correctement parce que le dossier personnel temporaire de Robolectric n’existait pas ; ce dossier de test a été créé avant relance. Un parcours Undo a ensuite dépassé son délai alors que son opération restait en attente : dans ce test simulé, l’attente d’une valeur du ViewModel n’avançait pas la file de messages du Looper Robolectric. Les deux attentes concernées font maintenant avancer cette file et restent bornées ; le scénario Undo relancé isolément a réussi. Ces incidents et leur correction ne prouvent pas le comportement d’un vrai téléphone.

**Objet beta.22 :** rendre la fin des tests Robolectric plus propre et rendre visibles les avertissements reconnus. Cela concerne le processus **simulé** des tests sur ordinateur, pas le cycle de vie de l’application installée. `forkEvery=1` reste inchangé.

## Constat et correction ciblée

Sur Linux avec JDK 17, le test `MainNavigationBackTest` de beta.21 a été relancé avant modification : **7 réussis, aucun échec, deux avertissements CloseGuard**. Les piles signalent une connexion SQLite ouverte par Room ; la base et le scope Hilt, uniques pour l’application simulée, n’étaient pas fermés en fin de scénario. Cela suggère une cause liée au nettoyage du test, mais ne prouve ni une fuite sur téléphone ni l’origine de tous les avertissements historiques.

En beta.22, après chaque scénario de cette classe :

1. le test conserve la référence au job du ViewModel, puis ferme l’Activity, même si le scénario échoue ;
2. il attend effectivement la fin du `viewModelScope`, puis la fin des enfants du scope applicatif, en laissant avancer le Looper de test ;
3. il annule et attend le scope applicatif, **puis ferme la base Room** et contrôle son état. Les attentes sont bornées : un blocage produit un échec, il n’est pas caché.

Un point d’entrée Hilt sous `app/src/debug/`, utilisé par ces tests, donne accès aux ressources réelles de l’application simulée ; il est présent dans les builds debug, mais ce n’est pas un composant Android exporté et ce fichier n’appartient pas aux sources `main` ou `release`. En production, la base reste liée au processus ; **une recréation normale de l’Activity ne ferme pas Room**. Le code métier, la base Room 15 et le format JSON v3 ne changent pas.

Trois scénarios ont été ajoutés : ordre de fin du ViewModel/scope/base, conservation de la même base ouverte lors d’une recréation d’Activity, et attente d’un nettoyage applicatif encore en cours. Après modification, sur le même environnement Linux, un premier lancement a réussi **10 tests de navigation et 3 tests SQLite**, sans avertissement CloseGuard reconnu ; un second lancement forcé a réussi **10 tests de navigation**, sans avertissement reconnu. Le diagnostic a également été vérifié sur le rapport initial, où il retrouve les deux messages. Deux passages ne prouvent pas qu’un phénomène intermittent ne reviendra jamais. Une suite JVM complète beta.22 a ensuite réussi **517 tests sur 75 classes, aucun ignoré ni échec**, avec huit fichiers de pont fictifs issus de validations PWA antérieures réutilisés ; aucun marqueur reconnu dans ses rapports. Aucun nouveau lancement PWA n’est revendiqué pour ce lot.

## Lire les résultats

Le vérificateur `scripts/verifier-rapports-ci.py jvm …` signale dans la sortie CI le nombre de messages CloseGuard correspondant au marqueur observé, par fichier de rapport JUnit, sans recopier les journaux. Ces messages sont **non bloquants et à examiner** ; les véritables échecs, tests essentiels absents et tests ignorés inattendus restent bloquants. La recherche n’est pas exhaustive : l’absence du marqueur ne démontre pas l’absence d’une autre fuite ou d’un autre problème. Les rapports peuvent contenir des traces techniques : contrôler leur contenu avant tout partage.

Sur Windows, depuis un projet extrait proprement :

```powershell
.\gradlew.bat :app:testDebugUnitTest --rerun --tests "com.vigieauto.app.MainNavigationBackTest" --tests "com.vigieauto.app.RobolectricSqliteConfigurationTest"
```

Résultat attendu : **13 tests réussis, aucun ignoré**, puis `BUILD SUCCESSFUL`. La durée dépend de l’ordinateur et des téléchargements. Sans lancement sur votre Windows, aucune disparition d’un échec intermittent de Windows n’est garantie. Les tests sur téléphone/émulateur, l’analyse mémoire et les mesures de performance réelles restent nécessaires ; voir [TESTS-WINDOWS.md](TESTS-WINDOWS.md), [CI-VERIFICATIONS.md](CI-VERIFICATIONS.md) et [PERFORMANCES.md](PERFORMANCES.md). N’utilisez que des données fictives pour les diagnostics et conservez une sauvegarde personnelle vérifiée.
