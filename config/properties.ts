/**
 * Configurazione per struttura.
 *
 * Ogni proprietà (mipa, via-nazionale, ...) vive qui come dati, non come
 * codice duplicato. Aggiungere una nuova struttura = aggiungere una entry,
 * non clonare un progetto.
 *
 * Le chiavi API restano separate per struttura (soglie gratuite OCR e
 * Questura/Regione Sicilia distinte), mentre lo Sheet ospiti è condiviso.
 */

export type PropertySlug = "mipa" | "via-nazionale";

export interface PropertyConfig {
  slug: PropertySlug;
  name: string;
  city: string;
  // Nome esteso usato nell'export JSON verso la struttura (STRUCTURE_NAME
  // nell'originale) — può differire dal "name" breve usato in UI.
  displayName: string;
  theme: {
    primary: string; // colore identità struttura (da theme-color originale)
    onPrimary: string;
  };
  // Nome della env var da leggere per la chiave OCR di questa struttura —
  // il VALORE non sta mai in questo file, solo il nome della variabile.
  env: {
    ocrApiKeyVar: string;
  };
  // Codice ufficiale struttura (assegnato da Questura Alloggiati Web e usato
  // anche come suffisso nelle env var Regione Sicilia, es. "ME006995").
  // Serve per scegliere le credenziali giuste: NON è lo slug usato negli URL.
  policeStructureId: string;
  // Codice Identificativo Nazionale (CIN), obbligatorio negli annunci e
  // nell'export verso le autorità dal 2024 (L. 191/2023).
  cin: string;
  // Token pubblico usato al posto dello slug nell'URL ospiti
  // (/guest/{token}/...), così il link nel QR code non è indovinabile
  // banalmente come lo sarebbe /guest/mipa. NON è un vero controllo
  // d'accesso (chiunque abbia il link/QR entra, come previsto per
  // l'area ospiti) — è solo un deterrente contro chi prova a indovinare
  // o enumerare gli URL delle altre strutture.
  guestAccessToken: string;
}

// Valori di sviluppo, usati SOLO se le env var qui sotto non sono
// configurate: sono pubblici (sono scritti in questo stesso file), quindi
// vanno sostituiti con GUEST_ACCESS_TOKEN_MIPA/GUEST_ACCESS_TOKEN_VN prima
// di stampare i QR code veri o di andare in produzione.
const DEV_FALLBACK_TOKEN_MIPA = "dev-mipa-token-da-sostituire";
const DEV_FALLBACK_TOKEN_VN = "dev-vn-token-da-sostituire";

function resolveGuestAccessToken(envVar: string | undefined, devFallback: string): string {
  if (envVar) return envVar;
  if (process.env.NODE_ENV !== "production") {
    console.warn(
      `[config] ${devFallback} è un token di sviluppo, non segreto: impostare la relativa ` +
        `env var prima di stampare i QR code veri o di andare in produzione.`
    );
  }
  return devFallback;
}

export const properties: Record<PropertySlug, PropertyConfig> = {
  mipa: {
    slug: "mipa",
    name: "MiPA",
    city: "Milazzo",
    displayName: "MiPA Milazzo",
    theme: { primary: "#3d6451", onPrimary: "#ffffff" },
    env: {
      ocrApiKeyVar: "OCR_API_KEY_MIPA",
    },
    policeStructureId: process.env.POLICE_STRUCTURE_ID_MIPA ?? "ME006995",
    cin: "IT083049C2UKATRA95",
    guestAccessToken: resolveGuestAccessToken(
      process.env.GUEST_ACCESS_TOKEN_MIPA,
      DEV_FALLBACK_TOKEN_MIPA
    ),
  },
  "via-nazionale": {
    slug: "via-nazionale",
    name: "Via Nazionale",
    city: "San Filippo del Mela",
    displayName: "B&B Via Nazionale",
    theme: { primary: "#6b1515", onPrimary: "#ffffff" },
    env: {
      ocrApiKeyVar: "OCR_API_KEY_VN",
    },
    policeStructureId: process.env.POLICE_STRUCTURE_ID_VN ?? "ME001066",
    cin: "IT083077C2V59BCOSW",
    guestAccessToken: resolveGuestAccessToken(
      process.env.GUEST_ACCESS_TOKEN_VN,
      DEV_FALLBACK_TOKEN_VN
    ),
  },
};

export function getProperty(slug: string): PropertyConfig | null {
  return (properties as Record<string, PropertyConfig>)[slug] ?? null;
}

export function isValidPropertySlug(slug: string): slug is PropertySlug {
  return slug in properties;
}

/** Risolve il token pubblico dell'URL ospiti nella struttura corrispondente. */
export function getPropertyByGuestToken(token: string): PropertyConfig | null {
  return Object.values(properties).find((p) => p.guestAccessToken === token) ?? null;
}
