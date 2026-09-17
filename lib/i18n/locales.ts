/**
 * Porting di availableLanguages (App.vue, 1day-itinerary) — stesse 7
 * lingue, stessi codici/bandiere/etichette. Il default è "it" e il
 * fallback è "it" (non "en" come nell'originale): a differenza
 * dell'originale, qui SOLO l'italiano è completamente tradotto per ora,
 * quindi ha senso ricadere sul contenuto reale invece che su un inglese
 * a sua volta incompleto.
 */

export interface LocaleOption {
  code: string;
  name: string;
  flag: string;
  label: string;
}

export const SUPPORTED_LOCALES: LocaleOption[] = [
  { code: "it", name: "IT", flag: "🇮🇹", label: "Italiano" },
  { code: "en", name: "EN", flag: "🇬🇧", label: "English" },
  { code: "fr", name: "FR", flag: "🇫🇷", label: "Français" },
  { code: "es", name: "ES", flag: "🇪🇸", label: "Español" },
  { code: "de", name: "DE", flag: "🇩🇪", label: "Deutsch" },
  { code: "zh", name: "ZH", flag: "🇨🇳", label: "中文" },
  { code: "ru", name: "RU", flag: "🇷🇺", label: "Русский" },
];

export type LocaleCode = (typeof SUPPORTED_LOCALES)[number]["code"];

export const DEFAULT_LOCALE: LocaleCode = "it";
// Lingua su cui ricadere quando una chiave manca nella lingua scelta —
// oggi è anche l'unica lingua completa, quindi coincide col default.
export const FALLBACK_LOCALE: LocaleCode = "it";

export function isSupportedLocale(code: string): code is LocaleCode {
  return SUPPORTED_LOCALES.some((l) => l.code === code);
}
