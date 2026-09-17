import type { PropertyConfig } from "@/config/properties";
import type { GuestDraft } from "./extract-fields";

export type ExportPropertyInfo = Pick<PropertyConfig, "displayName" | "policeStructureId" | "cin">;

export interface ExportJson {
  version: string;
  exportDate: string;
  structure: { name: string; code: string; cin: string };
  guests: {
    id: string;
    document: GuestDraft["document"];
    personal: GuestDraft["personal"];
    stay: GuestDraft["stay"];
  }[];
}

/** Porting di buildExportJson(). */
export function buildExportJson(guests: GuestDraft[], property: ExportPropertyInfo): ExportJson {
  return {
    version: "1.0",
    exportDate: new Date().toISOString(),
    structure: {
      name: property.displayName,
      code: property.policeStructureId,
      cin: property.cin,
    },
    guests: guests.map((g) => ({
      id: g.id,
      document: { ...g.document },
      personal: { ...g.personal },
      stay: { ...g.stay },
    })),
  };
}

/** Porting di exportFilename(). */
export function exportFilename(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `export_alloggiati_${yyyy}${mm}${dd}.json`;
}

/** Porting di buildExportFile(). */
export function buildExportFile(
  guests: GuestDraft[],
  property: ExportPropertyInfo
): { file: File; filename: string } {
  const content = JSON.stringify(buildExportJson(guests, property), null, 2);
  const filename = exportFilename();
  return { file: new File([content], filename, { type: "application/json" }), filename };
}

/** Porting di downloadExportFile(). Solo lato client (usa document/URL). */
export function downloadExportFile(file: File, filename: string): void {
  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Porting di downloadOnly(): riserva manuale, scarica semplicemente il
 * file senza tentare alcun invio automatico. Da usare quando l'invio
 * al Google Sheet condiviso fallisce (o come alternativa comunque
 * disponibile), per inviare il file con lo strumento che si preferisce
 * (WhatsApp, Telegram, email...).
 */
export function downloadOnly(guests: GuestDraft[], property: ExportPropertyInfo): void {
  if (!guests.length) return;
  const { file, filename } = buildExportFile(guests, property);
  downloadExportFile(file, filename);
}
