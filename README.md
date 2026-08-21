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

---

## 🔧 Maintenance / Mise à jour

> **Pour l'utilisateur** : tu n'as rien à faire toi-même — demande à l'IA de faire les changements.
> **Pour l'IA** : toutes les règles techniques (service worker, cache, workflow git, structure) sont dans **`NOTE-TITUPLANTUS.md`** (dans ce dossier).

**En bref** : l'IA modifie les fichiers → `git push` → GitHub Pages se reconstruit automatiquement (~1-2 min) → la version web est à jour. Si on **ajoute un nouveau fichier**, il faut le déclarer dans `sw.js` et changer le numéro de version du cache (voir la note).

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

## 📜 Licence

**Tituplantus** est distribué sous la **GNU General Public License v3.0** (GPL-3.0).

Vous pouvez utiliser, modifier et distribuer ce logiciel librement, mais toute version modifiée ou dérivée doit être publiée sous la même licence, avec son code source. Voir le fichier [`LICENSE`](LICENSE) pour le texte complet.

© Tituplantus — tous droits réservés sur le nom et le contenu original.
