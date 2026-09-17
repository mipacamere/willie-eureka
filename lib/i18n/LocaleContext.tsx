"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { DEFAULT_LOCALE, isSupportedLocale, type LocaleCode } from "./locales";

/**
 * Porting del meccanismo di lingua di App.vue: la lingua scelta si
 * salva in localStorage (stessa chiave "language" dell'originale) e
 * NON compare nell'URL — a differenza di soluzioni come next-intl con
 * routing per lingua, questo evita di dover cambiare lo schema degli
 * URL già stampati sui QR code nelle camere (/guest/mipa, non
 * /it/guest/mipa).
 */

interface LocaleContextValue {
  locale: LocaleCode;
  setLocale: (code: LocaleCode) => void;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleCode>(DEFAULT_LOCALE);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("language");
      if (saved && isSupportedLocale(saved)) setLocaleState(saved);
    } catch {
      // localStorage non disponibile: resta la lingua di default
    }
  }, []);

  function setLocale(code: LocaleCode) {
    setLocaleState(code);
    try {
      localStorage.setItem("language", code);
    } catch {
      // localStorage non disponibile: la scelta resta valida solo per questa sessione
    }
  }

  return <LocaleContext.Provider value={{ locale, setLocale }}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    // Fuori da un LocaleProvider (es. componente non ancora avvolto):
    // ricade sul default invece di lanciare un errore, così l'adozione
    // può essere graduale componente per componente.
    return { locale: DEFAULT_LOCALE, setLocale: () => {} };
  }
  return ctx;
}
