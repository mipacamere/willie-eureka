import type { PropertySlug } from "@/config/properties";

/**
 * Dati per struttura che NON cambiano con la lingua: wifi, contatti, URL
 * mappe, icone. I testi (saluto, filosofia, istruzioni, servizi,
 * direzioni) vivono in locales/*.ts, uniti a questi dati da
 * getGuestContent().
 */

export interface DirectionIcon {
  icon: string;
  color: string;
}

export interface ServiceIcon {
  emoji: string;
  price: string;
}

export interface PropertyStructure {
  slug: PropertySlug;
  wifi: { ssid: string; password: string };
  address: string;
  checkinHours: string;
  checkoutHours: string;
  phone: string;
  phoneDisplay: string;
  email: string;
  whatsappUrl: string;
  mapPlaceUrl: string;
  beachMapsUrl: string;
  roomMapsUrl: string;
  /** Icone dei servizi, nello stesso ordine delle traduzioni corrispondenti. */
  services: ServiceIcon[];
  directions: {
    arrivalModes: DirectionIcon[];
    departureModes: DirectionIcon[];
  };
}

const SHARED_DIRECTION_ICONS = {
  arrivalModes: [
    { icon: "directions_car", color: "#4f7d65" },
    { icon: "train", color: "#0284c7" },
    { icon: "directions_bus", color: "#d97706" },
  ],
  departureModes: [
    { icon: "directions_car", color: "#4f7d65" },
    { icon: "directions_bus", color: "#d97706" },
    { icon: "train", color: "#0284c7" },
    { icon: "flight", color: "#7c3aed" },
  ],
};

const SHARED_SERVICE_ICONS: ServiceIcon[] = [
  { emoji: "🚲", price: "Da €10 / giorno" },
  { emoji: "🤿", price: "Da €60 / persona" },
  { emoji: "⛵", price: "Da €40 / persona" },
  { emoji: "🛥️", price: "Da €100 / persona" },
];

export const PROPERTY_STRUCTURE: Record<PropertySlug, PropertyStructure> = {
  mipa: {
    slug: "mipa",
    wifi: { ssid: "MiPA_guests", password: "viaS.Giovanni/42" },
    address: "Via San Giovanni 42, Milazzo (ME)",
    checkinHours: "15:00 – 22:00",
    checkoutHours: "Entro le 10:30",
    phone: "+393339201524",
    phoneDisplay: "+39 333 920 1524",
    email: "studiosmipa@gmail.com",
    whatsappUrl: "https://wa.me/393339201524",
    mapPlaceUrl: "https://www.google.com/maps/place/Via+San+Giovanni,+42+Milazzo",
    beachMapsUrl: "https://maps.app.goo.gl/G46mBB57DWUAXYkQ6",
    roomMapsUrl: "https://maps.app.goo.gl/Xqsaxxd7Bf8bK8hcA",
    services: SHARED_SERVICE_ICONS,
    directions: SHARED_DIRECTION_ICONS,
  },
  "via-nazionale": {
    slug: "via-nazionale",
    wifi: { ssid: "B&B Via Nazionale", password: "BBViaNazionale!16" },
    address: "Via Archi Nazionale 16, San Filippo del Mela (ME)",
    checkinHours: "15:00 – 22:00",
    checkoutHours: "Entro le 10:30",
    phone: "+393339201524",
    phoneDisplay: "+39 333 920 1524",
    email: "info.vianazionale@gmail.com",
    whatsappUrl: "https://wa.me/393339201524",
    mapPlaceUrl: "https://www.google.com/maps/place/Via+San+Giovanni,+42+Milazzo",
    beachMapsUrl: "https://maps.app.goo.gl/G46mBB57DWUAXYkQ6",
    roomMapsUrl: "https://maps.app.goo.gl/JjMHfUL9ynPHp5zo6",
    services: SHARED_SERVICE_ICONS,
    directions: SHARED_DIRECTION_ICONS,
  },
};
