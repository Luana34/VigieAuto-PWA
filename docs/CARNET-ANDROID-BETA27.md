# Carnet enrichi Android 0.4.0-beta.27

## Ce qui est disponible

Dans Entretien, ajouter facultativement jusqu’à 100 lignes « pièce / opération » et leur coût individuel ; les lignes sont calculées en centimes entiers, sans addition flottante. La somme est reportée dans l’ancien champ `parts`, la main-d’œuvre `labor` reste séparée et le total est affiché. Sans ligne, le montant global reste libre. Une intervention ancienne n’est pas convertie à l’ouverture : si un ancien montant global non nul est remplacé par des lignes, une confirmation est demandée et rien ne change avant l’enregistrement. Les calculs et limites refusent les montants qui ne peuvent pas être échangés sans arrondi.

Plusieurs catégories (30 au maximum) peuvent être associées à une intervention. Le sélecteur occupe l’écran disponible et propose recherche immédiate, familles visibles hors recherche, résultats rappelant leur famille pendant la recherche, et création libre « Autre… ». Les neuf familles standard et leurs 83 libellés sont tirés du même référentiel que la candidate PWA ; la dixième famille est « Mes catégories ». La catégorie personnelle n’est mémorisée qu’avec l’entretien confirmé, dans la transaction locale. Le défilement vertical ne demande pas la fermeture du sélecteur ; flèche, Retour et sélection permettent de le fermer. L’interaction des gestes Android du fabricant doit encore être vérifiée sur un téléphone.

Dans Pleins et recharges, le sous-type est une saisie facultative libre : gazole, essence, GPL, E85 ou types de charge sont suggérés selon l’énergie et les 100 derniers pleins du véhicule. Un hybride propose essence et gazole ; une saisie en kWh propose les types de charge. Le sous-type ne change ni les calculs, ni les enregistrements anciens. Les suggestions ne sont ni des recommandations mécaniques ni une base constructeur.

Le bouton « Voir sur la carte » utilise uniquement le texte du lieu/intervenant ou de la station. Il ouvre, à la demande explicite, une recherche Google Maps qui peut être prise en charge par une application de cartes ou un navigateur. La requête peut être ambiguë ; un service externe reçoit le texte et peut nécessiter Internet. Aucune coordonnée n’est enregistrée par ce bouton, qui n’active pas la localisation.

## Échanges et protections

- Enveloppe inchangée : `app`, `formatVersion: 3`, `exportedAt`, `data.services`, `data.fills` et `data.settings`. Les champs optionnels `vigieServiceDetails`, `vigieServiceCategories` et `vigieFuelSubtype` sont ceux de la PWA 1.5.2-beta.2 : voir [CARNET-PWA-BETA2.md](CARNET-PWA-BETA2.md). Le schéma conceptuel français ne constitue pas un fichier v3 importable.
- Une version ancienne lit toujours `parts` et `labor`. Si elle modifie le montant global alors que des lignes détaillées existent, beta.27 détecte la divergence et conserve les deux valeurs ; le recalcul exige confirmation et enregistrement.
- Les extensions de version inconnue ou invalides restent intactes et leur édition est bloquée, sans bloquer les autres champs valides. Les propriétés supplémentaires imbriquées suivent leur ligne ou catégorie tant que celle-ci est conservée. Supprimer volontairement une ligne ou une catégorie supprime aussi ses propriétés. Les champs non modifiés conservent leur valeur, leur absence et les nombres représentables importés ; aucun système ne peut reconstituer une précision déjà perdue par une ancienne PWA.
- Catégories personnelles, intervention, rappel éventuel et compteur sont enregistrés dans une même transaction. Une écriture périmée ou une panne n’enregistre aucune partie du changement.
- Aucun changement de schéma Room 15 ni de version JSON ; la PWA 1.5.2-beta.2 reste une candidate. Les tests automatisés sur données fictives ne garantissent pas toutes les sauvegardes, appareils ou versions. Faire une sauvegarde JSON externe vérifiée des deux côtés avant tout essai ; l’import remplace le carnet destinataire et ne fusionne pas les données.

## Hors périmètre et limites

Quantité par pièce et fournisseur/référence restent à décider. Pas de nouvelle permission ni de synchronisation ; pas d’OBD. GPS natif et assistance Bluetooth autoradio restent à développer, avec action/confirmation explicite. Safari iOS, les gestes système, l’ouverture des cartes sur appareils réels, Android Studio/Windows et les performances restent à valider. Le socle n’est pas déclaré stable.

## Résultats obtenus sur ordinateur

Suite JVM Linux : **573 réussis, 8 ignorés, aucun échec sur 581 cas**, 84 classes ; les huit ignorés sont d’anciens retours PWA dont les fixtures ne sont pas fournies à la suite. Le parcours enrichi Room → candidate PWA → Room → PWA a été exécuté séparément sur données fictives sous Chromium puis WebKit Linux : coûts, catégories, sous-type, propriétés imbriquées et nombre de grande précision conservés. Sept tests Compose ciblés ont aussi réussi. L’APK debug et les 61 scénarios instrumentés sont compilés ; ces derniers n’ont pas été exécutés. Lint debug : 0 erreur, 20 avertissements et 1 indication. Les scénarios automatisés ne valident pas Windows, un émulateur, un appareil Android ou Safari iOS. Aucun benchmark physique.

## Contrôles reproductibles

`MaintenanceDomainTest`, `MaintenanceUiTest`, `MaintenanceRepositoryTest` et `MaintenanceBridgeTest` couvrent les garde-fous. `scripts/test-catalogue-entretien.cjs` compare le catalogue Android et PWA. `scripts/test-carnet-pont.cjs` utilise des données fictives et la vraie candidate PWA : export Room, import/édition PWA, import/édition Room et vérification dans la PWA. Le test de retour Room utilise une fixture locale si aucun fichier du parcours PWA n’est fourni ; ce mode seul ne prouve pas un échange réel. Voir le commentaire en tête du script pour les commandes et `VIGIE_BROWSER=webkit` pour WebKit Linux.
