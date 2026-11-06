# Dépenses multidevises — Android 0.4.0-beta.34

## Utilisation

Dans **Dépenses → Ajouter**, choisissez la devise de chaque dépense. L’euro est proposé par défaut ; les anciennes dépenses sans affectation sont toujours en EUR. La liste propose les mêmes devises usuelles que la candidate PWA et un champ « Autre code… » pour trois lettres. Ce champ vérifie seulement la forme du code, pas son existence dans une liste officielle.

Une dépense importée avec une devise peut maintenant être modifiée, accompagnée d’un justificatif, supprimée puis restaurée avec **Annuler**. Pour changer la devise d’une dépense existante, une confirmation explique que **le montant ne sera pas converti** : vérifiez et corrigez-le vous-même si nécessaire. Les totaux restent séparés par devise. Les nouvelles valeurs de montant acceptent au plus deux décimales, quelle que soit la devise ; les anciens montants précis non modifiés sont conservés.

La limite commune est de **32 codes distincts au maximum pour l’ensemble de la base, euro compris**, et non 32 par véhicule. Un ajout, un changement ou une restauration qui dépasserait cette limite est refusé sans modification. Après une restauration refusée, l’image d’annulation reste disponible jusqu’à son expiration.

## Sauvegarde et compatibilité

- Sauvegarde manuelle JSON, sans serveur : format 3 tant qu’aucune affectation de devise n’existe ; format 4 dès qu’il en existe. La candidate PWA 1.5.2-beta.7 accepte les deux. Les versions Android antérieures à beta.33 refusent le format 4.
- Une dépense en EUR sans affectation reste implicite. Une affectation EUR contenant des champs supplémentaires est conservée : supprimer cette affectation ferait perdre ces extensions. Les anciennes propriétés inconnues, même nommées `currency`, restent des extensions de la dépense et ne deviennent pas une devise par accident.
- La suppression conserve localement la dépense, le justificatif, l’affectation et ses extensions dans une image Undo. Cette image n’est **pas** incluse dans un export ; elle est unique, proposée au moins 10 secondes au premier plan et peut être retrouvée jusqu’à 24 heures, sauf remplacement, import confirmé ou expiration. Un import remplace les données et efface l’Undo : sauvegardez et vérifiez d’abord chaque appareil.
- La base reste Room 16 : aucune nouvelle migration de table. L’image multidevise utilise une enveloppe typée interne différenciée de l’ancien format, avec empreinte contrôlée et blocage en cas d’altération. Une beta.33 réinstallée par-dessus ne sait pas restaurer cette nouvelle image : ne comptez pas sur un retour en arrière pour annuler une suppression ; conservez une sauvegarde externe.

## Sécurité et limites

Les opérations vérifient dans la transaction la version de la dépense, la devise et ses extensions ainsi que l’identité du véhicule. Même un import identique recrée cette identité : un ancien formulaire, une ancienne confirmation de suppression ou de justificatif est alors refusé. Une erreur d’écriture, un conflit ou des blocs corrompus annulent la transaction ; l’ancien Undo est conservé lorsqu’une nouvelle suppression échoue.

Ces protections sont vérifiées par les scénarios automatisés décrits dans l’historique, sans garantie d’absence de défaut. Les pleins et entretiens sont encore en euros ; il n’existe pas de liaison automatique plein/dépense ni de détection des doublons. Les sauvegardes JSON et les justificatifs qu’elles contiennent ne sont pas chiffrés. La candidate PWA est inchangée : sauvegarde externe avant tout essai. Les essais sur Windows, émulateur, téléphone et Safari iPhone restent nécessaires.

## Contrôles effectués pour cette préversion

- Sous Linux, **67 tests Android ciblés** réussis en groupes : devise, UI, extension et justificatif, anciens Undo et migration Room 15→16. Deux exécutions supplémentaires du retour PWA ont réussi. Tous les tests JVM du projet ont été **compilés**, pas tous exécutés.
- PWA inchangée : 55 tests unitaires réussis ; échange sur données fictives après édition/suppression/Undo Android, puis modification PWA, import Android et nouvelle vérification PWA sous Chromium et WebKit Linux.
- APK debug assemblé : 12 482 849 octets, code 38, min 26, cible 36 ; APK de tests instrumentés assemblé, **63 scénarios déclarés non exécutés**. Lint : 0 erreur, 20 avertissements et 3 indications. Une compilation initiale non bornée a été interrompue sous pression mémoire, puis la compilation complète des tests a réussi avec mémoire bornée.
- Outils Python de contrôle : 55 tests réussis (archive, rapports CI et workflow). Pas de suite JVM complète, d’essai Windows, GitHub, émulateur, téléphone ou Safari iPhone ; aucune mesure réelle de performance. Les tests locaux ne prouvent pas l’absence de défaut.
