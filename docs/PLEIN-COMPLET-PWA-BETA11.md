# « Plein complet » plus visible — PWA 1.5.2-beta.11

## Ce qui change

Dans le formulaire PWA des pleins, la case **Plein complet** est agrandie (24 × 24 px), le texte passe en gras à 16 px et toute la ligne forme une zone cliquable d’au moins 56 px de haut. Le contraste utilise les couleurs du thème. Le même confort s’applique à **Batterie rechargée à 100 %** pour un véhicule électrique. Un texte rappelle de décocher si le réservoir n’a pas été rempli entièrement ou si la batterie n’a pas atteint 100 %.

**Le fonctionnement n’a pas changé : un nouveau plein reste coché par défaut.** Pour un ravitaillement partiel, il faut décocher cette case avant d’enregistrer. La quantité ne permet pas de décider automatiquement si le plein est complet.

Les pleins déjà enregistrés ne sont pas modifiés par cette version. Pour corriger une entrée si nécessaire, ouvrir **Pleins**, toucher le crayon de l’entrée, décocher **Plein complet**, puis **Enregistrer**. Un plein partiel est pris en compte entre deux pleins complets ; sans second plein complet cohérent, l’intervalle reste ouvert et la consommation associée n’est pas encore calculée.

Aucune modification des calculs, de la structure IndexedDB 6, des formats de sauvegarde JSON v1–v5 ni de la sauvegarde des formulaires. Le code Android reste en **0.4.0-beta.42** : ce changement concerne la PWA uniquement. La PWA familiale **1.5.1** reste conservée séparément.

## Essayer sans perdre ses données

1. Dans l’application contenant vos données, exporter une sauvegarde JSON et vérifier qu’une copie est conservée hors de l’appareil. Ne publiez pas ce fichier personnel.
2. Cette archive contient les **sources PWA** : elle ne modifie pas toute seule une application déjà installée et ce n’est pas un APK Android. Pour un premier essai, utiliser une origine HTTPS ou un appareil de test séparé comme indiqué dans [INSTALLER.md](../INSTALLER.md).
3. Pour une mise à jour de l’installation existante seulement après validation et sauvegarde, les nouveaux fichiers doivent être publiés à la même adresse. Fermer les anciennes fenêtres, ouvrir l’application en ligne, puis vérifier **Réglages → version 1.5.2-beta.11**. Ne pas effacer les données du navigateur ni désinstaller l’application pour forcer la mise à jour.
4. La mise à jour n’effectue pas d’import. Un import JSON confirmé **remplace** les données de sa destination : ce n’est pas une fusion.

## Vérifications et limites

- **64 tests Node** réussis pour les calculs et autres fonctions ; **21 tests** de l’archiveur réussis.
- Sous **Chromium et WebKit Linux**, tests du formulaire réel : les quatre thèmes, largeur de 320 et 390 px, contraste calculé, clic sur la ligne, clavier et focus ; ajout et modification de plein complet ou partiel avec données fictives, conservation après rechargement, calcul, et formulaire de recharge électrique. Les autres cases ne sont pas agrandies.
- Les 13 rubriques et thèmes ont été vérifiés sous Chromium et WebKit Linux. La mise à jour réelle de la PWA beta.10 vers beta.11 conserve une sauvegarde fictive v5, les états complets/partiels et l’export hors ligne sous ces deux moteurs ; le cache beta.10 est remplacé.
- Sous Chromium : parcours généraux, trajets et GPS simulé ; migration fictive depuis la PWA stable 1.5.1 avec conservation des données et export hors ligne.
- WebKit sous Linux **ne valide pas Safari sur iPhone**. Aucun téléphone ou navigateur mobile réel n’a été testé dans ce lot et aucune performance n’a été mesurée. La visibilité et le fonctionnement de la mise à jour restent à vérifier sur appareil, après sauvegarde.
- Pour rejouer le test d’actualisation, fournir séparément le ZIP beta.10 via `VIGIE_PREVIOUS_PWA` : il est retiré du workspace après validation pour respecter la conservation de trois ZIP. Les tests historiques restent présents ; certains demandent aussi leurs anciennes archives de référence.
