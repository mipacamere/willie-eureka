import type { LocaleCode } from "@/lib/i18n/locales";
import { FALLBACK_LOCALE } from "@/lib/i18n/locales";
import { mergeWithFallback } from "@/lib/i18n/merge";
import { ITINERARY_STRUCTURE, FIRST_STEP_ID, type StepStructure } from "../structure";
import type { ItineraryTranslation } from "../types";
import { it } from "./it";
import { en } from "./en";
import { es } from "./es";
import { fr } from "./fr";
import { de } from "./de";
import { zh } from "./zh";
import { ru } from "./ru";

const TABLES: Record<LocaleCode, Record<string, ItineraryTranslation>> = { it, en, es, fr, de, zh, ru };

/** Uno step completo (struttura + testo), pronto per ItineraryStepView. */
export interface ItineraryStep {
  id: string;
  title: string;
  subtitle?: string;
  warning?: string;
  paragraphsHtml: string[];
  listHtml?: string[];
  image?: { src: string; alt: string; external?: boolean };
  linkButtons?: { title: string; description: string; url: string; buttonText: string }[];
  buttons: { label: string; nextId: string }[];
  showBack?: boolean;
}

function mergeStep(structure: StepStructure, locale: LocaleCode): ItineraryStep {
  const fallback = TABLES[FALLBACK_LOCALE][structure.id];
  const chosen = TABLES[locale]?.[structure.id];
  const t: ItineraryTranslation = mergeWithFallback(fallback, chosen);

  return {
    id: structure.id,
    title: t.title,
    subtitle: t.subtitle,
    warning: t.warning,
    paragraphsHtml: t.paragraphsHtml,
    listHtml: t.listHtml,
    image: structure.image
      ? { src: structure.image.src, alt: t.imageAlt ?? "", external: structure.image.external }
      : undefined,
    linkButtons: structure.linkUrls?.map((url, i) => ({
      url,
      title: t.linkButtons?.[i]?.title ?? "",
      description: t.linkButtons?.[i]?.description ?? "",
      buttonText: t.linkButtons?.[i]?.buttonText ?? "",
    })),
    buttons: structure.nextIds.map((nextId, i) => ({
      nextId,
      label: t.buttonLabels?.[i] ?? "",
    })),
    showBack: structure.showBack,
  };
}

export function getItineraryStep(id: string, locale: LocaleCode): ItineraryStep {
  const structure = ITINERARY_STRUCTURE.find((s) => s.id === id) ?? ITINERARY_STRUCTURE[0];
  return mergeStep(structure, locale);
}

export { FIRST_STEP_ID };
