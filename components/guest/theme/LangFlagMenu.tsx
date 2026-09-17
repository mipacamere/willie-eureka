"use client";

import { useState } from "react";
import { SUPPORTED_LOCALES } from "@/lib/i18n/locales";
import { useLocale } from "@/lib/i18n/LocaleContext";
import { Ms } from "./Ms";

export function LangFlagMenu() {
  const { locale, setLocale } = useLocale();
  const [open, setOpen] = useState(false);
  const current = SUPPORTED_LOCALES.find((l) => l.code === locale) ?? SUPPORTED_LOCALES[0];

  return (
    <div style={{ position: "relative" }}>
      <button
        className="lang-flag-btn"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
      >
        {current.flag}
        <Ms icon="expand_more" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="lang-menu">
            {SUPPORTED_LOCALES.map((l) => (
              <div
                key={l.code}
                className={"lang-menu-item" + (l.code === locale ? " active" : "")}
                onClick={() => {
                  setLocale(l.code);
                  setOpen(false);
                }}
              >
                <span>{l.flag}</span> {l.label}
                {l.code === locale && <Ms icon="check" />}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
