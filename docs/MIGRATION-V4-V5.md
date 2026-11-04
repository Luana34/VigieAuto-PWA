# Migration Room 4 → 5 — les interventions complètes

**Préversion Android 0.4.0-beta.11, pas une version stable.** Cette version change le stockage local, pas le format d’échange : import JSON v1 à v3 et export v3 restent distincts des versions de base Room. **Avant toute mise à jour, effectuer une sauvegarde externe et vérifier le fichier**, sur les deux appareils si nécessaire. Le JSON est non chiffré ; conserver au moins une copie sûre hors du téléphone. Tester d’abord avec des données fictives sur un appareil ou émulateur distinct, sans toucher à une base unique.

## Périmètre

- Depuis la bêta.10 / Room 4, migration **4 → 5** à l’ouverture ; depuis Room 3, chaîne 3 → 4 → 5 ; depuis Room 2, chaîne 2 → 3 → 4 → 5. La chaîne 1 → 2 → 3 → 4 → 5 est enregistrée. Ce ne sont pas les versions du JSON.
- Après les véhicules en Room 4, les **interventions / services** ont leur source complète : `complete_services` stocke l’identifiant, le véhicule et les champs connus (`title`, `category`, `date`, `odometer`, `parts`, `labor`, `place`, `notes`, `createdAt`, `updatedAt`). Présence, nullité et valeurs externes sont distinguées ; les nombres sont des textes de jetons JSON exacts, non des `Double` utilisés pour reconstruire le carnet.
- `complete_service_values` et `complete_service_value_chunks` conservent les valeurs individuelles longues et les **seules propriétés inconnues**, avec découpage et SHA-256. Une extension peut contenir des objets, listes ou médias futurs, mais n’est pas une copie JSON complète de l’intervention. `compat_records` conserve les résumés et métadonnées, et `services` reste une projection de requête. L’export ne prend pas cette projection comme solution de repli.
- **Neuf autres collections** — pleins, trajets, dépenses, rappels, symptômes, modèles CQ, contrôles, documents et réglages — gardent leurs JSON complets dans `compat_chunks`. La source typée unique pour toutes les collections n’est donc pas achevée. La suppression immédiate avec Undo transactionnel n’est pas réalisée ; le bandeau actuel reste une suppression différée.

## Protection des données

Room encadre la migration d’une transaction. Pour chaque intervention, l’ancien contenu est relu en vérifiant les blocs, leur ordre, leur taille, leur empreinte et l’UTF-8. L’identité et le véhicule sont vérifiés ; le code encode les nouveaux champs, relit les données réellement écrites dans SQLite et compare l’objet reconstruit à l’original. Les relations sont vérifiées avant de supprimer, en fin de transaction seulement, les anciens blocs JSON complets **des interventions**. En cas de corruption, incohérence, valeur illisible ou échec, l’opération doit échouer et la transaction doit être annulée ; cela ne remplace pas une sauvegarde externe.

Les propriétés dupliquées, y compris imbriquées, sont refusées dans une intervention plutôt que supprimées silencieusement. Certains nombres exceptionnellement longs ne sont pas lisibles fidèlement par le lecteur strict : l’opération est alors refusée. Le nouveau contrôle s’applique aux imports et aux données encore lisibles dans l’ancienne base ; il ne peut pas restituer une donnée déjà altérée par une ancienne version. Les chaînes longues, y compris les unités Unicode isolées, sont conservées dans des blocs adaptés. Aucune valeur de temps ou de mémoire n’est garantie.

L’export vérifie la source complète et son empreinte ; en cas de donnée absente ou altérée, il est interrompu au lieu de reconstituer une intervention depuis l’index tronqué. Les créations et modifications d’intervention continuent à mettre à jour les métadonnées et projections dans la même transaction que la source complète, le véhicule et le rappel éventuel.

## Retour arrière et validations

Une ancienne application Room 4 ou antérieure ne sait pas ouvrir directement une base déjà migrée en Room 5. Ne pas désinstaller, vider les données ni forcer une rétrogradation en cas de problème ; conserver la sauvegarde externe d’avant mise à jour et tester une éventuelle restauration séparément.

Les tests JVM simulés et les tests instrumentés sont deux contrôles différents. Les tests instrumentés `MigrationTestHelper` doivent encore être **exécutés** sur un appareil ou émulateur avant l’utilisation de données réelles. Les tests sur PC ne garantissent pas l’absence de problème sur un téléphone. La PWA 1.5.1 peut arrondir certains nombres JSON très grands ou très précis : une représentation exacte côté Android ne garantit pas la fidélité numérique d’un aller-retour par la PWA ; garder les fichiers originaux.
