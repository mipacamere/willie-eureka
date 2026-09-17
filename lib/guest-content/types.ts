export interface ServiceTranslation {
  title: string;
  note: string;
  waText: string;
}

export interface DirectionTranslation {
  title: string;
  desc: string;
}

export interface PropertyTranslation {
  greeting: string;
  philosophy: string[];
  entrySteps: string[];
  /** Stesso ordine di PropertyStructure.services */
  services: ServiceTranslation[];
  directions: {
    arrivalModes: DirectionTranslation[];
    departureModes: DirectionTranslation[];
  };
}
