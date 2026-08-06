# 🌱 Studio d'étiquettes horticoles 11×115 mm

Application **locale** — fonctionne **hors-ligne**, sans serveur, sur **Linux et Windows** (et tout système avec un navigateur moderne).

> **Un seul code HTML/CSS/JS.** Importez un fichier Excel, construisez votre modèle d'étiquette, générez vos planches A4 en ciseaux et imprimez.

---

## 🚀 Lancement

### Linux
Double-cliquer sur **`Lancer-Etiquettes.sh`** (ouvre `index.html` directement dans Chrome/Chromium en mode app, sinon dans le navigateur par défaut — **aucun serveur nécessaire**).

Option bureau : modifier `etiquettes.desktop` avec le bon chemin puis le copier dans `~/.local/share/applications/`.

### Windows
Double-cliquer sur **`Lancer-Etiquettes.bat`**.

### Alternative (serveur local, optionnel)
Si besoin d'un serveur HTTP local :
```bash
npm start        # lance le serveur sur http://127.0.0.1:3210 et ouvre l'app
```

---

## 📋 Fonctionnalités

- 📥 **Import de fichier de calcul** (.xlsx, .xls, .xlsm, .xlsb, .ods, .fods, .csv…) — Excel, LibreOffice Calc et autres, détection multi-onglets
- 🔤 **Sélection par lettres** (A→J) — chaque cellule du modèle lit la colonne Excel choisie
- 🎨 **Style personnalisable** — police, taille, gras, italique, alignements H/V, 3 lignes redimensionnables (poignées ⋮), colonne verticale pour le prix
- 💾 **Agencements** — sauvegarde / chargement / suppression, avec **auto-chargement du dernier utilisé**
- 👁️ **Aperçu échantillon** — 6 étiquettes visibles avant génération
- 🖨️ **Impression directe** — planches A4 prêtes à imprimer (Ctrl+P)
- 📴 **100 % hors-ligne** — tous les fichiers (styles, polices, moteur Excel) sont locaux

---

## 📥 Règles d'import Excel

- L'app parcourt **tous les onglets** du classeur.
- Un onglet n'est retenu que si sa cellule **A1 contient « nombre » / « Nombre »** (les autres onglets sont ignorés).
- **Colonne A = quantité** (nombre d'étiquettes à imprimer).
- Les lignes sans nombre en colonne A sont ignorées.
- Quantité **0** → avertissement « faute de frappe ? », ligne ignorée.
- Quantité **décimale** → avertissement « arrondi à N ».
- Les colonnes **B et suivantes** contiennent les informations à placer sur l'étiquette (sélection par lettre A→J dans le modèle).

---

## 📐 Format d'impression

| Paramètre | Valeur |
|-----------|--------|
| Étiquette | 115 × 11 mm (105 mm de corps + pointe V de 20 mm) |
| Grille | 2 colonnes × 22 lignes = 44 étiquettes/planche |
| Format papier | **A4 portrait** (210 × 297 mm) |
| Disposition | « en ciseaux » — colonne droite inversée (180°) et décalée de +5,5 mm |
| Haut colonne gauche | 30,25 mm |
| Haut colonne droite | 24,75 mm |
| Marges G/D | 0 mm |

---

## 🔧 Développement

```bash
npm start          # Serveur local (port 3210) — optionnel, l'app marche aussi en file://
```

Structure :
- `index.html` — page principale
- `app.js` — toute la logique (import, modèle, génération, agencements)
- `styles.css` — styles écran + impression
- `assets/` — `xlsx.full.min.js` (lecture Excel), `fonts/` (polices locales)

---

## 🔮 À venir (multiplateforme)

Le même code est destiné à être embarqué dans des enveloppes natives :
- **Desktop** : Electron → AppImage (Linux) et .exe (Windows)
- **Android** : Capacitor → .apk (avec impression via le plugin `@capacitor-community/printer`)
