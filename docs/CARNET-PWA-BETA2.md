# Carnet enrichi — PWA 1.5.2-beta.2 candidate

**4 novembre 2026 · candidate PWA, pas une version familiale stable.** Ce lot développe d’abord côté PWA les décisions du [plan §3.6](PLAN-PRIORITES-APRES-BETA16.md#enrichissement-carnet). Il n’ajoute pas ces écrans à Android 0.4.0-beta.26. Les essais automatisés sur ordinateur ne remplacent ni Android réel ni Safari iOS ; l’iPhone n’est pas disponible.

## Ce qui est disponible dans cette candidate

- **Entretien :** ajout/suppression de lignes « pièce / opération », chacune avec un libellé et un coût en euros à deux décimales. La somme des centimes est exacte ; le champ de coût des pièces est calculé et la main-d’œuvre reste distincte. Le total affiché comprend les deux, sans ajouter une seconde fois les lignes. Aucun fournisseur, référence ou quantité par ligne n’est encore ajouté.
- **Ancien coût global :** les interventions sans lignes gardent leur montant existant, même s’il possède plus de deux décimales. Ajouter une première ligne à un montant non nul demande une confirmation : **si le formulaire est ensuite enregistré**, la somme détaillée remplace le coût global. Annuler le formulaire n’écrit rien. Retirer la dernière ligne remet le coût des pièces à zéro, modifiable avant enregistrement.
- **Catégories :** neuf familles standard et « Mes catégories »/« Autre… », liste complète fournie, sélection de plusieurs catégories, recherche sans tenir compte des accents ou tirets, création libre mémorisée à l’enregistrement. Limites : 30 catégories par intervention et 160 caractères pour un nouveau libellé ; 100 lignes de pièces au plus. Le choix s’ouvre en plein écran, les en-têtes sont masqués pendant la recherche et les résultats rappellent leur famille. La flèche, Retour et une sélection explicite ferment le sélecteur ; le défilement de la liste ne programme pas sa fermeture. Une réouverture très rapide après fermeture attend le retour d’historique précédent, afin qu’il ne referme pas le nouveau sélecteur ; scénario testé sur les deux moteurs. Les gestes système restent hors du contrôle total de la PWA, et Safari iOS réel doit être vérifié.
- **Pleins :** sous-type libre avec suggestions selon l’énergie actuelle du véhicule et précédents sous-types de ce véhicule. Les anciens pleins sans sous-type restent inchangés et le calcul de consommation n’utilise pas ce texte. L’énergie affichée est celle de la fiche véhicule : ce lot n’ajoute pas un sélecteur d’énergie par plein ni un suivi séparé des recharges d’un hybride rechargeable. Les suggestions ne sont pas une recommandation technique ou légale.
- **Carte :** bouton 📍 depuis le lieu d’intervention ou la station. Sur action explicite, il lance une recherche **Google Maps** du texte saisi ; le service peut recevoir le nom, l’adresse IP et d’autres données selon ses règles. Internet est généralement nécessaire. Un nom peut être ambigu ; l’ouverture de l’app de cartes par défaut, de Waze ou d’Apple Maps n’est pas garantie. Aucun GPS, adresse supplémentaire ou coordonnée n’est ajouté au carnet par ce bouton. Le carnet reste utilisable hors ligne sans lui.

## Contrat de sauvegarde et prudence

La sauvegarde reste un JSON `app: "VigieAuto"`, `formatVersion: 3`, `data.services`, `data.fills` et les neuf autres collections habituelles. Les champs obligatoires déjà compris par les anciennes versions restent présents : un entretien conserve notamment `title`, `category`, `date`, `odometer`, **`parts` et `labor`**. Les statistiques et anciennes applications lisent le montant depuis `parts + labor`.

Les nouvelles informations sont facultatives et placées **dans** les enregistrements existants :

```json
{
  "category": "revision",
  "parts": 100.50,
  "labor": 45.00,
  "vigieServiceDetails": {
    "version": 1,
    "lines": [
      {"label": "Huile moteur", "cents": 4250},
      {"label": "Filtre à huile", "cents": 1400},
      {"label": "Filtre à air", "cents": 2200},
      {"label": "Filtre d’habitacle", "cents": 2200}
    ]
  },
  "vigieServiceCategories": {
    "version": 1,
    "items": [
      {"family": "filtres", "label": "Filtre à huile"},
      {"family": "personnalise", "label": "Porte-vélo"}
    ]
  }
}
```

Ce bloc est un **fragment d’intervention**, pas un fichier complet importable : il manque notamment l’identifiant, le véhicule, la date et l’enveloppe des onze collections. `cents` est un entier en centimes ; `parts` reste en euros. Un plein peut contenir `vigieFuelSubtype` en texte. Les catégories personnelles sont des réglages dont l’identifiant commence par `serviceCategory:` ; elles sont incluses dans la sauvegarde.

- Les anciens entretiens sans détail ne sont pas modifiés rétroactivement. Les propriétés inconnues des lignes et des catégories sont conservées lors des éditions testées. Une extension de version ou structure inconnue est conservée, mais son éditeur est désactivé plutôt que de la remplacer.
- Une ancienne version peut modifier `parts` sans savoir actualiser les lignes. Si les deux diffèrent, la candidate signale la divergence et les conserve. La personne peut confirmer « Utiliser la somme des lignes » ; le recalcul n’est enregistré qu’après validation du formulaire.
- Les opérations sur un entretien ou un plein et son véhicule contrôlent leurs versions dans la même transaction IndexedDB : une modification concurrente détectée est refusée avant écriture. Ce n’est pas une garantie pour toutes les autres fonctions ou tous les scénarios multi-onglets.
- Les échanges fictifs avec les PWA 1.5.1 et 1.5.2-beta.1 ont été testés sous Chromium et WebKit sur Linux, y compris une modification du montant par la version 1.5.1. Ce test ne garantit pas toutes les données ou toutes les anciennes versions. **Le nouveau détail n’a pas encore été testé en aller-retour réel avec Android beta.26.** Ne pas supposer qu’une ancienne interface sache afficher ou éditer les nouveaux champs.
- Le JSON français fourni pendant la conception (`version_schema`, `entretiens`, `cout_total`) reste un exemple conceptuel **non importable tel quel**, reproduit dans [la spécification](ENTRETIEN-FORMULAIRE-SPECIFICATION.md). Conserver les sauvegardes originales : elles sont personnelles, non chiffrées ; un import confirmé remplace les données du destinataire.

## Mise à niveau de la PWA

La base locale `cq-auto-local` passe à **IndexedDB 4**, sans changer les onze collections ni le format JSON v3. La PWA 1.5.1 (base 2) et la candidate beta.1 (base 3) ne peuvent plus ouvrir directement la même base après mise à niveau. Fermer les autres onglets si la migration est bloquée. Un autre sous-dossier sur le même domaine ne garantit pas une base séparée ; il faut un autre appareil, navigateur ou domaine/origine réellement distincte.

**Avant tout essai sur une installation contenant des données :** exporter et garder une sauvegarde JSON indépendante. Tester d’abord sur une origine ou un appareil distinct, avec des données fictives. Ne pas effacer la base ni désinstaller pour forcer un retour arrière. Le ZIP contient les fichiers statiques ; il ne publie pas automatiquement le site GitHub Pages de l’utilisateur.

## Vérifications de ce lot

**Contrôles Linux :** 39/39 tests unitaires et 17/17 tests de l’archiveur ; parcours du carnet enrichi, conflits, conservation d’extensions, écrans 320 px/paysage/tablette, thème sombre, retours des PWA 1.5.1/beta.1 et hors-ligne vérifiés sous Chromium et WebKit Playwright. Migrations 1.5.1 et beta.1 → beta.2 réussies sur les deux moteurs. Parcours interface, trajets, GPS simulé, catalogue et logo testés sous Chromium ; contrôles de précision sur onze collections fictives sous les deux moteurs. Les fixtures de précision sont créées à partir des données fictives du projet, sans exécution Room pour ce lot.

Une tentative WebKit de test de précision a échoué lors de la réouverture hors ligne alors que plusieurs suites tournaient en parallèle ; la même vérification a réussi auparavant puis lors d’une reprise isolée. La cause exacte n’est pas déterminée : la persistance hors ligne sur iPhone réel reste à vérifier.

Pas de mesure sur téléphone des temps d’ouverture, de la recherche, de la mémoire ou de la fluidité ; pas de validation iPhone, Safari iOS, Android natif ou GitHub Pages pour cette candidate. La PWA beta.1 installée et son import personnel ont été **rapportés par l’utilisateur**, pas vérifiés indépendamment. Le comportement réel des gestes, des applications de cartes et de la persistance iOS reste à tester.

Pour un développeur : `npm ci`, `npx playwright install chromium`, puis `npm test` et `npm run test:carnet`. Les ZIP des anciennes PWA à côté du dossier du projet permettent les échanges réels des fixtures ; sinon ces sous-scénarios sont signalés comme ignorés. `VIGIE_PWA_STABLE` et `VIGIE_PWA_PRECEDENTE` permettent de préciser leurs chemins. `VIGIE_BROWSER=webkit` lance les scénarios sur le moteur WebKit Playwright, qui n’est pas Safari iOS.
