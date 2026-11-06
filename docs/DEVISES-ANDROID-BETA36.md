# Devises des pleins et entretiens — Android beta.36 / PWA beta.9

> **Document historique :** les totaux Android des pleins et entretiens sont disponibles depuis beta.37. Voir [le guide actualisé](TOTAUX-ANDROID-BETA37.md).

**Préversions de test, pas de validation sur téléphone.** Sauvegardez et vérifiez séparément les données de chaque appareil, puis gardez des copies extérieures avant toute mise à jour, transfert ou restauration. L’import confirmé **remplace** les données du destinataire ; ce n’est ni une fusion ni une synchronisation. Le JSON n’est pas chiffré.

## Ce qui change

- Sur Android **0.4.0-beta.36/code 40**, chaque plein/recharge et chaque entretien peut désormais porter sa devise, comme les dépenses. Sélection à l’ajout ou à la modification ; pour une opération existante, le changement demande confirmation car **le montant ne sera pas converti**. Les anciennes opérations sans affectation restent en euros (EUR). La PWA 1.5.2-beta.9 conserve le même principe que beta.8.
- Les codes monétaires sont contrôlés syntaxiquement, pas garantis valides par une autorité bancaire. Maximum 32 codes distincts dans le carnet, EUR inclus ; aucune conversion automatique et aucun service de taux.
- Les listes et détails présentent la devise avec le montant ; la suppression puis l’Undo des pleins et entretiens conserve l’affectation et ses extensions si la restauration est possible. Une limite atteinte ou un conflit peut empêcher l’Undo plutôt que de perdre ou modifier des données.
- **Android affiche déjà des totaux séparés par devise pour les dépenses uniquement.** Les tableaux de bord et totaux globaux des pleins/entretiens restent à développer. Le calcul métier existant ne produit pas de coût énergétique global trompeur pour des intervalles mêlant plusieurs devises. Dans la PWA, les totaux et graphiques correspondants restent séparés et le coût/km mélangé est masqué. Aucun lien automatique plein/dépense ni protection contre un double comptage manuel n’est créé.

## Échange manuel et compatibilité

| Sauvegarde | Quand elle est produite | Lecteurs récents |
|---|---|---|
| v3 | Aucune affectation de devise explicite | PWA beta.9 et Android beta.36 |
| v4 | Des affectations existent pour les dépenses uniquement | PWA beta.9 et Android beta.36 |
| v5 | Au moins une affectation d’un plein/recharge ou entretien | PWA beta.8/beta.9 et Android beta.36 |

Android beta.36 accepte aussi les formats antérieurs v1 et v2, sous les règles décrites dans [FORMAT-PONT.md](FORMAT-PONT.md). Android beta.35 et PWA beta.7 **refusent v5** ; ce refus historique évite une perte. Les anciennes versions ne doivent pas être forcées à lire une sauvegarde qu’elles ne comprennent pas : ne modifiez pas le numéro du format et ne supprimez pas les affectations pour contourner le refus. Préservez les originaux, y compris si une vieille PWA ne conserve pas certains nombres précis.

Les affectations sont qualifiées par collection (`expenses`, `fills`, `services`) : le même identifiant dans deux collections ne confond pas leurs devises. Android migre Room **16→17**, avec continuité des anciennes affectations de dépenses. Les indices de lecture associent montant et devise dans la même requête ; les valeurs et extensions inconnues sont conservées selon les limites habituelles, sans promesse d’exactitude pour tous les fichiers possibles. La PWA beta.9 conserve IndexedDB 6, les messages et le cache sont mis à jour ; une base beta.8 reste en version 6.

## Contrôles réalisés sous Linux

- Sur le code final : **143 tests Android ciblés distincts réussis** (49 UI/métier, 93 stockage/migrations, un pont Room), avec tests de conservation, conflits, rollback, Undo, indices et devises mixtes. D’autres tests ont réussi avant la dernière modification : ils ne constituent pas une suite complète finale.
- **Pont fictif** Android → PWA beta.9 → Room → PWA réussi sous Chromium et WebKit Linux, avec modifications et conservation d’une extension de 100 000 caractères et du nombre exact `12345678901234567890.125` dans ces scénarios.
- Scripts : 79 tests Python Android et 19 tests d’archive PWA réussis.
- PWA : 59 tests unitaires ; mise à jour depuis l’archive beta.8 réelle, service worker et export hors ligne vérifiés sous Chromium et WebKit Linux.
- APK debug assemblé : **12 515 617 octets**, SHA-256 `80b271a81baaa3083d60207f0788edc7f37cea77c930f22e2bf84e1da12880e1` ; APK des tests instrumentés compilé ; lint debug : **0 erreur, 20 avertissements, 3 indications**. Cette taille debug n’est pas une mesure d’APK de production.
- **65 scénarios instrumentés déclarés, aucun exécuté.** Suite Android complète non relancée. Pas d’essai Windows, GitHub, émulateur, Android réel ni Safari iOS, pas de mesure de performance. Chromium/WebKit Linux et Robolectric ne remplacent pas ces essais.

## Relancer les essais historiques

La mise à jour réelle beta.8 → beta.9 a été vérifiée avant la rétention des trois archives. Pour relancer `tests/mise-a-jour-beta9.cjs`, il faut fournir l’ancien ZIP beta.8 authentique via `VIGIE_PREVIOUS_PWA` ; il n’est pas inclus dans les nouvelles archives ni conservé parmi les trois ZIP finaux. Le test historique de refus par beta.7 nécessite lui aussi son ancien ZIP authentique, non conservé ici. Ne substituez pas une autre version et ne fabriquez pas de faux ancien lecteur.

Les guides [DEVISES-OPERATIONS-BETA8.md](DEVISES-OPERATIONS-BETA8.md) et [DEVISES-ANDROID-BETA35.md](DEVISES-ANDROID-BETA35.md) décrivent leur état historique et non la compatibilité actuelle.
