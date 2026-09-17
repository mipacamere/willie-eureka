import { NextRequest, NextResponse } from "next/server";
import { checkAppToken } from "@/lib/api-auth";
import { getAlloggiatiToken } from "@/lib/alloggiati/auth";
import { sendSchedine } from "@/lib/alloggiati/soap";

/**
 * Porting di send-schedine.mjs.
 *
 * ATTENZIONE: questo endpoint trasmette DAVVERO le schedine alla Questura
 * (operazione Send del Web Service Alloggiati). Richiede "confirm: true"
 * come rete di sicurezza contro chiamate accidentali — il client deve
 * chiedere conferma esplicita all'operatore prima di impostarlo, come
 * nell'originale.
 *
 * Body: { property: string, righe: string[], confirm: true }
 */
export async function POST(request: NextRequest) {
  const denied = checkAppToken(request);
  if (denied) return denied;

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const righe: string[] | null = Array.isArray(body.righe) ? body.righe : null;
  const property: string = (body.property ?? "").trim();

  if (!righe || righe.length === 0) {
    return NextResponse.json(
      { error: 'Nessuna riga da inviare (campo "righe" mancante o vuoto)' },
      { status: 400 }
    );
  }
  if (!property) {
    return NextResponse.json(
      { error: 'Campo "property" mancante: necessario per scegliere le credenziali corrette' },
      { status: 400 }
    );
  }
  if (body.confirm !== true) {
    return NextResponse.json(
      { error: 'Conferma mancante: imposta "confirm": true solo dopo esplicita conferma dell\'operatore' },
      { status: 400 }
    );
  }

  try {
    const { utente, token } = await getAlloggiatiToken(property);
    const esito = await sendSchedine(utente, token, righe);
    return NextResponse.json({ ok: true, ...esito });
  } catch (e) {
    const err = e as Error & { status?: number };
    return NextResponse.json({ error: err.message ?? String(e) }, { status: err.status ?? 502 });
  }
}
