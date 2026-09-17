/**
 * Struttura dedicata a Riepilogo pulizie, con nomi identici
 * all'originale riepilogopulizie.html: sezioni "Archi" (Via Nazionale)
 * e "Milazzo" (MiPA), camere etichettate solo "Camera N" (non
 * "Appartamento MiPA N" come altrove nell'app) — per riprodurre
 * esattamente la stessa grafica.
 */

export interface RiepilogoSection {
  key: string;
  title: string;
  color: string;
  rooms: string[];
}

export const RIEPILOGO_SECTIONS: RiepilogoSection[] = [
  { key: "archi", title: "Archi", color: "#e53e3e", rooms: ["101", "102", "103", "104", "105", "201", "202", "203"] },
  { key: "milazzo", title: "Milazzo", color: "#2b6b74", rooms: ["1", "2", "3", "4"] },
];
