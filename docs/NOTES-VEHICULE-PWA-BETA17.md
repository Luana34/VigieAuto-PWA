# Notes du véhicule — PWA 1.5.2-beta.17

## Ce qui est disponible

Dans **Mes véhicules → Notes**, chaque véhicule possède un éditeur local de notes : texte libre, sélection d’un passage, **gras**, *italique* et aperçu. Les deux styles peuvent se combiner. Il s’agit d’un premier sous-lot de la phase 2.4, pas d’un éditeur complet : pas de couleurs, liens cliquables, photos, listes formatées ou mise en page avancée. On peut saisir des puces comme simples caractères dans le texte.

Les notes du véhicule sont communes aux deux versions ; cet éditeur ne concerne pas les notes des pleins, entretiens ou autres éléments. Aucun véhicule actif n’est changé en ouvrant les notes d’un autre véhicule.

## Utilisation et précautions

1. Exportez au préalable une sauvegarde JSON de chaque appareil et conservez une copie externe vérifiée. VigieAuto ne chiffre pas ces fichiers ; les notes peuvent être personnelles.
2. Ouvrez **Mes véhicules**, puis **Notes** sur la carte concernée. Écrivez ou sélectionnez un passage dans le champ. Appuyez sur **Gras** ou **Italique** ; le même bouton retire le style lorsque toute la sélection le possède déjà. Vérifiez le résultat dans l’aperçu.
3. Appuyez sur **Enregistrer les notes**. Remplacer un texte existant, enlever une mise en forme existante ou reprendre un format périmé demande confirmation. Fermer un brouillon non enregistré demande aussi confirmation. Selon le navigateur, un avertissement de rechargement peut apparaître ; un arrêt forcé sur mobile peut l’empêcher. Enregistrez régulièrement.
4. Si vous effacez un passage puis utilisez l’annulation du navigateur, sa mise en forme n’est pas garantie restaurée : vérifiez l’aperçu et réappliquez le style si besoin. L’ancienne version de la note n’est récupérable que si vous avez une sauvegarde antérieure.

L’aperçu traite le texte comme du texte, pas comme du HTML. Les espaces et premiers sauts de ligne historiques ne sont pas retirés lors d’une simple ouverture ou d’une modification d’un autre champ du véhicule. Les anciens retours à la ligne CR ou CRLF peuvent être normalisés en LF **si le texte est réellement modifié ou si l’on ajoute un style** ; cette modification est signalée avant enregistrement. Une simple ouverture ou un simple enregistrement sans changement ne les normalise pas.

L’éditeur accepte jusqu’à **8 000 unités UTF-16** et **128 plages de style** ; certains caractères comme les emoji comptent pour deux unités. Une note importée plus longue reste conservée sans troncature, mais cet éditeur ne l’ouvre pas pour modification. Une saisie qui dépasse la limite reste visible dans le brouillon et ne peut pas être enregistrée tant qu’elle dépasse la limite. Une sélection qui coupe un emoji est refusée.

## Échange avec Android actuel

- Android **0.4.0-beta.46 n’a pas été modifié dans ce lot**. Il lit et édite le texte brut de `notes` mais **n’affiche pas le gras ni l’italique**. Il ne prévient pas encore sur Android que la mise en forme existe.
- La mise en forme est stockée séparément ; Android beta.46 conserve les extensions inconnues dans le code métier testé. Si l’on modifie uniquement un autre champ Android, le texte et les styles demeurent compatibles dans le test Kotlin. Si l’on modifie la note sur Android, son texte actuel reste conservé, mais les anciens styles peuvent ne plus correspondre.
- Au retour dans la PWA, une empreinte différente déclenche un avertissement : le texte actuel est montré sans appliquer les anciens styles. **Rien n’est effacé à l’ouverture.** « Reprendre sans l’ancienne mise en forme » demande confirmation et ne la retire effectivement qu’après l’enregistrement et une nouvelle confirmation. Annuler conserve l’extension initiale. Gardez la sauvegarde précédente si vous souhaitez pouvoir la retrouver.
- Un format futur, incomplet ou non reconnu est conservé sans interprétation ni écrasement ; le champ notes de l’ancien formulaire du véhicule est alors en lecture seule. Une absence de cryptographie locale empêche de vérifier et modifier une note déjà enrichie, sans effacer les données ; la saisie d’une note simple reste possible.
- Les échanges se font uniquement par **export puis import manuel**. Un import confirmé **remplace toutes les données** de l’appareil destinataire, sans fusion. Ne modifiez pas le numéro de format pour forcer un import. La version familiale 1.5.1 ne sait pas présenter ces styles et peut arrondir certains grands nombres : ne l’utilisez pas pour modifier une sauvegarde candidate sans copie préalable.

## Contrat technique v1

Le texte demeure dans `vehicles[].notes`, sans copie cachée. L’extension facultative `vigieVehicleNotes` contient une version, l’identifiant d’algorithme, l’empreinte et des plages :

```json
{
  "notes": "Vidange à prévoir",
  "vigieVehicleNotes": {
    "version": 1,
    "algorithm": "sha256-utf16be-v1",
    "textHash": "418b7caad1b5e23d53ff8ff58e0e9d06bf2ad0719e17e25c62115194845c3bbc",
    "marks": [{"start": 0, "end": 7, "style": "bold"}]
  }
}
```

Les bornes sont des positions UTF-16 de début inclus et de fin exclue ; styles v1 : `bold`, `italic`. L’empreinte SHA-256 porte sur les unités UTF-16 **big-endian**, sans BOM, y compris les éventuels surrogates isolés. Elle sert à détecter une divergence, **pas à chiffrer ou authentifier les données**. Les champs inconnus de premier niveau d’une extension v1 reconnue sont conservés ; une plage portant des champs inconnus ou un style inconnu est protégée plutôt que simplifiée. Aucune extension n’est créée simplement en consultant une note ancienne. Les styles reconnus sont ajustés lors d’une modification du texte et contrôlés dans l’aperçu.

L’écriture compare atomiquement le véhicule complet à son état au début du brouillon. Si un autre onglet le modifie ou le supprime, l’enregistrement est refusé sans écrasement ni recréation : prenez note du brouillon, fermez, rechargez, puis recommencez. Pendant la sauvegarde, le champ et les commandes de style sont temporairement verrouillés. Aucune nouvelle migration IndexedDB, dépendance de production, connexion ni synchronisation n’a été introduite. JSON v3/v4/v5 et IndexedDB 6 restent inchangés.

## Vérifications de ce lot

- **111 tests Node** réussis, dont 17 nouveaux sur les notes ; **31 tests d’archive** et **14 tests de sélection des fichiers de publication** réussis sous Linux.
- Notes fictives : conservation des espaces, CR/LF et valeurs absentes/nulles, sélection tactile simulée, quatre thèmes et contraste de l’aperçu, format inconnu, limites, refus/acceptation, HTML non interprété, deux onglets et suppression concurrente, export/import et hors-ligne sous **Chromium et WebKit Linux**. Les essais n’utilisent pas de données personnelles.
- Mise à jour réelle du service worker de l’archive PWA beta.16 vers beta.17 avec données fictives puis ouverture, mise en forme, export et autres parcours hors réseau : Chromium et WebKit Linux. Fiche et repères précédents ainsi que les parcours historiques principaux ont aussi été rejoués.
- Compatibilité ciblée : export fictif PWA → **vrai code métier Kotlin `VehicleEdit.kt` d’Android beta.46**, compilé en JVM avec Gson → retour dans la PWA Chromium et WebKit. Un changement d’autre champ préserve texte et extension ; un changement de texte préserve l’extension et déclenche l’avertissement. **Ce banc précis ne traverse ni Room ni une interface Android**, et ne remplace pas un essai sur appareil. Le pont Room de beta.46 avait été testé pour la fiche lors du lot précédent, pas pour cette nouvelle extension.
- Les branches historiques nécessitant les ZIP beta.1 et beta.6 absents ont été signalées comme non rejouées ; le test des opérations nécessitant beta.7 n’a pas été lancé sans son vrai ZIP. Aucun test historique n’a été retiré.
- Aucun iPhone, Safari iOS, lecteur d’écran réel, émulateur ou téléphone Android n’a été testé pour ce lot. WebKit Linux n’est pas Safari iOS ; les gestes de sélection sur iPhone restent à confirmer. Les performances, temps, mémoire et fluidité ne sont pas mesurés. La candidate n’est pas une version stable.

Les commandes principales sont `npm test`, `npm run test:archive`, `python3 tests/publication.test.py`, `npm run test:notes-vehicule` et `npm run test:mise-a-jour-beta17`. Avec `VIGIE_BROWSER=webkit`, les deux derniers utilisent WebKit. Le test de migration demande le vrai ZIP beta.16 via `VIGIE_PREVIOUS_PWA` si celui-ci a été retiré. Le banc Kotlin utilise les sources Android beta.46, Gson 2.11.0 et Kotlin 2.1.20 ; ses deux fichiers de retour fictifs peuvent être soumis à `tests/pont-notes-retour.cjs`.
