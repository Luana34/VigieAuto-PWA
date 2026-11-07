# Où en est VigieAuto ?

**Actualisation du 7 novembre 2026 — Android 0.4.0-beta.43 / PWA 1.5.2-beta.12 :** aides locales ⓘ près du plein complet, du VIN et dans l’écran Pleins ; dialogue ciblé et panneau inférieur explicatif, sans modifier calculs, valeurs par défaut, données ni formats. Sur Android, le VIN se trouve dans la modification ; dans la PWA aussi à la création. Sauvegarde préalable recommandée ; validation sur appareils encore nécessaire. [Détails et limites](AIDES-PLEINS-VIN.md).

**Historique du 7 novembre 2026 — PWA 1.5.2-beta.11 / Android 0.4.0-beta.42 inchangé :** la case « Plein complet » et son libellé sont plus visibles ; la ligne entière est cliquable et un texte aide à reconnaître un plein partiel. La recharge électrique bénéficie du même confort. Un nouveau plein reste coché par défaut ; les données, les calculs et les sauvegardes ne changent pas. Essais logiciels sous Chromium et WebKit Linux ; aucun essai sur téléphone ou Safari iOS dans ce lot. [Détails](PLEIN-COMPLET-PWA-BETA11.md).

**Historique du 7 novembre 2026 — Android 0.4.0-beta.42 / PWA 1.5.2-beta.10 inchangée :** sélecteur en haut de l’accueil, véhicule actif indiqué et miniatures des lignes visibles avec chargement borné. La sélection ne modifie pas les photos ou données liées ; les identifiants longs sont relus sans ambiguïté. Room 17 et JSON inchangés. Partie de 2.3 seulement ; recherche approximative, priorités d’usage, vue combinée éventuelle et champs complémentaires restent à faire. Essais sur appareil et mesures nécessaires. [Guide](LISTE-VEHICULES.md).

**Historique du 7 novembre 2026 — Android 0.4.0-beta.41 / PWA candidate 1.5.2-beta.10 inchangée :** ajout de la prise de photo directe pour le véhicule actif, à côté de la galerie. La tentative n’écrase pas la photo en cas d’annulation ou d’échec ; remplacement confirmé sans Undo. Room 17 et formats JSON inchangés. Aperçus multivéhicules, émulateur, téléphone et Safari iOS restent à vérifier ou réaliser ; conserver une sauvegarde externe. [Guide et limites](PHOTO-VEHICULE.md).

**Historique du 7 novembre 2026 — Android 0.4.0-beta.40 / PWA candidate 1.5.2-beta.10 inchangée :** la phase 2.1 ajoute la suppression confirmée du véhicule actif, un récapitulatif complet et une annulation locale transactionnelle, avec photo, documents, devises et extensions. Room 17 et formats JSON inchangés. Le téléphone, l’émulateur et Safari iOS restent à valider ; une sauvegarde externe reste indispensable. [Mode d’emploi et limites](SUPPRESSION-VEHICULE-BETA40.md).

**Historique du 6 novembre 2026 — Android 0.4.0-beta.39 / PWA candidate 1.5.2-beta.10 :** pour Sauge et Cyan sombres, seul le fond général est remplacé par `#121212` ; les cartes, surfaces et accents actuels de chaque plateforme sont conservés, comme les deux modes clairs. Le mode suit toujours le téléphone ; le choix mixte automatique est préservé. Room 17, IndexedDB 6 et sauvegardes JSON v1–v5 sont inchangés. Sauvegarder avant essai ; aucun téléphone ni Safari iOS n’a été validé. [Détails et contrôles](FONDS-SOMBRES-BETA39.md).

**Historique du 6 novembre 2026 — Android 0.4.0-beta.38 / PWA candidate 1.5.2-beta.9 inchangée :** l’écran Pleins Android affiche la consommation du véhicule sélectionné entre pleins complets, partiels inclus : moyenne pondérée, dernier intervalle calculable et coût/km indicatif. Litres et kWh sont distincts ; le coût est masqué si les devises sont mélangées. Les lectures incomplètes, trop précises ou d’ordre ambigu ne produisent pas de résultat. Room 17 et JSON v1–v5 inchangés ; tableau de bord complet et liaison plein/dépense restent à développer. Sauvegarde externe avant essai ; aucun téléphone ni Safari iOS validé. [Usage et limites](CONSOMMATION-ANDROID-BETA38.md).

**Historique du 6 novembre 2026 — Android 0.4.0-beta.37 / PWA candidate 1.5.2-beta.9 inchangée :** les écrans Android Pleins et Entretien affichent maintenant, pour le véhicule sélectionné, leurs totaux séparés par devise, sans conversion et sans somme avec les dépenses. EUR reste la devise historique. Les coûts saisis deux fois ne sont pas détectés ; tableau de bord complet et consommation Android restent à développer. Room 17 et JSON v1–v5 inchangés. Sauvegarde externe avant essai ; aucun téléphone ni Safari iOS validé. [Usage et résultats](TOTAUX-ANDROID-BETA37.md).

**Historique du 6 novembre 2026 — Android 0.4.0-beta.36 / PWA candidate 1.5.2-beta.9 :** les deux versions conservent la devise de chaque dépense, plein/recharge et entretien, sans conversion ; anciennes opérations en EUR. Les formats v3, v4 et v5 sont échangeables entre ces deux préversions ; Android beta.35 refuse toujours v5. Android Room 17, PWA IndexedDB 6. Sur Android, les totaux séparés existent pour les dépenses seulement ; ceux des pleins et entretiens restent à développer. Aucun lien automatique plein/dépense. Sauvegarde externe avant essai ; appareil Android et Safari iOS non validés. [Guide et résultats](DEVISES-ANDROID-BETA36.md).

**Historique du 6 novembre 2026 — PWA candidate 1.5.2-beta.8 / Android 0.4.0-beta.35 :** la PWA conserve une devise par dépense, plein/recharge ou intervention ; anciens montants en EUR, totaux séparés sans conversion. Le coût énergétique au kilomètre est masqué si les intervalles mêlent les devises. Le fichier est en v3 sans affectation, v4 pour les seules dépenses, v5 si un plein ou entretien a une affectation. **Android beta.35 refuse v5** et ne prend pas encore en charge ces deux types de devise. IndexedDB 6 et Room 16. Sauvegarde externe obligatoire avant essai ; pas de validation sur iPhone ou téléphone Android. [Mode d’emploi et limites](DEVISES-OPERATIONS-BETA8.md) · [Frontière Android](DEVISES-ANDROID-BETA35.md).

**Historique du 6 novembre 2026 — Android 0.4.0-beta.34 / PWA candidate 1.5.2-beta.7 inchangée :** devise par dépense, euro par défaut, totaux séparés et aucune conversion. Android permet maintenant le choix, la modification, le justificatif, la suppression et l’Undo des dépenses à devise explicite ; le changement de devise existante demande confirmation. Conflits et extensions sont vérifiés ; Room 16 et JSON v3/v4 restent inchangés. Pleins et entretiens restent en euros, sans lien automatique plein/dépense. Sauvegarder avant essai. [Détails et limites](DEVISES-ANDROID-BETA34.md).

**Historique du 5 novembre 2026 — Android 0.4.0-beta.33 / PWA candidate 1.5.2-beta.7 inchangée :** Android lit et réexporte les sauvegardes multidevises v4, affiche les devises et des totaux séparés, sans conversion. Les anciennes dépenses sans affectation restent en euros. **Les dépenses avec affectation explicite sont en lecture seule sur Android** ; choix, modification, suppression et justificatif correspondant restent à traiter depuis la PWA, puis à porter sur Android. Pleins et entretiens restent en euros ; aucun lien plein/dépense. Sauvegarde externe avant essai. [Détails, tests et limites](DEVISES-ANDROID-BETA33.md).

**Historique du 5 novembre 2026 — PWA 1.5.2-beta.7 candidate / Android 0.4.0-beta.32 :** choix d’une devise par dépense dans la PWA, euro par défaut, anciens montants en euros et totaux séparés sans conversion. Android et les devises des pleins/entretiens restent à développer. **Une sauvegarde multidevise v4 ne peut pas être importée dans Android beta.32** ; une sauvegarde sans affectation reste en v3. Base PWA IndexedDB 5 ; sauvegarde externe avant essai. [Usage et limites](DEVISES-PWA-BETA7.md).

**Historique du 5 novembre 2026 — PWA 1.5.2-beta.6 candidate / Android 0.4.0-beta.31 :** la PWA permet de trier les dépenses du véhicule actif par date, catégorie ou montant ; ce tri est visuel et ne modifie pas les données. Ces tris existaient déjà sur Android, dont le code métier est inchangé. Devise réglable et liaison sans double comptage restent à développer. [Usage et limites](TRI-DEPENSES-BETA31.md).

**Historique du 5 novembre 2026 — PWA 1.5.2-beta.5 candidate / Android 0.4.0-beta.30 :** ajout, modification et retrait du kilométrage facultatif des dépenses dans la PWA, déjà disponibles sur Android ; ce champ ne change pas le compteur du véhicule. La beta.30 Android ne modifie pas le code métier. Devise réglable et liaison sans double comptage restent à développer. [Usage et limites](KILOMETRAGE-DEPENSES-BETA30.md).

**Historique du 5 novembre 2026 — Android 0.4.0-beta.29 et PWA 1.5.2-beta.4 candidate :** une photo facultative par dépense, à ajouter depuis la liste après enregistrement ; aperçu, remplacement et retrait explicites. Android convertit les nouvelles photos en JPEG sans EXIF ; la PWA garde le fichier et ses métadonnées éventuelles. Sauvegardes JSON non chiffrées. Room 15, IndexedDB 4 et JSON v3 inchangés. Devise réglable et liaison plein/dépense sans double comptage restent à faire. [Détails, limites et confidentialité](JUSTIFICATIFS-BETA29.md). [Contrôles et limites des essais](VALIDATION-BETA29.md).

**Historique du 5 novembre 2026 — Android 0.4.0-beta.28 et PWA 1.5.2-beta.3 candidate :** premier lot dépenses Android : liste par véhicule, tri, total, ajout, édition, suppression avec Undo, kilométrage facultatif sans changer le compteur. La PWA candidate reprend les catégories et avertissements ; Room 15 et JSON v3 restent inchangés. Aucun lien automatique avec un plein ni détection des doublons ; photo de justificatif et choix de devise restent à développer. Sauvegarder chaque appareil avant import ou essai. [Détails et limites](DEPENSES-BETA28.md).

**Vérifications beta.28 :** sous Linux, 592 tests JVM réussis, huit anciens ponts ignorés faute de fixtures, aucun échec ; APK debug construit, lint sans erreur et 61 scénarios instrumentés compilés mais non exécutés. Le nouveau pont dépenses a été vérifié sous Chromium et WebKit Linux, sans essai Windows, téléphone ou iPhone.

**Android beta.27 et PWA 1.5.2-beta.2 candidate — carnet enrichi :** lignes de pièces et total, catégories multiples avec sélecteur plein écran, sous-type libre et recherche Google Maps volontaire existent dans les deux préversions. JSON v3 et Room 15 restent inchangés. La PWA candidate utilise IndexedDB 4 : sauvegarde externe avant essai, sans retour direct à l’ancienne base. Les vérifications automatisées ne remplacent pas les essais Android réel ou Safari iOS. Voir [Android beta.27](CARNET-ANDROID-BETA27.md) et [PWA beta.2](CARNET-PWA-BETA2.md).

**Contrôles Android beta.27 :** suite JVM Linux 581 tests, **573 réussis et 8 ignorés** faute des anciennes fixtures, aucun échec ; 84 classes. Le nouveau parcours fictif Room → candidate PWA → Room → PWA a réussi séparément sous Chromium et WebKit Linux ; 7 tests Compose du formulaire ont réussi séparément. Aucun essai sur téléphone, émulateur, iPhone, Windows ou GitHub ni aucune mesure réelle de performances. Voir [CARNET-ANDROID-BETA27.md](CARNET-ANDROID-BETA27.md).

**Point au 7 novembre 2026 · Android 0.4.0-beta.43 · PWA familiale 1.5.1 / candidate 1.5.2-beta.12**

## La réponse courte

VigieAuto existe en deux applications distinctes : Android natif et PWA familiale, notamment sur iPhone. Elles fonctionnent localement et échangent manuellement des sauvegardes JSON v3/v4/v5 entre Android beta.43 et la PWA beta.12 ; pas de synchronisation. Les anciennes versions peuvent refuser les formats récents. L’application reste gratuite, sans publicité, abonnement ni compte obligatoire.

Nous avançons maintenant sur les **fonctions principales sans attendre les essais sur téléphone**. Le socle Android reste toutefois en cours de validation : la version 0.4.0 n’est pas déclarée stable et aucun pourcentage ni délai n’est mesuré.

## Ce que l’on peut déjà faire sur Android

- Ajouter plusieurs véhicules, les sélectionner, modifier les principales informations et corriger le compteur. Les marques et modèles restent libres avec des suggestions hors ligne.
- **Beta.42 :** choisir le véhicule en haut de l’accueil dans une liste avec miniatures des lignes visibles ; le choix est repris à la réouverture. [Détails et limites](LISTE-VEHICULES.md).
- **Depuis beta.40 :** suppression du véhicule actif après récapitulatif et seconde confirmation, avec export préalable et Undo transactionnel de ses données. [Détails](SUPPRESSION-VEHICULE-BETA40.md).
- **Depuis beta.26 :** choisir une photo du véhicule actif dans la galerie ou les fichiers, l’afficher, la remplacer ou la retirer après confirmation. La conversion est locale et bornée ; la photo précédente ne change pas en cas d’annulation ou d’échec. Depuis beta.41, la prise directe est aussi proposée ; pas d’annulation après remplacement/retrait. [Détails et limites](PHOTO-VEHICULE.md).
- Ajouter, modifier et supprimer les **entretiens, pleins/recharges, rappels et trajets manuels**. La dernière suppression du carnet peut être annulée sous les conditions d’[UNDO-CARNET.md](UNDO-CARNET.md).
- Consulter partiellement les contrôles qualité importés. Un écran dépenses permet liste et totaux séparés par devise ; les dépenses sont modifiables avec justificatif et Undo, y compris celles à devise explicite ; changer une devise ne convertit pas le montant. La liaison plein/dépense reste à faire. Les symptômes et documents importés sont conservés et réexportables, mais leurs écrans Android complets restent à faire.
- Exporter un JSON, vérifier sa structure sans restaurer, puis importer après confirmation. **Importer remplace le carnet destinataire ; ce n’est pas une fusion.** Utiliser les thèmes Sauge ou Cyan.

Les rappels sont visibles dans l’application et utilisent des jours et/ou kilomètres. **Il n’y a pas encore de notification lorsque l’application est fermée.** Les propositions fondées sur les habitudes sont décidées, mais non implémentées.

## Ce que la PWA apporte

La PWA familiale 1.5.1 dispose déjà notamment des contrôles qualité, dépenses, symptômes, documents et statistiques. Son GPS est facultatif et dépend de la page visible ; un suivi continu écran éteint n’est pas garanti. L’installation et le stockage restent liés à l’adresse du site.

La **candidate 1.5.2-beta.12** conserve les devises des dépenses, pleins et entretiens ; les exports v5 sont compatibles avec Android beta.43. Android affiche les totaux par devise et la consommation entre pleins complets ; le tableau de bord complet reste à développer. Aucun lien automatique plein/dépense. L’utilisatrice indique avoir essayé beta.1 sur Android sans perte constatée ; cela ne valide pas beta.12 ni l’iPhone. Sauvegardez séparément chaque appareil ; la PWA 1.5.1 peut arrondir certains grands nombres. [Détails](DEVISES-ANDROID-BETA36.md).

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
