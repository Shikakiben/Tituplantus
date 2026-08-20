# Tituplantus

Application **locale** — fonctionne **hors-ligne**, sans serveur, sur **Linux et Windows** (et tout navigateur moderne).

> **Un seul code HTML/CSS/JS.** Choisis un modèle d'étiquette, importe un fichier de calcul, configure le style, génère tes planches A4 et imprime. **Roule, ma Boule !**

---

## 🌐 Version web (PWA) — smartphones + PC

L'app est aussi disponible **en ligne** : **https://tituplantus.lesmuretsducausse.com/**

> L'ancienne adresse `https://shikakiben.github.io/Tituplantus/` redirige automatiquement vers le sous-domaine.

- **Installable** : sur téléphone, « Ajouter à l'écran d'accueil » (Android) / « Sur l'écran d'accueil » (iOS) ; sur PC, icône « Installer » dans le navigateur → s'ouvre comme une vraie app.
- **Hors-ligne** : après une première ouverture en ligne, l'app fonctionne **sans connexion** (service worker `sw.js` qui met tout en cache).
- **Mise à jour** : à chaque ouverture en ligne, le service worker récupère la nouvelle version en arrière-plan.
- **Impression** : depuis un téléphone, via la boîte de dialogue d'impression du navigateur (Wi-Fi / AirPrint).

> ⚠️ Le service worker ne fonctionne **que sur HTTPS** (ou localhost). La version locale `file://` ne l'utilise pas — elle reste 100 % locale et indépendante.

---

## � Maintenance / Mise à jour (à lire par l'IA)

> **Pour l'utilisateur** : tu n'as rien à faire toi-même — demande à l'IA de faire les changements. Cette section est là pour que l'IA retrouve les règles.

### Comment fonctionne la mise à jour de la version web

1. Les fichiers sont modifiés **localement** (dossier `Tituplantus/` du workspace)
2. L'IA fait `git commit` + `git push` vers GitHub (`Shikakiben/Tituplantus`)
3. **GitHub Pages se reconstruit automatiquement** (~1-2 min) → la version web est à jour
4. Les utilisateurs qui ont déjà ouvert l'app reçoivent la nouvelle version **en arrière-plan** à leur prochaine ouverture en ligne

### ⚠️ Règle importante : ajout d'un NOUVEAU fichier

Si on **ajoute un nouveau fichier** à l'app (ex. une nouvelle police, une image, un modèle) :

1. L'ajouter à la liste `ASSETS` dans **`sw.js`**
2. **Changer le numéro de version du cache** en haut de `sw.js` :
   - `tituplantus-v1` → `tituplantus-v2` → `v3`… (à chaque ajout de fichier)
3. Sinon, le nouveau fichier ne sera pas disponible hors-ligne pour les anciens visiteurs

> Si on ne fait que **modifier** des fichiers existants, rien à faire de spécial : la mise à jour se fait toute seule.

### Vérifier que la version en ligne est à jour

- Ouvrir `https://tituplantus.lesmuretsducausse.com/` (ou recharger avec Ctrl+F5)
- L'IA peut vérifier avec : `curl -s -o /dev/null -w "%{http_code}" https://tituplantus.lesmuretsducausse.com/` → doit répondre `200`

---

## �🚀 Lancement

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

> ✅ **Fait (2026-08-20)** : version web PWA en ligne sur GitHub Pages (`sw.js` + manifest complet).

---

## 📜 Licence

**Tituplantus** est distribué sous la **GNU General Public License v3.0** (GPL-3.0).

Vous pouvez utiliser, modifier et distribuer ce logiciel librement, mais toute version modifiée ou dérivée doit être publiée sous la même licence, avec son code source. Voir le fichier [`LICENSE`](LICENSE) pour le texte complet.

© Tituplantus — tous droits réservés sur le nom et le contenu original.
