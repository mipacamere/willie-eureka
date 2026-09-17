import { NextRequest, NextResponse } from "next/server";
import { checkAppToken } from "@/lib/api-auth";
import { readFilteredGuests } from "@/lib/google/sheets";

/**
 * Porting di read-guests.mjs. Body: { property, data_arrivo } (gg/mm/aaaa).
 * Nota: qui "property" è lo slug interno (mipa / via-nazionale), non il
 * "struttura_id" grezzo dell'originale — il filtro sul foglio usa comunque
 * il valore scritto in colonna B, che in append-guest-sheet corrisponde a
 * exportData.structure.code (da definire coerente con lo slug lato client).
 */
export async function POST(request: NextRequest) {
  const denied = checkAppToken(request);
  if (denied) return denied;

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const property: string = (body.property ?? "").trim();
  const dataArrivo: string = (body.data_arrivo ?? "").trim();

  if (!property || !/^\d{2}\/\d{2}\/\d{4}$/.test(dataArrivo)) {
    return NextResponse.json(
      { error: "property e data_arrivo (gg/mm/aaaa) sono obbligatori" },
      { status: 400 }
    );
  }

  try {
    const guests = await readFilteredGuests(property, dataArrivo);
    return NextResponse.json({ ok: true, guests, count: guests.length });
  } catch (e) {
    const err = e as Error & { status?: number };
    return NextResponse.json({ error: err.message ?? String(e) }, { status: err.status ?? 502 });
  }
}
