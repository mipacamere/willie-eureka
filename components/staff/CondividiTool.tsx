"use client";

import { useEffect, useState } from "react";
import { GALLERY_GROUPS } from "@/lib/gallery/rooms";
import type { PropertySlug } from "@/config/properties";

/**
 * Porting di condividi_gallerie.html: un link copiabile/condivisibile
 * per ogni camera/appartamento, verso la galleria fotografica vera
 * (/guest/{token}/gallery?group=...&room=...). Usa il token pubblico
 * della struttura, non lo slug interno — stesso schema di link non
 * indovinabile usato per l'accesso ospiti in generale.
 */
export function CondividiTool({
  properties,
}: {
  properties: { slug: PropertySlug; name: string; token: string }[];
}) {
  const [toast, setToast] = useState<string | null>(null);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  async function copyLink(url: string) {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Clipboard API non disponibile: nessun fallback necessario in questo contesto interno
    }
    showToast("Link copiato negli appunti");
  }

  async function shareLink(url: string, title: string) {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
      }
    }
    await copyLink(url);
  }

  return (
    <div className="flex flex-col gap-6 pb-10">
      {properties.map((property) =>
        GALLERY_GROUPS[property.slug].map((group) => {
          const groupUrl = `${origin}/guest/${property.token}/gallery?group=${group.gallerySlug}`;
          return (
            <section key={`${property.slug}-${group.id}`}>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="font-medium">
                  {property.name} — {group.label}
                </h2>
                <span className="text-xs text-neutral-500">
                  {group.rooms.length} {group.rooms.length === 1 ? "spazio" : "spazi"}
                </span>
              </div>

              {/* Galleria cumulativa: tutte le foto del gruppo insieme, non divise per camera */}
              <div className="mb-2 rounded-lg border border-neutral-300 bg-neutral-50 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">📷 Tutte le foto insieme</span>
                  <a href={groupUrl} target="_blank" rel="noreferrer" className="text-xs text-neutral-500 underline">
                    Anteprima ↗
                  </a>
                </div>
                <p className="mt-1 truncate text-xs text-neutral-400" title={groupUrl}>
                  {groupUrl}
                </p>
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => copyLink(groupUrl)}
                    className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium"
                  >
                    Copia link
                  </button>
                  <button
                    onClick={() => shareLink(groupUrl, `${group.label} — Dormilazzo`)}
                    className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium"
                  >
                    Condividi
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {group.rooms.map((room) => {
                  const url = `${origin}/guest/${property.token}/gallery?group=${group.gallerySlug}&room=${room.id}`;
                  return (
                    <div key={room.id} className="rounded-lg border border-neutral-200 p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{room.label}</span>
                        <a href={url} target="_blank" rel="noreferrer" className="text-xs text-neutral-500 underline">
                          Anteprima ↗
                        </a>
                      </div>
                      <p className="mt-1 truncate text-xs text-neutral-400" title={url}>
                        {url}
                      </p>
                      <div className="mt-2 flex gap-2">
                        <button
                          onClick={() => copyLink(url)}
                          className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium"
                        >
                          Copia link
                        </button>
                        <button
                          onClick={() => shareLink(url, `${room.label} — Dormilazzo`)}
                          className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium"
                        >
                          Condividi
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-neutral-900 px-4 py-2 text-sm text-white">
          {toast}
        </div>
      )}
    </div>
  );
}
