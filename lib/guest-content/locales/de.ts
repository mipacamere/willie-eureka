import type { PropertySlug } from "@/config/properties";
import type { PropertyTranslation } from "../types";

/**
 * Traduzione tedesco dei contenuti companion — STUB, non ancora tradotto.
 *
 * Struttura pronta: per tradurre, aggiungi le chiavi "mipa" e/o
 * "via-nazionale" con lo stesso oggetto PropertyTranslation presente in
 * locales/it.ts. Finché una struttura manca qui, il merge in index.ts la
 * ricava automaticamente da it.ts (fallback), quindi si può tradurre una
 * struttura alla volta senza mai lasciare buchi in produzione.
 */
export const de: Partial<Record<PropertySlug, PropertyTranslation>> = {
  // TODO: tradurre in tedesco
};
