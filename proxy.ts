import { NextRequest, NextResponse } from "next/server";
import { getPropertyByGuestToken } from "@/config/properties";
import { verifySessionToken } from "@/lib/auth/session";

/**
 * Punto unico di enforcement degli accessi.
 *
 * Regola: la UI può nascondere link, ma solo il middleware decide se una
 * richiesta passa. Tre aree, tre regole:
 *
 *  /guest/[token]/*  -> pubblica. Nessun login. Il primo segmento è un
 *                       token non indovinabile (non lo slug leggibile
 *                       "mipa"/"via-nazionale"): verifichiamo solo che
 *                       corrisponda a una struttura reale (altrimenti 404).
 *  /staff/*          -> richiede sessione valida con ruolo "staff" O
 *                       "admin" — l'admin vede tutto, quindi accede anche
 *                       alle pagine pensate per lo staff.
 *  /admin/*          -> richiede sessione valida con ruolo "admin" (lo
 *                       staff non può entrare qui).
 *
 * La sessione ospite (nome mostrato in app dopo lo scan documento) NON
 * passa da qui: è solo personalizzazione client-side, non un permesso.
 * Chi non ha fatto lo scan usa comunque l'area guest, senza dati
 * personalizzati.
 */

const STAFF_SESSION_COOKIE = "staff_session";
const ADMIN_SESSION_COOKIE = "admin_session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- Area ospiti: pubblica, ma solo per token validi ---
  const guestMatch = pathname.match(/^\/guest\/([^/]+)/);
  if (guestMatch) {
    const token = guestMatch[1];
    if (!getPropertyByGuestToken(token)) {
      return NextResponse.rewrite(new URL("/not-found", request.url));
    }
    return NextResponse.next();
  }

  // --- Area staff: richiede sessione staff O admin valida ---
  if (pathname.startsWith("/staff")) {
    const adminToken = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    const adminSession = await verifySessionToken(adminToken);
    if (adminSession?.role === "admin") return NextResponse.next();

    const staffToken = request.cookies.get(STAFF_SESSION_COOKIE)?.value;
    const staffSession = await verifySessionToken(staffToken);
    if (staffSession?.role === "staff") return NextResponse.next();

    const loginUrl = new URL("/login/staff", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
    // La restrizione per struttura (session.properties, solo per lo
    // staff) si applicherà quando l'area staff avrà contenuti scoped per
    // struttura, es. /staff/[property]/checklist — oggi /staff è unica e
    // non lo richiede.
  }

  // --- Area admin: richiede sessione admin valida ---
  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    const session = await verifySessionToken(token);
    if (!session || session.role !== "admin") {
      const loginUrl = new URL("/login/admin", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/guest/:path*", "/staff/:path*", "/admin/:path*"],
};
