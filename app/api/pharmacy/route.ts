import { NextRequest, NextResponse } from "next/server";
import { checkAppToken } from "@/lib/api-auth";

/**
 * Porting di pharmacy-proxy.mjs. Interroga api.farmaciediturno.org per le
 * farmacie di turno vicino a Milazzo (usata da entrambe le strutture,
 * MiPA in centro e Via Nazionale a pochi minuti). cod=83049 è il codice
 * ISTAT del comune di Milazzo.
 */
export async function GET(request: NextRequest) {
  const denied = checkAppToken(request);
  if (denied) return denied;

  const apiKey = process.env.FARMACIEDITURNO_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "FARMACIEDITURNO_API_KEY non configurata" },
      { status: 500 }
    );
  }

  const url =
    "https://api.farmaciediturno.org/aperteturno.asp" +
    `?key=${encodeURIComponent(apiKey)}` +
    "&cod=83049" +
    "&output=json";

  const apiRes = await fetch(url).catch(() => null);
  if (!apiRes) {
    return NextResponse.json({ error: "Servizio farmacie non raggiungibile" }, { status: 502 });
  }
  if (!apiRes.ok) {
    const detail = await apiRes.text();
    return NextResponse.json({ error: "Errore dal servizio farmacie", detail }, { status: 502 });
  }

  interface RawPharmacy {
    nome?: string;
    name?: string;
    ragionesociale?: string;
    indirizzo?: string;
    address?: string;
    telefono?: string;
    phone?: string;
    stato?: string;
    status?: string;
    aperta?: boolean;
    orario?: string;
    orari?: string;
    hours?: string;
    distanza?: number;
    distance?: number;
  }

  let raw: RawPharmacy[] | { farmacie?: RawPharmacy[]; result?: RawPharmacy[] };
  try {
    raw = await apiRes.json();
  } catch {
    return NextResponse.json({ error: "Risposta non valida dal servizio farmacie" }, { status: 502 });
  }

  const list: RawPharmacy[] = Array.isArray(raw) ? raw : raw.farmacie ?? raw.result ?? [];
  const pharmacies = list.slice(0, 8).map((p) => ({
    name: p.nome ?? p.name ?? p.ragionesociale ?? "",
    address: p.indirizzo ?? p.address ?? "",
    phone: p.telefono ?? p.phone ?? "",
    status: p.stato ?? p.status ?? (p.aperta ? "APERTA" : "TURNO"),
    hours: p.orario ?? p.orari ?? p.hours ?? "",
    distanceKm:
      p.distanza != null ? Number(p.distanza) : p.distance != null ? Number(p.distance) : null,
  }));

  return NextResponse.json({
    pharmacies,
    updatedAt: new Date().toISOString(),
    disclaimer:
      "Orari e turni sono soggetti a variazioni: verificare la bacheca esposta fuori dalla farmacia. Dati forniti da farmaciediturno.org.",
  });
}
