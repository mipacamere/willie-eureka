import type { LocaleCode } from "./locales";
import { FALLBACK_LOCALE } from "./locales";

/**
 * Porting del namespace "common" di vue-i18n (common.back,
 * common.backToStart, ecc.): stringhe di interfaccia riusate in più
 * punti dell'app, non legate a un singolo step o a una singola
 * struttura. Stesso pattern delle traduzioni dell'itinerario: solo IT è
 * completo, le altre lingue vanno compilate con le stesse chiavi.
 *
 * Nota di scope: oggi qui ci sono solo le stringhe usate dalla
 * navigazione dell'itinerario. Le altre stringhe di interfaccia sparse
 * nei componenti (tab Home/Esplora/Info/Checkout, pulsanti del
 * check-in, ecc.) sono ancora testo fisso in italiano nei file .tsx —
 * vanno migrate qui con lo stesso pattern quando si affronterà la
 * traduzione completa dell'interfaccia, non solo dei contenuti.
 */

export interface CommonStrings {
  back: string;
  backToStart: string;
}

const it: CommonStrings = {
  back: "Indietro",
  backToStart: "Torna all'inizio",
};

// TODO: compilare con le stesse chiavi di cui sopra quando si traduce.
const stub: Partial<CommonStrings> = {};

const TABLES: Record<LocaleCode, Partial<CommonStrings>> = {
  it,
  en: stub,
  es: stub,
  fr: stub,
  de: stub,
  zh: stub,
  ru: stub,
};

export function getCommonStrings(locale: LocaleCode): CommonStrings {
  return { ...TABLES[FALLBACK_LOCALE], ...TABLES[locale] } as CommonStrings;
}
