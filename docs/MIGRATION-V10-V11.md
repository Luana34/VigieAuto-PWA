# Migration Room 10 → 11 — documents complets typés

**Version Android : 0.4.0-beta.17.** Le schéma Room 11 exporté a pour identité `b0f8ce214903785e5b36d6ae0df4f72b`. Cette évolution interne ne change ni le format d’échange JSON v3 ni la PWA 1.5.1. Android continue à importer les JSON compatibles v1, v2 et v3. Une version de schéma Room n’est pas une version de sauvegarde JSON.

## Précautions avant toute mise à jour

Exporter un JSON et conserver une copie vérifiée **en dehors de l’appareil**. Tester d’abord cette préversion et la restauration sur émulateur ou appareil de test avec des données fictives ou une copie restaurable. Une transaction SQLite ne remplace pas une sauvegarde : un manque d’espace, une défaillance matérielle ou une erreur non anticipée peuvent nécessiter une restauration.

Une application Room 10 ou antérieure ne peut pas ouvrir directement une base déjà migrée en Room 11. Un retour arrière exige une restauration séparée à partir de la sauvegarde d’avant mise à jour. Garder la même clé de signature ; ne pas désinstaller l’application pour forcer l’installation, car cela peut effacer sa base. La migration n’a pas été exécutée sur téléphone ou émulateur dans cet environnement.

## Stockage des documents

Après véhicules, interventions, pleins/recharges, trajets, rappels, dépenses et symptômes, les **documents** sont la huitième collection à source complète typée. Les trois autres collections (`templates`, `checks`, `settings`) gardent leur JSON complet en blocs ; le chantier des onze collections n’est donc pas terminé. Ce lot **n’ajoute pas d’écran Documents Android**.

- `complete_documents` conserve `id`, `vehicleId`, `title`, `category`, `date`, `filename`, `type`, `size`, `dataUrl`, `createdAt` et `updatedAt` avec un index par véhicule. Les masques distinguent champ absent, `null` explicite, valeur présente ou externalisée. Le jeton numérique `size` est conservé en texte exact, sans reconstruction par `Double` ; le validateur existant utilise néanmoins `Double` pour vérifier un nombre fini et non négatif.
- Les valeurs dépassant 8 Kio UTF-8 et les unités Unicode isolées sont externalisées en blocs d’au plus **128 Kio**, avec nombre de blocs, taille et SHA-256. Pour une pièce jointe, le texte `dataUrl` est préservé ; lorsqu’il contient un base64 valide, ses octets décodés sont donc préservés. Les propriétés inconnues seules sont regroupées en extensions JSON : aucune deuxième copie JSON complète de l’objet n’est conservée.
- `compat_records` reste un index de métadonnées avec une empreinte de l’objet reconstruit. Après vérification, les anciens blocs `compat_chunks` des documents sont supprimés. Les projections historiques restent des index et les autres collections ne perdent pas leurs données.

## Contrat conservé, migration et limites

Le validateur Android historique exige notamment un titre et un nom de fichier textuels, une date valide, une taille numérique finie non négative et un `dataUrl` de type image JPEG/PNG/WebP/GIF ou PDF comportant des caractères base64 autorisés. Il n’exigeait **ni décodage base64 réussi, ni cohérence entre la taille, le type déclaré et le contenu** ; cette migration ne les exige pas non plus. Les sauvegardes anciennes ne sont pas soumises rétroactivement à la limite du formulaire PWA. Un contenu déjà invalide peut donc être conservé sans être téléchargeable : le stockage ne garantit pas l’ouverture du fichier.

Pour chaque document, Room vérifie les anciens blocs, leur taille et leur SHA-256, l’UTF-8, les champs, l’identité et la référence véhicule. Le contenu est encodé, écrit, **relu depuis SQLite**, décodé et comparé à l’arbre initial : absence/`null`, types, textes, jetons numériques, ordre des tableaux et extensions. L’ordre des propriétés d’un objet n’est pas significatif. Les relations sont contrôlées et les anciens blocs ne sont retirés qu’après vérification de **tous** les documents. Une erreur annule la transaction, sans repli destructif sur le résumé.

La lecture stricte des documents refuse les propriétés répétées, même imbriquées, et les nombres trop longs pour être lus fidèlement. Ce contrôle supplémentaire peut bloquer l’ouverture d’une ancienne base ambiguë ou d’un JSON précédemment accepté ; il évite une perte silencieuse mais ne corrige pas une donnée déjà modifiée. Conserver l’original et demander un diagnostic si une migration échoue. Les limites générales restent 256 Mio par fichier d’import, 100 000 enregistrements et environ 16 Mio de caractères JSON par objet ; limite de stockage d’environ 32 Mio UTF-8 par objet.

## Vérifications et échange PWA

Les tests prévus couvrent notamment base v10 construite avec les migrations précédentes, données absentes/nulles, nombres exacts et zéro négatif, pièces jointes et champs longs, Unicode, extensions inconnues, imports v1/v2, corruption, bloc manquant, identité/références et rollback pendant l’écriture ou la suppression des anciens blocs. Une pièce jointe synthétique de 5 Mio et son SHA-256 sont vérifiés dans Room et lors d’un aller-retour via la vraie PWA sous Chromium : téléchargement puis ajout d’un autre document. Ces essais ne sont pas des tests iPhone.

La PWA ajoute, télécharge et supprime des documents ; elle ne propose pas de modification d’un document déjà enregistré. Son formulaire accepte un fichier JPG, PNG, WebP, GIF ou PDF de **5 × 1 024 × 1 024 octets maximum**. Son `JSON.parse` peut arrondir des nombres très grands ou précis, y compris dans les extensions : la fidélité numérique complète n’est pas garantie lors d’un aller-retour PWA. Conserver et vérifier les originaux. La compilation des scénarios `MigrationTestHelper` n’est pas une exécution sur appareil ou émulateur ; les résultats et limites sont dans `PERFORMANCES.md`.
