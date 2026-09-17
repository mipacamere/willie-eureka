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
}
