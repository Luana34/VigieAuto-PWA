# Migration Room 13 → 14 — réglages et suggestions

Cette migration indépendante de 0.4.0-beta.18 transforme les **réglages** sans ajouter de nouvelle interface. Avant une migration réelle, garder une sauvegarde JSON externe et vérifier qu’elle s’ouvre ; une application Android antérieure ne sait pas ouvrir directement une base Room 14.

## Réglages de types variés

Les réglages n’ont pas tous la même forme : un `value` peut être absent, nul, une chaîne, un nombre, un booléen, un tableau ou un objet ; les suggestions personnelles utilisent notamment des tableaux et des objets. `complete_settings` contient l’identité et `complete_setting_nodes` décompose les propriétés en **nœuds typés** : objets, tableaux, chaînes, nombres exacts, booléens et nulls. Les positions gardent l’ordre des tableaux ; les propriétés absentes ne deviennent pas nulles. Aucun objet JSON complet n’est conservé comme copie auxiliaire.

Les noms de propriétés ou valeurs individuels longs et les chaînes contenant des demi-surrogates isolés utilisent `complete_setting_values` et `complete_setting_value_chunks` avec contrôle de longueur, ordre et SHA-256. L’arbre est vérifié à la reconstruction : propriété ou nœud manquant, parent incohérent, ordre incorrect, doublon ou bloc inattendu interrompt l’opération. Les suggestions personnelles restent dans l’export JSON ; `suggestions_perso` est un index local dérivé, pas une seconde copie complète. La migration ne remplace pas cet index ; un import ou une modification des suggestions le reconstruit.

## Ordre et annulation

Room vérifie et valide chaque ancien réglage, encode les valeurs, compare une première reconstruction, insère, **relit depuis SQLite et compare à nouveau**. Après contrôle des clés étrangères et de tous les objets, les anciens blocs complets de `settings` sont supprimés dans la même transaction. Si une vérification ou une suppression échoue, l’ancienne base reste en version 13. Des tailles de blocs historiques irrégulières restent acceptées lorsque longueur totale, ordre et empreinte sont cohérents.

Les changements locaux Android de thème, de véhicule actif ou de suggestions réutilisent l’objet existant pour préserver ses autres champs. Les tests JVM couvrent aussi les tableaux imbriqués, valeurs hétérogènes, grands champs, extensions de suggestions, clés manquantes/nulles, corruption, retour arrière et migration d’une base 13 réelle. Les scénarios Android instrumentés doivent encore être exécutés sur appareil ou émulateur. La PWA 1.5.1 peut, de son côté, remplacer les champs supplémentaires du réglage `theme` lorsque son thème est modifié ; elle peut également arrondir les nombres JSON très grands ou précis. Conserver la sauvegarde d’origine avant tout échange.
