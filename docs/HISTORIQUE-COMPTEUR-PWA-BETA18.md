# Historique kilométrique — PWA 1.5.2-beta.18

## Ce que vous pouvez faire

1. Ouvrez **Mes véhicules → Historique km** sur le véhicule souhaité, même s’il n’est pas le véhicule actif.
2. La liste rassemble les kilométrages utilisables des **pleins/recharges, entretiens, contrôles CQ, symptômes et dépenses**, ainsi que les corrections manuelles. Une dépense sans kilométrage ne crée pas de relevé. Les enregistrements restent dans leurs rubriques d’origine : si vous les modifiez ou les supprimez, la liste reflète leur nouveau contenu.
3. Pour corriger le compteur : **Mes véhicules → Modifier** (crayon), changez le kilométrage et choisissez **Enregistrer**. L’écran suivant montre l’ancienne et la nouvelle valeur. Indiquez la **date**, un **motif obligatoire**, et éventuellement un prénom ou repère libre ; aucun compte n’est utilisé. Terminez par **Confirmer et enregistrer**. Une baisse est signalée en orange avant confirmation.
4. « Annuler », la croix ou Échap sur l’écran de confirmation reviennent au formulaire précédent avec ses saisies ; rien n’est enregistré. Abandonner ensuite un formulaire modifié demande confirmation.
5. Une correction peut être supprimée depuis l’historique **après confirmation**. Cela ne modifie ni le compteur actuel ni les autres relevés ; une ancienne sauvegarde peut encore contenir la ligne. La suppression d’un véhicule supprime aussi ses corrections après avertissement.

La liste commence par les relevés les plus récents. Elle affiche 80 lignes à la fois, avec **Afficher plus de relevés** si nécessaire. Un relevé inférieur à ceux du jour précédent connu peut être signalé en orange : vérifiez la date et le kilométrage. Ce contrôle est prudent, **non exhaustif** : l’ordre des événements d’une même date n’est pas connu ; une baisse manuelle confirmée évite une alerte automatique sur cette date. Aucun relevé n’est modifié automatiquement.

## Limites importantes

- Cet historique est **incomplet et non certifié**. Aucune ancienne correction n’a été inventée. Les sources antérieures ne contiennent pas forcément tous les relevés.
- Les anciennes versions, notamment **Android beta.47 et PWA beta.17**, ne créent pas ces lignes quand elles modifient le compteur. Après utilisation de ces versions ou restauration d’une ancienne sauvegarde, des corrections peuvent manquer. Android beta.47 n’affiche pas encore cet historique.
- Les fichiers JSON sont personnels et **non chiffrés**. Il n’y a ni synchronisation entre appareils ni fusion : **l’import confirmé remplace intégralement le carnet du destinataire**, y compris ses corrections. Exportez et conservez séparément les sauvegardes de chaque appareil avant tout essai ou échange.
- La candidate est une **préversion**. Elle n’est pas validée sur Safari/iPhone réel ni sur téléphone Android. La version familiale 1.5.1 reste séparée. Testez sur un appareil ou une origine distincte ; un autre chemin du même domaine peut partager la même base.
- IndexedDB passe à la **version 7**. Une ancienne PWA ne peut pas rouvrir directement une base déjà migrée. En cas d’onglets de versions différentes, fermez-les et rechargez avant de réessayer.

## Règles techniques et préservation

- Seules les **corrections manuelles** sont stockées dans la table locale `odometerCorrections`, liée au véhicule. Compteur, ligne, choix actif et suggestions sont écrits dans une même transaction IndexedDB. L’image du véhicule **et** l’état de ses corrections sont comparés à l’enregistrement ; conflit, véhicule supprimé ou échec : tout est annulé.
- Le JSON v3/v4/v5 n’ajoute pas de collection racine. Les corrections sont reconstruites à l’export dans `vigieOdometerCorrections` du véhicule ; l’import confirmé les sépare à nouveau transactionnellement. Une migration IndexedDB déplace de la même façon une extension reconnue déjà présente dans une ancienne base. Les autres champs et les nombres inconnus précis sont conservés dans les cas testés.
- Contrat d’extension reconnu : `version: 1`, `entries`, avec pour chaque correction `id`, `date`, `recordedAt` UTC, `before`, `after`, `reason`, `actor` et les champs supplémentaires éventuels. La date est celle choisie ; l’horodatage correspond à l’enregistrement. Aucun nom n’est récupéré automatiquement.
- Un format futur, des identifiants répétés ou une structure inconnue restent intacts, sans interprétation. Dans ces cas, la correction du compteur est bloquée pour ne pas écraser les données ; les modifications sans rapport restent possibles. Un état local incohérent bloque l’export plutôt que de supprimer une ligne.
- Une nouvelle correction exige des nombres non négatifs utilisables sans arrondi, un motif non vide, au plus **500 caractères** pour le motif et la personne, et au plus **2 048 corrections reconnues par véhicule**. L’application refuse aussi une correction qui rendrait l’objet véhicule trop volumineux pour le pont prévu, sans tronquer l’existant. Les structures importées non reconnues restent préservées.

## Vérifications et ce qu’elles ne prouvent pas

Les scénarios automatisés utilisent des données fictives : correction et abandon, sources modifiées/supprimées, avertissement, panne simulée et rollback, conflit sur le véhicule ou les corrections, suppression en cascade, pagination, import/remplacement/export, nombres précis et formats futurs. La migration réelle de beta.17 vers beta.18, une migration interrompue, l’ancien code et le fonctionnement hors ligne sont vérifiés sous **Chromium et WebKit Linux**. WebKit Linux n’est pas Safari sur iPhone.

Un aller-retour fictif **PWA beta.18 → Android beta.47/Room → PWA beta.18** a aussi été vérifié : trois corrections, une extension future et un grand nombre inconnu ont été conservés ; une modification du compteur par l’ancien Android n’a pas créé de correction fictive. Le dépôt Android et une suppression suivie d’Undo ont été exercés en JVM, puis le retour a été importé sous Chromium et WebKit Linux. Ce scénario ne valide ni l’interface Android, ni un téléphone ; une ancienne version peut modifier un compteur sans enregistrer l’événement.

Les scripts ont réussi **127 tests Node, 32 tests d’archive et 14 tests de publication** ; un test ciblé Room a réussi. Un premier lancement Gradle a perdu son daemon au cours de ce contrôle ; la relance séparée a réussi. Sa cause n’est pas établie.

Aucun benchmark sur téléphone n’est revendiqué : toutes les cibles de démarrage, fluidité, mémoire et import/export restent à mesurer. Le portage Android de l’historique, les essais iPhone, Android et lecteur d’écran réels restent à faire.
