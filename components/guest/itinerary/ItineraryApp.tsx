"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { getItineraryStep, FIRST_STEP_ID } from "@/lib/itinerary/locales";
import { ItineraryStepView } from "./ItineraryStepView";
import "./itinerary-original.css";

const AVAILABLE_LANGUAGES = [
  { code: "it", label: "Italiano", flag: "🇮" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "es", label: "Español", flag: "🇪" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "zh", label: "中文", flag: "🇨" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
] as const;

type LangCode = (typeof AVAILABLE_LANGUAGES)[number]["code"];

const COMMON_LABELS: Record<LangCode, { back: string; home: string }> = {
  it: { back: "Indietro", home: "Torna all'inizio" },
  en: { back: "Back", home: "Back to start" },
  es: { back: "Atrás", home: "Volver al inicio" },
  fr: { back: "Retour", home: "Retour au début" },
  de: { back: "Zurück", home: "Zurück zum Start" },
  zh: { back: "返回", home: "回到开始" },
  ru: { back: "Назад", home: "В начало" },
};

export function ItineraryApp() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentId = searchParams.get("step") || FIRST_STEP_ID;

  const [theme, setTheme] = useState("light-theme");
  const [locale, setLocale] = useState<LangCode>("it");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isNavbarHidden, setIsNavbarHidden] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const initial = prefersDark ? "dark-theme" : "light-theme";
      setTheme(initial);
      localStorage.setItem("theme", initial);
    }
    const savedLang = localStorage.getItem("language") as LangCode | null;
    if (savedLang && AVAILABLE_LANGUAGES.some((l) => l.code === savedLang)) {
      setLocale(savedLang);
    }
  }, []);

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  useEffect(() => {
    let prev = window.pageYOffset;
    const handleScroll = () => {
      const current = window.pageYOffset;
      setIsNavbarHidden(prev < current && current > 100);
      prev = current;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".lang-pill")) setDropdownOpen(false);
    };
    document.addEventListener("click", onOutside);
    return () => document.removeEventListener("click", onOutside);
  }, []);

  const step = useMemo(() => getItineraryStep(currentId, locale), [currentId, locale]);

  const goTo = useCallback(
    (id: string) => {
      router.push(`${pathname}?step=${id}`);
      window.scrollTo({ top: 0 });
    },
    [router, pathname]
  );

  const goBack = useCallback(() => router.back(), [router]);

  const labels = COMMON_LABELS[locale];
  const currentLang = AVAILABLE_LANGUAGES.find((l) => l.code === locale)!;

  return (
    <div className={`itinerary-fullscreen container ${theme}`}>
      <div className={`navbar ${isNavbarHidden ? "hidden" : ""}`}>
        <div className="lang-bar">
          <div className="lang-pill">
            <button
              className="lang-trigger"
              onClick={() => setDropdownOpen((o) => !o)}
              aria-expanded={dropdownOpen}
            >
              <span className="lang-globe">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              </span>
              <span className="lang-current">
                <span className="lang-flag">{currentLang.flag}</span>
                <span className="lang-code">{currentLang.code.toUpperCase()}</span>
              </span>
              <span className={`lang-chevron ${dropdownOpen ? "rotated" : ""}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </span>
            </button>

            {dropdownOpen && (
              <div className="lang-dropdown">
                {AVAILABLE_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    className={`lang-option ${locale === lang.code ? "selected" : ""}`}
                    onClick={() => {
                      setLocale(lang.code);
                      localStorage.setItem("language", lang.code);
                      setDropdownOpen(false);
                    }}
                  >
                    <span className="opt-flag">{lang.flag}</span>
                    <span className="opt-name">{lang.label}</span>
                    {locale === lang.code && (
                      <span className="opt-check">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <span className="bar-divider"></span>

          <button
            className="theme-btn"
            onClick={() => {
              const next = theme === "light-theme" ? "dark-theme" : "light-theme";
              setTheme(next);
              localStorage.setItem("theme", next);
            }}
            title={theme === "dark-theme" ? "Light mode" : "Dark mode"}
          >
            {theme === "dark-theme" ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div className="content-container">
        <ItineraryStepView
          currentId={currentId}
          step={step}
          onNavigate={goTo}
          onBack={goBack}
          backLabel={labels.back}
          homeLabel={labels.home}
        />
      </div>
    </div>
  );
}
