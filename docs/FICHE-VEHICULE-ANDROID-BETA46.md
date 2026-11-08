# Informations complémentaires du véhicule — Android 0.4.0-beta.46

## Où les trouver ?

Dans **Accueil**, le bouton **Informations complémentaires** concerne le véhicule affiché. Dans **Voir mon véhicule / Choisir un véhicule**, le bouton **Informations** permet d’ouvrir la fiche de chaque véhicule, même s’il n’est pas actif : cela ne change pas la sélection. Les champs sont tous facultatifs :

- couleur réelle de la carrosserie, distincte du repère de couleur choisi dans VigieAuto ;
- compagnie, numéro de contrat et date d’échéance de l’assurance ;
- date d’achat et prix d’achat avec sa devise explicite.

Les dates se saisissent en `AAAA-MM-JJ`, ou avec le calendrier proposé pour les années 1900 à 2100 ; la saisie manuelle accepte une date valide de 0001 à 9999. Le prix est un montant **positif ou nul**, sans séparateur de milliers, avec au plus 24 chiffres avant la virgule et six après. Le montant et sa devise à trois lettres vont ensemble : laisser les deux vides si le prix n’est pas renseigné. Les codes courants sont proposés et **Autre code** permet un autre code à trois lettres, vérifié sur sa forme sans consulter de service externe.

Rien n’est enregistré à l’ouverture ; **Enregistrer** est nécessaire. Après une modification, **Annuler**, Retour ou la fermeture du dialogue demandent si l’on souhaite abandonner le brouillon. Lors de l’effacement d’une valeur existante ou du changement de devise d’un prix existant, une confirmation supplémentaire précède l’enregistrement. Aucun taux n’est appliqué et aucun montant n’est converti. Pour supprimer le prix, effacer son montant **et** sa devise, puis confirmer. Il n’existe pas d’Undo pour l’édition seule de ces informations : conservez une sauvegarde avant toute modification importante.

L’échéance est indicative : **aucun rappel n’est créé automatiquement**. Aucun achat ni dépense n’est ajouté au carnet. La fiche reste locale ; elle est incluse dans les sauvegardes JSON non chiffrées, qui peuvent contenir des données personnelles. Gardez une copie extérieure à l’appareil, dans un endroit sûr.

## Conservation et échanges

Le contrat `vigieVehicleProfile` v1 est commun à la PWA 1.5.2-beta.16. Le prix est stocké comme texte décimal exact, pas comme nombre à virgule flottante. Un véhicule ancien sans fiche n’est pas réécrit si rien n’a changé. Lors d’un changement, les autres champs, le repère, les photos, les collections liées, les valeurs nulles et les extensions inconnues restent conservés ; seul `updatedAt` est également mis à jour sur Android. Une fiche d’un format inconnu est signalée et reste conservée, sans édition ni effacement depuis ce formulaire.

La lecture utilise le véhicule complet associé à l’empreinte affichée ; le contrôle de cette empreinte et l’écriture sont effectués dans une même transaction Room. Si le véhicule local a changé ou a été supprimé, l’enregistrement est refusé ; pour réessayer, fermez et rouvrez ses informations. Relevez au besoin votre saisie avant de confirmer l’abandon du brouillon. L’état du formulaire est conservé lors d’une recréation ordinaire de l’écran, mais **une saisie non enregistrée n’est pas garantie après arrêt du processus**.

Room reste en version 17, sans migration de base ; le format d’export reste v3, v4 ou v5 selon les données. Android et la PWA sont indépendants : l’échange reste **manuel**, sans serveur ni synchronisation. Un import confirmé **remplace tout le carnet du destinataire**, jamais une fusion. Exportez et vérifiez d’abord une sauvegarde de chaque appareil, et gardez les fichiers originaux hors téléphone.

## Vérifications et limites

- **141 tests JVM ciblés réussis sous Linux**, sans échec ni ignoré dans la série finale : domaine, Room, Compose, accueil et recréation de l’Activity, sélection, édition et suppression du véhicule, photo, repères et ViewModel. Après raccourcissement du nom du test d’accueil pour limiter les chemins temporaires, ce même scénario a été recompilé et rejoué séparément. La suite JVM complète n’a pas été relancée.
- Un corpus de **144 cas synthétiques générés depuis le contrat PWA beta.16** compare reconnaissance et modification : absence, formats futurs, dates, montants, devises et extensions. Les formats inconnus ne sont pas écrasés.
- Une fiche fictive créée par la PWA a été importée dans Room, modifiée par le dépôt Android, exportée puis relue et modifiée par la PWA sous **Chromium et WebKit Linux**. Les autres données et les nombres précis sont conservés. Ce pont teste les dépôts et les navigateurs, pas un téléphone.
- APK debug assemblé : 12 886 718 octets, SHA-256 `09379d5be53bbd776cde98032ad24f2f1e39faf12fde7c7454b6e25f1e179924`, identifiant `com.vigieauto.app`, code 50, API minimale 26 et cible 36. Ce n’est ni un APK de production ni une mesure de taille release.
- **69 scénarios instrumentés compilés, non exécutés** ; lint : **0 erreur, 24 avertissements, 5 indications**. Contrôles Python : 35 archive, 32 rapports CI, 7 workflow et 22 R8 réussis. Les tests antérieurs sont conservés.
- Les premiers essais de test d’interface ont nécessité une correction d’assertion, un défilement du menu et une synchronisation du Looper simulé ; les scénarios concernés ont ensuite réussi. Ces corrections concernaient les tests, sans supprimer de scénario ni modifier le code métier.

La phase 2.4 reste partielle : les notes enrichies ne sont pas développées. La vue combinée ou les avatars restent à étudier en phase 2.3 ; l’historique du compteur doit être étudié avant tout codage en phase 2.5. Le socle n’est pas déclaré stable. Pas de test sur appareil Android, émulateur, PC Windows réel, GitHub ou Safari iOS dans ce lot ; WebKit Linux ne valide pas Safari sur iPhone. Aucune mesure de performance sur appareil n’est revendiquée.

Pour préparer vos essais ultérieurs, ouvrir un nouveau dossier issu du ZIP dans Android Studio puis, après synchronisation :

```powershell
.\gradlew.bat :app:assembleDebug :app:testDebugUnitTest
```

La correction des sept échecs signalés sur Windows beta.44 reste à confirmer sur votre PC, même si des tests ciblés ont réussi sous Linux et Wine dans beta.45. Les échecs éventuels se trouvent dans `app\build\reports\tests\testDebugUnitTest\index.html` et les XML associés. Aucune sauvegarde personnelle n’est nécessaire pour les tests automatisés.
