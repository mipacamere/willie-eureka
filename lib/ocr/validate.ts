import type { GuestDraft } from "./extract-fields";

/**
 * Porting di validateGuest (mipacompanion/vncompanion). Stesse regole,
 * stesso ordine, stessi messaggi.
 */
export function validateGuest(g: GuestDraft): string[] {
  const errors: string[] = [];
  const dateRe = /^\d{2}\/\d{2}\/\d{4}$/;

  // Soggiorno
  if (!dateRe.test(g.stay.arrivalDate || "")) errors.push("Data di arrivo mancante o non valida");
  if (!dateRe.test(g.stay.departureDate || ""))
    errors.push("Data di partenza mancante o non valida");
  if (
    g.stay.arrivalDate &&
    g.stay.departureDate &&
    g.stay.arrivalDate === g.stay.departureDate
  ) {
    errors.push("La data di partenza non può coincidere con quella di arrivo");
  }
  if (!g.stay.guestType) errors.push("Tipo alloggiato mancante");

  // Dati anagrafici
  if (!g.personal.lastName) errors.push("Cognome mancante");
  if (!g.personal.firstName) errors.push("Nome mancante");
  if (g.personal.gender !== "M" && g.personal.gender !== "F") errors.push("Sesso mancante");
  if (!dateRe.test(g.personal.birthDate || ""))
    errors.push("Data di nascita mancante o non valida");

  // Nascita e cittadinanza — luogo e provincia di nascita si trovano solo sui documenti
  // italiani (formato "Comune (PR)"): per i documenti esteri non è richiesto inserirli,
  // quindi non bloccano l'avanzamento se lo Stato di nascita non è l'Italia.
  if (!g.personal.birthCountry) errors.push("Stato di nascita mancante");
  if (g.personal.birthCountry === "ITALIA" && !g.personal.birthPlace)
    errors.push("Comune di nascita mancante (obbligatorio se nato in Italia)");
  if (g.personal.birthCountry === "ITALIA" && !g.personal.birthProvince)
    errors.push("Provincia di nascita mancante (obbligatoria se nato in Italia)");
  if (!g.personal.nationality) errors.push("Cittadinanza mancante");

  // Documento
  if (!g.document.type) errors.push("Tipo documento mancante");
  if (!g.document.number) errors.push("Numero documento mancante");
  if (!g.document.issuePlace) errors.push("Luogo di rilascio del documento mancante");

  return errors;
}
