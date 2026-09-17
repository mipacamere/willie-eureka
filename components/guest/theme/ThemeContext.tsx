"use client";

import { createContext, useContext, useEffect, useState } from "react";

/**
 * Porting del meccanismo tema di app.js: di default segue le preferenze
 * di sistema (prefers-color-scheme), il pulsante nell'header permette
 * una scelta manuale salvata in localStorage e riproposta ad ogni
 * apertura. "auto" = nessuna scelta manuale, segue il sistema.
 */

export type ThemeChoice = "auto" | "dark" | "light";

interface ThemeContextValue {
  choice: ThemeChoice;
  effective: "dark" | "light";
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function systemPrefersDark(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [choice, setChoice] = useState<ThemeChoice>("auto");
  const [systemDark, setSystemDark] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("guest_theme");
      if (stored === "dark" || stored === "light") setChoice(stored);
    } catch {
      // localStorage non disponibile: resta "auto"
    }
    setSystemDark(systemPrefersDark());

    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq?.addEventListener("change", onChange);
    return () => mq?.removeEventListener("change", onChange);
  }, []);

  const effective: "dark" | "light" = choice === "auto" ? (systemDark ? "dark" : "light") : choice;

  function toggleTheme() {
    const next: ThemeChoice = effective === "dark" ? "light" : "dark";
    setChoice(next);
    try {
      localStorage.setItem("guest_theme", next);
    } catch {
      // localStorage non disponibile: la scelta resta valida solo per questa sessione
    }
  }

  return (
    <ThemeContext.Provider value={{ choice, effective, toggleTheme }}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) return { choice: "auto", effective: "light", toggleTheme: () => {} };
  return ctx;
}
