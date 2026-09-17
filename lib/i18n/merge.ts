import { FALLBACK_LOCALE, type LocaleCode } from "./locales";

/**
 * Unisce le traduzioni della lingua scelta con quelle di fallback,
 * proprietà per proprietà (non "tutto o niente"): se una lingua ha
 * tradotto solo metà dei campi di una voce, quelli mancanti mostrano
 * comunque il fallback invece di restare vuoti. Così le traduzioni
 * possono essere aggiunte gradualmente, una lingua o anche un campo
 * alla volta, senza mai rompere nulla nel frattempo.
 */
export function mergeWithFallback<T extends object>(fallback: T, override: Partial<T> | undefined): T {
  if (!override) return fallback;
  return { ...fallback, ...override };
}

export function getLocaleTable<T>(
  tables: Record<LocaleCode, Record<string, T> | undefined>,
  locale: LocaleCode
): Record<string, T> {
  return tables[locale] ?? tables[FALLBACK_LOCALE] ?? {};
}
