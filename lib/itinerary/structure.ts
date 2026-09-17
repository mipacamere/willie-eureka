/**
 * Struttura dell'itinerario: id, ordine dei pulsanti (verso quale step
 * portano), immagini, URL dei pulsanti mappa/link. Nulla qui cambia con
 * la lingua — i testi vivono in locales/*.ts, uniti a questa struttura
 * da getItineraryStep().
 */

export interface StepImage {
  src: string;
  external?: boolean;
}

export interface StepStructure {
  id: string;
  image?: StepImage;
  /** URL dei pulsanti mappa/link, nello stesso ordine delle relative traduzioni. */
  linkUrls?: string[];
  /** id dello step successivo per ciascun pulsante, nello stesso ordine delle relative etichette tradotte. */
  nextIds: string[];
  showBack?: boolean;
}

export const ITINERARY_STRUCTURE: StepStructure[] = [
  {
    id: "00intro",
    image: { src: "/images/itinerary/fotointro.jpeg" },
    nextIds: ["01arrival"],
    showBack: false,
  },
  {
    id: "01arrival",
    nextIds: ["03breakfast", "02directions"],
  },
  {
    id: "02directions",
    image: { src: "/images/itinerary/ultimo-treno-750x400.jpg" },
    nextIds: ["03breakfast"],
  },
  {
    id: "03breakfast",
    image: { src: "/images/itinerary/granitaebrioche.jpg" },
    nextIds: ["04itinerary"],
  },
  {
    id: "04itinerary",
    image: { src: "/images/itinerary/itinerario.jpeg" },
    nextIds: ["05AcapoMilazzoDirections", "05BspiaggiaPonente"],
  },
  {
    id: "05AcapoMilazzoDirections",
    image: { src: "/images/itinerary/arrivocapomilazzo.jpg" },
    linkUrls: ["https://maps.app.goo.gl/BhhYJJpnSUQNdQuB9"],
    nextIds: ["06AcapoMilazzo"],
  },
  {
    id: "06AcapoMilazzo",
    image: { src: "/images/itinerary/arrivaticapomilazzo.jpg" },
    nextIds: ["07AvenusPool"],
  },
  {
    id: "07AvenusPool",
    image: { src: "/images/itinerary/sentieropiscina.jpg" },
    linkUrls: ["https://maps.app.goo.gl/bP54nK5SqWxUM5Jx7"],
    nextIds: ["08AislandsPanorama"],
  },
  {
    id: "08AislandsPanorama",
    nextIds: ["09AborgoAntico"],
  },
  {
    id: "09AborgoAntico",
    nextIds: ["10AlunchBorgo"],
  },
  {
    id: "10AlunchBorgo",
    nextIds: ["11Acastle"],
  },
  {
    id: "11Acastle",
    image: { src: "https://upload.wikimedia.org/wikipedia/commons/6/60/Milazzo_castello%2C_panorama_03.jpg", external: true },
    linkUrls: ["https://www.google.it/maps/place/Castello+di+Milazzo"],
    nextIds: ["12Aafternoon"],
  },
  {
    id: "12Aafternoon",
    image: { src: "https://upload.wikimedia.org/wikipedia/commons/e/e3/Milazzo_-_spiaggia_di_ponente.jpg", external: true },
    linkUrls: ["https://maps.app.goo.gl/P69Ja7icyirfsVGC6"],
    nextIds: ["13AtonoBay"],
  },
  {
    id: "13AtonoBay",
    image: { src: "https://upload.wikimedia.org/wikipedia/commons/5/5d/Baia_del_Tono_Milazzo.jpg", external: true },
    linkUrls: ["https://maps.app.goo.gl/bP54nK5SqWxUM5Jx7"],
    nextIds: ["14AbeachTime"],
  },
  {
    id: "14AbeachTime",
    image: { src: "https://upload.wikimedia.org/wikipedia/commons/e/e4/Spiaggia_di_Ponente_Milazzo.jpg", external: true },
    nextIds: ["15AattivitaSpiaggia"],
  },
  {
    id: "15AattivitaSpiaggia",
    image: { src: "https://upload.wikimedia.org/wikipedia/commons/d/d7/Capo_Milazzo_%28ME%29_-_Area_Marina_Protetta.jpg", external: true },
    linkUrls: ["https://maps.app.goo.gl/bP54nK5SqWxUM5Jx7"],
    nextIds: ["16AtramontoTono"],
  },
  {
    id: "16AtramontoTono",
    nextIds: ["17ArientroCentro"],
  },
  {
    id: "17ArientroCentro",
    linkUrls: ["https://www.google.com/maps/dir/?api=1&destination=38.22139358253553,15.24303142010567"],
    nextIds: ["19cena"],
  },
  {
    id: "05BspiaggiaPonente",
    image: { src: "https://upload.wikimedia.org/wikipedia/commons/e/e4/Spiaggia_di_Ponente_Milazzo.jpg", external: true },
    linkUrls: ["https://www.google.com/maps/dir/?api=1&destination=38.244536652950124,15.241761685781448"],
    nextIds: ["06BlidoSpiaggia"],
  },
  {
    id: "06BlidoSpiaggia",
    image: { src: "https://upload.wikimedia.org/wikipedia/commons/1/1a/Baia_del_Tono_Milazzo.jpg", external: true },
    linkUrls: ["https://maps.app.goo.gl/bP54nK5SqWxUM5Jx7"],
    nextIds: ["07BtempoSpiaggia"],
  },
  {
    id: "07BtempoSpiaggia",
    image: { src: "https://upload.wikimedia.org/wikipedia/commons/e/ec/La_Spiaggia_di_Ponente_a_Milazzo.jpg", external: true },
    linkUrls: ["https://maps.app.goo.gl/yXKCHSoBy88C1mZr6", "https://maps.app.goo.gl/bP54nK5SqWxUM5Jx7"],
    nextIds: ["08BattivitaAcquatiche"],
  },
  {
    id: "08BattivitaAcquatiche",
    image: { src: "https://upload.wikimedia.org/wikipedia/commons/5/5a/Capo_Milazzo_-_Area_Marina_Protetta.jpg", external: true },
    linkUrls: ["https://maps.app.goo.gl/bP54nK5SqWxUM5Jx7"],
    nextIds: ["09Bpranzo"],
  },
  {
    id: "09Bpranzo",
    image: { src: "https://upload.wikimedia.org/wikipedia/commons/1/1a/Baia_del_Tono_Milazzo.jpg", external: true },
    nextIds: ["10Bpomeriggio"],
  },
  {
    id: "10Bpomeriggio",
    image: { src: "https://upload.wikimedia.org/wikipedia/commons/8/88/Borgo_antico_Milazzo.jpg", external: true },
    linkUrls: ["https://maps.app.goo.gl/CjvJv9UYSLeXToaA8"],
    nextIds: ["11BborgoAntico"],
  },
  {
    id: "11BborgoAntico",
    image: { src: "https://upload.wikimedia.org/wikipedia/commons/5/5f/Borgo_antico_-_Milazzo.jpg", external: true },
    linkUrls: ["https://maps.app.goo.gl/RJwyGCecydGwXQQ27"],
    nextIds: ["12Bcastello"],
  },
  {
    id: "12Bcastello",
    image: { src: "https://upload.wikimedia.org/wikipedia/commons/c/c3/Castello_di_Milazzo_1.jpg", external: true },
    linkUrls: ["https://www.comune.milazzo.me.it/argomenti-2/turismo/il-castello-citta-murata/", "https://www.mumamilazzo.com/site/?page_id=248"],
    nextIds: ["13Bindicazionicapomilazzo"],
  },
  {
    id: "13Bindicazionicapomilazzo",
    image: { src: "https://upload.wikimedia.org/wikipedia/commons/0/0d/Capo_Milazzo.jpg", external: true },
    linkUrls: ["https://maps.app.goo.gl/BhhYJJpnSUQNdQuB9"],
    nextIds: ["14BcapoMilazzo"],
  },
  {
    id: "14BcapoMilazzo",
    image: { src: "https://upload.wikimedia.org/wikipedia/commons/e/ea/Capo_Milazzo.jpg", external: true },
    nextIds: ["15BpiscinaVenere"],
  },
  {
    id: "15BpiscinaVenere",
    image: { src: "https://upload.wikimedia.org/wikipedia/commons/a/a4/Piscina_di_Venere.jpg", external: true },
    linkUrls: ["https://maps.app.goo.gl/bP54nK5SqWxUM5Jx7"],
    nextIds: ["16BpanoramicaIsole"],
  },
  {
    id: "16BpanoramicaIsole",
    image: { src: "https://upload.wikimedia.org/wikipedia/commons/7/73/Isole_Eolie_da_Capo_Milazzo.jpg", external: true },
    nextIds: ["17BtramontoCapoMilazzo"],
  },
  {
    id: "17BtramontoCapoMilazzo",
    image: { src: "https://upload.wikimedia.org/wikipedia/commons/4/4a/Tramonto_a_Capo_Milazzo.jpg", external: true },
    linkUrls: ["https://maps.app.goo.gl/bP54nK5SqWxUM5Jx7"],
    nextIds: ["18BrientroCentro"],
  },
  {
    id: "18BrientroCentro",
    linkUrls: ["https://maps.app.goo.gl/bP54nK5SqWxUM5Jx7"],
    nextIds: ["19cena"],
  },
  {
    id: "19cena",
    image: { src: "https://upload.wikimedia.org/wikipedia/commons/e/e4/Spiaggia_di_Ponente_Milazzo.jpg", external: true },
    nextIds: ["20passeggiata"],
  },
  {
    id: "20passeggiata",
    image: { src: "https://upload.wikimedia.org/wikipedia/commons/e/e4/Spiaggia_di_Ponente_Milazzo.jpg", external: true },
    nextIds: ["21gelato"],
  },
  {
    id: "21gelato",
    image: { src: "https://upload.wikimedia.org/wikipedia/commons/9/98/Italian_ice_cream.jpg", external: true },
    nextIds: ["22bar"],
  },
  {
    id: "22bar",
    image: { src: "https://upload.wikimedia.org/wikipedia/commons/e/e4/Spiaggia_di_Ponente_Milazzo.jpg", external: true },
    nextIds: ["23fineGiornata"],
  },
  {
    id: "23fineGiornata",
    image: { src: "https://upload.wikimedia.org/wikipedia/commons/a/a4/Milazzo_sunset.jpg", external: true },
    nextIds: [],
  },
];

export const FIRST_STEP_ID = ITINERARY_STRUCTURE[0].id;

export function getStepStructure(id: string): StepStructure | undefined {
  return ITINERARY_STRUCTURE.find((s) => s.id === id);
}
