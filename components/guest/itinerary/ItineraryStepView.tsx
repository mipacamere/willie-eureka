"use client";

import { ItineraryTranslation } from "@/lib/itinerary/types";
import { getStepStructure, FIRST_STEP_ID } from "@/lib/itinerary/structure";
import { GoogleMapButton } from "./GoogleMapButton";
import { NavigationButtons } from "./NavigationButtons";

interface ItineraryStepViewProps {
  currentId: string;
  step: ItineraryTranslation | null;
  onNavigate: (id: string) => void;
  backLabel: string;
  homeLabel: string;
}

export function ItineraryStepView({
  currentId,
  step,
  onNavigate,
  backLabel,
  homeLabel,
}: ItineraryStepViewProps) {
  if (!step) return null;

  const structure = getStepStructure(currentId);

  return (
    <div className="view-container">
      {currentId === "00intro" ? (
        <h1>{step.title}</h1>
      ) : (
        <h2>{step.title}</h2>
      )}

      {step.paragraphsHtml && step.paragraphsHtml.length > 0 && (
        <>
          {step.paragraphsHtml.map((p, i) => (
            <p key={i} dangerouslySetInnerHTML={{ __html: p }} />
          ))}
        </>
      )}

      {structure?.options && (
        <div className="options-container">
          {structure.options.map((option, i) => (
            <div key={option.nextId} className="option">
              <h3 dangerouslySetInnerHTML={{ __html: (step as any)[option.titleKey] || option.titleKey }} />
              <p dangerouslySetInnerHTML={{ __html: (step as any)[option.descriptionKey] || option.descriptionKey }} />
              <button
                className="option-button"
                onClick={() => onNavigate(option.nextId)}
              >
                {(step as any)[option.buttonKey] || option.buttonKey}
              </button>
            </div>
          ))}
        </div>
      )}

      {structure?.image && (
        <div className="image-container">
          <img
            src={structure.image.src}
            alt={step.imageAlt || step.title}
            className="main-image"
          />
        </div>
      )}

      {step.paragraphsHtml && step.paragraphsHtml.length > 1 && (
        <>
          {step.paragraphsHtml.slice(1).map((p, i) => (
            <p key={`after-img-${i}`} dangerouslySetInnerHTML={{ __html: p }} />
          ))}
        </>
      )}

      {currentId === "04itinerary" && (
        <>
          {(step as any).finalNote && (
            <p className="final-note" dangerouslySetInnerHTML={{ __html: (step as any).finalNote }} />
          )}
          {(step as any).callToAction && (
            <p className="call-to-action" dangerouslySetInnerHTML={{ __html: (step as any).callToAction }} />
          )}
        </>
      )}

      {structure?.linkUrls && step.linkButtons && step.linkButtons.length > 0 && (
        <>
          {step.linkButtons.map((btn, i) => (
            <GoogleMapButton
              key={i}
              title={btn.title}
              description={btn.description}
              mapUrl={structure.linkUrls![i]}
              buttonText={btn.buttonText}
            />
          ))}
        </>
      )}

      {structure?.nextIds && structure.nextIds.length === 1 && step.buttonLabels && step.buttonLabels.length > 0 && (
        <button className="main" onClick={() => onNavigate(structure.nextIds[0])}>
          {step.buttonLabels[0]}
        </button>
      )}

      <NavigationButtons
        showBack={structure?.showBack !== false && currentId !== FIRST_STEP_ID}
        onNavigateHome={() => onNavigate(FIRST_STEP_ID)}
        backLabel={backLabel}
        homeLabel={homeLabel}
      />
    </div>
  );
}
