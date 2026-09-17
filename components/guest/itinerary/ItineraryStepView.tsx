"use client";

import type { ItineraryStep } from "@/lib/itinerary/locales";
import { GoogleMapButton } from "./GoogleMapButton";
import { NavigationButtons } from "./NavigationButtons";

interface ItineraryStepViewProps {
  currentId: string;
  step: ItineraryStep;
  onNavigate: (id: string) => void;
  onBack: () => void;
  backLabel: string;
  homeLabel: string;
}

const OPTION_TARGETS: Record<string, [string, string]> = {
  "04itinerary": ["05AcapoMilazzoDirections", "05BspiaggiaPonente"],
};

export function ItineraryStepView({
  currentId,
  step,
  onNavigate,
  onBack,
  backLabel,
  homeLabel,
}: ItineraryStepViewProps) {
  const isIntro = currentId === "00intro";
  const isChoice = currentId === "04itinerary";
  const optionTargets = OPTION_TARGETS[currentId];

  return (
    <div className="view-container">
      {isIntro ? <h1>{step.title}</h1> : <h2>{step.title}</h2>}

      {step.paragraphsHtml.map((p, i) => (
        <p key={i} dangerouslySetInnerHTML={{ __html: p }} />
      ))}

      {step.listHtml && step.listHtml.length > 0 && (
        <ul>
          {step.listHtml.map((li, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: li }} />
          ))}
        </ul>
      )}

      {/* Bivio A/B (solo 04itinerary) */}
      {isChoice && optionTargets && (
        <div className="options-container">
          <div className="option">
            <h3>{step.optionATitle}</h3>
            <p>{step.optionADescription}</p>
            <button className="option-button" onClick={() => onNavigate(optionTargets[0])}>
              {step.optionAButton}
            </button>
          </div>
          <div className="option">
            <h3>{step.optionBTitle}</h3>
            <p>{step.optionBDescription}</p>
            <button className="option-button" onClick={() => onNavigate(optionTargets[1])}>
              {step.optionBButton}
            </button>
          </div>
        </div>
      )}

      {step.image && (
        <div className="image-container">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={step.image.src} alt={step.image.alt} className="main-image" />
        </div>
      )}

      {isChoice && step.finalNote && (
        <p className="final-note" dangerouslySetInnerHTML={{ __html: step.finalNote }} />
      )}
      {isChoice && step.callToAction && (
        <p className="call-to-action" dangerouslySetInnerHTML={{ __html: step.callToAction }} />
      )}

      {step.linkButtons?.map((btn, i) => (
        <GoogleMapButton
          key={i}
          title={btn.title}
          description={btn.description}
          mapUrl={btn.url}
          buttonText={btn.buttonText}
        />
      ))}

      {/* Pulsanti principali (Avanti / scelte multiple) */}
      {!isChoice &&
        step.buttons.map((b) => (
          <button key={b.nextId} className="main" onClick={() => onNavigate(b.nextId)}>
            {b.label}
          </button>
        ))}

      {/* Navigazione Indietro / Torna all'inizio (assente solo nell'intro) */}
      {!isIntro && (
        <NavigationButtons
          showBack={step.showBack !== false}
          onBack={onBack}
          onNavigateHome={() => onNavigate("00intro")}
          backLabel={backLabel}
          homeLabel={homeLabel}
        />
      )}
    </div>
  );
}
