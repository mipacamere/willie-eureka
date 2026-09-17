import { parseTD1, parseTD2, parseTD3, type MrzParseResult } from "./mrz";
import { genericExtract, type GenericExtractResult } from "./generic-extract";
import { matchStato, matchDocumento } from "./match";
import { normalizeDateStr, todayFormatted, tomorrowFormatted } from "./dates";

export type OcrRawResult = MrzParseResult | GenericExtractResult;

// Individua e interpreta la MRZ nel testo OCR; se non trovata, usa l'estrazione generica.
export function extractFieldsFromText(text: string): OcrRawResult {
  const candidateLines = text
    .split("\n")
    .map((l) => l.replace(/\s+/g, "").toUpperCase())
    .filter((l) => l.length >= 28 && l.length <= 46 && /^[A-Z0-9<]+$/.test(l));

  const td3Index = candidateLines.findIndex((l) => l.length >= 43 && l.startsWith("P<"));
  if (td3Index >= 0 && candidateLines[td3Index + 1] && candidateLines[td3Index + 1].length >= 43) {
    try {
      return parseTD3(
        candidateLines[td3Index].padEnd(44, "<"),
        candidateLines[td3Index + 1].padEnd(44, "<")
      );
    } catch (e) {
      console.warn("Parsing TD3 fallito", e);
    }
  }

  for (let i = 0; i < candidateLines.length - 2; i++) {
    const [a, b, c] = [candidateLines[i], candidateLines[i + 1], candidateLines[i + 2]];
    if (
      a.length >= 29 &&
      a.length <= 31 &&
      b.length >= 29 &&
      b.length <= 31 &&
      c.length >= 29 &&
      c.length <= 31
    ) {
      try {
        return parseTD1(a.padEnd(30, "<"), b.padEnd(30, "<"), c.padEnd(30, "<"));
      } catch (e) {
        console.warn("Parsing TD1 fallito", e);
      }
    }
  }

  // Formato TD2 (2 righe da 36): usato da alcune carte d'identità elettroniche UE al posto
  // del TD1 a tre righe. Va cercato dopo il TD1 per non confondere righe da ~30-31 caratteri
  // con quelle da ~35-36.
  for (let i = 0; i < candidateLines.length - 1; i++) {
    const [a, b] = [candidateLines[i], candidateLines[i + 1]];
    if (a.length >= 35 && a.length <= 37 && b.length >= 35 && b.length <= 37 && !a.startsWith("P<")) {
      try {
        return parseTD2(a.padEnd(36, "<"), b.padEnd(36, "<"));
      } catch (e) {
        console.warn("Parsing TD2 fallito", e);
      }
    }
  }

  const emptyRaw: GenericExtractResult = {
    docType: "",
    surname: "",
    givenNames: "",
    number: "",
    nationality: "",
    sex: "",
    dob: "",
    comuneNascita: "",
    provinciaNascita: "",
    birthPlaceGeneric: "",
    luogoRilascio: "",
  };
  return { ...emptyRaw, ...genericExtract(text) };
}

export interface GuestDraft {
  id: string;
  document: {
    type: string;
    number: string;
    issuePlace: string;
    ocrConfidence: number | null;
  };
  personal: {
    lastName: string;
    firstName: string;
    gender: string;
    birthDate: string;
    birthPlace: string;
    birthProvince: string;
    birthCountry: string;
    nationality: string;
  };
  stay: {
    arrivalDate: string;
    departureDate: string;
    guestType: string;
  };
}

// Guest "vuoto", nella stessa forma annidata dell'export JSON finale: acquisiamo i dati
// così come compaiono sul documento, senza convertirli in codici — la conversione nel
// tracciato ufficiale Alloggiati Web avviene in un'altra app.
export function emptyGuestDraft(): GuestDraft {
  return {
    id: "guest-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    document: { type: "", number: "", issuePlace: "", ocrConfidence: null },
    personal: {
      lastName: "",
      firstName: "",
      gender: "",
      birthDate: "",
      birthPlace: "",
      birthProvince: "",
      birthCountry: "",
      nationality: "",
    },
    stay: {
      arrivalDate: todayFormatted(),
      departureDate: tomorrowFormatted(),
      guestType: "OSPITE SINGOLO",
    },
  };
}

function isMrzResult(r: OcrRawResult): r is MrzParseResult {
  return "country" in r;
}

// Traduce il risultato grezzo dell'OCR (extractFieldsFromText) in una bozza di ospite
// pronta per la revisione manuale — riportando i valori così come letti sul documento,
// senza alcuna conversione in codice. Solo i campi che l'OCR può davvero leggere vengono
// precompilati; il resto (arrivo, partenza, luogo nascita se non riconosciuto, ecc.) resta
// da compilare o verificare a mano.
export function ocrResultToGuestDraft(ocrResult: OcrRawResult, confidence: number | null): GuestDraft {
  const draft = emptyGuestDraft();
  draft.personal.lastName = (ocrResult.surname || "").trim();
  draft.personal.firstName = (ocrResult.givenNames || "").trim();
  draft.personal.birthDate = normalizeDateStr(ocrResult.dob);
  draft.personal.gender = ocrResult.sex || "";
  // Cittadinanza/stato di nascita: l'OCR può leggere un codice MRZ a 3 lettere ("ITA")
  // o un nome per esteso — in entrambi i casi cerchiamo la voce più vicina nella tabella
  // ufficiale Stati, così il menu a tendina si preseleziona da solo; l'operatore corregge
  // se il risultato non è quello giusto.
  draft.personal.nationality = matchStato(ocrResult.nationality);

  const comuneNascita = isMrzResult(ocrResult) ? "" : ocrResult.comuneNascita;
  const birthPlaceGeneric = isMrzResult(ocrResult) ? "" : ocrResult.birthPlaceGeneric;

  if (comuneNascita) {
    draft.personal.birthPlace = comuneNascita;
    draft.personal.birthProvince = isMrzResult(ocrResult) ? "" : ocrResult.provinciaNascita || "";
    draft.personal.birthCountry = "ITALIA"; // il formato "Comune (PR)" compare solo su documenti italiani
  } else if (birthPlaceGeneric) {
    // Luogo di nascita letto in chiaro da un documento non italiano (patente UE o carta
    // d'identità non elettronica): riportiamo il luogo, ma NON deduciamo il paese di nascita,
    // perché non è garantito che coincida con la cittadinanza (es. nato all'estero) — resta
    // da scegliere in revisione.
    draft.personal.birthPlace = birthPlaceGeneric;
  } else if (ocrResult.nationality) {
    // Nessun indizio di nascita in Italia: come suggerimento di partenza usiamo la stessa
    // corrispondenza della cittadinanza (spesso coincidono, ma l'operatore verifica sempre).
    draft.personal.birthCountry = matchStato(ocrResult.nationality);
  }

  draft.document.type = matchDocumento(ocrResult.docType);
  draft.document.number = ocrResult.number || "";
  const luogoRilascio = isMrzResult(ocrResult) ? "" : ocrResult.luogoRilascio;
  if (luogoRilascio) draft.document.issuePlace = luogoRilascio;
  if (typeof confidence === "number") draft.document.ocrConfidence = Math.round(confidence * 100) / 100;

  return draft;
}

// Imposta un valore in un campo annidato (es. "document.number", "personal.lastName").
export function setNestedField(
  obj: GuestDraft,
  path: string,
  value: string | number | null
): void {
  const [group, key] = path.split(".") as [keyof GuestDraft, string];
  (obj[group] as unknown as Record<string, unknown>)[key] = value;
}
