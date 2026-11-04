# Trajet GPS assisté par Bluetooth voiture — objectif demandé

**Décision du 4 novembre 2026 · à développer, non disponible en beta.26.** L’utilisateur préfère terminer les principales fonctions et disposer idéalement de ce parcours avant ses essais sur téléphone en voiture. Les tests sur téléphone sont donc différés, mais restent indispensables avant de déclarer les fonctions ou le socle validés.

## Parcours souhaité

1. Associer une fois le téléphone à l’autoradio ou au système Bluetooth de la voiture dans Android ; dans VigieAuto, choisir explicitement ce périphérique déjà associé et le véhicule correspondant. Fonction facultative, désactivable. Plusieurs véhicules doivent rester possibles, sans attribuer silencieusement un trajet au mauvais véhicule.
2. À la connexion du Bluetooth choisi, **proposer** « Démarrer un trajet ? ». Un appui volontaire ouvre l’application et confirme le démarrage, idéalement avant de prendre la route. Aucun suivi GPS ne commence au seul événement Bluetooth.
3. Utiliser le **GPS du téléphone**, pas un boîtier OBD, pour estimer la vitesse, la distance et la durée. Afficher une notification visible pendant le service de localisation ; prévoir pause, reprise, arrêt, interruption et choix d’enregistrement. Aucune trace détaillée conservée par défaut ; les réglages de conservation devront être explicites.
4. À la déconnexion, **proposer** d’arrêter et sauvegarder un trajet pertinent, sans arrêt ni sauvegarde silencieux. Si la proposition ne peut pas être émise, l’arrêt manuel doit rester disponible. Une coupure temporaire du Bluetooth ne prouve pas à elle seule la fin du trajet.

La connexion Bluetooth ne fournit pas automatiquement les données mécaniques ou la consommation instantanée du véhicule. Un adaptateur OBD et la lecture de codes/données sont seulement une possibilité ultérieure, ni requis ni implémentés. Un beacon BLE payant n’est pas nécessaire pour cet objectif d’autoradio déjà associé ; NFC reste une piste distincte.

## Contraintes à respecter lors du développement

- Privilégier les périphériques déjà associés et une association volontaire véhicule ↔ périphérique, stockée localement et révocable. Ne pas scanner tous les appareils en permanence ni transférer un identifiant matériel par défaut dans la sauvegarde familiale JSON. Gestion explicite des conflits, suppression du lien et remplacement du carnet à concevoir.
- Demander les autorisations réellement nécessaires au bon moment, avec explication : Bluetooth pour les appareils associés selon la version Android, notifications si requises, localisation au démarrage GPS et service de premier plan. Ne pas demander d’accès permanent à la localisation par défaut. Toute permission refusée doit laisser utilisables le carnet et les trajets manuels.
- Les événements `ACTION_ACL_CONNECTED`/`DISCONNECTED` font partie des exceptions Android aux restrictions de récepteurs implicites, mais cela ne garantit pas leur livraison sur tous les véhicules/téléphones, après un arrêt forcé ou avec des restrictions d’économie d’énergie. Certaines chaînes Bluetooth/profils peuvent produire des coupures ou événements multiples ; dédoublonner et vérifier l’association.
- Un événement reçu en arrière-plan **ne doit pas lancer directement** un service GPS utilisant la permission « pendant l’utilisation » : Android 12+ limite les démarrages de services de premier plan et Android 14+ vérifie en plus les permissions de localisation au moment de la création. Ouvrir une interface visible après action de l’utilisateur et gérer proprement les refus. Si les notifications sont désactivées, une proposition en arrière-plan peut ne pas être visible.
- Le GPS peut être imprécis ou indisponible : immeubles, tunnel, météo, signal, qualité du téléphone et autorisation précise/approximative influencent vitesse et distance. La précision de vitesse **n’est pas garantie** et dépend notamment du signal et de l’appareil. La vitesse GPS n’est pas un instrument homologué ni un remplacement du compteur. Ne pas manipuler l’application en conduisant.
- Mesurer batterie, précision et interruptions ; gérer échantillons invalides, pertes de signal, reprise du processus, trajet concurrent et export/import. Aucun trajet ou point GPS ne doit être inventé. Aucune vitesse, durée, distance, autonomie ou absence de perte n’est garantie sans mesures réelles.

## État actuel et ordre de travail

En beta.26, **ni le Bluetooth automobile ni le GPS natif ne sont implémentés**. Les trajets manuels existent déjà. Poursuivre les véhicules et le carnet principaux, les statistiques et le GPS natif, puis l’assistance Bluetooth autoradio, avant de proposer l’essai en voiture. Les phases peuvent avancer alors que les contrôles matériels de la phase 1 restent ouverts ; la phase 1 ne sera pas déclarée stable pour autant.

La commande Windows indiquée par l’utilisateur, `.\gradlew :app:assembleDebug :app:testDebugUnitTest`, **construit l’APK et lance les tests JVM sur l’ordinateur** : elle n’exécute pas ces tests dans l’émulateur, même si celui-ci est ouvert. `:app:connectedDebugAndroidTest` est la famille de tests exécutée sur un appareil/émulateur connecté ; aucune nouvelle demande de test sur téléphone n’est faite pour l’instant.

Sources techniques : [permissions Bluetooth Android](https://developer.android.com/develop/connectivity/bluetooth/bt-permissions), [exceptions aux diffusions implicites](https://developer.android.com/develop/background-work/background-tasks/broadcasts/broadcast-exceptions), [restrictions des services au premier plan](https://developer.android.com/develop/background-work/services/fgs/restrictions-bg-start).
