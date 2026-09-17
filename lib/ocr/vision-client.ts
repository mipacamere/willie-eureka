import { withAppToken } from "@/lib/client-app-token";
import type { PropertySlug } from "@/config/properties";

export interface VisionOcrResult {
  text: string;
  confidence: number | null;
}

/**
 * Porting di callVisionOCR. Nell'originale chiamava direttamente
 * ocr-proxy.mjs (una function per struttura, stessa logica duplicata); qui
 * chiama /api/ocr (già portata), che sceglie la chiave Vision giusta in
 * base alla struttura passata — stesso comportamento, un solo endpoint.
 */
export async function callVisionOCR(
  dataUrl: string,
  property: PropertySlug
): Promise<VisionOcrResult> {
  let res: Response;
  try {
    res = await fetch("/api/ocr", {
      method: "POST",
      headers: withAppToken({ "Content-Type": "application/json" }),
      body: JSON.stringify({ image: dataUrl, property }),
    });
  } catch (networkErr) {
    const detail = `Rete: impossibile raggiungere /api/ocr (${(networkErr as Error).message})`;
    console.warn(detail);
    throw new Error(detail);
  }
  if (!res.ok) {
    const bodyText = await res.text().catch(() => "");
    const detail =
      `HTTP ${res.status} da /api/ocr` +
      (bodyText ? ` — ${bodyText.slice(0, 300)}` : "") +
      (res.status === 401 ? " (probabile disallineamento tra token client e APP_SHARED_TOKEN)" : "") +
      (res.status === 500 ? " (chiave OCR mancante lato server per questa struttura)" : "") +
      (res.status === 502 ? " (la chiamata a Google Vision è fallita: verifica la chiave e la fatturazione del progetto Google Cloud)" : "");
    console.warn("Vision proxy error:", detail);
    throw new Error(detail);
  }
  const json = await res.json();
  return {
    text: json.text || "",
    confidence: typeof json.confidence === "number" ? json.confidence : null,
  };
}
