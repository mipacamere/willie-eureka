import { getGoogleAccessToken, getServiceAccountCredentials } from "./auth";

/**
 * Colonne del foglio ospiti condiviso (A:Q), tracciato ufficiale Alloggiati
 * Web con id/struttura/data-scansione aggiunti in testa/coda. Stesso ordine
 * di sheet-reader.mjs (alloggiati-companion) e append-guest-sheet.mjs
 * (mipacompanion/vncompanion) — nell'originale i due lati vivevano in due
 * progetti diversi ma scrivevano/leggevano lo stesso schema "a mano".
 */
const COLUMNS = [
  "id",
  "struttura_id",
  "tipo_alloggiato",
  "data_arrivo",
  "permanenza",
  "cognome",
  "nome",
  "sesso",
  "data_nascita",
  "comune_nascita",
  "provincia_nascita",
  "stato_nascita",
  "cittadinanza",
  "tipo_documento",
  "numero_documento",
  "luogo_rilascio",
  "data_scansione",
] as const;

export interface GuestRow {
  id: string;
  struttura_id: string;
  tipo_alloggiato: string;
  data_arrivo: string;
  permanenza: string;
  cognome: string;
  nome: string;
  sesso: string;
  data_nascita: string;
  comune_nascita: string;
  provincia_nascita: string;
  stato_nascita: string;
  cittadinanza: string;
  tipo_documento: string;
  numero_documento: string;
  luogo_rilascio: string;
  data_scansione: string;
}

function rowToObject(row: string[]): GuestRow {
  const values = COLUMNS.map((_, i) => (row[i] ?? "").trim());
  return Object.fromEntries(COLUMNS.map((key, i) => [key, values[i]])) as unknown as GuestRow;
}

/** Porting di sheet-reader.mjs (readFilteredGuests). */
export async function readFilteredGuests(
  strutturaId: string,
  dataArrivo: string
): Promise<GuestRow[]> {
  const { spreadsheetId, sheetName, clientEmail, privateKey } =
    getServiceAccountCredentials();

  const accessToken = await getGoogleAccessToken(
    clientEmail,
    privateKey,
    "https://www.googleapis.com/auth/spreadsheets.readonly"
  ).catch((e) => {
    throw Object.assign(new Error(`Autenticazione Google fallita: ${e.message ?? e}`), {
      status: 502,
    });
  });

  const range = encodeURIComponent(`${sheetName}!A2:Q`);
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!res.ok) {
    const detail = await res.text();
    throw Object.assign(new Error(`Lettura da Google Sheets fallita: ${detail}`), {
      status: 502,
    });
  }
  const data = await res.json();
  const allRows: GuestRow[] = (data.values ?? []).map(rowToObject);
  return allRows.filter(
    (g) => g.struttura_id === strutturaId && g.data_arrivo === dataArrivo
  );
}

// --- Scrittura (ex append-guest-sheet.mjs) ---

interface GuestExportEntry {
  stay?: {
    guestType?: string;
    arrivalDate?: string;
    departureDate?: string;
  };
  personal?: {
    lastName?: string;
    firstName?: string;
    gender?: string;
    birthDate?: string;
    birthPlace?: string;
    birthProvince?: string;
    birthCountry?: string;
    nationality?: string;
  };
  document?: {
    type?: string;
    number?: string;
    issuePlace?: string;
  };
}

export interface GuestExportData {
  structure?: { code?: string };
  guests: GuestExportEntry[];
  exportDate?: string;
}

function parseItalianDate(s: string | undefined): Date | null {
  const m = (s ?? "").match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  return new Date(Date.UTC(Number(m[3]), Number(m[2]) - 1, Number(m[1])));
}

function nightsBetween(arrivalStr?: string, departureStr?: string): number | "" {
  const a = parseItalianDate(arrivalStr);
  const d = parseItalianDate(departureStr);
  if (!a || !d) return "";
  const nights = Math.round((d.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
  return nights > 0 ? nights : "";
}

function formatTimestamp(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

/**
 * Porting di append-guest-sheet.mjs. Aggiunge una riga per ogni ospite,
 * continuando la numerazione progressiva esistente (legge la colonna A
 * per trovare l'ultimo id usato, come nell'originale).
 */
export async function appendGuests(
  exportData: GuestExportData
): Promise<{ rowsAdded: number }> {
  if (!exportData.guests?.length) {
    throw Object.assign(new Error("Missing or empty exportData"), { status: 400 });
  }

  const { spreadsheetId, sheetName, clientEmail, privateKey } =
    getServiceAccountCredentials();
  const accessToken = await getGoogleAccessToken(
    clientEmail,
    privateKey,
    "https://www.googleapis.com/auth/spreadsheets"
  ).catch((e) => {
    throw Object.assign(new Error(`Autenticazione Google fallita: ${e.message ?? e}`), {
      status: 502,
    });
  });

  // Continua la numerazione da dove era arrivata: se la lettura fallisce
  // non blocchiamo l'invio, si riparte da 1 (comportamento identico
  // all'originale — raro, solo se il foglio è irraggiungibile in questo
  // istante, nel qual caso la scrittura sotto fallirebbe comunque).
  let lastId = 0;
  try {
    const readRange = encodeURIComponent(`${sheetName}!A2:A`);
    const readRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${readRange}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (readRes.ok) {
      const readData = await readRes.json();
      for (const row of readData.values ?? []) {
        const n = parseInt(row[0], 10);
        if (!isNaN(n) && n > lastId) lastId = n;
      }
    }
  } catch {
    // best-effort, vedi commento sopra
  }

  const scanTimestamp = formatTimestamp(new Date());
  const rows = exportData.guests.map((g, i) => [
    lastId + i + 1,
    exportData.structure?.code ?? "",
    g.stay?.guestType ?? "",
    g.stay?.arrivalDate ?? "",
    nightsBetween(g.stay?.arrivalDate, g.stay?.departureDate),
    g.personal?.lastName ?? "",
    g.personal?.firstName ?? "",
    g.personal?.gender ?? "",
    g.personal?.birthDate ?? "",
    g.personal?.birthPlace ?? "",
    g.personal?.birthProvince ?? "",
    g.personal?.birthCountry ?? "",
    g.personal?.nationality ?? "",
    g.document?.type ?? "",
    g.document?.number ?? "",
    g.document?.issuePlace ?? "",
    scanTimestamp,
  ]);

  const range = encodeURIComponent(`${sheetName}!A1`);
  const sheetsRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ values: rows }),
    }
  ).catch(() => null);

  if (!sheetsRes) {
    throw Object.assign(new Error("Google Sheets non raggiungibile"), { status: 502 });
  }
  if (!sheetsRes.ok) {
    const detail = await sheetsRes.text();
    throw Object.assign(new Error(`Scrittura su Google Sheets fallita: ${detail}`), {
      status: 502,
    });
  }

  return { rowsAdded: rows.length };
}
