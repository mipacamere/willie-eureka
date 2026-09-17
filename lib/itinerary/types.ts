export interface ItineraryLinkButtonTranslation {
  title: string;
  description: string;
  buttonText: string;
}

export interface ItineraryTranslation {
  title: string;
  subtitle?: string;
  warning?: string;
  paragraphsHtml: string[];
  listHtml?: string[];
  imageAlt?: string;
  linkButtons?: ItineraryLinkButtonTranslation[];
  buttonLabels?: string[];
  // Campi per lo step 04itinerary (bivio A/B)
  optionATitle?: string;
  optionADescription?: string;
  optionAButton?: string;
  optionBTitle?: string;
  optionBDescription?: string;
  optionBButton?: string;
  finalNote?: string;
  callToAction?: string;
}
