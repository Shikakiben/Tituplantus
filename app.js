/* ================================================================
   Impression d'étiquettes — Grille interactive
   ================================================================ */

const SCALE = 3;

function tipSVG() {
  if (!MODEL.lw) return '';
  return `<svg viewBox="0 0 ${MODEL.tw} ${MODEL.lh}" preserveAspectRatio="none" shape-rendering="crispEdges"><line x1="0" y1="0" x2="${MODEL.tw}" y2="${MODEL.lh/2}" stroke="#999" stroke-width="0.2"/><line x1="0" y1="${MODEL.lh}" x2="${MODEL.tw}" y2="${MODEL.lh/2}" stroke="#999" stroke-width="0.2"/></svg>`;
}

function applyModelCSS() {
  if (!MODEL.lw) return;
  const r = document.documentElement.style;
  r.setProperty('--lw', MODEL.lw + 'mm');
  r.setProperty('--lh', MODEL.lh + 'mm');
  r.setProperty('--bw', MODEL.bw + 'mm');
  r.setProperty('--tw', MODEL.tw + 'mm');
  r.setProperty('--tx', MODEL.tx + 'mm');
  r.setProperty('--gbw', MODEL.gbw + 'mm');
  r.setProperty('--pw', MODEL.pw + 'mm');
  r.setProperty('--ph', MODEL.ph + 'mm');
  const old = document.getElementById('dyn-page');
  if (old) old.remove();
  const s = document.createElement('style');
  s.id = 'dyn-page';
  s.textContent = `@page { size: ${MODEL.pw}mm ${MODEL.ph}mm; margin: 0; }`;
  document.head.appendChild(s);
}

function switchModel(id) {
  const found = MODELS.find(m => m.id === id);
  if (!found || found === MODEL) return;
  MODEL = found;
  localStorage.setItem(SAVED_MODEL_KEY, MODEL.id);

  // Tout remettre à zéro
  state.rawRows = [];
  state.rawHeaders = [];
  state.records = [];
  state.labels = [];
  excelFile.value = '';
  importInfo.textContent = 'Aucun fichier importe.';
  clearBuildInfo();
  sheetContainer.innerHTML = '<p class="sheet-hint">Clique sur « Générer » pour afficher l\'aperçu.</p>';
  cellEditor.style.display = 'none';
  state.selectedCell = null;

  // Mettre à jour le bouton du sélecteur
  modelSelectBtn.textContent = MODEL.name;
  modelSelectPanel.querySelectorAll('.custom-select-opt').forEach(o => {
    o.classList.toggle('selected', o.dataset.id === id);
  });

  applyModelCSS();
  state.columns = JSON.parse(JSON.stringify(MODEL.columns));
  toggleArrBar();
  renderGrid();
  refreshPreview();
}

function toggleArrBar() {
  const disabled = !MODEL.lw;
  const fbl = excelFile.previousElementSibling; // label "Choisir un fichier"
  fbl.style.opacity = disabled ? '0.5' : '';
  fbl.style.pointerEvents = disabled ? 'none' : '';
  excelFile.disabled = disabled;
  arrListBtn.disabled = disabled;
  arrListBtn.style.opacity = disabled ? '0.5' : '';
  arrListBtn.style.pointerEvents = disabled ? 'none' : '';
  saveArrBtn.disabled = disabled;
  saveArrBtn.style.opacity = disabled ? '0.5' : '';
  saveArrBtn.style.pointerEvents = disabled ? 'none' : '';
  delArrBtn.disabled = disabled;
  delArrBtn.style.opacity = disabled ? '0.5' : '';
  delArrBtn.style.pointerEvents = disabled ? 'none' : '';
  exportArrBtn.disabled = disabled;
  exportArrBtn.style.opacity = disabled ? '0.5' : '';
  exportArrBtn.style.pointerEvents = disabled ? 'none' : '';
  importArrBtn.disabled = disabled;
  importArrBtn.style.opacity = disabled ? '0.5' : '';
  importArrBtn.style.pointerEvents = disabled ? 'none' : '';
  buildBtn.disabled = disabled;
  buildBtn.style.opacity = disabled ? '0.5' : '';
  printBtn.disabled = disabled;
  printBtn.style.opacity = disabled ? '0.5' : '';
}

const state = {
  rawRows: [],
  rawHeaders: [],
  qtyColIdx: 0,
  defaultQty: 1,
  columns: JSON.parse(JSON.stringify(MODEL.columns)),
  selectedCell: null, // { col: 0, line: 0 }
  records: [],
  labels: [],
};

/* ---- DOM refs ---- */
const modelSelectBtn  = document.getElementById("modelSelectBtn");
const modelSelectPanel= document.getElementById("modelSelectPanel");
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
const arrListBtn     = document.getElementById("arrListBtn");
const arrListPanel   = document.getElementById("arrListPanel");
const saveArrBtn     = document.getElementById("saveArrBtn");
const delArrBtn      = document.getElementById("delArrBtn");
const exportArrBtn   = document.getElementById("exportArrBtn");
const importArrBtn   = document.getElementById("importArrBtn");
const importArrFile  = document.getElementById("importArrFile");
const arrPopup       = document.getElementById("arrPopup");
const arrPopupInput  = document.getElementById("arrPopupInput");

/* ---- Message contextuel section 4 ---- */
function updateBuildInfo() {
  buildInfo.style.display = '';
  if (!MODEL.lw) {
    buildInfo.textContent = "Rien à générer pour l'instant. Choisis d'abord un modèle (étape 1) ci-dessus.";
  } else if (!state.rawRows.length) {
    buildInfo.textContent = "Rien à générer pour l'instant. Importe ton fichier (étape 2) puis configure ta grille (étape 3) ci-dessus.";
  } else {
    buildInfo.textContent = "Tout est prêt : vérifie la grille (étape 3) si besoin, puis clique sur « Générer ».";
  }
}

function clearBuildInfo() {
  buildInfo.textContent = '';
  buildInfo.style.display = 'none';
}

/* ---- Événements ---- */
modelSelectBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  const panel = modelSelectPanel;
  const open = panel.style.display === 'none';
  if (open) {
    document.body.appendChild(panel);
    const rect = modelSelectBtn.getBoundingClientRect();
    panel.style.position = 'fixed';
    panel.style.top = (rect.bottom + 4) + 'px';
    panel.style.left = rect.left + 'px';
    panel.style.width = rect.width + 'px';
    panel.style.display = 'block';
    arrListPanel.style.display = 'none'; arrListBtn.parentElement.appendChild(arrListPanel); arrListPanel.style.position = '';
  } else {
    panel.style.display = 'none';
    modelSelectBtn.parentElement.appendChild(panel);
    panel.style.position = ''; panel.style.top = ''; panel.style.left = ''; panel.style.width = '';
  }
});
modelSelectPanel.addEventListener("click", e => {
  const opt = e.target.closest('.custom-select-opt');
  if (!opt) return;
  closeModelPanel();
  switchModel(opt.dataset.id);
});
function closeModelPanel() {
  modelSelectPanel.style.display = 'none';
  modelSelectBtn.parentElement.appendChild(modelSelectPanel);
  modelSelectPanel.style.position = ''; modelSelectPanel.style.top = ''; modelSelectPanel.style.left = ''; modelSelectPanel.style.width = '';
}
function closeArrPanel() {
  arrListPanel.style.display = 'none';
  arrListBtn.parentElement.appendChild(arrListPanel);
  arrListPanel.style.position = ''; arrListPanel.style.top = ''; arrListPanel.style.left = ''; arrListPanel.style.width = '';
}
// Fermer les panneaux si clic ailleurs
document.addEventListener("click", e => {
  if (!e.target.closest('.custom-select')) {
    closeModelPanel();
    closeArrPanel();
  }
});
excelFile.addEventListener("change", handleImport);
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
saveArrBtn.addEventListener("click", () => {
  const current = arrListBtn.textContent;
  if (current !== 'Configuration' && getArrangements()[current]) {
    // Already loaded an arrangement → overwrite it directly
    const map = getArrangements();
    map[current] = JSON.parse(JSON.stringify(state.columns));
    saveArrangements(map);
    mapperInfo.textContent = `Configuration « ${current} » mise à jour.`;
  } else {
    // No arrangement loaded → open popup for a new name
    showNewArrPopup();
  }
});
delArrBtn.addEventListener("click", deleteArrangement);

// Export / Import
exportArrBtn.addEventListener("click", () => {
  const map = getArrangements();
  const json = JSON.stringify(map, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'agencements-tituplantus.json';
  a.click();
  URL.revokeObjectURL(url);
  mapperInfo.textContent = 'Configurations exportées.';
});
importArrBtn.addEventListener("click", () => importArrFile.click());
importArrFile.addEventListener("change", () => {
  const file = importArrFile.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);
      if (typeof imported !== 'object' || Array.isArray(imported)) throw new Error('Format invalide');
      const map = getArrangements();
      Object.assign(map, imported);
      saveArrangements(map);
      refreshArrList();
      mapperInfo.textContent = `${Object.keys(imported).length} configuration(s) importée(s).`;
    } catch (e) {
      mapperInfo.textContent = 'Fichier invalide.';
    }
  };
  reader.readAsText(file);
  importArrFile.value = '';
});

// ArrList : ouverture/fermeture du panneau
arrListBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  const panel = arrListPanel;
  const open = panel.style.display === 'none';
  if (open) {
    // Déplacer dans body pour éviter les problèmes de z-index
    document.body.appendChild(panel);
    const rect = arrListBtn.getBoundingClientRect();
    panel.style.position = 'fixed';
    panel.style.top = (rect.bottom + 4) + 'px';
    panel.style.left = rect.left + 'px';
    panel.style.width = rect.width + 'px';
    panel.style.display = 'block';
    modelSelectPanel.style.display = 'none'; modelSelectBtn.parentElement.style.zIndex = '';
  } else {
    panel.style.display = 'none';
    arrListBtn.parentElement.appendChild(panel);
    panel.style.position = '';
    panel.style.top = ''; panel.style.left = ''; panel.style.width = '';
  }
});
arrListPanel.addEventListener("click", e => {
  const opt = e.target.closest('.custom-select-opt');
  if (!opt) return;
  closeArrPanel();
  if (opt.dataset.id === '__new__') {
    showNewArrPopup();
  } else {
    loadArrangement(opt.dataset.id);
  }
});

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

          // Ignorer les lignes dont toutes les colonnes texte (B+) sont vides
          const hasText = r.slice(1).some(cell => String(cell ?? "").trim() !== "");
          if (!hasText) {
            warnings.push(`« ${sheetName} » ligne ${fileLine} : aucune donnée texte (ligne ignorée)`);
            return;
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
  if (last && arrMap[last]) {
    arrListBtn.textContent = last;
    setTimeout(() => {
      const opt = arrListPanel.querySelector(`[data-id="${last}"]`);
      if (opt) opt.classList.add('selected');
    }, 0);
  }

  cellEditor.style.display = 'none';
  state.selectedCell = null;
  templateEditor.style.display = "block";
  clearBuildInfo();
  renderGrid();
  refreshPreview();
}

function renderGrid() {
  labelGrid.innerHTML = '';
  if (!MODEL.lw) {
    labelGrid.style.display = 'none';
    labelGrid.insertAdjacentHTML('afterend', '<p class="muted" style="text-align:center;padding:20px" id="noModelMsg">Aucun modèle sélectionné</p>');
    return;
  }
  labelGrid.style.display = '';
  const oldMsg = document.getElementById('noModelMsg');
  if (oldMsg) oldMsg.remove();

  // Pointe V
  const v = document.createElement('div');
  v.className = 'label-grid-v';
  v.innerHTML = tipSVG();
  labelGrid.appendChild(v);

  // Corps avec colonnes
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
  if (!MODEL.lw) {
    singlePreviewD.innerHTML = '<p class="muted">Aucun modèle sélectionné</p>';
    return;
  }
  if (!state.rawRows.length) {
    singlePreviewD.innerHTML = '';
    singlePreviewD.appendChild(buildEmptyLabel());
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
  pt.innerHTML = tipSVG();

  label.appendChild(body);
  label.appendChild(pt);
  return label;
}

/* ================================================================
   GÉNÉRATION COMPLÈTE
   ================================================================ */
function generateAll() {
  if (!state.rawRows.length) { updateBuildInfo(); return; }

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

  const labelsPerSheet = MODEL.cols * MODEL.rowsPerCol;
  const total = state.labels.length;
  buildInfo.style.display = '';
  buildInfo.textContent = `${total} étiquettes sur ${Math.ceil(total / labelsPerSheet)} planche(s).`;
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
  const names = Object.keys(map);
  arrListPanel.innerHTML = names.map(n =>
    `<button class="custom-select-opt" data-id="${escHtml(n)}">${escHtml(n)}</button>`).join('')
    + `<button class="custom-select-opt" data-id="__new__" style="color:var(--accent);font-weight:600">+ Nouvelle</button>`;
  if (!names.length) arrListBtn.textContent = 'Configuration';
}

function showNewArrPopup() {
  arrPopup.style.display = 'flex';
  arrPopupInput.value = '';
  setTimeout(() => arrPopupInput.focus(), 100);
}
arrPopupInput.addEventListener("keydown", e => { if (e.key === 'Enter') doSaveNewArr(); });
document.getElementById("arrPopupSave").addEventListener("click", doSaveNewArr);
document.getElementById("arrPopupCancel").addEventListener("click", () => { arrPopup.style.display = 'none'; });
arrPopup.addEventListener("click", e => { if (e.target === arrPopup) arrPopup.style.display = 'none'; });

function doSaveNewArr() {
  const name = arrPopupInput.value.trim();
  if (!name) return;
  arrPopup.style.display = 'none';
  const map = getArrangements();
  map[name] = JSON.parse(JSON.stringify(state.columns));
  saveArrangements(map);
  localStorage.setItem(LAST_KEY, name);
  refreshArrList();
  arrListBtn.textContent = name;
  mapperInfo.textContent = `Configuration « ${name} » sauvegardée.`;
}

function loadArrangement(name) {
  const map = getArrangements();
  const data = map[name];
  if (!data) return;
  state.columns = JSON.parse(JSON.stringify(data));
  localStorage.setItem(LAST_KEY, name);
  renderGrid();
  refreshPreview();
  arrListBtn.textContent = name;
  mapperInfo.textContent = `Configuration « ${name} » chargée.`;
}

function deleteArrangement() {
  const name = arrListBtn.textContent;
  if (name === 'Configuration' || !getArrangements()[name]) return;
  const map = getArrangements();
  delete map[name];
  saveArrangements(map);
  if (localStorage.getItem(LAST_KEY) === name) localStorage.removeItem(LAST_KEY);
  arrListBtn.textContent = 'Configuration';
  refreshArrList();
  mapperInfo.textContent = `Configuration « ${name} » supprimée.`;
}

/* ================================================================
   RENDU PLANCHES
   ================================================================ */
function renderSheets() {
  sheetContainer.innerHTML = "";
  const labelsPerSheet = MODEL.cols * MODEL.rowsPerCol;
  if (!labelsPerSheet) return;
  const pages = chunk(state.labels, labelsPerSheet);
  pages.forEach(pageRows => {
    const page = document.createElement("article");
    page.className = "sheet-page";

    for (let c = 0; c < MODEL.cols; c++) {
      const m = MODEL.margins[c];
      const col = document.createElement("div");
      col.className = "sheet-column";
      col.style.top = m.top + 'mm';
      if (c === 0) col.classList.add('left');
      else if (c === MODEL.cols - 1) col.classList.add('right');

      for (let row = 0; row < MODEL.rowsPerCol; row++) {
        const idx = c * MODEL.rowsPerCol + row;
        const el = pageRows[idx] ? buildFullLabel(pageRows[idx]) : buildEmptyLabel();
        if (m.rotate) el.style.transform = `rotate(${m.rotate}deg)`;
        col.appendChild(el);
      }
      page.appendChild(col);
    }
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
  label.innerHTML += `<div class="label-pt">${tipSVG()}</div>`;
  return label;
}

/* ================================================================
   UTILITAIRES
   ================================================================ */
function colLetter(i) { return String.fromCharCode(65 + i); }
function escHtml(s) { return String(s).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;"); }
function chunk(items, size) { const out = []; for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size)); return out; }

/* ---- Initialisation ---- */
(function initModelSelect() {
  MODELS.forEach(m => {
    const btn = document.createElement('button');
    btn.className = 'custom-select-opt';
    btn.dataset.id = m.id;
    btn.textContent = m.name;
    modelSelectPanel.appendChild(btn);
  });
  if (MODEL.lw) {
    modelSelectBtn.textContent = MODEL.name;
    modelSelectPanel.querySelector(`[data-id="${MODEL.id}"]`)?.classList.add('selected');
    applyModelCSS();
  }
})();
refreshArrList();
toggleArrBar();
clearBuildInfo();
renderGrid();
refreshPreview();
