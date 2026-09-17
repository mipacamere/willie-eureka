/**
 * Porting di regione-sicilia.mjs — client per il Web-API REST
 * dell'Osservatorio Turistico della Regione Siciliana (piattaforma
 * Turist@t), usato per l'invio dei dati statistici ISTAT sul movimento dei
 * clienti. Riferimento: "Sistema Informativo Osservatorio Turistico
 * Regione Siciliana — Protocollo di Comunicazione PMS", rev. 1.0.7.
 *
 * Usa solo Login + addfrompms (nuovo soggiorno) + Logout, come
 * nell'originale.
 */

const BASE_URL = "https://osservatorioturistico.regione.sicilia.it/webapi/api";

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

/**
 * Estrae tutti i blocchi di primo livello con questo nome, rispettando la
 * profondità di annidamento (ValidationResultDTO può contenerne altri
 * omonimi dentro NestedValidation).
 */
function extractBalancedBlocks(xml: string, tag: string): string[] {
  const openTag = `<${tag}>`;
  const closeTag = `</${tag}>`;
  const blocks: string[] = [];
  let pos = 0;
  while (pos < xml.length) {
    const start = xml.indexOf(openTag, pos);
    if (start === -1) break;
    let depth = 1;
    let cursor = start + openTag.length;
    while (depth > 0) {
      const nextOpen = xml.indexOf(openTag, cursor);
      const nextClose = xml.indexOf(closeTag, cursor);
      if (nextClose === -1) {
        cursor = xml.length;
        depth = 0;
        break;
      }
      if (nextOpen !== -1 && nextOpen < nextClose) {
        depth++;
        cursor = nextOpen + openTag.length;
      } else {
        depth--;
        cursor = nextClose + closeTag.length;
      }
    }
    const contentEnd = Math.max(start + openTag.length, cursor - closeTag.length);
    blocks.push(xml.slice(start + openTag.length, contentEnd));
    pos = cursor;
  }
  return blocks;
}

/** Login: recupera il token Bearer con le credenziali PMS della struttura. */
export async function loginRegione(userId: string, password: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "GET",
    headers: { UserId: userId, Password: password },
  });
  const bodyText = await res.text().catch(() => "");
  if (!res.ok) {
    throw Object.assign(
      new Error(`Login Regione Sicilia fallito (HTTP ${res.status}): ${bodyText.slice(0, 300)}`),
      { status: res.status === 401 ? 401 : 502 }
    );
  }
  let token = res.headers.get("authorization") ?? res.headers.get("Authorization");
  if (!token && bodyText) {
    token = bodyText.trim().replace(/^"+|"+$/g, "");
  }
  if (!token) {
    throw Object.assign(
      new Error("Token non ottenuto dal login Regione Sicilia (risposta inattesa dal servizio)"),
      { status: 502 }
    );
  }
  return token.startsWith("Bearer ") ? token : `Bearer ${token}`;
}

/** Logout best-effort: non deve mai far fallire l'operazione principale. */
export async function logoutRegione(userId: string, token: string): Promise<void> {
  try {
    await fetch(`${BASE_URL}/auth/logout`, {
      method: "POST",
      headers: { UserId: userId, Authorization: token },
    });
  } catch {
    // best-effort, vedi commento sopra
  }
}

export interface RoomInput {
  roomId: string;
  startDate: string;
  endDate: string;
}

export interface StayInput {
  stayId: string;
  guestId: string;
  age: string | number;
  nationalityCode: string;
  birthPlaceCode: string;
  residencePlaceCode: string;
  type: string;
  gender: string;
  email?: string;
  arrivalDate: string;
  departureDate: string;
  checkout?: boolean;
  bedOccupancy?: boolean;
  rooms?: RoomInput[];
}

function buildRoomXml(room: RoomInput): string {
  return (
    "<Room>" +
    `<RoomId>${xmlEscape(room.roomId)}</RoomId>` +
    `<StartDate>${xmlEscape(room.startDate)}</StartDate>` +
    `<EndDate>${xmlEscape(room.endDate)}</EndDate>` +
    "</Room>"
  );
}

function buildStayXml(stay: StayInput, hotelCode: string): string {
  const roomsXml = (stay.rooms ?? []).map(buildRoomXml).join("");
  return (
    "<Stay>" +
    `<StayId>${xmlEscape(stay.stayId)}</StayId>` +
    `<HotelCode>${xmlEscape(hotelCode)}</HotelCode>` +
    "<Guests><Guest>" +
    `<GuestId>${xmlEscape(stay.guestId)}</GuestId>` +
    `<Age>${xmlEscape(stay.age)}</Age>` +
    `<NationalityCode>${xmlEscape(stay.nationalityCode)}</NationalityCode>` +
    `<BirthPlaceCode>${xmlEscape(stay.birthPlaceCode)}</BirthPlaceCode>` +
    `<ResidencePlaceCode>${xmlEscape(stay.residencePlaceCode)}</ResidencePlaceCode>` +
    `<Type>${xmlEscape(stay.type)}</Type>` +
    `<Gender>${xmlEscape(stay.gender)}</Gender>` +
    `<EMail>${xmlEscape(stay.email ?? "")}</EMail>` +
    `<ArrivalDate>${xmlEscape(stay.arrivalDate)}</ArrivalDate>` +
    `<DepartureDate>${xmlEscape(stay.departureDate)}</DepartureDate>` +
    `<Checkout>${stay.checkout ? "true" : "false"}</Checkout>` +
    `<BedOccupancy>${stay.bedOccupancy ? "true" : "false"}</BedOccupancy>` +
    `<Rooms>${roomsXml}</Rooms>` +
    "</Guest></Guests>" +
    "</Stay>"
  );
}

export interface ValidationResult {
  objectType: string;
  objectId: string;
  isValid: boolean;
  messages: {
    level: string;
    code: string;
    message: string;
    fieldName: string;
    fieldValue: string;
  }[];
  nested: ValidationResult[];
}

function parseValidationResult(block: string): ValidationResult {
  const objectType = extractTag(block, "ObjectType") ?? "";
  const objectId = extractTag(block, "ObjectId") ?? "";
  const isValid = (extractTag(block, "IsValid") ?? "").trim() === "true";

  const messagesBlock = extractBalancedBlocks(block, "Messages")[0] ?? "";
  const messages = extractBalancedBlocks(messagesBlock, "ValidationMessageDTO").map((m) => ({
    level: extractTag(m, "Level") ?? "",
    code: extractTag(m, "Code") ?? "",
    message: extractTag(m, "Message") ?? "",
    fieldName: extractTag(m, "FieldName") ?? "",
    fieldValue: extractTag(m, "FieldValue") ?? "",
  }));

  const nestedBlock = extractBalancedBlocks(block, "NestedValidation")[0] ?? "";
  const nested = extractBalancedBlocks(nestedBlock, "ValidationResultDTO").map(
    parseValidationResult
  );

  return { objectType, objectId, isValid, messages, nested };
}

/** Invia un elenco di nuovi soggiorni tramite /stay/addfrompms. */
export async function sendStaysToRegione(
  hotelCode: string,
  token: string,
  stays: StayInput[]
): Promise<{
  httpStatus: number;
  tuttiValidi: boolean;
  risultati: ValidationResult[];
  totaleInviati: number;
}> {
  const staysXml = stays.map((s) => buildStayXml(s, hotelCode)).join("");
  const body = `<?xml version="1.0" encoding="utf-8" ?><StaysPmsDTO>${staysXml}</StaysPmsDTO>`;

  const res = await fetch(`${BASE_URL}/stay/addfrompms`, {
    method: "POST",
    headers: { "Content-Type": "text/xml; charset=utf-8", Authorization: token },
    body,
  });
  const text = await res.text().catch(() => "");

  if (res.status !== 200 && res.status !== 400) {
    throw Object.assign(new Error(`Regione Sicilia — HTTP ${res.status}: ${text.slice(0, 500)}`), {
      status: 502,
    });
  }

  const risultati = extractBalancedBlocks(text, "ValidationResultDTO").map(
    parseValidationResult
  );
  const tuttiValidi = risultati.length ? risultati.every((r) => r.isValid) : res.status === 200;

  return { httpStatus: res.status, tuttiValidi, risultati, totaleInviati: stays.length };
}
