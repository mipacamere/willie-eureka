"use client";

import { useState } from "react";
import { properties } from "@/config/properties";
import { LogoutButton } from "@/components/auth/LogoutButton";

export default function AdminPosizioniPage() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const propertyList = Object.values(properties);

  const copyToClipboard = async (url: string, index: number) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error("Errore nella copia:", err);
    }
  };

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-medium">Gestione Posizioni Strutture</h1>
        <LogoutButton type="admin" />
      </div>
      <p className="text-neutral-600 mb-8">
        Link diretti e QR code per la condivisione con gli ospiti. Modifica le coordinate in <code className="bg-neutral-100 px-1 rounded">config/properties.ts</code> se necessario.
      </p>

      <div className="space-y-6">
        {propertyList.map((p, index) => (
          <div key={p.slug} className="rounded-xl border border-neutral-200 p-6 bg-white shadow-sm">
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              
              {/* Info Struttura */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.theme.primary }} />
                  <h2 className="text-lg font-semibold">{p.displayName}</h2>
                </div>
                <p className="text-sm text-neutral-600 mb-4">{p.location.address}</p>
                
                <div className="flex flex-wrap gap-3">
                  <a
                    href={p.location.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-all active:scale-[0.98] hover:opacity-90"
                    style={{ backgroundColor: p.theme.primary }}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Apri in Google Maps
                  </a>
                  
                  <button
                    onClick={() => copyToClipboard(p.location.mapsUrl, index)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-neutral-300 text-neutral-700 font-medium hover:bg-neutral-50 transition-all active:scale-[0.98]"
                  >
                    {copiedIndex === index ? (
                      <>
                        <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Copiato!
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copia link
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center md:items-end">
                <div className="bg-white p-3 rounded-lg border border-neutral-200 shadow-sm">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(p.location.mapsUrl)}`}
                    alt={`QR Code ${p.name}`}
                    className="w-32 h-32"
                  />
                </div>
                <p className="text-xs text-neutral-500 mt-2 text-center md:text-right max-w-[160px]">
                  Stampa questo QR code per la reception
                </p>
              </div>

            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
