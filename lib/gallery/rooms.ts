import type { PropertySlug } from "@/config/properties";

/**
 * Gruppi galleria fotografica per struttura. Volutamente separato da
 * lib/staff/rooms.ts (che serve checklist/riepilogo pulizie): qui c'è
 * anche la "Sala colazione", che ha una galleria fotografica ma non è
 * una camera da pulire con la checklist — le due liste rispondono a
 * bisogni diversi, quindi restano due fonti diverse invece di forzarle
 * a coincidere.
 */

export interface GalleryGroup {
  id: string;
  label: string;
  gallerySlug: string;
  rooms: { id: string; label: string }[];
}

export const GALLERY_GROUPS: Record<PropertySlug, GalleryGroup[]> = {
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
        { id: "breakfast", label: "Sala colazione" },
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
