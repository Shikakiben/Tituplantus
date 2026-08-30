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
    name: "Étiquette 104×74 à piquer (8/A4)",
    // Rectangle 104×74 , 2 colonnes × 4 rangées = 8 étiquettes par A4.
    // Fentes (trous) pré-percées en haut et en bas pour passer sur un piquet :
    //   - holeTop / holeBottom = hauteur des zones HAUT/BAS à NE PAS imprimer (mm)
    //   - slotW / slotH = dimensions de la fente (mm)
    lw:104, lh:74,   bw:104,   tw:0, tx:0,   gbw:104,
    pw:210, ph:297,
    cols:2,  rowsPerCol:4,
    holeTop:12, holeBottom:12, slotW:26, slotH:4,
    columns: [
      // Une colonne de texte centrée (le corps occupe toute la largeur)
      { width:104, lines:[
        { colIdx:null, font:'Arial', size:14, bold:true,  italic:false, alignH:'center', alignV:'center' },
        { colIdx:null, font:'Arial', size:11, bold:false, italic:false, alignH:'center', alignV:'center' },
        { colIdx:null, font:'Arial', size:10, bold:false, italic:true,  alignH:'center', alignV:'center' }
      ]}
    ],
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
