# Justificatifs photo des dépenses — Android 0.4.0-beta.29 et PWA 1.5.2-beta.4 candidate

## Ce que permet ce lot

Enregistrez d’abord la dépense ; depuis sa ligne, ouvrez **Justificatif photo** sur Android ou **Ajouter / Voir le justificatif** dans la PWA. Vous pouvez ajouter une photo, voir un aperçu si l’image est lisible, la remplacer ou la retirer. Il n’y a qu’**une photo par dépense** ; une photo importée d’un autre appareil peut rester conservée même si son aperçu est indisponible. Ce lot ne permet pas de joindre un PDF à une dépense ; la rubrique Documents de la PWA reste distincte.

Le choix d’une image et l’enregistrement sont explicites. Android demande confirmation avant de remplacer ou de retirer une photo ; dans la PWA, le remplacement ou la case de retrait ne prend effet qu’au bouton **Enregistrer le justificatif**. Fermer le formulaire avant cet enregistrement ne change rien. L’ancien fichier reste intact si la sélection, la lecture, la conversion ou l’écriture échoue. Pendant l’écriture PWA, la fermeture du formulaire est bloquée jusqu’au résultat.

Le remplacement ou le retrait **de la photo seule** ne possède pas d’annulation. Le fichier de la galerie et les anciennes sauvegardes ne sont pas modifiés. Sur Android, supprimer une **dépense entière** supprime aussi son justificatif ; l’Undo de cette suppression restaure les deux tant qu’il est disponible. La PWA demande confirmation avant la suppression d’une dépense, mais ne propose pas cet Undo. Modifier une photo ne remplace pas l’image d’Undo d’une autre suppression Android en attente.

## Formats, confidentialité et limites

| | PWA candidate | Android |
|---|---|---|
| Photo choisie | JPG, PNG, WebP ou GIF ; fichier non vide de 5 Mio maximum | image lisible par l’appareil ; fichier source jusqu’à 12 Mio |
| Copie enregistrée | original choisi, sans conversion ni suppression garantie des métadonnées | JPEG réduit à 1 600 px maximum par côté et 3 Mio maximum ; EXIF non recopiées ; transparence sur fond blanc |
| Aperçu | seulement une URL `data:` d’image connue et bornée ; si illisible, aucune perte | lecture à la demande et aperçu réduit ; formats et décodage dépendent d’Android |
| Accès | sélecteur de fichiers du navigateur, selon ses possibilités | sélecteur système, sans permission générale de galerie ajoutée |

Un iPhone peut produire des fichiers HEIC : si son navigateur ne les fournit pas sous un format accepté, convertissez-les en JPEG avant de les joindre. Une image animée peut ne montrer que sa première image sur Android. Les possibilités de l’appareil et du navigateur ne sont pas garanties par les tests Linux.

**Confidentialité :** la PWA conserve le fichier tel quel, notamment ses éventuelles métadonnées EXIF et coordonnées GPS. Android retire les EXIF des photos nouvellement choisies et converties, mais **ne nettoie pas** les justificatifs déjà importés depuis une PWA ou une sauvegarde. Les photos peuvent contenir des noms, adresses, montants ou autres données personnelles. Elles restent dans le stockage local et sont incluses dans les sauvegardes JSON, **non chiffrées**. Supprimer une photo du carnet ne l’efface ni de la galerie, ni des sauvegardes précédentes.

Les justificatifs agrandissent le stockage et les sauvegardes. La PWA charge ses enregistrements en mémoire ; de nombreuses photos peuvent ralentir l’appareil ou dépasser son quota. Une image seule peut être refusée si la dépense et ses extensions rendent l’objet trop gros pour le pont Android. La limite Android reste d’environ 16 Mio de caractères par objet, 32 Mio UTF-8 stockés par objet et 256 Mio par fichier importé : un ensemble de nombreuses photos peut dépasser la dernière limite même si chaque photo est acceptée. L’export ne garantit pas que tout autre appareil dispose de suffisamment d’espace ou de mémoire.

## Échange et compatibilité

Le JSON reste en **version 3**, Room en **version 15** et IndexedDB en **version 4** ; aucune table ni migration nouvelle. L’extension facultative d’une dépense est :

```json
"vigieExpenseReceipt": {
  "version": 1,
  "dataUrl": "data:image/jpeg;base64,..."
}
```

Le champ `dataUrl` peut manquer après retrait. Les propriétés supplémentaires d’une enveloppe de version 1 sont conservées, y compris au remplacement et au retrait. Une enveloppe nulle, de type inconnu, d’une autre version ou avec photo non textuelle est conservée à l’import et à l’édition de la dépense, mais n’est pas interprétée ni modifiable dans cet écran. Une chaîne de photo invalide ou trop grande reste conservée ; l’aperçu peut être indisponible. Supprimer toute la dépense supprime évidemment toutes ses extensions.

La PWA et Android partagent la même enveloppe : un justificatif PWA est conservé dans Room et une photo Android est consultable dans la candidate PWA si le navigateur la décode. Les versions anciennes peuvent conserver cette propriété comme extension sans savoir l’afficher ou la gérer ; ne pas supposer qu’elles connaissent ses règles. La PWA familiale 1.5.1 peut arrondir certains nombres d’extensions et ne peut pas rouvrir directement une base IndexedDB 4.

Pour limiter les écrasements, les écritures de justificatif sont vérifiées dans la transaction contre la version de la dépense affichée. La candidate PWA applique aussi cette vérification à l’édition et à la suppression d’une dépense ; Android utilise l’empreinte Room. En cas de conflit, rien n’est remplacé : fermez le formulaire, rechargez et recommencez. **Fermez les anciens onglets et anciennes versions** avant utilisation : une ancienne PWA ne possède pas forcément cette protection. L’import JSON confirmé remplace toujours le carnet ; ce n’est ni une synchronisation ni une fusion.

Avant chaque essai, exportez une sauvegarde externe distincte et vérifiez-la. Testez la candidate sur une autre origine ou un autre appareil, sans remplacer l’unique installation familiale. Une origine différente a un stockage distinct ; transférez manuellement une copie de sauvegarde. Aucune mise en ligne n’est effectuée par ce ZIP.

## Vérifications et suite

Le récapitulatif des vérifications exécutées pour cette préversion et leurs limites figure dans [VALIDATION-BETA29.md](VALIDATION-BETA29.md), `PERFORMANCES.md`, `HISTORIQUE.md` et le changelog. Les navigateurs de test sur Linux et Robolectric ne remplacent pas des essais sur téléphone, émulateur, Windows ou Safari iOS.

La devise réglable et le lien automatique plein/dépense sans double comptage restent à développer. Les objectifs de performance et la validation physique du socle restent ouverts ; aucun chiffre cible n’est présumé atteint.
