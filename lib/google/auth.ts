import { createSign } from "node:crypto";

/**
 * Autenticazione account di servizio Google (JWT firmato RS256, scambiato
 * per un access token OAuth2). Porting di google-auth.mjs — nell'originale
 * la stessa identica logica viveva duplicata in sheet-reader.mjs (letta da
 * alloggiati-companion) e append-guest-sheet.mjs (mipacompanion/
 * vncompanion). Qui è un solo punto, usato da entrambi i flussi.
 */

export function normalizePrivateKey(raw: string | undefined): string {
  let key = (raw ?? "").trim();
  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1).trim();
  }
  key = key.replace(/\\r\\n/g, "\n").replace(/\\n/g, "\n");
  return key.trim();
}

export async function getGoogleAccessToken(
  clientEmail: string,
  privateKey: string,
  scope: string = "https://www.googleapis.com/auth/spreadsheets.readonly"
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claimSet = {
    iss: clientEmail,
    scope,
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };
  const base64url = (obj: object) =>
    Buffer.from(JSON.stringify(obj)).toString("base64url");
  const unsigned = `${base64url(header)}.${base64url(claimSet)}`;

  const signer = createSign("RSA-SHA256");
  signer.update(unsigned);
  signer.end();
  const signature = signer.sign(privateKey).toString("base64url");
  const jwt = `${unsigned}.${signature}`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  if (!tokenRes.ok) {
    throw new Error(`Token exchange failed: ${await tokenRes.text()}`);
  }
  const tokenData = await tokenRes.json();
  return tokenData.access_token as string;
}

export function getServiceAccountCredentials(): {
  spreadsheetId: string;
  sheetName: string;
  clientEmail: string;
  privateKey: string;
} {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID ?? "";
  const sheetName = process.env.GOOGLE_SHEET_NAME ?? "Sheet1";
  const clientEmail = process.env.GOOGLE_SA_EMAIL ?? "";
  const privateKey = normalizePrivateKey(process.env.GOOGLE_SA_PRIVATE_KEY);

  if (!spreadsheetId || !clientEmail || !privateKey) {
    throw Object.assign(
      new Error("Google Sheets non configurato sul server (variabili mancanti)"),
      { status: 500 }
    );
  }
  if (!privateKey.includes("BEGIN PRIVATE KEY")) {
    throw Object.assign(
      new Error(
        'GOOGLE_SA_PRIVATE_KEY non è in formato PEM valido: manca "-----BEGIN PRIVATE KEY-----". ' +
          "Controlla di aver incollato il valore del campo private_key del file JSON per intero."
      ),
      { status: 500 }
    );
  }
  return { spreadsheetId, sheetName, clientEmail, privateKey };
}
