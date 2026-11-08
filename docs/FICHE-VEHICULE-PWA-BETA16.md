# Informations complémentaires du véhicule — PWA 1.5.2-beta.16

## Ce qui est nouveau

Dans **Mes véhicules**, le bouton **Infos véhicule** ouvre une fiche indépendante, même pour un véhicule qui n’est pas sélectionné. Tous les champs sont facultatifs :

- couleur réelle de la carrosserie, en texte libre ; elle ne remplace pas le **repère de couleur** utilisé pour distinguer les véhicules ;
- compagnie d’assurance, numéro de contrat et date d’échéance ;
- date et prix d’achat, avec une devise explicitement choisie si un prix est renseigné.

Le VIN, l’immatriculation et les notes simples existaient déjà dans **Modifier**. Ils ne sont pas recopiés ou réécrits par la nouvelle fiche. La mise en forme enrichie des notes reste à concevoir et à réaliser sans compromettre les notes déjà stockées ; il ne s’agit donc que d’**une partie de la phase 2.4**.

## Utilisation et précautions

1. Avant tout essai ou mise à jour, exportez une sauvegarde JSON de chaque appareil et conservez-en une copie externe vérifiée. Une sauvegarde n’est pas chiffrée par VigieAuto.
2. Dans **Mes véhicules**, appuyez sur **Infos véhicule** sur la carte concernée. Aucun changement de véhicule actif n’est nécessaire.
3. Renseignez seulement ce que vous souhaitez conserver. Pour un prix, indiquez aussi sa devise ; pour une devise non proposée, choisissez **Autre devise…** et vérifiez le code à trois lettres. La validité officielle de ce code n’est pas vérifiée en ligne.
4. Appuyez sur **Enregistrer**. Effacer une valeur déjà enregistrée ou changer la devise d’un prix existant demande confirmation. L’abandon du brouillon demande aussi confirmation. Un navigateur peut afficher un avertissement lors d’un rechargement ou d’une fermeture ; sur mobile, une interruption ou un arrêt forcé peut empêcher cet avertissement. Enregistrez régulièrement.

Le prix est conservé sans arrondi en texte décimal exact, avec au plus 24 chiffres avant et 6 après la virgule ou le point ; les dates sont vérifiées comme dates calendaires. Changer une devise ne convertit jamais un prix. Cette fiche ne crée **ni dépense, ni achat dans le carnet, ni rappel automatique**. L’échéance d’assurance est indicative.

Si le même véhicule est modifié ou supprimé dans un autre onglet avant l’enregistrement, la sauvegarde de la fiche est refusée : fermez-la après avoir pris note du brouillon, rechargez et recommencez. Un format d’informations futur ou incompatible est conservé mais non modifiable dans cette version. Les extensions inconnues d’un format reconnu sont conservées dans les scénarios testés.

## Échanges et périmètre

- La fiche est une extension facultative `vehicles[].vigieVehicleProfile`, version `1` ; les valeurs non indiquées ne sont pas inventées. La PWA reste en IndexedDB 6 et exporte en JSON v3/v4/v5 selon les affectations de devises des opérations.
- Le prix d’achat est conservé dans la fiche, **pas** dans la liste des opérations ni dans leurs totaux par devise. Les devises d’opérations existantes ne sont pas changées.
- Aucun écran Android de ces nouveaux champs n’est fourni par Android beta.45 ; son code est inchangé. Les données transitent par des sauvegardes JSON manuelles, jamais par synchronisation directe. Une version qui ne connaît pas les champs ne sait pas les afficher ni les modifier.
- Un import confirmé **remplace l’ensemble** des données de l’appareil destinataire : il ne fusionne pas les carnets. Gardez des copies externes avant chaque échange et ne modifiez pas les numéros des formats pour contourner un refus.
- Les gestes, l’accessibilité et l’avertissement de fermeture restent à vérifier sur les appareils et navigateurs réels ; WebKit Linux n’est pas Safari iOS. Cette version est une candidate, pas une validation iPhone ni une version finale.

### Structure technique indicative

L’exemple est fictif et ne constitue pas une sauvegarde complète :

```json
{
  "vigieVehicleProfile": {
    "version": 1,
    "bodyColor": "Gris métallisé",
    "insurance": { "company": "Assurance fictive", "policyNumber": "ABC123", "expiryDate": "2028-09-05" },
    "purchase": { "date": "2020-05-18", "amount": "12500.25", "currency": "EUR" }
  }
}
```

Les dates et les montants sont des chaînes ; les sous-objets et propriétés restent facultatifs. En cas de futur format non reconnu, la PWA n’essaie pas de le convertir. La fiche ne remplace pas la sauvegarde externe.

## Vérifications du lot

- Tests unitaires Node, archivage et publication : voir l’historique et le bilan pour les résultats consolidés.
- Interface avec jeux fictifs sous Chromium et WebKit Linux : champs, confirmations, conflits entre onglets, formats inconnus, quatre thèmes, sauvegarde v5 et hors ligne.
- Mise à jour réelle d’une archive beta.15 vers beta.16 sur la même origine, avec repère, export v5 et ajout hors ligne, sous Chromium et WebKit Linux. Ne pas supprimer les données du navigateur pour forcer une mise à jour.
- Un scénario fictif PWA → Android beta.45/Room → PWA a conservé la fiche, ses nombres précis et les données liées après modification d’une note via le dépôt Android, suppression/Undo puis retour dans la PWA sous Chromium et WebKit Linux. Le test Kotlin/Robolectric a été compilé et exécuté sur ordinateur ; il ne vérifie pas l’interface ni un appareil Android réels. Les nouveaux champs ne sont pas portés dans l’interface Android.
- Aucune mesure de performance, ni validation sur iPhone/Safari iOS, lecteur d’écran réel, émulateur ou téléphone n’est revendiquée.
