import bcrypt from "bcryptjs";
import type { PropertySlug } from "@/config/properties";

/**
 * Utenti staff/admin, definiti via env var invece che in un database:
 * per un numero piccolo di persone (2 strutture, poco staff) evita di
 * introdurre uno storage esterno solo per questo. Se il team cresce
 * molto, conviene migrare a una tabella vera — la funzione di verifica
 * qui sotto è comunque isolata, quindi la migrazione tocca solo questo
 * file, non le route o il middleware.
 *
 * Formato ADMIN_USERS_JSON / STAFF_USERS_JSON: JSON array di
 * { email, passwordHash, name, properties? }. passwordHash è un hash
 * bcrypt (mai la password in chiaro) — vedi scripts/hash-password.mjs
 * per generarlo.
 */

interface RawUser {
  email: string;
  passwordHash: string;
  name: string;
  properties?: PropertySlug[];
}

function parseUsersEnv(varName: string): RawUser[] {
  const raw = process.env[varName];
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    console.error(`${varName} non è un JSON valido`);
    return [];
  }
}

export interface AuthResult {
  email: string;
  name: string;
  properties: PropertySlug[];
}

/** Verifica le credenziali admin. Ritorna i dati utente se corrette, altrimenti null. */
export async function verifyAdminCredentials(
  email: string,
  password: string
): Promise<AuthResult | null> {
  const users = parseUsersEnv("ADMIN_USERS_JSON");
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
  if (!user) return null;
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return null;
  return { email: user.email, name: user.name, properties: [] };
}

/** Verifica le credenziali staff. Ritorna i dati utente (incluse le strutture assegnate) se corrette. */
export async function verifyStaffCredentials(
  email: string,
  password: string
): Promise<AuthResult | null> {
  const users = parseUsersEnv("STAFF_USERS_JSON");
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
  if (!user) return null;
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return null;
  return { email: user.email, name: user.name, properties: user.properties ?? [] };
}
