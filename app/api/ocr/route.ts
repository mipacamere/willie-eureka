import { NextRequest, NextResponse } from "next/server";
import { getProperty } from "@/config/properties";
import { checkAppToken } from "@/lib/api-auth";

/**
 * Porting di ocr-proxy.mjs (mipacompanion / vncompanion).
 * Stessa logica (Google Cloud Vision, DOCUMENT_TEXT_DETECTION), ma la
 * chiave API si sceglie in base alla struttura indicata nel body, cosí
 * ogni proprietà mantiene la propria soglia gratuita separata.
 */
export async function POST(request: NextRequest) {
  const denied = checkAppToken(request);
  if (denied) return denied;

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { image, property: propertySlug } = body as {
    image?: string;
    property?: string;
  };

  const property = propertySlug ? getProperty(propertySlug) : null;
  if (!property) {
    return NextResponse.json({ error: "Unknown property" }, { status: 400 });
  }

  const apiKey = process.env[property.env.ocrApiKeyVar];
  if (!apiKey) {
    return NextResponse.json(
      { error: `Missing ${property.env.ocrApiKeyVar}` },
      { status: 500 }
    );
  }

  const base64Image = image?.includes(",") ? image.split(",").pop() : image;
  if (!base64Image) {
    return NextResponse.json({ error: "Missing image" }, { status: 400 });
  }

  const visionRes = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requests: [
          {
            image: { content: base64Image },
            features: [{ type: "DOCUMENT_TEXT_DETECTION" }],
          },
        ],
      }),
    }
  ).catch(() => null);

  if (!visionRes || !visionRes.ok) {
    const detail = visionRes ? await visionRes.text() : "Vision API unreachable";
    return NextResponse.json({ error: "Vision API error", detail }, { status: 502 });
  }

  const data = await visionRes.json();
  const annotation = data.responses?.[0]?.fullTextAnnotation;
  const text: string = annotation?.text ?? "";
  const confidence: number | null =
    typeof annotation?.pages?.[0]?.confidence === "number"
      ? annotation.pages[0].confidence
      : null;

  return NextResponse.json({ text, confidence });
}
