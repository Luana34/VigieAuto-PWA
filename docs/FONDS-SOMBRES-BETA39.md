# Fonds sombres — Android beta.39 et PWA beta.10

## Choix appliqué

Après les comparatifs, le choix retenu est **les palettes existantes Sauge et Cyan, avec le seul fond général sombre remplacé par `#121212`**. Les couleurs des cartes, du logo, des boutons, des barres et des accents restent propres à chaque plateforme. Aucune palette claire n’est modifiée. Le mode suit toujours le téléphone ; le choix automatique historique conserve Sauge clair et Cyan sombre. Aucun réglage ne doit être réinitialisé.

| Plateforme | Thème sombre | Ancien fond général | Nouveau fond général | Carte véhicule conservée |
|---|---|---|---|---|
| Android | Sauge | `#0E1D17` | `#121212` | `#1B3B2B` |
| Android | Cyan | `#0B1D23` | `#121212` | `#0C2D36` |
| PWA | Sauge | `#0E1D17` | `#121212` | `#1B3B2B` |
| PWA | Cyan | `#0B1D23` | `#121212` | `#09242B` |

Les surfaces restent notamment `#193128` en Sauge sombre et `#142F36` en Cyan sombre ; les couleurs des boutons Cyan PWA et Android restent celles de chaque application. Le fond est commun à toutes les pages ; les barres, cartes, fenêtres et champs gardent leur rôle de surface et leurs couleurs antérieures. Les simulations HTML étaient des comparatifs autonomes, pas des mises à jour des applications.

## Données et mise à jour

Android : Room 17 et JSON v1–v5 inchangés. La PWA garde IndexedDB 6 et les mêmes sauvegardes ; son cache de service worker est renouvelé. La mise à jour réelle est vérifiée depuis la beta.9 sur la même origine avec données fictives, puis hors ligne ; cela n’est pas une publication ni une validation sur les appareils de la famille. Pour relancer le scénario de mise à jour, fournir le ZIP beta.9 réel séparément via `VIGIE_PREVIOUS_PWA` s’il n’est plus présent après rétention. Sauvegarder les deux bases séparément avant tout essai ; un import confirmé remplace le carnet de destination, sans fusion. Les sauvegardes JSON ne sont pas chiffrées.

## Vérifications et limites

Sous Linux : 18 tests Android ciblés réussis, dont le thème Compose et la navigation ; 64 tests PWA, 20 tests d’archivage PWA et 83 tests Python Android réussis. APK debug et APK de tests instrumentés assemblés ; lint : 0 erreur, 20 avertissements et 5 indications ; instrumentés non exécutés. Les 13 rubriques, cartes et fonds Sauge/Cyan, les modes clair et automatique et le mobile ont été contrôlés sous Chromium et WebKit Linux. La vraie mise à jour PWA beta.9 → beta.10 a conservé des données fictives et permis leur export hors ligne sous les deux moteurs. La suite Android complète n’a pas été relancée.

Android Studio sur Windows, émulateur, téléphone Android, Safari iOS et iPhone ne sont pas validés ici. Les tests instrumentés ont été compilés mais pas exécutés sur appareil ; il reste à vérifier le rendu dans les conditions réelles. Les cibles de temps, mémoire, fluidité et taille release ne sont pas mesurées. Le code source est livré ; aucun APK de production, serveur ni publication ne sont fournis.
