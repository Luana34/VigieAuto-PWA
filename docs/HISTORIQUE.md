# Historique du projet VigieAuto

## 7 novembre 2026 — PWA beta.16 : début partiel de la fiche complémentaire

Dans « Infos véhicule », ajout facultatif de la couleur réelle, des informations d’assurance et de la date/prix d’achat avec devise explicite ; pas de conversion, dépense ou rappel. VIN, immatriculation et notes simples déjà présents ; pas de notes enrichies ni de nouvel écran Android. Le repère de couleur reste distinct. Validation des dates et du montant textuel exact, avertissements avant abandon/effacement/changement de devise, protection transactionnelle et conservation prudente des extensions. IndexedDB 6 et formats d’enveloppe JSON inchangés. [Guide](FICHE-VEHICULE-PWA-BETA16.md).

94 tests Node, 30 tests d’archive et 14 tests de publication réussis. Les nouveaux parcours, la migration réelle beta.15 → beta.16 et le hors-ligne sont vérifiés sous Chromium et WebKit Linux avec jeux fictifs. Un aller-retour fictif PWA beta.16 → dépôt Android beta.45/Room → PWA a conservé la fiche, une note modifiée par le dépôt Android et les nombres précis après édition et Undo ; le retour PWA a été vérifié sous Chromium et WebKit Linux. Ce test ne valide pas une interface ni un appareil Android réels. Les archives historiques beta.1, beta.6 et beta.7 ne sont pas fournies pour les branches d’échange qui les exigent ; les tests correspondants restent conservés. Aucun appareil, Safari iOS ou lecteur d’écran réel validé ; aucune performance mesurée. Le socle, 2.3 et 2.4 restent ouverts ; 2.5 doit être étudiée avant codage.

## 7 novembre 2026 — Android beta.45 : repères et diagnostic de tests Windows

Poursuite de la phase 2.3 : repères facultatifs compatibles avec la PWA beta.15, choix explicite, nom et pastille ; sauvegarde manuelle, sans migration Room. Les extensions et formats futurs restent conservés. Les échanges ne fusionnent jamais les carnets.

Le rapport Windows beta.44 transmis comporte 777 tests, 7 échecs et 8 ignorés. Cinq erreurs signalent FileProvider, deux l’ouverture SQLite sur disque. Une adaptation des séparateurs, limitée aux tests, et des dossiers de test courts sont proposées sans retirer de scénario ; la réussite sur le PC utilisateur reste à vérifier. [Guide](REPERES-VEHICULES-ANDROID-BETA45.md).

Vérifications : 110 tests JVM ciblés réussis sous Linux ; 10 scénarios caméra/Room rejoués avec adaptateur forcé, puis 10 réussis en JVM Windows 17 sous Wine (pas un vrai Windows). Un aller-retour fictif PWA → Android/Room → PWA a réussi sous Chromium et WebKit Linux. APK debug assemblé ; 69 tests instrumentés compilés mais non exécutés. Lint 0 erreur, 24 avertissements, 5 indications ; scripts 34 archive, 32 CI, 7 workflow, 22 R8. Suite JVM complète et appareils réels non testés ; cibles de performance non mesurées.


## 7 novembre 2026 — PWA beta.15 : repère de couleur par véhicule

À la demande de poursuivre la phase 2.3 sans attendre les essais sur téléphone, ajout dans la PWA d’un repère facultatif, choisi séparément de la fiche et de la couleur de carrosserie. Six couleurs et l’absence de repère sont proposées ; l’annulation ne change rien. Des noms accompagnent les pastilles sur le garage et l’accueil. Le véhicule ciblé est mis à jour avec contrôle transactionnel de son instantané ; la modification générale est désormais protégée contre le même risque. Les formats et champs inconnus sont préservés, les valeurs inconnues non modifiables. IndexedDB 6 et formats JSON v3/v4/v5 conservés ; Android beta.44 inchangé et sans affichage du repère. [Détails](REPERES-VEHICULES-PWA-BETA15.md).

Sous Linux : 85 tests Node, 29 tests d’archive et 14 tests de publication réussis. Sous Chromium et WebKit : choix et retrait du repère, quatre thèmes, sauvegarde v5, conflits, suppression, hors ligne et mise à jour réelle beta.14 → beta.15 avec données fictives. Aller-retour fictif PWA → Room Android beta.44 → PWA réussi : notes modifiées sous Android, suppression suivie d’Undo, extension et grand nombre préservés. Le premier contrôle tactile a révélé une priorité CSS insuffisante ; corrigée puis retestée. Une vérification ultérieure a aussi montré qu’un symptôme ou un contrôle ouvert dans une autre fenêtre pouvait réécrire un compteur avec une fiche périmée ; ces parcours vérifient maintenant les instantanés avant l’écriture. Les échanges historiques beta.1 et beta.6 n’ont pas été rejoués faute de ces ZIP. WebKit Linux ne valide pas Safari iPhone ; pas d’essai avec lecteur d’écran réel, sur appareil ou mesure de performance. La phase 2.3 reste ouverte pour Android et l’éventuelle vue combinée ; les champs 2.4 sont à vérifier et l’historique de compteur 2.5 à étudier avant codage.

## 7 novembre 2026 — PWA beta.14 : recherche approximative du catalogue

Poursuite de la phase 2.3 : la PWA propose certaines petites fautes dans les marques et modèles, par exemple `cio` pour Clio, et priorise les noms mémorisés à qualité égale. La liste est dessinée par l’application pour ne pas laisser le navigateur filtrer les résultats approchants. Choix explicite, saisie libre, modèles liés à la marque, limite de 80 propositions et « Autre… » conservés. Le référentiel partagé, les données, IndexedDB et les formats JSON ne changent pas. Android beta.44 reste inchangé. [Guide](RECHERCHE-CATALOGUE-PWA-BETA14.md).

Sous Linux, 78 tests Node, 28 tests d’archive et 14 de sélection à publier réussis. Tests de listes visibles avec clic, clavier et tap simulé, quatre thèmes à 320/390 px et hors ligne sous Chromium et WebKit. La vraie archive beta.13 a été mise à jour vers le site beta.14 avec mémoire des suggestions, plein partiel et export v5 fictifs intacts. Une autre simulation à partir de l’archive stable 1.5.1 a conservé véhicule, document, thème et trajets sous les deux moteurs ; une base familiale réelle ne doit pas être utilisée pour le premier essai. Dans le test de carnet, l’échange historique avec beta.1 est resté ignoré faute de ZIP ; la précision a été essayée avec une fixture PWA fictive, sans relancer le pont Android/Room. Pas de validation sur appareil réel, Safari iPhone ou VoiceOver et aucune mesure de performance. Après installation des dépendances système, les deux navigateurs ont été relancés avec succès ; les premiers lancements ne démarraient pas faute de bibliothèques dans cet environnement.

## 7 novembre 2026 — PWA beta.13 : dossier de publication simplifié

À la demande concernant les fichiers utiles sur GitHub et sur ordinateur, création automatique dans le ZIP source complet d’un dossier `A-METTRE-SUR-GITHUB` qui regroupe uniquement les 23 ressources de fonctionnement de la PWA. Les sources complètes, tests et documents sont conservés ailleurs dans le même ZIP. La publication est manuelle ; aucune sauvegarde personnelle, clé ou réglage local n’est ajouté. Le numéro, le cache et les références d’icônes évoluent ; fonctionnalités, calculs et données ne changent pas. [Guide](QUOI-PUBLIER-GITHUB.md).

Sous Linux : 64 tests Node, 14 tests de sélection du site et 27 tests d’archive réussis. La copie publique seule, en sous-dossier, la création d’un véhicule et l’export hors ligne, ainsi que la mise à jour de la vraie archive beta.12 vers beta.13 avec données fictives, export v5 et hors-ligne, ont réussi sous Chromium et WebKit. Catalogue, aides, thèmes, dépenses, justificatifs et carnet fictif ont aussi été essayés ; l’échange historique avec le ZIP beta.1 absent est resté ignoré. Les vérifications de précision ont réussi sur une fixture fictive issue de la PWA seule : le pont Android/Room n’a pas été relancé. Une première commande de précision sans ses deux arguments a échoué avant le test ; elle a ensuite été relancée avec une fixture explicitement PWA et un fichier de sortie. Aucun site GitHub, appareil réel ni Safari iOS n’a été validé ; aucune performance n’a été mesurée. La PWA ne bénéficie pas de la recherche approximative Android beta.44.

## 7 novembre 2026 — Android beta.44 : recherche du catalogue

Après le signalement des 56 minutes du lot précédent, poursuite par un lot Android ciblé : recherche locale approchante (`cio` peut proposer Clio) et priorité des marques/modèles mémorisés à qualité de correspondance égale. Le choix reste explicite et les modèles personnels restent liés à leur marque. Saisie libre, « Autre… », Room 17, sauvegarde JSON et référentiel partagé conservés. PWA beta.12 inchangée : recherche par texte inclus, sans ce classement. Pas de nouvelle donnée d’usage. [Guide](RECHERCHE-CATALOGUE-BETA44.md).

Sous Linux, 86 tests JVM ciblés ont réussi sans ignoré, dont 18 nouveaux ; suite complète non relancée. APK debug assemblé et 69 scénarios instrumentés compilés mais non exécutés ; lint : 0 erreur, 24 avertissements et 5 indications. Contrôles des scripts d’archive et de CI réussis ; aucun ancien fichier ou méthode de test JVM trouvé retiré. Aucun téléphone, émulateur, Windows ou GitHub validé ; aucune performance mesurée.

La phase 2.3 reste ouverte : avatars/couleurs et éventuelle vue combinée à étudier ; essais et mesures sur appareils nécessaires.

## 7 novembre 2026 — aides Pleins et VIN sur les deux versions

La personne utilisatrice a choisi des explications sur Android et la PWA, sans nouveau calcul. Android beta.43/code 47 et PWA beta.12 ajoutent un rappel, des boutons ⓘ ciblés et un panneau inférieur global sur l’écran Pleins ; les aides VIN restent facultatives. L’ouverture ne modifie pas la case ni le formulaire. Les règles de calcul, la valeur par défaut et les données restent inchangées. [Guide](AIDES-PLEINS-VIN.md).

Sous Linux : 82 tests JVM Android ciblés réussis, suite complète non relancée ; APK debug et 69 scénarios instrumentés compilés mais non exécutés ; lint 0 erreur, 24 avertissements, 5 indications. PWA : 64 tests Node et 22 tests d’archive ; aides et vraie mise à jour beta.11 → beta.12 vérifiées sous Chromium et WebKit Linux. Ni appareil réel, ni émulateur, Windows, GitHub ou Safari iOS validés ; aucune performance mesurée. Aucun ancien test retiré.

## 7 novembre 2026 — PWA 1.5.2-beta.11 : meilleure visibilité de « Plein complet »

Après la capture d’un ravitaillement partiel affiché comme complet, la personne utilisatrice demande une case plus grosse et un texte en gras. La PWA agrandit la case et sa zone de contact, met le libellé en gras et rappelle de décocher pour un plein partiel ; même présentation pour les recharges. La case d’un nouveau plein reste cochée par défaut et aucun plein existant n’est modifié. La quantité ne détermine pas à elle seule si le plein est complet. Les calculs, la base IndexedDB 6, les formats JSON et Android beta.42 restent inchangés. La personne a également signalé les 53 minutes de préparation du ZIP Android précédent ; ce lot PWA utilise des vérifications ciblées sans relancer de build Android.

Sous Linux : 64 tests Node et 21 tests d’archiveur ; formulaire et quatre thèmes vérifiés sous Chromium et WebKit Linux ; mise à jour de beta.10 vers beta.11 avec données fictives et export hors ligne sous les deux moteurs. Aucun essai de ce lot sur téléphone ni Safari iOS ; aucune mesure de performance. [Détails](PLEIN-COMPLET-PWA-BETA11.md).

## 7 novembre 2026 — Android 0.4.0-beta.42 : liste multivéhicules (partie de 2.3)

Sélecteur près du haut de l’accueil, véhicule actif, liste paresseuse et miniatures demandées pour les lignes visibles. Sélection sauvegardée sans modifier les photos ou données liées ; valeurs longues vérifiées sans confusion avec leur préfixe. Galerie, caméra, suppression et Undo conservés. Room 17, sauvegardes JSON et PWA inchangés. Recherche approximative, priorité aux choix utilisés, vue combinée éventuelle et champs complémentaires restent à traiter. [Guide](LISTE-VEHICULES.md).

Suite JVM Linux : **745 réussis, 8 ignorés** faute des anciennes fixtures de retour PWA, aucun échec ; APK debug et **69 scénarios instrumentés compilés mais non exécutés** ; lint : **0 erreur, 24 avertissements, 5 indications**. Aucun essai sur téléphone, émulateur, Windows ou GitHub ; aucune mesure de performance. Aucun avertissement CloseGuard reconnu dans ces rapports (détection non exhaustive).

**Dernière mise à jour : 7 novembre 2026 · PWA familiale 1.5.1, candidate 1.5.2-beta.12 · Android 0.4.0-beta.43**

Ce journal rassemble les demandes, les décisions, les réalisations, les corrections et les limites du projet. Il est tenu au fil des échanges : chaque évolution doit être ajoutée ici, sans effacer les décisions précédentes, et les changements de périmètre doivent être indiqués explicitement.

> **Reconstitution :** les premières étapes ci-dessous sont établies à partir du contexte conservé et des versions du projet. Les dates et la formulation exacte de toutes les anciennes demandes ne sont pas disponibles. Les éléments dont le statut est incertain sont marqués comme tels ; ce document n’invente pas de validation manquante.

## Phase 2.2 — prise de photo du véhicule Android

Après « Poursuis », beta.41/code 45 ajoute une prise de photo déléguée à une application du téléphone sans retirer la galerie. Remplacement confirmé, cible et empreinte conservées, refus des images invalides, nettoyage temporaire et contrôle des résultats tardifs ; aucun Undo après remplacement. Room 17, JSON et PWA sont inchangés. À cette étape, les aperçus simultanés de la liste sont reportés à la liste multivéhicules 2.3 afin d’en borner la mémoire ; ils sont ajoutés en beta.42. Les champs complémentaires 2.4 et l’étude préalable de l’historique du compteur 2.5 restent à faire. [Mode d’emploi et limites](PHOTO-VEHICULE.md).

sous Linux, suite JVM complète : **733 réussis, 8 ignorés** faute des huit anciennes fixtures de retour PWA, aucun échec. Pont photo fictif Android → PWA beta.10 → Room réussi séparément sous Chromium et WebKit Linux. APK debug assemblé et **68 scénarios instrumentés compilés mais non exécutés** ; lint : 0 erreur, 24 avertissements et 5 indications. La suite initiale a signalé un avertissement CloseGuard SQLite dans `BackupVerificationTest` ; la reprise ciblée de ses trois tests a réussi sans le reproduire. Cela ne prouve ni n’exclut une fuite sur appareil : à examiner. Aucun essai sur téléphone, émulateur, Windows, GitHub ou Safari iOS ; aucune mesure de performance.

## Phase 2.1 — suppression sécurisée du véhicule Android

La personne utilisatrice a demandé de poursuivre la phase 2 sans attendre les essais sur téléphone. Beta.40/code 44 ajoute une zone sensible dans la fiche, le décompte des données, l’export préalable, une seconde confirmation et l’Undo transactionnel complet. Les photos et documents sont stockés en blocs dans Room ; aucune suppression de fichier externe n’est supposée. Un choix récent d’un autre véhicule est conservé et les conflits sont signalés. Room 17 et les formats JSON restent inchangés ; la PWA n’est pas modifiée.

Suite JVM Linux : 723 tests au premier lancement, dont 714 réussis, huit ignorés faute de fixtures PWA et un échec d’environnement (jar Robolectric API 26 absent). Après téléchargement et vérification du jar, ce test a réussi séparément ; les rapports combinés comptent 715 réussis, huit ignorés et aucun échec, sur deux exécutions. APK debug et 66 scénarios instrumentés compilés ; instrumentés non exécutés. Lint : 0 erreur, 20 avertissements et 5 indications. Pont de suppression avec données fictives : Chromium et WebKit Linux réussis ; ni téléphone ni Safari iOS validés. [Détails](SUPPRESSION-VEHICULE-BETA40.md). À cette étape, phase 1 non déclarée stable ; prise de vue directe, liste enrichie, champs complémentaires et étude de l’historique du compteur restaient à faire. La nouvelle description des stations (saisie locale) diffère de l’ancienne option de prix externes : à clarifier avant modification du plan correspondant.

## Choix du fond sombre — Sauge et Cyan

Après deux maquettes comparatives, la personne utilisatrice a choisi les couleurs actuelles avec **le fond général sombre `#121212`**, partout. Android beta.39/code 43 et la PWA beta.10 appliquent ce fond à Sauge et Cyan ; chaque plateforme conserve ses cartes, accents et surfaces actuels, ainsi que les modes clairs. Mode système et choix automatique restent identiques. Room 17, IndexedDB 6 et JSON v1–v5 sont inchangés. Les deux maquettes n’avaient pas modifié l’application.

Sous Linux : 18 tests Android ciblés réussis, dont le thème Compose et la navigation ; 64 tests PWA, 20 tests d’archivage PWA et 83 tests Python Android réussis. APK debug et APK de tests instrumentés assemblés ; lint : 0 erreur, 20 avertissements et 5 indications ; instrumentés non exécutés. Les 13 rubriques, cartes et fonds Sauge/Cyan, les modes clair et automatique et le mobile ont été contrôlés sous Chromium et WebKit Linux. La vraie mise à jour PWA beta.9 → beta.10 a conservé des données fictives et permis leur export hors ligne sous les deux moteurs. La suite Android complète n’a pas été relancée.

Les validations Android Studio Windows, émulateur, téléphone et Safari iOS restent à faire ; aucune mesure de performance sur appareil. [Détails](FONDS-SOMBRES-BETA39.md).

## Historique — consommation Android entre pleins complets

Après « Poursuis », Android beta.38/code 42 relie à l’écran Pleins la lecture Room et le calcul de consommation du véhicule actif, partiels compris. Moyenne pondérée, dernier intervalle calculable et coût/km indicatif sont séparés en L et kWh ; devises mélangées : coût masqué sans conversion. Les données illisibles, trop précises ou d’ordre ambigu bloquent prudemment la carte. Room 17, JSON v1–v5 et PWA beta.9 restent inchangés. Liaison plein/dépense et tableau de bord complet restent à réaliser.

Sous Linux : 169 tests Android ciblés réussis, sept scénarios communs au moteur Kotlin et à la PWA, pont fictif v5 Chromium/WebKit et 59 tests PWA. Suite complète, appareil, émulateur, Windows et Safari iOS non validés ; aucune mesure de performance. [Détails](CONSOMMATION-ANDROID-BETA38.md).

## Historique — totaux Android des pleins et entretiens

Après « Poursuis », Android beta.37/code 41 affiche les totaux du véhicule actif, séparés par devise, sur les écrans Pleins et Entretien. Les entretiens additionnent pièces et main-d’œuvre ; les pleins incluent recharges, sans addition avec les dépenses et sans conversion. Les totaux deviennent indisponibles si les données nécessaires ne sont pas fiables et sont masqués pendant la mise en cohérence de la liste. Pas de liaison automatique ni de détection des doublons ; consommation et tableau de bord complet Android restent à faire. Room 17, JSON v1–v5 et PWA beta.9 inchangés.

Sous Linux : 140 tests Android ciblés distincts réussis en deux groupes ; pont fictif PWA beta.9 sous Chromium et WebKit, y compris contrôle des totaux après retour Room ; 59 tests unitaires PWA et 19 tests d’archive PWA. APK debug et instrumenté assemblés ; lint 0 erreur, 20 avertissements et 4 indications. 65 scénarios instrumentés déclarés mais non exécutés. Pas de suite complète finale ni essai sur Windows, GitHub, émulateur, téléphone ou Safari iOS ; aucune mesure de performance. [Détails](TOTAUX-ANDROID-BETA37.md).

## Historique — devises des pleins et entretiens sur Android

Après « Poursuis », Android beta.36/code 40 ajoute affichage, choix et modification de la devise des pleins et entretiens, ainsi que leur préservation dans la suppression/Undo. Les anciennes opérations restent en EUR, sans conversion ; le changement d’une devise existante demande confirmation. Room 16→17 et JSON v1–v5 ; les indices métier portent la devise avec le montant. La PWA beta.9 met à jour les messages et le cache sans modifier IndexedDB 6. Les données sont échangées manuellement ; v5 reste refusé par Android beta.35 et PWA beta.7. Pas de liaison automatique plein/dépense.

Sur le code final : 143 tests Android ciblés distincts réussis sous Linux ; pont fictif Android → PWA → Room → PWA sous Chromium et WebKit ; 59 tests PWA et mise à jour réelle beta.8→beta.9 hors ligne sur les deux moteurs. APK debug et instrumenté assemblés ; lint 0 erreur, 20 avertissements, 3 indications. 65 scénarios instrumentés déclarés, aucun exécuté. Pas de suite Android complète finale, ni d’essais Windows, GitHub, émulateur, téléphone ou Safari iOS, ni de mesures. Sur Android seuls les totaux de dépenses sont disponibles ; totaux pleins/entretiens et tableau de bord restent à faire. [Détails](DEVISES-ANDROID-BETA36.md).

## Historique — devises des pleins et interventions, PWA d’abord

Après « Poursuis », la PWA candidate beta.8 ajoute une devise par plein/recharge et intervention, en plus des dépenses : les anciennes opérations restent en euros, les montants et graphiques restent séparés, aucun taux n'est appliqué. Le coût par kilomètre et l'estimation des trajets sont masqués pour des intervalles multidevises. Édition confirmée sans conversion, 32 codes au maximum, affectations qualifiées par collection, contrôle d'onglet et cascade transactionnels.

La PWA migre IndexedDB de 5 à 6 et exporte en v5 dès qu'un plein ou entretien porte une affectation ; v3 et v4 restent possibles selon le contenu. L'ancienne PWA beta.7 et Android beta.35 refusent v5 au lieu de réétiqueter les montants. Un contrat empêche aussi une ancienne interface d’ouvrir le nouveau module de stockage si un cache mélange les versions. **Android ne sait pas encore porter les devises de pleins/entretiens** : beta.35 code 39 ajoute des tests de refus/rollback et des documents, sans changement métier ni migration Room.

Sous Linux, 59 tests PWA, les parcours Chromium et WebKit, et 25 tests Android ciblés réussissent ; le vrai export PWA v5 est refusé sans remplacement, y compris si le fichier est modifié après préparation, avec rollback Room. La suite Android complète, Windows, émulateurs, téléphones, Safari iOS et performances restent à vérifier. Voir [DEVISES-OPERATIONS-BETA8.md](DEVISES-OPERATIONS-BETA8.md) et [DEVISES-ANDROID-BETA35.md](DEVISES-ANDROID-BETA35.md).

## Poursuite — édition Android des dépenses multidevises

Après « Poursuis », la beta.34 ouvre le choix de devise, l’édition et le justificatif pour les dépenses importées, et conserve l’affectation et toutes ses extensions dans la suppression/Undo. Une confirmation explicite précise qu’aucune conversion n’est faite. Les totaux restent séparés ; les anciennes opérations implicites restent en EUR. La limite de 32 codes inclut l’euro et s’applique également à l’Undo.

Les vérifications couvrent les conflits sur dépense/affectation/génération du véhicule, y compris import identique, les extensions longues et les nombres exacts, un justificatif, une panne d’écriture, un Undo altéré, sa reprise après fermeture et une limite atteinte. Room 16, JSON v3/v4 et PWA beta.7 restent inchangés. Aucun lien automatique plein/dépense ni conversion des pleins/entretiens n’est inventé. [Détails](DEVISES-ANDROID-BETA34.md).

Sous Linux : 67 tests Android ciblés réussis en groupes, plus deux retours PWA réimportés ; 55 tests PWA ; APK debug 12 482 849 octets, code 38, min 26/cible 36 ; APK instrumenté assemblé, 63 scénarios déclarés non exécutés ; lint 0 erreur, 20 avertissements et 3 indications. Les tests ciblés et les échanges fictifs Android → PWA → Android réussissent sous Linux ; Chromium et WebKit Linux ne remplacent pas Safari iPhone, et Robolectric ne remplace pas un appareil. Les tests JVM ont tous été compilés ; la suite complète n’a pas été exécutée. Une première compilation non bornée a été interrompue après une forte pression mémoire ; la compilation complète des tests a ensuite réussi avec des limites mémoire et un processus neuf. Les essais Windows, émulateur, téléphone, GitHub et les mesures de performance ne sont pas revendiqués.

## Poursuite — premier pont Android multidevise

Après la demande « Poursuis » et l’alerte d’espace, les archives et sources ont été vérifiées ; un cache temporaire volumineux a été déplacé hors des fichiers sauvegardés. La beta.33 Android importe/réexporte le format v4 de la candidate, affiche les devises et sépare les totaux ; les anciennes opérations restent en euros. Room 15→16 ajoute des affectations typées sans transformer les données. Par précaution, les dépenses avec affectation sont en lecture seule sur Android jusqu’à l’adaptation du formulaire, des conflits et de l’Undo ; pleins, entretiens et lien anti-doublon restent à traiter. La PWA beta.7 ne change pas. [Détails et contrôles](DEVISES-ANDROID-BETA33.md).

Tests ciblés et migrations sur Linux, pont fictif Chromium/WebKit, APK debug et instrumenté assemblés, lint 0 erreur/20 avertissements/3 indications ; instrumentés non exécutés, suite complète non relancée. Aucun essai réel ni performance mesurée. Un lancement groupé de tests a été interrompu après dix minutes ; les classes concernées ont réussi séparément. La personne utilisatrice a demandé des livraisons plus rapides : aucune durée future ne peut être garantie.

## Poursuite — devise par opération, premier lot PWA

Le 5 novembre 2026, la personne utilisatrice a choisi de **conserver la devise de chaque opération** : anciens montants en euros, nouvelles devises au choix, totaux séparés sans conversion. La candidate PWA beta.7 applique cette décision aux dépenses ; pleins, entretiens et Android restent à compléter. Les affectations sont séparées des anciennes extensions inconnues ; format de sauvegarde 4 dès qu’une affectation existe. Android beta.32 refuse le v4 sans remplacer ses données ; échange multidevise non disponible dans ce lot. PWA : IndexedDB 4→5 ; sauvegarde externe préalable. Voir [DEVISES-PWA-BETA7.md](DEVISES-PWA-BETA7.md).

Sous Linux : 55/55 tests unitaires PWA, tests de devises et anciens formats sous Chromium/WebKit, un test Room ciblé prouvant le refus d’un vrai export v4 sans remplacement. Code métier Android inchangé. Les tests physiques et mesures réelles restent à faire.

## Poursuite — tri des dépenses PWA

À la demande « Poursuis », ajout dans la candidate PWA d’un tri visuel par date, catégorie ou montant, déjà présent sur Android. Le dernier choix reste dans l’onglet pour la session, sans toucher aux enregistrements ; la carte de dernière dépense reste fondée sur la date. Les catégories futures et les justificatifs restent conservés. Android beta.31 ne change pas le code métier. Le lot reste volontairement ciblé pour éviter les longues attentes signalées. [Détails](TRI-DEPENSES-BETA31.md). La devise et la liaison plein/dépense restent à développer. Sous Linux : 50/50 tests unitaires PWA, scénarios de tri et migration sous Chromium/WebKit, APK Android debug assemblé. Les tests Android n’ont pas été relancés pour beta.31 ; code et tests comparés identiques à beta.30.

## Poursuite — kilométrage des dépenses et accélération

L’utilisatrice demande de poursuivre et rappelle que le lot précédent a encore pris 47 minutes. Décision : livrer un lot plus petit, regrouper les changements et les tests ciblés, sans suppression des contrôles de sauvegarde ni d’audit des ZIP. Aucun temps futur n’est garanti.

La PWA candidate beta.5 ajoute l’édition facultative du kilométrage d’une dépense, déjà disponible sur Android depuis beta.28. Le compteur du véhicule n’est pas modifié ; les formats inconnus ou trop précis restent intacts. Android beta.30 ne modifie pas le code métier et inclut la documentation et le scénario d’échange actualisés. [Détails](KILOMETRAGE-DEPENSES-BETA30.md). Devise et lien plein/dépense restent à développer. Les tests ciblés Linux comprennent 13/13 scénarios Android, 49/49 unitaires PWA et le pont complet fictif sous Chromium/WebKit ; APK debug assemblé. Suite complète, lint et instrumentés non relancés dans ce lot.

## Poursuite — justificatifs photo de dépenses

À la demande « Poursuis », la PWA candidate puis Android ajoutent un justificatif photo facultatif par dépense. Le parcours, les formats, les limites de taille et les différences de métadonnées sont détaillés dans [JUSTIFICATIFS-BETA29.md](JUSTIFICATIFS-BETA29.md). Les contrôles de conflit sont étendus aux écritures PWA de dépenses ; une version future inconnue est conservée sans modification. Une suppression Android avec Undo restaure également le justificatif, mais remplacer ou retirer uniquement la photo ne se défait pas. Aucune devise réglable ni liaison plein/dépense n’est déclarée réalisée.


**Contrôles beta.29 / PWA beta.4 :** 112/112 tests Android ciblés et 47/47 tests unitaires PWA réussis sous Linux ; pont fictif Room ↔ PWA sous Chromium et WebKit Linux, y compris photo EXIF fictive et données futures. APK debug assemblé ; 61 instrumentés compilés mais non exécutés. La suite JVM complète beta.29, Windows, émulateur, téléphone et Safari iOS n’ont pas été testés. [Résultats et limites](VALIDATION-BETA29.md).

## Poursuite — premier lot dépenses Android et compatibilité PWA

L’utilisatrice rappelle que des délais de 45 minutes à 1 h 20 à chaque évolution lui paraissent trop longs ; elle souhaite conserver le sérieux tout en accélérant. Méthode retenue : regrouper les modifications avant compilation, exécuter d’abord les tests ciblés selon le risque, éviter les répétitions et réserver les suites complètes aux changements sensibles ou aux jalons. Les tests de sauvegarde et le contrôle indépendant des archives restent maintenus. Aucun gain ni durée Windows ne sont promis sans mesure ; les tests réussis ne prouvent pas l’absence totale d’erreurs.

À « Poursuis », développement du premier lot dépenses Android et adaptation des catégories de la PWA candidate beta.3. La liste est filtrée par véhicule ; tri, total, création, modification, suppression avec Undo et kilométrage facultatif sans effet sur le compteur sont disponibles. Les catégories et extensions inconnues des jeux testés restent conservées, ainsi que les catégories absentes/nulles. Une panne de lecture n’est pas présentée comme une liste vide.

Aucun plein ou entretien ne crée automatiquement de dépense ; les saisies distinctes peuvent être comptées deux fois dans les statistiques PWA. Des avertissements le précisent. Liaison compatible sans double comptage après modifications et échanges, justificatifs photo et devise réglable restent à faire. JSON v3, Room 15 et IndexedDB 4 inchangés. [Détails](DEPENSES-BETA28.md).

Suite JVM Linux : 600 tests, 592 réussis, huit anciens retours de pont ignorés faute de fixtures, aucun échec. Pont dépenses fictif Room ↔ PWA vérifié sous Chromium et WebKit Linux ; PWA : 41 tests unitaires réussis. Pas de test sur téléphone, émulateur, Windows ou Safari iOS.

La suite complète contient 88 classes et a demandé 9 min 54 s dans cet environnement Linux, hors compilation initiale et téléchargements ; ce temps ne prédit pas Windows. Deux messages Robolectric de décodeur d’image non implémenté ont été émis sans échec. Aucun marqueur CloseGuard connu n’a été détecté, sans prouver l’absence de fuite. Les migrations de la PWA 1.5.1 et beta.2 vers beta.3 ont été testées sous les deux moteurs ; les scénarios carnet ont ignoré un ancien échange, faute du ZIP beta.1.

L’APK debug local a été assemblé : 12 433 697 octets, SHA-256 `09ac11c2d85849dbd26c3b7c9aa7ebfe7b8e2e99ead4adef536c00595e9ceca6`, identifiant `com.vigieauto.app`, code 32, min 26/target 36. Seule la permission interne du récepteur figure dans cet APK. Une bibliothèque graphique a été empaquetée sans réduction de ses symboles. Ce n’est pas une release signée ni une validation des performances. Les 61 scénarios instrumentés sont compilés, non exécutés. Lint debug : zéro erreur, 20 avertissements et deux indications.

Un premier lancement ciblé a révélé trois erreurs dans les scénarios de test : une méthode de fixture JUnit ne retournait pas `void`, une assertion vérifiait tout le texte au lieu d’un fragment, et le titre de l’accueil était hors de la zone visible après retour. Ces tests ont été corrigés puis les trois classes relancées avec succès (20 tests) ; les six tests Room de la classe bloquée ont alors réellement été exécutés. Ces erreurs ne prouvent pas une validation physique.

## Premières étapes — demande initiale et première application

### Demandes et contraintes

- Créer une application française de suivi automobile, d’abord appelée **CQ Auto**, dans l’esprit de Drivvo mais améliorée et simple à utiliser sur téléphone.
- L’application doit être gratuite, sans publicité ni abonnement, sans compte obligatoire, utilisable hors ligne après installation et avec des données enregistrées localement sur l’appareil.
- Gérer plusieurs véhicules, les entretiens, les pleins et la consommation, les dépenses et statistiques, les rappels, des listes de contrôles qualité personnalisables, des symptômes, des documents et l’export/import des données.
- Pour la base initiale : pas de suivi GPS ni de connexion OBD, pas de synchronisation cloud obligatoire. Un module de trajets facultatif avec GPS et une sauvegarde cloud personnelle ont ensuite été proposés : voir plus loin.
- Préférence pour une PWA en HTML/CSS/JavaScript, IndexedDB, manifest et service worker ; l’architecture exacte reste un moyen, pas une obligation intangible. L’utilisateur possède Android Studio et utilise Android.

### Réalisé

- Création d’une première PWA autonome avec des données locales, un mode découverte fictif, les principaux formulaires, une navigation responsive, des documents locaux, l’export JSON et la restauration après confirmation.
- Mise en place des calculs de consommation entre pleins complets avec prise en compte des pleins partiels, des échéances et des dépenses ; six listes de contrôle qualité initiales sont proposées.
- Mise en cache pour le hors-ligne, documentation et premiers tests. Le projet de départ utilisait notamment le cache applicatif `v1.0.1`.
- Clarifications de fiabilité : les rappels sont visibles dans l’application, sans promesse de notification planifiée application fermée ; la perte du téléphone ou l’effacement du navigateur peut supprimer les données ; l’export n’est pas chiffré.

### Corrections et limites identifiées

- Un calcul de consommation ne doit pas ignorer les pleins partiels, diviser par zéro ou mélanger litres et kWh. Les intervalles incohérents sont écartés.
- L’installation PWA durable requiert une origine adaptée, généralement HTTPS ; ouvrir un fichier local ou une adresse HTTP réseau n’offre pas les mêmes garanties. Les données locales sont liées à l’origine et au navigateur.
- L’application enregistre des symptômes, mais ne remplace pas un diagnostic mécanique.

## Étude visuelle et choix des thèmes

### Demandes et retours

- L’utilisateur a d’abord souhaité voir l’interface existante, puis explorer d’autres propositions et leurs onglets.
- La proposition **1 a été rejetée**. La présentation de la **2** plaisait, mais pas ses couleurs ; les couleurs des **3 et 4** plaisaient davantage.
- Les adaptations **2A Sauge** et **2B Cyan** ont plu, notamment la carte véhicule sombre de Cyan.
- L’utilisateur a demandé un accueil actionnable et contrasté, l’accès direct aux contrôles qualité **CQ** et un bouton **+** central pour les actions rapides.

### CQ Auto 1.1.1 — réalisé

- Intégration des palettes Sauge et Cyan, d’un accueil Garage, d’un sélecteur de thème, du bouton d’ajout rapide et d’une navigation mobile donnant accès aux autres rubriques.
- Préférence de thème persistée localement, y compris en mode découverte ; export/import de la préférence avec les données réelles.
- Compatibilité des anciennes sauvegardes et conservation des données lors d’une mise à jour testée sur une même origine.
- Correction d’un débordement d’interface à 320 pixels, de libellés tronqués et de plusieurs contrastes ou états ambigus. Tests de navigation, de formulaires, de sauvegarde et de hors-ligne.

### CQ Auto 1.2.0 — demande et réalisation

- Demande explicite : **Sauge doit avoir ses versions claire et sombre, et Cyan aussi, chacune suivant le mode du téléphone.**
- Ajout de Sauge sombre et du passage clair/sombre en direct pour chaque palette. L’ancien comportement a été conservé sous **Automatique (mixte)** : Sauge clair, Cyan sombre.
- Conservation des préférences, prise en charge des anciennes sauvegardes et mise à jour du cache du service worker. Tests des quatre variantes et de la migration depuis 1.1.1 sur la même origine.

## Proposition de suivi des trajets et de sauvegardes

### Demandes et idées présentées

- Module Trajets **facultatif**, lié au véhicule, avec saisie manuelle et rattrapage après coup ; proposition d’un démarrage par Bluetooth, NFC ou bouton manuel.
- GPS et éventuellement accéléromètre pour distance, durée et répartition indicative du type de trajet ; historique, filtres, trajets récurrents, notes facultatives et estimation du coût énergétique.
- Idées de score éco, d’aide à l’analyse de consommation, de rappel de sauvegarde après environ 30 jours, de PDF d’entretien et de sauvegarde automatique dans un dossier ou un cloud personnel.
- Vie privée : stockage local, permissions adaptées, export et suppression ; le suivi et toute option cloud doivent rester facultatifs.

### Points techniques et choix ouverts

- La PWA ne garantit pas un suivi GPS continu ni une détection universelle de l’autoradio en arrière-plan. Web NFC a des contraintes de visibilité, de matériel et de déverrouillage ; le Bluetooth/NFC automatique demandé n’est pas réalisé.
- La sauvegarde automatique dans Google Drive ou un dossier lié n’est pas réalisée. Toute option cloud doit être séparée et explicitement autorisée ; une copie locale seule ne protège pas contre la perte du téléphone.
- Le GPS ne mesure ni la santé de l’EGR ou des injecteurs, ni la consommation exacte d’un trajet. Aucun régime moteur universel de « décrassage » ne doit être prescrit.
- **Score éco : non arbitré et non implémenté.** Les questions de fréquence des demandes à l’arrivée, de conservation d’une trace GPS et de priorités techniques restent ouvertes.
- Les détails et sources utiles à l’étude restent dans `docs/plan-trajets.md`.

## VigieAuto 1.3.1 — nom, logo, navigation et premiers trajets

### Demandes et décisions

- L’utilisateur propose puis valide le nom **VigieAuto** et fournit une image : bouclier, profil de voiture et coche sur dégradé bleu-vert.
- L’image fournie est destinée à l’icône PWA ; dans l’application, le dessin doit suivre la couleur Sauge ou Cyan. Android peut adapter la forme affichée de l’icône.
- La navigation demandée comporte cinq onglets : **Accueil, Entretien, Pleins, Trajets, Réglages**. Les accès **CQ** et **+** ont été conservés respectivement en haut de l’écran et au centre au-dessus de la barre mobile.
- L’utilisateur demande ce qu’il doit faire du ZIP et rappelle son souhait d’une PWA gratuite et hors ligne.

### Réalisé

- Renommage visible de CQ Auto en VigieAuto ; l’image originale est conservée dans `assets/logo-original.png`, l’icône 512 est cette image redimensionnée, et un tracé SVG fidèle suit les variables du thème dans l’interface. Une variante compatible avec le masquage Android a été préparée.
- Ajout de l’onglet **Trajets manuels** : chronomètre démarré/terminé par l’utilisateur, saisie d’un trajet passé, distance, durée, notes et type déclaré, historique par véhicule et filtre.
- Les types « trafic haché », « roulant » et « croisière » sont **déclaratifs**, pas un diagnostic ou une détection automatique. Un coût énergétique indicatif est calculé à partir des intervalles de pleins valides ; il ne mesure pas le coût réel d’un trajet.
- Conservation du nom interne de l’ancienne base, migration IndexedDB vers la version 2 avec collection `trips`, sauvegarde VigieAuto au format 2 et import des sauvegardes CQ Auto au format 1.
- Ajout du guide `INSTALLER.md` : le ZIP est le code source, pas un APK ; un hébergement HTTPS est nécessaire pour une installation PWA durable.
- Tests des calculs, des thèmes, de la navigation, des trajets, de plusieurs véhicules, des sauvegardes, de la suppression, du hors-ligne et de la migration CQ Auto → VigieAuto sur une même origine. Aucune installation sur le téléphone réel de l’utilisateur n’est revendiquée.

### Non réalisé à ce stade

- GPS, déclenchement Bluetooth/NFC, sauvegarde automatique/Drive, notifications en arrière-plan et score éco. Ils ne doivent pas être présentés comme déjà disponibles.

## 31 octobre 2026 — organisation, documentation et nettoyage

### Nouvelle demande

- Tenir dans la durée un **historique complet**, un **cahier des charges** et une **feuille de route** couvrant les demandes, les ajouts, les améliorations et les corrections.
- Supprimer du workspace les éléments devenus inutiles, notamment les anciennes propositions de design, tout en conservant le dossier de code et **les trois derniers ZIP**.
- Le dossier `cq-auto` peut être conservé ou renommé : il est conservé pour ne pas casser les liens et l’aperçu existants ; le produit s’appelle VigieAuto.

### Réalisation — VigieAuto 1.3.2

- Création de ce journal, de `docs/CAHIER-DES-CHARGES.md` et de `docs/FEUILLE-DE-ROUTE.md` ; les trois documents sont inclus dans l’archive.
- Version 1.3.2 consacrée à la documentation et au nettoyage, sans nouvelle fonction métier. La version du cache est mise à jour pour une diffusion cohérente.
- Suppression des anciens comparateurs, galeries et captures de design devenus redondants, ainsi que des doublons d’archives. Le logo original reste conservé dans le projet.
- Politique retenue : conserver les **trois archives versionnées de versions distinctes** les plus récentes, sans multiplier les copies génériques identiques. Après cette mise à jour : VigieAuto 1.3.2, VigieAuto 1.3.1 et CQ Auto 1.2.0.
- Ajout du script `scripts/creer-archive.py` pour les futures livraisons : simulation possible, contrôle de version et vérification du ZIP avant nettoyage des anciennes archives du projet ; préservation des ZIP personnels et des conflits non identiques.
- Tests sur cette version : 9 tests de calcul, suites navigateur d’interface et trajets, 8 tests isolés de l’outil d’archivage ; migration depuis la véritable archive 1.3.1 avec véhicule, trajet et chronomètre en cours, puis hors-ligne. Les tests sur le téléphone physique restent à faire.

## 31 octobre 2026 — installation indiquée, puis trajets GPS

### Demande / décision

- L’utilisateur indique avoir effectué la publication/installation Android et souhaite passer directement au code pour améliorer les trajets : GPS facultatif d’abord, puis étude des déclenchements Bluetooth ou NFC. Les limites de l’exécution d’une PWA en arrière-plan sont reconnues. L’adresse exacte et le détail des essais réalisés sur son appareil n’ont pas été communiqués.
- Première approche choisie pour protéger la vie privée : conserver un résumé de distance, pas de trace des coordonnées. Ce choix peut être révisé avec l’utilisateur ; il ne vaut pas validation d’une conservation future de positions précises.

### Réalisé — VigieAuto 1.4.0

- Ajout d’un démarrage **Avec GPS** à côté du chrono manuel, après explications et choix explicite ; autorisation du navigateur requise. Estimation locale, pause, reprise, distance vérifiable/corrigeable à l’arrivée et signalement des interruptions détectées.
- Les positions GPS servent uniquement au calcul en mémoire ; aucune coordonnée ni trace n’est enregistrée automatiquement par l’application. Un résumé, les champs saisis par l’utilisateur et les indicateurs d’interruption restent sur l’appareil et dans les exports.
- Le suivi est suspendu quand la page est masquée ; reprise possible au retour visible dans la même session après une position, mais reprise manuelle après réouverture/rechargement/import. Les points séparés par une coupure détectée ne sont pas reliés. Le suivi écran éteint/app fermée reste non garanti et la distance reste indicative.
- Export JSON au format 3 avec import des formats précédents 1 et 2 ; schéma IndexedDB toujours en version 2. Tests de la mise à jour depuis le ZIP 1.3.2 sur la même origine et en sous-dossier, avec véhicule, document, thème, historique et chronomètre conservés.
- Protection supplémentaire des écritures : démarrage transactionnel d’un seul trajet, mise à jour GPS conditionnelle, verrou entre fenêtres lorsque Web Locks est disponible et suppression du véhicule en cascade dans une transaction. Il reste conseillé d’utiliser une seule fenêtre pendant le suivi.
- Numéro de version affiché dans Réglages pour vérifier une publication. Documentation, cahier des charges et feuille de route mis à jour ; script d’archive complété pour contrôler cette version affichée et le module GPS.
- Tests automatisés : calculs GPS et métier, interface, saisie manuelle, permissions et positions GPS simulées, coupures, import/export, sous-dossier, hors-ligne, concurrence et tests isolés de l’archivage. Une permission et une position émulées ont aussi été exercées via l’API Geolocation réelle de Chromium. Aucun test GPS physique ni publication de 1.4.0 sur le site de l’utilisateur n’est revendiqué.

### En attente / limites

- Après sauvegarde, l’utilisateur doit publier la nouvelle version au **même emplacement HTTPS**, rouvrir l’app en ligne, vérifier « version 1.4.0 » et tester le GPS sur son Android en sécurité. Les détails figurent dans `INSTALLER.md`.
- NFC et Bluetooth ont été étudiés mais ne sont pas implémentés : NFC nécessite notamment une page visible, du matériel et un badge compatibles ; Web Bluetooth vise les périphériques BLE et ne garantit pas une détection silencieuse d’autoradio classique. Une partie Android native/hybride demanderait une validation séparée. Voir `plan-trajets.md`.
- Sauvegarde automatique/Drive, score éco et autres évolutions prévues restent en attente. La localisation système peut dépendre de fournisseurs et de réglages extérieurs à l’application.
- Livraison et rangement : archive 1.4.0 vérifiée ; trois ZIP versionnés conservés : 1.4.0, 1.3.2 et 1.3.1 ; les captures et fichiers temporaires sont retirés après les tests.

## 31 octobre 2026 — question d’une version Android native

### Demande et contexte

- L’utilisateur demande pourquoi VigieAuto est une PWA et si elle peut être développée dans un format comparable à ses autres applications : Santé décrite en Kotlin/Jetpack Compose, et LIFTQ décrite en Flutter/Dart. Ces deux projets sont cités à titre de référence ; leurs sources n’ont pas été examinées dans cet espace.
- Son message comprend une proposition d’architecture et un choix à faire entre Kotlin/Compose, Flutter et le maintien de la PWA. Il ne précise pas encore une option définitivement retenue, ni le périmètre du premier lot, ni l’identifiant de package.
- Les exigences existantes demeurent : application gratuite, sans publicité ni compte obligatoire, hors ligne, données locales, trajets manuels et GPS facultatifs, pas de conservation de trace par défaut, et sauvegarde personnelle facultative. Bluetooth/NFC restent souhaités mais doivent respecter les contraintes Android et le consentement.

### Étude et sécurité des données

- Kotlin/Compose est une piste adaptée à une priorité Android et au modèle Santé ; Flutter peut aussi accéder aux API Android via des plugins ou du code natif et convient mieux si un objectif multiplateforme est retenu. Le choix ne doit pas être supposé.
- Une application native est distincte de la PWA : elle ne récupère pas directement la base IndexedDB du navigateur. Prévoir une migration par export JSON, prenant en compte les formats existants et les photos/documents, avec validation et tests. Conserver la PWA et une copie externe jusqu’à vérification de la migration.
- GPS via service de premier plan, Bluetooth et NFC restent soumis aux permissions et aux restrictions d’Android ; aucune détection universelle silencieuse ni notification d’alarme exacte systématique n’est garantie. Les sources et détails seront à documenter lors du choix d’architecture.
- L’adresse publique copiée dans le message renvoie un HTTP 404 depuis notre accès au moment du contrôle ; cela ne permet pas de connaître l’état du cache ou des données sur le téléphone. L’adresse effective et l’état de publication restent à confirmer ; ne pas désinstaller l’application ni effacer son stockage sans sauvegarde vérifiée.

### État

- Étude et mise à jour des documents de suivi uniquement ; aucun socle Android, APK, migration ni nouveau ZIP ne sont encore réalisés. Le code et les trois archives précédentes sont conservés. La documentation de travail évolue après la livraison 1.4.0 et sera incluse dans le prochain ZIP de livraison.

## 31 octobre 2026 — décision Android natif + PWA iPhone, lot A 0.1.0

### Demande et décision

- L’utilisateur choisit **Kotlin/Jetpack Compose + Room pour Android**, et le maintien de la **PWA pour l’iPhone** de ses proches. Il ne dispose ni d’un Mac ni d’un compte développeur Apple payant et ne veut pas de serveur obligatoire. Les appareils échangeront des exports JSON manuels, pas une base automatiquement partagée.
- Commencer par le **lot A** : structure Android, navigation, accueil, modèles de stockage et format commun. Prévoir ensuite le lot B (véhicules, entretien, rappels, pleins, trajets manuels), le lot C (GPS natif facultatif avec notification et Bluetooth assisté), puis la stabilisation/installation iPhone. NFC reste une piste, pas une fonction promise.
- Conserver la gratuité, le fonctionnement local, le français, les thèmes Sauge/Cyan suivant l’apparence du téléphone, le logo choisi, l’accès CQ et le bouton central `+`. L’identifiant de package n’a pas été décidé : **`com.vigieauto.app` est provisoire**.

### Réalisé et corrigé

- Projet source `VigieAuto-Android` séparé : Gradle Wrapper, Kotlin, Compose/Material 3, écrans et navigation Accueil/Entretien/Pleins/Trajets/Réglages, accès CQ, préférence de thème et logo. Le bouton `+` informe que les saisies viendront plus tard. Les fiches et listes affichées sont partielles et en lecture seule.
- Room possède deux tables génériques (`records` et `payload_chunks`), et non des entités métier normalisées : le JSON de chaque objet est conservé en blocs avec taille et empreinte SHA-256. Le schéma Room v1 est fourni pour préparer de futures migrations.
- Contrat de sauvegarde : lecture des formats Web 1/2/3, validation avant confirmation, remplacement en transaction et export en format 3. Champs supplémentaires conservés dans chaque entrée ; clés racine ou collections inconnues refusées pour éviter une perte silencieuse. Une collection inconnue présente dans Room bloque aussi l’export. Un trajet GPS en cours est marqué interrompu, sans reprise automatique.
- Correction détectée en test : l’écriture JSON de Gson omettait les propriétés `null` exigées par le validateur Web ; `serializeNulls()` les préserve désormais. Ajout de limites de taille, contrôles des liens/identifiants, nettoyage des fichiers temporaires et vérification d’intégrité des blocs.
- Dans le manifeste source, aucune permission Internet, GPS, Bluetooth ou NFC. Sauvegarde système désactivée et règles Android 12+ excluant aussi les domaines de données des transferts standards entre appareils ; seules les copies JSON choisies explicitement assurent le transfert prévu. Le fichier choisi peut lui-même être sur un service distant si l’utilisateur le sélectionne.
- Documentation globale mise à jour et recopiée côté Android ; guides d’installation, d’architecture et de format ajoutés. Les outils d’archivage distinguent les versions Web et Android pour conserver trois ZIP de projet sans toucher aux archives personnelles non reconnues. Le code applicatif Web 1.4.0 reste inchangé.

### Vérifications

- Compilation `:app:assembleDebug` réussie, y compris depuis une archive provisoire extraite ; le wrapper Gradle 8.11.1 a été téléchargé et vérifié. L’APK de contrôle indique Android 11 minimum (API 30), cible 36, et aucune permission réseau/GPS/Bluetooth/NFC ; une permission interne AndroidX de récepteur non exporté est présente. Ce n’est pas un APK de publication.
- **38 tests Android automatisés réussis**, puis relancés depuis l’archive provisoire extraite, avec fichier de retour fourni. Ils couvrent notamment la validation v1 synthétique et des exports fictifs issus des vraies PWA 1.3.2 et 1.4.0, Room sous Robolectric, import atomique, annulation, démarrage simulé, règles de confidentialité et document de 5 Mio. Sans fichier de retour, le test optionnel correspondant est ignoré.
- Pont exercé sur données fictives : import PWA → Room simulée → export Android → véritable import IndexedDB par la PWA 1.4.0 → export Web → retour Room simulée. Passage également testé avec un document de 5 Mio et avec un export 1.3.2 converti en format 3. Les tests ne prouvent pas l’absence de problèmes avec tous les fichiers ou tous les téléphones.
- Android Lint réussi avec **0 erreur et 10 avertissements** : neuf signalent des versions plus récentes de Gradle/bibliothèques, une la complexité du logo vectoriel ; les versions ont été conservées pour ce lot testé. Cinq tests isolés de l’archiveur Android et neuf tests de l’archiveur Web réussis. Les 15 tests métier Web, les scénarios d’interface et la migration 1.3.2 → 1.4.0 ont aussi été relancés avec succès. Aucun essai physique Android, iPhone ou GPS n’a été effectué par cet environnement. La publication de la PWA et l’adresse publique restent à confirmer par l’utilisateur.

### À faire et sécurité

- Le lot A **ne sait pas encore ajouter, modifier ou supprimer les données métier** ; pas de GPS natif, Bluetooth, NFC, notifications, synchronisation, chiffrement Room/JSON ou sauvegarde automatique. La PWA reste le carnet utilisable aujourd’hui.
- Importer remplace les données du destinataire et ne fusionne pas ; confirmer avec une copie et conserver la PWA et au moins une sauvegarde externe vérifiée. Les fichiers JSON sont personnels et non chiffrés. Changer le package ou la signature d’une installation Android ne migre pas automatiquement sa base.
- Lots B/C/D et essais sur vrais appareils restent à réaliser ; le transfert de la 1.4.0 sur l’hébergement existant n’a pas été fait par l’agent.

### Livraison et rangement

- `VigieAuto-Android-v0.1.0.zip` contient les sources, le wrapper sans clé privée, les tests et la documentation ; pas d’APK signé de production. Les deux dossiers de code sont conservés, ainsi que les trois ZIP de projet Android 0.1.0, Web 1.4.0 et Web 1.3.2 après vérification de l’archive Android.
- Les fixtures de test sont fictives ; les dépendances et fichiers intermédiaires ne font pas partie des archives. Le ZIP Web 1.3.1 est retiré suivant la règle des trois versions, seulement après vérification de la nouvelle archive.

## 31 octobre 2026 — référentiel commun et ajout de véhicule

### Demande et décisions

- Conserver Kotlin/Compose + Room sur Android et la PWA familiale sur iPhone, sans serveur ni synchronisation obligatoire. Proposer des **listes courtes mais toujours complétables par saisie libre**, avec recherche, « Autre… », modèles liés à la marque, derniers choix et mémorisation locale après validation. Ne jamais refuser une marque ou un modèle au seul motif qu’il manque au référentiel ; ne pas imposer une génération de Clio.
- Ordre demandé : d’abord Renault, Peugeot, Citroën, Dacia, Volkswagen, Toyota, Ford, Opel, Fiat, Nissan, BMW, Mercedes-Benz, Audi, Hyundai, Kia, Seat, Škoda, DS, Mini et Tesla ; puis les autres marques courantes et enfin les anciennes Rover, Saab, Lada, Daewoo, Chrysler, Dodge et Datsun. Les modèles détaillés demandés pour Renault, Peugeot, Citroën, Dacia, Volkswagen, Toyota, Ford, BMW, Mercedes-Benz, Audi, Fiat, Nissan et Opel sont conservés dans le référentiel versionné `data/brands_models_fr.json`, copié à l’identique côté Android. Les autres marques ont 5 à 12 propositions.
- Année numérique libre et facultative, sept énergies dont hybride rechargeable et **Autre** libre, finition/motorisation et immatriculation facultatives ; kilométrage actuel obligatoire à l’ajout. L’utilisateur donne Renault / Clio / 2008 / Diesel / 1.5 dCi 68 comme premier exemple **sans kilométrage**. Le proposer explicitement sans créer automatiquement un véhicule ni inventer cette valeur.
- Modification du nom d’une marque personnalisée dans des réglages avancés reportée à une version ultérieure. Entretien/rappels, pleins et trajets manuels Android restent les prochaines étapes ; GPS natif facultatif et Bluetooth assisté ensuite, puis stabilisation iPhone. NFC reste une possibilité, non une promesse.

### Réalisé / corrigé

- Deux copies identiques du référentiel embarqué **v1** : 48 marques, 432 modèles et sept énergies, disponibles hors ligne. PWA 1.5.0 : `input` + `datalist`, boutons de saisie libre compatibles avec une saisie ordinaire, recherche et modèles filtrés ; Android 0.2.0 : Compose `ExposedDropdownMenu`, dialogues « Autre… », écran de création depuis l’accueil et le `+`, et sélection d’un véhicule déjà ajouté.
- Suggestions et dernières valeurs enregistrées dans `settings.vehicleSuggestions` (version 1) du JSON commun ; propriétés inconnues conservées, format incompatible refusé avant écrasement. Champs véhicules restent des textes. PWA : véhicule, suggestions et sélection écrits dans une transaction IndexedDB, avec fusion des suggestions concurrentes entre onglets. Android : table Room `suggestions_perso`, migration **v1 → v2 sans suppression**, reconstruction au démarrage/à l’import et transaction commune d’ajout.
- Les codes d’énergie existants restent inchangés : hybride rechargeable = `fuel: hybride` + détail ; énergie libre = `fuel: autre` + détail. L’ancienne PWA conserve ce champ inconnu mais ne l’affiche pas ; si elle change le code sans changer le détail, la nouvelle PWA affiche le **code actuel** plutôt qu’un détail devenu contradictoire.
- La PWA conserve IndexedDB v2 et exporte toujours du JSON format 3 ; Android continue à importer v1/v2/v3 et conserve les photos, documents et propriétés supplémentaires. Les imports restent confirmés, transactionnels et **remplacent** les données du destinataire. Guides Android/PWA, version des caches, scripts et documentation mis à jour.

### Vérifications et limites

- Tests métier et de sauvegarde, formulaires et hors-ligne en navigateurs automatisés ; tests avec WebKit et coupure d’accès serveur (ce n’est pas Safari sur iPhone). **56 tests Android automatisés réussis**, aucun ignoré lorsque les fichiers de retour fictifs sont fournis, et compilation Android de contrôle réussie. Migrations PWA réelles depuis les ZIP 1.3.2 et 1.4.0 vers 1.5.0, sur la même origine, avec données fictives.
- Migration Room testée depuis une base créée avec le vrai schéma v1 et des données fictives ; validations, rollback, persistance, champs inconnus et pont bidirectionnel Web/Room simulée. La vraie PWA 1.4.0 a importé et réexporté les nouvelles données et conservé le détail d’énergie et les suggestions lors de modifications ; la nouvelle PWA a ensuite réimporté le retour.
- Les tests automatisés et compilations ne sont **pas** un essai sur téléphone, sur iPhone, ni une publication sur le site de l’utilisateur. Garder les deux applications et des sauvegardes externes vérifiées. Android n’offre pas encore la modification/suppression de véhicules ou les saisies d’autres rubriques ; pas de GPS natif, Bluetooth, NFC, notification ou cloud automatique dans ce lot.

### Livraison et rangement

- Les archives de projet de cette évolution sont `VigieAuto-v1.5.0.zip` et `VigieAuto-Android-v0.2.0.zip`. Après leur vérification, la règle commune des trois ZIP conserve également la PWA 1.4.0 ; les ZIP de projet Android 0.1.0 et PWA 1.3.2 ont été retirés. Les dates de fichiers reconstituées ont influencé ce classement ; les sauvegardes personnelles ne sont pas touchées.

## 31 octobre 2026 — clarification et rangement de l’espace de travail

- L’utilisateur signale que les nombreux processus/aperçus de tests et un avertissement de capacité rendent l’espace difficile à lire. Les processus de test sont arrêtés et leurs caches temporaires Android/Gradle ont été supprimés ; les deux dossiers de code, les documents et les sauvegardes personnelles sont conservés.
- L’avertissement mentionnait huit fichiers non conservés lors d’un instantané ; leur liste n’était pas disponible. Les fichiers sources indispensables, les deux schémas Room, les guides, les tests et les deux copies du référentiel ont été vérifiés présents avant archivage. Les fichiers de compilation et dépendances temporaires ne sont pas nécessaires dans les ZIP. Les essais effectués avant nettoyage restent des essais simulés, pas des tests sur téléphone.

## 31 octobre 2026 — carnet Android, compteur et logo corrigé

### Demande et situation de départ

- L’utilisateur confirme avoir créé `local.properties` sur son ordinateur et que son **build Android 0.2.0 réussit**. Il demande de poursuivre les améliorations et fournit une nouvelle image du logo dont il a retiré les bords blancs.
- Le lot annoncé couvre les entretiens/rappels, les pleins et les trajets manuels Android, tout en gardant la PWA familiale et les sauvegardes existantes. Le GPS natif, Bluetooth et les notifications hors application restent ultérieurs ; aucun processus de test ou aperçu visible supplémentaire n’est nécessaire.

### Réalisé / corrigé

- **Android 0.3.0** : création, modification et suppression confirmée des interventions, rappels, pleins/recharges et trajets manuels pour le véhicule actif. Ajout d’un chronomètre manuel persisté, distance à saisir et durée corrigeable, et d’une action d’actualisation/correction du compteur sur l’accueil. Pas de statistiques de consommation Android dans ce lot.
- Rappels à date et/ou kilométrage, seuils, récurrence et action « fait » ; affichage sur l’accueil et dans Entretien. Ce ne sont **pas des notifications programmées**. Intervention, éventuel rappel et hausse de compteur sont transactionnels ; la baisse explicite du compteur ne réécrit pas l’historique. La suppression d’une intervention conserve son éventuel rappel.
- Le JSON v3 conserve ses noms et les données complètes ; les modifications repartent des objets d’origine et conservent leurs propriétés supplémentaires. Les empreintes empêchent d’écraser ou supprimer silencieusement une entrée modifiée depuis l’ouverture du formulaire. Room garde son schéma v2 : les résumés d’affichage des anciens rappels/trajets sont reconstruits sans changer leur JSON.
- Un trajet GPS PWA en cours est marqué interrompu à l’import et peut être terminé en saisissant la distance ; il reste de type GPS dans le JSON et aucun capteur n’est relancé. Android ne déclare aucune permission Internet, GPS, Bluetooth, NFC ou notifications ; pas de sauvegarde automatique, compte ou synchronisation.
- Image `/home/user/uploads/image-3.png` employée sans ajout de bord blanc : icônes Android adaptatives avec zone de sécurité, et icônes PWA **1.5.1** transparentes ; variantes iOS/masquable à fond coloré. Le bouclier SVG/vectoriel du bandeau reste thématisé. La PWA change ses ressources et sa version de cache, pas sa base ni ses fonctions métier.

### Vérifications et limites

- Construction de l’APK debug et **82 tests Android automatisés réussis, aucun ignoré** avec les fichiers fictifs de retour fournis, sous JDK 17 / SDK 36. Tests métier, formulaires Compose, navigation Compose/ViewModel/Room simulée, corruption et rollback simulé à l’insertion du rappel, compteurs, concurrence, reprise d’index et conservation des champs supplémentaires. Android Lint terminé avec 0 erreur et 13 avertissements (versions de dépendances, complexité des tracés et variantes d’icône adaptative). Contrôle de l’APK : Android 11 minimum, cible 36, seule permission interne AndroidX de récepteur non exporté.
- Pont réel sur données fictives : sauvegarde créée par Android → import IndexedDB de la PWA 1.5.1 → modification d’un entretien, d’un plein, d’un trajet et d’un rappel dans ses formulaires → export → retour Room simulée, avec conservation des propriétés inconnues. Autres échanges : anciens formats PWA, suggestions, deux véhicules et document de 5 Mio. Les imports restent des remplacements, jamais des fusions.
- PWA : 20 tests métier, tests d’interface et GPS simulé, logo, catalogue Chromium/WebKit, hors-ligne et mises à jour sur la même origine depuis les ZIP 1.4.0 et 1.5.0 vers 1.5.1. L’essai WebKit et les simulations ne sont pas des tests sur iPhone physique. Aucun essai physique Android n’a été confirmé pour cette version ; la PWA 1.5.1 n’a pas été publiée par l’agent.
- L’édition complète/suppression d’un véhicule, la saisie Android des CQ, symptômes, dépenses, documents et statistiques, le GPS natif et Bluetooth restent à développer. Sauvegarder et vérifier les deux côtés avant chaque import ou mise à jour ; conserver la PWA et ne pas désinstaller pour contourner un problème de signature.

### Livraison et rangement

- Archives : `VigieAuto-Android-v0.3.0.zip`, `VigieAuto-v1.5.1.zip` et ancienne source `VigieAuto-Android-v0.2.0.zip`. Les anciennes archives PWA de projet ne sont retirées qu’après vérification CRC des deux nouvelles ; les sauvegardes personnelles ne sont pas touchées. Les caches/outils temporaires ne sont pas des livrables.

## 31 octobre 2026 — racine ZIP, récapitulatif vivant et Android 0.4.0-alpha.1

### Demande et décisions

- L’utilisateur demande que le **dossier dans le ZIP Android s’appelle exactement `VigieAuto`**, un document complet de toutes les fonctions, actualisé **à chaque mise à jour**, et fournit une feuille de route Android détaillée en sept phases ainsi qu’un lot 0.4.0 alpha/bêta/stable. Les deux projets sont conservés ; leurs ZIP partageant la même racine, ils doivent être extraits dans deux dossiers parents séparés.
- Il ajoute des objectifs de performance (temps de lancement et d’actions, fluidité 60 fps, import/export, taille, RAM, batterie), des pistes StrictMode/WAL/VACUUM, Hilt/LeakCanary/rapports Compose, puis pagination, profils, benchmark et R8. Ces valeurs sont des **cibles non mesurées**, pas des garanties de 0 crash ou de fluidité sur chaque téléphone. Le détail et les précautions sont dans `PERFORMANCES.md`.
- Priorité absolue à la conservation des anciens exports PWA v1/v2/v3, photos/documents, champs inconnus et onze collections. Les tests simulés sont distingués des essais physiques. Android 8/API 26 est une cible ; aucune compatibilité physique universelle n’est promise.

### Réalisé / corrigé

- `docs/RECAPITULATIF-FONCTIONS.md` décrit séparément Android et PWA ; les deux archiveurs vérifient sa présence. `FEUILLE-DE-ROUTE-ANDROID.md` enregistre les sept phases et `PERFORMANCES.md` les objectifs et protocoles. Ces documents rejoignent l’historique, le cahier des charges et la feuille de route à chaque évolution.
- Archiveur Android : racine `VigieAuto`. Version **0.4.0-alpha.1**, code 4, minimum API 26, cible 36 ; gestionnaires d’archives classent correctement alpha < bêta < stable et ne touchent pas aux sauvegardes personnelles. La dernière version stable 0.3.0 est conservée séparément.
- Room schéma 3 : tables `vehicles`, `services`, `fills`, `trips`, `reminders`, relations/index et suggestions conservées. La migration 2→3 copie et vérifie tous les blocs, construit les projections, contrôle les liens et supprime les anciennes tables en transaction. Elle échoue sans migration destructive si les données sont incohérentes.
- **Écart explicite par rapport aux six tables seules demandées :** `compat_records`/`compat_chunks` restent indispensables à la conservation des 11 collections, pièces jointes et propriétés inconnues ; le pont utilise encore ces JSON complets comme source de vérité. Les cinq tables sont des projections synchronisées, pas encore la source unique d’export. Texte d’index borné à 512 caractères, valeur intégrale conservée dans le JSON. Voir `MIGRATION-V2-V3.md`.
- Import/édition/export restent transactionnels ; les clés étrangères sont différées pour permettre les collections dans n’importe quel ordre et la mise à jour d’un véhicule n’efface pas ses enfants par cascade. WAL demandé pour la base de production et StrictMode activé uniquement en debug.

### Tests et limites

- **94 tests Android JVM réussis, zéro échec/erreur/ignoré** avec les fichiers de retour fictifs. Ils comprennent migrations depuis les vrais schémas 1 et 2, base vide, 100 pleins, document PDF de 5 Mio, champs inconnus, données corrompues avec rollback, ordre des collections, cascade, modification atomique et un test Robolectric API 26. Ces essais sont simulés sur ordinateur.
- Assemblage debug et APK de tests instrumentés compilés avec succès, y compris depuis une extraction propre d’une archive provisoire sans `local.properties` ; lint Android **0 erreur et 16 avertissements**. L’APK de contrôle indique minSdk 26, cible 36, version 0.4.0-alpha.1/code 4 ; aucune permission Internet, GPS, Bluetooth ou NFC ajoutée. Quatre tests instrumentés `MigrationTestHelper` sont écrits et leur APK de test compilé ; **non exécutés** car aucun appareil/émulateur disponible.
- Pont avec la vraie PWA 1.5.1 en Chromium : exports Android normaux, v2, gros document, véhicules et suggestions importés/réexportés ; édition PWA de quatre rubriques et retour Android ; champs inconnus contrôlés. 20 tests métier PWA, 7 tests d’archiveur Android et 9 tests d’archiveur PWA réussis. Pas d’essai sur iPhone réel.
- **Non réalisé :** Hilt, repositories spécialisés complets, navigation typée, annulation Snackbar généralisée, notifications, GPS natif, VACUUM automatique, pagination, LeakCanary, R8 release, baseline profiles, macrobenchmarks et CI. Aucune performance sur téléphone réel n’a été mesurée. Les tests instrumentés sont à lancer sur appareil de test avant d’envisager la version stable.

### Sauvegardes et livraison

- Avant l’essai : export et copie externe vérifiés pour Android et pour chaque PWA ; ne pas désinstaller ni vider les données pour contourner un problème de signature ou de migration. Le retour de Room 3 à Room 2 n’est pas automatique. La même clé de signature est nécessaire pour une mise à jour par-dessus l’installation.
- La préversion est un ZIP de **sources** ; aucun APK, clé ou `local.properties` personnel n’est inclus. Trois ZIP de projet sont conservés : alpha Android, Android 0.3.0 et PWA 1.5.1. Les sauvegardes personnelles ne sont pas concernées.

## 31 octobre 2026 — poursuite Android 0.4.0-beta.1

### Demande et périmètre

- Après la livraison alpha, l’utilisateur demande « Poursuis ! » : continuer par la bêta du socle, sans prétendre livrer la stable ni les sept phases. Garder la PWA iPhone, les sauvegardes et trois archives de projet ; actualiser systématiquement le récapitulatif des fonctions.

### Réalisé et corrigé

- Hilt sur l’application, l’Activity et le ViewModel, une base Room 3 partagée par injection, contrats métier et adaptateurs véhicules, entretien, pleins, trajets, rappels, affichage, catalogue, réglages et sauvegarde. Modèles/mappers distincts de Room et tests du ViewModel avec faux dépôts. Le moteur `BackupRepository` commun reste la source JSON et garantit les transactions : les projections ne sont pas des fiches complètes.
- Catalogue chargé lors du formulaire sur IO ; nettoyage des copies d’import et accès au dossier temporaire sur IO ; registre partagé des imports actifs ; annulations testées pendant la copie, entre résultats et livraison et avant remplacement. Le décodage d’un très gros objet ou une lecture système bloquée ne s’annulent pas instantanément.
- Cas d’usage de consommation pur, comparé sur sept scénarios à la PWA : pleins complets, partiels, unités séparées, compteur décroissant, distance nulle et moyenne pondérée. Il n’est pas encore relié à un écran de statistiques Android.
- Rapports du compilateur Compose, sans annotations d’immuabilité abusives ; LeakCanary optionnel debug, absent par défaut. La variante de diagnostic ajoute des permissions de stockage/notifications, des composants et des dumps mémoire sensibles. Pas d’analyse de fuite réelle ni de benchmark revendiqué.
- Rétention révisée et testée : la bêta ne chasse plus la PWA familiale ni le repli Android stable. Les ZIP de projet corrompus/non identifiables et les doublons contradictoires sont préservés et signalés plutôt que supprimés au risque d’une perte.

### Vérifications et limites

- 123 tests Android JVM sans ignoré avec retours fictifs PWA ; tests de migrations, sauvegarde, annulations, Hilt/Compose simulés et cas métier. Un avertissement Robolectric s’est produit lors du nettoyage d’un dossier temporaire après les assertions, sans échec du build. Lint 0 erreur/16 avertissements ; APK debug et APK de tests instrumentés assemblés, également depuis une extraction propre sans `local.properties` ; release non signée assemblée. Le debug standard extrait n’inclut pas LeakCanary et ne déclare aucune permission réseau, GPS, Bluetooth ou notification.
- Quatre tests MigrationTestHelper compilés mais **non exécutés** : aucun appareil/émulateur disponible. Pas de test physique Android/iPhone ni de mesure cold start, fps, 10 Mo, RAM ou batterie. Room à l’API 26 simulée ne démontre pas à lui seul la compatibilité complète Android 8.
- PWA 1.5.1 : 20 tests métier ; 10 tests de l’archiveur Android, 11 de l’archiveur Web ; imports et réexports réels par PWA automatisée de sauvegardes Android normales, v2, document 5 Mio, véhicules et suggestions ; modifications des quatre rubriques PWA et retour Room, avec champs inconnus préservés pour les scénarios testés. Pas d’essai sur iPhone réel.
- Manifestes vérifiés : configuration normale debug et release sans permissions Internet, GPS, Bluetooth, NFC ou notifications ; variante LeakCanary debug avec permissions supplémentaires. L’APK release d’essai est non signé et ne constitue pas une release de production.

### Prudence et livraison

- Garder des sauvegardes externes Android et PWA vérifiées avant essai. La bêta n’ajoute pas de migration après l’alpha ; depuis 0.3.0, Room 2 passe à 3. Le ZIP stable 0.3.0 reste un repli de sources, pas une lecture automatique d’une base déjà migrée.
- Trois ZIP de projet après vérification : `VigieAuto-Android-v0.4.0-beta.1.zip`, `VigieAuto-Android-v0.3.0.zip`, `VigieAuto-v1.5.1.zip`. Le ZIP bêta contient les sources sous `VigieAuto`, pas d’APK, clé ni `local.properties` ; les sauvegardes personnelles restent hors du mécanisme de rangement.

## Modèle pour les prochaines entrées

Pour chaque changement, ajouter une entrée datée avec :

1. **Demande / décision** : ce que l’utilisateur souhaite, accepte, modifie ou refuse.
2. **Réalisé / corrigé** : ce qui a réellement changé, dans quelle version et où ; mettre à jour le récapitulatif fonctionnel à chaque version.
3. **Tests** : ce qui a été vérifié et les limites des vérifications.
4. **En attente / risques** : ce qui reste à décider ou qui n’est pas implémenté.
5. **Livraison et nettoyage** : archive créée, archives conservées et éléments temporaires retirés.

## 1er novembre 2026 — Android 0.4.0-beta.2 et méthode plus rapide

### Demande

- L’utilisateur juge les livraisons de 30 minutes à 1 h 18 trop longues ; il souhaite rester prudent mais accélérer. L’approche retenue regroupe les changements et la compilation, conserve les contrôles adaptés au risque et explique ceux qui ne sont pas relancés.

### Réalisation

- Sur Android, Entretien/rappels, Pleins et Trajets utilisent des listes Compose paresseuses à clés stables, en conservant les actions et le filtre du véhicule. Les échéances sont calculées une fois avant le tri ; changer de véhicule ou de rubrique revient en haut de la liste.
- Ce lot ne modifie pas la base Room, le pont JSON ni la PWA ; les résumés sont toujours chargés et filtrés en mémoire. Ce n’est pas de la pagination SQL et aucun gain de fluidité n’est quantifié.
- L’archiveur fixe explicitement le droit d’exécution du script `gradlew` dans le ZIP, même si l’espace de travail a perdu ce droit ; cette propriété est vérifiée par ses tests. Aucun fichier personnel n’est inclus.

### Vérifications et limites

- 9 tests ciblés JVM réussis sans ignoré, compilation debug réussie et lint 0 erreur/16 avertissements. La première exécution Gradle s’est interrompue par disparition du daemon ; les tests ciblés ont été relancés avec moins de mémoire. Les tests ciblent les écrans modifiés, dont une liste simulée de 1 000 éléments ; ils ne mesurent pas les FPS. La suite complète de 123 tests et les retours PWA concernent beta.1 et n’ont pas été relancés pour ce lot visuel.
- Pas de test sur téléphone/émulateur de beta.2 ni de mesure de performance physique ; les quatre tests de migration instrumentés compilés en beta.1 restent non exécutés. Sauvegarde externe toujours recommandée ; retour Room 3 vers 0.3/Room 2 non automatique.
- Après création et vérification : ZIP beta.2, Android stable 0.3.0 et PWA 1.5.1 conservés ; l’ancienne préversion beta.1 est remplacée. Aucun ZIP de sauvegarde personnelle n’est visé.

## 1er novembre 2026 — Android 0.4.0-beta.3, retour entre écrans

### Demande et réalisation

- L’utilisateur demande de poursuivre, après avoir souhaité des livraisons plus rapides sans sacrifier la sécurité. Lot ciblé sur le retour Android, sans changement de base, de JSON ni de PWA.
- Retour depuis Entretien, Pleins, Trajets ou Réglages vers l’accueil ; depuis CQ vers l’onglet qui a ouvert CQ. L’onglet d’origine est conservé par `rememberSaveable`, y compris si l’icône CQ est retouchée. Sur l’accueil, le système conserve son comportement normal.
- Les dialogues restent prioritaires ; une action Retour sur un onglet est ignorée pendant une opération occupée. Fermer un formulaire sans l’enregistrer abandonne ses modifications : la gestion de brouillons reste à étudier. Navigation typée et historique complet des onglets restent à faire.

### Vérifications et limites

- 5 tests ciblés JVM réussis sans ignoré, compilation debug réussie et lint 0 erreur/16 avertissements. Tests automatisés simulés, pas de validation du bouton ou du geste Retour sur téléphone réel. La suite complète de 123 tests et les retours PWA concernent beta.1 et ne sont pas relancés pour ce changement d’interface.
- Les quatre tests instrumentés de migration compilés en beta.1 restent non exécutés. Avant mise à jour, garder des sauvegardes externes vérifiées ; retour Room 3 vers 0.3/Room 2 non automatique.
- Après validation : ZIP beta.3, Android stable 0.3.0 et PWA 1.5.1 conservés ; l’ancienne préversion beta.2 est remplacée. Aucune sauvegarde personnelle n’est visée.

## 1er novembre 2026 — Android 0.4.0-beta.4, protection des saisies

### Demande et réalisation

- Après la bêta.3, l’utilisateur demande de poursuivre. Pour réduire la perte de saisies signalée comme limite précédente, Annuler ou Retour sur un formulaire modifié demande désormais de continuer la saisie ou de quitter sans enregistrer.
- La protection concerne l’ajout de véhicule, la correction du compteur, ainsi que les formulaires entretien, plein, trajet et rappel. Sans différence avec les valeurs initiales, le formulaire se ferme directement ; les dernières suggestions préremplies ne comptent pas comme une modification. Les champs libres du dialogue « Autre… » demandent aussi confirmation avant abandon quand ils contiennent du texte. Une action d’enregistrement suit toujours sa validation normale.
- La cible du véhicule et du compteur a été déplacée dans le ViewModel pour éviter qu’une recréation ordinaire de l’écran ne ferme leur dialogue ou ne laisse affiché le formulaire après un enregistrement réussi. Les champs restent des états Compose et ne sont pas des brouillons durables.
- La confirmation garde les valeurs seulement tant que le formulaire reste ouvert. Elle n’enregistre pas de brouillon durable et ne promet pas de récupération après arrêt du processus ; abandon confirmé = saisies perdues. Aucun changement à la base, au JSON ou à la PWA.

### Vérifications et limites

- 38 tests JVM ciblés réussis sans échec ni ignoré, compilation debug réussie et lint 0 erreur/16 avertissements. Les tests ciblent les formulaires, le retour et une recréation simulée de l’Activity pendant la saisie du véhicule et du compteur ; la suite complète de 123 tests et les retours PWA concernent beta.1 et ne sont pas relancés pour ce changement d’interface.
- Aucun test de cette bêta sur téléphone/émulateur. Les quatre tests instrumentés de migration compilés en beta.1 restent non exécutés ; garder des sauvegardes externes vérifiées et ne pas supposer un retour Room 3 vers Room 2 automatique.
- Après validation : ZIP beta.4, Android stable 0.3.0 et PWA 1.5.1 conservés ; la préversion beta.3 est remplacée. Les sauvegardes personnelles ne sont jamais visées.

## 1er novembre 2026 — Android 0.4.0-beta.5, suppression différée

### Demande et réalisation

- Après la bêta.4, l’utilisateur demande de poursuivre. Pour réduire le risque d’une suppression accidentelle du carnet sans modifier le schéma ni les sauvegardes, une suppression confirmée est désormais mise en attente : sans action supplémentaire, l’élément reste intact en base pendant au moins 10 secondes au premier plan.
- Le bandeau offre « Annuler » ou « Supprimer maintenant ». Sans action, la suppression est effectuée après le délai. Le délai s’interrompt en arrière-plan et repart au retour ; une durée recommandée pour l’accessibilité peut le prolonger. Si l’application s’arrête avant l’écriture effective, l’élément reste conservé. Ce n’est pas une corbeille : après suppression effective, il n’y a pas d’annulation.
- L’attente bloque les autres écritures et les imports/exports, mais pas la navigation. Un jeton distinct interdit qu’une ancienne action valide une nouvelle demande ; la vérification d’empreinte et la transaction de suppression existantes sont conservées. Le véhicule, les sauvegardes et un éventuel rappel lié restent préservés.

### Vérifications et limites

- 60 tests JVM ciblés réussis sans échec ni ignoré, compilation debug réussie et lint 0 erreur/16 avertissements. Tests ciblés d’interface, d’état et de transactions en environnement simulé : temporisateur en arrière-plan, ancien jeton, annulation, suppression avec rappel conservé, recréation d’écran et échec SQL avec rollback ; suite complète et ponts PWA non entièrement relancés pour ce lot sans changement de stockage.
- Aucun test sur téléphone/émulateur ; les quatre tests instrumentés de migration compilés en beta.1 restent non exécutés. Maintenir des sauvegardes externes vérifiées ; Android 0.3 ne peut pas ouvrir directement une base déjà migrée vers Room 3.
- Après validation : ZIP beta.5, Android stable 0.3.0 et PWA 1.5.1 conservés ; la préversion beta.4 est remplacée. Les sauvegardes personnelles ne sont jamais visées.

## 1er novembre 2026 — Android 0.4.0-beta.6, vérification JSON sans restauration

### Demande et réalisation

- Après la beta.5, l’utilisateur demande de poursuivre en conservant des livraisons rapides mais prudentes. Le lot choisi améliore la sécurité des sauvegardes : **Réglages → Vérifier un JSON** analyse une copie et présente son format ainsi que le nombre d’éléments de chacune des 11 collections, sans bouton de remplacement et sans modifier la base ni le fichier choisi.
- Les actions de sauvegarde dans Réglages sont maintenues au-dessus de la zone du « + » flottant ; les clics et la recréation d’écran sont testés en simulation. Un message temporaire peut néanmoins masquer momentanément une action.
- La prévisualisation partage le validateur utilisé avant import mais son mode est porté avec la copie préparée. Même si `confirmImport` est appelé à tort, il refuse ce mode ; les autres écritures restent bloquées pendant l’analyse et le résultat. L’import demeure une opération distincte, confirmée, destructive et transactionnelle. Aucun nouveau format, schéma Room ou changement de la PWA.
- Un fichier reconnu peut être ancien, incomplet, mal provenir ou contenir des pièces jointes qui ne s’ouvrent pas ; le contrôle ne simule ni toutes les écritures ni une restauration sur la PWA. Comparer les quantités, garder plusieurs copies externes et, si possible, tester une restauration sur un appareil de test.
- La vérification crée une copie temporaire privée **non chiffrée**. Son nettoyage est demandé quand le dialogue se ferme, en cas d’annulation/erreur ou lors du nettoyage des orphelins ; `File.delete()` peut échouer sans confirmation dans la version actuelle, donc son effacement n’est pas garanti.

### Vérifications et limites

- 98 tests JVM ciblés réussis sans échec ni ignoré, compilation debug réussie et lint 0 erreur/16 avertissements. Les tests JVM et de sélecteur/Compose sont simulés ; aucun test sur téléphone ni test instrumenté de migration exécuté. La suite complète et les ponts PWA appartiennent à la beta.1, pas entièrement relancés pour ce lot.
- Après validation : ZIP beta.6, Android 0.3.0 et PWA 1.5.1 conservés ; beta.5 est remplacée. Aucune sauvegarde personnelle n’est visée.

## 1er novembre 2026 — Android 0.4.0-beta.7, fiche véhicule

### Demande et périmètre

- Après « Poursuis », avancer par un lot ciblé, en préservant le rythme et les contrôles essentiels : modification des informations du véhicule actif, sans faire croire que le véhicule complet, la photo ou sa suppression sont terminés. La PWA familiale 1.5.1 reste distincte et inchangée.

### Réalisé

- Depuis Accueil → **Modifier ce véhicule**, modifier marque et modèle libres, année, énergie et détail libre, finition/motorisation, immatriculation, VIN et notes. Le compteur se corrige séparément ; photo, données du carnet et propriétés non affichées restent conservées. Sans changement, aucune écriture n’est effectuée. Un conflit ou une donnée trop longue est refusé sans tronquer ; un formulaire modifié demande confirmation avant abandon.
- Année et énergies importées atypiques, champs absents/nulles, compteur initial/actuel, photo, autres véhicules, documents, liens, rubriques et champs inconnus sont préservés si l’utilisateur ne les modifie pas. Un changement de marque ou modèle actualise aussi les suggestions dans la transaction ; le modèle reste dépendant de la marque. Les 48 marques et 432 modèles du catalogue partagé demeurent indicatifs.
- Lecture du JSON entier et de son SHA ; écriture sous transaction après contrôle de conflit, avec mise à jour de la projection et des suggestions sans cascade sur les enfants. Un no-op ne change pas même la date. Les champs éditables trop longs sont refusés sans troncature ; l’énergie non représentable est conservée tant qu’elle n’est pas modifiée. Les espaces et l’ordre du JSON ne sont pas garantis, ses valeurs le sont selon les tests et limites du format.

### Contrôles et limites

- 181 tests JVM réussis sans échec ni ignoré, compilation debug réussie et lint 0 erreur/16 avertissements. Tests de sauvegarde v1/v2/v3, Room et migrations simulées, véhicule, carnet, navigation/formulaires, image fictive volumineuse, rollback, conflit et simulation API 26. La fiche Android fictive a été importée puis modifiée et réexportée par la PWA 1.5.1 réelle sous Chromium, puis réimportée dans Room. Tests d’archivage Android 12/12 et PWA 11/11 ; 20 tests métier PWA et parcours catalogue Chromium réussis. L’archiveur Android vérifie avant toute rétention le CRC, la liste exacte, la racine, le mode `gradlew` et la concordance SHA-256 de chaque fichier avec la source ; un refus conserve les anciennes archives. Pas de schéma Room, format JSON ou code Web modifié.
- Aucun essai sur téléphone Android ou iPhone ; tests instrumentés de migration recompilés en beta.7 mais non exécutés. Aucun résultat physique de démarrage, fluidité, RAM, batterie ou débit import/export. Une sauvegarde externe vérifiée reste nécessaire avant installation, transfert et migration. L’import remplace le destinataire et n’est pas une fusion.
- Après vérification de l’archive : ZIP beta.7, Android stable 0.3.0 et PWA 1.5.1 conservés ; beta.6 est remplacée. Les sauvegardes personnelles ne sont pas visées.


## 1er novembre 2026 — Android 0.4.0-beta.8, dettes structurelles

### Demande et choix

- L’utilisateur confirme avoir compilé beta.7 sous Windows : `BUILD SUCCESSFUL in 7m 1s` pour `:app:assembleDebug :app:testDebugUnitTest`, avec des avertissements SDK non bloquants. Ce résultat ne documente pas un essai sur téléphone.
- Il demande de poursuivre en priorité l’identité fixe, les tables métier complètes comme source unique, Navigation Compose typée et résultats/états cohérents avec suppression immédiate et Undo fiable, plutôt que de nouveaux écrans. Il souhaite des livraisons plus rapides sans supprimer les contrôles essentiels.
- Identifiant choisi définitivement : **`com.vigieauto.app`**, inchangé dans `namespace` et `applicationId`. La clé de signature doit elle aussi rester compatible ; aucune réservation sur un store n’est attestée.

### Réalisé et non réalisé

- Navigation Compose 2.8.9 et six routes `@Serializable` pour les écrans existants ; CQ conserve son parent dans la pile. Les futures routes de détail avec identifiant ne sont pas encore implémentées.
- `RepositoryResult` uniformise succès et erreur au bord des opérations du ViewModel et propage les annulations ; l’état de chargement reste dans `InteractionState`. Les signatures des dépôts et tous les états n’ont pas encore été refondus en une abstraction unique.
- Garde de comparaison JSON testée pour préparer la future migration complète. Elle n’est pas reliée à une migration de base dans cette version. Room demeure v3 ; `compat_records` et `compat_chunks` restent indispensables et les cinq tables ne sont pas la source complète. Les anciennes tables v1/v2 avaient déjà été supprimées par la migration 2→3. Détails et conditions dans `PLAN-MIGRATION-TYPEE.md`.
- Un essai supplémentaire du vrai pont PWA sous Chromium a révélé une limite numérique : un nombre fictif très précis dans un champ inconnu est arrondi par JavaScript à l’import/réexport PWA. Le JSON source reste à conserver ; Android conserve ce nombre dans le test Room, mais la compatibilité précise entre applications reste à résoudre.
- La suppression immédiate avec Undo après suppression n’est pas réalisée ; le mécanisme différé beta.5 est conservé. Aucun nouvel écran, changement du format JSON ou modification du code de la PWA.

### Contrôles et limites

- 200 tests JVM réussis, sans échec ni ignoré ; lint 0 erreur/17 avertissements ; compilation debug et des tests instrumentés réussie. Pont Android → vraie PWA 1.5.1 sous Chromium → Android sur données fictives ; tests PWA 20/20, archiveur Android 12/12 et PWA 11/11.
- Compilation beta.8 effectuée dans le workspace incrémental ; l’archive est contrôlée par extraction et comparaison aux sources, mais pas recompilée séparément depuis cette extraction pour ce lot. Aucun téléphone/émulateur Android n’est disponible dans cet environnement : les tests instrumentés 1→2→3 sont compilés mais non exécutés. Les imports JSON de format 1 ou 2 sont distincts des migrations des schémas Room. Le pont beta.7 a été essayé dans la vraie PWA sous Chromium, pas sur téléphone. Aucune mesure physique de performance, aucun « zéro défaut » ni sécurité absolue ne sont revendiqués.
- Avant mise à jour, exporter et vérifier une copie externe pour chaque application ; ne pas désinstaller en cas de refus de signature. Une sauvegarde JSON est personnelle et non chiffrée.

## 1er novembre 2026 — Android 0.4.0-beta.9, fiabilité des tests Windows

- L’utilisateur signale un échec supplémentaire de beta.7 sous Windows après un précédent build réussi, puis de beta.8 : respectivement 181 et 200 tests, 1 échec et 4 ignorés ; beta.8 a pris 14 min 29 s. La trace beta.8 montre `Illegal connection pointer` dans `ShadowLegacySQLiteConnection`, pendant un flux d’invalidation Room, signalé au début de `MainNavigationBackTest`. Il demande un correctif rapide sans désactiver le test ni risquer ses données.
- Investigation : Robolectric 4.14.1 utilise par défaut SQLite LEGACY sous Windows, NATIVE sous Linux ; l’artefact contient un binaire PE Windows x86_64. Avant correction, un essai ciblé Linux en mode LEGACY avec un processeur actif a réussi : l’intermittence **n’a pas été reproduite** ici. La trace suggère une concurrence de tâches mais ne démontre pas la cause exacte ni une corruption du stockage réel.
- Mesure beta.9 : mode NATIVE explicitement demandé pour les tests JVM sous Windows x64 ; à la fin de chaque test de navigation, fermeture explicite de l’Activity et attente bornée de la fin du `viewModelScope`. Vérification du mode, présence de la DLL et requête SQLite, nouveau test d’annulation, sans désactivation d’assertion ni exception avalée. NATIVE n’est pas forcé pour Windows ARM64 natif ou 32 bits.
- Lors d’une première tentative locale, le nouveau contrôle de fermeture a lui-même expiré en mode natif : l’attente Compose seule ne faisait pas avancer les messages du looper Robolectric. L’attente a été adaptée pour traiter aussi ce looper ; ce problème de test ajouté localement est distinct de l’erreur Windows initiale.
- Sur Linux : 204 tests JVM réussis, sans échec ni ignoré, avec les jeux de pont fictifs déjà générés ; lint 0 erreur/17 avertissements. Les 10 tests ciblés ont aussi réussi quatre fois en mode NATIVE et quatre fois en mode LEGACY, avec un processeur actif. Aucun Windows disponible ici : la validation du chargement natif et la disparition de l’échec intermittent restent à confirmer avec la commande ciblée de `docs/TESTS-WINDOWS.md`. Les 4 tests de retour PWA peuvent rester ignorés sans leurs fichiers fictifs ; ce ne sont pas des tests réussis.
- Les 204 tests de la suite ont utilisé les jeux de pont fictifs déjà générés en beta.8 : les parcours PWA dans le navigateur n’ont pas été relancés pour ce correctif de test. Le build est incrémental dans le workspace ; l’archive est vérifiée par extraction et comparaison, sans recompilation distincte depuis l’extraction.
- PWA runtime et données applicatives non modifiés ; nouvelle version Android code 13, même identifiant, Room 3 et format JSON inchangés. Tests instrumentés de migration recompilés, non exécutés faute d’appareil/émulateur. Architecture Room source unique, Undo transactionnel et précision numérique inter-PWA restent à traiter. Une sauvegarde externe demeure indispensable.

## 1er novembre 2026 — retour Windows après la livraison beta.9

- L’utilisateur a exécuté la commande ciblée `:app:testDebugUnitTest` avec les filtres `MainNavigationBackTest` et `RobolectricSqliteConfigurationTest` : `BUILD SUCCESSFUL in 3m 31s`, 18 tâches exécutées et 17 à jour.
- Il a ensuite exécuté `:app:assembleDebug :app:testDebugUnitTest` : `BUILD SUCCESSFUL in 5m 7s`, 5 tâches exécutées et 47 à jour. Les traces montrent un succès des tâches Gradle, pas le nombre de tests ignorés ni l’architecture du JDK ; ne pas les inventer. Cette seconde commande est incrémentale et sa durée ne constitue pas un benchmark comparable aux précédentes. Les commandes rapportées ne comprennent ni `lintDebug` ni tests instrumentés.
- Des avertissements signalent une version de XML SDK non prise en charge par un outil et des dossiers supplémentaires `emulator.backup` et `platform-tools-2`. Ils n’ont pas bloqué ces deux builds ; aucune suppression ou modification du SDK de l’utilisateur n’a été effectuée ni recommandée sans vérification.
- Ces essais Windows sont encourageants mais, s’agissant d’un problème intermittent, ne garantissent pas son absence définitive. À ce stade, le ZIP beta.9 livré avait été conservé intact : il reflétait l’état documentaire d’avant ce retour ; les documents sources ont été actualisés pour la livraison suivante, sans nouvelle version logicielle à ce moment.

## 1er novembre 2026 — Android 0.4.0-beta.10 : première source Room complète

- Après deux builds Windows beta.9 réussis, l’utilisateur demande de poursuivre, en privilégiant les dettes structurelles et la préservation des données plutôt que de nouveaux écrans ; le besoin de livraisons plus rapides sans abandonner les contrôles essentiels demeure.
- Implémentation Room 4 pour les véhicules seulement : 14 champs connus, identifiant, présence/null, lexèmes numériques, valeurs longues en blocs SHA-256 et extensions inconnues uniquement ; l’index reste une projection, `compat_records` garde des métadonnées. Les dix autres collections gardent leurs JSON complets auxiliaires. Les anciennes tables 1/2 avaient déjà été retirées en 2→3.
- Migration 3→4 transactionnelle : vérification des blocs historiques, UTF-8, validation, écriture, relecture SQLite, comparaison de fidélité et contrôle des relations avant retrait des anciens blocs véhicules. Les erreurs forcent un rollback. La lecture des véhicules refuse les clés répétées, même imbriquées, et les jetons numériques trop longs pour être lus strictement ; une migration peut ainsi être bloquée sans réécriture silencieuse. Les données déjà perdues avant cette version ne peuvent pas être reconstituées.
- Tests ciblés : 89 réussis, dont schéma v3 réel, 11 collections, photo fictive étiquetée PNG de 5 Mio de données, blocs inégaux ou altérés, rollback forcé, clés dupliquées, Unicode isolé, présence/null et nombre très précis. 224 tests JVM réussis sans échec ni ignoré, avec les jeux de pont fictifs ; lint 0 erreur/17 avertissements. Compilation de l’APK debug et des tests instrumentés réussie ; schémas Room 1 à 4 présents dans les assets de test. Les tests instrumentés ne sont pas exécutés sans appareil/émulateur ; aucune validation beta.10 sur le Windows de l’utilisateur.
- Parcours fictifs en PWA 1.5.1 réelle sous Chromium : export de véhicules, édition de fiche, carnet et import/export, puis retours Room testés. L’arrondi d’une très grande décimale dans la PWA est reconfirmé. PWA 20 tests réussis ; archiveurs Android 12/12, PWA 11/11. Les scripts d’échange ferment leur serveur si Chromium manque au lieu de rester bloqués. Aucun code runtime PWA changé.
- Undo après suppression immédiate, 10 migrations typées, tests physiques, benchmarks et finition fonctionnelle restent à faire. Pas de promesse de vitesse, de compatibilité générale ou de stabilité. Faire une sauvegarde externe vérifiée, tester d’abord sur appareil/émulateur séparé et ne pas forcer une rétrogradation : Room 3/2 ne sait pas ouvrir directement la base Room 4.


## Retour Windows beta.10 et Android 0.4.0-beta.11 — 1er novembre 2026

- L’utilisateur a jugé excessif le temps de `assembleDebug :app:testDebugUnitTest` : **15 min 28 s**, 25 tâches exécutées et 27 à jour. Son rapport indique 224 tests déclarés, 220 réussis, 4 ignorés, aucun échec et 8 min 44,10 s de durée comptabilisée. Les quatre ignorés sont des retours PWA sans leurs fichiers fictifs ; ils ne sont pas des tests réussis. Les durées des tâches Gradle ne sont pas fournies séparément.
- Le projet garde un seul worker et `forkEvery=1` ; les 29 classes Robolectric du rapport représentent environ 8 min 41 s. Un essai local Linux sur 93 tests ciblés donnait 67,75 s avec une JVM par classe et 43,56 s avec quatre classes par JVM ; une première tentative sur toute la suite a perdu le daemon sous forte pression mémoire et a produit des avertissements de ressources. Ce résultat isolé ne prouve pas un gain Windows ni la fiabilité d’un nouveau réglage. Aucun réglage de test n’est changé en beta.11.
- L’utilisateur a demandé de poursuivre : lot structurel choisi = **interventions complètes** après les véhicules. Room 5, migration 4→5 transactionnelle, contrôle des blocs/identités, relecture et comparaison avant retrait des anciens JSON complets des seules interventions. Champs absents/nulls, valeurs longues, nombres exacts et extensions sont pris en compte. Les neuf autres collections restent sur les JSON complets auxiliaires ; la suppression reste différée et l’Undo transactionnel est à faire. PWA 1.5.1 et format JSON inchangés.
- 244 tests JVM réussis, sans échec ni ignoré avec les jeux de pont fictifs ; lint 0 erreur/17 avertissements. 72 tests ciblés, tests PWA 20/20, archiveurs Android 12/12 et PWA 11/11. Échanges fictifs vers la vraie PWA sous Chromium, puis retour Android. APK debug et 12 tests instrumentés compilés ; aucun test instrumenté exécuté, ni essai Windows beta.11 ni mesure physique. Un premier lancement compilation+tests a perdu son daemon dans l’environnement limité ; les contrôles ont été séparés et relancés. Préserver les sauvegardes externes vérifiées.

## 1er novembre 2026 — Module futur Stations & Prix carburants

Ajout du module « Stations & Prix carburants » dans la feuille de route. Fiche fonctionnelle complète transmise par l’utilisateur et isolée dans `docs/module-stations-carburants.md`. Aucun code produit pour ce module, qui reste en attente du socle 0.4.0 stable. Version Android courante : 0.4.0-beta.11. L’identifiant `com.vigieauto.app` est définitivement fixé.

La fiche transmise est conservée telle quelle. Avant une éventuelle réalisation : vérifier la source et les licences, les services de carte/recherche, l’exposition de l’adresse IP et de la zone demandée, ainsi que les limites du cache hors ligne. Les objectifs de performance et l’hypothèse de blocage pour 10 000 entrées ne sont pas des résultats mesurés. Aucun fichier open data n’a été téléchargé ; aucune carte ni dépendance n’a été ajoutée.


## 1er novembre 2026 — Android 0.4.0-beta.12 : source Room complète des pleins

- L’utilisateur demande de poursuivre pendant que ses tests et son build beta.11 sont en cours. Leur résultat est inconnu. Pas de réouverture de l’identité `com.vigieauto.app`, pas d’écran ou code Stations ; la fiche du module reste documentaire et prévue après le socle stable.
- Après les véhicules et interventions, Room 6 ajoute les pleins et recharges complets avec onze champs connus, présence/null, booléen complet/partiel, nombres conservés en texte, valeurs longues et seules extensions inconnues. Les cinq projections et métadonnées restent utilisées ; huit collections gardent leur JSON complet auxiliaire. L’édition conserve les champs inchangés, y compris absence/null et lexèmes numériques.
- Migration 5→6 : ancien bloc vérifié, décodage strict, identité et relation contrôlées, nouvelle source écrite puis relue depuis SQLite et comparée avant retrait des anciens blocs complets des pleins. Les erreurs déclenchent un rollback transactionnel. Les propriétés dupliquées et nombres illisibles fidèlement sont refusés ; on ne peut pas restaurer ce qui était déjà perdu avant la mise à jour.
- 108 tests ciblés réussis, 270 tests JVM réussis, sans échec ni ignoré avec les fichiers fictifs ; lint 0 erreur/17 avertissements. Le premier passage complet a donné 269 succès et un délai dépassé pendant la création d’un véhicule fictif dans un test Compose. La classe concernée a été relancée avec succès (3/3), puis la suite complète a été relancée avec succès ; le diagnostic en cas de nouveau délai a été enrichi, aucune assertion n’a été supprimée. La cause initiale n’est pas identifiée et l’absence de récidive n’est pas garantie.
- Tests instrumentés étendus à 17 et compilés, aucun exécuté sur appareil ou émulateur ici. Jeux fictifs importés, modifiés et réexportés dans la vraie PWA sous Chromium puis repris côté Android ; 20 tests PWA, archiveur Android 12/12 et PWA 11/11. Un appel de contrôle de précision a d’abord été lancé sans son argument de fichier, puis relancé correctement : la limite d’arrondi PWA est reconfirmée. Pas de benchmark physique ni de test Windows beta.12 ici.
- Sauvegarde externe vérifiée et essai sur appareil/émulateur séparé indispensables avant mise à jour : une base Room 6 ne s’ouvre pas directement en Room 5. Format JSON inchangé ; PWA et module Stations sans modification fonctionnelle. Undo immédiat et les huit sources typées restantes restent à faire.


## Retour utilisateur — durée Windows beta.11

- L’utilisateur indique que beta.11 a pris **24 min 27 s** pour `:app:assembleDebug :app:testDebugUnitTest` ; résultat console `BUILD SUCCESSFUL`, 25 tâches exécutées et 27 à jour. Il juge ce temps excessif.
- Sur le Windows de l’utilisateur, la commande `:app:assembleDebug :app:testDebugUnitTest` présentée comme beta.11 a terminé par `BUILD SUCCESSFUL` en 24 min 27 s, avec 25 tâches exécutées et 27 à jour. L’extrait ne précise ni le nombre de tests réussis ou ignorés, ni la durée des tâches ; lint et tests instrumentés ne figuraient pas dans la commande. Les quatre tests de pont peuvent être ignorés sans leurs fixtures, mais on ne sait pas s’ils le sont dans ce passage. Ne pas confondre succès Gradle avec confirmation de tous les tests ou validation sur appareil.
- Ce passage dure 8 min 59 s de plus que le build + tests beta.10 précédent (15 min 28 s) ; les durées de tâches et la différence d’environnement ne sont pas connues. Le worker unique et `forkEvery=1`, soit une JVM par classe, sont une hypothèse à mesurer ; les avertissements SDK ne prouvent pas une cause et aucun dossier SDK ne doit être supprimé à l’aveugle.
- Ce retour est consigné après la livraison de beta.12 dans les documents sources, sans modifier son ZIP déjà vérifié. Aucune optimisation ni modification de code n’est encore considérée comme validée sur Windows.


### Essai local d’isolation des tests, sans changement de version

- Sur beta.12 Linux, comparaison expérimentale par script Gradle externe : 75 tests et 9 classes identiques réussis avec `forkEvery=1` (84,41 s pour la tâche) et `forkEvery=2` (70,95 s). Un seul passage par mode, dans cet ordre : cache et variabilité peuvent jouer. Cinq avertissements CloseGuard de ressources non fermées sont apparus sous `forkEvery=2`. Le résultat ne prouve ni gain sur Windows ni absence de fuite ; le réglage du projet et le ZIP déjà livré restent inchangés.
- Une première sélection de 78 tests avait échoué sous `forkEvery=1` sur le délai du test Compose `BackupVerificationTest`, comme lors d’un premier passage beta.12. Le message diagnostique montrait un état non occupé, aucune erreur affichée et aucune entrée observée ; il ne permet pas d’identifier la cause. Cette même sélection a réussi sous `forkEvery=2`. L’échantillon comparable de 75 tests excluait cette classe seulement pour la mesure ; aucun test n’a été désactivé dans le projet.
- Priorité : analyser les ressources et l’intermittence, puis répéter l’essai et valider la suite complète et Windows avant de modifier l’isolation. Utiliser d’abord le rapport déjà généré chez l’utilisateur, sans lui demander une nouvelle longue exécution.


## Rapport de tests Windows transmis après la commande annoncée beta.11

- L’utilisateur transmet le rapport : 270 tests déclarés, zéro échec, quatre ignorés, durée des classes cumulée **11 min 19,12 s**, généré le 1er novembre 2026 à 18:19:06. 266 tests ont donc réussi ; le « 100 % » concerne les tests exécutés et n’inclut pas les quatre ignorés.
- Le rapport contient les classes `CompleteFillCodecTest`, `RoomCompleteFillTest` et `RoomMigrationV6Test`, absentes de la beta.11 livrée et apparues en beta.12. Il reflète donc du code beta.12 ou une arborescence mélangée ; on ne sait pas encore s’il s’agit du même lancement que la commande annoncée beta.11 à 24 min 27 s. Ne pas en déduire une validation instrumentée sur appareil.
- D’après les noms et annotations du code beta.12 livré, les 33 classes Robolectric représentent 675,628 s cumulées pour 156 tests déclarés (dont 4 ignorés) ; les 12 autres classes, 3,489 s pour 114 tests. `JournalNavigationTest` a pris 54,887 s pour un test, `JournalFormTest` 51,680 s pour cinq, `BackupVerificationTest` 41,287 s pour trois et `ImportCancellationTest` 37,014 s pour quatre. Ces temps incluent les scénarios eux-mêmes et ne démontrent pas à eux seuls le coût de l’initialisation.
- Les quatre tests ignorés sont ceux des retours fictifs PWA. Leurs trois classes cumulent 42,654 s dans le rapport bien qu’aucun des quatre scénarios n’ait été exécuté. Examiner une vérification de préconditions avant simulation en conservant visiblement les tests ignorés et en les exécutant réellement avec leurs fixtures.
- Hypothèse initiale, désormais rectifiée par l’utilisateur : si le rapport correspondait au passage 24 min 27 s, l’écart mathématique avec les durées cumulées serait de 13 min 07,88 s ; ne pas attribuer cet écart uniquement à la compilation ou à une cause non mesurée. Vérifier versionName et versionCode dans le dossier Windows sans lancer de nouveaux tests ; poursuivre l’analyse et ne pas changer l’isolation sans contrôles.
- Le retour est consigné après livraison dans les documents sources ; aucun ZIP de version déjà publié n’a été remplacé ou altéré.


## Version Windows confirmée et essai exploratoire ciblé

- Le dossier actuellement montré par l’utilisateur, `C:\Users\lixe\Documents\VigieAuto`, indique `versionCode = 16` et `versionName = "0.4.0-beta.12"` ; c’est cohérent avec les classes du rapport de 270 tests. Cette lecture n’établit pas à elle seule si ce rapport et la commande de 24 min 27 s sont issus du même lancement, ni si les fichiers sont tous identiques au ZIP.
- Essai exploratoire Linux sur les trois classes de pont, sans fichiers de retour : dans un même lancement Gradle, la tâche de référence a pris 10,84 s et le prototype de vérification précoce 2,20 s, avec `forkEvery=1` et un worker ; un passage par mode, dans cet ordre. Les deux rapports gardent les mêmes 4 tests, tous ignorés. Avec les quatre fixtures fictives, les quatre tests ont réellement réussi sous Gradle ; en JUnit, une fixture présente et une absente donnent une réussite et un ignoré, et un chemin personnel invalide échoue toujours. À ce stade, avant beta.13, ce prototype extérieur n’était pas intégré ; une garde équivalente est ensuite entrée dans le projet en beta.13, sans mesure Windows ni preuve d’un gain global. Durées cumulées des classes 8,460 s contre 0,004 s. Le gain porte uniquement sur ces quatre tests et peut être influencé par l’ordre des passages. Aucune modification du runtime, de l’isolation de la suite ou de l’archive beta.12.
- Les cinq avertissements CloseGuard du précédent échantillon sont dans le XML de `RoomBackupTest` et concernent des ouvertures SQLite/Room ; `MainNavigationBackTest` était la classe immédiatement précédente dans la paire `forkEvery=2`. La chronologie est une piste, pas une identification certaine de la fuite : `RoomBackupTest` ferme déjà explicitement sa base.
- Un premier essai JUnit autonome a échoué à cause d’un mauvais répertoire de travail ; corrigé, il a ensuite dû être arrêté car le lanceur autonome ne terminait pas. Le harnais a été corrigé pour fermer sa JVM après résultat et deux tâches Gradle indépendantes se sont terminées normalement. Aucun comportement de l’application sur téléphone n’est démontré par cet incident du harnais.


## Durée corrigée du lancement Windows beta.12

- L’utilisateur précise que le lancement correspondant au rapport de 270 tests a duré **25 min 26 s**, et non les 24 min 27 s utilisées dans notre hypothèse précédente. Le dossier Windows courant est beta.12, code 16, et le rapport comprend les tests introduits en beta.12. Une ancienne commande annoncée comme beta.11 avait été indiquée à 24 min 27 s ; les données présentes ne prouvent pas si c’est un autre lancement ou une correction de durée.
- 270 tests recensés : 266 réussis, quatre ignorés, zéro échec. La somme des durées de classes est **11 min 19,117 s** ; l’écart arithmétique avec les 25 min 26 s est **14 min 06,883 s** (environ 14 min 07 s). Cet écart ne mesure pas la compilation seule et ne répartit pas les temps d’amorçage JVM, orchestration ou autres tâches.
- Le prototype des quatre tests de pont ignorés reste une piste limitée ; il ne traite pas à lui seul la durée globale. Conserver la priorité à l’analyse des initialisations Robolectric, des ressources SQLite et des tâches Gradle, sans suppression de tests ni changement d’isolation avant validation. Ne pas demander à l’utilisateur de relancer maintenant la suite longue.
- Au prochain build utile, l’option Gradle `--profile` pourrait fournir des durées par tâche pour **ce futur lancement**, sans permettre de reconstituer celles du passage déjà terminé.


## 1er novembre 2026 — Android 0.4.0-beta.13 : source Room complète des trajets

- L’utilisateur demande de poursuivre. Le lot privilégie la quatrième source typée, sans ajouter d’écran Stations, de GPS natif, de Bluetooth ou de NFC. Identifiant fixé `com.vigieauto.app`, PWA familiale et échange JSON manuel inchangés.
- Après véhicules, interventions et pleins, Room 7 ajoute les trajets complets. Les valeurs GPS atypiques que l’ancien validateur autorisait pour les trajets manuels sont conservées séparément au lieu d’être rejetées ou converties ; les trajets GPS invalides restent refusés. Migration 6→7 : contrôle des anciens blocs, écriture puis relecture SQLite et comparaison, retrait seulement après vérification, rollback en cas d’erreur. Sept collections conservent leur JSON complet auxiliaire ; l’Undo immédiat reste à réaliser.
- 304 tests JVM réussis sans échec ni ignoré avec quatre fichiers fictifs ; lint 0 erreur/17 avertissements. 34 tests ciblés réussis. APK debug et 21 scénarios instrumentés compilés ; aucun scénario instrumenté n’a été exécuté sur appareil ou émulateur. Les simulations ne remplacent pas un appareil. Première compilation des tests : trois imports manquants corrigés avant recompilation ; compilation groupée initiale interrompue avant la suite pour corriger la compatibilité et limiter la pression mémoire. Les résultats revendiqués sont ceux des commandes effectivement réussies. La suite réussie a journalisé un échec de nettoyage de polices dans un dossier temporaire Robolectric (`DirectoryNotEmptyException`), sans échec de test ; le dossier temporaire signalé a été retiré après les essais, cause inconnue.
- Les quatre tests de retour PWA sont conservés. Leur précondition est contrôlée avant le démarrage Robolectric : 4 réussis avec fixtures ; 4 ignorés sans fixtures ; 1 réussi et 3 ignorés en cas partiel ; 1 échec volontaire et vérifié pour un chemin personnel fourni mais invalide. L’isolation `forkEvery=1` ne change pas et aucun gain Windows n’est revendiqué. Le précédent rapport Windows beta.12 reste 270 tests, dont 266 réussis et 4 ignorés, en 25 min 26 s ; aucun essai Windows beta.13 effectué ici.
- Des données fictives issues d’un export Android ont été importées et modifiées dans la vraie PWA sous Chromium, puis réimportées sous Android ; les trois valeurs GPS atypiques d’un trajet manuel ont été conservées dans ce parcours. PWA 20/20, sept scénarios consommation, archiveurs Android 12/12 et PWA 11/11. Le premier appel Chromium ne trouvait pas son navigateur ; le chemin du cache a été corrigé avant les essais réussis. Les essais navigateur ne sont pas des essais iPhone.
- PWA 1.5.1 inchangée ; limite d’arrondi JavaScript toujours présente. Sauvegarde externe vérifiée et validation sur appareil/émulateur indispensables avant mise à jour : une ancienne application ne peut pas ouvrir directement Room 7.


## 1er novembre 2026 — Android 0.4.0-beta.14 : source Room complète des rappels

- L’utilisateur demande de poursuivre. Après véhicules, interventions, pleins et trajets, le lot traite les rappels sans nouvel écran ni module Stations. Identifiant `com.vigieauto.app`, PWA familiale et échange JSON manuel inchangés.
- Room 8 : champs connus des rappels typés, présence/null, nombres exacts, extensions et longues valeurs vérifiées ; migration 7→8 avec contrôle, relecture SQLite et comparaison avant retrait des anciens blocs, rollback en cas d’erreur. Six collections gardent encore leurs JSON complets auxiliaires. L’édition ne réécrit que les champs réellement modifiés, y compris pour les anciens rappels sans échéance ; l’Undo immédiat reste à réaliser.
- 337 tests JVM réussis sans échec ni ignoré avec quatre fichiers fictifs ; lint 0 erreur/17 avertissements. 84 tests ciblés réussis. APK debug et 25 scénarios instrumentés compilés ; aucun scénario instrumenté n’a été exécuté sur appareil ou émulateur. Les simulations ne remplacent pas un appareil. Une commande regroupée a été interrompue pendant la compilation des tests après une forte baisse de mémoire disponible ; elle n’est pas comptée comme réussite. Compilation des tests et contrôles suivants ont été lancés séparément.
- Pont fictif Android → vraie PWA sous Chromium (édition puis rappel non récurrent marqué fait) → Android : état terminé et extensions préservés. PWA 20/20, sept scénarios consommation, archiveurs Android 12/12 et PWA 11/11. La PWA peut toujours arrondir les décimales extrêmes ; ces essais ne sont pas des essais iPhone.
- `forkEvery=1` reste inchangé ; aucun gain ou essai Windows beta.14 revendiqué. Le précédent rapport Windows beta.12 reste 270 tests, dont 266 réussis et 4 ignorés, en 25 min 26 s. Sauvegarde externe vérifiée et validation sur appareil/émulateur avant mise à jour ; une ancienne application ne peut pas ouvrir directement Room 8.


## 1er novembre 2026 — Android 0.4.0-beta.15 : source Room complète des dépenses

- L’utilisateur demande de poursuivre. Après véhicules, interventions, pleins, trajets et rappels, le lot traite les dépenses sans nouvel écran ni module Stations. Identifiant `com.vigieauto.app`, PWA familiale et échange JSON manuel inchangés.
- Room 9 : champs connus des dépenses typés, présence/null, montant exact, extensions et longues valeurs vérifiées ; migration 8→9 avec contrôle, relecture SQLite et comparaison avant retrait des anciens blocs, rollback en cas d’erreur. Cinq collections gardent encore leurs JSON complets auxiliaires ; l’Undo immédiat reste à réaliser.
- 365 tests JVM réussis sans échec ni ignoré avec quatre fichiers fictifs ; lint 0 erreur/17 avertissements. 116 tests ciblés réussis. APK debug et 29 scénarios instrumentés compilés ; aucun scénario instrumenté n’a été exécuté sur appareil ou émulateur. Les simulations ne remplacent pas un appareil. Suite complète incrémentale : 5 min 49 s sous Linux, hors compilation initiale et génération du pont ; aucune extrapolation Windows.
- Pont fictif Android → vraie PWA sous Chromium (modification d’une dépense et rappel non récurrent marqué fait) → Android : montant ordinaire, véhicule et extensions préservés. PWA 20/20, sept scénarios consommation, archiveurs Android 13/13 et PWA 11/11. L’option d’archivage sans nettoyage permet de vérifier indépendamment le ZIP avant rétention. La PWA peut toujours arrondir les décimales extrêmes ; ces essais ne sont pas des essais iPhone.
- `forkEvery=1` reste inchangé ; aucun gain ou essai Windows beta.15 revendiqué. Le précédent rapport Windows beta.12 reste 270 tests, dont 266 réussis et 4 ignorés, en 25 min 26 s. Sauvegarde externe vérifiée et validation sur appareil/émulateur avant mise à jour ; une ancienne application ne peut pas ouvrir directement Room 9.


## 1er novembre 2026 — Android 0.4.0-beta.16 : source Room complète des symptômes

- L’utilisateur demande de poursuivre. Après véhicules, interventions, pleins, trajets, rappels et dépenses, le lot traite les symptômes sans nouvel écran ni module Stations. Identifiant `com.vigieauto.app`, PWA familiale et échange JSON manuel inchangés.
- Room 10 : champs connus des symptômes typés, présence/null, kilométrage exact, extensions et longues valeurs vérifiées ; migration 9→10 avec contrôle, relecture SQLite et comparaison avant retrait des anciens blocs, rollback en cas d’erreur. Quatre collections gardent encore leurs JSON complets auxiliaires ; l’Undo immédiat reste à réaliser.
- 395 tests JVM réussis sans échec ni ignoré avec quatre fichiers fictifs ; lint 0 erreur/17 avertissements. 126 tests ciblés réussis. APK debug et 34 scénarios instrumentés compilés ; aucun scénario instrumenté n’a été exécuté sur appareil ou émulateur. Les simulations ne remplacent pas un appareil. Suite complète incrémentale : 6 min 40 s sous Linux, hors compilation initiale et génération du pont ; aucune extrapolation Windows.
- Pont fictif Android → vraie PWA sous Chromium (modification et résolution d’un symptôme) → Android : description, statut, véhicule et extensions préservés. PWA 20/20, sept scénarios consommation, archiveurs Android 13/13 et PWA 11/11. La PWA peut toujours arrondir les décimales extrêmes et normaliser certains champs à l’édition ; ces essais ne sont pas des essais iPhone.
- `forkEvery=1` reste inchangé ; aucun gain ou essai Windows beta.16 revendiqué. Le précédent rapport Windows beta.12 reste 270 tests, dont 266 réussis et 4 ignorés, en 25 min 26 s. Sauvegarde externe vérifiée et validation sur appareil/émulateur avant mise à jour ; une ancienne application ne peut pas ouvrir directement Room 10.


## 1er novembre 2026 — Récapitulatif utilisateur et choix de priorités après beta.16

- L’utilisateur fournit un récapitulatif détaillé des huit priorités et pose la question : terminer intégralement la phase 1 ou repousser quatre migrations pour passer plus vite aux écrans visibles. Il précise que chaque catégorie restante doit avoir son propre sous-lot et laisse le choix.
- Choix de l’assistant : ordre strict, avec sous-lots distincts documents, modèles CQ, contrôles réalisés et réglages. Plusieurs sous-lots validés peuvent être réunis dans une livraison pour limiter les compilations et archives redondantes, sans supprimer les tests ou regrouper leurs migrations. Undo immédiat, essais appareil/émulateur, finitions visuelles, CI/R8/profils/mesures et correction de la précision PWA font aussi partie du socle demandé.
- La liste détaillée et les demandes futures (véhicules, carnet avec lien plein/dépense sans double comptage, graphiques et exports, GPS facultatif, stations après 0.4.0 stable, confort et bonus) sont conservées dans `PLAN-PRIORITES-APRES-BETA16.md`. Les 80 %/40 % proposés, le gain de 20–40 % des profils et la cible de compression sont indicatifs, non mesurés ni garantis.
- Mise à jour documentaire uniquement : aucun code ni écran ajouté, aucun test ou nouvelle version revendiqué. Le ZIP beta.16 publié reste immuable et ne contient pas ce nouveau plan ; l’inclure dans la prochaine livraison. Sauvegardes externes et distinction tests simulés / tests sur appareil restent indispensables.


## 1er novembre 2026 — Android 0.4.0-beta.17 : sous-lot Documents

- L’utilisateur accepte le plan « D’accord, vas-y ». Après les sept collections précédentes, le sous-lot Documents est réalisé séparément, sans nouvel écran ni module Stations. La PWA familiale reste 1.5.1, sans changement de code ni échange automatique.
- Room 11 : champs connus, absence/null, taille exacte, pièce jointe et extensions ; migration 10→11 avec contrôle, relecture SQLite et comparaison avant retrait des anciens blocs, rollback en cas d’erreur. Trois collections gardent encore leurs JSON complets auxiliaires ; l’Undo immédiat reste à réaliser. Le validateur ne vérifie toujours pas rétroactivement le décodage réel ou l’adéquation taille/type.
- 428 tests JVM réussis sans échec ni ignoré avec cinq fichiers fictifs ; lint 0 erreur/17 avertissements. 59 tests ciblés réussis. APK debug et 39 scénarios instrumentés compilés ; aucun scénario instrumenté n’a été exécuté sur appareil ou émulateur. Les simulations ne remplacent pas un appareil. Suite complète incrémentale : 7 min 18 s sous Linux, hors compilation initiale et génération des ponts ; aucune extrapolation Windows.
- Pont fictif Android → vraie PWA sous Chromium : téléchargement d’une pièce jointe synthétique de 5 Mio avec SHA-256 `16b632f11cf950dda67dc4c184a3f9e0aa1ffa4c18927bb8977e7da97ca25bca`, ajout d’un PNG, puis retour en Room. La PWA ne permet pas d’éditer un document existant et peut toujours arrondir les décimales extrêmes. PWA 20/20, sept scénarios consommation, archiveurs Android 13/13 et PWA 11/11 ; ce ne sont pas des essais iPhone.
- `forkEvery=1` reste inchangé ; aucun gain ou essai Windows beta.17 revendiqué. Sauvegarde externe vérifiée et validation sur appareil/émulateur avant mise à jour ; une ancienne application ne peut pas ouvrir directement Room 11. Les étapes restantes de la phase 1 et les huit priorités demeurent dans `PLAN-PRIORITES-APRES-BETA16.md`.

## 1er novembre 2026 — Android 0.4.0-beta.18 : modèles CQ, contrôles et réglages

- Demande de poursuivre les fondations avant les nouveaux écrans, en maintenant des sous-lots et des migrations indépendants. Documents était déjà livré en beta.17.
- Room 14 : trois migrations séparées 11→12 (modèles CQ), 12→13 (contrôles effectués) et 13→14 (réglages). Chaque migration valide, écrit, relit dans SQLite et compare avant de retirer les anciens blocs de sa collection, en transaction. Les onze collections reconnues sont désormais reconstruites depuis des champs ou nœuds typés et leurs seules valeurs/extensions, sans copie JSON complète auxiliaire. Les projections et la table historique `compat_chunks` restent dans le schéma ; des blocs pour valeurs longues et pièces jointes restent nécessaires. Aucun nouvel écran ni modification du format JSON v3 ou de la PWA 1.5.1. Les tests couvrent notamment extensions, ordre, grandes valeurs, corruption, contrôle des clés étrangères et rollback ; un historique de contrôle peut survivre à la suppression de son modèle.
- 490 tests JVM sur 72 classes réussis, zéro échec ni ignoré, avec sept fichiers fictifs ; lint 0 erreur/17 avertissements. La suite incrémentale a pris 9m 28s sous Linux, hors compilation initiale et génération des fixtures ; cette durée ne prédit pas le temps Windows. APK debug compilé et 54 scénarios instrumentés compilés mais non exécutés sur appareil ou émulateur. Aucun essai Windows beta.18 ni benchmark physique ; `forkEvery=1` inchangé. Les 82 tests ciblés distincts comprennent des recouvrements et ne s’ajoutent pas à la suite complète. Pont fictif Chromium CQ/contrôles/réglages, autres ponts, PWA 20/20, consommation 7/7 et archiveurs 13/13 et 11/11.
- Les tests réels de la PWA sous Chromium confirment deux limites : les nombres JSON très grands ou précis peuvent être arrondis, et changer de thème peut supprimer les propriétés inconnues du réglage `theme`. L’édition PWA des points CQ peut également reconstruire leurs objets et perdre leurs extensions. Ces limites ne sont pas corrigées ; conserver les sauvegardes originales et les vérifier avant tout échange. La PWA 1.5.1 n’a pas été modifiée. La phase 1 reste inachevée : Undo immédiat transactionnel, validation sur émulateur puis téléphone, finitions, CI/R8/profils et mesures, et fidélité numérique PWA restent à faire. Ces onze catégories concernent le rangement des données, pas un pourcentage d’avancement de l’application.
- La livraison est un ZIP source Android, racine `VigieAuto`. Sauvegardes externes vérifiées indispensables ; pas de validation sur téléphone, Windows ou iPhone ni de garantie de performances.

## 2 novembre 2026 — Android beta.19 : véritable Undo du carnet

- **Demande :** après la beta.18, « Passe à la suite ! » ; poursuivre les fondations de la phase 1 sans nouveaux écrans et remplacer la suppression différée par une suppression immédiate avec restauration transactionnelle.
- **Réalisation :** Room 15 et migration 14→15 : suppression immédiate des entretiens, pleins, trajets et rappels ; image typée relue et conservée dans la même transaction, restauration complète dans une autre transaction. Une seule annulation, au moins 10 secondes au premier plan ; reprise après réouverture avant 24 h. Une deuxième suppression réussie ou un import réussi invalide l’annulation précédente ; export sans élément supprimé. Conflits d’identifiant, véhicule recréé et second trajet actif refusés ; sauvegarde externe indispensable. Voir `UNDO-CARNET.md` et `MIGRATION-V14-V15.md`.
- **Politique :** l’export représente toujours le carnet actif ; le retour d’une précédente sauvegarde est inchangé. Une nouvelle suppression confirmée rend la précédente définitive. Import réussi : invalidation atomique ; import échoué : données et Undo conservés. Fenêtre au premier plan adaptée à l’accessibilité, conservée après réouverture moins de 24 h, nettoyage paresseux et horloge reculée documentés.
- **Sécurité :** refus de remplacer un identifiant recréé, de rattacher une entrée à un parent recréé ou de créer un deuxième trajet en cours ; modifications normales du parent préservées. Une sauvegarde JSON externe vérifiée reste nécessaire ; aucune garantie d’effacement physique immédiat.
- **Contrôles :** 512 tests JVM sur 74 classes réussis, sans échec ni ignoré, avec sept fichiers fictifs ; lint 0 erreur/17 avertissements. La suite incrémentale Linux a pris 7 min 35 s, hors compilations initiales et génération des fixtures ; ce temps ne prédit pas Windows. Pont fictif Undo Room → vraie PWA Chromium → Room vérifié ; PWA 20/20, consommation 7/7, archiveurs Android 14/14 et PWA 11/11. APK debug compilé et 57 scénarios instrumentés compilés mais non exécutés sur appareil ou émulateur. Trois avertissements CloseGuard SQLite/Room en tests simulés restent à diagnostiquer ; aucun essai Windows beta.19 ni benchmark physique. `forkEvery=1` inchangé.
- **Sécurité des outils de test PWA :** `npm audit` a signalé Playwright 1.55.0, dépendance de développement du manifeste historique, pour un défaut TLS lors du téléchargement des navigateurs ([GHSA-7mvr-c777-76hp](https://github.com/advisories/GHSA-7mvr-c777-76hp)). Les ponts beta.19 ont été relancés avec Playwright 1.55.1 installé temporairement sans modifier le manifeste et avec un navigateur téléchargé ensuite. Une mise à jour permanente reste à prévoir ; l’APK et le runtime PWA ne contiennent pas Playwright.
- **Reste à faire :** essais réels sur émulateur/téléphone, finitions, CI/R8/profils et mesures, correction de la précision PWA ; le module Stations reste documentaire et ultérieur. PWA 1.5.1 inchangée. Pas de déclaration de phase 1 terminée ni d’objectif de performance atteint.


## Poursuite des fondations — PWA 1.5.2-beta.1 et Android 0.4.0-beta.20

### Demande et choix

- L’utilisateur demande de poursuivre après la livraison beta.19 ; priorité conservée : terminer les fondations avant les nouveaux écrans et travailler vite sans supprimer les vérifications essentielles. Le point d’arrondi PWA est traité avec des données fictives.
- La PWA 1.5.1 et les sauvegardes originales sont conservées pour la famille ; la nouvelle PWA est une **candidate**, pas une validation sur iPhone. Le module Stations reste documentaire.

### Réalisé et contrôlé

- **Beta.20 / PWA 1.5.2-beta.1 candidate :** les nombres très précis des extensions restent numériques et sont réexportés sans arrondi dans les scénarios testés. Un nombre fonctionnel trop précis ou trop grand est refusé avant remplacement ; les données déjà arrondies ne peuvent pas être reconstituées. Le thème et les propriétés supplémentaires des points CQ édités sont préservés. Base PWA IndexedDB 2→3 ; retour direct à 1.5.1 sur la même base bloqué. La PWA 1.5.1 demeure la référence familiale jusqu’aux essais réels ; aucun iPhone n’a été testé. Room 15 et JSON v3 inchangés côté Android. Voir [PRECISION-SAUVEGARDES.md](PRECISION-SAUVEGARDES.md).
- **Édition CQ candidate :** chaque point existant est présenté séparément et peut être déplacé, supprimé ou complété sans attribuer ses extensions à un autre point ; les identifiants vides/répétés et titres existants non modifiés sont conservés.
- Deux tests ciblés Android `PrecisionBridgeTest` réussis par Gradle (retour Chromium), retour WebKit contrôlé séparément par Gradle dans Room, 30 tests unitaires PWA, parcours d’interface et migration 1.5.1 → candidate testés sur Chromium et WebKit automatisés, sept scénarios consommation et archives Android/PWA 15/15 chacune. APK debug beta.20 et 57 scénarios instrumentés compilés ; lint 0 erreur/17 avertissements. Aucun scénario instrumenté n’a été exécuté. La suite Android complète beta.20, Windows beta.20 et les appareils réels ne sont pas revendiqués. Une première tentative Gradle a perdu son daemon ; les contrôles ciblés séparés ont ensuite réussi, sans diagnostic certain ni gain Windows mesuré.
- Les limites et la procédure de pont sont décrites dans `PRECISION-SAUVEGARDES.md`. Playwright de test est fixé à 1.55.1, sans dépendance ajoutée au runtime.

### Reste à faire

- Essais après sauvegarde sur iPhone/Safari réel, émulateur et téléphone Android ; validation des cas exceptionnels refusés, finitions, CI/R8/profilage et mesures. La phase 1 n’est pas déclarée achevée. Les performances, délais et absence de défaut ne sont pas garantis.


## Poursuite des fondations — Android 0.4.0-beta.21

- CI préparée : un workflow GitHub Actions compile Android, lance lint et la suite JVM, puis vérifie les rapports. Huit retours de pont sans PWA sont annoncés ignorés, jamais comptés comme réussis ; toute autre omission inattendue bloque le contrôle. Deux émulateurs API 26/36 peuvent être demandés manuellement, avec comparaison des 57 scénarios attendus. Les actions sont épinglées, aucun secret ni APK n’est publié, et les noms d’export habituels sont ajoutés à `.gitignore` sans remplacer une vérification manuelle. Le workflow n’a pas encore tourné sur GitHub ; les émulateurs et téléphones ne sont pas testés ici. Aucun changement métier Android, Room 15 et JSON v3 inchangés ; PWA familiale 1.5.1 et candidate 1.5.2-beta.1 inchangées. La phase 1 reste ouverte. Voir [CI-VERIFICATIONS.md](CI-VERIFICATIONS.md).
- La suite JVM locale recense 514 tests sur 75 classes : **506 réussis, huit ignorés faute de fixtures PWA et aucun échec** ; les rapports réels ont été contrôlés. APK debug et 57 scénarios instrumentés compilés ; lint : 0 erreur et 17 avertissements. Les tests de scripts passent (rapports 17/17, workflow 6/6 et archiveur 16/16), ainsi que l’analyse statique actionlint. Deux avertissements CloseGuard SQLite/Room subsistent dans une simulation, sans cause déterminée.
- Aucun appareil, émulateur ou Windows beta.21 n’a été testé ici ; aucun dépôt GitHub n’a été modifié. Les sauvegardes personnelles restent exclues ; il faut contrôler manuellement ce que l’on publie.
- Première tentative locale arrêtée à la compilation avec une limite expérimentale de 384 Mio ; compilation réussie à 640 Mio puis suite relancée séparément en 8 min 55 s, hors compilations initiales et sans fixtures PWA. Ce temps n’est pas un benchmark Windows.

## 2 novembre 2026 — Décision : rappels semi-automatiques par mémorisation

L’utilisateur demande si les rappels peuvent être créés à la saisie d’un entretien et propose de consigner la décision sans modifier le code. Après examen de trois niveaux :

- **Niveau 1 — mémorisation : retenu, non implémenté.** L’application apprendra les intervalles saisis par véhicule et par type d’entretien normalisé, puis pré-remplira le rappel avec confirmation, modification ou désactivation explicite. Pas de création silencieuse ; saisie libre et fonctionnement local préservés. Deux ou trois observations cohérentes signaleraient une répétition, pas une préconisation constructeur ni la garantie que l’intervalle est adapté.
- **Niveau 2 — récurrence après « fait » : partiellement existant.** Le rappel récurrent existant est recalculé ; le lien facultatif vers un entretien pré-rempli et la reconduction de l’échéance suivante sont prévus en phase 3. Concevoir l’enchaînement sans doublon et sans perte en cas d’abandon ou d’échec.
- **Niveau 3 — base constructeur : exclu.** Pas de base ni de service externe de préconisations ; les habitudes personnelles ne remplacent pas le carnet du véhicule ou un professionnel.

Positionnement : phase 3 — Carnet complet, après le socle stable et les véhicules complets. La table de profils, la normalisation, l’échange JSON et les migrations restent à concevoir ; aucune donnée ancienne n’est modifiée rétroactivement.

**Précision sur l’existant :** Android beta.21 et la PWA utilisent actuellement une récurrence en **jours et/ou kilomètres**, pas en mois calendaires. Une correction de compteur ne modifie pas les anciens entretiens ; l’Android actuel ne conserve pas d’historique détaillé des corrections. Aucun code ni aucune version de l’application n’a changé pour cette décision documentaire. Les fichiers sont actualisés dans le dossier source Android ; le ZIP beta.21 déjà livré reste inchangé et ne contient pas cet ajout. Les essais sur émulateur/téléphone, la première exécution GitHub, les finitions et les mesures de phase 1 restent à faire.

## 2 novembre 2026 — Poursuite du code : Android 0.4.0-beta.22

- **Demande et priorité :** « Passe à la suite du code ! » après la décision documentaire sur les rappels ; terminer le socle avant les nouveaux écrans et conserver des contrôles adaptés sans prétendre avoir testé les appareils.
- **Diagnostic :** avant modification, le ciblage Linux `MainNavigationBackTest` a réussi 7 tests et reproduit les deux avertissements CloseGuard. Les piles montrent une ouverture SQLite par Room, tandis que la base singleton et le scope Hilt du processus simulé n’étaient pas clos en fin de scénario. C’est un indice de nettoyage du test, pas une preuve de fuite sur téléphone ou de cause unique des anciens incidents Windows.
- **Code et tests :** point d’entrée Hilt dans les seules sources debug ; après chaque test de navigation, fermeture de l’Activity, attente du ViewModel et des enfants du scope applicatif, arrêt du scope et fermeture de Room, avec délais bornés et vérification. Trois régressions contrôlent l’ordre, la recréation d’Activity avec la même base ouverte, et l’attente d’un nettoyage applicatif en cours. Le code métier et le cycle de vie de la base réelle ne changent pas ; `forkEvery=1` reste inchangé. Voir `TESTS-RESSOURCES.md`.
- **Rapports et archivage :** le contrôleur exige les trois nouveaux tests et signale, de manière non bloquante et sans recopier les traces, le marqueur CloseGuard reconnu. Il ne détecte pas toutes les fuites. L’archiveur exige le fichier debug et le document de diagnostic. Les documents incluent la décision de rappels précédente, toujours non implémentée.
- **Vérifications Linux :** APK debug et 57 scénarios instrumentés compilés ; ciblage navigation + SQLite 13/13 puis navigation 10/10 sans marqueur reconnu, alors que le rapport avant correction en contenait deux. Suite JVM complète : **517 tests réussis sur 75 classes, aucun échec ni ignoré**, sans marqueur reconnu dans ses rapports ; les huit retours de pont ont réutilisé des fichiers fictifs de validations PWA antérieures, sans nouveau lancement navigateur. Durée incrémentale 8 min 33 s hors compilation initiale et génération antérieure des fichiers, non transposable à Windows. Lint : 0 erreur et 17 avertissements. Scripts : rapports 19/19, workflow 6/6, archiveur 17/17 et actionlint réussi.
- **Limites :** pas d’essai Windows beta.22, pas de lancement GitHub, pas de migration instrumentée exécutée sur émulateur ou téléphone, pas d’analyse de fuite ni de mesure de performance physique. PWA inchangée, Room 15 et JSON v3 inchangés ; les rappels par habitudes restent prévus en phase 3, pas implémentés. La phase 1 reste ouverte.

## 3 novembre 2026 — Poursuite du socle : Android 0.4.0-beta.23

- **Demande et choix :** « Poursuis ! » ; continuer les fondations de la phase 1 avant de nouveaux écrans. Risque identifié : une lecture initiale échouée pouvait être prise pour un carnet vide, et la reprise de l’annulation initiale restait peu explicite.
- **Code :** états distincts chargement, résumés disponibles et résumés indisponibles, y compris si la surveillance se termine de manière inattendue ; reprise des lectures et du chargement d’Undo ; messages sans détails techniques pour ces erreurs et l’entretien initial. Les suggestions restent facultatives et la saisie libre possible.
- **Protection et interface :** modifications manuelles et confirmation de remplacement par import bloquées si l’état des résumés ou l’Undo ne sont pas prêts. L’écran ancien reste masqué pendant cette attente, tandis que la navigation et les formulaires restent en mémoire pour une reprise, sans garantie après arrêt du processus. Une opération déjà engagée peut se terminer. Aucun pourcentage fictif de progression ; aucune remise à zéro de la base par « Réessayer ».
- **Diagnostic des tests :** un premier lancement Compose n’a pas pu démarrer les simulations faute d’un dossier de cache Robolectric dans l’environnement éphémère ; après création du dossier, un scénario Undo a dépassé son délai car son attente du ViewModel ne faisait pas avancer le Looper simulé. L’attente est corrigée et le scénario isolé a réussi. Une première compilation combinée a été interrompue sur pression mémoire et les compilations ont été séparées. Aucun de ces épisodes ne permet de conclure sur Windows ou un appareil.
- **Vérifications :** Suite JVM Linux beta.23 : **530 tests, 522 réussis, huit ignorés faute de fixtures PWA et aucun échec**, sur 76 classes. Lancement incrémental : 6 min 59 s, hors compilations et téléchargements ; ce temps ne prédit pas Windows. Le contrôleur accepte uniquement ces huit omissions attendues ; aucun marqueur CloseGuard reconnu, sans preuve d’absence de fuite. Aucun nouveau parcours PWA n’a été exécuté pour ce lot. Les tests Python réussissent : rapports 19/19, workflow 6/6, archiveur 18/18. APK debug, tests JVM et 57 scénarios instrumentés compilés ; scénarios instrumentés non exécutés. Lint : 0 erreur et 17 avertissements. Ciblage final du ViewModel et du parcours Undo : 41/41.
- **Limites :** Room 15, format JSON v3 et PWA inchangés ; voir `LECTURE-DU-CARNET.md`. Une lecture des résumés réussie n’est pas un contrôle complet de l’intégrité. Pas de lancement GitHub ni de tests réels sur émulateur/téléphone/Windows dans cet environnement ; phase 1 encore ouverte, candidate PWA non validée sur iPhone, aucune performance mesurée sur appareil.

## 4 novembre 2026 — Poursuite du socle : Android 0.4.0-beta.24

- **Demande et priorité :** « PoursuisPoursuis » ; poursuivre les fondations phase 1. La beta.23 signalait qu’un chargement sans erreur pouvait rester bloqué sans proposer de reprise, avec risque de perdre une saisie non enregistrée en quittant.
- **Interface :** au bout de dix secondes de chargement, « Réessayer » devient disponible dans l’écran d’état et au-dessus d’un formulaire. Ce seuil n’est ni un diagnostic de panne ni une mesure de performance ; aucune reprise n’est déclenchée automatiquement et aucun pourcentage fictif n’est affiché.
- **Protection :** une tentative de lecture des résumés peut être relancée pendant un chargement. Pour l’Undo, l’ancienne tentative est annulée et réellement attendue avant une nouvelle ; un résultat annulé ne déverrouille pas les écritures. La reprise peut elle-même attendre indéfiniment une opération non coopérative. Aucun bouton ne réinitialise la base.
- **Brouillons :** le formulaire reste en mémoire sous le message et la sauvegarde reste bloquée tant que les lectures nécessaires ne sont pas disponibles. L’arrêt du processus ou de l’application peut encore perdre une saisie non enregistrée ; les sauvegardes JSON externes restent indispensables.
- **Contrôles :** Suite JVM Linux : 534 tests, 526 réussis, huit retours PWA ignorés faute de fixtures et aucun échec. Un test tactile ajouté ensuite a été vérifié avec un reciblage de 50/50 tests ; ces deux lancements ne sont pas une unique suite de 535 tests. Les 57 scénarios instrumentés sont compilés, pas exécutés ; aucun nouvel essai Windows, GitHub, émulateur, téléphone ou PWA pour ce lot. Le contrôleur CI vérifie cinq scénarios essentiels de ce lot ; tests Python 20/20, 6/6 et 18/18, lint zéro erreur/17 avertissements. Aucun marqueur CloseGuard reconnu, sans preuve d’absence de fuite.
- **Périmètre et limites :** Room 15, format JSON v3, PWA et priorités inchangés ; tests instrumentés sur émulateur ou téléphone, validation Windows, première exécution GitHub, R8 et mesures réelles restent à faire. La phase 1 n’est pas terminée ; la candidate PWA reste à valider sur iPhone.

## 4 novembre 2026 — Point d’avancement et poursuite : Android 0.4.0-beta.25

- **Demande :** « Poursuis, je ne sais pas où tu en es ». Poursuivre la phase 1 et rendre l’état du projet lisible, sans inventer de pourcentage ou déclarer les tests physiques déjà faits. Ajout du guide `OU-EN-EST-VIGIEAUTO.md` : fonctionnalités disponibles, limites, ordre des prochaines phases et sauvegarde externe.
- **Travail retenu :** préparer l’étude de R8, explicitement dans les priorités du socle, sans toucher aux données de l’installation habituelle. La variante `r8Test` utilise `com.vigieauto.app.r8test`, le nom de lanceur « TEST R8 - VigieAuto », sa propre base et la clé de debug du poste. Elle n’est pas une release signée de production.
- **Garde-fous :** réduction du code et des ressources uniquement dans cette variante, contrôle statique de l’identité, de la signature, des permissions, du catalogue et de la correspondance Room ; tests synthétiques du contrôleur et garde de configuration. CI modifiée pour préparer les contrôles, sans exécution GitHub revendiquée.
- **Périmètre :** le code métier, les données locales de l’application normale, Room 15, JSON v3 et la PWA ne sont pas modifiés par ce lot. Les tests JVM ne font pas tourner le code minifié ; avant adoption de R8, les parcours, sauvegardes et migrations doivent être essayés sur émulateur/téléphone avec des données fictives.
- **Mémoire et méthode :** un premier essai R8 limité à 640 Mio de tas a été interrompu après forte pression du ramasse-miettes ; à 1 Gio, R8 s’est terminé mais le lint vital est resté bloqué dans le même processus sous pression mémoire. L’assemblage a été séparé du lint vital, sans supprimer ce contrôle : il doit être lancé juste après, sur un processus distinct. Aucune amélioration de durée Windows n’est démontrée.
- **Contrôles :** variante R8 isolée compilée et contrôlée statiquement, 76/76 tests ciblés du code non minifié, lint debug zéro erreur/17 avertissements et lint vital R8 sans anomalie. Les 57 scénarios instrumentés debug sont compilés mais non exécutés. Pas de suite JVM complète beta.25 ni d’essai GitHub, Windows, émulateur ou téléphone ; la variante R8 n’a pas été lancée. Tests Python R8/rapports/workflow/archiveur : 22/22, 21/21, 7/7 et 19/19. Le paquet R8 d’essai fait 1 989 477 octets localement, sans valider une taille de release de production.

## 4 novembre 2026 — Nouvelles priorités et photo : Android 0.4.0-beta.26

- **Demande et décision :** l’utilisateur préfère attendre les essais sur son téléphone et poursuivre les phases principales. Il souhaite essayer en voiture après disponibilité du GPS natif et de l’assistance par autoradio Bluetooth déjà associé : proposition de démarrage, confirmation explicite, vitesse/distance/durée par GPS, proposition d’arrêt et de sauvegarde à la déconnexion ; aucun boîtier OBD nécessaire. Il exécute à chaque ZIP `:app:assembleDebug :app:testDebugUnitTest` dans Android Studio avec l’émulateur ouvert : ces tests sont JVM sur l’ordinateur, pas instrumentés sur cet émulateur. Aucun nouvel essai téléphone n’est demandé à ce stade.
- **Modification de l’ordre :** la priorité antérieure « terminer et valider entièrement la phase 1 avant les nouveaux écrans » est remplacée par une progression par lots fonctionnels sans attendre les appareils, tout en poursuivant les contrôles ouverts. La phase 1 reste incomplète et 0.4.0 n’est pas stable. Stations restent conditionnées à la stabilité 0.4.0 ; rappels semi-automatiques documentés mais non implémentés.
- **Photo Android :** sélecteur de galerie/fichiers, image bornée, orientation EXIF et JPEG allégé sans métadonnées recopiées, aperçu du véhicule actif, confirmation remplacement/retrait ; transaction sur la photo et l’horodatage avec vérification d’empreinte, sans réécrire les collections liées. Copie privée temporaire sous bail et tentative de nettoyage ; absence de prise de vue directe et d’Undo. Voir `PHOTO-VEHICULE.md`.
- **Sécurité et compatibilité :** aucune permission générale ajoutée, Room 15 et JSON v3 inchangés ; PWA non modifiée. Les photos déjà importées restent conservées même sans aperçu. Sauvegardes non chiffrées ; import remplaçant le destinataire.
- **Contrôles :** Avant la correction EXIF : suite JVM complète **548 réussis et 8 ignorés**, lint zéro erreur/20 avertissements et 61 scénarios instrumentés compilés mais non exécutés. Après remplacement par AndroidX : APK debug compilé, **73/73 tests ciblés réussis** et pont photo fictif Android ↔ PWA stable et candidate vérifié sous Chromium. La suite complète et le lint n’ont pas été relancés après la correction ; la recompilation des instrumentés après correction n’est pas confirmée. Aucun essai Android beta.26 sur Windows, GitHub, émulateur ou téléphone.
- **Limites :** pas de tests réels sur Windows, émulateur, téléphone, iPhone ou GitHub pour beta.26 ; ni GPS Android ni Bluetooth ne sont implémentés à ce lot. Les résultats R8 isolés de beta.25 ne valident pas beta.26. Les mesures physiques, la validation iPhone et la stabilité restent ouvertes ; voir `BLUETOOTH-GPS-VOITURE.md` et `PERFORMANCES.md`.

## 4 novembre 2026 — Installation PWA Android et décisions d’enrichissement du carnet

**Faits rapportés par l’utilisateur :** la candidate PWA 1.5.2-beta.1 a été installée depuis [GitHub Pages](https://luana34.github.io/VigieAuto-PWA/) sur un téléphone Android ; l’import de sa sauvegarde JSON personnelle a fonctionné sans perte constatée. Ce retour n’est pas une vérification indépendante ou exhaustive des données. L’iPhone n’est pas disponible ; la validation Safari iOS est reportée. La comparaison avec Drivvo, évoquée avec des captures d’écran, a motivé ces demandes.

**Décisions, non implémentées :**
1. Plusieurs pièces/opérations par entretien, coûts individuels, total calculé, main-d’œuvre séparée et plusieurs catégories.
2. Sélecteur de catégorie plein écran avec recherche, défilement ne provoquant pas volontairement sa fermeture ; flèche, Retour ou sélection explicite pour sortir. Les gestes système restent à vérifier.
3. Dix familles de catégories avec recherche et « Autre… » mémorisé ; liste complète dans [la spécification](ENTRETIEN-FORMULAIRE-SPECIFICATION.md).
4. Lien facultatif vers une app de cartes à partir du nom du lieu ou de la station ; son fournisseur reçoit la requête et les comportements Android/iPhone restent à tester.
5. Sous-types de carburant et de recharge, suggestions par énergie, saisie libre et mémoire locale par véhicule.
6. Objectif de compatibilité JSON v3 et conservation des sauvegardes à vérifier sur les vraies structures et anciennes versions ; l’exemple fourni est conceptuel, pas un fichier importable.

**Positionnement :** phase 3, **PWA d’abord, portage Android ensuite** ; l’indisponibilité d’un iPhone ne bloque pas le développement mais laisse sa validation ouverte. Aucun code n’est modifié par ces nouvelles décisions ; la photo Android beta.26 est un lot de code distinct. Voir [§3.6](PLAN-PRIORITES-APRES-BETA16.md#enrichissement-carnet).

## 4 novembre 2026 — PWA 1.5.2-beta.2 candidate : premier carnet enrichi

Après la demande de poursuivre, développement PWA d’abord : lignes de pièces en centimes et main-d’œuvre distincte ; catégories multiples, nomenclature par familles, recherche plein écran et « Autre… » local ; sous-types libres suggérés par véhicule ; bouton facultatif de recherche Google Maps. Les détails et catégories sont des extensions facultatives à l’intérieur du JSON v3 ; le coût historique `parts` et la main-d’œuvre `labor` restent renseignés. Une divergence entre détail et total est conservée et signalée ; le recalcul exige un choix et un enregistrement. Les structures inconnues sont préservées.

**Sécurité et limites :** migration IndexedDB 2/3→4 ; sauvegarde externe préalable et test isolé recommandés, aucun retour direct des anciennes PWA sur la même base. Contrôle optimiste des éditions entretiens/pleins et du véhicule dans une transaction. Lien Google Maps volontaire et externe, pas d’adresse supplémentaire ou GPS imposé ; pas de garantie d’ouvrir Apple Maps. Énergie affichée depuis le véhicule, sous-type sans effet sur la consommation. Android reste à porter ; Safari iOS et téléphone à valider. Voir [CARNET-PWA-BETA2.md](CARNET-PWA-BETA2.md).

**Contrôles Linux :** 39/39 tests unitaires et 17/17 tests de l’archiveur ; parcours du carnet enrichi, conflits, conservation d’extensions, écrans 320 px/paysage/tablette, thème sombre, retours des PWA 1.5.1/beta.1 et hors-ligne vérifiés sous Chromium et WebKit Playwright. Migrations 1.5.1 et beta.1 → beta.2 réussies sur les deux moteurs. Parcours interface, trajets, GPS simulé, catalogue et logo testés sous Chromium ; contrôles de précision sur onze collections fictives sous les deux moteurs. Les fixtures de précision sont créées à partir des données fictives du projet, sans exécution Room pour ce lot.

**Corrections lors des contrôles finaux :** conservation des montants globaux historiques à plus de deux décimales ; retrait de l’état de lecture seule accessible après suppression de la dernière ligne ; réouverture rapide du sélecteur différée jusqu’au retour d’historique précédent pour éviter une fermeture accidentelle. Scénarios testés sous Chromium et WebKit Linux. Une tentative WebKit de précision hors ligne a échoué pendant l’exécution de plusieurs suites en parallèle ; des passages antérieurs puis une reprise isolée ont réussi. Cause non déterminée ; aucune garantie de persistance hors ligne sur iPhone réel n’en découle.

## 4 novembre 2026 — Portage du carnet enrichi : Android 0.4.0-beta.27

L’utilisateur demande de poursuivre après la livraison de la candidate PWA 1.5.2-beta.2. Les six choix de la phase 3 sont portés sur Android : lignes de pièces/opérations, coûts exacts en centimes et main-d’œuvre séparée ; plusieurs catégories et recherche plein écran à partir des neuf familles standard et d’« Autre… » personnel ; recherche Google Maps sur action volontaire ; sous-type de carburant/recharge libre et récents par véhicule. Les gestes système, le service de cartes et les appareils restent à vérifier en situation réelle. Quantité et fournisseur/référence par pièce restent à trancher ; pas d’OBD, de GPS natif ni de Bluetooth automobile ajoutés à ce lot.

JSON v3 et Room 15 inchangés : les extensions PWA sont stockées dans les enregistrements, les anciens champs de coûts restent utilisables et les 15 schémas Room sont identiques à beta.26. Un ancien coût sans détail n’est pas converti sans confirmation. Si une ancienne version a modifié le total, la divergence est signalée et préservée jusqu’au recalcul confirmé. Les extensions futures sont verrouillées, les champs supplémentaires imbriqués sont conservés tant que leurs lignes subsistent, et une transaction couvre l’intervention, les catégories personnelles, le rappel et le compteur ; une édition périmée est refusée.

**Contrôles :** suite Android JVM Linux **581 cas : 573 réussis, 8 ignorés**, zéro échec, 84 classes ; lancement incrémental 7 min 40 s sans les compilations/téléchargements. Deux messages de décodeur d’image non implémenté proviennent de l’environnement simulé pendant une suite néanmoins réussie. Le nouveau parcours fictif export Room → import et édition de la vraie candidate PWA → import et édition Room → retour PWA réussit séparément sous Chromium et WebKit Linux, y compris la conservation d’un grand nombre imbriqué. Sept tests Compose du nouveau formulaire réussissent également séparément. Archiveur 21/21, contrôleur des rapports 23/23, workflow 7/7, contrôleur R8 22/22 ; les référentiels d’entretien Android et PWA sont identiques. Aucun résultat GitHub, Windows, émulateur, téléphone, iPhone ou performance réelle ne peut en être déduit.

**Assemblage :** APK debug compilé, identifiant `com.vigieauto.app`, code 31, min 26/target 36 et 12 384 149 octets ; lint debug 0 erreur, 20 avertissements et 1 indication. Les 61 scénarios instrumentés ont été compilés mais non exécutés : pas d’appareil connecté ni KVM. L’APK debug est un contrôle local, non inclus dans le ZIP source ; sa taille ne prouve pas la taille d’une release. Une première tentative groupant recompilation et tests a perdu son daemon sous pression mémoire avant les reprises séparées réussies.

Une sauvegarde JSON externe vérifiée reste indispensable avant un essai : l’import remplace le carnet de destination. La PWA familiale 1.5.1 et la candidate beta.2 sont conservées séparément de la nouvelle archive Android ; la candidate PWA fait passer IndexedDB en version 4 et ne permet pas d’ouvrir directement cette base avec les anciennes versions. Le socle reste en bêta ; les phases principales peuvent progresser sans attendre un téléphone, qui reste nécessaire à la validation physique.
