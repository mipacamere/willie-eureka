"use client";

import { useState } from "react";
import type { PropertySlug } from "@/config/properties";
import { withAppToken } from "@/lib/client-app-token";
import type { LookupTables } from "@/lib/alloggiati/admin/lookup";
import { buildRecordsForSelected, buildRegioneStaysForSelected, type AdminGuest } from "@/lib/alloggiati/admin/records";
import { downloadRecordsTxt } from "@/lib/alloggiati/admin/export-txt";
import type { StructureOption } from "./AlloggiatiAdmin";

interface EsitoRiga {
  riga: number;
  errore: string;
}
interface EsitoSchedine {
  topLevelError?: string;
  schedineValide?: number | null;
  totaleRighe?: number;
  perRiga?: EsitoRiga[];
  error?: string;
}

export function SendTab({
  guests,
  lookup,
  structures,
}: {
  guests: AdminGuest[];
  lookup: LookupTables | null;
  structures: StructureOption[];
}) {
  const [strutturaSlug, setStrutturaSlug] = useState<PropertySlug | "">("");
  const [questuraBusy, setQuesturaBusy] = useState<"test" | "send" | null>(null);
  const [questuraResult, setQuesturaResult] = useState<React.ReactNode>(null);
  const [regioneBusy, setRegioneBusy] = useState(false);
  const [regioneResult, setRegioneResult] = useState<React.ReactNode>(null);

  const selectedCount = guests.filter((g) => g.selected).length;
  const struttura = structures.find((s) => s.slug === strutturaSlug);

  function renderEsitoQuestura(
    data: EsitoSchedine | null,
    resOk: boolean,
    warnings: string[],
    selectedGuests: AdminGuest[],
    wasSend: boolean
  ) {
    if (!resOk || !data || data.error) {
      setQuesturaResult(
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          Errore: {data?.error || "risposta inattesa dal server"}
        </div>
      );
      return;
    }
    const perRiga = data.perRiga || [];
    const righeConErrore = perRiga.filter((r) => r.errore);
    setQuesturaResult(
      <div className="flex flex-col gap-2">
        {warnings.length > 0 && (
          <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
            <p className="font-medium">Attenzione, controlla questi campi:</p>
            <ul className="mt-1 list-disc pl-5">
              {warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>
        )}
        {data.topLevelError && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{data.topLevelError}</div>
        )}
        <div className="rounded-lg bg-green-50 p-3 text-sm text-green-800">
          {wasSend ? "Invio completato." : "Convalida completata."} Schedine valide:{" "}
          {data.schedineValide ?? "n/d"} / {data.totaleRighe ?? selectedGuests.length}
        </div>
        {righeConErrore.length > 0 && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            <p className="font-medium">Errori per riga:</p>
            <ul className="mt-1 list-disc pl-5">
              {righeConErrore.map((r) => (
                <li key={r.riga}>
                  Riga {r.riga} ({selectedGuests[r.riga - 1]?.cognome} {selectedGuests[r.riga - 1]?.nome}):{" "}
                  {r.errore}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  async function testWithQuestura() {
    if (!lookup) return;
    const { records, warnings, selectedGuests } = buildRecordsForSelected(guests, lookup);
    if (records.length === 0) {
      setQuesturaResult(<p className="text-sm text-red-500">Nessun ospite selezionato</p>);
      return;
    }
    if (!strutturaSlug) {
      setQuesturaResult(<p className="text-sm text-amber-600">Seleziona una struttura</p>);
      return;
    }
    setQuesturaBusy("test");
    setQuesturaResult(<p className="text-sm text-neutral-500">Convalida in corso con il sistema della Questura…</p>);
    try {
      const res = await fetch("/api/alloggiati/test", {
        method: "POST",
        headers: withAppToken({ "Content-Type": "application/json" }),
        body: JSON.stringify({ property: strutturaSlug, righe: records }),
      });
      const data = await res.json().catch(() => null);
      renderEsitoQuestura(data, res.ok, warnings, selectedGuests, false);
    } catch (err) {
      setQuesturaResult(<p className="text-sm text-red-500">Errore di rete: {(err as Error).message}</p>);
    } finally {
      setQuesturaBusy(null);
    }
  }

  async function sendToQuestura() {
    if (!lookup) return;
    const { records, warnings, selectedGuests } = buildRecordsForSelected(guests, lookup);
    if (records.length === 0) {
      setQuesturaResult(<p className="text-sm text-red-500">Nessun ospite selezionato</p>);
      return;
    }
    if (!strutturaSlug || !struttura) {
      setQuesturaResult(<p className="text-sm text-amber-600">Seleziona una struttura</p>);
      return;
    }
    const conferma = window.confirm(
      `Stai per inviare REALMENTE ${records.length} schedina/e alla Questura tramite il Web Service ufficiale, ` +
        `per la struttura "${struttura.name}" (${struttura.policeStructureId}).\n\n` +
        `Questa operazione non è reversibile. Hai già eseguito la Convalida (Test) e controllato che i dati siano corretti?\n\n` +
        `Premi OK solo se sei sicuro di voler procedere con l'invio reale.`
    );
    if (!conferma) return;

    setQuesturaBusy("send");
    setQuesturaResult(<p className="text-sm text-neutral-500">Invio in corso alla Questura…</p>);
    try {
      const res = await fetch("/api/alloggiati/send", {
        method: "POST",
        headers: withAppToken({ "Content-Type": "application/json" }),
        body: JSON.stringify({ property: strutturaSlug, righe: records, confirm: true }),
      });
      const data = await res.json().catch(() => null);
      renderEsitoQuestura(data, res.ok, warnings, selectedGuests, true);
    } catch (err) {
      setQuesturaResult(<p className="text-sm text-red-500">Errore di rete: {(err as Error).message}</p>);
    } finally {
      setQuesturaBusy(null);
    }
  }

  async function sendToRegioneSicilia() {
    if (!lookup) return;
    if (!strutturaSlug || !struttura) {
      setRegioneResult(<p className="text-sm text-amber-600">Seleziona una struttura</p>);
      return;
    }
    // Il prefisso qui è solo un identificativo leggibile lato client: il HotelCode
    // autorevole (formato TRS-IT-SIC-xxxxx) viene sempre applicato lato server dalle
    // credenziali configurate per la struttura, non da quanto inviato dal browser.
    const { stays, warnings } = buildRegioneStaysForSelected(guests, struttura.policeStructureId, lookup);
    if (stays.length === 0) {
      setRegioneResult(
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          Nessun ospite valido da inviare alla Regione (controlla i campi anagrafici).
          {warnings.length > 0 && (
            <ul className="mt-1 list-disc pl-5">
              {warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          )}
        </div>
      );
      return;
    }

    const conferma = window.confirm(
      `Stai per inviare ${stays.length} ospite/i all'Osservatorio Turistico della Regione Siciliana ` +
        `(fini statistici ISTAT) per la struttura "${struttura.name}" (${struttura.policeStructureId}).\n\n` +
        (warnings.length ? `${warnings.length} ospite/i verranno esclusi per dati mancanti/non riconosciuti.\n\n` : "") +
        `Ricorda: il campo "residenza" richiesto dall'API viene approssimato al luogo di nascita.\n\n` +
        `Premi OK solo se vuoi procedere.`
    );
    if (!conferma) return;

    setRegioneBusy(true);
    setRegioneResult(<p className="text-sm text-neutral-500">Invio in corso alla Regione Siciliana…</p>);
    try {
      const res = await fetch("/api/regione-sicilia/send", {
        method: "POST",
        headers: withAppToken({ "Content-Type": "application/json" }),
        body: JSON.stringify({ property: strutturaSlug, stays }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        setRegioneResult(
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            Errore: {(data && data.error) || `HTTP ${res.status}`}
          </div>
        );
        return;
      }
      setRegioneResult(
        <div className="flex flex-col gap-2">
          {warnings.length > 0 && (
            <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
              <p className="font-medium">Ospiti esclusi (dati mancanti/non riconosciuti):</p>
              <ul className="mt-1 list-disc pl-5">
                {warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="rounded-lg bg-green-50 p-3 text-sm text-green-800">
            Invio completato: {data.totaleInviati ?? stays.length} soggiorni inviati,{" "}
            {data.tuttiValidi ? "tutti validati" : "verificare eventuali segnalazioni"}.
          </div>
        </div>
      );
    } catch (err) {
      setRegioneResult(<p className="text-sm text-red-500">Errore di rete: {(err as Error).message}</p>);
    } finally {
      setRegioneBusy(false);
    }
  }

  function handleDownloadTxt() {
    if (!lookup || !struttura) return;
    const { records } = buildRecordsForSelected(guests, lookup);
    downloadRecordsTxt(records, struttura.name);
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <label className="mb-1 block text-sm font-medium">Struttura</label>
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

      <p className="text-sm text-neutral-500">{selectedCount} ospiti selezionati nella lista.</p>

      {!lookup && <p className="text-sm text-amber-600">Caricamento tabelle ufficiali in corso…</p>}

      <section className="rounded-xl border border-neutral-200 p-4">
        <h2 className="font-medium">🚔 Questura — Alloggiati Web</h2>
        <div className="mt-3 flex flex-col gap-2">
          <button
            onClick={testWithQuestura}
            disabled={!lookup || selectedCount === 0 || questuraBusy !== null}
            className="rounded-lg border border-neutral-300 px-4 py-2.5 text-sm font-medium disabled:opacity-40"
          >
            {questuraBusy === "test" ? "Convalida in corso…" : "Convalida (Test)"}
          </button>
          <button
            onClick={sendToQuestura}
            disabled={!lookup || selectedCount === 0 || questuraBusy !== null}
            className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-40"
          >
            {questuraBusy === "send" ? "Invio in corso…" : "Invia REALMENTE alla Questura"}
          </button>
          <button
            onClick={handleDownloadTxt}
            disabled={!lookup || selectedCount === 0}
            className="text-xs text-neutral-400 underline disabled:opacity-40"
          >
            Scarica il file TXT (168 caratteri) invece di inviarlo
          </button>
        </div>
        {questuraResult && <div className="mt-3">{questuraResult}</div>}
      </section>

      <section className="rounded-xl border border-neutral-200 p-4">
        <h2 className="font-medium">📊 Regione Sicilia — Osservatorio Turistico</h2>
        <p className="mt-1 text-xs text-neutral-500">
          Invio distinto e aggiuntivo, ai fini della rilevazione statistica ISTAT.
        </p>
        <button
          onClick={sendToRegioneSicilia}
          disabled={!lookup || selectedCount === 0 || regioneBusy}
          className="mt-3 rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-40"
        >
          {regioneBusy ? "Invio in corso…" : "Invia alla Regione Sicilia"}
        </button>
        {regioneResult && <div className="mt-3">{regioneResult}</div>}
      </section>
    </div>
  );
}
