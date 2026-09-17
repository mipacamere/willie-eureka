/** Porting di prodottipulizia.html: stesso catalogo, stessi nomi/descrizioni. */

export interface CleaningProduct {
  id: number;
  name: string;
  description: string;
}

export const CLEANING_PRODUCTS: CleaningProduct[] = [
  { id: 1, name: "Candeggina Spray", description: "Candeggina spray per disinfezione rapida di superfici" },
  { id: 2, name: "Detergente Vetri", description: "Detergente specifico per vetri e specchi" },
  { id: 3, name: "Anticalcare", description: "Anticalcare per bagni e rubinetteria" },
  { id: 4, name: "Sgrassatore Superfici", description: "Sgrassatore per cucine e superfici unte" },
  { id: 5, name: "Candeggina Liquida", description: "Candeggina liquida per disinfezione e sbiancamento" },
  { id: 6, name: "Deodorante Ambienti", description: "Deodorante spray per ambienti e tessuti" },
  { id: 7, name: "Spray Sgrassatore Acciaio", description: "Sgrassatore specifico per superfici in acciaio" },
  { id: 8, name: "Sapone Liquido Mani", description: "Sapone liquido delicato per l'igiene delle mani" },
  { id: 9, name: "Bagno Schiuma Liquido", description: "Bagno schiuma liquido per gli ospiti" },
  { id: 10, name: "Detergente Piatti", description: "Detergente concentrato per stoviglie" },
];
