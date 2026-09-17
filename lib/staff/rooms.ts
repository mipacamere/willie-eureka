import type { PropertySlug } from "@/config/properties";

/**
 * Struttura camere/appartamenti per struttura, presa da
 * condividi_gallerie.html (la fonte più dettagliata trovata: distingue
 * Via Nazionale standard dalle Suites, cosa che riepilogopulizie.html
 * non fa). Usata da checklist, riepilogo pulizie e condividi gallerie,
 * cosa che nell'originale erano 3 liste separate scritte a mano in 3
 * file diversi — qui una fonte sola.
 */

export interface RoomGroup {
  id: string;
  label: string;
  gallerySlug: string; // usato per il link di condivisione galleria
  rooms: { id: string; label: string }[];
}

export const ROOM_GROUPS: Record<PropertySlug, RoomGroup[]> = {
  mipa: [
    {
      id: "mipa-appartamenti",
      label: "MiPA — Appartamenti",
      gallerySlug: "mipa",
      rooms: [
        { id: "MiPA1", label: "Appartamento MiPA 1" },
        { id: "MiPA2", label: "Appartamento MiPA 2" },
        { id: "MiPA3", label: "Appartamento MiPA 3" },
        { id: "MiPA4", label: "Appartamento MiPA 4" },
      ],
    },
  ],
  "via-nazionale": [
    {
      id: "via-nazionale-camere",
      label: "Via Nazionale",
      gallerySlug: "via-nazionale",
      rooms: [
        { id: "101", label: "Camera 101" },
        { id: "102", label: "Camera 102" },
        { id: "103", label: "Camera 103" },
        { id: "104", label: "Camera 104" },
        { id: "105", label: "Camera 105" },
      ],
    },
    {
      id: "via-nazionale-suites",
      label: "Via Nazionale Suites",
      gallerySlug: "via-nazionale-suites",
      rooms: [
        { id: "201", label: "Suite 201" },
        { id: "202", label: "Suite 202" },
        { id: "203", label: "Suite 203" },
      ],
    },
  ],
};

/** Tutte le camere/appartamenti di una struttura, appiattite (usato dalla checklist). */
export function getAllRooms(slug: PropertySlug): { id: string; label: string }[] {
  return ROOM_GROUPS[slug].flatMap((g) => g.rooms);
}
