"use client";

import { useState } from "react";
import { SUPPORTED_LOCALES } from "./locales";
import { useLocale } from "./LocaleContext";

/**
 * Porting di LanguageSelector.vue. Qui gestisce solo la lingua (il
 * cambio tema chiaro/scuro dell'originale non è stato portato — fuori
 * scope rispetto a questo giro sul multilingua).
 */
export function LanguageSelector({ className = "" }: { className?: string }) {
  const { locale, setLocale } = useLocale();
  const [open, setOpen] = useState(false);
  const current = SUPPORTED_LOCALES.find((l) => l.code === locale) ?? SUPPORTED_LOCALES[0];

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 rounded-lg bg-white/15 px-2.5 py-1.5 text-sm font-medium text-white"
      >
        <span>{current.flag}</span>
        <span>{current.name}</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-1 w-40 rounded-lg border border-neutral-200 bg-white py-1 shadow-lg">
            {SUPPORTED_LOCALES.map((l) => (
              <button
                key={l.code}
                onClick={() => {
                  setLocale(l.code);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-neutral-800 hover:bg-neutral-50 ${
                  l.code === locale ? "font-medium" : ""
                }`}
              >
                <span>{l.flag}</span>
                <span>{l.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
