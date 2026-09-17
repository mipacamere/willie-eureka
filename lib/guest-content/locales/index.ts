import type { PropertySlug } from "@/config/properties";
import type { LocaleCode } from "@/lib/i18n/locales";
import { FALLBACK_LOCALE } from "@/lib/i18n/locales";
import { mergeWithFallback } from "@/lib/i18n/merge";
import { PROPERTY_STRUCTURE } from "../structure";
import type { PropertyTranslation } from "../types";
import { it } from "./it";
import { en } from "./en";
import { es } from "./es";
import { fr } from "./fr";
import { de } from "./de";
import { zh } from "./zh";
import { ru } from "./ru";

const TABLES: Record<LocaleCode, Partial<Record<PropertySlug, PropertyTranslation>>> = {
  it,
  en,
  es,
  fr,
  de,
  zh,
  ru,
};

/** Stessa forma già usata da GuestDashboard/CheckinFlow — struttura + testo uniti in un solo oggetto. */
export interface GuestContent {
  greeting: string;
  wifi: { ssid: string; password: string };
  address: string;
  checkinHours: string;
  checkoutHours: string;
  phone: string;
  phoneDisplay: string;
  email: string;
  whatsappUrl: string;
  philosophy: string[];
  entrySteps: string[];
  mapPlaceUrl: string;
  beachMapsUrl: string;
  roomMapsUrl: string;
  directions: {
    arrivalModes: { icon: string; color: string; title: string; desc: string }[];
    departureModes: { icon: string; color: string; title: string; desc: string }[];
  };
  services: { emoji: string; title: string; price: string; note: string; waText: string }[];
}

export function getGuestContent(slug: PropertySlug, locale: LocaleCode): GuestContent {
  const structure = PROPERTY_STRUCTURE[slug];
  const fallback = TABLES[FALLBACK_LOCALE][slug]!;
  const chosen = TABLES[locale]?.[slug];
  const t: PropertyTranslation = mergeWithFallback(fallback, chosen);

  return {
    greeting: t.greeting,
    wifi: structure.wifi,
    address: structure.address,
    checkinHours: structure.checkinHours,
    checkoutHours: structure.checkoutHours,
    phone: structure.phone,
    phoneDisplay: structure.phoneDisplay,
    email: structure.email,
    whatsappUrl: structure.whatsappUrl,
    philosophy: t.philosophy,
    entrySteps: t.entrySteps,
    mapPlaceUrl: structure.mapPlaceUrl,
    beachMapsUrl: structure.beachMapsUrl,
    roomMapsUrl: structure.roomMapsUrl,
    directions: {
      arrivalModes: structure.directions.arrivalModes.map((icon, i) => ({
        ...icon,
        title: t.directions.arrivalModes[i]?.title ?? "",
        desc: t.directions.arrivalModes[i]?.desc ?? "",
      })),
      departureModes: structure.directions.departureModes.map((icon, i) => ({
        ...icon,
        title: t.directions.departureModes[i]?.title ?? "",
        desc: t.directions.departureModes[i]?.desc ?? "",
      })),
    },
    services: structure.services.map((icon, i) => ({
      ...icon,
      title: t.services[i]?.title ?? "",
      note: t.services[i]?.note ?? "",
      waText: t.services[i]?.waText ?? "",
    })),
  };
}
