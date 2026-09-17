"use client";

import { useEffect, useRef, useState } from "react";
import type { PropertySlug } from "@/config/properties";
import { withAppToken } from "@/lib/client-app-token";
import { preprocessImage } from "@/lib/ocr/preprocess";
import { callVisionOCR } from "@/lib/ocr/vision-client";
import { extractFieldsFromText, ocrResultToGuestDraft, emptyGuestDraft } from "@/lib/ocr/extract-fields";
import { STATI_LIST, DOCUMENTI_LIST, GUEST_TYPE_OPTIONS } from "@/lib/ocr/constants";
import { loadLookupTables, getDateFormatted, type LookupTables } from "@/lib/alloggiati/admin/lookup";
import { emptyAdminGuest, type AdminGuest } from "@/lib/alloggiati/admin/records";
import { parseImportFile } from "@/lib/alloggiati/admin/import";
import { GuestListTab } from "./GuestListTab";
import { SendTab } from "./SendTab";
import { LogoutButton } from "@/components/auth/LogoutButton";

/**
 * Porting di alloggiati-companion (app.js + index.html), 5 tab: Scansiona,
 * Companion, Importa, Ospiti, Invia. Riusa la pipeline OCR completa già
 * portata in lib/ocr/ (più ricca del semplice form dell'originale: qui
 * cittadinanza e stato di nascita restano distinti invece di essere
 * approssimati l'uno con l'altro).
 *
 * Nota sugli identificatori: "property" (slug interno, mipa/via-nazionale)
 * serve per scegliere la chiave OCR e le credenziali Alloggiati/Regione;
 * "policeStructureId" (es. ME006995) è il codice ufficiale scritto nel
 * tracciato e usato come struttura_id nel Google Sheet condiviso — sono
 * due cose diverse, vedi config/properties.ts.
 */

export interface StructureOption {
  slug: PropertySlug;
  name: string;
  policeStructureId: string;
}

type Tab = "scan" | "companion" | "import" | "list" | "send";

const STORAGE_KEY = "admin_alloggiati_guests";

export function AlloggiatiAdmin({ structures }: { structures: StructureOption[] }) {
  const [tab, setTab] = useState<Tab>("scan");
  const [guests, setGuests] = useState<AdminGuest[]>([]);
  const [lookup, setLookup] = useState<LookupTables | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);

  // Carica le tabelle di lookup una sola volta all'avvio (comuni/stati/documenti/tipo
  // alloggiato), come loadLookupTables() nell'originale.
  useEffect(() => {
    loadLookupTables()
      .then(setLookup)
      .catch(() => setLookupError("Impossibile caricare le tabelle ufficiali (comuni/stati/documenti)."));
  }, []);

  // Ripristina la lista se la pagina viene ricaricata a metà lavoro.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setGuests(JSON.parse(saved));
    } catch {
      // localStorage non disponibile o dato corrotto: si riparte da lista vuota
    }
  }, []);

  function persistGuests(next: AdminGuest[]) {
    setGuests(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // localStorage non disponibile: la lista resta solo in memoria per questa sessione
    }
  }

  function addGuests(newGuests: AdminGuest[]) {
    persistGuests([...guests, ...newGuests]);
    setTab("list");
  }

  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: "scan", label: "Scansiona", icon: "📸" },
    { id: "companion", label: "Companion", icon: "📥" },
    { id: "import", label: "Importa", icon: "📂" },
    { id: "list", label: "Ospiti", icon: "👥" },
    { id: "send", label: "Invia", icon: "🚔" },
  ];

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col">
      <header className="border-b border-neutral-200 px-5 py-4">
        <a href="/admin" className="mb-2 inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700">
          ← Torna a Admin
        </a>
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-medium">Alloggiati Companion — Admin</h1>
          <LogoutButton type="admin" />
        </div>
        <p className="text-sm text-neutral-500">Gestione ospiti e invio schedine</p>
        {lookupError && <p className="mt-1 text-xs text-red-500">{lookupError}</p>}
      </header>

      <nav className="flex overflow-x-auto border-b border-neutral-200">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex shrink-0 items-center gap-1.5 border-b-2 px-4 py-3 text-sm ${
              tab === t.id
                ? "border-neutral-900 font-medium text-neutral-900"
                : "border-transparent text-neutral-500"
            }`}
          >
            <span>{t.icon}</span>
            {t.label}
            {t.id === "list" && guests.length > 0 && (
              <span className="ml-1 rounded-full bg-neutral-200 px-1.5 text-xs">{guests.length}</span>
            )}
          </button>
        ))}
      </nav>

      <main className="flex-1 px-5 py-5">
        {tab === "scan" && <ScanTab structures={structures} onAdd={addGuests} />}
        {tab === "companion" && <CompanionTab structures={structures} onAdd={addGuests} />}
        {tab === "import" && <ImportTab onAdd={addGuests} />}
        {tab === "list" && (
          <GuestListTab
            guests={guests}
            setGuests={persistGuests}
            lookup={lookup}
            structures={structures}
          />
        )}
        {tab === "send" && <SendTab guests={guests} lookup={lookup} structures={structures} />}
      </main>
    </div>
  );
}

// ── Tab: Scansiona ──────────────────────────────

function ScanTab({
  structures,
  onAdd,
}: {
  structures: StructureOption[];
  onAdd: (guests: AdminGuest[]) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [strutturaSlug, setStrutturaSlug] = useState<PropertySlug | "">("");
  const [phase, setPhase] = useState<"capture" | "processing" | "review">("capture");
  const [ocrRawText, setOcrRawText] = useState("");
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [draftGuest, setDraftGuest] = useState<AdminGuest | null>(null);

  const selectedStruttura = structures.find((s) => s.slug === strutturaSlug);

  async function runOcr(files: FileList) {
    if (!strutturaSlug) {
      alert("Seleziona prima la struttura di destinazione.");
      return;
    }
    setPhase("processing");
    setOcrError(null);

    const dataUrls = await Promise.all(
      Array.from(files).map(
        (file) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (ev) => resolve(ev.target?.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          })
      )
    );

    let combinedText = "";
    const confidences: number[] = [];
    try {
      for (const img of dataUrls) {
        const pre = await preprocessImage(img);
        const { text, confidence } = await callVisionOCR(pre, strutturaSlug as PropertySlug);
        combinedText += "\n" + text;
        if (typeof confidence === "number") confidences.push(confidence);
      }
    } catch (err) {
      setOcrError((err as Error).message || "Servizio OCR non raggiungibile.");
    }

    const avg = confidences.length ? confidences.reduce((a, b) => a + b, 0) / confidences.length : null;
    setOcrRawText(combinedText);
    startReviewFromDraft(combinedText, avg);
  }

  function startReviewFromDraft(text: string, confidence: number | null) {
    const draft = text
      ? ocrResultToGuestDraft(extractFieldsFromText(text), confidence)
      : { ...emptyGuestDraft() };
    const admin = emptyAdminGuest(strutturaSlug as string, text ? "scansione" : "manuale");
    admin.cognome = draft.personal.lastName;
    admin.nome = draft.personal.firstName;
    admin.data_nascita = draft.personal.birthDate;
    admin.sesso = draft.personal.gender;
    admin.comune_nascita = draft.personal.birthPlace;
    admin.provincia_nascita = draft.personal.birthProvince;
    admin.stato_nascita = draft.personal.birthCountry;
    admin.cittadinanza = draft.personal.nationality;
    admin.tipo_documento = draft.document.type;
    admin.numero_documento = draft.document.number;
    admin.luogo_rilascio = draft.document.issuePlace;
    admin.data_arrivo = getDateFormatted(0);
    setDraftGuest(admin);
    setPhase("review");
  }

  function startManualEntry() {
    if (!strutturaSlug) {
      alert("Seleziona prima la struttura di destinazione.");
      return;
    }
    setOcrRawText("");
    startReviewFromDraft("", null);
  }

  function updateDraft<K extends keyof AdminGuest>(key: K, value: AdminGuest[K]) {
    setDraftGuest((d) => (d ? { ...d, [key]: value } : d));
  }

  function confirmAdd() {
    if (!draftGuest) return;
    if (!draftGuest.cognome && !draftGuest.nome) {
      alert("Inserisci almeno il Cognome o il Nome per aggiungere l'ospite.");
      return;
    }
    onAdd([draftGuest]);
    setDraftGuest(null);
    setPhase("capture");
    setOcrRawText("");
  }

  if (phase === "capture") {
    return (
      <div className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Struttura di destinazione</label>
          <select
            value={strutturaSlug}
            onChange={(e) => setStrutturaSlug(e.target.value as PropertySlug)}
            className="w-full rounded-lg border border-neutral-300 bg-white p-2.5 text-sm"
          >
            <option value="">-- Seleziona struttura --</option>
            {structures.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.name} ({s.policeStructureId})
              </option>
            ))}
          </select>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && runOcr(e.target.files)}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={!strutturaSlug}
          className="rounded-lg bg-neutral-900 px-5 py-3 font-medium text-white disabled:opacity-40"
        >
          📸 Scatta / carica foto documento
        </button>
        <button
          onClick={startManualEntry}
          disabled={!strutturaSlug}
          className="rounded-lg border border-neutral-300 px-5 py-3 text-sm font-medium disabled:opacity-40"
        >
          Compilazione manuale (senza foto)
        </button>
      </div>
    );
  }

  if (phase === "processing") {
    return <p className="text-sm text-neutral-500">Lettura del documento in corso…</p>;
  }

  if (!draftGuest) return null;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-neutral-600">
        Struttura: <strong>{selectedStruttura?.name}</strong>
      </p>
      {ocrError && <p className="text-sm text-amber-600">{ocrError}</p>}
      {ocrRawText && (
        <details className="rounded-lg bg-neutral-50 p-3 text-xs text-neutral-500">
          <summary className="cursor-pointer font-medium">Testo OCR grezzo</summary>
          <pre className="mt-2 whitespace-pre-wrap">{ocrRawText.trim()}</pre>
        </details>
      )}

      <GuestForm guest={draftGuest} onChange={updateDraft} />

      <button onClick={confirmAdd} className="rounded-lg bg-neutral-900 px-5 py-3 font-medium text-white">
        Aggiungi alla lista principale
      </button>
    </div>
  );
}

// ── Tab: Companion (carica da Google Sheet) ─────

function CompanionTab({
  structures,
  onAdd,
}: {
  structures: StructureOption[];
  onAdd: (guests: AdminGuest[]) => void;
}) {
  const [dateFilter, setDateFilter] = useState<"today" | "yesterday">("today");
  const [strutturaId, setStrutturaId] = useState("");
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    if (!strutturaId) {
      setStatus({ type: "error", text: "Seleziona una struttura" });
      return;
    }
    const dataArrivo = getDateFormatted(dateFilter === "today" ? 0 : -1);
    setLoading(true);
    setStatus({ type: "success", text: "Caricamento dati dal foglio…" });
    try {
      const res = await fetch("/api/guests", {
        method: "POST",
        headers: withAppToken({ "Content-Type": "application/json" }),
        body: JSON.stringify({ property: strutturaId, data_arrivo: dataArrivo }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        setStatus({ type: "error", text: (data && data.error) || `HTTP ${res.status}` });
        return;
      }
      if (data.guests.length === 0) {
        setStatus({
          type: "error",
          text: `Nessun ospite trovato per ${dateFilter === "today" ? "oggi" : "ieri"} nella struttura selezionata`,
        });
        return;
      }
      interface SheetGuest {
        struttura_id?: string;
        tipo_alloggiato?: string;
        data_arrivo?: string;
        permanenza?: string;
        cognome?: string;
        nome?: string;
        sesso?: string;
        data_nascita?: string;
        comune_nascita?: string;
        provincia_nascita?: string;
        stato_nascita?: string;
        cittadinanza?: string;
        tipo_documento?: string;
        numero_documento?: string;
        luogo_rilascio?: string;
      }
      const sheetGuests: AdminGuest[] = (data.guests as SheetGuest[]).map((g, index) => ({
        uiId: `guest-${Date.now()}-${index}`,
        selected: true,
        source: "companion",
        struttura_id: g.struttura_id || strutturaId,
        tipo_alloggiato: g.tipo_alloggiato || "",
        data_arrivo: g.data_arrivo || "",
        permanenza: g.permanenza || "1",
        cognome: g.cognome || "",
        nome: g.nome || "",
        sesso: g.sesso || "",
        data_nascita: g.data_nascita || "",
        comune_nascita: g.comune_nascita || "",
        provincia_nascita: g.provincia_nascita || "",
        stato_nascita: g.stato_nascita || "",
        cittadinanza: g.cittadinanza || "",
        tipo_documento: g.tipo_documento || "",
        numero_documento: g.numero_documento || "",
        luogo_rilascio: g.luogo_rilascio || "",
      }));
      onAdd(sheetGuests);
      setStatus({ type: "success", text: `Caricati ${sheetGuests.length} ospiti` });
    } catch {
      setStatus({ type: "error", text: "Errore di rete nel caricamento dei dati." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-neutral-600">
        Carica gli ospiti già registrati sul foglio Google (Companion) collegato alla struttura.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs text-neutral-500">Data di arrivo</label>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as "today" | "yesterday")}
            className="w-full rounded-lg border border-neutral-300 bg-white p-2.5 text-sm"
          >
            <option value="today">Oggi</option>
            <option value="yesterday">Ieri</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-neutral-500">Struttura</label>
          <select
            value={strutturaId}
            onChange={(e) => setStrutturaId(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 bg-white p-2.5 text-sm"
          >
            <option value="">-- Seleziona struttura --</option>
            {structures.map((s) => (
              <option key={s.slug} value={s.policeStructureId}>
                {s.name} ({s.policeStructureId})
              </option>
            ))}
          </select>
        </div>
      </div>
      <button
        onClick={load}
        disabled={loading}
        className="rounded-lg bg-neutral-900 px-5 py-3 font-medium text-white disabled:opacity-40"
      >
        📥 Carica dati
      </button>
      {status && (
        <p className={`text-sm ${status.type === "error" ? "text-red-500" : "text-neutral-600"}`}>{status.text}</p>
      )}
    </div>
  );
}

// ── Tab: Importa ────────────────────────────────

function ImportTab({ onAdd }: { onAdd: (guests: AdminGuest[]) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      const newGuests = parseImportFile(content);
      if (newGuests.length === 0) {
        setStatus({ type: "error", text: "Nessun dato valido trovato nel file" });
        return;
      }
      onAdd(newGuests);
      setStatus({ type: "success", text: `Importati ${newGuests.length} ospiti dal file` });
      e.target.value = "";
      setFileName("");
    };
    reader.readAsText(file, "UTF-8");
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-neutral-600">
        Importa un file TXT (formato fisso Alloggiati Web, 168 caratteri) oppure un CSV/TSV con
        intestazioni.
      </p>
      <input ref={fileInputRef} type="file" accept=".txt,.csv,.tsv" className="hidden" onChange={onFile} />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="rounded-lg bg-neutral-900 px-5 py-3 font-medium text-white"
      >
        📂 Importa da TXT/CSV
      </button>
      {fileName && <p className="text-xs text-neutral-400">{fileName}</p>}
      {status && (
        <p className={`text-sm ${status.type === "error" ? "text-red-500" : "text-neutral-600"}`}>{status.text}</p>
      )}
    </div>
  );
}

// ── Form ospite condiviso (Scan review + Edit modal) ─

export function GuestForm({
  guest,
  onChange,
}: {
  guest: AdminGuest;
  onChange: <K extends keyof AdminGuest>(key: K, value: AdminGuest[K]) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2">
        <TextField label="Data arrivo" value={guest.data_arrivo} onChange={(v) => onChange("data_arrivo", v)} placeholder="gg/mm/aaaa" />
        <TextField label="Permanenza (gg)" value={guest.permanenza} onChange={(v) => onChange("permanenza", v)} />
      </div>
      <SelectField
        label="Tipo alloggiato"
        value={guest.tipo_alloggiato}
        options={GUEST_TYPE_OPTIONS as unknown as string[]}
        onChange={(v) => onChange("tipo_alloggiato", v)}
      />
      <div className="grid grid-cols-2 gap-2">
        <TextField label="Cognome" value={guest.cognome} onChange={(v) => onChange("cognome", v)} />
        <TextField label="Nome" value={guest.nome} onChange={(v) => onChange("nome", v)} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <TextField label="Data nascita" value={guest.data_nascita} onChange={(v) => onChange("data_nascita", v)} placeholder="gg/mm/aaaa" />
        <SelectField label="Sesso" value={guest.sesso} options={["M", "F"]} onChange={(v) => onChange("sesso", v)} allowEmpty />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <TextField label="Comune di nascita" value={guest.comune_nascita} onChange={(v) => onChange("comune_nascita", v)} />
        <TextField label="Provincia (se Italia)" value={guest.provincia_nascita} onChange={(v) => onChange("provincia_nascita", v)} />
      </div>
      <SelectField label="Stato di nascita" value={guest.stato_nascita} options={STATI_LIST} onChange={(v) => onChange("stato_nascita", v)} allowEmpty />
      <SelectField label="Cittadinanza" value={guest.cittadinanza} options={STATI_LIST} onChange={(v) => onChange("cittadinanza", v)} allowEmpty />
      <SelectField label="Tipo documento" value={guest.tipo_documento} options={DOCUMENTI_LIST} onChange={(v) => onChange("tipo_documento", v)} allowEmpty />
      <TextField label="Numero documento" value={guest.numero_documento} onChange={(v) => onChange("numero_documento", v)} />
      <TextField label="Luogo di rilascio" value={guest.luogo_rilascio} onChange={(v) => onChange("luogo_rilascio", v)} />
    </div>
  );
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs text-neutral-500">{label}</label>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-neutral-300 p-2 text-sm"
      />
    </div>
  );
}

export function SelectField({
  label,
  value,
  options,
  onChange,
  allowEmpty,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  allowEmpty?: boolean;
}) {
  const allOptions = value && !options.includes(value) ? [value, ...options] : options;
  return (
    <div>
      <label className="mb-1 block text-xs text-neutral-500">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-neutral-300 bg-white p-2 text-sm"
      >
        {allowEmpty && <option value="">—</option>}
        {allOptions.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
