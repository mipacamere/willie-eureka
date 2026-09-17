/**
 * Configurazione per struttura.
 *
 * Ogni proprietà (mipa, via-nazionale, ...) vive qui come dati, non come
 * codice duplicato. Aggiungere una nuova struttura = aggiungere una entry,
 * non clonare un progetto.
 */

export type PropertySlug = "mipa" | "via-nazionale";

export interface PropertyConfig {
  slug: PropertySlug;
  name: string;
  city: string;
  displayName: string;
  theme: {
    primary: string;
    onPrimary: string;
  };
  env: {
    ocrApiKeyVar: string;
  };
  policeStructureId: string;
  cin: string;
  guestAccessToken: string;
  // Dati di posizione per mappe, QR code e condivisione
  location: {
    address: string;
    coords: { lat: number; lng: number };
    mapsUrl: string;
  };
}

const DEV_FALLBACK_TOKEN_MIPA = "dev-mipa-token-da-sostituire";
const DEV_FALLBACK_TOKEN_VN = "dev-vn-token-da-sostituire";

function resolveGuestAccessToken(envVar: string | undefined, devFallback: string): string {
  if (envVar) return envVar;
  if (process.env.NODE_ENV !== "production") {
    console.warn(
      `[config] ${devFallback} è un token di sviluppo. Impostare la relativa ` +
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
    env: { ocrApiKeyVar: "OCR_API_KEY_MIPA" },
    policeStructureId: process.env.POLICE_STRUCTURE_ID_MIPA ?? "ME006995",
    cin: "IT083049C2UKATRA95",
    guestAccessToken: resolveGuestAccessToken(process.env.GUEST_ACCESS_TOKEN_MIPA, DEV_FALLBACK_TOKEN_MIPA),
    location: {
      address: "Via Roma 123, 98057 Milazzo (ME)", // <-- MODIFICA CON L'INDIRIZZO REALE
      coords: { lat: 38.22139358253553, lng: 15.24303142010567 },
      mapsUrl: "https://www.google.com/maps/place/?q=38.22139358253553,15.24303142010567",
    },
  },
  "via-nazionale": {
    slug: "via-nazionale",
    name: "Via Nazionale",
    city: "San Filippo del Mela",
    displayName: "B&B Via Nazionale",
    theme: { primary: "#6b1515", onPrimary: "#ffffff" },
    env: { ocrApiKeyVar: "OCR_API_KEY_VN" },
    policeStructureId: process.env.POLICE_STRUCTURE_ID_VN ?? "ME001066",
    cin: "IT083077C2V59BCOSW",
    guestAccessToken: resolveGuestAccessToken(process.env.GUEST_ACCESS_TOKEN_VN, DEV_FALLBACK_TOKEN_VN),
    location: {
      address: "Via Nazionale 456, 98040 San Filippo del Mela (ME)", // <-- MODIFICA CON L'INDIRIZZO REALE
      coords: { lat: 38.244536652950124, lng: 15.241761685781448 },
      mapsUrl: "https://www.google.com/maps/place/?q=38.244536652950124,15.241761685781448",
    },
  },
};

export function getProperty(slug: string): PropertyConfig | null {
  return (properties as Record<string, PropertyConfig>)[slug] ?? null;
}

export function isValidPropertySlug(slug: string): slug is PropertySlug {
  return slug in properties;
}

export function getPropertyByGuestToken(token: string): PropertyConfig | null {
  return Object.values(properties).find((p) => p.guestAccessToken === token) ?? null;
}
