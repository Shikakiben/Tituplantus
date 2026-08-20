# NOTE-TITUPLANTUS.md — Notes de maintenance (pour l'IA)

> **À lire par l'IA** avant toute modification de Tituplantus.
> L'utilisateur n'y connaît rien en technique — il passe par l'IA.
> Cette note survit à la réinstallation du PC (contrairement à la mémoire VS Code).

---

## 🌐 Vue d'ensemble

- **App** : étiquettes d'impression horticoles 11×115 mm, 100 % hors-ligne, un seul code HTML/CSS/JS.
- **Dépôt GitHub** : `Shikakiben/Tituplantus` (public) — clone local : `Tituplantus/` dans le workspace.
- **Version locale** : `Lancer-Tituplantus.sh` (Linux) / `.bat` (Windows) → ouvre `index.html` en `file://` (aucun serveur).
- **Version web (PWA)** : `https://tituplantus.lesmuretsducausse.com/` (sous-domaine → GitHub Pages).
  - L'ancienne `https://shikakiben.github.io/Tituplantus/` redirige (301) vers le sous-domaine.

## 🔄 Workflow de mise à jour (version web)

1. Modifier les fichiers **localement** (`Tituplantus/` du workspace)
2. `git commit` + `git push` vers GitHub
3. **GitHub Pages se reconstruit automatiquement** (~1-2 min)
4. Les utilisateurs reçoivent la nouvelle version **en arrière-plan** à leur prochaine ouverture en ligne

> L'utilisateur ne fait JAMAIS git lui-même — c'est l'IA qui commit/push.

## ⚠️ Règle : ajout d'un NOUVEAU fichier

Si on **ajoute un nouveau fichier** à l'app (police, image, modèle…) :

1. L'ajouter à la liste `ASSETS` dans **`sw.js`**
2. **Changer le numéro de version du cache** en haut de `sw.js` :
   - `tituplantus-v1` → `tituplantus-v2` → `v3`… (à chaque ajout)
3. Sinon, le nouveau fichier ne sera pas disponible hors-ligne pour les anciens visiteurs

> Si on ne fait que **modifier** des fichiers existants → rien à faire, mise à jour automatique.

## 🧠 Points techniques importants

- **Service worker** : ne fonctionne QUE sur HTTPS (ou localhost). **PAS sur `file://`** → la version locale ne l'utilise pas (c'est le « problème » dont l'utilisateur se souvenait : l'app locale tourne en file://, le commit `aa7781b` a supprimé le serveur HTTP `launcher.js`).
- **Manifest** : `start_url`, `scope`, `id` = `./` (déjà configuré).
- **Impression** : `window.print()` — fonctionne sur mobile via la boîte de dialogue du navigateur (Wi-Fi / AirPrint).
- **Export configs** : Blob + `URL.createObjectURL` + `a.download` — compatible HTTPS.
- **Stockage** : `localStorage` (compatible file:// et HTTPS).
- **Aucune dépendance externe** : tout est local (`assets/xlsx.full.min.js`, polices dans `assets/fonts/`).

## 🗂️ Structure des fichiers

- `index.html` — page principale
- `app.js` — toute la logique (import, modèle, configuration, génération)
- `styles.css` — styles écran + impression
- `formats/models.js` — catalogue des modèles d'étiquettes (champ `vertical` par colonne)
- `sw.js` — service worker (PWA)
- `manifest.json` — manifest PWA
- `CNAME` — sous-domaine `tituplantus.lesmuretsducausse.com`
- `assets/` — `xlsx.full.min.js`, `fonts/`, icônes
- `Lancer-Tituplantus.sh` / `.bat` — lanceurs locaux (file://)
- `Tituplantus.desktop` — raccourci bureau Linux

## 🔮 Évolutions prévues

- **Desktop** : Electron → AppImage (Linux) + .exe (Windows)
- **Android** : Capacitor → .apk (impression via `@capacitor-community/printer`)
- Le même code HTML/CSS/JS sera embarqué dans ces enveloppes natives

## ✅ Vérifications rapides

- Version en ligne : `curl -s -o /dev/null -w "%{http_code}" https://tituplantus.lesmuretsducausse.com/` → `200`
- Service worker : `curl -s -o /dev/null -w "%{http_code}" https://tituplantus.lesmuretsducausse.com/sw.js` → `200`
- Statut Pages : `gh api repos/Shikakiben/Tituplantus/pages` → `"status":"built"`

---

*Note créée le 2026-08-20 — conserver précieusement (survit à la réinstallation du PC).*