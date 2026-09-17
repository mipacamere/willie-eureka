"use client";

import { ItineraryTranslation } from "@/lib/itinerary/types";
import { getStepStructure, FIRST_STEP_ID, ITINERARY_STRUCTURE } from "@/lib/itinerary/structure";

interface ItineraryStepViewProps {
  step: ItineraryTranslation | null;
  onNavigate: (id: string) => void;
  onBack: () => void;
  onHome: () => void;
  canGoBack: boolean;
}

export function ItineraryStepView({ step, onNavigate, onBack, onHome, canGoBack }: ItineraryStepViewProps) {
  if (!step) return null;

  const structure = getStepStructure(step.id);
  const currentIndex = ITINERARY_STRUCTURE.findIndex((s) => s.id === (structure?.id || ""));
  const progress = ((currentIndex + 1) / ITINERARY_STRUCTURE.length) * 100;

  return (
    <div className="min-h-screen bg-[#0e0d0b] text-[#e8e4dc] font-sans pb-32">
      {/* Header con Progress Bar */}
      <div className="sticky top-0 z-20 bg-[#0e0d0b]/90 backdrop-blur-md border-b border-[#387882]/30">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs uppercase tracking-[0.2em] text-[#5aa8a0] font-medium">
              Esploriamo Milazzo
            </span>
            <span className="text-xs text-[#7a7568]">
              {currentIndex + 1} / {ITINERARY_STRUCTURE.length}
            </span>
          </div>
          <div className="h-1 w-full bg-[#1a1815] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#387882] transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Contenuto Step */}
      <main className="max-w-2xl mx-auto px-4 py-8 animate-[fadeInUp_0.4s_ease-out]">
        {structure?.image && (
          <div className="mb-6 rounded-lg overflow-hidden border border-[#387882]/20 shadow-lg shadow-[#387882]/5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={structure.image.src} 
              alt={step.imageAlt || step.title} 
              className="w-full h-64 md:h-80 object-cover"
            />
          </div>
        )}
        
        <h1 className="font-serif text-3xl md:text-4xl font-light text-[#e8e4dc] mb-4 leading-tight">
          {step.title}
        </h1>
        
        {step.subtitle && (
          <p className="text-[#5aa8a0] text-lg font-medium mb-4">{step.subtitle}</p>
        )}

        {step.warning && (
          <div className="mb-6 p-4 bg-[#387882]/10 border border-[#387882]/30 rounded-lg text-[#5aa8a0] text-sm">
            {step.warning}
          </div>
        )}

        <div className="space-y-4 text-[#a5adb8] text-lg leading-relaxed font-light">
          {step.paragraphsHtml.map((p, i) => (
            <p key={i} dangerouslySetInnerHTML={{ __html: p }} />
          ))}
          
          {step.listHtml && (
            <ul className="list-disc list-inside space-y-2 mt-4 marker:text-[#387882]">
              {step.listHtml.map((item, i) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
              ))}
            </ul>
          )}
        </div>

        {/* Pulsanti Link Esterni (es. Mappe) */}
        {structure?.linkUrls && step.linkButtons && (
          <div className="mt-8 space-y-3">
            {step.linkButtons.map((btn, i) => (
              <a
                key={i}
                href={structure.linkUrls![i]}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between w-full p-4 bg-[#141210] border border-[#387882]/30 rounded-lg hover:bg-[#1a1815] hover:border-[#387882]/60 transition-all group"
              >
                <div className="text-left">
                  <div className="font-medium text-[#e8e4dc] group-hover:text-[#5aa8a0] transition-colors">{btn.title}</div>
                  <div className="text-sm text-[#7a7568]">{btn.description}</div>
                </div>
                <svg className="w-5 h-5 text-[#7a7568] group-hover:text-[#5aa8a0] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            ))}
          </div>
        )}
      </main>

      {/* Navigazione Fissa in Basso */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#141210] border-t border-[#ffffff0a] p-4 z-30">
        <div className="max-w-2xl mx-auto flex justify-between items-center gap-4">
          {canGoBack ? (
            <button
              onClick={onBack}
              className="flex-1 py-3 px-4 rounded-lg border border-[#387882]/30 text-[#e8e4dc] font-medium hover:bg-[#1a1815] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Indietro
            </button>
          ) : (
            <div className="flex-1" /> 
          )}
          
          {structure?.nextIds.length === 1 ? (
            <button
              onClick={() => onNavigate(structure.nextIds[0])}
              className="flex-1 py-3 px-4 rounded-lg bg-[#387882] text-white font-medium hover:bg-[#2d636b] transition-all shadow-lg shadow-[#387882]/20 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              Avanti
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          ) : structure?.nextIds.length > 1 ? (
            <div className="flex-1 grid grid-cols-2 gap-3">
              {structure.nextIds.map((nextId, i) => (
                <button
                  key={nextId}
                  onClick={() => onNavigate(nextId)}
                  className="py-3 px-2 rounded-lg bg-[#387882] text-white text-sm font-medium hover:bg-[#2d636b] transition-all shadow-lg shadow-[#387882]/20 active:scale-[0.98]"
                >
                  {step.buttonLabels?.[i] || `Opzione ${i + 1}`}
                </button>
              ))}
            </div>
          ) : (
            <button
              onClick={onHome}
              className="flex-1 py-3 px-4 rounded-lg bg-[#1a1815] text-[#e8e4dc] border border-[#387882]/30 font-medium hover:bg-[#22201d] transition-all active:scale-[0.98]"
            >
              Torna all'inizio
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp { 
          from { opacity: 0; transform: translateY(10px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
      `}</style>
    </div>
  );
}
