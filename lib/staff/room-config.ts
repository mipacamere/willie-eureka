/** Porting delle opzioni di riepilogopulizie.html: stessi valori, stesse etichette/icone. */

export const CONFIG_OPTIONS = [
  { value: "matrimoniale", label: "🛏️ Matrimoniale" },
  { value: "lettini", label: "🛏️🛏️ Due Lettini" },
  { value: "matrimoniale-singola", label: "👤 Matrimoniale Uso Singola" },
] as const;

export const OPERATION_OPTIONS = [
  { value: "pulizia-completa", label: "🧹 Pulizia Completa" },
  { value: "cambio-spugne-bagno", label: "🧼 Cambio Spugne e Bagni" },
  { value: "cambio-lenzuola-spugne-pulizia", label: "🛏️🧼 Cambio Lenzuola, Spugne e Pulizia" },
] as const;

export const EXTRA_BEDS_OPTIONS = ["1", "2", "3"] as const;

export type ConfigValue = (typeof CONFIG_OPTIONS)[number]["value"];
export type OperationValue = (typeof OPERATION_OPTIONS)[number]["value"];

export function configLabel(value: string): string {
  return CONFIG_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

export function operationLabel(value: string): string {
  return OPERATION_OPTIONS.find((o) => o.value === value)?.label ?? value;
}
