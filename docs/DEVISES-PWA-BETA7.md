# Devise par dépense — PWA 1.5.2-beta.7 / Android 0.4.0-beta.32

## Décision et périmètre

Le 5 novembre 2026, la personne utilisatrice a choisi **une devise par opération**, plutôt qu’un réglage global réétiquetant tout le passé : les anciennes opérations restent en euros ; les nouvelles peuvent être dans une autre devise. Les totaux sont séparés et il n’y a aucune conversion automatique.

Ce **premier lot** permet de choisir la devise de chaque **autre dépense dans la PWA**. Les pleins et entretiens restent pour l’instant uniquement en euros ; le choix par opération pour ces rubriques et le portage Android restent à développer. La version Android beta.32 ne sait pas encore lire les sauvegardes multidevises : elle les refuse au lieu de les traiter en euros. Cette restriction est temporaire et volontaire pour protéger les données.

## Utilisation dans la PWA

Dans **Dépenses → Ajouter une dépense**, choisissez la devise à côté du montant. **EUR est proposé par défaut.** La liste comprend notamment CHF, GBP, USD, CAD, AUD, JPY, MAD, DZD, TND, XOF et XAF. « Autre devise… » accepte un code de trois lettres ; sa syntaxe est contrôlée, mais l’application ne vérifie pas en ligne si ce code est réellement en circulation. Les sommes sont affichées avec deux décimales, sans conversion ni taux de change.

Les dépenses existantes **sans affectation explicite** restent en euros. Une ancienne extension qui s’appellerait par exemple `currency` ou `vigieCurrency` reste une donnée inconnue : elle n’est pas automatiquement interprétée comme une devise. La devise d’une dépense existante peut être corrigée, mais une confirmation précise que le montant ne sera pas converti.

Les totaux, le tableau de bord et les graphiques sont calculés **séparément par devise**, y compris lorsqu’une même voiture a des dépenses en EUR et CHF. Le tri par montant regroupe les devises, puis trie les montants au sein de chaque groupe : sans taux de change, on ne peut pas comparer 20 CHF à 20 EUR. Les calculs PWA conservent leurs limites numériques préexistantes : ce ne sont pas des calculs comptables exacts. Les dépenses, pleins et entretiens restent distincts ; leurs doublons manuels ne sont pas détectés. Au maximum 32 codes de devises, euro compris, peuvent coexister dans un carnet ; cette limite est aussi contrôlée en transaction si deux onglets enregistrent simultanément.

## Sauvegarde, mise à jour et compatibilité

1. **Avant l’essai**, exportez et vérifiez une sauvegarde externe depuis chaque appareil. Les fichiers JSON ne sont pas chiffrés. Un import confirmé remplace l’intégralité du carnet de l’appareil destinataire, sans fusion.
2. La base de la PWA passe d’**IndexedDB 4 à 5**. Les anciennes PWA ne peuvent pas rouvrir directement la base mise à niveau ; fermez tous les anciens onglets et ne tentez pas de revenir en arrière sans sauvegarde vérifiée.
3. Si le carnet ne contient **aucune affectation de devise**, l’export reste au **format JSON 3**, compatible avec l’Android actuel dans les limites habituelles. Les sauvegardes formats 1 à 3 restent importables dans cette candidate.
4. Dès qu’une affectation de devise existe, l’export utilise le **format JSON 4**. **Android beta.32 et les anciennes PWA refusent ce fichier** : il n’y a pas encore d’échange multidevise entre plateformes. Conservez la sauvegarde v4 et attendez le portage Android ; ne modifiez pas son numéro de format et ne retirez pas les affectations pour contourner ce refus.
5. Une affectation peut subsister en EUR lorsqu’elle contient une extension inconnue à préserver ; dans ce cas l’export reste en v4 même si la devise visible est l’euro. Supprimer une dépense ou son véhicule supprime ses affectations associées, dans la même transaction.

## Contrat technique du premier lot

- `data.currencyAssignments` est une collection séparée des dépenses ; elle n’existe que dans un fichier v4. Chaque affectation contient `id = "expenses:" + recordId`, `collection = "expenses"`, `recordId` et un `currency` de trois lettres majuscules. Absence d’affectation : EUR. Cette séparation évite une collision avec les champs inconnus conservés dans les anciennes dépenses.
- Le fichier v4 est validé entièrement avant remplacement : absence de doublon, code valide syntaxiquement, référence vers une dépense existante et collection connue. Une association à un plein ou une intervention n’est pas encore acceptée. Les propriétés supplémentaires des affectations reconnues sont conservées lors d’une modification ; un conflit entre onglets bloque l’écriture obsolète.
- La création/modification et la suppression d’une dépense, ou la suppression en cascade d’un véhicule, traitent les affectations dans la même transaction IndexedDB. La PWA ne réécrit pas les anciennes dépenses lors de la migration.
- Le futur portage Android devra lire et exporter ce contrat v4, séparer tous les totaux, conserver les extensions et les informations de devise lors des modifications, suppressions et échanges, et éviter toute conversion implicite. Les changements de devises pour pleins et entretiens devront aussi couvrir les coûts au kilomètre et les statistiques sans mélanger les unités.

## Vérifications et limites

Sous Linux : 55 tests unitaires PWA ; scénarios de devises, montants historiques, totaux et graphiques séparés, sauvegarde et restauration v4, refus de la PWA beta.6, refus des fichiers invalides avant remplacement, conflit simulé entre onglets, deux créations concurrentes près de la limite de devises, suppression en cascade, trajet GPS fictif et fonctionnement hors ligne sous Chromium et WebKit. La migration beta.6 → beta.7 et les parcours dépenses/justificatifs ont aussi été vérifiés sur ces deux moteurs. WebKit Linux ne remplace pas Safari sur iPhone.

Un test Room/Robolectric utilise un fichier v4 réellement exporté par le navigateur : Android le refuse avant remplacement et ses données existantes restent inchangées. Un APK debug a été assemblé : `com.vigieauto.app`, code 36, min 26/target 36, 12 450 081 octets, seule permission interne de récepteur ; il n’est pas inclus dans le ZIP source et n’est pas une release signée. Les 102 fichiers de code Android principal et schémas Room sont identiques à beta.31 ; beta.32 ajoute uniquement une version, des tests et la documentation. Aucun test sur Windows, GitHub, émulateur, téléphone ou Safari iOS réel n’est revendiqué ; aucun objectif de performance n’est déclaré atteint.
