# Tituplantus

Application **locale** — fonctionne **hors-ligne**, sans serveur, sur **Linux et Windows** (et tout navigateur moderne).

> **Un seul code HTML/CSS/JS.** Choisis un modèle d'étiquette, importe un fichier de calcul, configure le style, génère tes planches A4 et imprime. **Roule, ma Boule !**

---

## 🚀 Lancement

### Linux
Double-cliquer sur **`Lancer-Tituplantus.sh`** (ouvre `index.html` directement dans Chrome/Chromium en mode app, sinon dans le navigateur par défaut — **aucun serveur nécessaire**).

Option bureau : modifier `Tituplantus.desktop` avec le bon chemin puis le copier dans `~/.local/share/applications/`.

### Windows
Double-cliquer sur **`Lancer-Tituplantus.bat`**.

---

## 📋 Fonctionnalités

- 🏷️ **Sélecteur de modèle** — extensible (`formats/models.js`), démarre sur « Aucun »
- 📥 **Import de fichier de calcul** — Excel, LibreOffice Calc, CSV et bien d'autres (.xlsx, .xls, .ods, .csv…)
- 🔤 **Sélection par lettres B→J** — chaque cellule du modèle lit la colonne choisie (colonne A = quantités, réservée)
- 🎨 **Style personnalisable** — police, taille, gras, italique, alignements H/V, colonnes redimensionnables (poignées ⋮)
- 💾 **Configurations** — sauvegarde, chargement automatique, suppression, export/import JSON
- 👁️ **Aperçu** — format réel de l'étiquette, scroll horizontal sur petits écrans
- 🖨️ **Impression** — planches A4 générées, prêtes à imprimer
- 📴 **100 % hors-ligne** — polices, moteur de calcul, tout est local
- 🔒 **Sections désactivées** quand aucun modèle n'est sélectionné (import, configuration, génération)

---

## 📥 Règles d'import

- L'app parcourt **tous les onglets** du fichier.
- Un onglet n'est retenu que si sa cellule **A1 contient « nombre » / « Nombre »** (les autres sont ignorés).
- **Colonne A = quantité** (nombre d'étiquettes à imprimer).
- Lignes sans nombre en colonne A → ignorées.
- Quantité **0** → avertissement « faute de frappe ? », ligne ignorée.
- Quantité **décimale** → avertissement « arrondi à N ».
- Lignes dont toutes les colonnes B+ sont vides → ignorées.
- Les colonnes **B→J** contiennent les infos à placer (sélection par lettre dans la config).

---

## 📐 Format d'impression (modèle 11×115 mm)

| Paramètre | Valeur |
|-----------|--------|
| Étiquette | 115 × 11 mm (105 mm de corps + pointe V de 20 mm) |
| Grille | 2 colonnes × 22 lignes = 44 étiquettes/planche |
| Format papier | **A4 portrait** (210 × 297 mm) |
| Disposition | « en ciseaux » — colonne droite inversée (180°) et décalée de +5,5 mm |
| Haut colonne gauche | 30,25 mm |
| Haut colonne droite | 24,75 mm |

---

## 🔧 Ajouter un modèle

Éditer `formats/models.js` et ajouter une entrée dans `MODELS` :

```js
{
  id: "monformat",  name: "Mon format 80×40 mm",
  lw:80, lh:40,   bw:60,   tw:20, tx:60,   gbw:60,
  pw:210, ph:297,
  cols:2,  rowsPerCol:10,
  columns: [
    // 1 entrée par colonne de texte :
    //   vertical:true → colonne lue verticalement (colonne « prix »), sinon horizontale
    { width:15, vertical:true, lines:[ /* lignes de texte */ ] }
  ],
  // 1 entrée par colonne de planche :
  //   top    = marge haute (mm)
  //   rotate = 180 → colonne inversée (disposition « en ciseaux »), 0 → normale
  margins:[ { top:10, rotate:0 }, { top:12, rotate:180 } ]
}
```

Le nouveau modèle apparaît automatiquement dans le sélecteur.

---

## 🔧 Développement

Structure :
- `index.html` — page principale
- `app.js` — toute la logique (import, modèle, configuration, génération)
- `styles.css` — styles écran + impression (variables CSS dynamiques)
- `formats/models.js` — catalogue des modèles d'étiquettes
- `assets/` — `xlsx.full.min.js` (lecture de fichiers), `fonts/` (polices locales)

Aucun serveur nécessaire : ouvrir `index.html` directement (ou passer par `Lancer-Tituplantus.sh` / `Lancer-Tituplantus.bat`).

---

## 🔮 À venir (multiplateforme)

Le même code pourra être embarqué dans des enveloppes natives :
- **Desktop** : Electron → AppImage (Linux) et .exe (Windows)
- **Android** : Capacitor → .apk (avec impression via `@capacitor-community/printer`)

---

## 📜 Licence

**Tituplantus** est distribué sous la **GNU General Public License v3.0** (GPL-3.0).

Vous pouvez utiliser, modifier et distribuer ce logiciel librement, mais toute version modifiée ou dérivée doit être publiée sous la même licence, avec son code source. Voir le fichier [`LICENSE`](LICENSE) pour le texte complet.

© Tituplantus — tous droits réservés sur le nom et le contenu original.
