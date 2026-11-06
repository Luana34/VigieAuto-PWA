# Où en est VigieAuto ?

**Actualisation du 5 novembre 2026 — PWA 1.5.2-beta.7 candidate / Android 0.4.0-beta.32 :** choix d’une devise par dépense dans la PWA, euro par défaut, anciens montants en euros et totaux séparés sans conversion. Android et les devises des pleins/entretiens restent à développer. **Une sauvegarde multidevise v4 ne peut pas être importée dans Android beta.32** ; une sauvegarde sans affectation reste en v3. Base PWA IndexedDB 5 ; sauvegarde externe avant essai. [Usage et limites](DEVISES-PWA-BETA7.md).

**Historique du 5 novembre 2026 — PWA 1.5.2-beta.6 candidate / Android 0.4.0-beta.31 :** la PWA permet de trier les dépenses du véhicule actif par date, catégorie ou montant ; ce tri est visuel et ne modifie pas les données. Ces tris existaient déjà sur Android, dont le code métier est inchangé. Devise réglable et liaison sans double comptage restent à développer. [Usage et limites](TRI-DEPENSES-BETA31.md).

**Historique du 5 novembre 2026 — PWA 1.5.2-beta.5 candidate / Android 0.4.0-beta.30 :** ajout, modification et retrait du kilométrage facultatif des dépenses dans la PWA, déjà disponibles sur Android ; ce champ ne change pas le compteur du véhicule. La beta.30 Android ne modifie pas le code métier. Devise réglable et liaison sans double comptage restent à développer. [Usage et limites](KILOMETRAGE-DEPENSES-BETA30.md).

**Historique du 5 novembre 2026 — Android 0.4.0-beta.29 et PWA 1.5.2-beta.4 candidate :** une photo facultative par dépense, à ajouter depuis la liste après enregistrement ; aperçu, remplacement et retrait explicites. Android convertit les nouvelles photos en JPEG sans EXIF ; la PWA garde le fichier et ses métadonnées éventuelles. Sauvegardes JSON non chiffrées. Room 15, IndexedDB 4 et JSON v3 inchangés. Devise réglable et liaison plein/dépense sans double comptage restent à faire. [Détails, limites et confidentialité](JUSTIFICATIFS-BETA29.md). [Contrôles et limites des essais](VALIDATION-BETA29.md).

**Historique du 5 novembre 2026 — Android 0.4.0-beta.28 et PWA 1.5.2-beta.3 candidate :** premier lot dépenses Android : liste par véhicule, tri, total, ajout, édition, suppression avec Undo, kilométrage facultatif sans changer le compteur. La PWA candidate reprend les catégories et avertissements ; Room 15 et JSON v3 restent inchangés. Aucun lien automatique avec un plein ni détection des doublons ; photo de justificatif et choix de devise restent à développer. Sauvegarder chaque appareil avant import ou essai. [Détails et limites](DEPENSES-BETA28.md).

**Vérifications beta.28 :** sous Linux, 592 tests JVM réussis, huit anciens ponts ignorés faute de fixtures, aucun échec ; APK debug construit, lint sans erreur et 61 scénarios instrumentés compilés mais non exécutés. Le nouveau pont dépenses a été vérifié sous Chromium et WebKit Linux, sans essai Windows, téléphone ou iPhone.

**Android beta.27 et PWA 1.5.2-beta.2 candidate — carnet enrichi :** lignes de pièces et total, catégories multiples avec sélecteur plein écran, sous-type libre et recherche Google Maps volontaire existent dans les deux préversions. JSON v3 et Room 15 restent inchangés. La PWA candidate utilise IndexedDB 4 : sauvegarde externe avant essai, sans retour direct à l’ancienne base. Les vérifications automatisées ne remplacent pas les essais Android réel ou Safari iOS. Voir [Android beta.27](CARNET-ANDROID-BETA27.md) et [PWA beta.2](CARNET-PWA-BETA2.md).

**Contrôles Android beta.27 :** suite JVM Linux 581 tests, **573 réussis et 8 ignorés** faute des anciennes fixtures, aucun échec ; 84 classes. Le nouveau parcours fictif Room → candidate PWA → Room → PWA a réussi séparément sous Chromium et WebKit Linux ; 7 tests Compose du formulaire ont réussi séparément. Aucun essai sur téléphone, émulateur, iPhone, Windows ou GitHub ni aucune mesure réelle de performances. Voir [CARNET-ANDROID-BETA27.md](CARNET-ANDROID-BETA27.md).

**Point au 5 novembre 2026 · Android 0.4.0-beta.32 · PWA familiale 1.5.1**

## La réponse courte

VigieAuto existe en deux applications distinctes : une application Android native en **bêta** et une PWA pour la famille, notamment sur iPhone. Elles fonctionnent localement et peuvent échanger un fichier JSON **manuellement** tant qu’il reste au format accepté par les deux versions ; le multidevise v4 n’est pas encore lisible sur Android. Elles ne se synchronisent pas. L’application reste gratuite, sans publicité, abonnement ni compte obligatoire.

Nous avançons maintenant sur les **fonctions principales sans attendre les essais sur téléphone**. Le socle Android reste toutefois en cours de validation : la version 0.4.0 n’est pas déclarée stable et aucun pourcentage ni délai n’est mesuré.

## Ce que l’on peut déjà faire sur Android

- Ajouter plusieurs véhicules, les sélectionner, modifier les principales informations et corriger le compteur. Les marques et modèles restent libres avec des suggestions hors ligne.
- **Nouveau en beta.26 :** choisir une photo du véhicule actif dans la galerie ou les fichiers, l’afficher, la remplacer ou la retirer après confirmation. La conversion est locale et bornée ; la photo précédente ne change pas en cas d’annulation ou d’échec. Pas de prise de vue directe ni d’annulation après remplacement/retrait. [Détails et limites](PHOTO-VEHICULE.md).
- Ajouter, modifier et supprimer les **entretiens, pleins/recharges, rappels et trajets manuels**. La dernière suppression du carnet peut être annulée sous les conditions d’[UNDO-CARNET.md](UNDO-CARNET.md).
- Consulter partiellement les contrôles qualité importés. Un écran dépenses permet liste, tri, total et saisie, ainsi qu’un justificatif photo ; la devise et la liaison restent à faire. Les symptômes et documents importés sont conservés et réexportables, mais leurs écrans Android complets restent à faire.
- Exporter un JSON, vérifier sa structure sans restaurer, puis importer après confirmation. **Importer remplace le carnet destinataire ; ce n’est pas une fusion.** Utiliser les thèmes Sauge ou Cyan.

Les rappels sont visibles dans l’application et utilisent des jours et/ou kilomètres. **Il n’y a pas encore de notification lorsque l’application est fermée.** Les propositions fondées sur les habitudes sont décidées, mais non implémentées.

## Ce que la PWA apporte

La PWA familiale 1.5.1 dispose déjà notamment des contrôles qualité, dépenses, symptômes, documents et statistiques. Son GPS est facultatif et dépend de la page visible ; un suivi continu écran éteint n’est pas garanti. L’installation et le stockage restent liés à l’adresse du site.

La **candidate 1.5.2-beta.7** reprend les corrections de précision et le carnet, permet un justificatif et une devise par dépense. Un export avec affectation de devise est en format 4 et ne peut pas encore être importé par Android beta.32. Les métadonnées de la photo PWA peuvent rester présentes. L’utilisateur indique avoir installé **beta.1** depuis GitHub Pages sur Android et importé sa sauvegarde sans perte constatée ; aucune vérification indépendante exhaustive n’est revendiquée et elle **n’a pas été validée sur iPhone**. La PWA 1.5.1 peut arrondir certains grands nombres ; conserver les sauvegardes originales. La base mise à niveau par la candidate ne se rouvre pas directement avec l’ancienne version. Voir [PRECISION-SAUVEGARDES.md](PRECISION-SAUVEGARDES.md).

## Vérifications de beta.26

Avant la correction EXIF : suite JVM complète **548 réussis et 8 ignorés**, lint zéro erreur/20 avertissements et 61 scénarios instrumentés compilés mais non exécutés. Après remplacement par AndroidX : APK debug compilé, **73/73 tests ciblés réussis** et pont photo fictif Android ↔ PWA stable et candidate vérifié sous Chromium. La suite complète et le lint n’ont pas été relancés après la correction ; la recompilation des instrumentés après correction n’est pas confirmée. Aucun essai Android beta.26 sur Windows, GitHub, émulateur ou téléphone.

Les tests simulés sur ordinateur ne remplacent ni les scénarios instrumentés Android ni les essais sur un téléphone. Le workflow GitHub n’a pas encore été lancé ; la variante R8 testée statiquement en beta.25 n’est pas une validation de beta.26. Les mesures de performance restent à réaliser.

## Suite retenue

1. Pour les nouveaux entretiens/pleins demandés (multi-pièces, catégories, cartes, sous-types), premier lot développé en **PWA beta.2 candidate et Android beta.27** ; les essais réels restent à faire. Continuer véhicules, carnet, contrôles et statistiques en conservant les données.
2. Développer le **GPS Android facultatif**, puis l’assistance Bluetooth de l’autoradio : connexion d’un appareil déjà associé → proposition de démarrer → confirmation → GPS du téléphone pour la vitesse, la distance et la durée → déconnexion → proposition d’arrêt et de sauvegarde. Aucun OBD n’est nécessaire. **Ce parcours n’est pas encore disponible** ; ses permissions, restrictions et recours manuel sont détaillés dans [BLUETOOTH-GPS-VOITURE.md](BLUETOOTH-GPS-VOITURE.md).
3. Vérifier ensuite les parcours sur émulateur et téléphone, dont l’essai en voiture, ainsi que la PWA candidate sur iPhone. Première exécution GitHub, R8, profils et mesures restent également ouverts.
4. Stations et prix des carburants : fonction documentée, **pas avant le socle 0.4.0 stable**. NFC et les autres extras restent distincts et facultatifs.

## Pour essayer sans prendre de risque inutile

1. Exporter et vérifier une sauvegarde JSON de chaque installation contenant des données ; garder une copie sûre hors du téléphone. Ces fichiers ne sont pas chiffrés par VigieAuto.
2. Ouvrir le dossier `VigieAuto` du ZIP dans Android Studio, en suivant `INSTALLER-ANDROID.md` dans le ZIP Android. La signature doit correspondre à l’installation déjà présente ; ne pas désinstaller ni vider les données pour forcer l’installation.
3. La commande `.\gradlew :app:assembleDebug :app:testDebugUnitTest` construit l’APK et lance les tests **sur le PC**, même si l’émulateur est ouvert. Les tests instrumentés sur l’émulateur ou un téléphone utilisent une autre tâche. Aucun essai sur téléphone n’est demandé pour l’instant.

Pour le détail complet des fonctions : [RECAPITULATIF-FONCTIONS.md](RECAPITULATIF-FONCTIONS.md). Pour les priorités : [PLAN-PRIORITES-APRES-BETA16.md](PLAN-PRIORITES-APRES-BETA16.md).
