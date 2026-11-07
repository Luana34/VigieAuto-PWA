# VigieAuto — bilan du projet

**Mise à jour : 7 novembre 2026**  
Ce document rassemble l’essentiel de ce qui a été réalisé, ce qu’il reste à faire et les validations encore nécessaires. Il décrit l’état du projet à cette date, sans estimer de pourcentage ni de délai.

## En bref

VigieAuto est un carnet automobile en français, gratuit, sans publicité, abonnement ni compte obligatoire. Les données sont locales ; les fonctions de base restent utilisables hors ligne, sans GPS, Bluetooth ni OBD.

Il existe deux applications distinctes :

- **Android natif : 0.4.0-beta.44** — projet Kotlin/Compose avec base Room ; Android 8.0 et supérieur. C’est encore une préversion, pas la version 0.4.0 stable.
- **PWA : 1.5.2-beta.13** — candidate Web installable, notamment destinée à la famille sur iPhone. La version familiale **1.5.1** est conservée séparément ; la candidate doit encore être validée sur iPhone.

Pour GitHub Pages, publier seulement le contenu du dossier `A-METTRE-SUR-GITHUB` du ZIP PWA. Garder le ZIP source complet sur ordinateur : les tests et documents ne sont pas nécessaires au site, mais servent à la maintenance. Le projet Android complet reste dans son ZIP distinct.

Les appareils ne se synchronisent pas entre eux : les données peuvent être échangées **manuellement par fichier JSON**.

**Situation générale :** le socle est bien avancé mais reste à valider. Les véhicules et le carnet sont en cours ; les statistiques ont commencé. Le GPS Android et l’assistance Bluetooth ne sont pas encore développés.

---

## Ce qui fonctionne déjà

### Véhicules

- Ajouter et sélectionner plusieurs véhicules sur Android et dans la PWA.
- Chercher une marque et un modèle dans un catalogue local, mais aussi saisir librement et mémoriser ses propres choix. L’année, l’énergie et les détails du véhicule restent souples ; le kilométrage est obligatoire à la création.
- Sur Android, rechercher une marque ou un modèle même avec une petite faute ; les choix mémorisés remontent à qualité égale, sans correction automatique. La PWA conserve sa recherche directe. [Guide](docs/RECHERCHE-CATALOGUE-BETA44.md).
- Modifier la fiche du véhicule actif et corriger son compteur sans modifier automatiquement les anciennes entrées. Depuis beta.42, choisir le véhicule en haut de l’accueil dans une liste avec miniatures demandées à la vue.
- Ajouter une photo depuis la galerie ou, sur Android beta.41, la prendre avec l’application photo du téléphone ; remplacement et retrait confirmés, sans Undo. Sur Android beta.40, supprimer le véhicule actif après décompte, export préalable proposé et seconde confirmation ; les données liées peuvent être restaurées avec l’Undo. La PWA possède son propre parcours de suppression.

### Carnet d’entretien

- Ajouter, modifier et supprimer des entretiens, pleins ou recharges, rappels et trajets manuels.
- Détailler un entretien avec plusieurs catégories et des lignes de pièces ; distinguer le coût des pièces et celui de la main-d’œuvre. Un premier lot de ces enrichissements existe dans les deux préversions.
- Préciser un sous-type de carburant et ouvrir une application de cartes uniquement sur demande.
- Afficher les rappels dans l’application selon une date et/ou un kilométrage. La récurrence actuelle est en **jours et/ou kilomètres**, pas encore en mois calendaires.
- Sur Android, annuler la dernière suppression du carnet ou du véhicule sous les conditions prévues. Les entretiens et leurs rappels restent des entrées distinctes.

### Pleins, dépenses et devises

- Enregistrer les pleins complets ou partiels, ainsi que les recharges. La consommation est calculée entre pleins complets cohérents, en incluant les partiels intermédiaires et en séparant les litres des kWh.
- Depuis PWA beta.11, la case **Plein complet** est plus grande et en gras ; elle reste cochée par défaut pour une nouvelle entrée. La décocher pour un ravitaillement partiel. Cette mise à jour ne corrige pas automatiquement les entrées déjà enregistrées.
- Sur Android beta.43 et PWA beta.12, les boutons ⓘ expliquent les pleins et recharges, le calcul de consommation et le VIN. L’ouverture de l’aide ne change pas le brouillon ou la case. [Guide](docs/AIDES-PLEINS-VIN.md).
- Gérer les dépenses par véhicule : catégorie, montant, tri, modification et justificatif photo facultatif.
- Conserver la **devise de chaque dépense, plein ou entretien**. Les anciennes opérations restent en euros ; les totaux sont séparés par devise, sans conversion automatique.
- Sur Android, afficher des totaux séparés sur les écrans Dépenses, Pleins et Entretien. Le coût énergétique au kilomètre est masqué lorsque les devises concernées sont mélangées.
- Une dépense et un plein ne sont pas encore liés automatiquement : une saisie en double peut donc être comptée deux fois.

### Trajets

- Sur les deux plateformes : trajet passé saisi manuellement ou chronomètre démarré volontairement, avec distance et durée indiquées ou corrigées par la personne.
- **PWA seulement :** GPS facultatif après autorisation, pour estimer une distance lorsque la page est visible. La trace et les coordonnées ne sont pas enregistrées. Le suivi continu écran éteint ou application fermée n’est pas garanti.
- **Android :** pas encore de GPS natif ni de déclenchement Bluetooth ou NFC.

### CQ, symptômes, documents et statistiques

- **PWA :** modèles CQ personnalisables, contrôles, journal de symptômes, documents et premières statistiques, en plus des fonctions du carnet.
- **Android :** consultation partielle des CQ importés. Les symptômes et documents importés sont conservés et peuvent être réexportés, mais leurs écrans complets restent à créer.
- Les applications aident à organiser les informations ; elles ne remplacent pas un diagnostic mécanique professionnel.

### Interface et thèmes

- Cinq onglets principaux : **Accueil, Entretien, Pleins, Trajets et Réglages**, avec accès aux CQ et bouton d’ajout rapide.
- Nom et logo VigieAuto, thèmes **Sauge** et **Cyan**, clair ou sombre selon le téléphone ; le choix automatique historique est conservé.
- Depuis Android beta.39 et PWA beta.10, le fond sombre est **`#121212`** pour les deux thèmes. Les cartes, accents et modes clairs restent ceux de chaque plateforme.

---

## Les phases : fait et reste à faire

### Phase 1 — Socle solide : bien avancé, mais pas encore stable

**Réalisé :** base locale Room, navigation, échanges JSON, protections lors des imports et annulation transactionnelle de certaines suppressions. Des tests automatisés et une configuration de CI ont été préparés.

**Reste à faire :**

- Exécuter les tests instrumentés et les migrations sur émulateur puis sur téléphone, après sauvegarde.
- Valider la PWA candidate sur iPhone et Safari ; vérifier l’automatisation GitHub préparée.
- Tester la version optimisée R8, poursuivre les finitions et mesurer les performances sur appareil.

La phase 1 reste donc ouverte. On peut continuer les fonctions sans attendre ces essais, mais **on ne déclare pas le socle stable avant validation**.

### Phase 2 — Véhicules complets : en cours

**Réalisé :** multivéhicule, catalogue et saisie libre, modification de la fiche, correction du compteur, photo depuis la galerie ou l’appareil photo, suppression sécurisée du véhicule actif avec Undo (beta.40), sélecteur avec aperçus et choix conservé (beta.42), recherche approximative et priorité aux suggestions mémorisées sur Android (beta.44).

**Reste à faire :** avatars ou couleurs, vue combinée éventuelle et recherche équivalente sur la PWA à étudier ; puis champs complémentaires après vérification des champs déjà présents. L’historique détaillé des corrections du compteur reste à étudier avant de coder. Les essais de la liste et de la suppression sur émulateur et téléphone restent à faire ; la phase 2.3 n’est pas terminée.

### Phase 3 — Carnet complet : en cours

**Réalisé :** entretiens enrichis, pleins, rappels, trajets manuels et premier écran Dépenses sur Android ; fonctions plus complètes côté PWA.

**Reste notamment à faire :**

- Compléter sur Android les modèles CQ, leur édition, les contrôles et l’historique ; créer les écrans complets des symptômes et des documents.
- Ajouter la récurrence des rappels en mois calendaires et étudier les notifications lorsque l’application est fermée.
- Proposer des rappels à partir des habitudes saisies, par véhicule et type d’entretien : proposition modifiable ou désactivable, **toujours confirmée**, sans base constructeur ni création silencieuse.
- Relier éventuellement plein ou entretien à une dépense sans double comptage, puis poursuivre les compléments des formulaires et des trajets.

### Phase 4 — Statistiques et tableaux de bord : commencée

**Réalisé :** premières statistiques dans la PWA ; consommation et totaux par devise sur Android.

**Reste à faire :** tableau de bord Android complet, graphiques et analyses par période, véhicule, catégorie et devise. Les exports PDF/CSV sont à étudier ; ils ne remplaceraient pas une sauvegarde JSON restaurable.

### Phase 5 — GPS Android, puis Bluetooth autoradio : à développer

- GPS natif facultatif, démarré volontairement à l’arrêt, avec notification visible et permissions expliquées. La distance, la durée et la vitesse seront affichées si les données sont suffisamment fiables.
- Après le GPS : proposer le démarrage lorsque l’autoradio déjà associé se connecte, puis proposer l’arrêt et la sauvegarde lors de sa déconnexion.
- Une **confirmation explicite** reste nécessaire ; aucun OBD ni appareil supplémentaire ne sont requis. Les restrictions Android, interruptions et conditions réelles devront être testées.

### Phase 5 bis — Stations et prix carburants : spécifiée, non développée

Module non développé. La nouvelle description prévoit des stations et prix saisis manuellement, strictement locaux et sans source en ligne ; une ancienne fiche mentionne une option de prix officiels. Cette divergence est **à clarifier avant de modifier le plan ou de développer le module**. Aucun choix nouveau n’est supposé dans ce lot.

### Phase 6 — Confort, accessibilité et personnalisation : partiellement réalisée

Les thèmes, l’icône et une partie de l’interface existent. Il reste à compléter l’accueil initial, les notifications locales, la recherche, les réglages et l’accessibilité ; des widgets pourront être étudiés.

### Phase 7 — Extras : à étudier

NFC facultatif, partage sélectif ou QR, mode tablette, fonctions de flotte et autres options restent des pistes. Une sauvegarde personnelle dans le cloud pourrait être étudiée, mais ne doit pas devenir obligatoire ni imposer une synchronisation directe.

---

## Sauvegardes et précautions

- Android et PWA ont des bases séparées. **Un import confirmé remplace les données du destinataire : ce n’est pas une fusion.**
- Exporter et vérifier une sauvegarde de chaque appareil avant une mise à jour ou un échange ; conserver les originaux dans un endroit sûr, séparé de l’appareil.
- Les fichiers JSON ne sont pas chiffrés par VigieAuto. Ils peuvent contenir des informations personnelles et des documents.
- Les préversions récentes importent les formats JSON v1 à v5 et exportent en v3, v4 ou v5 selon les affectations de devises. Les anciennes versions peuvent refuser un format récent.
- La PWA familiale 1.5.1 peut arrondir certains très grands nombres dans des sauvegardes. La candidate protège les nombres précis dans les scénarios testés, mais ne peut pas reconstituer des chiffres déjà perdus.
- Une base PWA passée à IndexedDB 6 ne peut pas être rouverte directement par une ancienne version. Ne pas effacer les données du navigateur pour forcer une mise à jour.
- Une photo ajoutée dans la PWA peut conserver ses métadonnées, dont une éventuelle position GPS. Android ne recopie pas les métadonnées EXIF dans les nouvelles photos de véhicule ou de justificatif qu’il convertit ; une copie brute temporaire ou celle d’une application photo externe peut toutefois les contenir.

## Vérifications de la dernière livraison

**Android beta.44 :** 86 tests JVM ciblés réussis sous Linux sans échec ni ignoré, dont 18 nouveaux. La suite complète n’a pas été relancée. L’APK debug est assemblé ; 69 scénarios instrumentés sont compilés mais non exécutés ; lint : 0 erreur, 24 avertissements et 5 indications. Contrôles des scripts : 33 archive, 32 CI, 7 workflow et 22 R8 réussis. Aucun ancien test n’a été retiré. [Guide](docs/RECHERCHE-CATALOGUE-BETA44.md).

**PWA beta.13 :** 64 tests Node, 14 tests de sélection et 27 tests d’archive réussis. Copie publique seule et vraie mise à jour beta.12 → beta.13 avec données fictives et export v5 vérifiées sous Chromium et WebKit Linux, y compris hors ligne. D’autres parcours (catalogue, aides, thèmes, carnet, dépenses, justificatifs et précision JSON) ont réussi ; l’échange avec le ZIP beta.1 manquant est ignoré et la précision est testée sur fixture PWA fictive, sans relancer le pont Android/Room. Aucun site GitHub ni Safari iPhone réel testé. [Guide de publication](docs/QUOI-PUBLIER-GITHUB.md).

**PWA beta.12, historique :** 64 tests Node et 22 tests d’archivage réussis ; aides et mise à jour réelle beta.11 → beta.12 vérifiées sous Chromium et WebKit Linux, y compris hors ligne.

Aucun téléphone, émulateur, Windows ou GitHub n’a été validé pour beta.44 ; Safari iOS reste à valider et aucune performance n’est mesurée.

**Android beta.43, historique :** 82 tests JVM ciblés réussis ; suite complète non relancée. APK debug et 69 scénarios instrumentés compilés mais non exécutés ; lint 0 erreur, 24 avertissements et 5 indications. [Guide](docs/AIDES-PLEINS-VIN.md).

**Livraisons précédentes, sous Linux :**

- PWA beta.11 : **64 tests Node et 21 tests d’archiveur réussis** ; formulaire, quatre thèmes et vraie mise à jour beta.10 → beta.11 avec données fictives et export hors ligne vérifiés sous Chromium et WebKit Linux. Les parcours d’interface, trajets, GPS simulé et migration depuis la PWA 1.5.1 ont aussi réussi sous Chromium. Aucun téléphone ni Safari iOS n’a été testé dans ce lot ; WebKit Linux ne valide pas Safari iPhone.

- Android beta.42 : suite JVM Linux **745 réussis, 8 ignorés** faute des anciennes fixtures de retour PWA, aucun échec ; APK debug et **69 scénarios instrumentés compilés mais non exécutés** ; lint : **0 erreur, 24 avertissements, 5 indications**. Aucun essai sur téléphone, émulateur, Windows ou GitHub ; aucune mesure de performance. Aucun avertissement CloseGuard reconnu dans ces rapports (détection non exhaustive).

**Livraison Android beta.41 précédente (historique) :**

- Android : sous Linux, suite JVM complète : **733 réussis, 8 ignorés** faute des huit anciennes fixtures de retour PWA, aucun échec. Pont photo fictif Android → PWA beta.10 → Room réussi séparément sous Chromium et WebKit Linux. APK debug assemblé et **68 scénarios instrumentés compilés mais non exécutés** ; lint : 0 erreur, 24 avertissements et 5 indications. La suite initiale a signalé un avertissement CloseGuard SQLite dans `BackupVerificationTest` ; la reprise ciblée de ses trois tests a réussi sans le reproduire. Cela ne prouve ni n’exclut une fuite sur appareil : à examiner. Aucun essai sur téléphone, émulateur, Windows, GitHub ou Safari iOS ; aucune mesure de performance.
- La PWA est inchangée. Pour sa livraison beta.10 précédente : 64 tests automatisés et 20 tests d’archive réussis ; vraie mise à jour beta.9 → beta.10 et export hors ligne vérifiés sous Chromium et WebKit Linux.
- Ces vérifications ne remplacent pas les essais sur un téléphone Android ou sur Safari iPhone. Une candidate précédente a déjà été essayée sur Android avec import de données sans perte constatée, mais cela ne valide pas automatiquement la dernière version sur iPhone.

### Performances : objectifs non encore mesurés

Les objectifs restent : démarrage à froid **< 1 s**, à chaud **< 300 ms**, ouverture d’un écran **< 100 ms**, **60 images/s** avec 1 000 éléments, import de 10 Mo **< 3 s**, export **< 2 s**, APK release **< 15 Mo** et RAM **< 100 Mo**. Aucun de ces objectifs n’est déclaré atteint sans mesure sur appareil.

## Ordre de travail retenu

1. Continuer les véhicules et le carnet Android, sans attendre les essais sur téléphone.
2. Compléter les statistiques, puis développer le GPS Android et l’assistance Bluetooth avec confirmation.
3. Valider le socle sur appareils et la candidate PWA sur iPhone ; clarifier le cadrage des stations avant cette phase.

Les priorités peuvent être ajustées selon tes demandes, tout en préservant les données et les fonctions déjà livrées.

## Fichiers conservés

Les trois ZIP de projet conservés à la date de ce bilan sont :

- `VigieAuto-Android-v0.4.0-beta.44.zip` — source Android.
- `VigieAuto-v1.5.2-beta.13.zip` — PWA candidate avec dossier `A-METTRE-SUR-GITHUB`.
- `VigieAuto-v1.5.1.zip` — PWA familiale conservée.

Les deux ZIP Android et PWA ont une racine nommée `VigieAuto` : les extraire dans **deux dossiers parents différents**. Ils contiennent aussi l’historique détaillé, le cahier des charges, les feuilles de route, le récapitulatif des fonctions et la checklist de performance.
