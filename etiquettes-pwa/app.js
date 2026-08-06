/* ================================================================
   Studio d'étiquettes à piquer — Grille 3 colonnes redimensionnables
   ================================================================ */

const ROWS_PER_COL = 22;
const LABELS_PER_SHEET = ROWS_PER_COL * 2; // 44
const SCALE = 3;

const state = {
  rawRows: [],
  rawHeaders: [],
  qtyColIdx: 0,
  defaultQty: 1,
  columns: [
    { width: 15, lines: [{ colIdx: null, font: 'Arial', size: 8, bold: true, italic: false, alignH: 'center', alignV: 'center' }] },
    { width: 40, lines: [
      { colIdx: null, font: 'Arial', size: 8, bold: false, italic: false, alignH: 'left', alignV: 'center' },
      { colIdx: null, font: 'Arial', size: 7, bold: false, italic: true, alignH: 'left', alignV: 'center' }
    ]},
    { width: 40, lines: [
      { colIdx: null, font: 'Arial', size: 8, bold: false, italic: false, alignH: 'left', alignV: 'center' },
      { colIdx: null, font: 'Arial', size: 7, bold: false, italic: false, alignH: 'left', alignV: 'center' },
      { colIdx: null, font: 'Arial', size: 7, bold: false, italic: false, alignH: 'left', alignV: 'center' }
    ]}
  ],
  selectedCell: null, // { col: 0, line: 0 }
  records: [],
  labels: [],
};

/* ---- DOM refs ---- */
const excelFile      = document.getElementById("excelFile");
const importInfo     = document.getElementById("importInfo");
const buildInfo      = document.getElementById("buildInfo");
const sheetContainer = document.getElementById("sheetContainer");
const buildBtn       = document.getElementById("buildBtn");
const printBtn       = document.getElementById("printBtn");

const templateEditor = document.getElementById("templateEditor");
const labelGrid      = document.getElementById("labelGrid");
const cellEditor     = document.getElementById("cellEditor");
const cellEditorTitle= document.getElementById("cellEditorTitle");
const mapperInfo     = document.getElementById("mapperInfo");
const singlePreviewD = document.getElementById("singlePreview");
const arrNameInput   = document.getElementById("arrName");
const saveArrBtn     = document.getElementById("saveArrBtn");
const arrList        = document.getElementById("arrList");
const loadArrBtn     = document.getElementById("loadArrBtn");
const delArrBtn      = document.getElementById("delArrBtn");

/* ---- Événements ---- */
excelFile.addEventListener("change", handleImport);
buildBtn.addEventListener("click", generateAll);
printBtn.addEventListener("click", () => window.print());

// Cell editor events
['ceCol','ceFont','ceSize','ceBold','ceItalic','ceAlignH','ceAlignV'].forEach(id => {
  document.getElementById(id).addEventListener('input', applyCellEdit);
  document.getElementById(id).addEventListener('change', applyCellEdit);
});
document.getElementById('ceClose').addEventListener('click', () => { cellEditor.style.display = 'none'; refreshPreview(); });
document.getElementById('ceDelete').addEventListener('click', deleteCell);
saveArrBtn.addEventListener("click", saveArrangement);
loadArrBtn.addEventListener("click", () => { if (arrList.value) loadArrangement(arrList.value); });
delArrBtn.addEventListener("click", deleteArrangement);

// SW supprimé — pas de cache, toujours la dernière version

/* ================================================================
   IMPORT
   ================================================================ */
function handleImport(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  if (typeof XLSX === "undefined") { importInfo.textContent = "Erreur: bibliothèque Excel non chargée."; return; }
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = new Uint8Array(reader.result);
      const wb = XLSX.read(data, { type: "array" });

      // ── Étape 1 : trier les onglets ──
      // Un onglet est à imprimer UNIQUEMENT si A1 contient « nombre » / « Nombre ».
      const validSheets = [];   // { sheetName, headers, rows }
      const ignoredSheets = [];
      const warnings = [];

      wb.SheetNames.forEach(sheetName => {
        const ws = wb.Sheets[sheetName];
        const aoa = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
        if (!aoa.length) { ignoredSheets.push(sheetName); return; }

        const a1 = String(aoa[0][0] ?? "").trim().toLowerCase();
        if (a1 !== "nombre") { ignoredSheets.push(sheetName); return; }

        // En-têtes = 1ʳᵉ ligne, données = à partir de la 2ᵉ
        const headers = aoa[0].map((h, i) => String(h).trim() || `Colonne ${i + 1}`);
        validSheets.push({ sheetName, headers, rows: aoa.slice(1) });
      });

      if (!validSheets.length) {
        importInfo.textContent = "Aucun onglet à imprimer : aucun onglet n'a « nombre » en A1" +
          (ignoredSheets.length ? ` (onglets ignorés : ${ignoredSheets.join(", ")})` : ".");
        return;
      }

      // ── Étape 2 : fusionner les lignes des onglets valides ──
      // La quantité est TOUJOURS en colonne A. Pas de numéro → ligne ignorée.
      // En-têtes = ceux du 1er onglet valide ; les autres sont alignés par colonne.
      const headers = validSheets[0].headers;
      const rows = [];

      validSheets.forEach(({ sheetName, rows: sheetRows }) => {
        sheetRows.forEach((r, idx) => {
          const fileLine = idx + 2; // ligne réelle dans le fichier
          const raw = String(r[0] ?? "").trim(); // colonne A
          if (raw === "") return; // pas de numéro → ligne ignorée

          const parsed = Number(raw.replace(",", "."));
          if (!Number.isFinite(parsed)) return; // pas un nombre → ligne ignorée

          if (parsed === 0) {
            warnings.push(`« ${sheetName} » ligne ${fileLine} : quantité 0 (ligne ignorée — faute de frappe ?)`);
            return;
          }
          if (!Number.isInteger(parsed)) {
            warnings.push(`« ${sheetName} » ligne ${fileLine} : « ${raw} » n'est pas un entier (arrondi à ${Math.round(parsed)})`);
          }

          rows.push(r);
        });
      });

      if (!rows.length) {
        importInfo.textContent = "Aucune ligne à imprimer : aucune quantité valide en colonne A." +
          (ignoredSheets.length ? ` (onglets ignorés : ${ignoredSheets.join(", ")})` : "");
        return;
      }

      state.rawHeaders = headers;
      state.rawRows = rows;
      state.qtyColIdx = 0;

      const parts = [`${rows.length} lignes, ${headers.length} colonnes.`];
      if (ignoredSheets.length) parts.push(`${ignoredSheets.length} onglet(s) ignoré(s)`);
      if (warnings.length) parts.push(`⚠ ${warnings.join(" ⚠ ")}`);
      importInfo.textContent = parts.join(" — ");

      showTemplateEditor();
    } catch (err) { console.error(err); importInfo.textContent = "Fichier illisible."; }
  };
  reader.readAsArrayBuffer(file);
}

/* ================================================================
   TEMPLATE EDITOR (grille)
   ================================================================ */
function showTemplateEditor() {
  const hdrs = state.rawHeaders;

  // Agencement : reprendre le dernier sauvegardé, sinon auto-affectation B→G
  const arrMap = getArrangements();
  const last = localStorage.getItem(LAST_KEY);
  if (last && arrMap[last]) {
    state.columns = JSON.parse(JSON.stringify(arrMap[last]));
  } else {
    let autoIdx = 1; // commencer à colonne B
    state.columns.forEach(col => {
      col.lines.forEach(line => {
        line.colIdx = autoIdx < hdrs.length ? autoIdx : null;
        autoIdx++;
      });
    });
  }
  refreshArrList();
  if (last && arrMap[last]) arrList.value = last;

  cellEditor.style.display = 'none';
  state.selectedCell = null;
  templateEditor.style.display = "block";
  buildInfo.textContent = "Configure la grille, puis génère.";
  renderGrid();
  refreshPreview();
}

function renderGrid() {
  labelGrid.innerHTML = '';

  // Pointe V (droite)
  const v = document.createElement('div');
  v.className = 'label-grid-v';
  v.innerHTML = '<svg viewBox="0 0 20 11" preserveAspectRatio="none" shape-rendering="crispEdges"><line x1="0" y1="0" x2="20" y2="5.5" stroke="#999" stroke-width="0.2"/><line x1="0" y1="11" x2="20" y2="5.5" stroke="#999" stroke-width="0.2"/></svg>';
  labelGrid.appendChild(v);

  // Corps 95mm avec colonnes
  const body = document.createElement('div');
  body.className = 'label-grid-body';

  state.columns.forEach((col, ci) => {
    // Poignée avant (sauf 1ʳᵉ colonne)
    if (ci > 0) {
      const h = document.createElement('div');
      h.className = 'grid-handle';
      h.addEventListener('mousedown', e => onHandleDown(e, ci));
      body.appendChild(h);
    }

    const colEl = document.createElement('div');
    colEl.className = 'grid-col';
    colEl.style.width = col.width + 'mm';
    if (ci === 0) colEl.classList.add('grid-col-price');
    else if (ci === state.columns.length - 1) colEl.classList.add('grid-col-last');
    else colEl.classList.add('grid-col-mid');

    col.lines.forEach((line, li) => {
      const cell = document.createElement('div');
      cell.className = 'grid-cell';
      if (line.colIdx !== null && line.colIdx < 26) {
        cell.textContent = colLetter(line.colIdx);
        cell.style.color = '#333';
      } else {
        cell.textContent = '·';
      }
      if (state.selectedCell && state.selectedCell.col === ci && state.selectedCell.line === li) {
        cell.classList.add('selected');
      }
      cell.addEventListener('click', () => selectCell(ci, li));
      colEl.appendChild(cell);
    });

    body.appendChild(colEl);
  });

  labelGrid.appendChild(body);
}

/* ---- Drag handles ---- */
let dragInfo = null;
function onHandleDown(e, colIdx) {
  dragInfo = { colIdx, startX: e.clientX, widths: state.columns.map(c => c.width) };
  document.querySelectorAll('.grid-handle').forEach(h => h.classList.add('active'));
  document.body.style.cursor = 'col-resize';
  e.preventDefault();
}
document.addEventListener('mousemove', e => {
  if (!dragInfo) return;
  const dx = e.clientX - dragInfo.startX;
  const dmm = dx / SCALE;
  const ws = [...dragInfo.widths];
  const ci = dragInfo.colIdx;
  const MIN = 5;
  let w0 = ws[ci - 1] + dmm;
  let w1 = ws[ci] - dmm;
  if (w0 < MIN) { w1 -= (MIN - w0); w0 = MIN; }
  if (w1 < MIN) { w0 -= (MIN - w1); w1 = MIN; }
  ws[ci - 1] = Math.max(MIN, w0);
  ws[ci] = Math.max(MIN, w1);
  state.columns.forEach((c, i) => { c.width = ws[i]; });
  renderGrid();
});
document.addEventListener('mouseup', () => {
  if (!dragInfo) return;
  dragInfo = null;
  document.querySelectorAll('.grid-handle').forEach(h => h.classList.remove('active'));
  document.body.style.cursor = '';
  refreshPreview();
});

/* ---- Édition cellule ---- */
function selectCell(ci, li) {
  state.selectedCell = { col: ci, line: li };
  const line = state.columns[ci].lines[li];
  cellEditor.style.display = 'block';
  cellEditorTitle.textContent = `— Col ${ci+1}, Ligne ${li+1}`;

  // Colonnes B → J uniquement (la colonne A est réservée aux quantités)
  const opts = [];
  for (let i = 1; i <= 9; i++) {
    opts.push(`<option value="${i}" ${i===line.colIdx?'selected':''}>${colLetter(i)}</option>`);
  }
  document.getElementById('ceCol').innerHTML = `<option value="">-- Aucune --</option>` + opts.join('');
  document.getElementById('ceFont').value = line.font;
  document.getElementById('ceSize').value = line.size;
  document.getElementById('ceBold').checked = line.bold;
  document.getElementById('ceItalic').checked = line.italic;
  document.getElementById('ceAlignH').value = line.alignH;
  document.getElementById('ceAlignV').value = line.alignV;

  renderGrid();
}

function applyCellEdit() {
  if (!state.selectedCell) return;
  const { col, line } = state.selectedCell;
  const cfg = state.columns[col].lines[line];
  cfg.colIdx = document.getElementById('ceCol').value !== '' ? Number(document.getElementById('ceCol').value) : null;
  cfg.font = document.getElementById('ceFont').value;
  cfg.size = Number(document.getElementById('ceSize').value) || 8;
  cfg.bold = document.getElementById('ceBold').checked;
  cfg.italic = document.getElementById('ceItalic').checked;
  cfg.alignH = document.getElementById('ceAlignH').value;
  cfg.alignV = document.getElementById('ceAlignV').value;
  renderGrid();
  refreshPreview();
}

function deleteCell() {
  if (!state.selectedCell) return;
  const { col, line } = state.selectedCell;
  state.columns[col].lines.splice(line, 1);
  if (state.columns[col].lines.length === 0) state.columns[col].lines.push({ colIdx: null, font: 'Arial', size: 8, bold: false, italic: false, alignH: 'center', alignV: 'center' });
  state.selectedCell = null;
  cellEditor.style.display = 'none';
  renderGrid();
  refreshPreview();
}

/* ================================================================
   APERÇU UNITAIRE
   ================================================================ */
function refreshPreview() {
  if (!state.rawRows.length) {
    singlePreviewD.innerHTML = '<p class="muted">Importe un fichier de calcul pour voir un aperçu.</p>';
    return;
  }
  singlePreviewD.innerHTML = '';
  if (state.rawRows[0]) singlePreviewD.appendChild(buildFullLabel(state.rawRows[0]));
}

function buildFullLabel(row) {
  const label = document.createElement("div");
  label.className = "label";

  const body = document.createElement("div");
  body.className = "label-body";

  state.columns.forEach((col, ci) => {
    const colEl = document.createElement("div");
    colEl.style.width = col.width + 'mm';
    colEl.style.height = '100%';
    colEl.style.display = 'flex';
    colEl.style.flexDirection = 'column';
    colEl.style.flexShrink = '0';

    col.lines.forEach(line => {
      const cell = document.createElement("div");
      cell.style.flex = '1';
      cell.style.display = 'flex';
      cell.style.alignItems = line.alignV;
      cell.style.justifyContent = line.alignH;
      cell.style.fontFamily = line.font;
      cell.style.fontSize = line.size + 'pt';
      cell.style.fontWeight = line.bold ? '700' : '400';
      cell.style.fontStyle = line.italic ? 'italic' : 'normal';
      cell.style.overflow = 'hidden';
      cell.style.padding = '0 1mm';
      cell.style.lineHeight = '1.1';

      // Colonne prix : texte vertical
      if (ci === 0) {
        cell.style.writingMode = 'vertical-rl';
        cell.style.transform = 'rotate(180deg)';
      }

      if (line.colIdx !== null && row) {
        cell.textContent = String(row[line.colIdx] ?? '').trim();
      }
      colEl.appendChild(cell);
    });

    body.appendChild(colEl);
  });

  const pt = document.createElement("div");
  pt.className = "label-pt";
  pt.innerHTML = '<svg viewBox="0 0 20 11" preserveAspectRatio="none" shape-rendering="crispEdges"><line x1="0" y1="0" x2="20" y2="5.5" stroke="#999" stroke-width="0.2"/><line x1="0" y1="11" x2="20" y2="5.5" stroke="#999" stroke-width="0.2"/></svg>';

  label.appendChild(body);
  label.appendChild(pt);
  return label;
}

/* ================================================================
   GÉNÉRATION COMPLÈTE
   ================================================================ */
function generateAll() {
  if (!state.rawRows.length) { buildInfo.textContent = "Importe d'abord un fichier Excel."; return; }

  state.records = [];
  state.rawRows.forEach(row => {
    let qty = state.defaultQty;
    if (state.qtyColIdx !== null) {
      const raw = String(row[state.qtyColIdx] ?? "").replace(",", ".").replace(/[^0-9.-]/g, "");
      const p = Number(raw);
      if (Number.isFinite(p) && p > 0) qty = Math.round(p);
    }
    state.records.push({ rowData: row, qty });
  });

  const merged = new Map();
  state.records.forEach(r => {
    const key = String(r.rowData.join("|||"));
    const ex = merged.get(key);
    if (ex) { ex.qty += r.qty; } else { merged.set(key, { rowData: r.rowData, qty: r.qty }); }
  });
  state.records = [...merged.values()];

  state.labels = [];
  state.records.forEach(rec => {
    for (let i = 0; i < rec.qty; i++) state.labels.push(rec.rowData);
  });

  const total = state.labels.length;
  buildInfo.textContent = `${total} étiquettes sur ${Math.ceil(total / LABELS_PER_SHEET)} planche(s).`;
  renderSheets();
}

/* ================================================================
   AGENCEMENTS (sauvegarde / chargement)
   ================================================================ */
const ARR_KEY = 'etiquettes_agencements_v1';
const LAST_KEY = 'etiquettes_dernier_agencement_v1';

function getArrangements() {
  try { return JSON.parse(localStorage.getItem(ARR_KEY)) || {}; } catch { return {}; }
}
function saveArrangements(map) { localStorage.setItem(ARR_KEY, JSON.stringify(map)); }

function refreshArrList() {
  const map = getArrangements();
  arrList.innerHTML = Object.keys(map).map(n => `<option value="${escHtml(n)}">${escHtml(n)}</option>`).join('');
}

function saveArrangement() {
  const name = arrNameInput.value.trim();
  if (!name) { mapperInfo.textContent = "Donne un nom à l'agencement avant de sauvegarder."; return; }
  const map = getArrangements();
  map[name] = JSON.parse(JSON.stringify(state.columns));
  saveArrangements(map);
  localStorage.setItem(LAST_KEY, name);
  refreshArrList();
  arrList.value = name;
  mapperInfo.textContent = `Agencement « ${name} » sauvegardé.`;
}

function loadArrangement(name) {
  const map = getArrangements();
  const data = map[name];
  if (!data) return;
  state.columns = JSON.parse(JSON.stringify(data));
  localStorage.setItem(LAST_KEY, name);
  renderGrid();
  refreshPreview();
  mapperInfo.textContent = `Agencement « ${name} » chargé.`;
}

function deleteArrangement() {
  const name = arrList.value;
  if (!name) return;
  const map = getArrangements();
  delete map[name];
  saveArrangements(map);
  if (localStorage.getItem(LAST_KEY) === name) localStorage.removeItem(LAST_KEY);
  refreshArrList();
  mapperInfo.textContent = `Agencement « ${name} » supprimé.`;
}

/* ================================================================
   RENDU PLANCHES
   ================================================================ */
function renderSheets() {
  sheetContainer.innerHTML = "";
  const pages = chunk(state.labels, LABELS_PER_SHEET);
  pages.forEach(pageRows => {
    const page = document.createElement("article");
    page.className = "sheet-page";
    const leftCol = document.createElement("div");
    leftCol.className = "sheet-column left";
    const rightCol = document.createElement("div");
    rightCol.className = "sheet-column right";

    for (let row = 0; row < ROWS_PER_COL; row++) {
      const l = pageRows[row] ? buildFullLabel(pageRows[row]) : buildEmptyLabel();
      const r = pageRows[ROWS_PER_COL + row] ? buildFullLabel(pageRows[ROWS_PER_COL + row]) : buildEmptyLabel();
      leftCol.appendChild(l);
      rightCol.appendChild(r);
    }
    page.appendChild(leftCol);
    page.appendChild(rightCol);
    sheetContainer.appendChild(page);
  });
}

function buildEmptyLabel() {
  const label = document.createElement("div");
  label.className = "label";
  const body = document.createElement("div");
  body.className = "label-body";
  body.innerHTML = '<div style="flex:1">&nbsp;</div>';
  label.appendChild(body);
  label.innerHTML += '<div class="label-pt"><svg viewBox="0 0 20 11" preserveAspectRatio="none" shape-rendering="crispEdges"><line x1="0" y1="0" x2="20" y2="5.5" stroke="#999" stroke-width="0.2"/><line x1="0" y1="11" x2="20" y2="5.5" stroke="#999" stroke-width="0.2"/></svg></div>';
  return label;
}

/* ================================================================
   UTILITAIRES
   ================================================================ */
function colLetter(i) { return String.fromCharCode(65 + i); }
function escHtml(s) { return String(s).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;"); }
function chunk(items, size) { const out = []; for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size)); return out; }

/* ---- Initialisation : afficher le modèle et l'aperçu dès le chargement ---- */
renderGrid();
refreshPreview();
