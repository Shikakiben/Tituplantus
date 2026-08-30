/* ================================================================
   Catalogue des modèles d'étiquettes
   Ajouter un modèle = ajouter une entrée dans MODELS[]
   ================================================================ */

/* ---- Liste de tous les modèles disponibles ---- */
const MODELS = [
  {
    id: "_aucun",  name: "-- Aucun --",
    lw:0, lh:0,   bw:0,   tw:0, tx:0,   gbw:0,
    pw:0, ph:0,
    cols:0,  rowsPerCol:0,
    columns: [],
    margins: []
  },
  {
    id: "11x115",  name: "Étiquette à piquer 11×115 mm",
    lw:115, lh:11,   bw:105,   tw:20, tx:95,   gbw:95,
    pw:210, ph:297,
    cols:2,  rowsPerCol:22,
    columns: [
      // vertical:true → texte vertical (colonne « prix »). Omettez ce champ pour une colonne normale.
      { width:15, vertical:true, lines:[{ colIdx:null, font:'Arial', size:8, bold:true,  italic:false, alignH:'center', alignV:'center' }] },
      { width:40, lines:[
        { colIdx:null, font:'Arial', size:8, bold:false, italic:false, alignH:'left', alignV:'center' },
        { colIdx:null, font:'Arial', size:7, bold:false, italic:true,  alignH:'left', alignV:'center' }
      ]},
      { width:40, lines:[
        { colIdx:null, font:'Arial', size:8, bold:false, italic:false, alignH:'left', alignV:'center' },
        { colIdx:null, font:'Arial', size:7, bold:false, italic:false, alignH:'left', alignV:'center' },
        { colIdx:null, font:'Arial', size:7, bold:false, italic:false, alignH:'left', alignV:'center' }
      ]}
    ],
    margins:[ { top:30.25, rotate:0 }, { top:24.75, rotate:180 } ]
  },
  {
    id: "104x74-piquer",
    name: "Étiquette 105×74 à piquer (8/A4)",
    // Vrai A4 divisé en 8 : 210/2 × 297/4 = 105 × 74,25 mm (2 colonnes × 4 rangées).
    // Fentes (trous) pré-percées en haut et en bas pour passer sur un piquet :
    //   holeTop / holeBottom = distance du BORD au CENTRE de la fente (mm)
    //   slotW / slotH = dimensions de la fente (mm) — fins, centrés horizontalement
    lw:105, lh:74.25,   bw:105,   tw:0, tx:0,   gbw:105,
    pw:210, ph:297,
    cols:2,  rowsPerCol:4,
    holeTop:6, holeBottom:6, slotW:10, slotH:3.5,
    // Structure « lignes » : chaque ligne a sa hauteur (mm) et ses cellules.
    // Chaque cellule a sa largeur (mm) — la somme des largeurs = 105 mm.
    // Une cellule peut être fusionnée (largeur = toute la ligne) ou divisée.
    // Somme des hauteurs = zone sûre entre les fentes : 74,25 − 8,75 − 8,75 = 56,75 mm
    rows: Array.from({length: 4}, () => ({
      height: 14.1875,
      cells: [
        { width: 52.5, colIdx:null, font:'Arial', size:9, bold:false, italic:false, alignH:'center', alignV:'center' },
        { width: 52.5, colIdx:null, font:'Arial', size:9, bold:false, italic:false, alignH:'center', alignV:'center' }
      ]
    })),
    margins:[ { top:0, rotate:0 }, { top:0, rotate:0 } ]
  }

  // Ajouter d'autres modèles ici, ex.:
  // { id:"autre", name:"Autre format 80×40 mm", lw:80, lh:40, ... }
];

/* ---- Modèle actif ---- */
const SAVED_MODEL_KEY = "etiquettes_modele_v1";
let MODEL = MODELS[0]; // _aucun par défaut

(function initModel() {
  const saved = localStorage.getItem(SAVED_MODEL_KEY);
  if (saved) {
    const found = MODELS.find(m => m.id === saved);
    if (found) MODEL = found;
  }
})();
