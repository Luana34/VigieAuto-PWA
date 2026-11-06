# Totaux par devise — Android 0.4.0-beta.37

> **Mise à jour :** Android beta.38 ajoute la consommation sur l’écran Pleins. [Guide actuel](CONSOMMATION-ANDROID-BETA38.md). Le reste de cette page décrit beta.37.

**Préversion de test.** Avant une mise à jour ou un échange, exportez et vérifiez séparément la sauvegarde de chaque appareil, puis conservez des copies à l’extérieur. L’import confirmé remplace tout le carnet destinataire ; ce n’est pas une fusion. Le JSON n’est pas chiffré.

## Où les trouver

- Dans **Pleins**, la carte « Totaux des pleins et recharges » additionne les montants enregistrés pour le véhicule sélectionné, sur tout son historique. Les litres et les recharges sont regroupés dans cette carte pour le **montant**, pas pour une consommation.
- Dans **Entretien**, la carte « Totaux des entretiens » additionne les pièces et la main-d’œuvre enregistrées pour le véhicule sélectionné, sur tout son historique. Elle ne modifie pas les détails d’intervention.
- Chaque devise dispose de sa propre ligne ; aucune conversion ni taux de change. Les opérations historiques sans affectation restent en EUR. Les totaux de dépenses étaient déjà disponibles dans leur propre écran.
- Si aucune opération n’est enregistrée, la carte le précise au lieu d’inventer une somme. Une source incomplète ou un montant inutilisable rend le total de sa devise **indisponible**, sans afficher une somme partielle ; une autre devise peut rester calculable. Si la lecture échoue, « Réessayer » est proposé sans supprimer de données.
- Pleins, entretiens et dépenses sont des saisies indépendantes : **aucune liaison ni détection automatique des doublons**. Ne les additionnez pas tous si vous avez enregistré le même coût deux fois. Cette évolution ne crée pas encore de tableau de bord complet, de graphique Android ni de suivi de consommation Android ; ils restent à développer.

## Précision et conservation

Les montants et leurs devises sont lus ensemble depuis les tables Room complètes, sans calcul sur le texte d’une carte ni addition de nombres binaires flottants. Les sommes utilisent des décimales bornées ; si une valeur sort des limites de calcul ou est absente, elle n’est ni tronquée ni remplacée par zéro. La liste et les totaux ont des flux distincts : pendant leur actualisation, la somme est masquée tant que leurs identités et versions ne correspondent pas.

Cette évolution est en lecture seule : **Room reste en version 17, les formats JSON v1–v5 ne changent pas et la PWA reste en 1.5.2-beta.9**. Le passage depuis Android beta.36 ne nécessite donc pas de nouvelle migration de base. La PWA et Android beta.37 échangent manuellement les sauvegardes v3/v4/v5 compatibles. Une ancienne version peut refuser un format récent ; ne changez jamais son numéro pour contourner le refus. La limite de 32 devises, EUR compris, reste inchangée.

## Vérifications réalisées sous Linux

- **140 tests Android ciblés distincts réussis** en deux groupes : logique décimale, devise, erreurs, filtres par véhicule, modification, suppression/Undo, réimport, navigation réelle Compose → ViewModel → Room et stockage. Ils ne constituent pas une suite Android complète. Le test de pont existant a ensuite été complété et relancé pour vérifier les nouveaux totaux dans les trois passages.
- 80 tests Python Android des scripts de contrôle et d’archivage réussis.
- Pont fictif **Android → PWA beta.9 → Room → PWA** réussi sous Chromium et WebKit Linux, avec modifications de devises, contrôle des totaux et conservation d’une extension longue et du nombre précis `12345678901234567890.125` dans ces scénarios. PWA inchangée : 59 tests unitaires et 19 tests d’archive réussis.
- APK debug assemblé : **12 548 385 octets**, SHA-256 `0a28cf958edeb3c6ebaed492b607a8bb44a7b9d48e0012ae311b98db92dd81e6` ; identifiant `com.vigieauto.app`, code 41, minimum Android 26, cible 36. La taille debug ne prouve pas la taille d’une release.
- APK des tests instrumentés compilé ; lint debug **0 erreur, 20 avertissements, 4 indications**. **65 scénarios instrumentés déclarés, aucun exécuté.** Aucun essai Windows, GitHub, émulateur, téléphone ou Safari iPhone, et aucune mesure de performance. Les cibles de rapidité restent à mesurer sur appareils réels.

Les [décisions et limites beta.36](DEVISES-ANDROID-BETA36.md) restent l’historique du portage des devises ; les totaux des pleins et entretiens étaient alors encore à faire.
