# Où en est VigieAuto ?

**PWA 1.5.2-beta.2 candidate — carnet enrichi :** multi-pièces avec total, catégories multiples en plein écran, catégorie libre, sous-type de carburant et recherche Google Maps volontaire sont développés côté PWA ; Android beta.26 ne les propose pas encore. Le JSON v3 conserve les totaux historiques, avec extensions facultatives ; les scénarios testés et limites sont dans [CARNET-PWA-BETA2.md](CARNET-PWA-BETA2.md). IndexedDB passe à 4 : sauvegarde externe avant essai ; aucun retour direct sur la base par beta.1/1.5.1. Pas de validation iPhone ni d’échange Android beta.26 pour ces nouveautés.

**Point au 4 novembre 2026 · Android 0.4.0-beta.26 · PWA familiale 1.5.1**

## La réponse courte

VigieAuto existe en deux applications distinctes : une application Android native en **bêta** et une PWA pour la famille, notamment sur iPhone. Elles fonctionnent localement et peuvent échanger un fichier JSON **manuellement** ; elles ne se synchronisent pas. L’application reste gratuite, sans publicité, abonnement ni compte obligatoire.

Nous avançons maintenant sur les **fonctions principales sans attendre les essais sur téléphone**. Le socle Android reste toutefois en cours de validation : la version 0.4.0 n’est pas déclarée stable et aucun pourcentage ni délai n’est mesuré.

## Ce que l’on peut déjà faire sur Android

- Ajouter plusieurs véhicules, les sélectionner, modifier les principales informations et corriger le compteur. Les marques et modèles restent libres avec des suggestions hors ligne.
- **Nouveau en beta.26 :** choisir une photo du véhicule actif dans la galerie ou les fichiers, l’afficher, la remplacer ou la retirer après confirmation. La conversion est locale et bornée ; la photo précédente ne change pas en cas d’annulation ou d’échec. Pas de prise de vue directe ni d’annulation après remplacement/retrait. [Détails et limites](PHOTO-VEHICULE.md).
- Ajouter, modifier et supprimer les **entretiens, pleins/recharges, rappels et trajets manuels**. La dernière suppression du carnet peut être annulée sous les conditions d’[UNDO-CARNET.md](UNDO-CARNET.md).
- Consulter partiellement les contrôles qualité importés. Les dépenses, symptômes et documents importés sont conservés et réexportables, mais leurs écrans Android complets restent à faire.
- Exporter un JSON, vérifier sa structure sans restaurer, puis importer après confirmation. **Importer remplace le carnet destinataire ; ce n’est pas une fusion.** Utiliser les thèmes Sauge ou Cyan.

Les rappels sont visibles dans l’application et utilisent des jours et/ou kilomètres. **Il n’y a pas encore de notification lorsque l’application est fermée.** Les propositions fondées sur les habitudes sont décidées, mais non implémentées.

## Ce que la PWA apporte

La PWA familiale 1.5.1 dispose déjà notamment des contrôles qualité, dépenses, symptômes, documents et statistiques. Son GPS est facultatif et dépend de la page visible ; un suivi continu écran éteint n’est pas garanti. L’installation et le stockage restent liés à l’adresse du site.

La **candidate 1.5.2-beta.2** reprend les corrections de précision de beta.1 et ajoute les améliorations du carnet décrites ci-dessus. L’utilisateur indique avoir installé **beta.1** depuis GitHub Pages sur Android et importé sa sauvegarde sans perte constatée ; aucune vérification indépendante exhaustive n’est revendiquée et elle **n’a pas été validée sur iPhone**. La PWA 1.5.1 peut arrondir certains grands nombres ; conserver les sauvegardes originales. La base mise à niveau par la candidate ne se rouvre pas directement avec l’ancienne version. Voir [PRECISION-SAUVEGARDES.md](PRECISION-SAUVEGARDES.md).

## Vérifications de beta.26

Avant la correction EXIF : suite JVM complète **548 réussis et 8 ignorés**, lint zéro erreur/20 avertissements et 61 scénarios instrumentés compilés mais non exécutés. Après remplacement par AndroidX : APK debug compilé, **73/73 tests ciblés réussis** et pont photo fictif Android ↔ PWA stable et candidate vérifié sous Chromium. La suite complète et le lint n’ont pas été relancés après la correction ; la recompilation des instrumentés après correction n’est pas confirmée. Aucun essai Android beta.26 sur Windows, GitHub, émulateur ou téléphone.

Les tests simulés sur ordinateur ne remplacent ni les scénarios instrumentés Android ni les essais sur un téléphone. Le workflow GitHub n’a pas encore été lancé ; la variante R8 testée statiquement en beta.25 n’est pas une validation de beta.26. Les mesures de performance restent à réaliser.

## Suite retenue

1. Pour les nouveaux entretiens/pleins demandés (multi-pièces, catégories, cartes, sous-types), premier lot développé en **PWA beta.2 candidate**, puis à porter sur Android ; les essais réels et les échanges Android restent à faire. Continuer véhicules, carnet, contrôles et statistiques en conservant les données.
2. Développer le **GPS Android facultatif**, puis l’assistance Bluetooth de l’autoradio : connexion d’un appareil déjà associé → proposition de démarrer → confirmation → GPS du téléphone pour la vitesse, la distance et la durée → déconnexion → proposition d’arrêt et de sauvegarde. Aucun OBD n’est nécessaire. **Ce parcours n’est pas encore disponible** ; ses permissions, restrictions et recours manuel sont détaillés dans [BLUETOOTH-GPS-VOITURE.md](BLUETOOTH-GPS-VOITURE.md).
3. Vérifier ensuite les parcours sur émulateur et téléphone, dont l’essai en voiture, ainsi que la PWA candidate sur iPhone. Première exécution GitHub, R8, profils et mesures restent également ouverts.
4. Stations et prix des carburants : fonction documentée, **pas avant le socle 0.4.0 stable**. NFC et les autres extras restent distincts et facultatifs.

## Pour essayer sans prendre de risque inutile

1. Exporter et vérifier une sauvegarde JSON de chaque installation contenant des données ; garder une copie sûre hors du téléphone. Ces fichiers ne sont pas chiffrés par VigieAuto.
2. Ouvrir le dossier `VigieAuto` du ZIP dans Android Studio, en suivant `INSTALLER-ANDROID.md` dans le ZIP Android. La signature doit correspondre à l’installation déjà présente ; ne pas désinstaller ni vider les données pour forcer l’installation.
3. La commande `.\gradlew :app:assembleDebug :app:testDebugUnitTest` construit l’APK et lance les tests **sur le PC**, même si l’émulateur est ouvert. Les tests instrumentés sur l’émulateur ou un téléphone utilisent une autre tâche. Aucun essai sur téléphone n’est demandé pour l’instant.

Pour le détail complet des fonctions : [RECAPITULATIF-FONCTIONS.md](RECAPITULATIF-FONCTIONS.md). Pour les priorités : [PLAN-PRIORITES-APRES-BETA16.md](PLAN-PRIORITES-APRES-BETA16.md).
