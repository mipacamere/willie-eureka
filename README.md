# Dormilazzo Platform — scaffold

Punto di partenza per unificare mipacompanion, vncompanion,
alloggiati-companion, dormilazzo e 1day-itinerary in un'unica app Next.js.

## Struttura

```
app/
  guest/[token]/       → area ospiti, pubblica. Il segmento URL è un token
                          non indovinabile (non lo slug "mipa"), risolto
                          in struttura tramite getPropertyByGuestToken()
    page.tsx             → landing: scegli scan documento o accesso diretto
    checkin/              → flusso scan documento + revisione + invio
    app/                  → dashboard con le 4 tab (Home/Esplora/Info/Checkout)
    itinerary/            → itinerario giornaliero "Esploriamo insieme Milazzo!" (porting da Vue)
    gallery/              → griglia fotografica con lightbox (vedi lib/gallery/)
  staff/                → sessione staff O admin (l'admin vede tutto)
    checklist/            → checklist pulizie per struttura/camera
    riepilogo/            → configurazione camere + export PDF
    prodotti/             → lista spesa prodotti pulizia
  admin/                → solo sessione admin (lo staff non entra qui)
    alloggiati/           → gestione ospiti e invio schedine (ex alloggiati-companion)
    condividi/            → link copia/condividi gallerie per camera (usa il token, non lo slug)
  login/staff, login/admin
  api/
    auth/login/                 → verifica credenziali, crea sessione JWT, imposta cookie
    auth/logout/                → invalida il cookie di sessione
    ocr/                        → porting di ocr-proxy.mjs, chiave separata per struttura
    guests/                     → porting di read-guests.mjs (lettura Sheet condiviso)
    guests/append/              → porting di append-guest-sheet.mjs (scrittura, chiamata dalle companion app)
    alloggiati/test/            → porting di test-schedine.mjs (convalida, NON invia)
    alloggiati/send/            → porting di send-schedine.mjs (invio REALE alla Questura)
    regione-sicilia/send/       → porting di send-regione-sicilia.mjs (Osservatorio Turistico)
    pharmacy/                   → porting di pharmacy-proxy.mjs
    email/send-guest-data/      → porting di send-guest-data.mjs (backup via Resend)
components/guest/
  GuestDashboard.tsx      → dashboard con tab Home/Esplora/Info/Checkout (porting di renderDashboard + renderSectionContent)
  CheckinFlow.tsx         → flusso scan documento con pipeline OCR completa (vedi lib/ocr/) + revisione + invio
  WeatherWidget.tsx       → meteo/mare Open-Meteo (porting di fetchOpenMeteo)
  PharmacyWidget.tsx      → farmacie di turno, chiama /api/pharmacy
components/admin/
  AlloggiatiAdmin.tsx     → shell 5 tab (Scansiona/Companion/Importa/Ospiti/Invia) + tab Scansiona/Companion/Importa
  GuestListTab.tsx        → elenco cumulativo, statistiche, selezione, modifica, generazione TXT
  SendTab.tsx             → convalida/invio Questura + invio Regione Sicilia
lib/ocr/
  constants.ts            → liste ufficiali Stati (236) e Documenti (95), mappe MRZ, titoli EU multilingua
  match.ts                → normalizeForMatch/levenshtein/findBestMatch/matchStato/matchDocumento
  mrz.ts                  → parsing MRZ TD1/TD2/TD3 (passaporti, CIE, carte UE)
  generic-extract.ts      → estrazione multilingua senza MRZ (etichette, luogo/data nascita, sesso, patenti UE)
  extract-fields.ts       → orchestrazione: individua MRZ o usa il percorso generico, produce la bozza ospite
  dates.ts                → normalizzazione date (separatori misti, anno a 2 cifre)
  preprocess.ts           → preprocessImage: grayscale + stretch di contrasto via canvas
  vision-client.ts        → chiamata OCR lato client, verso /api/ocr
  validate.ts             → porting di validateGuest, stesse regole esatte
  export.ts               → porting di buildExportJson/downloadOnly (riserva manuale lato ospite)
lib/alloggiati/
  soap.ts / auth.ts      → client SOAP Alloggiati Web (Questura) + risoluzione credenziali per struttura
  admin/lookup.ts         → parseCSV/loadLookupTables/findInTable/findComune (tabelle ufficiali)
  admin/records.ts        → convertToRecord (tracciato fisso 168 char) + buildRegioneStayForGuest
  admin/import.ts         → parsing import TXT (168 char) e CSV/TSV
  admin/export-txt.ts     → download del file TXT per la Questura
lib/regione-sicilia/
  client.ts / auth.ts    → client REST Osservatorio Turistico + risoluzione credenziali
lib/auth/
  session.ts             → crea/verifica sessioni JWT (jose, compatibile Edge Runtime)
  users.ts               → verifica credenziali admin/staff da ADMIN_USERS_JSON/STAFF_USERS_JSON
components/guest/theme/
  guest-theme.css          → porting 1:1 di style.css (mipacompanion/vncompanion), scoped sotto .guest-theme
  ThemeContext.tsx         → tema chiaro/scuro (localStorage, segue il sistema di default)
  GuestThemeWrapper.tsx    → applica le classi .guest-theme.theme-{struttura}.theme-{chiaro|scuro}
  ThemeToggleButton.tsx    → pulsante toggle tema (porting di renderThemeToggle)
  LangFlagMenu.tsx         → dropdown lingua a bandierina (porting di renderLangMenu)
  Ms.tsx                   → helper icone Material Symbols Rounded
components/guest/itinerary/
  ItineraryApp.tsx         → navigazione tra step (?step= nell'URL, history browser funzionante)
  ItineraryStepView.tsx    → template comune a tutti gli step (porting del template condiviso Vue)
components/staff/
  ChecklistTool.tsx       → porting di checklist.html: griglia camere x task, progresso, localStorage
  RiepilogoTool.tsx       → porting di riepilogopulizie.html: config camere + export PDF
  ProdottiTool.tsx        → porting di prodottipulizia.html: lista spesa + PDF/WhatsApp
  CondividiTool.tsx       → porting di condividi_gallerie.html: link copia/condividi
components/auth/
  LoginForm.tsx           → form condiviso staff/admin
  LogoutButton.tsx        → pulsante logout riutilizzabile
scripts/
  hash-password.mjs      → CLI per generare l'hash bcrypt di una password
lib/gallery/
  photos.ts               → elenco esatto dei file per camera (186 foto, dall'originale)
  rooms.ts                → gruppi galleria per struttura (include la sala colazione)
lib/i18n/
  locales.ts              → 7 lingue supportate (stesse dell'originale), default/fallback "it"
  LocaleContext.tsx        → contesto React per la lingua corrente, persistita in localStorage (non nell'URL)
  LanguageSelector.tsx     → dropdown bandiera+lingua (porting di LanguageSelector.vue)
  merge.ts                → merge generico traduzione-scelta + fallback, campo per campo
  common.ts               → stringhe di interfaccia condivise (per ora: pulsanti navigazione itinerario)
lib/itinerary/
  structure.ts             → i 37 step: id, navigazione, immagini, URL — non cambia con la lingua
  types.ts                 → forma di una traduzione di uno step
  locales/it.ts            → traduzioni italiane (contenuti reali da it.json, non nuovi testi)
  locales/en.ts, es.ts, fr.ts, de.ts, zh.ts, ru.ts → stub pronti, stesse chiavi di it.ts, da compilare
  locales/index.ts         → unisce struttura+traduzione per la lingua scelta, con fallback
lib/staff/
  rooms.ts                → struttura camere/appartamenti reale per struttura (fonte unica)
  checklist-tasks.ts       → le 27 voci di controllo in 4 categorie
  cleaning-products.ts     → catalogo prodotti pulizia
  room-config.ts           → opzioni configurazione letto/operazione/letti aggiuntivi
  riepilogo-layout.ts      → sezioni/etichette camera identiche all'originale (Archi/Milazzo)
components/auth/
  BackToHubLink.tsx        → link di ritorno all'hub corretto in base al ruolo (admin→/admin, staff→/staff)
lib/guest-content/
  structure.ts             → dati non traducibili per struttura (wifi, contatti, URL mappe, icone)
  types.ts                 → forma di una traduzione dei contenuti companion
  locales/it.ts             → traduzioni italiane (contenuti reali, non nuovi testi)
  locales/en.ts, es.ts, fr.ts, de.ts, zh.ts, ru.ts → stub pronti, stesse chiavi di it.ts, da compilare
  locales/index.ts         → unisce struttura+traduzione per la lingua scelta, con fallback
lib/
  client-app-token.ts     → token pubblico anti-bot condiviso (porting di OCR_APP_TOKEN)
  api-auth.ts             → controllo token condiviso (era duplicato in ogni function)
  google/auth.ts         → autenticazione service account Google (era duplicata in 2 function)
  google/sheets.ts        → lettura + scrittura sul Sheet ospiti condiviso
public/images/gallery/
  README.md               → istruzioni per l'operatore su dove mettere le foto reali
  {struttura}/{camera}/   → foto reali da caricare (non incluse, vedi sopra)
public/data/alloggiati/
  comuni.csv, stati.csv, documenti.csv, tipo_alloggiato.csv → tabelle ufficiali, copiate 1:1 dall'originale
config/
  properties.ts         → un'unica fonte per nome, tema colore, env var, policeStructureId (ME006995/ME001066) e CIN per struttura
middleware.ts           → enforcement accessi: guest pubblico, staff/admin autenticati
```

## Cosa fa già questo scaffold

- **Grafica dell'area ospiti identica all'originale** (porting 1:1 di
  `style.css` da mipacompanion/vncompanion, ~700 righe, "scoped" sotto
  `.guest-theme` per non toccare staff/admin che restano su Tailwind):
  stesso font icone (Material Symbols Rounded), stesso header (toggle
  tema chiaro/scuro + bandierina lingua a dropdown), stessa greeting
  card, stesso widget meteo (con pannello previsioni a 5 giorni che si
  apre cliccando), stessa griglia quick-access a 6 caselle (colori a
  ciclo verde/ocra/blu), stessa sidebar desktop e bottom-tab-bar mobile,
  stessi pills di navigazione desktop. Tema chiaro/scuro salvato in
  `localStorage`, come l'originale. Le due palette colore (MiPA verde,
  Via Nazionale rosso) generate automaticamente dagli `style.css`
  originali di entrambi i progetti — verificato che le regole
  "component" fossero identiche tra i due (solo la palette cambia).
  **Nota di scope**: l'originale ha ~15 pagine dedicate (una per voce di
  menu, ognuna con la propria vista a schermo intero); qui i contenuti
  restano raggruppati nelle 4 tab già costruite in precedenza (Home/
  Esplora/Info/Checkout) — quick-tile e voci di sidebar portano alla tab
  che contiene quel contenuto, non a una pagina indipendente. La grafica
  e la navigazione di primo livello sono identiche; la profondità a
  15 pagine singole non è stata ricostruita.

- **Hub admin completo**: `/admin` ora linka anche all'itinerario di
  entrambe le strutture, oltre a gestione Alloggiati, Condividi
  gallerie, i 3 strumenti staff e le companion app.
- **Galleria cumulativa per struttura**: oltre al link per singola
  camera, "Condividi gallerie" genera anche un link "tutte le foto
  insieme" per ogni gruppo (es. tutte le foto di "MiPA — Appartamenti"
  in un'unica pagina, senza dividerle per camera) — stessa fonte dati,
  vista diversa. Basta omettere `room` dall'URL (`?group=mipa` invece di
  `?group=mipa&room=MiPA1`).
- **Riepilogo pulizie fedele all'originale**: stessa identica grafica di
  `riepilogopulizie.html` (sezioni "Archi"/"Milazzo" con bordo colorato,
  card camera, bottoni a gradiente PDF/PNG), export sia PDF che
  **Immagine PNG** (`html2canvas`, mancante nel giro precedente).
  Aggiunta rispetto all'originale: campo data di riferimento
  (precompilato con oggi, modificabile), incluso sia nel PDF che nel PNG.
- **Pulsante "Torna a Admin/Area staff"** su tutte le pagine strumento:
  Checklist, Riepilogo, Prodotti pulizia (torna a `/admin` se chi
  naviga è admin, a `/staff` se è staff — stesso meccanismo usato per il
  pulsante logout), Condividi gallerie e Gestione ospiti/schedine
  (sempre verso `/admin`, essendo pagine solo-admin).

- **Multi-tenant per struttura**: `config/properties.ts` sostituisce la
  duplicazione tra mipacompanion e vncompanion. Aggiungere una struttura =
  aggiungere una entry, non clonare un progetto.
- **Middleware di enforcement**: `/guest/*` è pubblica; `/staff/*` e
  `/admin/*` richiedono un cookie di sessione, verificato lato server ad
  ogni richiesta (non è "nascosto in UI", è bloccato prima del render).
- **Tutte le Netlify Functions originali portate** su Route Handler
  (vedi tabella sopra) — 3 progetti di function duplicate/parallele sono
  diventati un unico set in `app/api/`, con le lib condivise (auth Google,
  controllo token) consolidate una sola volta invece che ripetute in ogni
  function.
- **Identificatori separati, e collegati in un solo punto**: lo slug usato
  nelle URL (`mipa`, `via-nazionale`) e il codice ufficiale assegnato dalla
  Questura (`policeStructureId`) sono due cose diverse — la conversione tra
  i due avviene solo in `config/properties.ts` e nelle funzioni di auth,
  non sparsa nel codice.
- **Area ospiti funzionante**: landing con scelta scan/salta, dashboard a 4
  tab (Home/Esplora/Info/Checkout) con meteo live, farmacie di turno live,
  wifi one-tap, filosofia, direzioni, prenotazione servizi via WhatsApp, e
  flusso di check-out. Contenuti presi 1:1 da app.js (non nuovi testi).
- **Pipeline OCR completa** (`lib/ocr/`): stessa identica logica
  dell'originale, non semplificata — riconoscimento MRZ (passaporti TD3,
  CIE/carte UE TD1 e TD2), estrazione generica multilingua per i documenti
  senza MRZ leggibile (patenti UE, carte non elettroniche), matching
  fuzzy su Stati (236 voci) e Documenti (95 voci) ufficiali, rete di
  sicurezza per il numero CIE e per i campi numerati delle patenti UE.
  Supporta più foto per documento (fronte/retro), come l'originale.
- **Gestione multi-ospite nella stessa pratica** (`lib/ocr/validate.ts` +
  `CheckinFlow.tsx`): stessa validazione (`validateGuest`) e stesso flusso
  aggiungi/modifica/rimuovi (`addGuestToList`/`editGuestFromList`/
  `removeGuestFromList`) dell'originale — una famiglia può accumulare più
  ospiti prima dell'invio unico. La pratica in corso resta salvata in
  locale se si chiude la pagina a metà, come `mipa_schedine`
  nell'originale.
- **Download manuale come riserva** (`lib/ocr/export.ts`): stesso
  `buildExportJson`/`exportFilename`/`downloadOnly` dell'originale, con
  nome/codice struttura/CIN reali presi da `config/properties.ts`.
  Disponibile sempre nella schermata elenco, e proposto automaticamente se
  l'invio automatico al Google Sheet fallisce.
- **Area admin — gestione ospiti e schedine** (`/admin/alloggiati`,
  porting di alloggiati-companion): le 5 tab originali — Scansiona
  (riusa la stessa pipeline OCR completa di `lib/ocr/`), Companion
  (carica gli ospiti già registrati dal Google Sheet condiviso via
  `/api/guests`), Importa (file TXT a 168 caratteri o CSV/TSV), Ospiti
  (elenco cumulativo, selezione, modifica, statistiche, generazione TXT),
  Invia (convalida/invio reale alla Questura + invio alla Regione
  Sicilia, con lo stesso doppio conferma dell'originale prima
  dell'invio reale). Le tabelle ufficiali di lookup (11.295 comuni, 236
  stati, 95 documenti, 5 tipi alloggiato) sono copiate 1:1 in
  `public/data/alloggiati/` — nessun dato ridotto o riassunto.
- **Login vero staff/admin** (`lib/auth/`): sessioni JWT firmate (`jose`,
  compatibile con l'Edge Runtime del middleware), verificate ad ogni
  richiesta in `proxy.ts` — firma, scadenza (12h) e ruolo, non solo la
  presenza del cookie. Le credenziali (email + password con hash bcrypt)
  si definiscono via `ADMIN_USERS_JSON`/`STAFF_USERS_JSON` in env,
  nessun database necessario per questo numero di utenti. Genera gli
  hash con `node scripts/hash-password.mjs "password"`. Testato
  end-to-end (login corretto/sbagliato, controllo ruolo, logout).
- **Area staff — gestione operativa** (`/staff/*`, porting dei 4
  strumenti operativi di dormilazzo): Checklist pulizie (stesse 27 voci
  in 4 categorie, ora per camere reali per struttura invece dei numeri
  fissi dell'originale, con progresso per camera e persistenza locale),
  Riepilogo pulizie (configurazione letto + operazione per camera/
  appartamento, export PDF), Prodotti pulizia (stesso catalogo di 10
  prodotti, lista della spesa, export PDF + WhatsApp). "Condividi
  gallerie" è stato spostato sotto `/admin` (vedi più sotto): lo staff
  vede solo questi 3 strumenti operativi.
- **Itinerario giornaliero** (`/guest/[token]/itinerary`, porting
  completo di 1day-itinerary da Vue a React): tutti i 37 step con i due
  percorsi alternativi (A: si parte da Capo Milazzo; B: si parte dalla
  Spiaggia di Ponente) che confluiscono nella cena serale finale.
  Contenuti reali presi 1:1 da `it.json` (non nuovi testi), navigazione
  identica all'originale, stato dello step corrente nell'URL (`?step=`)
  così il tasto Indietro del browser funziona come nell'originale (che
  usava vue-router con path reali per ogni step).
- **Gallerie fotografiche** (`/guest/[token]/gallery`, porting di
  mipa.html/via_nazionale.html/via_nazionale_camere.html/
  via_nazionale_suites.html/via_nazionale_suites_camere.html): griglia
  fotografica con lightbox per ogni camera/appartamento/suite/sala
  colazione — 13 spazi, 186 nomi di file esatti presi 1:1 dall'originale
  (`lib/gallery/photos.ts`). **Le foto vere non sono incluse** (non
  fornite per motivi di spazio): vanno messe in
  `public/images/gallery/{struttura}/{camera}/`, istruzioni precise in
  `public/images/gallery/README.md`. Finché mancano, ogni foto viene
  semplicemente saltata invece di rompere la pagina — si possono
  caricare gradualmente. Miglioria rispetto all'originale: una sola
  foto per file invece di due (miniatura + intera), grazie al
  ridimensionamento automatico invece del pre-processing manuale.
  Corretto anche un refuso dell'originale (cartella miniature di Via
  Nazionale con nome diverso da quella delle foto intere, che ne
  avrebbe impedito il caricamento).
- **Infrastruttura multilingua pronta** (`lib/i18n/`): stesse 7 lingue
  dell'originale (it/en/es/fr/de/zh/ru), stesso meccanismo (scelta
  salvata in localStorage, non nell'URL — così i QR code già stampati
  restano validi). Sia l'itinerario che i contenuti companion sono
  divisi in **struttura** (id, navigazione, URL, icone — non cambia con
  la lingua) e **traduzioni** (`locales/it.ts` completo, `locales/en.ts`
  ecc. stub pronti con le stesse chiavi). Il merge tra lingua scelta e
  fallback avviene campo per campo, quindi si può tradurre una lingua o
  anche un solo campo alla volta senza mai lasciare buchi. Il selettore
  lingua (`LanguageSelector`) è già collegato nella dashboard ospiti e
  nell'itinerario. **Non ancora tradotto** in altre lingue: solo
  l'italiano è compilato, le altre 6 sono stub vuoti pronti da
  riempire (vedi punto 3 sotto).
- **Ruoli e permessi rifiniti**: l'admin ha accesso a tutto (companion
  app di entrambe le strutture, strumenti staff, gestione Alloggiati —
  vedi l'hub `/admin`, che ora linka ovunque); lo staff vede solo i 3
  strumenti operativi (Checklist/Riepilogo/Prodotti pulizia), non
  "Condividi gallerie" (spostato sotto `/admin`). `proxy.ts` applica
  questo sia a `/staff/*` (accetta ruolo `staff` **o** `admin`) sia ad
  `/admin/*` (solo `admin`). Testato end-to-end (admin su /staff → ok,
  staff su /admin → rifiutato).
- **Link ospiti non indovinabili**: l'URL dell'area ospiti non usa più lo
  slug leggibile (`/guest/mipa`) ma un token casuale non prevedibile
  (`/guest/{token}`, es. da QR code), configurabile per struttura via
  `GUEST_ACCESS_TOKEN_MIPA`/`GUEST_ACCESS_TOKEN_VN`. Senza queste env var
  il sito usa un token di sviluppo (non segreto, va bene solo per
  testare in locale). **Nota**: non è un vero controllo d'accesso (chi
  ha il link entra comunque, come previsto per l'area ospiti) — è un
  deterrente contro chi prova a indovinare o enumerare gli URL delle
  altre strutture, non un sostituto dell'autenticazione.

## Cosa manca ancora (prossimi passi)

1. **15 pagine dedicate per voce di menu**: l'originale naviga verso una
   pagina indipendente per ogni voce (schedine/entryInstructions/
   philosophy/map/breakfast/directions/bookServices/events/museums/
   beach/recipes/roomGuide/pharmacies/checkout/info), ognuna con la
   propria vista a schermo intero. Qui i contenuti restano raggruppati
   nelle 4 tab già costruite (Home/Esplora/Info/Checkout): la grafica di
   quick-grid/sidebar/menu è identica, ma cliccando si arriva alla tab
   che contiene quel contenuto, non a una pagina dedicata. Alcune voci
   (bookServices/events/museums/beach/recipes/roomGuide/pharmacies come
   pagine indipendenti) non hanno ancora contenuto proprio distinto.
2. **Contenuti "Esplora" più ricchi**: musei, eventi, ricette — presenti
   nell'originale ma non ancora portati, per tenere questo passaggio
   dentro dimensioni gestibili.
3. **Testo filosofia di Via Nazionale**: nella lib contenuti è segnato con
   TODO — va confrontato riga per riga con vncompanion/app.js per
   eventuali differenze rispetto a MiPA.
4. **Traduzione vera nelle altre 6 lingue**: l'infrastruttura è pronta
   (vedi sopra), ma `locales/en.ts`, `es.ts`, `fr.ts`, `de.ts`, `zh.ts`,
   `ru.ts` (sia per l'itinerario che per i contenuti companion) sono
   ancora stub vuoti — ogni file elenca in un commento le chiavi esatte
   da compilare. Finché restano vuoti, l'app mostra l'italiano per
   qualunque lingua si scelga (fallback), quindi nulla si rompe nel
   frattempo.
5. **Stringhe di interfaccia non ancora tradotte**: il selettore lingua
   e il meccanismo di fallback coprono i *contenuti* (itinerario,
   filosofia, servizi, ecc.), ma molte stringhe di interfaccia sono
   ancora testo fisso in italiano nei file `.tsx` — es. le etichette
   delle tab (Home/Esplora/Info/Checkout), i pulsanti del check-in
   ("Connetti", "Completa check-out"). Solo "Indietro"/"Torna
   all'inizio" (nell'itinerario) passano già da `lib/i18n/common.ts` a
   scopo dimostrativo. Migrare le altre stringhe allo stesso pattern è
   il prossimo passo naturale prima di tradurre davvero l'interfaccia
   intera, non solo i contenuti.
6. **Export come immagine per Prodotti pulizia**: Riepilogo pulizie ha
   già sia PDF che PNG (`html2canvas`); Prodotti pulizia nell'originale
   offriva anche `exportAsImage()` — qui c'è solo PDF + WhatsApp per
   quello specifico strumento.
7. **Checklisttabss.html non portato**: file presente nel progetto
   originale ma non collegato da `index.html` — sembra una bozza
   superata da `checklist.html`, quindi non ne ho fatto il porting.
8. **PWA**: manifest + service worker (oggi presenti in mipacompanion/
   vncompanion) da riconfigurare con `next-pwa` o equivalente, per
   struttura.
9. **Restrizione staff per struttura**: la sessione staff già porta il
   claim `properties` (le strutture assegnate), ma `proxy.ts` oggi
   verifica solo che la sessione sia valida — non filtra ancora per
   struttura. Ora che l'area staff ha contenuti reali (checklist,
   riepilogo, ecc.), andrebbe aggiunta la verifica
   `session.properties.includes(slug)` per limitare l'accesso alle sole
   strutture assegnate a quel membro dello staff.
10. **Nessuna revoca di sessione singola**: i JWT scadono da soli dopo 12h,
   ma non c'è modo di invalidare una sessione specifica prima della
   scadenza (es. "disconnetti questo dispositivo") senza aggiungere una
   blocklist lato server.
11. **Immagini dell'itinerario non finite nell'originale**: 5 step
    (08AislandsPanorama, 09AborgoAntico, 10AlunchBorgo, 16AtramontoTono,
    17ArientroCentro) puntavano a URL Unsplash placeholder/rotti mai
    sistemati nel progetto Vue originale — qui sono stati omessi invece
    di portare un link rotto. Le altre immagini restano quelle originali
    (alcune locali, molte hotlinkate da Wikimedia Commons come faceva
    l'originale).
12. **Nota sul comportamento ereditato dall'originale** (non un gap, ma da
    sapere): nel tab Invia (area admin), la struttura selezionata
    determina le credenziali usate per l'invio, ma si applica a *tutti*
    gli ospiti selezionati nella lista, indipendentemente dalla struttura
    con cui erano stati aggiunti — stesso comportamento di
    `structure-filter` nell'originale. Se la lista contiene ospiti di più
    strutture, tocca all'operatore selezionare solo quelli giusti prima
    di inviare.

## Setup locale

```bash
npm install
cp .env.example .env.local   # compila le chiavi

# Genera SESSION_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Genera l'hash della password per il primo utente admin (o staff)
node scripts/hash-password.mjs "la-password-scelta"
# Incolla il valore già "escaped" (seconda riga stampata) in ADMIN_USERS_JSON
# dentro .env.local — leggi l'ATTENZIONE su .env.example, i simboli $
# dell'hash bcrypt vanno scappati con \$ o Next.js li interpreta come
# variabili e il login fallisce sempre.

npm run dev
```

## Note

- Le chiavi API restano **separate per struttura** (OCR, Alloggiati,
  Regione Sicilia) per mantenere soglie gratuite distinte, come da
  richiesta. Il Google Sheet ospiti resta condiviso.
- Lo scan documento nell'area ospiti è **opzionale**: non è un gate di
  accesso, solo personalizzazione (nome mostrato in app) + invio dati alla
  struttura per la pratica Alloggiati.
