/**
 * Porting della costante OCR_APP_TOKEN presente in app.js (mipacompanion/
 * vncompanion). NON è un segreto: essendo spedita al browser, chiunque
 * legga il codice la trova. Serve solo a scoraggiare bot generici che
 * bombardano gli endpoint senza nemmeno aver caricato la pagina — la vera
 * protezione contro l'abuso resta APP_SHARED_TOKEN lato server più,
 * eventualmente, un rate limiting a livello di infrastruttura.
 *
 * TODO: sostituire con il valore reale usato in produzione (deve
 * combaciare con APP_SHARED_TOKEN nelle env var del server).
 */
export const CLIENT_APP_TOKEN =
  process.env.NEXT_PUBLIC_APP_TOKEN ?? "mipa2026xk93";

export function withAppToken(headers: HeadersInit = {}): HeadersInit {
  return { ...headers, "X-App-Token": CLIENT_APP_TOKEN };
}
