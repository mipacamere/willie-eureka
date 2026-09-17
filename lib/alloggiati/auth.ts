import { generateToken } from "./soap";
import { getProperty } from "@/config/properties";

/**
 * Porting di alloggiati-auth.mjs. Nell'originale il client passava
 * direttamente il codice ufficiale ("struttura_id", es. ME006995"); qui il
 * client passa invece lo slug interno (mipa / via-nazionale, lo stesso
 * usato nelle URL), e questa funzione risolve il codice ufficiale tramite
 * config/properties.ts prima di leggere le env var — un solo punto sa il
 * collegamento tra i due identificatori.
 *
 * Convenzione env var (invariata): ALLOGGIATI_USER_<CODICE>,
 * ALLOGGIATI_PASSWORD_<CODICE>, ALLOGGIATI_WSKEY_<CODICE>.
 */
export async function getAlloggiatiToken(
  propertySlug: string
): Promise<{ utente: string; token: string }> {
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
  const utente = process.env[`ALLOGGIATI_USER_${suffix}`];
  const password = process.env[`ALLOGGIATI_PASSWORD_${suffix}`];
  const wskey = process.env[`ALLOGGIATI_WSKEY_${suffix}`];

  if (!utente || !password || !wskey) {
    throw Object.assign(
      new Error(
        `Credenziali Alloggiati Web non configurate per "${propertySlug}" (mancano ` +
          `ALLOGGIATI_USER_${suffix} / ALLOGGIATI_PASSWORD_${suffix} / ALLOGGIATI_WSKEY_${suffix})`
      ),
      { status: 500 }
    );
  }
  const token = await generateToken(utente, password, wskey);
  return { utente, token };
}
