# Devises des opérations — PWA 1.5.2-beta.8

> **Document historique :** pour l’état actuel Android beta.36 et PWA beta.9, consultez [le guide actualisé](DEVISES-ANDROID-BETA36.md).

Candidate de test du 6 novembre 2026. Les données restent locales ; aucune conversion ni taux en ligne.

## Utilisation

- Une **dépense**, un **plein ou une recharge**, et une **intervention** ont chacun leur propre devise. À la création : EUR par défaut. Les opérations existantes sans affectation restent en EUR ; les anciens champs libres nommés `currency` ne sont pas interprétés comme une devise.
- À la modification, un changement de devise demande confirmation : **il ne modifie ni ne convertit les montants**, y compris le prix unitaire d'un plein et les pièces/main-d'œuvre d'une intervention. Il appartient à la personne de corriger les montants si nécessaire. Toutes les lignes de la même intervention partagent une seule devise.
- Les codes proposés et « Autre devise… » sont disponibles hors ligne. Un code personnalisé est seulement vérifié comme trois lettres majuscules ; sa validité réelle n'est pas vérifiée. Limite de 32 devises distinctes pour l'ensemble des véhicules, EUR compris.
- Accueil, listes, totaux et graphiques séparent les montants par devise. Aucun taux de change ; aucun total global additionnant plusieurs devises. Les saisies de pleins, interventions et dépenses restent indépendantes : les doublons ne sont pas détectés automatiquement.
- La consommation utilise toujours les pleins complets et partiels valides sans mélanger litres et kWh. Si les coûts de ces intervalles comportent plusieurs devises — que le changement soit au milieu d'un intervalle ou entre intervalles — le **coût énergétique moyen par kilomètre et l'estimation de coût des trajets sont masqués**. La consommation reste affichée. Une seule devise dans les intervalles permet d'afficher le coût dans cette devise, sans conversion. Ce n'est qu'une estimation, pas une mesure individuelle par trajet.

## Formats de sauvegarde et compatibilité

| Contenu exporté | Format | PWA beta.8 | Android beta.35 | Ancienne PWA beta.7 |
|---|---:|---|---|---|
| Aucune affectation de devise | 3 | lit/écrit | lit/écrit | lit/écrit |
| Affectations de dépenses uniquement | 4 | lit/écrit | lit/écrit depuis beta.33 | lit/écrit |
| Affectation d'un plein/recharge ou d'une intervention | 5 | lit/écrit | **refuse** | **refuse** |

- Ne changez jamais le numéro du format et ne supprimez pas les affectations pour forcer un import : les montants seraient réétiquetés ou perdus. Gardez le fichier d'origine. Android beta.35 ne sait pas encore afficher, éditer ou réexporter les devises des pleins et interventions.
- Une affectation explicite EUR portant des extensions inconnues reste conservée : elle peut donc maintenir un export en format 5 même après un retour à EUR. L'application n'efface pas ces extensions.
- `currencyAssignments` contient des objets `id`, `collection`, `recordId`, `currency`. La clé est qualifiée par collection, par exemple `fills:<id>`, `services:<id>` ou `expenses:<id>`. Les IDs de deux collections peuvent être identiques. Les codes invalides, identifiants incohérents, doublons et références orphelines sont refusés avant remplacement. Le format 4 ne permet que `expenses`.
- L'écriture et la suppression de chaque opération et de son affectation sont transactionnelles ; un formulaire dont l'opération ou la devise a changé est refusé. La suppression d'un véhicule supprime aussi les affectations de ses opérations.

## Mise à jour et sécurité

**Avant essai**, exporter une sauvegarde complète vérifiée et en garder une copie à l'extérieur du téléphone. Utiliser de préférence une installation de test distincte. L'import confirmé remplace toutes les données locales ; le JSON n'est pas chiffré. Une sauvegarde n'est pas automatique.

IndexedDB passe de **5 à 6** sans modifier les opérations historiques. Fermer les autres onglets avant mise à jour. La version précédente ne peut plus rouvrir directement la base mise à niveau ; ne pas vider le stockage pour contourner ce refus. Un contrat de version bloque aussi une ancienne interface qui chargerait par erreur le nouveau module de stockage pendant le renouvellement du cache. Une installation iPhone ajoutée à l'écran d'accueil peut posséder un stockage distinct de l'onglet Safari. La première mise en cache exige une adresse HTTPS ; les essais hors ligne sur les navigateurs Linux ne remplacent pas un essai Safari sur iPhone réel.

## Contrôles logiciels

Les tests de cette étape utilisent uniquement des véhicules fictifs : tests unitaires de séparation et de calcul, puis interface Chromium et WebKit Linux avec anciens EUR, trois familles d'opérations, partiels multidevises, graphiques, v3/v4/v5, grands nombres exacts, refus de l'ancienne PWA beta.7 réelle sans remplacement, migration IndexedDB 5→6, interdiction de retour, combinaison artificielle ancienne interface/nouveau stockage refusée, conflits d'onglets, limite concurrente, suppression/cascade et hors ligne. Android est vérifié séparément dans [DEVISES-ANDROID-BETA35.md](DEVISES-ANDROID-BETA35.md). Aucun téléphone, Safari iOS ou comportement de performance n'a été validé ici.
