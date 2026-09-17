import { NextRequest, NextResponse } from "next/server";
import { checkAppToken } from "@/lib/api-auth";
import { appendGuests, type GuestExportData } from "@/lib/google/sheets";

/**
 * Porting di append-guest-sheet.mjs. Chiamata dalla companion app ospiti
 * dopo lo scan del documento (onboarding opzionale): scrive i dati sul
 * Google Sheet condiviso. Body: { exportData: GuestExportData }.
 */
export async function POST(request: NextRequest) {
  const denied = checkAppToken(request);
  if (denied) return denied;

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const exportData: GuestExportData | undefined = body.exportData;
  if (!exportData || !Array.isArray(exportData.guests) || exportData.guests.length === 0) {
    return NextResponse.json({ error: "Missing or empty exportData" }, { status: 400 });
  }

  try {
    const result = await appendGuests(exportData);
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    const err = e as Error & { status?: number };
    return NextResponse.json({ error: err.message ?? String(e) }, { status: err.status ?? 502 });
  }
}
