# Lecture du carnet — Android 0.4.0-beta.24

## Éviter un faux carnet vide

L’écran principal distingue maintenant trois états de lecture des résumés du carnet : **chargement**, **lecture disponible** (y compris un vrai carnet vide) et **lecture indisponible**. L’animation de chargement est indéterminée : aucun pourcentage n’est inventé. Si la surveillance des données échoue ou se termine de manière inattendue, l’application n’affiche pas ses anciennes données comme si elles étaient encore à jour ; elle invite à réessayer sans exposer de chemin technique ou de détails privés.

La lecture de l’annulation locale de la dernière suppression est également nécessaire avant de permettre les modifications. Une erreur propose de réessayer immédiatement ; après **10 secondes de chargement**, le même choix apparaît aussi sans qu’une erreur soit déclarée, y compris au-dessus d’un formulaire ouvert. Ce seuil est un choix d’interface, non une mesure de performance ni une preuve de panne ; aucune relance n’est automatique. Le bouton **Réessayer** ne réinitialise pas la base et ne garantit pas de corriger une erreur persistante. Les suggestions de saisie sont facultatives : leur indisponibilité ne doit pas empêcher la saisie libre.

La reprise annule la tentative précédente et attend sa fin avant d’en lancer une autre. En particulier, la lecture d’Undo peut effectuer un nettoyage transactionnel : pas d’essais Undo simultanés, et le résultat d’une ancienne tentative annulée ne déverrouille pas les écritures. Si une opération ne coopère pas à l’annulation, elle peut continuer à bloquer la reprise : le bouton ne garantit pas de forcer sa fin. Après un clic pendant le chargement, le choix réapparaît après une nouvelle attente ; les modifications restent bloquées.

Une lecture disponible indique que le flux des résumés a répondu ; **ce n’est pas un contrôle exhaustif de l’intégrité ou de l’exhaustivité de toute la base**. Le nettoyage des copies temporaires et la reconstruction de certains index sont des opérations de démarrage distinctes : leur échec produit un message, mais ne bloque pas à lui seul la lecture des résumés.

## Contrôles simulés

Les tests Robolectric/Compose vérifient notamment le délai, l’absence de relance silencieuse, la conservation d’un vrai brouillon, le blocage d’une ancienne lecture et des appuis aux coordonnées d’une action masquée. Ces simulations ne remplacent pas un test tactile ou TalkBack sur appareil.

## Pendant une interruption de lecture

- Les actions manuelles qui modifient le carnet et la confirmation d’un import sont bloquées tant que les lectures nécessaires ne sont pas fiables. Une opération déjà lancée n’est pas présentée comme annulée : elle peut se terminer selon son propre résultat. Les tâches internes de démarrage et d’entretien de l’application peuvent par ailleurs continuer ; il ne s’agit pas d’un gel de toute écriture interne.
- Sur l’écran principal, le contenu ancien est masqué et inaccessible ; s’il était ouvert, un formulaire reste dans la navigation sous le message d’état. On peut réessayer puis reprendre la saisie si la lecture revient. Le message bloque les actions du formulaire pendant ce temps.
- Un brouillon non enregistré reste seulement dans l’état de l’application : **une fermeture du processus ou de l’application peut le faire perdre**. Un chargement bloqué peut rester en attente malgré « Réessayer » ; quitter peut faire perdre la saisie. Ne pas désinstaller ni effacer les données de l’application pour tenter de résoudre une erreur.
- La vérification d’un fichier et l’export restent tentables dans le ViewModel lorsqu’il s’agit uniquement d’une erreur des résumés, sous réserve des autres gardes et erreurs possibles ; **l’écran d’erreur ne donne pas nécessairement accès à ces actions**. Aucune sauvegarde supplémentaire n’est créée automatiquement.
- Après une absence prolongée de l’écran, les résumés sont relus ; le chargement n’est pas confondu avec une erreur ou une liste vide. Un problème survenu avant que ces lectures puissent être mises en place ne relève pas nécessairement de cet écran de reprise.

En cas d’échec persistant, garder l’application et ses données en place, conserver ses copies JSON existantes hors du téléphone et relever le contexte sans partager de données personnelles. Cette protection ne remplace pas les sauvegardes, ni les tests sur un appareil réel.

## Périmètre

Aucune migration n’est ajoutée : Room reste en version 15 et l’échange JSON en version 3. La PWA familiale n’est pas modifiée. Les tests JVM/Compose simulent les scénarios ; la réactivité sur appareils, les blocages de stockage réels et les performances restent à vérifier sur émulateur et téléphone.
