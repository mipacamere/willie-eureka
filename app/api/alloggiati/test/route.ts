import { NextRequest, NextResponse } from "next/server";
import { checkAppToken } from "@/lib/api-auth";
import { getAlloggiatiToken } from "@/lib/alloggiati/auth";
import { testSchedine } from "@/lib/alloggiati/soap";

/**
 * Porting di test-schedine.mjs. Convalida (Test): NON invia realmente le
 * schedine alla Questura. Body: { property: string, righe: string[] }.
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
      { error: 'Nessuna riga da convalidare (campo "righe" mancante o vuoto)' },
      { status: 400 }
    );
  }
  if (!property) {
    return NextResponse.json(
      { error: 'Campo "property" mancante: necessario per scegliere le credenziali corrette' },
      { status: 400 }
    );
  }

  try {
    const { utente, token } = await getAlloggiatiToken(property);
    const esito = await testSchedine(utente, token, righe);
    return NextResponse.json({ ok: true, ...esito });
  } catch (e) {
    const err = e as Error & { status?: number };
    return NextResponse.json({ error: err.message ?? String(e) }, { status: err.status ?? 502 });
  }
}
