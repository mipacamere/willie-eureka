"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { PropertySlug } from "@/config/properties";
import { withAppToken } from "@/lib/client-app-token";
import { preprocessImage } from "@/lib/ocr/preprocess";
import { callVisionOCR } from "@/lib/ocr/vision-client";
import {
  extractFieldsFromText,
  ocrResultToGuestDraft,
  setNestedField,
  type GuestDraft,
} from "@/lib/ocr/extract-fields";
import { STATI_LIST, DOCUMENTI_LIST, GUEST_TYPE_OPTIONS } from "@/lib/ocr/constants";
import { validateGuest } from "@/lib/ocr/validate";
import { downloadOnly, type ExportPropertyInfo } from "@/lib/ocr/export";

/**
 * Porting del flusso "Documenti ospiti / Schedine Alloggiati" di
 * mipacompanion/vncompanion, pipeline OCR completa (lib/ocr/) +
 * gestione multi-ospite: si possono accumulare più ospiti (es. una
 * famiglia) prima dell'invio unico, esattamente come
 * addGuestToList/removeGuestFromList/editGuestFromList nell'originale.
 *
 * Non ancora portato: il download manuale del file JSON come riserva
 * (downloadOnly/buildExportFile) — qui l'unico canale è l'invio
 * automatico al Google Sheet condiviso.
 */

type Step = "capture" | "processing" | "review" | "list" | "done";

const STORAGE_KEY_PREFIX = "checkin_schedine_";

export function CheckinFlow({
  slug,
  token,
  exportInfo,
}: {
  slug: PropertySlug;
  token: string;
  exportInfo: ExportPropertyInfo;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const storageKey = STORAGE_KEY_PREFIX + slug;

  const [step, setStep] = useState<Step>("capture");
  const [images, setImages] = useState<string[]>([]);
  const [ocrRawText, setOcrRawText] = useState("");
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [draft, setDraft] = useState<GuestDraft | null>(null);
  const [schedine, setSchedine] = useState<GuestDraft[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [downloadedMsg, setDownloadedMsg] = useState(false);

  // Ripristina la pratica in corso se l'ospite ha chiuso la pagina a metà
  // (stesso comportamento di mipa_schedine in localStorage nell'originale).
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved) as GuestDraft[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSchedine(parsed);
          setStep("list");
        }
      }
    } catch {
      // localStorage non disponibile o dato corrotto: si riparte da zero, non blocca il flusso
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function persistSchedine(next: GuestDraft[]) {
    setSchedine(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      // localStorage non disponibile: la pratica resta solo in memoria per questa sessione
    }
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    Promise.all(
      files.map(
        (file) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (ev) => resolve(ev.target?.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          })
      )
    ).then((dataUrls) => {
      const all = [...images, ...dataUrls];
      setImages(all);
      runOcr(all);
    });
  }

  // Porting di runOCR(): pre-elabora ogni immagine, chiama Vision per
  // ognuna, concatena il testo, poi estrae i campi dal testo combinato.
  async function runOcr(imgs: string[]) {
    setStep("processing");
    setOcrError(null);

    let combinedText = "";
    const confidences: number[] = [];

    try {
      for (const img of imgs) {
        const pre = await preprocessImage(img);
        const { text, confidence } = await callVisionOCR(pre, slug);
        combinedText += "\n" + text;
        if (typeof confidence === "number") confidences.push(confidence);
      }
    } catch (err) {
      console.warn("Vision OCR non disponibile:", err);
      setOcrError(
        (err as Error).message ||
          "Servizio OCR non raggiungibile. Puoi comunque compilare i campi a mano."
      );
      combinedText = "";
    }

    const avgConfidence = confidences.length
      ? confidences.reduce((a, b) => a + b, 0) / confidences.length
      : null;

    setOcrRawText(combinedText);
    setDraft(ocrResultToGuestDraft(extractFieldsFromText(combinedText), avgConfidence));
    setValidationErrors([]);
    setStep("review");
  }

  function updateField(path: string, value: string) {
    setDraft((d) => {
      if (!d) return d;
      const next: GuestDraft = JSON.parse(JSON.stringify(d));
      setNestedField(next, path, value);
      return next;
    });
  }

  // Porting di addGuestToList(): valida, se ok accoda alla lista e torna
  // alla schermata elenco; azzera immagini/bozza correnti per il
  // prossimo eventuale ospite.
  function addGuestToList() {
    if (!draft) return;
    const errors = validateGuest(draft);
    if (errors.length) {
      setValidationErrors(errors);
      return;
    }
    persistSchedine([...schedine, draft]);
    setDraft(null);
    setImages([]);
    setOcrRawText("");
    setValidationErrors([]);
    setStep("list");
  }

  // Porting di removeGuestFromList(id).
  function removeGuestFromList(id: string) {
    persistSchedine(schedine.filter((g) => g.id !== id));
  }

  // Porting di editGuestFromList(id): copia profonda nella bozza, lo
  // toglie dalla lista, torna alla revisione (senza rifare l'OCR).
  function editGuestFromList(id: string) {
    const guest = schedine.find((g) => g.id === id);
    if (!guest) return;
    setDraft(JSON.parse(JSON.stringify(guest)));
    persistSchedine(schedine.filter((g) => g.id !== id));
    setImages([]);
    setOcrRawText("");
    setValidationErrors([]);
    setStep("review");
  }

  // Porting di downloadOnly() + il messaggio informativo mostrato dopo (era
  // un alert() nell'originale, qui un avviso inline transitorio).
  function handleDownload() {
    downloadOnly(schedine, exportInfo);
    setDownloadedMsg(true);
    setTimeout(() => setDownloadedMsg(false), 6000);
  }

  function startNewGuest() {
    setDraft(null);
    setImages([]);
    setOcrRawText("");
    setValidationErrors([]);
    setStep("capture");
  }

  // Invio unico di tutta la pratica (tutti gli ospiti accumulati) al
  // Google Sheet condiviso — porting di sendAutomatically(), adattato
  // per inviare l'intera lista invece di un ospite alla volta.
  async function sendAll() {
    if (schedine.length === 0) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/guests/append", {
        method: "POST",
        headers: withAppToken({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          exportData: {
            structure: { code: exportInfo.policeStructureId },
            exportDate: new Date().toISOString(),
            guests: schedine,
          },
        }),
      });
      if (!res.ok) throw new Error();

      try {
        localStorage.setItem(`guest_name_${slug}`, schedine[0].personal.firstName.trim());
        localStorage.removeItem(storageKey);
      } catch {
        // localStorage non disponibile: non blocca comunque l'invio già andato a buon fine
      }
      setSchedine([]);
      setStep("done");
    } catch {
      setSubmitError(
        "Non è stato possibile inviare i dati in automatico. Riprova, oppure contattaci su WhatsApp."
      );
    } finally {
      setSubmitting(false);
    }
  }

  // ── Step: capture ──────────────────────────────

  if (step === "capture") {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-6 text-center">
        <div>
          <h1 className="text-xl font-medium">Documenti ospiti</h1>
          <p className="mt-2 text-sm text-neutral-600">
            Scatta o carica una foto del documento (passaporto, carta d&apos;identità o
            patente). Se il documento ha informazioni anche sul retro, puoi aggiungere una
            seconda foto.
          </p>
          {schedine.length > 0 && (
            <p className="mt-3 text-xs text-neutral-500">
              {schedine.length} ospite{schedine.length > 1 ? "i" : ""} già aggiunto
              {schedine.length > 1 ? "i" : ""} a questa pratica.
            </p>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          multiple
          className="hidden"
          onChange={onFileChange}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="rounded-lg px-5 py-4 font-medium text-white"
          style={{ backgroundColor: "var(--property-primary)" }}
        >
          Scatta / carica foto
        </button>
        {schedine.length > 0 && (
          <button
            onClick={() => setStep("list")}
            className="rounded-lg border border-neutral-300 px-5 py-3 text-sm font-medium"
          >
            Torna all&apos;elenco ospiti
          </button>
        )}
        <p className="text-xs text-neutral-400">
          Le foto vengono elaborate da un servizio OCR di terze parti (Google Cloud Vision) solo
          per leggere il testo del documento.
        </p>
      </div>
    );
  }

  // ── Step: processing ───────────────────────────

  if (step === "processing") {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-3 px-6 text-center">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
          style={{ borderColor: "var(--property-primary)", borderTopColor: "transparent" }}
        />
        <p className="text-sm text-neutral-600">Lettura del documento in corso…</p>
      </div>
    );
  }

  // ── Step: list ─────────────────────────────────

  if (step === "list") {
    return (
      <div className="mx-auto max-w-md px-5 py-6">
        <h1 className="text-lg font-medium">Ospiti in questa pratica</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Aggiungi ogni ospite del soggiorno, poi invia tutti insieme.
        </p>

        <div className="mt-4 flex flex-col gap-2">
          {schedine.length === 0 && (
            <p className="rounded-lg bg-neutral-50 p-4 text-center text-sm text-neutral-500">
              Nessun ospite ancora aggiunto.
            </p>
          )}
          {schedine.map((g) => (
            <div
              key={g.id}
              className="flex items-center justify-between gap-2 rounded-xl border border-neutral-200 p-3"
            >
              <div>
                <p className="font-medium">
                  {g.personal.firstName} {g.personal.lastName}
                </p>
                <p className="text-xs text-neutral-500">
                  {g.document.type || "Documento"} · {g.document.number || "—"}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  onClick={() => editGuestFromList(g.id)}
                  className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium"
                >
                  Modifica
                </button>
                <button
                  onClick={() => removeGuestFromList(g.id)}
                  className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600"
                >
                  Rimuovi
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={startNewGuest}
          className="mt-4 w-full rounded-lg border border-neutral-300 px-5 py-3 text-sm font-medium"
        >
          + Aggiungi un altro ospite
        </button>

        {submitError && (
          <div className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
            <p>{submitError}</p>
            <button onClick={handleDownload} className="mt-2 underline">
              Scarica il file e invialo a mano (WhatsApp, Telegram, email…)
            </button>
          </div>
        )}

        <button
          onClick={sendAll}
          disabled={schedine.length === 0 || submitting}
          className="mt-3 w-full rounded-lg px-5 py-3 font-medium text-white disabled:opacity-40"
          style={{ backgroundColor: "var(--property-primary)" }}
        >
          {submitting
            ? "Invio in corso…"
            : `Invia ${schedine.length || ""} ospite${schedine.length === 1 ? "" : "i"} alla struttura`}
        </button>

        {schedine.length > 0 && (
          <button
            onClick={handleDownload}
            className="mt-2 w-full text-center text-xs text-neutral-400 underline"
          >
            Oppure scarica il file invece di inviarlo automaticamente
          </button>
        )}
        {downloadedMsg && (
          <p className="mt-2 text-center text-xs text-green-600">
            File scaricato. Invialo con lo strumento che preferisci: WhatsApp, Telegram, email o
            un altro ancora.
          </p>
        )}
      </div>
    );
  }

  // ── Step: done ─────────────────────────────────

  if (step === "done") {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
        <span className="text-4xl">✓</span>
        <h1 className="text-xl font-medium">Dati inviati</h1>
        <p className="text-sm text-neutral-600">
          Grazie! I dati sono stati registrati. Buon soggiorno.
        </p>
        <button
          onClick={() => router.push(`/guest/${token}/app`)}
          className="rounded-lg px-5 py-3 font-medium text-white"
          style={{ backgroundColor: "var(--property-primary)" }}
        >
          Vai all&apos;app
        </button>
      </div>
    );
  }

  // ── Step: review ───────────────────────────────

  if (!draft) return null;
  const d = draft; // narrowing per i callback qui sotto

  return (
    <div className="mx-auto max-w-md px-5 py-6">
      <h1 className="text-lg font-medium">Controlla i dati dell&apos;ospite</h1>
      <p className="mt-1 text-sm text-neutral-600">
        Campi riconosciuti automaticamente dal documento: verificali e completa quelli mancanti
        prima di aggiungere l&apos;ospite alla pratica.
      </p>

      {d.document.ocrConfidence != null && (
        <p className="mt-2 text-xs text-neutral-400">
          Affidabilità lettura OCR: {Math.round(d.document.ocrConfidence * 100)}%
        </p>
      )}

      {images.length > 0 && (
        <div className="mt-4 flex gap-2 overflow-x-auto">
          {images.map((img, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={img}
              alt={`Documento ${i + 1}`}
              className="h-24 w-auto shrink-0 rounded-lg object-cover"
            />
          ))}
        </div>
      )}

      {ocrError && <p className="mt-3 text-sm text-amber-600">{ocrError}</p>}
      {!ocrError && ocrRawText && (
        <details className="mt-3 rounded-lg bg-neutral-50 p-3 text-xs text-neutral-500">
          <summary className="cursor-pointer font-medium">Testo OCR grezzo (riferimento)</summary>
          <pre className="mt-2 whitespace-pre-wrap">{ocrRawText.trim()}</pre>
        </details>
      )}

      <div className="mt-5 flex flex-col gap-4">
        <FieldGroup title="Soggiorno">
          <TextField
            label="Data di arrivo"
            value={d.stay.arrivalDate}
            onChange={(v) => updateField("stay.arrivalDate", v)}
            placeholder="gg/mm/aaaa"
          />
          <TextField
            label="Data di partenza"
            value={d.stay.departureDate}
            onChange={(v) => updateField("stay.departureDate", v)}
            placeholder="gg/mm/aaaa"
          />
          <SelectField
            label="Tipo ospite"
            value={d.stay.guestType}
            options={GUEST_TYPE_OPTIONS as unknown as string[]}
            onChange={(v) => updateField("stay.guestType", v)}
          />
        </FieldGroup>

        <FieldGroup title="Dati anagrafici">
          <TextField
            label="Cognome"
            value={d.personal.lastName}
            onChange={(v) => updateField("personal.lastName", v)}
          />
          <TextField
            label="Nome"
            value={d.personal.firstName}
            onChange={(v) => updateField("personal.firstName", v)}
          />
          <SelectField
            label="Sesso"
            value={d.personal.gender}
            options={["M", "F"]}
            onChange={(v) => updateField("personal.gender", v)}
            allowEmpty
          />
        </FieldGroup>

        <FieldGroup title="Nascita e cittadinanza">
          <TextField
            label="Data di nascita"
            value={d.personal.birthDate}
            onChange={(v) => updateField("personal.birthDate", v)}
            placeholder="gg/mm/aaaa"
          />
          <TextField
            label="Luogo di nascita"
            value={d.personal.birthPlace}
            onChange={(v) => updateField("personal.birthPlace", v)}
          />
          <TextField
            label="Provincia (solo se nato in Italia)"
            value={d.personal.birthProvince}
            onChange={(v) => updateField("personal.birthProvince", v)}
          />
          <SelectField
            label="Stato di nascita"
            value={d.personal.birthCountry}
            options={STATI_LIST}
            onChange={(v) => updateField("personal.birthCountry", v)}
            allowEmpty
          />
          <SelectField
            label="Cittadinanza"
            value={d.personal.nationality}
            options={STATI_LIST}
            onChange={(v) => updateField("personal.nationality", v)}
            allowEmpty
          />
        </FieldGroup>

        <FieldGroup title="Documento">
          <SelectField
            label="Tipo documento"
            value={d.document.type}
            options={DOCUMENTI_LIST}
            onChange={(v) => updateField("document.type", v)}
            allowEmpty
          />
          <TextField
            label="Numero documento"
            value={d.document.number}
            onChange={(v) => updateField("document.number", v)}
          />
          <TextField
            label="Luogo di rilascio"
            value={d.document.issuePlace}
            onChange={(v) => updateField("document.issuePlace", v)}
          />
        </FieldGroup>
      </div>

      {validationErrors.length > 0 && (
        <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          <p className="font-medium">Completa questi campi prima di continuare:</p>
          <ul className="mt-1 list-disc pl-5">
            {validationErrors.map((err) => (
              <li key={err}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-5 flex flex-col gap-2">
        <button
          onClick={addGuestToList}
          className="w-full rounded-lg px-5 py-3 font-medium text-white"
          style={{ backgroundColor: "var(--property-primary)" }}
        >
          Aggiungi ospite alla pratica
        </button>
        {schedine.length > 0 && (
          <button
            onClick={() => setStep("list")}
            className="w-full rounded-lg border border-neutral-300 px-5 py-3 text-sm font-medium"
          >
            Annulla e torna all&apos;elenco
          </button>
        )}
      </div>
    </div>
  );
}

function FieldGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-neutral-500">{title}</p>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

function TextField({
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
        className="w-full rounded-lg border border-neutral-300 p-2.5 text-sm"
      />
    </div>
  );
}

function SelectField({
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
  // Se il valore riconosciuto dall'OCR non combacia con nessuna voce ufficiale (raro, ma
  // possibile con un fuzzy-match sotto soglia), lo mostriamo comunque come opzione extra
  // invece di farlo sparire silenziosamente dal campo.
  const allOptions = value && !options.includes(value) ? [value, ...options] : options;
  return (
    <div>
      <label className="mb-1 block text-xs text-neutral-500">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-neutral-300 bg-white p-2.5 text-sm"
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
