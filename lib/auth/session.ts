import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import type { PropertySlug } from "@/config/properties";

/**
 * Sessioni firmate per staff/admin. Usiamo JWT (via `jose`, che gira sia
 * su Node che sull'Edge Runtime del middleware) invece di un semplice
 * cookie con un id di sessione in un database, per tenere questa parte
 * senza dipendenze da uno storage esterno: il token stesso porta ruolo e
 * struttura assegnata, firmato con SESSION_SECRET, verificabile
 * direttamente in proxy.ts senza una query.
 *
 * Se in futuro serve poter revocare una sessione singola prima della
 * scadenza (es. "disconnetti questo dispositivo"), va aggiunta una
 * blocklist lato server: i JWT da soli non lo permettono.
 */

const SESSION_DURATION = "12h";

export type SessionRole = "admin" | "staff";

export interface SessionPayload extends JWTPayload {
  role: SessionRole;
  email: string;
  name: string;
  // Solo per lo staff: strutture a cui ha accesso. Vuoto/assente per
  // l'admin, che vede tutto.
  properties?: PropertySlug[];
}

function getSecretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "SESSION_SECRET non configurato: necessario per firmare le sessioni di login (vedi .env.example)"
    );
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_DURATION)
    .sign(getSecretKey());
}

/** Restituisce il payload se il token è valido e non scaduto, altrimenti null. */
export async function verifySessionToken(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload as SessionPayload;
  } catch {
    // Firma non valida, token scaduto, o SESSION_SECRET cambiato: sessione non valida.
    return null;
  }
}

export const SESSION_COOKIE_MAX_AGE_SECONDS = 12 * 60 * 60; // 12h, coerente con SESSION_DURATION

/**
 * Legge la sessione realmente attiva per la richiesta corrente (solo lato
 * server, richiede next/headers). Controlla prima admin_session poi
 * staff_session: dato che /staff/* ora è raggiungibile da entrambi i
 * ruoli (l'admin vede tutto), serve per sapere con quale ruolo si sta
 * navigando — es. per mostrare il pulsante logout corretto.
 */
export async function getCurrentSession(): Promise<SessionPayload | null> {
  const { cookies } = await import("next/headers");
  const store = await cookies();

  const adminToken = store.get("admin_session")?.value;
  const adminSession = await verifySessionToken(adminToken);
  if (adminSession?.role === "admin") return adminSession;

  const staffToken = store.get("staff_session")?.value;
  const staffSession = await verifySessionToken(staffToken);
  if (staffSession?.role === "staff") return staffSession;

  return null;
}
