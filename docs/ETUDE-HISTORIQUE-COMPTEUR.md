# VigieAuto — étude de l’historique du compteur

**Phase 2.5 · étude et décision — actualisation PWA beta.18 / Android beta.47**  
L’étude initiale portait sur PWA beta.17 et Android beta.47. Les sections d’analyse ci-dessous décrivent cet état historique ; elles ne sont plus une proposition en attente de choix.

## Décision retenue et avancement

La solution retenue est **hybride** : seules les corrections manuelles sont stockées séparément ; les relevés des pleins, entretiens, contrôles, symptômes et dépenses sont lus à la demande dans leurs sources. Modifier ou supprimer une source change donc l’affichage sans synchronisation de doublons. Une baisse potentiellement incohérente est signalée en orange, de manière prudente, et une baisse manuelle demande confirmation.

La PWA **beta.18 candidate** implémente ce premier lot : table locale IndexedDB 7, confirmation avec date, motif obligatoire et personne facultative, chronologie, suppression confirmée, migrations et pont JSON par extension versionnée du véhicule. Elle n’invente aucune ancienne correction. Les essais automatisés fictifs ne remplacent pas Safari iPhone réel. L’historique n’est ni complet ni certifié.

**Android beta.47 ne propose pas encore cet historique et ne journalise pas ses propres corrections** ; le portage Android reste à réaliser. Les corrections PWA sont placées dans une extension inconnue de beta.47, mais leur préservation n’est à affirmer que pour les scénarios d’échange effectivement testés. L’import reste un remplacement complet après confirmation ; conserver les sauvegardes de chaque appareil. Voir le guide [HISTORIQUE-COMPTEUR-PWA-BETA18.md](HISTORIQUE-COMPTEUR-PWA-BETA18.md) inclus dans le ZIP PWA.

---

## Étude initiale — avant décision et développement

## En bref

Aujourd’hui, VigieAuto connaît le **kilométrage actuel**, mais ne conserve pas une liste des corrections de ce compteur. Certaines saisies, comme un plein ou un entretien, peuvent aussi faire augmenter automatiquement le compteur.

Avant d’ajouter un historique, il faut choisir ce qu’il doit contenir :

1. **Corrections manuelles uniquement** : une ligne quand on modifie volontairement le compteur. Les hausses dues aux autres saisies ne figureraient pas dans cette liste. C’est l’option la plus proche du terme « historique des corrections » du plan actuel.
2. **Toutes les mises à jour du compteur** : les corrections manuelles et les hausses produites par un plein, un entretien ou les autres écrans concernés. La liste serait plus complète mais aussi plus longue ; il faudrait informer clairement avant la création de chaque ligne associée.

Dans les deux cas, l’historique commencerait seulement après l’ajout de la fonction : **aucune ancienne correction ne serait inventée**. Le nom de la personne et la raison pourraient être facultatifs, sans compte ni identification automatique. Les fichiers JSON resteraient des sauvegardes personnelles non chiffrées.

## 1. Ce qui existe réellement

| Action | PWA beta.17 | Android beta.47 |
|---|---|---|
| Création d’un véhicule | Kilométrage demandé et enregistré. | Kilométrage demandé et enregistré. |
| Correction volontaire | Dans « Modifier mon véhicule ». | Dans « Actualiser le kilométrage » sur l’accueil. |
| Plein ou entretien | Un kilométrage supérieur au compteur le fait augmenter lors de l’enregistrement, y compris lors de certaines modifications. | Même principe pour les pleins et interventions. |
| Symptôme ou contrôle CQ | Un kilométrage supérieur peut faire augmenter le compteur lors de l’enregistrement. | Écrans complets non encore disponibles sur Android ; les données importées sont conservées. |
| Dépense | Son kilométrage facultatif décrit la dépense et ne modifie pas le compteur. | Même règle. |
| Correction à la baisse | Possible dans la fiche du véhicule. | Possible depuis la correction du kilométrage. |
| Historique détaillé des corrections | Pas de journal dédié. | Pas de journal dédié. |

Une correction n’a pas vocation à réécrire les anciens pleins, entretiens ou contrôles. L’augmentation automatique utilise actuellement le kilométrage supérieur à celui du véhicule ; un kilométrage inférieur dans un ancien plein ne le fait pas baisser. La modification du compteur peut toutefois changer l’affichage des échéances de rappels, qui utilisent le compteur actuel.

## 2. Proposition commune aux deux options

- Afficher un **historique par véhicule**, clairement distinct du compteur actuel et des kilomètres indiqués sur les anciens pleins ou entretiens.
- Pour une correction manuelle, conserver l’ancienne valeur, la nouvelle valeur, la date d’enregistrement et, si la personne le souhaite, une raison et un nom ou un repère libre.
- **Ne jamais récupérer de nom depuis le téléphone, les contacts, Google ou un compte.** Aucun compte n’est nécessaire. Le nom saisi reste une indication personnelle, pas une preuve d’identité.
- Expliquer avant l’enregistrement qu’une ligne d’historique sera créée. Une baisse doit être clairement visible et confirmée ; elle ne réécrit pas les anciens événements.
- Une ouverture, une annulation ou un enregistrement sans changement ne doit pas créer de ligne. Compteur et nouvelle ligne doivent être enregistrés ensemble ou pas du tout.
- Si l’on propose plus tard de supprimer une ligne, le faire uniquement après confirmation claire, sans changer le compteur actuel ni d’autres données. Aucune purge ou troncature silencieuse.
- Indiquer que l’historique n’est **pas un journal certifié** : il peut être incomplet, en particulier après usage d’une ancienne version, d’un autre appareil ou d’une sauvegarde plus ancienne.
- Ne pas déduire des corrections passées à partir du kilométrage initial, des pleins ou des entretiens : leur date de saisie, leur ordre et les corrections intermédiaires ne sont pas connus avec certitude.

### Si les mises à jour automatiques sont aussi retenues

Une ligne pourra indiquer par exemple « Plein » ou « Entretien » plutôt que d’inventer une personne ou une raison. L’écran devra prévenir que l’enregistrement mettra aussi le compteur et l’historique à jour. La date à laquelle l’application a enregistré le changement devra rester distincte de la date saisie sur le plein ou l’entretien : elles peuvent être différentes. La modification ou la suppression ultérieure de l’élément d’origine ne doit pas faire disparaître silencieusement une ligne d’historique.

## 3. Sauvegardes et anciennes versions

- Android et PWA restent **deux bases locales** ; le passage de l’une à l’autre est manuel, sans synchronisation directe.
- Un import confirmé **remplace** le carnet destinataire : ce n’est pas une fusion. Exporter et vérifier séparément chaque appareil avant un échange, puis conserver les originaux.
- Une ancienne version peut conserver un champ qu’elle ne connaît pas, mais ne saura pas nécessairement ajouter une ligne lorsqu’elle modifiera le compteur. Il ne faudra jamais présenter l’historique obtenu comme complet après cet aller-retour.
- La PWA familiale **1.5.1** a une limite connue sur les nombres très précis. Sa compatibilité ne doit pas être supposée à partir des essais de la candidate ; une base IndexedDB mise à jour ne se rouvre pas forcément avec une ancienne PWA sur la même origine.
- La future fonction devra protéger les structures inconnues ou trop volumineuses : conserver les données, expliquer la limite et refuser l’opération concernée si nécessaire, sans empêcher les modifications sans rapport lorsque cela reste sûr.

## 4. Pistes techniques étudiées — pas encore décidées

### A. Extension à l’intérieur du véhicule

Ajouter une propriété versionnée au véhicule permettrait d’utiliser les mécanismes actuels de conservation des champs supplémentaires, sans ajouter nécessairement une collection JSON. Room 17 conserve déjà les propriétés inconnues du véhicule dans ses blocs d’extensions ; IndexedDB enregistre l’objet véhicule. **C’est une piste de compatibilité, pas une garantie** : il faut tester chaque chemin, chaque version et les limites de taille avant adoption.

Avantages : historique attaché au bon véhicule, sauvegarde dans le même objet et possibilité de conserver la structure dans des versions qui préservent les champs inconnus. Risques : l’objet grossit, les lectures/écritures peuvent coûter plus cher, les anciennes versions ne journalisent pas leurs propres changements, et le remplacement par une ancienne sauvegarde peut retirer l’historique du destinataire après confirmation d’import.

### B. Collection séparée

Une table et une collection JSON distinctes peuvent faciliter la consultation d’un grand historique. Mais elles nécessitent davantage de migrations et de règles de suppression/Undo ; la PWA actuelle **refuse une collection JSON inconnue** plutôt que de la perdre. Cette option impose donc un travail de versionnement et de compatibilité plus important.

**Recommandation provisoire :** explorer d’abord l’extension versionnée, sans annoncer un format définitif avant les essais PWA → Android → PWA, l’examen des anciennes versions et le choix du périmètre de l’historique.

## 5. Précision des kilomètres : point de vigilance

La correction Android actuelle accepte des nombres décimaux ; les tests existants comprennent par exemple `250000.5`. La PWA refuse les nombres fonctionnels qui seraient trop grands ou trop précis pour être utilisés sans arrondi en JavaScript.

La validation Android du compteur n’impose pas actuellement toutes les mêmes limites que la PWA. Avec des **valeurs fictives extrêmes**, par exemple `9007199254740992`, la lecture PWA les refuse pour éviter une perte de précision. Il faudra donc définir et tester une règle commune pour les **nouvelles** écritures, tout en conservant les anciennes valeurs sans les arrondir ni les bloquer silencieusement. Ce constat tiré du code et de sondages isolés ne signifie pas que tes données comportent ce problème.

L’affichage d’un nombre ne doit pas servir à reconstruire une valeur plus précise que l’application aurait déjà arrondie. Une modification d’un autre champ ne doit pas réécrire le compteur par accident.

## 6. Concurrence et sauvegarde sans perte

La PWA utilise déjà une comparaison de l’image du véhicule et une transaction IndexedDB pour plusieurs modifications. Android vérifie l’empreinte du véhicule dans une transaction Room pour la correction directe. Le futur historique devra conserver ces protections :

1. capturer le bon véhicule, y compris s’il n’est pas actif ;
2. refuser un véhicule modifié ou supprimé entre l’ouverture et l’enregistrement ;
3. enregistrer compteur et ligne d’historique dans la même transaction ;
4. ne pas perdre la photo, les notes enrichies, les données d’assurance, les autres champs ou les extensions inconnues ;
5. préserver les nombres exacts et les données déjà présentes, même quand leur format n’est pas reconnu ;
6. prévenir avant remplacement d’un carnet par import et conserver la possibilité d’une sauvegarde externe.

## 7. Vérifications à prévoir avant livraison

- Ancien véhicule sans historique ; données fictives récentes et anciennes ; aucun historique reconstitué.
- Hausse, baisse, valeur inchangée, annulation et doubles clics ; raison et personne absentes ou renseignées.
- Selon l’option choisie : toutes les origines automatiques pertinentes, y compris modification et suppression ultérieures de l’élément d’origine.
- Deux fenêtres ou opérations simultanées ; conflit, suppression du véhicule, échec en cours d’écriture et rollback.
- Types inconnus, extensions futures, données volumineuses, décimales et limites numériques ; aucune troncature.
- Export/import de remplacement et conservation des autres collections, pièces jointes, devises et notes.
- PWA → Android/Room → PWA et essais avec les anciennes versions, en distinguant les parcours réellement vérifiés des hypothèses.
- Tests d’interface, hors-ligne, accessibilité et appareils ; mesures de réactivité et taille avec un historique volumineux. Aucun test ne doit être retiré pour accélérer le lot.

## 8. Vérifications réalisées pour cette étude

- Lecture du code de compteur PWA beta.17 et Android beta.47, des mécanismes de transaction, du codec véhicule Room et du traitement des nombres JSON.
- **32 tests Node réussis** : cinq sondages isolés sur données fictives et 27 tests existants de précision et de notes. Les sondages vérifient notamment la conservation d’une extension fictive dans une fonction PWA isolée, la comparaison d’un objet modifié et le refus PWA de valeurs fonctionnelles non sûres.
- Ces vérifications **ne sont pas une implémentation de l’historique** et ne prouvent pas un aller-retour Room, un parcours complet d’interface, un téléphone Android, Safari iPhone, Windows ou une mesure de performance.

## 9. Suite proposée

Après le choix du périmètre, préparer un premier lot compatible avec les décisions ci-dessus, avec documentation et ZIP source vérifié. Porter ensuite le même contrat sur l’autre plateforme, en signalant explicitement la période où une version ne journalise pas encore les changements. Le socle ne sera pas déclaré stable sans les validations sur appareils déjà prévues.
