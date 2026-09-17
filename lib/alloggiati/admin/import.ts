import type { AdminGuest } from "./records";

function parseCSVLine(line: string, separator: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === separator && !inQuotes) {
      result.push(current.trim().replace(/^"|"$/g, ""));
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim().replace(/^"|"$/g, ""));
  return result;
}

const CSV_HEADER_MAP: Record<string, keyof AdminGuest | "struttura_id"> = {
  cognome: "cognome",
  nome: "nome",
  "data arrivo": "data_arrivo",
  data_arrivo: "data_arrivo",
  permanenza: "permanenza",
  sesso: "sesso",
  "data nascita": "data_nascita",
  data_nascita: "data_nascita",
  "comune nascita": "comune_nascita",
  "provincia nascita": "provincia_nascita",
  "stato nascita": "stato_nascita",
  cittadinanza: "cittadinanza",
  "tipo documento": "tipo_documento",
  "numero documento": "numero_documento",
  "luogo rilascio": "luogo_rilascio",
  "tipo alloggiato": "tipo_alloggiato",
  struttura: "struttura_id",
};

function mapCsvHeader(header: string): string | null {
  return CSV_HEADER_MAP[header.toLowerCase().trim()] ?? null;
}

/**
 * Porting dell'handler di import file (alloggiati-companion): rileva se
 * il file è un formato fisso a 168 caratteri (Alloggiati Web) oppure un
 * CSV/TSV con intestazioni, e lo trasforma in AdminGuest[]. Stessa
 * euristica di rilevamento formato dell'originale.
 */
export function parseImportFile(content: string): AdminGuest[] {
  const lines = content.split(/\r?\n/).filter((line) => line.trim() !== "");
  if (lines.length === 0) return [];

  const newGuests: AdminGuest[] = [];
  const firstLine = lines[0].trim();
  const isCSV = firstLine.includes(";") || firstLine.includes(",") || firstLine.includes("\t");

  if (!isCSV && firstLine.length >= 168) {
    // Formato fisso 168 caratteri (Standard Alloggiati Web)
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.length >= 168) {
        newGuests.push({
          uiId: `txt-raw-${Date.now()}-${i}`,
          isRawRecord: true,
          rawRecord: line.substring(0, 168).padEnd(168, " "),
          cognome: line.substring(14, 64).trim(),
          nome: line.substring(64, 94).trim(),
          data_arrivo: line.substring(2, 12).trim(),
          selected: true,
          source: "file",
          struttura_id: "",
          data_nascita: "",
          sesso: "",
          comune_nascita: "",
          provincia_nascita: "",
          stato_nascita: "",
          cittadinanza: "",
          tipo_documento: "",
          numero_documento: "",
          luogo_rilascio: "",
          permanenza: "",
          tipo_alloggiato: "",
        });
      }
    }
  } else {
    // Parsing CSV/TSV
    const separator = firstLine.includes(";") ? ";" : firstLine.includes("\t") ? "\t" : ",";
    const headers = parseCSVLine(firstLine, separator).map((h) => h.toLowerCase());

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i], separator);
      if (values.length < 2) continue;

      const guest: Partial<AdminGuest> & { uiId: string; selected: boolean; source: "file" } = {
        uiId: `txt-csv-${Date.now()}-${i}`,
        selected: true,
        source: "file",
      };
      headers.forEach((header, index) => {
        const key = mapCsvHeader(header);
        if (key && values[index]) {
          (guest as unknown as Record<string, string>)[key] = values[index];
        }
      });

      if (guest.cognome || guest.nome) {
        newGuests.push({
          struttura_id: "",
          cognome: "",
          nome: "",
          data_nascita: "",
          sesso: "",
          comune_nascita: "",
          provincia_nascita: "",
          stato_nascita: "",
          cittadinanza: "",
          tipo_documento: "",
          numero_documento: "",
          luogo_rilascio: "",
          data_arrivo: "",
          permanenza: "",
          tipo_alloggiato: "",
          ...guest,
        });
      }
    }
  }

  return newGuests;
}
