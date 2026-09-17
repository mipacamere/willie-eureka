import {
  STATI_LIST,
  DOCUMENTI_LIST,
  MRZ_ALPHA3_TO_STATO,
  NATIONALITY_ALIAS_TO_STATO,
} from "./constants";

// Confronto testuale approssimato: toglie accenti/punteggiatura e confronta in maiuscolo.
export function normalizeForMatch(s: string | undefined | null): string {
  return (s || "")
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z0-9 ]/g, "")
    .trim();
}

export function levenshtein(a: string, b: string): number {
  const m = a.length,
    n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

// Trova nella lista ufficiale la voce che più somiglia al testo letto dall'OCR: prova prima
// corrispondenza esatta, poi prefisso/contenuto, infine distanza di Levenshtein entro una
// soglia ragionevole. Restituisce '' se non trova nulla di abbastanza simile (l'operatore
// sceglierà a mano dal menu).
export function findBestMatch(text: string | undefined | null, list: readonly string[]): string {
  if (!text) return "";
  const norm = normalizeForMatch(text);
  if (!norm) return "";
  const exact = list.find((item) => normalizeForMatch(item) === norm);
  if (exact) return exact;
  const starts = list.find((item) => {
    const n = normalizeForMatch(item);
    return n.startsWith(norm) || norm.startsWith(n);
  });
  if (starts) return starts;
  const includes = list.find((item) => {
    const n = normalizeForMatch(item);
    return n.includes(norm) || norm.includes(n);
  });
  if (includes) return includes;
  let best = "",
    bestDist = Infinity;
  for (const item of list) {
    const d = levenshtein(norm, normalizeForMatch(item));
    if (d < bestDist) {
      bestDist = d;
      best = item;
    }
  }
  const threshold = Math.max(2, Math.floor(norm.length * 0.35));
  return bestDist <= threshold ? best : "";
}

// Stato/nazionalità: prova prima la mappa MRZ (codici alpha-3 come "ITA", "FRA"...),
// poi il confronto testuale generico (utile per il percorso senza MRZ, dove l'OCR legge
// direttamente un nome per esteso).
export function matchStato(text: string | undefined | null): string {
  if (!text) return "";
  const code = text.trim().toUpperCase();
  if (MRZ_ALPHA3_TO_STATO[code]) return MRZ_ALPHA3_TO_STATO[code];
  if (NATIONALITY_ALIAS_TO_STATO[code]) return NATIONALITY_ALIAS_TO_STATO[code];
  // A volte il valore catturato contiene rumore proveniente da un campo adiacente sulla
  // stessa riga visiva (es. "M/M EST" quando sesso e nazionalità condividono la riga, tipico
  // dei layout a due colonne): prima di rinunciare al match esatto, cerchiamo un token
  // isolato di 3 lettere che corrisponda comunque a un codice alpha-3 noto.
  const tokens = code.match(/(?<!\p{L})[A-Z]{3}(?!\p{L})/gu) || [];
  for (const t of tokens) {
    if (MRZ_ALPHA3_TO_STATO[t]) return MRZ_ALPHA3_TO_STATO[t];
  }
  return findBestMatch(text, STATI_LIST);
}

export function matchDocumento(text: string | undefined | null): string {
  if (!text) return "";
  if ((DOCUMENTI_LIST as readonly string[]).includes(text)) return text;
  return findBestMatch(text, DOCUMENTI_LIST);
}
