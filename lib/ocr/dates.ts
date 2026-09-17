// Uniforma qualunque data letta dall'OCR al formato gg/mm/aaaa, indipendentemente dal
// separatore stampato sul documento originale (i documenti italiani spesso usano i punti:
// "31.12.2028" anziché "31/12/2028").
export function normalizeDateStr(s: string | undefined | null): string {
  if (!s) return "";
  // Alcuni Stati UE separano gg/mm/aaaa con spazi anziché punti o barre (es. le carte
  // d'identità ungheresi: "31 12 1970"), e alcuni documenti italiani (patenti) usano
  // l'anno a 2 cifre ("02/03/89"): gestiamo entrambi i casi.
  const m = s.trim().match(/^(\d{2})[.\-\/\s](\d{2})[.\-\/\s](\d{2,4})$/);
  if (!m) return s.trim();
  return m[1] + "/" + m[2] + "/" + expandTwoDigitYear(m[3]);
}

// Espande un anno a 2 cifre in 4 cifre con la stessa euristica usata per la MRZ: se
// maggiore di 30 si assume 19xx, altrimenti 20xx (nessun documento UE in circolazione oggi
// può riportare una nascita dopo il 2030 o richiedere quell'ambiguità sul lato opposto).
export function expandTwoDigitYear(yearStr: string): string {
  if (yearStr.length === 4) return yearStr;
  const yy = parseInt(yearStr, 10);
  return String(yy > 30 ? 1900 + yy : 2000 + yy);
}

export function todayFormatted(): string {
  const d = new Date();
  return (
    String(d.getDate()).padStart(2, "0") +
    "/" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "/" +
    d.getFullYear()
  );
}

// Un giorno dopo oggi, come default ragionevole per la data di partenza.
export function tomorrowFormatted(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return (
    String(d.getDate()).padStart(2, "0") +
    "/" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "/" +
    d.getFullYear()
  );
}
