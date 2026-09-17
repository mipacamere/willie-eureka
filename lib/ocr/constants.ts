/**
 * Porting integrale delle costanti di app.js (mipacompanion/vncompanion)
 * usate dal riconoscimento documenti. Nessun contenuto è stato ridotto
 * rispetto all'originale: stesse liste, stesse mappe, stessi commenti.
 */

export const GUEST_TYPE_OPTIONS = [
  "OSPITE SINGOLO",
  "CAPO FAMIGLIA",
  "CAPO GRUPPO",
  "FAMILIARE",
  "MEMBRO GRUPPO",
] as const;

// Elenco ufficiale degli stati (da stati.csv, 236 voci) e dei tipi documento (da
// documenti.csv, 95 voci): sono le uniche opzioni selezionabili nei relativi menu a
// tendina, così il testo salvato è sempre un valore ufficiale coerente, mai libero.
export const STATI_LIST = [
  "AFGHANISTAN", "ALBANIA", "ALGERIA", "ANDORRA",
  "ANGOLA", "ANGUILLA (ISOLA)", "ANTIGUA E BARBUDA", "APOLIDE",
  "ARABIA SAUDITA", "ARGENTINA", "ARMENIA", "AUSTRALIA",
  "AUSTRIA", "AZERBAIGIAN", "BAHAMAS", "BAHREIN",
  "BANGLADESH", "BARBADOS", "BELGIO", "BELIZE",
  "BENIN", "BERMUDE", "BHUTAN", "BIELORUSSIA",
  "BOLIVIA", "BOPHUTHATSWANA", "BOSNIA ED ERZEGOVINA", "BOTSWANA",
  "BRASILE", "BRUNEI DARUSSALAM", "BULGARIA", "BURKINA FASO",
  "BURUNDI", "CAMBOGIA", "CAMERUN", "CANADA",
  "CAPO VERDE", "CAYMAN (ISOLE)", "CECOSLOVACCHIA", "CHRISTMAS",
  "CIAD", "CILE", "CINA", "CIPRO",
  "COCOS", "COLOMBIA", "COMORE", "CONGO",
  "COREA DEL NORD", "COREA DEL SUD", "COSTA D'AVORIO", "COSTA RICA",
  "CROAZIA", "CUBA", "DANIMARCA", "DOMINICA",
  "ECUADOR", "EGITTO", "EL SALVADOR", "EMIRATI ARABI UNITI",
  "ERITREA", "ESTONIA", "ETIOPIA", "FAER OER",
  "FEDERAZIONE RUSSA", "FIGI", "FILIPPINE", "FINLANDIA",
  "FRANCIA", "GABON", "GAMBIA", "GEORGIA",
  "GEORGIA SUD E ISOLE SANDWICH AUSTRALI", "GERMANIA", "GHANA", "GIAMAICA",
  "GIAPPONE", "GIBUTI", "GIORDANIA", "GRECIA",
  "GRENADA", "GROENLANDIA", "GUADALUPA", "GUAM",
  "GUATEMALA", "GUAYANA FRANCESE", "GUERNSEY", "GUINEA",
  "GUINEA BISSAU", "GUINEA EQUATORIALE", "GUYANA", "HAITI",
  "HONDURAS", "HONG KONG", "INDIA", "INDONESIA",
  "IRAN", "IRAQ", "IRLANDA", "ISLANDA",
  "ISOLE VERGINI", "ISRAELE", "ITALIA", "KAZAKISTAN",
  "KENYA", "KIRGHIZISTAN", "KIRIBATI", "KOSOVO",
  "KUWAIT", "LA REUNION", "LAOS", "LESOTHO",
  "LETTONIA", "LIBANO", "LIBERIA", "LIBIA",
  "LIECHTENSTEIN", "LITUANIA", "LUSSEMBURGO", "MACAO",
  "MACEDONIA", "MACEDONIA DEL NORD", "MADAGASCAR", "MALAWI",
  "MALAYSIA", "MALDIVE", "MALI", "MALTA",
  "MALVINE", "MAN", "MAROCCO", "MARSHALL",
  "MARTINICA", "MAURITANIA", "MAURIZIO", "MAYOTTE",
  "MESSICO", "MICRONESIA STATI FEDERALI", "MOLDAVIA", "MONACO",
  "MONGOLIA", "MONTENEGRO", "MONTSERRAT", "MOZAMBICO",
  "MYANMAR-BIRMANIA", "NAMIBIA", "NAURU", "NEPAL",
  "NICARAGUA", "NIGER", "NIGERIA", "NORFOLK",
  "NORVEGIA", "NUOVA CALEDONIA", "NUOVA ZELANDA", "OMAN",
  "PAESI BASSI", "PAKISTAN", "PALAU REPUBBLICA", "PALESTINA",
  "PANAMA", "PAPUASIA-N.GUINEA", "PARAGUAY", "PERU'",
  "PITCAIRN", "POLINESIA", "POLONIA", "PORTOGALLO",
  "PUERTO RICO", "QATAR", "REGNO UNITO", "REPUBBLICA CECA",
  "REPUBBLICA CENTRAFRICANA", "REPUBBLICA DEMOCRATICA DEL CONGO", "REPUBBLICA DOMINICANA", "REPUBBLICA SLOVACCA",
  "ROMANIA", "RUANDA", "S. CHRISTOPHER E NEVIS", "S. VINCENT E GRENADINE",
  "SAHARA SPAGNOLO", "SAINT LUCIA", "SAINT PIERRE ET MIQUELON", "SAINT VINCENT E GRENADINE",
  "SALOMONE", "SAMOA", "SAMOA AMERICANE", "SAN MARINO",
  "SANT ELENA", "SAO TOME' E PRINCIPE", "SENEGAL", "SERBIA",
  "SEYCHELLES", "SIERRA LEONE", "SINGAPORE", "SIRIA",
  "SLOVENIA", "SOMALIA", "SPAGNA", "SRI LANKA (CEYLON)",
  "STATI UNITI D'AMERICA", "STATO DELLA CITTA' DEL VATICANO", "SUD SUDAN", "SUDAFRICA",
  "SUDAN", "SURINAME", "SVEZIA", "SVIZZERA",
  "SWAZILAND", "TAGIKISTAN", "TAIWAN", "TANZANIA",
  "THAILANDIA", "TIMOR", "TOGO", "TOKELAU",
  "TONGA", "TRINIDAD E TOBAGO", "TUNISIA", "TURCHIA",
  "TURKMENISTAN", "TURKS", "TUVALU", "UCRAINA",
  "UGANDA", "UNGHERIA", "URUGUAY", "UZBEKISTAN",
  "VANUATU", "VENEZUELA", "VERGINI BRITANNICHE (ISOLE)", "VIETNAM",
  "WALLIS", "YEMEN", "ZAMBIA", "ZIMBABWE",
];

export const DOCUMENTI_LIST = [
  "CARTA DI IDENTITA'", "CARTA ID. DIPLOMATICA", "CARTA IDENTITA' ELETTRONICA",
  "CERTIFICATO D'IDENTITA'", "PASSAPORTO DI SERVIZIO", "PASSAPORTO DIPLOMATICO",
  "PASSAPORTO ORDINARIO", "PATENTE DI GUIDA", "PATENTE NAUTICA",
  "PORTO D'ARMI GUARDIE GIUR", "PORTO D'ARMI USO SPORTIVO", "PORTO FUCILE DIF. PERSON.",
  "PORTO FUCILE USO CACCIA", "PORTO PISTOLA DIF. PERSON", "TES. ENTE NAZ. ASSIS.VOLO",
  "TES. FERROV. EX DEPUTATI", "TES. FERROVIARIA DEPUTATI", "TES. POSTE E TELECOMUNIC.",
  "TES. UNICO PER LA CAMERA", "TES.DOGANALE RIL.MIN.FIN.", "TESS. AG. E AG.SC. C.F.S.",
  "TESS. AGENTI/ASS.TI P.P.", "TESS. AGENTI/ASS.TI P.S.", "TESS. APP.TO AG.CUSTODIA",
  "TESS. APP.TO CARABINIERI", "TESS. APP.TO FINANZIERE", "TESS. APP.TO/VIG. URBANO",
  "TESS. APP.TO/VIG. VV.FF.", "TESS. CONSIGLIO DI STATO", "TESS. CORTE D'APPELLO",
  "TESS. CORTE DEI CONTI", "TESS. FERROV. SENATO", "TESS. FUNZIONARI P.S.",
  "TESS. IDENTIF.TELECOM IT.", "TESS. ISCR. ALBO MED/CHI.", "TESS. ISCRIZ. ALBO ODONT.",
  "TESS. ISPETTORI P.P.", "TESS. ISPETTORI P.S.", "TESS. MEMBRO EQUIP. AEREO",
  "TESS. MILIT. M.M.", "TESS. MILIT. TRUPPA SISMI", "TESS. MILITARE E.I.",
  "TESS. MILITARE NATO", "TESS. MILITARE TRUPPA A.M", "TESS. MIN. AFFARI ESTERI",
  "TESS. MIN.BEN.E ATT.CULT.", "TESS. MIN.PUBB.ISTRUZIONE", "TESS. MINIST. TRASP/NAVIG",
  "TESS. MINISTERO DIFESA", "TESS. MINISTERO FINANZE", "TESS. MINISTERO GIUSTIZIA",
  "TESS. MINISTERO INTERNO", "TESS. MINISTERO LAVORI PU", "TESS. MINISTERO SANITA'",
  "TESS. MINISTERO TESORO", "TESS. ORDINE GIORNALISTI", "TESS. PARLAMENTARI",
  "TESS. PERS. MAGISTRATI", "TESS. POL. TRIB. G.D.F.", "TESS. POLIZIA FEMMINILE",
  "TESS. PRES.ZA CONS. MIN.", "TESS. PUBBLICA ISTRUZIONE", "TESS. S.I.S.D.E.",
  "TESS. SOTT.LI AG.CUSTODIA", "TESS. SOTT.LI G.D.F.", "TESS. SOTT.LI VIG. URBANI",
  "TESS. SOTTUFF.LI VV.FF.", "TESS. SOTTUFFICIALI A.M.", "TESS. SOTTUFFICIALI CC",
  "TESS. SOTTUFFICIALI E.I.", "TESS. SOTTUFFICIALI SISMI", "TESS. SOTTUFICIALI C.F.S.",
  "TESS. SOTTUFICIALI M.M.", "TESS. SOVRINTENDENTI P.P.", "TESS. SOVRINTENDENTI P.S.",
  "TESS. UFF.LI AG.CUSTODIA", "TESS. UFF.LI VIG.URBANI", "TESS. UFFICIALE",
  "TESS. UFFICIALI A.M.", "TESS. UFFICIALI C.F.S.", "TESS. UFFICIALI E.I.",
  "TESS. UFFICIALI G.D.F.", "TESS. UFFICIALI M.M.", "TESS. UFFICIALI P.P.",
  "TESS. UFFICIALI P.S.", "TESS. UFFICIALI SISMI", "TESS. UFFICIALI VV.FF.",
  "TESS.ISCR. ALBO INGEGNERI", "TESS.ISCR.ALBO ARCHITETTI", "TESS.MIN.POLIT.AGRIC.FOR.",
  "TESSERA DELL'ORDINE NOTAI", "TESSERA ISCR. ALBO AVVOC.", "TESSERA RICONOSC. D.I.A.",
  "TESSERA U.N.U.C.I.", "TITOLO VIAGGIO RIF.POLIT.",
];

// Mappa dei codici MRZ (alpha-3, quelli stampati sulla riga leggibile a macchina dei
// passaporti/CIE) verso il nome ufficiale nella tabella Stati — verificata a mano contro
// stati.csv per i paesi più comuni. Per i codici non presenti qui, si usa il confronto
// testuale generico (findBestMatch) come piano B.
export const MRZ_ALPHA3_TO_STATO: Record<string, string> = {
  ITA: "ITALIA", FRA: "FRANCIA", DEU: "GERMANIA", ESP: "SPAGNA", GBR: "REGNO UNITO",
  USA: "STATI UNITI D'AMERICA", CHE: "SVIZZERA", AUT: "AUSTRIA", BEL: "BELGIO",
  NLD: "PAESI BASSI", PRT: "PORTOGALLO", POL: "POLONIA", ROU: "ROMANIA",
  RUS: "FEDERAZIONE RUSSA", UKR: "UCRAINA", GRC: "GRECIA", IRL: "IRLANDA",
  SWE: "SVEZIA", NOR: "NORVEGIA", DNK: "DANIMARCA", FIN: "FINLANDIA",
  CHN: "CINA", JPN: "GIAPPONE", BRA: "BRASILE", CAN: "CANADA", AUS: "AUSTRALIA",
  MEX: "MESSICO", ARG: "ARGENTINA", IND: "INDIA", MAR: "MAROCCO", TUN: "TUNISIA",
  ALB: "ALBANIA", HRV: "CROAZIA", SRB: "SERBIA", HUN: "UNGHERIA", BGR: "BULGARIA",
  TUR: "TURCHIA", BLR: "BIELORUSSIA",
  // Restanti Stati membri UE/SEE (codici MRZ alpha-3 ICAO) — carte d'identità e
  // passaporti UE usano tutti lo stesso standard MRZ, quindi bastano i codici corretti
  // perché il resto del parsing (TD1/TD3) funzioni automaticamente per ogni paese.
  CYP: "CIPRO", CZE: "REPUBBLICA CECA", EST: "ESTONIA", LVA: "LETTONIA",
  LTU: "LITUANIA", LUX: "LUSSEMBURGO", MLT: "MALTA", SVK: "REPUBBLICA SLOVACCA",
  SVN: "SLOVENIA", ISL: "ISLANDA", LIE: "LIECHTENSTEIN",
};

// Alcune carte d'identità UE riportano la nazionalità come aggettivo nella propria lingua
// (es. "POLSKIE" sulla carta polacca, "MAGYAR" su quella ungherese) anziché come codice
// alpha-3 o nome Stato in italiano: il fuzzy-match su STATI_LIST da solo non li riconosce
// (sono parole troppo diverse dal nome italiano dello Stato), quindi serve un elenco
// dedicato, sul modello di MRZ_ALPHA3_TO_STATO.
export const NATIONALITY_ALIAS_TO_STATO: Record<string, string> = {
  POLSKIE: "POLONIA", POLSKA: "POLONIA",
  MAGYAR: "UNGHERIA",
  DEUTSCH: "GERMANIA", DEUTSCHE: "GERMANIA",
  FRANÇAISE: "FRANCIA", FRANCAISE: "FRANCIA",
  ESPAÑOLA: "SPAGNA", ESPANOLA: "SPAGNA",
  PORTUGUESA: "PORTOGALLO",
  NEDERLANDSE: "PAESI BASSI",
  ÖSTERREICHISCH: "AUSTRIA", OSTERREICHISCH: "AUSTRIA",
  BELGE: "BELGIO", BELGISCH: "BELGIO",
  ROMÂNĂ: "ROMANIA", ROMANA: "ROMANIA",
  ΕΛΛΗΝΙΚΗ: "GRECIA",
  SVENSK: "SVEZIA", SUOMI: "FINLANDIA", SUOMEN: "FINLANDIA",
  DANSK: "DANIMARCA",
  ČESKÁ: "REPUBBLICA CECA", CESKA: "REPUBBLICA CECA",
  SLOVENSKÁ: "REPUBBLICA SLOVACCA", SLOVENSKA: "REPUBBLICA SLOVACCA",
  HRVATSKA: "CROAZIA", HRVATSKO: "CROAZIA",
  BULGARSKO: "BULGARIA",
};

// Titoli con cui le carte d'identità dei paesi UE si presentano (lingua nazionale),
// usati per riconoscere il tipo di documento nel percorso generico senza MRZ leggibile.
// Elenco paesi di riferimento: identity-cards.net.
export const EU_ID_CARD_TITLES = [
  "carte d'identité", "documento nacional de identidad", "documento de identidad",
  "cartão de cidadão", "bilhete de identidade", "personalausweis", "identiteitskaart", "dowód osobisty",
  "személyazonosító igazolvány", "občanský průkaz", "občiansky preukaz",
  "osebna izkaznica", "asmens tapatybės kortelė", "personas apliecība",
  "isikutunnistus", "karta tożsamości", "identity card",
  // Lingue mancanti nell'elenco originale — aggiunte per coprire tutti gli Stati UE/SEE.
  "δελτίο ταυτότητας", "лична карта", "carte de identitate", "lična karta",
  "henkilökortti", "identitetskort", "skilríki", "cartu tal-identità",
];

// Titoli con cui la patente di guida si presenta nelle varie lingue UE — tutte le patenti
// UE seguono lo stesso modello (Direttiva 2006/126/CE), quindi il documento fisico è
// sostanzialmente identico in tutta l'Unione: cambia solo la lingua dell'intestazione.
export const EU_DRIVING_LICENCE_TITLES = [
  "permis de conduire", "führerschein", "rijbewijs", "körkort", "kørekort",
  "ajokortti", "carta de condução", "permiso de conducción", "prawo jazdy",
  "vezetői engedély", "řidičský průkaz", "vodičský preukaz", "vozniško dovoljenje",
  "vairuotojo pažymėjimas", "vadītāja apliecība", "juhiluba",
  // Lingue mancanti nell'elenco originale (testo esatto dell'intestazione armonizzata
  // Allegato I Direttiva 2006/126/CE nelle rispettive lingue nazionali).
  "свидетелство за управление на мпс", "άδεια οδήγησης", "vozačka dozvola",
  "permis de conducere", "liċenzja tas-sewqan",
];
