# Migration Room 3 → 4 — les véhicules complets

> Document historique beta.10 : beta.11 poursuit ensuite vers Room 5 pour les interventions. Voir `MIGRATION-V4-V5.md` pour l’état courant.

**Préversion Android 0.4.0-beta.10, pas une version stable.** Le stockage change ; le format d’échange reste JSON v3. Avant tout essai, exportez vos données Android et PWA, vérifiez les fichiers et gardez au moins une copie sûre hors de chaque téléphone. Le JSON n’est pas chiffré. Utilisez d’abord un émulateur ou un appareil de test contenant uniquement des données fictives : les tests instrumentés ne sont pas encore exécutés ici.

## Périmètre exact

- Depuis la bêta.9 ou une autre version Room 3 : migration **3 → 4** à l’ouverture. Depuis Android 0.3.0/Room 2 : **2 → 3 → 4**. Les migrations Room historiques **1 → 2 → 3 → 4** sont enregistrées ; ce sont des versions de base, à ne pas confondre avec les formats d’import JSON v1/v2/v3.
- Seule la collection **véhicules** bascule ici : `complete_vehicles` conserve les 14 champs connus, leur présence et leur nullité ; `complete_vehicle_values` et `complete_vehicle_value_chunks` portent les valeurs trop longues et leur empreinte SHA-256. `id` est la clé, et les propriétés inconnues seules sont stockées dans un objet d’extensions séparé. Ce dernier n’est pas une copie JSON complète du véhicule.
- Les nombres des véhicules sont conservés sous forme de texte numérique exact, sans passage par `Double` pour l’écriture du stockage complet ; l’absence, `null` et une valeur sont distincts. Les colonnes d’index `vehicles` restent des projections limitées utilisées pour les requêtes : elles ne servent pas à reconstituer le véhicule complet. Les colonnes de métadonnées de `compat_records` restent nécessaires à la gestion et aux empreintes.
- Les dix autres collections continuent à utiliser leurs JSON complets dans `compat_chunks`. Cette version **n’a donc pas achevé** la source typée unique des 11 collections. Les projets Android et PWA restent séparés ; aucun serveur ou synchronisation n’est ajouté.

## Séquence et refus sûrs

Room ouvre une transaction de migration. Le code vérifie la taille, l’ordre, le nombre et l’empreinte des anciens blocs de chaque véhicule, décode en UTF-8 strict et valide le véhicule. Il encode ensuite la nouvelle représentation, la relit depuis SQLite, la reconstruit et compare les champs, les types, les valeurs numériques, les tableaux et les extensions à l’original. Une vérification des relations est effectuée avant la suppression des blocs JSON complets **des véhicules seulement**, à la fin de la même transaction. Les autres blocs ne sont pas supprimés.

Des champs dépassant 8 Kio UTF-8, certaines chaînes comportant des unités Unicode isolées et les extensions sont stockés en blocs de 128 Kio avec contrôle d’intégrité. Un export reconstruit le véhicule depuis ces données complètes, vérifie son empreinte, puis l’écrit en JSON ; il n’utilise pas l’index tronqué comme solution de repli. Une donnée manquante ou une différence arrête l’opération plutôt que de l’ignorer. Les photos et pièces jointes peuvent imposer des copies en mémoire : aucun temps ou plafond de RAM n’est garanti.

Le lecteur refuse les propriétés dupliquées dans un véhicule, y compris imbriquées, au lieu d’en perdre silencieusement une. Gson ne sait pas lire fidèlement certains jetons numériques exceptionnellement longs avec son tampon strict : une migration ou un import contenant de tels jetons est refusé, sans conversion silencieuse en chaîne. Cela peut empêcher une migration ; il ne faut alors ni effacer la base ni forcer une installation. Une transaction protège contre une migration incomplète mais pas contre une panne matérielle ou l’absence de sauvegarde. Le code ne peut pas récupérer une valeur déjà altérée dans une ancienne version.

## Contrôles et repli

Les essais JVM utilisent notamment le véritable schéma Room 3 exporté, une photo fictive étiquetée PNG de 5 Mio de données, les 11 collections, un rollback forcé, des blocs endommagés, les champs inconnus, les nombres précis, `null` et Unicode. La chaîne 1→2→3→4 a aussi été essayée en JVM avec des données, et 2→3→4 avec les 11 collections et un document fictif de 5 Mio. La validation de schéma Room et des migrations **sur appareil ou émulateur** reste nécessaire : les tests instrumentés sont compilés, mais n’ont pas été exécutés dans cet environnement. Une simulation JVM ne prouve ni la compatibilité matérielle ni les performances.

Une ancienne version Room 3 ne sait pas ouvrir directement une base déjà migrée en Room 4 ; Android 0.3.0/Room 2 non plus. Une archive de l’ancien code n’est pas un retour automatique. N’essayez pas de désinstaller, effacer les données, forcer une rétrogradation ou mélanger les projets en cas d’erreur. Conservez les sauvegardes externes d’avant mise à jour et testez séparément une éventuelle restauration.

La PWA 1.5.1 reste susceptible d’arrondir des nombres JSON très grands ou très précis : la préservation côté Android ne garantit donc pas un aller-retour numérique exact après passage dans la PWA. Gardez les fichiers originaux et consultez `FORMAT-PONT.md`.
