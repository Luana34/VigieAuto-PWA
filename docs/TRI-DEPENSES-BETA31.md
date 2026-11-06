# Trier les dépenses — PWA 1.5.2-beta.6 / Android 0.4.0-beta.31

## Utilisation

Dans **Dépenses → Trier par**, choisissez :

- **Date ↓** : dépenses les plus récentes en premier ; c’est le choix initial.
- **Catégorie** : ordre alphabétique des libellés visibles.
- **Montant ↓** : montants les plus élevés en premier.

Le tri concerne uniquement les dépenses du véhicule actif, reste en mémoire dans l’onglet tant qu’il est ouvert et revient à **Date** après rechargement. Il ne modifie aucun enregistrement ni le fichier de sauvegarde : il réorganise seulement l’affichage. Le total de la liste ne dépend pas du choix de tri et la carte **Dernière dépense** continue de prendre la date la plus récente. Les dépenses de même catégorie ou de même montant sont départagées par date, puis par les informations disponibles ; l’ordre exact de catégories accentuées peut varier entre les plateformes.

Les catégories futures ou très longues restent affichées avec un libellé de précaution et ne sont pas modifiées. Les montants non numériques ou indisponibles sont placés à la fin du tri par montant ; le tri lui-même ne les corrige pas. Les calculs PWA préexistants ne deviennent pas des calculs de comptabilité exacte par ce changement. Un plein et une dépense restent distincts : les doublons manuels ne sont pas détectés. Pas de devise réglable ni de liaison plein/dépense sans double comptage dans ce lot.

Android proposait déjà ces trois tris. La beta.31 Android change la version et la documentation ; **le code métier et les écrans Android sont inchangés depuis beta.30**. Pas besoin de réinstaller Android uniquement pour utiliser le nouveau tri PWA. Le JSON reste v3, Room 15 et IndexedDB 4 ; pas de migration nouvelle.

Avant tout essai ou import, conservez une sauvegarde externe vérifiée de chaque appareil. L’import confirmé **remplace** les données du destinataire, sans fusion. Fermez les anciens onglets PWA, dont certains n’ont pas la protection contre les modifications concurrentes. Les sauvegardes sont non chiffrées et les photos PWA peuvent conserver des métadonnées GPS.

## Vérifications et limites

Sous Linux : **50 tests unitaires PWA réussis** ; interface de dépenses, tri, kilométrage, justificatifs, conflits, quota et hors ligne testés sous Chromium et WebKit Linux. La mise à jour beta.5 → beta.6 et la mise en cache hors ligne sont vérifiées sur les deux moteurs. Le JSON est comparé avant et après le tri ; catégories futures et justificatifs restent intacts dans ces scénarios. Le retour fictif Room produit précédemment a été relu dans la PWA beta.6 sous les deux moteurs, sans relancer tout le pont Android dans ce lot.

L’APK debug beta.31 a été assemblé : `com.vigieauto.app`, code 35, min 26/target 36, 12 450 081 octets, seule permission interne de récepteur. Les **201 fichiers** de `app/src/main`, tests JVM/instrumentés et schémas ont été comparés à beta.30 : identiques. Les 13 tests Android ciblés et le pont complet documentés dans [KILOMETRAGE-DEPENSES-BETA30.md](KILOMETRAGE-DEPENSES-BETA30.md) concernent beta.30 ; les tests JVM, le lint et les instrumentés n’ont pas été relancés pour beta.31. L’APK est un contrôle local, non inclus dans le ZIP source, pas une release signée.

Pas d’essai Windows, GitHub, émulateur, téléphone ou Safari iOS dans ce lot. WebKit Linux n’est pas Safari iOS ; les objectifs de performance ne sont pas mesurés.
