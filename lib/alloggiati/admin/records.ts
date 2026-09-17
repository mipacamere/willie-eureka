import { findInTable, findComune, pad, parseDate, type LookupRow, type LookupTables } from "./lookup";

/**
 * Modello ospite lato admin (lista cumulativa da scan/companion/import),
 * porting dell'oggetto guest usato in state.filteredGuests
 * (alloggiati-companion). Campi piatti, non annidati come GuestDraft
 * (lib/ocr/extract-fields.ts) — è il formato richiesto dal tracciato
 * ufficiale, quindi lo teniamo distinto invece di forzare una conversione.
 */
export interface AdminGuest {
  uiId: string;
  selected: boolean;
  source: "companion" | "file" | "scansione" | "manuale";
  struttura_id: string;
  cognome: string;
  nome: string;
  data_nascita: string;
  sesso: string;
  comune_nascita: string;
  provincia_nascita: string;
  stato_nascita: string;
  cittadinanza: string;
  tipo_documento: string;
  numero_documento: string;
  luogo_rilascio: string;
  data_arrivo: string;
  permanenza: string;
  tipo_alloggiato: string;
  isRawRecord?: boolean;
  rawRecord?: string;
}

export function emptyAdminGuest(strutturaId: string, source: AdminGuest["source"]): AdminGuest {
  return {
    uiId: `guest-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    selected: true,
    source,
    struttura_id: strutturaId,
    cognome: "",
    nome: "",
    data_nascita: "",
    sesso: "",
    comune_nascita: "",
    provincia_nascita: "",
    stato_nascita: "",
    cittadinanza: "",
    tipo_documento: "CARTA DI IDENTITA'",
    numero_documento: "",
    luogo_rilascio: "",
    data_arrivo: "",
    permanenza: "1",
    tipo_alloggiato: "OSPITE SINGOLO",
  };
}

/**
 * Porting di convertToRecord(): costruisce la riga a 168 caratteri del
 * tracciato fisso Alloggiati Web. Stesse posizioni esatte di campo
 * dell'originale — nessuna semplificazione del formato.
 */
export function convertToRecord(
  guest: AdminGuest,
  lookup: LookupTables,
  warnings: string[]
): string {
  if (guest.isRawRecord && guest.rawRecord) return guest.rawRecord;

  const rec: string[] = new Array(168).fill(" ");
  const cognome = String(guest.cognome || "").toUpperCase().trim();
  const nome = String(guest.nome || "").toUpperCase().trim();
  const rowLabel = `${cognome} ${nome}`;

  const tipoAlloggiatoDesc = String(guest.tipo_alloggiato || "").trim();
  const isFamilyMember = ["FAMILIARE", "MEMBRO GRUPPO"].includes(tipoAlloggiatoDesc.toUpperCase());

  function splice(start: number, len: number, value: string) {
    for (let i = 0; i < len && i < value.length; i++) rec[start + i] = value[i];
  }

  // 1. TIPO ALLOGGIATO (posizioni 0-1)
  const tipo = findInTable(lookup.tipoAlloggiato, "Descrizione", tipoAlloggiatoDesc);
  if (tipo) {
    splice(0, 2, pad(tipo.Codice, 2));
  } else {
    warnings.push(`${rowLabel}: tipo alloggiato "${tipoAlloggiatoDesc}" non riconosciuto`);
  }

  // 2. DATA ARRIVO (posizioni 2-11)
  splice(2, 10, pad(String(guest.data_arrivo || "").trim(), 10));

  // 3. GIORNI PERMANENZA (posizioni 12-13)
  const nights = Math.max(1, Math.min(30, parseInt(guest.permanenza, 10) || 1));
  splice(12, 2, String(nights).padStart(2, "0"));

  // 4. COGNOME (posizioni 14-63)
  splice(14, 50, pad(cognome, 50));

  // 5. NOME (posizioni 64-93)
  splice(64, 30, pad(nome, 30));

  // 6. SESSO (posizione 94) - 1=M, 2=F
  const sesso = String(guest.sesso || "").toUpperCase().trim();
  rec[94] = sesso === "F" ? "2" : "1";

  // 7. DATA NASCITA (posizioni 95-104)
  const dataNascita = String(guest.data_nascita || "").trim();
  splice(95, 10, pad(dataNascita, 10));

  // 8-10. COMUNE / PROVINCIA / STATO NASCITA
  const statoNascitaDesc = String(guest.stato_nascita || "").trim();
  const statoNascita = findInTable(lookup.stati, "Descrizione", statoNascitaDesc);
  if (!statoNascita) warnings.push(`${rowLabel}: stato di nascita "${statoNascitaDesc}" non riconosciuto`);
  const isItalia = statoNascita?.Codice === "100000100";

  if (isItalia) {
    const comune = findComune(lookup.comuni, guest.comune_nascita, guest.provincia_nascita);
    if (comune) {
      splice(105, 9, pad(comune.Codice, 9));
    } else {
      warnings.push(`${rowLabel}: comune di nascita "${guest.comune_nascita || ""}" non riconosciuto`);
    }
    splice(114, 2, pad(String(guest.provincia_nascita || "").toUpperCase(), 2));
  }
  if (statoNascita) {
    splice(116, 9, pad(statoNascita.Codice, 9));
  }

  // 11. CITTADINANZA (posizioni 125-133)
  const cittadinanzaDesc = String(guest.cittadinanza || "").trim();
  const cittadinanza = findInTable(lookup.stati, "Descrizione", cittadinanzaDesc);
  if (cittadinanza) {
    splice(125, 9, pad(cittadinanza.Codice, 9));
  } else {
    warnings.push(`${rowLabel}: cittadinanza "${cittadinanzaDesc}" non riconosciuta`);
  }

  // 12-14. DOCUMENTO (solo per ospite singolo/capofamiglia/capogruppo)
  if (!isFamilyMember) {
    const tipoDocDesc = String(guest.tipo_documento || "").trim();
    const doc = findInTable(lookup.documenti, "Descrizione", tipoDocDesc);
    if (doc) {
      splice(134, 5, pad(doc.Codice, 5));
    } else {
      warnings.push(`${rowLabel}: tipo documento "${tipoDocDesc}" non riconosciuto`);
    }

    const numDoc = String(guest.numero_documento || "").toUpperCase().trim();
    splice(139, 20, pad(numDoc, 20));

    const luogoRilascio = String(guest.luogo_rilascio || "").trim();
    if (luogoRilascio) {
      const luogoComune = findComune(lookup.comuni, luogoRilascio, "");
      if (luogoComune) {
        splice(159, 9, pad(luogoComune.Codice, 9));
      } else {
        const luogoStato = findInTable(lookup.stati, "Descrizione", luogoRilascio);
        if (luogoStato) {
          splice(159, 9, pad(luogoStato.Codice, 9));
        } else {
          warnings.push(`${rowLabel}: luogo di rilascio documento "${luogoRilascio}" non riconosciuto`);
        }
      }
    } else {
      warnings.push(`${rowLabel}: luogo di rilascio documento mancante`);
    }
  }

  const line = rec.join("");
  if (line.length !== 168) warnings.push(`${rowLabel}: riga di lunghezza inattesa (${line.length} invece di 168)`);
  return line;
}

/** Porting di buildRecordsForSelected(). */
export function buildRecordsForSelected(
  guests: AdminGuest[],
  lookup: LookupTables
): { records: string[]; warnings: string[]; selectedGuests: AdminGuest[] } {
  const selectedGuests = guests.filter((g) => g.selected);
  const warnings: string[] = [];
  const records = selectedGuests.map((guest) => convertToRecord(guest, lookup, warnings));
  return { records, warnings, selectedGuests };
}

// ══════════════════════════════════════════════
// Regione Sicilia — Osservatorio Turistico
// ══════════════════════════════════════════════

function computeAge(dataNascitaStr: string, refDateStr: string): number | null {
  const dob = parseDate(dataNascitaStr);
  const ref = parseDate(refDateStr) || new Date();
  if (!dob) return null;
  let age = ref.getFullYear() - dob.getFullYear();
  const m = ref.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && ref.getDate() < dob.getDate())) age--;
  return Math.max(0, Math.min(150, age));
}

function addDaysToDateStr(dataStr: string, days: number): Date | null {
  const d = parseDate(dataStr);
  if (!d) return null;
  const d2 = new Date(d);
  d2.setDate(d2.getDate() + days);
  return d2;
}

function toRegioneDateTime(dateOrStr: Date | string | null): string | null {
  const d = dateOrStr instanceof Date ? dateOrStr : parseDate(dateOrStr);
  if (!d) return null;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T10:00:00.000Z`;
}

function slugId(str: string | undefined | null): string {
  return String(str || "")
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z0-9]/g, "");
}

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash.toString(16).toUpperCase();
}

function buildRegioneGuestId(guest: AdminGuest): string {
  const base =
    slugId(guest.cognome) + slugId(guest.nome) + slugId(guest.data_nascita) + slugId(guest.numero_documento || "");
  return (base.slice(0, 24) || "OSPITE") + "-" + simpleHash(base + String(guest.data_arrivo || ""));
}

export interface RegioneStay {
  stayId: string;
  guestId: string;
  age: number;
  nationalityCode: string;
  birthPlaceCode: string;
  residencePlaceCode: string;
  type: string;
  gender: string;
  email: string;
  arrivalDate: string;
  departureDate: string;
  checkout: boolean;
  bedOccupancy: boolean;
  rooms: { roomId: string; startDate: string; endDate: string }[];
}

/**
 * Porting di buildRegioneStayForGuest(). NOTA (invariata dall'originale):
 * il tracciato richiede anche il "Comune/Stato di residenza", dato che
 * questa app non raccoglie — viene approssimato al luogo di nascita.
 */
export function buildRegioneStayForGuest(
  guest: AdminGuest,
  hotelCode: string,
  lookup: LookupTables,
  warnings: string[]
): RegioneStay | null {
  const cognome = String(guest.cognome || "").toUpperCase().trim();
  const nome = String(guest.nome || "").toUpperCase().trim();
  const rowLabel = `${cognome} ${nome}`;

  const dataNascita = String(guest.data_nascita || "").trim();
  const age = computeAge(dataNascita, guest.data_arrivo);
  if (age === null) {
    warnings.push(`${rowLabel}: data di nascita "${dataNascita}" non valida, ospite escluso dall'invio alla Regione`);
    return null;
  }

  const tipoAlloggiatoDesc = String(guest.tipo_alloggiato || "").trim();
  const tipo = findInTable(lookup.tipoAlloggiato, "Descrizione", tipoAlloggiatoDesc);
  if (!tipo) {
    warnings.push(`${rowLabel}: tipo alloggiato "${tipoAlloggiatoDesc}" non riconosciuto, ospite escluso dall'invio alla Regione`);
    return null;
  }

  const cittadinanzaDesc = String(guest.cittadinanza || "").trim();
  const cittadinanza = findInTable(lookup.stati, "Descrizione", cittadinanzaDesc);
  if (!cittadinanza) {
    warnings.push(`${rowLabel}: cittadinanza "${cittadinanzaDesc}" non riconosciuta, ospite escluso dall'invio alla Regione`);
    return null;
  }

  const statoNascitaDesc = String(guest.stato_nascita || "").trim();
  const statoNascita = findInTable(lookup.stati, "Descrizione", statoNascitaDesc);
  if (!statoNascita) {
    warnings.push(`${rowLabel}: stato di nascita "${statoNascitaDesc}" non riconosciuto, ospite escluso dall'invio alla Regione`);
    return null;
  }
  const isItalia = statoNascita.Codice === "100000100";
  let birthPlaceCode = statoNascita.Codice;
  if (isItalia) {
    const comune = findComune(lookup.comuni, guest.comune_nascita, guest.provincia_nascita);
    if (!comune) {
      warnings.push(`${rowLabel}: comune di nascita "${guest.comune_nascita || ""}" non riconosciuto, ospite escluso dall'invio alla Regione`);
      return null;
    }
    birthPlaceCode = comune.Codice;
  }

  const residencePlaceCode = birthPlaceCode;
  const sesso = String(guest.sesso || "").toUpperCase().trim();
  const gender = sesso === "F" ? "2" : "1";

  const nights = Math.max(1, Math.min(30, parseInt(guest.permanenza, 10) || 1));
  const arrivalDate = toRegioneDateTime(String(guest.data_arrivo || "").trim());
  if (!arrivalDate) {
    warnings.push(`${rowLabel}: data di arrivo "${guest.data_arrivo || ""}" non valida, ospite escluso dall'invio alla Regione`);
    return null;
  }
  const departureDate = toRegioneDateTime(addDaysToDateStr(String(guest.data_arrivo || "").trim(), nights));
  if (!departureDate) {
    warnings.push(`${rowLabel}: impossibile calcolare la data di partenza, ospite escluso dall'invio alla Regione`);
    return null;
  }

  const guestId = buildRegioneGuestId(guest);
  const stayId = `${hotelCode}_${guestId}`;

  return {
    stayId,
    guestId,
    age,
    nationalityCode: cittadinanza.Codice,
    birthPlaceCode,
    residencePlaceCode,
    type: tipo.Codice,
    gender,
    email: "",
    arrivalDate,
    departureDate,
    checkout: false,
    bedOccupancy: true,
    rooms: [{ roomId: "1", startDate: arrivalDate, endDate: departureDate }],
  };
}

/** Porting di buildRegioneStaysForSelected(). */
export function buildRegioneStaysForSelected(
  guests: AdminGuest[],
  hotelCode: string,
  lookup: LookupTables
): { stays: RegioneStay[]; warnings: string[]; selectedGuests: AdminGuest[] } {
  const selectedGuests = guests.filter((g) => g.selected);
  const warnings: string[] = [];
  const stays: RegioneStay[] = [];
  selectedGuests.forEach((guest) => {
    const stay = buildRegioneStayForGuest(guest, hotelCode, lookup, warnings);
    if (stay) stays.push(stay);
  });
  return { stays, warnings, selectedGuests };
}

export type { LookupRow };
