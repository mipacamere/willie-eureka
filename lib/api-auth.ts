import { NextRequest, NextResponse } from "next/server";

/**
 * Filtro leggero anti-abuso: token condiviso via header X-App-Token.
 * È un deterrente, non un vero segreto (chi legge il codice lo trova),
 * ma scoraggia bot generici. Stessa logica presente in ogni Netlify
 * Function originale, qui centralizzata in un unico punto.
 *
 * Restituisce una Response 401 se il token non combacia, altrimenti null
 * (via libera). APP_SHARED_TOKEN non impostata = controllo disattivato,
 * come nel comportamento originale.
 */
export function checkAppToken(request: NextRequest): NextResponse | null {
  const expected = process.env.APP_SHARED_TOKEN;
  if (!expected) return null;
  const provided = request.headers.get("X-App-Token");
  if (provided !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
