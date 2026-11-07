# Aides Pleins et VIN — Android beta.43 et PWA beta.12

## Où trouver les aides

- Dans un formulaire de plein ou de recharge, un court rappel accompagne la case ou le commutateur. Le bouton **ⓘ** voisin ouvre une explication ciblée ; toucher ⓘ ne coche ni ne décoche le plein.
- En haut de l’écran **Pleins**, un bouton **ⓘ** ouvre un panneau inférieur expliquant la consommation, avec un exemple et les limites.
- Près du champ **VIN**, un bouton **ⓘ** explique où trouver ce numéro. Dans la PWA, le champ existe à la création et à la modification ; sur Android, il se trouve dans la modification du véhicule. Le champ reste facultatif : un format de 17 caractères n’est pas imposé (Android limite toutefois les champs courts à 500 caractères).

Les explications utilisent des titres ou mots importants en gras et des listes. Le contenu reste local et utilisable hors ligne après mise en cache de la PWA. **Compris**, le retour et, sur la PWA, Échap ferment l’aide sans enregistrer le formulaire. Les champs et la sélection en cours restent ceux de l’utilisateur.

## Plein complet ou partiel ?

La case ou le commutateur est **coché par défaut pour une nouvelle saisie**, comme auparavant. Un ravitaillement partiel doit être explicitement décoché, quelle que soit la quantité ajoutée. Une ancienne saisie peut être modifiée ; cette mise à jour ne la corrige pas automatiquement. Pour une recharge électrique, la sélection « complète » correspond à une batterie rechargée à 100 %.

Exemple : si un ravitaillement de **18,04 L** était partiel mais apparaît « complet », il faut ouvrir sa modification et décocher la case. Le volume ne suffit pas à déterminer si le réservoir était plein. Les résultats se recalculent ensuite selon les règles déjà présentes.

## Comment le calcul existant fonctionne

Un premier plein complet sert de repère : son propre volume n’est pas compté dans le cycle. Les volumes des ravitaillements suivants, partiels compris, et du plein complet de clôture sont rapportés à la distance entre les deux repères. Par exemple, 18 L puis 42 L sur 800 km donnent **7,5 L/100 km**. La fiabilité dépend de saisies complètes et de remplissages comparables ; les kilomètres et données doivent être cohérents. Les L et kWh restent distincts, et un changement d’unité interrompt un intervalle ; une charge électrique peut inclure des pertes.

Un cycle non fermé ne produit pas une nouvelle valeur : les valeurs d’anciens cycles valides peuvent cependant rester visibles. Le **coût énergie/km** utilise les dépenses des cycles calculables ; il peut être masqué quand les devises sont mélangées. Aucun taux ni conversion n’est appliqué. Les montants de pleins exploitables restent consultables et totalisés par devise ; cela ne lie pas automatiquement les pleins aux dépenses et une saisie en double peut être comptée deux fois.

## Portée et précautions

Ce lot ne modifie **ni les calculs, ni les données, ni les valeurs initiales, ni les schémas Room 17 / IndexedDB 6, ni les formats JSON v1 à v5**. Il n’ajoute aucune collecte, dépendance de production ou fonctionnalité de synchronisation. Faire une sauvegarde JSON vérifiée avant tout essai ou mise à jour ; un import est un remplacement complet, pas une fusion.

L’application Android reste une préversion et la PWA beta.12 une candidate : conservez la PWA familiale 1.5.1. Les contrôles automatisés Linux ne remplacent ni un essai sur téléphone Android ni Safari sur iPhone. Les objectifs de performance ne sont pas mesurés dans ce lot.

## Vérifications de cette évolution

- **Android, Linux :** 82 tests JVM ciblés réussis, aucun ignoré, dont six tests des aides (thermique, électrique, VIN, panneau, état restauré et retour simulé). Formulaires, navigation, consommation et thèmes ont aussi été vérifiés ; toute la suite JVM n’a pas été relancée pour ce lot et aucun ancien test n’a été retiré. APK debug et **69 scénarios instrumentés compilés, non exécutés** ; lint : **0 erreur, 24 avertissements et 5 indications**. Les 32 tests Python d’archive et les 31 du contrôleur de rapports ont réussi. Aucune mesure sur appareil.
- **PWA, Linux :** 64 tests Node et 22 tests d’archivage réussis. Les aides, les brouillons, la case, le focus, retour/Échap, les thèmes, les écrans 320/390 px et le hors-ligne ont été vérifiés sous Chromium et WebKit. La vraie mise à jour beta.11 → beta.12 avec données fictives et export v5 hors ligne a été vérifiée sous les deux moteurs. Une migration fictive 1.5.1 → beta.12 a aussi réussi sous Chromium. WebKit Linux ne valide pas Safari iOS.
- Après la rétention des trois ZIP, la reproduction du test de mise à jour historique demande de fournir séparément le ZIP beta.11 via `VIGIE_PREVIOUS_PWA`. Les autres tests anciens exigeant des ZIP retirés ne les remplacent pas par une autre version.
- L’installation et la lisibilité doivent encore être vérifiées sur Android réel et iPhone. Pas de validation de Windows, GitHub, émulateur, téléphone ni Safari iOS dans ce lot. Conserver une sauvegarde externe vérifiée.

Une première exécution d’un nouveau test attendait le texte à la fin alors que Compose l’avait inséré au curseur ; le test a été rendu déterministe et réexécuté avec succès. Une autre tentative combinant compilation et tests a vu disparaître le daemon sous pression mémoire ; les étapes séparées ont ensuite réussi.
