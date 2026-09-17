import { NextRequest, NextResponse } from "next/server";
import { verifyAdminCredentials, verifyStaffCredentials } from "@/lib/auth/users";
import { createSessionToken, SESSION_COOKIE_MAX_AGE_SECONDS } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const { email, password, type } = body as { email?: string; password?: string; type?: string };
  if (!email || !password || (type !== "admin" && type !== "staff")) {
    return NextResponse.json({ error: "email, password e type (admin|staff) sono obbligatori" }, { status: 400 });
  }

  const result =
    type === "admin" ? await verifyAdminCredentials(email, password) : await verifyStaffCredentials(email, password);

  if (!result) {
    // Messaggio generico apposta: non riveliamo se è l'email o la password a essere sbagliata.
    return NextResponse.json({ error: "Credenziali non valide" }, { status: 401 });
  }

  const token = await createSessionToken({
    role: type,
    email: result.email,
    name: result.name,
    properties: result.properties,
  });

  const response = NextResponse.json({ ok: true, name: result.name });
  response.cookies.set(type === "admin" ? "admin_session" : "staff_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_COOKIE_MAX_AGE_SECONDS,
  });
  return response;
}
