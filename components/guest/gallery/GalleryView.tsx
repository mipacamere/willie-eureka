"use client";

import { useState, useEffect } from "react";

export function GalleryView({ title, photos }: { title: string; photos: string[] }) {
  const [broken, setBroken] = useState<Set<string>>(new Set());
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const visible = photos.filter((url) => !broken.has(url));

  function markBroken(url: string) {
    setBroken((prev) => new Set(prev).add(url));
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowRight") {
        setLightboxIndex((prev) => (prev !== null && prev < visible.length - 1 ? prev + 1 : prev));
      }
      if (e.key === "ArrowLeft") {
        setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : prev));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, visible.length]);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 font-sans">
      <header className="mb-8 text-center">
        <h1 className="font-serif text-3xl md:text-4xl font-light text-[#e8e4dc] mb-2">{title}</h1>
        <p className="text-[#7a7568] text-sm uppercase tracking-[0.15em]">Tocca un'immagine per ingrandirla</p>
      </header>

      {photos.length === 0 || visible.length === 0 ? (
        <div className="rounded-lg bg-[#141210] border border-[#ffffff0a] p-8 text-center text-[#7a7568]">
          Nessuna foto disponibile per questo spazio.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
          {photos.map((url, i) =>
            broken.has(url) ? null : (
              <button
                key={url}
                onClick={() => setLightboxIndex(visible.indexOf(url))}
                className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-[#ffffff0a] bg-[#141210] transition-all duration-300 hover:border-[#387882]/50 hover:shadow-lg hover:shadow-[#387882]/10 active:scale-[0.98]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`${title} — foto ${i + 1}`}
                  loading="lazy"
                  onError={() => markBroken(url)}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </div>
              </button>
            )
          )}
        </div>
      )}

      {lightboxIndex !== null && visible[lightboxIndex] && (
        <div
          className="fixed inset-0 z-50 bg-[#0e0d0b]/95 backdrop-blur-md flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute right-4 top-4 p-2 text-[#7a7568] hover:text-white transition-colors z-50"
            aria-label="Chiudi"
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="relative max-w-5xl w-full max-h-[85vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            {lightboxIndex > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); setLightboxIndex((i) => (i !== null ? i - 1 : i)); }}
                className="absolute left-2 md:-left-16 p-3 bg-black/40 hover:bg-[#387882]/80 text-white rounded-full backdrop-blur-md transition-all"
                aria-label="Precedente"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
            )}
            
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={visible[lightboxIndex]}
              alt=""
              className="max-h-[85vh] max-w-full object-contain rounded-md shadow-2xl animate-[zoomIn_0.3s_ease-out]"
            />
            
            {lightboxIndex < visible.length - 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); setLightboxIndex((i) => (i !== null ? i + 1 : i)); }}
                className="absolute right-2 md:-right-16 p-3 bg-black/40 hover:bg-[#387882]/80 text-white rounded-full backdrop-blur-md transition-all"
                aria-label="Successiva"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            )}
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[#7a7568] text-sm font-medium tracking-wider">
            {lightboxIndex + 1} / {visible.length}
          </div>
        </div>
      )}
      
      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes zoomIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
    </main>
  );
}
