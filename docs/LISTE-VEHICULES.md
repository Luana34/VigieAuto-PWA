# Mes véhicules — Android 0.4.0-beta.42

> Actualisation PWA beta.15 : un repère de couleur facultatif existe maintenant dans la PWA ; Android beta.44 ne l’affiche pas encore. La description Android ci-dessous reste historique. [Guide du repère PWA](REPERES-VEHICULES-PWA-BETA15.md).

## Utilisation

Depuis **Accueil**, sous la carte « Mon garage », touchez **Choisir un véhicule** ; avec un seul véhicule, le bouton s’appelle **Voir mon véhicule**. La fenêtre « Mes véhicules » montre les noms, le compteur, une miniature lorsque la photo est lisible et la mention **Actif** pour le véhicule sélectionné. Faites défiler la liste si nécessaire, puis touchez **Choisir** sur un autre véhicule. **Fermer** ne change rien.

La sélection devient celle du carnet : les rubriques et la grande photo de l’accueil suivent le véhicule actif. Le choix est mémorisé localement et repris à la réouverture si ce véhicule existe encore. Si la sélection mémorisée est absente ou ne correspond plus à un véhicule, l’accueil affiche le premier véhicule disponible sans modifier silencieusement la sélection. Un changement explicite met à jour le réglage `activeVehicle` déjà présent dans l’export ; les véhicules, photos, entretiens, documents et autres données ne sont pas modifiés par ce choix.

Sans photo, une icône de voiture apparaît. Si une image importée est illisible, trop grande pour cet aperçu, ou si sa lecture échoue, le message **Aperçu indisponible** est affiché : l’image d’origine est conservée. Les libellés des photos et boutons identifient aussi le véhicule pour les lecteurs d’écran. Les données restent sur l’appareil ; l’application n’a pas besoin d’Internet pour cette liste.

## Traitement et limites

- La liste est affichée à la demande avec `LazyColumn` et des clés stables. Les miniatures sont demandées seulement pour les lignes visibles, avec **une lecture et un décodage à la fois** pour toutes les fenêtres du sélecteur, même après fermeture et réouverture ; elles sont limitées à **192 pixels sur leur plus grand côté**. La grande photo de l’accueil reste un aperçu distinct limité à 600 pixels et peut être chargée en parallèle.
- Les photos ne sont ni réécrites ni recompressées pour la liste ; une photo importée de plus de 8 388 608 caractères dans son URL de données n’a pas de miniature, mais reste dans le carnet. La lecture d’une photo passe par le véhicule complet et peut demander de la mémoire ; l’image active de l’accueil peut être chargée séparément.
- Il n’y a pas de cache de miniatures partagé ou persistant : après défilement ou fermeture, une miniature peut devoir être relue. L’empreinte du véhicule permet d’annuler une lecture devenue obsolète au lieu d’afficher sa photo pour une nouvelle version. La libération réelle de la mémoire dépend d’Android et du ramasse-miettes ; aucune limite globale de RAM ni fluidité à 60 images/s ne sont promises sans mesure.
- Lorsque l’ancien index de sélection atteint 300 caractères, la valeur complète est relue et vérifiée sans écriture. Un identifiant long importé ne doit pas être confondu avec un autre véhicule partageant son préfixe ; suppression et Undo prennent aussi en compte l’identifiant complet.
- La liste de résumés du carnet reste chargée en mémoire : ce n’est pas une pagination Room. La recherche approximative du catalogue, l’ordre par dernières utilisations, les couleurs ou avatars personnalisables et une vue combinée de plusieurs carnets restent à étudier ou développer.
- **Room 17, les formats JSON v1–v5 et la PWA ne changent pas.** Un import JSON confirmé remplace toujours les données du destinataire, sans fusion ; conservez et vérifiez séparément une sauvegarde externe de chaque appareil. Les JSON ne sont pas chiffrés.

## Vérifications de cette préversion

Suite JVM Linux : **745 réussis, 8 ignorés** faute des anciennes fixtures de retour PWA, aucun échec ; APK debug et **69 scénarios instrumentés compilés mais non exécutés** ; lint : **0 erreur, 24 avertissements, 5 indications**. Aucun essai sur téléphone, émulateur, Windows ou GitHub ; aucune mesure de performance. Aucun avertissement CloseGuard reconnu dans ces rapports (détection non exhaustive).

- Les vérifications ciblées couvrent la sélection, le retour après recréation, les identifiants longs avec préfixe commun, la suppression et l’Undo, l’absence ou l’illisibilité des photos, la taille des miniatures, les lignes visibles et la réouverture pendant une lecture annulée. Les tests de scripts Python ont aussi réussi : **30 CI, 7 workflow, 22 R8 et 31 archiveur**.
- La première tentative du test d’activité a expiré après recréation. Sa reprise réussit après synchronisation du Looper et effacement du message ; le deuxième clic est testé par action sémantique. La cause initiale n’est pas établie et le toucher physique après reprise reste à vérifier sur appareil.
- L’APK debug compilé pèse 13 243 654 octets : cette taille ne préjuge pas de celle d’une release. Les huit retours de pont PWA ignorés nécessitent des fixtures distinctes ; la PWA n’a pas changé dans ce lot.

Les tests sur ordinateur ne remplacent pas les essais sur appareil ou émulateur, notamment pour le défilement, la taille de police, l’accessibilité, les photos volumineuses et le retour après interruption. Aucun essai sur iPhone ou Safari iOS n’est déduit de ce lot Android ; les cibles de performance restent à mesurer.
