/**
 * Porting di soap-alloggiati.mjs — client SOAP minimale (nessuna libreria
 * esterna) per il Web Service ufficiale WS_ALLOGGIATI della Polizia di
 * Stato: https://alloggiatiweb.poliziadistato.it/service/service.asmx
 */

const SERVICE_URL = "https://alloggiatiweb.poliziadistato.it/service/Service.asmx";

function xmlEscape(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function extractTag(xml: string, tag: string): string | null {
  const m = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`));
  return m ? m[1] : null;
}

function extractAllTags(xml: string, tag: string): string[] {
  const re = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, "g");
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml))) out.push(m[1]);
  return out;
}

async function soapCall(action: string, bodyXml: string): Promise<string> {
  const envelope =
    '<?xml version="1.0" encoding="utf-8"?>' +
    '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
    'xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">' +
    "<soap:Body>" +
    bodyXml +
    "</soap:Body></soap:Envelope>";

  const res = await fetch(SERVICE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      SOAPAction: `"AlloggiatiService/${action}"`,
    },
    body: envelope,
  });
  const text = await res.text();
  if (!res.ok) {
    throw Object.assign(new Error(`SOAP HTTP ${res.status}: ${text.slice(0, 500)}`), {
      status: 502,
    });
  }
  return text;
}

/** Ottiene un token temporaneo usando le credenziali dell'account + WsKey. */
export async function generateToken(
  utente: string,
  password: string,
  wskey: string
): Promise<string> {
  const body =
    '<GenerateToken xmlns="AlloggiatiService">' +
    `<Utente>${xmlEscape(utente)}</Utente>` +
    `<Password>${xmlEscape(password)}</Password>` +
    `<WsKey>${xmlEscape(wskey)}</WsKey>` +
    "</GenerateToken>";
  const xml = await soapCall("GenerateToken", body);

  const errore = extractTag(xml, "ErroreDettaglio");
  const token = extractTag(xml, "token") ?? extractTag(xml, "Token");
  if (!token) {
    throw Object.assign(
      new Error(
        `Token non ottenuto${errore ? `: ${errore}` : " (risposta inattesa dal servizio)"}`
      ),
      { status: 502 }
    );
  }
  return token;
}

export interface EsitoRiga {
  riga: number;
  errore: string;
}

export interface EsitoSchedine {
  topLevelError: string;
  schedineValide: number | null;
  totaleRighe: number;
  perRiga: EsitoRiga[];
}

function parseEsitoResponse(xml: string, righe: string[]): EsitoSchedine {
  const resultTag = extractTag(xml, "TestResult") !== null ? "TestResult" : "SendResult";
  const topBlock = extractTag(xml, resultTag) ?? "";
  const topLevelError = extractTag(topBlock, "ErroreDettaglio") ?? "";

  const resultBlock = extractTag(xml, "result") ?? xml;
  const schedineValideMatch = resultBlock.match(/<SchedineValide>(\d+)<\/SchedineValide>/);
  const schedineValide = schedineValideMatch ? parseInt(schedineValideMatch[1], 10) : null;

  const dettaglioBlock = extractTag(resultBlock, "Dettaglio") ?? "";
  const esiti = extractAllTags(dettaglioBlock, "EsitoOperazioneServizio");
  const perRiga: EsitoRiga[] = esiti.map((esitoXml, i) => ({
    riga: i + 1,
    errore: (extractTag(esitoXml, "ErroreDettaglio") ?? "").trim(),
  }));

  return { topLevelError, schedineValide, totaleRighe: righe.length, perRiga };
}

/** Convalida (Test): NON invia realmente le schedine. */
export async function testSchedine(
  utente: string,
  token: string,
  righe: string[]
): Promise<EsitoSchedine> {
  const schedineXml = righe.map((r) => `<string>${xmlEscape(r)}</string>`).join("");
  const body =
    '<Test xmlns="AlloggiatiService">' +
    `<Utente>${xmlEscape(utente)}</Utente>` +
    `<token>${xmlEscape(token)}</token>` +
    `<ElencoSchedine>${schedineXml}</ElencoSchedine>` +
    "</Test>";
  const xml = await soapCall("Test", body);
  return parseEsitoResponse(xml, righe);
}

/** Invio reale (Send): usare solo dopo conferma esplicita dell'operatore. */
export async function sendSchedine(
  utente: string,
  token: string,
  righe: string[]
): Promise<EsitoSchedine> {
  const schedineXml = righe.map((r) => `<string>${xmlEscape(r)}</string>`).join("");
  const body =
    '<Send xmlns="AlloggiatiService">' +
    `<Utente>${xmlEscape(utente)}</Utente>` +
    `<token>${xmlEscape(token)}</token>` +
    `<ElencoSchedine>${schedineXml}</ElencoSchedine>` +
    "</Send>";
  const xml = await soapCall("Send", body);
  return parseEsitoResponse(xml, righe);
}
