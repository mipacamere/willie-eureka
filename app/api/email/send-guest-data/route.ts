import { NextRequest, NextResponse } from "next/server";
import { checkAppToken } from "@/lib/api-auth";
import type { GuestExportData } from "@/lib/google/sheets";

/**
 * Porting di send-guest-data.mjs. Invia i dati ospiti via email come
 * allegato JSON, usando Resend — canale di backup rispetto alla scrittura
 * diretta su Google Sheets (/api/guests/append).
 */
export async function POST(request: NextRequest) {
  const denied = checkAppToken(request);
  if (denied) return denied;

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const exportData: GuestExportData | undefined = body.exportData;
  const filename: string = body.filename ?? "export_alloggiati.json";
  if (!exportData || !Array.isArray(exportData.guests) || exportData.guests.length === 0) {
    return NextResponse.json({ error: "Missing or empty exportData" }, { status: 400 });
  }

  const jsonString = JSON.stringify(exportData, null, 2);
  const base64Content = Buffer.from(jsonString, "utf-8").toString("base64");

  const guestNames = exportData.guests
    .map((g) => (g.personal ? `${g.personal.lastName ?? ""} ${g.personal.firstName ?? ""}` : "—"))
    .join(", ");

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const SENDER_EMAIL = process.env.SENDER_EMAIL ?? "onboarding@resend.dev";
  const RECIPIENT_EMAIL = process.env.RECIPIENT_EMAIL;

  if (!RESEND_API_KEY || !RECIPIENT_EMAIL) {
    return NextResponse.json(
      { error: "Email non configurata sul server (RESEND_API_KEY o RECIPIENT_EMAIL mancanti)" },
      { status: 500 }
    );
  }

  const resendRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: SENDER_EMAIL,
      to: [RECIPIENT_EMAIL],
      subject: `Nuova pratica alloggiati (${exportData.guests.length} ospiti)`,
      text:
        `In allegato i dati ospiti raccolti dall'app.\n\nOspiti: ${guestNames}` +
        `\nData export: ${exportData.exportDate ?? ""}`,
      attachments: [{ filename, content: base64Content }],
    }),
  }).catch(() => null);

  if (!resendRes) {
    return NextResponse.json({ error: "Servizio email non raggiungibile" }, { status: 502 });
  }
  if (!resendRes.ok) {
    const detail = await resendRes.text();
    return NextResponse.json({ error: "Invio email fallito", detail }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
