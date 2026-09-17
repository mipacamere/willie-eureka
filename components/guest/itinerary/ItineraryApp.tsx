"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { getItineraryStep, FIRST_STEP_ID } from "@/lib/itinerary/locales";
import { ItineraryStepView } from "./ItineraryStepView";
import "./itinerary-original.css";

const AVAILABLE_LANGUAGES = [
  { code: "it", label: "Italiano", flag: "🇮🇹" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
];

export function ItineraryApp() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentId = searchParams.get("step") || FIRST_STEP_ID;

  const [theme, setTheme] = useState<string>("light-theme");
  const [locale, setLocale] = useState<string>("it");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isNavbarHidden, setIsNavbarHidden] = useState(false);
  const [prevScrollPos, setPrevScrollPos] = useState(0);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const initialTheme = prefersDark ? "dark-theme" : "light-theme";
      setTheme(initialTheme);
      localStorage.setItem("theme", initialTheme);
    }

    const savedLanguage = localStorage.getItem("language");
    if (savedLanguage && AVAILABLE_LANGUAGES.some((lang) => lang.code === savedLanguage)) {
      setLocale(savedLanguage);
    }
  }, []);

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.pageYOffset;
      if (prevScrollPos < currentScrollPos && currentScrollPos > 100) {
        setIsNavbarHidden(true);
      } else {
        setIsNavbarHidden(false);
      }
      setPrevScrollPos(currentScrollPos);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [prevScrollPos]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".lang-pill")) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  const step = useMemo(() => getItineraryStep(currentId, locale), [currentId, locale]);

  const goTo = useCallback(
    (id: string) => {
      router.push(`${pathname}?step=${id}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [router, pathname]
  );

  const selectLanguage = (code: string) => {
    setLocale(code);
    localStorage.setItem("language", code);
    setDropdownOpen(false);
  };

  const toggleTheme = () => {
    const newTheme = theme === "light-theme" ? "dark-theme" : "light-theme";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const currentLang = AVAILABLE_LANGUAGES.find((l) => l.code === locale) || AVAILABLE_LANGUAGES[0];

  const backLabel = step?.buttonLabels?.[0] || "← Indietro";
  const homeLabel = "Torna all'inizio";

  return (
    <div className="container">
      <div className={`navbar ${isNavbarHidden ? "hidden" : ""}`}>
        <div className="lang-bar">
          <div className="lang-pill">
            <button
              className="lang-trigger"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              aria-expanded={dropdownOpen}
            >
              <span className="lang-globe">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
              </span>
              <span className="lang-current">
                <span className="lang-flag">{currentLang.flag}</span>
                <span className="lang-code">{currentLang.code.toUpperCase()}</span>
              </span>
              <span className={`lang-chevron ${dropdownOpen ? "rotated" : ""}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </span>
            </button>

            {dropdownOpen && (
              <div className="lang-dropdown">
                {AVAILABLE_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    className={`lang-option ${locale === lang.code ? "selected" : ""}`}
                    onClick={() => selectLanguage(lang.code)}
                  >
                    <span className="opt-flag">{lang.flag}</span>
                    <span className="opt-name">{lang.label}</span>
                    {locale === lang.code && (
                      <span className="opt-check">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <polyline points="20 6 9 17 4 12"/>
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
            onClick={toggleTheme}
            title={theme === "dark-theme" ? "Light mode" : "Dark mode"}
          >
            {theme === "dark-theme" ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <circle cx="12" cy="12" r="5"/>
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
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
          backLabel={backLabel}
          homeLabel={homeLabel}
        />
      </div>
    </div>
  );
}
