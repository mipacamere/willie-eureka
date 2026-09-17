export interface MrzParseResult {
  docType: string;
  country: string;
  surname: string;
  givenNames: string;
  number: string;
  nationality: string;
  sex: string;
  dob: string;
  expiry: string;
}

// Converte una data MRZ 'YYMMDD' in 'DD/MM/YYYY' (euristica sul secolo: >30 -> 1900+, altrimenti 2000+)
export function formatMrzDate(yymmdd: string): string {
  if (!/^\d{6}$/.test(yymmdd)) return "";
  const yy = parseInt(yymmdd.slice(0, 2), 10);
  const mm = yymmdd.slice(2, 4),
    dd = yymmdd.slice(4, 6);
  const yyyy = yy > 30 ? 1900 + yy : 2000 + yy;
  return dd + "/" + mm + "/" + yyyy;
}

export function splitMrzNames(namesPart: string): { surname: string; givenNames: string } {
  const clean = namesPart.replace(/<+$/, "");
  const [surname = "", given = ""] = clean.split("<<");
  return {
    surname: surname.replace(/</g, " ").trim(),
    givenNames: given.replace(/</g, " ").trim(),
  };
}

// Passaporto (TD3): due righe da 44 caratteri
export function parseTD3(line1: string, line2: string): MrzParseResult {
  const country = line1.substr(2, 3).replace(/</g, "");
  const { surname, givenNames } = splitMrzNames(line1.substr(5));
  const number = line2.substr(0, 9).replace(/</g, "").trim();
  const nationality = line2.substr(10, 3).replace(/</g, "");
  const dob = formatMrzDate(line2.substr(13, 6));
  const sexChar = line2.substr(20, 1);
  const sex = sexChar === "F" ? "F" : sexChar === "M" ? "M" : "";
  const expiry = formatMrzDate(line2.substr(21, 6));
  return {
    docType: "PASSAPORTO ORDINARIO",
    country,
    surname,
    givenNames,
    number,
    nationality,
    sex,
    dob,
    expiry,
  };
}

// Etichetta ufficiale da usare per il tipo documento letto via MRZ: "elettronica" è la
// dicitura della tabella Alloggiati Web riservata al modello italiano CIE; per le carte
// d'identità di altri Stati UE, che seguono lo stesso standard MRZ ma non sono la CIE,
// usiamo la voce generica "CARTA DI IDENTITA'".
export function mrzIdCardDocType(country: string): string {
  return country === "ITA" ? "CARTA IDENTITA' ELETTRONICA" : "CARTA DI IDENTITA'";
}

// Carta d'identità elettronica (TD1): tre righe da 30 caratteri
export function parseTD1(line1: string, line2: string, line3: string): MrzParseResult {
  const country = line1.substr(2, 3).replace(/</g, "");
  const number = line1.substr(5, 9).replace(/</g, "").trim();
  const dob = formatMrzDate(line2.substr(0, 6));
  const sexChar = line2.substr(7, 1);
  const sex = sexChar === "F" ? "F" : sexChar === "M" ? "M" : "";
  const expiry = formatMrzDate(line2.substr(8, 6));
  const nationality = line2.substr(15, 3).replace(/</g, "");
  const { surname, givenNames } = splitMrzNames(line3);
  return {
    docType: mrzIdCardDocType(country),
    country,
    surname,
    givenNames,
    number,
    nationality,
    sex,
    dob,
    expiry,
  };
}

// Carta d'identità elettronica (TD2): due righe da 36 caratteri — formato usato da alcune
// carte d'identità UE (ICAO 9303 parte 6) in alternativa al TD1 a tre righe. La struttura è
// analoga al TD3 dei passaporti ma più corta: nomi in riga 1, dati anagrafici in riga 2.
export function parseTD2(line1: string, line2: string): MrzParseResult {
  const country = line1.substr(2, 3).replace(/</g, "");
  const { surname, givenNames } = splitMrzNames(line1.substr(5));
  const number = line2.substr(0, 9).replace(/</g, "").trim();
  const nationality = line2.substr(10, 3).replace(/</g, "");
  const dob = formatMrzDate(line2.substr(13, 6));
  const sexChar = line2.substr(20, 1);
  const sex = sexChar === "F" ? "F" : sexChar === "M" ? "M" : "";
  const expiry = formatMrzDate(line2.substr(21, 6));
  return {
    docType: mrzIdCardDocType(country),
    country,
    surname,
    givenNames,
    number,
    nationality,
    sex,
    dob,
    expiry,
  };
}
