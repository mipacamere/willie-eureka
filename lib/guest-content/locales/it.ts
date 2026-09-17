import type { PropertySlug } from "@/config/properties";
import type { PropertyTranslation } from "../types";

/**
 * Traduzioni italiane dei contenuti companion (saluto, filosofia,
 * istruzioni ingresso, servizi, direzioni). Stessi testi già presenti
 * prima di questa suddivisione — presi da app.js, non nuovi.
 *
 * TODO Via Nazionale: il testo "philosophy" qui sotto è ancora un
 * riadattamento di quello di MiPA (segnalato anche prima di questa
 * suddivisione) — andrebbe confrontato riga per riga con
 * vncompanion/app.js.
 */

const SHARED_DIRECTIONS = {
  arrivalModes: [
    {
      title: "In Auto",
      desc: "Esci dall'autostrada al casello di Milazzo e segui il Viale Sicilia fino all'ultima uscita. Parcheggia in Piazza XXV Aprile o nelle vicinanze (strisce blu — usa l'app EasyPark).",
    },
    {
      title: "In Treno",
      desc: "Scendi alla stazione di Milazzo e prendi le linee 4 o 5 fino alla fermata del porto, la più vicina alla struttura.",
    },
    {
      title: "In Autobus",
      desc: "Dall'aeroporto di Catania o altre località, scendi alla fermata del porto — la più vicina.",
    },
  ],
  departureModes: [
    {
      title: "In Auto",
      desc: "Segui il Viale Sicilia fino alla fine, poi prendi lo svincolo di Milazzo per l'A20 direzione Messina (Catania) o Palermo.",
    },
    {
      title: "In Autobus (verso Messina)",
      desc: "Consulta gli orari di GiuntaBus e AST (Azienda Siciliana Trasporti) per le corse giornaliere verso Messina.",
    },
    {
      title: "In Treno",
      desc: "Prendi le linee 4 o 5 dalla fermata del porto fino alla stazione ferroviaria di Milazzo.",
    },
    {
      title: "Aeroporto di Catania",
      desc: "Collegamento diretto da Milazzo all'aeroporto di Catania — controlla gli orari alla fermata del porto.",
    },
  ],
};

export const it: Partial<Record<PropertySlug, PropertyTranslation>> = {
  mipa: {
    greeting: "Benvenuto a MiPA 🌿",
    philosophy: [
      "Accogliere senza lasciare traccia: da qui nasce tutto. Nel cuore di Milazzo, dove il ritmo della città incontra il mare, abbiamo immaginato uno spazio capace di integrarsi in modo naturale e discreto nel contesto urbano, offrendo un'esperienza di soggiorno confortevole e autentica.",
      "Tutte le nostre camere, junior suite, sono curate nei minimi dettagli: luce naturale, insonorizzazione, impianti efficienti che riducono gli sprechi. Spazi ampi ed equilibrati, pensati per un benessere autentico e profondo, fatto di qualità e armonia.",
      "La sostenibilità è una scelta concreta, vissuta ogni giorno con impegno reale. Abbiamo eliminato plastica monouso e carta usa e getta, offriamo acqua potabile gratuita e usiamo solo energia da fonti rinnovabili. Così, contribuiamo a un'ospitalità veramente responsabile.",
      "Essere in centro significa scoprire la città in modo autentico. Stiamo lavorando per promuovere la mobilità dolce come la bicicletta, con itinerari e mappe dedicate per orientarsi facilmente e ridurre l'impatto ambientale.",
      "Crediamo in un'ospitalità dove responsabilità e comfort si fondono senza compromessi. Quello che resta è il ricordo di un viaggio leggero, autentico e consapevole — con un'impronta minima sull'ambiente e un segno positivo dentro di sé.",
    ],
    entrySteps: [
      "Il portone si apre con il codice che trovi nel messaggio di conferma.",
      "La cassetta con le chiavi si trova subito a destra dell'ingresso.",
      "Sali al primo piano: l'appartamento è la porta in fondo al corridoio.",
      "Se hai bisogno, scrivici su WhatsApp: siamo sempre raggiungibili.",
    ],
    services: [
      {
        title: "Noleggio Biciclette",
        note: "Esplora Milazzo in bici — city bike ed e-bike disponibili.",
        waText: "Ciao, vorrei noleggiare una bicicletta.",
      },
      {
        title: "Immersioni Subacquee",
        note: "Prenota 24h in anticipo. Le acque cristalline del Tirreno ti aspettano.",
        waText: "Ciao, vorrei prenotare un'immersione.",
      },
      {
        title: "Tour Isole Eolie (2-3 isole)",
        note: "Prenota con Navisal o Tarnav. Gite a Lipari, Stromboli, Vulcano e altro.",
        waText: "Ciao, vorrei informazioni sul tour delle Isole Eolie.",
      },
      {
        title: "Tour Privato Isole Eolie",
        note: "Tour in barca privata. Itinerario personalizzabile.",
        waText: "Ciao, vorrei prenotare un tour privato alle Isole Eolie.",
      },
    ],
    directions: SHARED_DIRECTIONS,
  },
  "via-nazionale": {
    greeting: "Benvenuto a Via Nazionale 🌿",
    philosophy: [
      "Accogliere senza lasciare traccia: da qui nasce tutto. A pochi minuti da Milazzo, in un contesto più raccolto, abbiamo immaginato uno spazio capace di integrarsi in modo naturale e discreto, offrendo un'esperienza di soggiorno confortevole e autentica.",
      "Tutte le nostre camere sono curate nei minimi dettagli: luce naturale, insonorizzazione, impianti efficienti che riducono gli sprechi. Spazi ampi ed equilibrati, pensati per un benessere autentico e profondo, fatto di qualità e armonia.",
      "La sostenibilità è una scelta concreta, vissuta ogni giorno con impegno reale. Abbiamo eliminato plastica monouso e carta usa e getta, offriamo acqua potabile gratuita e usiamo solo energia da fonti rinnovabili.",
      "Crediamo in un'ospitalità dove responsabilità e comfort si fondono senza compromessi — con un'impronta minima sull'ambiente e un segno positivo dentro di sé.",
    ],
    entrySteps: [
      "Il portone si apre con il codice che trovi nel messaggio di conferma.",
      "La cassetta con le chiavi si trova subito a destra dell'ingresso.",
      "Sali al piano indicato nel messaggio di benvenuto.",
      "Se hai bisogno, scrivici su WhatsApp: siamo sempre raggiungibili.",
    ],
    services: [
      {
        title: "Noleggio Biciclette",
        note: "Esplora la zona in bici — city bike ed e-bike disponibili.",
        waText: "Ciao, vorrei noleggiare una bicicletta.",
      },
      {
        title: "Immersioni Subacquee",
        note: "Prenota 24h in anticipo. Le acque cristalline del Tirreno ti aspettano.",
        waText: "Ciao, vorrei prenotare un'immersione.",
      },
      {
        title: "Tour Isole Eolie (2-3 isole)",
        note: "Prenota con Navisal o Tarnav. Gite a Lipari, Stromboli, Vulcano e altro.",
        waText: "Ciao, vorrei informazioni sul tour delle Isole Eolie.",
      },
      {
        title: "Tour Privato Isole Eolie",
        note: "Tour in barca privata. Itinerario personalizzabile.",
        waText: "Ciao, vorrei prenotare un tour privato alle Isole Eolie.",
      },
    ],
    directions: SHARED_DIRECTIONS,
  },
};
