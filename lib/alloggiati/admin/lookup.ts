/**
 * Porting di parseCSV / loadLookupTables / findInTable / findComune
 * (alloggiati-companion). Le tabelle (public/data/alloggiati/*.csv) sono
 * copia 1:1 dei file originali — 11.295 comuni, 236 stati, 95 documenti,
 * 5 tipi alloggiato — nessun dato è stato ridotto o riassunto.
 */

export interface LookupRow {
  Codice: string;
  Descrizione: string;
  Provincia?: string;
  DataFineVal?: string;
}

export interface LookupTables {
  comuni: LookupRow[];
  stati: LookupRow[];
  documenti: LookupRow[];
  tipoAlloggiato: LookupRow[];
}

export function parseCSV(text: string): LookupRow[] {
  const lines = text.trim().split("\n");
  const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));

  return lines.slice(1).map((line) => {
    const values: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === "," && !inQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
    values.push(current.trim());

    const obj: Record<string, string> = {};
    headers.forEach((header, index) => {
      obj[header] = values[index] || "";
    });
    return obj as unknown as LookupRow;
  });
}

/** Porting di loadLookupTables(): fetch client-side dei 4 CSV statici. */
export async function loadLookupTables(): Promise<LookupTables> {
  const files = ["comuni.csv", "stati.csv", "documenti.csv", "tipo_alloggiato.csv"] as const;
  const results = await Promise.all(
    files.map(async (file) => {
      try {
        const res = await fetch(`/data/alloggiati/${file}`);
        if (!res.ok) throw new Error(`${file} non trovato`);
        const text = await res.text();
        return parseCSV(text);
      } catch (err) {
        console.error(`Errore caricamento ${file}:`, err);
        return [];
      }
    })
  );
  return {
    comuni: results[0],
    stati: results[1],
    documenti: results[2],
    tipoAlloggiato: results[3],
  };
}

function parseDate(str: string | undefined | null): Date | null {
  if (!str) return null;
  const match = String(str).match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (!match) return null;
  return new Date(parseInt(match[3], 10), parseInt(match[2], 10) - 1, parseInt(match[1], 10));
}

/** Porting di findInTable(): cerca per Descrizione, con eventuale filtro di validità temporale. */
export function findInTable(
  table: LookupRow[],
  searchField: keyof LookupRow,
  value: string | undefined | null,
  dateRef: string | null = null
): LookupRow | null {
  if (!value) return null;
  const norm = String(value).trim().toUpperCase();
  const candidates = table.filter((item) => {
    const itemVal = String(item[searchField] || "").trim().toUpperCase();
    return itemVal === norm;
  });

  if (candidates.length === 0) return null;

  if (dateRef && candidates.length > 1) {
    const refDate = parseDate(dateRef);
    if (refDate) {
      for (const c of candidates) {
        const endVal = c.DataFineVal || "";
        if (!endVal) return c; // Attivo
        const dataFine = parseDate(String(endVal).split(" ")[0]);
        if (dataFine && refDate <= dataFine) return c;
      }
    }
  }

  return candidates.find((c) => !c.DataFineVal) || candidates[0];
}

/** Porting di findComune(): prova prima con provincia, poi generico. */
export function findComune(
  comuni: LookupRow[],
  nome: string | undefined | null,
  provincia: string | undefined | null
): LookupRow | null {
  if (!nome) return null;
  const normNome = String(nome).trim().toUpperCase();
  const normProv = String(provincia || "").trim().toUpperCase();
  if (normProv) {
    const withProv = comuni.find(
      (c) =>
        String(c.Descrizione || "").trim().toUpperCase() === normNome &&
        String(c.Provincia || "").trim().toUpperCase() === normProv
    );
    if (withProv) return withProv;
  }
  return findInTable(comuni, "Descrizione", nome);
}

/** Porting di pad(): riempie/tronca a lunghezza fissa con spazi a destra. */
export function pad(str: string | number | undefined | null, len: number): string {
  return String(str ?? "")
    .padEnd(len, " ")
    .substring(0, len);
}

export function getDateFormatted(daysOffset = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export { parseDate };
