import { NextRequest, NextResponse } from "next/server";
import { checkAppToken } from "@/lib/api-auth";
import { getRegioneCredentials } from "@/lib/regione-sicilia/auth";
import { sendStaysToRegione, logoutRegione, type StayInput } from "@/lib/regione-sicilia/client";

/**
 * Porting di send-regione-sicilia.mjs. Invio distinto e aggiuntivo
 * rispetto a quello alla Questura: comunica i dati all'Osservatorio
 * Turistico della Regione Siciliana ai fini della rilevazione statistica
 * ISTAT. Body: { property: string, stays: StayInput[] }.
 */
export async function POST(request: NextRequest) {
  const denied = checkAppToken(request);
  if (denied) return denied;

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const stays: StayInput[] | null = Array.isArray(body.stays) ? body.stays : null;
  const property: string = (body.property ?? "").trim();

  if (!stays || stays.length === 0) {
    return NextResponse.json(
      { error: 'Nessun soggiorno da inviare (campo "stays" mancante o vuoto)' },
      { status: 400 }
    );
  }
  if (!property) {
    return NextResponse.json(
      { error: 'Campo "property" mancante: necessario per scegliere le credenziali corrette' },
      { status: 400 }
    );
  }

  let credenziali;
  try {
    credenziali = await getRegioneCredentials(property);
  } catch (e) {
    const err = e as Error & { status?: number };
    return NextResponse.json({ error: err.message ?? String(e) }, { status: err.status ?? 502 });
  }

  const { userId, hotelCode, token } = credenziali;

  try {
    const esito = await sendStaysToRegione(hotelCode, token, stays);
    return NextResponse.json({ ok: true, ...esito });
  } catch (e) {
    const err = e as Error & { status?: number };
    return NextResponse.json({ error: err.message ?? String(e) }, { status: err.status ?? 502 });
  } finally {
    // Logout best-effort: non deve influire sulla risposta già inviata.
    logoutRegione(userId, token).catch(() => {});
  }
}
