import { loginRegione } from "./client";
import { getProperty } from "@/config/properties";

/**
 * Porting di regione-sicilia-auth.mjs, stesso adattamento di
 * alloggiati/auth.ts: risolve lo slug interno in codice ufficiale prima
 * di leggere le env var (REGIONE_SICILIA_USERID_<CODICE>, ecc.).
 */
export async function getRegioneCredentials(
  propertySlug: string
): Promise<{ userId: string; hotelCode: string; token: string }> {
  const property = getProperty(propertySlug);
  if (!property) {
    throw Object.assign(new Error(`Struttura sconosciuta: "${propertySlug}"`), {
      status: 400,
    });
  }
  const codice = property.policeStructureId;
  if (!codice) {
    throw Object.assign(
      new Error(
        `policeStructureId non configurato per "${propertySlug}" (vedi config/properties.ts)`
      ),
      { status: 500 }
    );
  }

  const suffix = codice.trim().toUpperCase();
  const userId = process.env[`REGIONE_SICILIA_USERID_${suffix}`];
  const password = process.env[`REGIONE_SICILIA_PASSWORD_${suffix}`];
  const hotelCode = process.env[`REGIONE_SICILIA_HOTELCODE_${suffix}`];

  if (!userId || !password || !hotelCode) {
    throw Object.assign(
      new Error(
        `Credenziali Regione Sicilia non configurate per "${propertySlug}" (mancano ` +
          `REGIONE_SICILIA_USERID_${suffix} / REGIONE_SICILIA_PASSWORD_${suffix} / REGIONE_SICILIA_HOTELCODE_${suffix})`
      ),
      { status: 500 }
    );
  }

  const token = await loginRegione(userId, password);
  return { userId, hotelCode, token };
}
