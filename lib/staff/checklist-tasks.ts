/**
 * Porting di checklist.html: 27 voci di controllo in 4 categorie, stesso
 * testo esatto dell'originale.
 */

export interface ChecklistTask {
  id: string;
  label: string;
}

export interface ChecklistCategory {
  id: string;
  title: string;
  tasks: ChecklistTask[];
}

export const CHECKLIST_CATEGORIES: ChecklistCategory[] = [
  {
    id: "ingresso",
    title: "AREA INGRESSO",
    tasks: [
      { id: "porta", label: "Porta e telaio puliti" },
      { id: "maniglie", label: "Maniglie e serrature disinfettate" },
      { id: "luce-ingresso", label: "Luce ingresso funzionante" },
      { id: "armadio", label: "Armadio pulito e organizzato" },
    ],
  },
  {
    id: "camera-letto",
    title: "CAMERA DA LETTO",
    tasks: [
      { id: "letto", label: "Letto sfatto e rifatto con biancheria pulita" },
      { id: "cuscini", label: "Cuscini sprimacciati e posizionati correttamente" },
      { id: "comodini", label: "Comodini spolverati e disinfettati" },
      { id: "luci-camera", label: "Tutte le luci funzionanti (comodino, soffitto)" },
      { id: "cassettiera", label: "Cassettiera/mobili puliti e organizzati" },
      { id: "specchio-camera", label: "Specchio pulito e senza aloni" },
      { id: "pavimento-camera", label: "Moquette/pavimento aspirato/lavato" },
      { id: "tv", label: "Telecomando TV pulito e funzionante" },
      { id: "clima", label: "Aria condizionata/riscaldamento funzionante" },
      { id: "tende", label: "Tende/persiane pulite e funzionanti" },
      { id: "finestre", label: "Finestre pulite (interno)" },
    ],
  },
  {
    id: "bagno",
    title: "BAGNO",
    tasks: [
      { id: "wc", label: "WC pulito, disinfettato e controllato" },
      { id: "carta-igienica", label: "Carta igienica rifornita (minimo 2 rotoli)" },
      { id: "lavandino", label: "Lavandino e rubinetto puliti e disinfettati" },
      { id: "doccia", label: "Doccia/vasca pulita e disinfettata" },
      { id: "specchio-bagno", label: "Specchio bagno pulito e senza aloni" },
      { id: "pavimento-bagno", label: "Pavimento bagno lavato e asciugato" },
      { id: "asciugamani", label: "Asciugamani sostituiti con quelli puliti" },
      { id: "amenita", label: "Amenità ricaricate (sapone, shampoo, ecc.)" },
      { id: "cestino", label: "Cestino svuotato e rivestimento sostituito" },
    ],
  },
  {
    id: "controlli-finali",
    title: "CONTROLLI FINALI",
    tasks: [
      { id: "luci-spente", label: "Tutte le luci spente (eccetto luci di benvenuto)" },
      { id: "temperatura", label: "Temperatura impostata a livello confortevole" },
      { id: "tessera", label: "Tessera camera programmata e funzionante" },
    ],
  },
];

export const TOTAL_TASKS = CHECKLIST_CATEGORIES.reduce((sum, c) => sum + c.tasks.length, 0);
