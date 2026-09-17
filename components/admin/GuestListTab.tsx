"use client";

import { useState } from "react";
import type { LookupTables } from "@/lib/alloggiati/admin/lookup";
import { buildRecordsForSelected, type AdminGuest } from "@/lib/alloggiati/admin/records";
import { downloadRecordsTxt } from "@/lib/alloggiati/admin/export-txt";
import type { StructureOption } from "./AlloggiatiAdmin";
import { GuestForm } from "./AlloggiatiAdmin";

const SOURCE_LABELS: Record<AdminGuest["source"], string> = {
  scansione: "📸 Scan",
  companion: "📥 Companion",
  file: "📂 File",
  manuale: "✍️ Manuale",
};

export function GuestListTab({
  guests,
  setGuests,
  lookup,
  structures,
}: {
  guests: AdminGuest[];
  setGuests: (g: AdminGuest[]) => void;
  lookup: LookupTables | null;
  structures: StructureOption[];
}) {
  const [editingId, setEditingId] = useState<string | null>(null);

  const total = guests.length;
  const selected = guests.filter((g) => g.selected).length;
  const excluded = total - selected;

  function toggleSelected(uiId: string) {
    setGuests(guests.map((g) => (g.uiId === uiId ? { ...g, selected: !g.selected } : g)));
  }

  function selectAll(value: boolean) {
    setGuests(guests.map((g) => ({ ...g, selected: value })));
  }

  function removeGuest(uiId: string) {
    setGuests(guests.filter((g) => g.uiId !== uiId));
  }

  function clearAll() {
    if (!window.confirm("Svuotare l'intera lista ospiti? L'operazione non è reversibile.")) return;
    setGuests([]);
  }

  function saveEdit(updated: AdminGuest) {
    setGuests(guests.map((g) => (g.uiId === updated.uiId ? updated : g)));
    setEditingId(null);
  }

  function handleGenerateTxt() {
    if (!lookup) return;
    const { records, warnings } = buildRecordsForSelected(guests, lookup);
    if (warnings.length > 0) {
      window.alert(
        "Attenzione, alcuni campi non sono stati riconosciuti e potrebbero mancare nel file:\n\n" +
          warnings.join("\n")
      );
    }
    const label = structures[0]?.name ?? "struttura";
    downloadRecordsTxt(records, label);
  }

  const editingGuest = guests.find((g) => g.uiId === editingId) || null;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-2 text-center">
        <Stat label="Totale" value={total} />
        <Stat label="Selezionati" value={selected} />
        <Stat label="Esclusi" value={excluded} />
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => selectAll(true)} className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium">
          Seleziona tutti
        </button>
        <button onClick={() => selectAll(false)} className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium">
          Deseleziona tutti
        </button>
        <button
          onClick={handleGenerateTxt}
          disabled={!lookup || selected === 0}
          className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium disabled:opacity-40"
        >
          Genera TXT
        </button>
        <button
          onClick={clearAll}
          disabled={total === 0}
          className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 disabled:opacity-40"
        >
          Svuota lista
        </button>
      </div>

      {total === 0 && (
        <p className="rounded-lg bg-neutral-50 p-4 text-center text-sm text-neutral-500">
          Nessun ospite in lista. Usa Scansiona, Companion o Importa per aggiungerne.
        </p>
      )}

      <div className="flex flex-col gap-2">
        {guests.map((g) => (
          <div key={g.uiId} className="flex items-start gap-3 rounded-xl border border-neutral-200 p-3">
            <input
              type="checkbox"
              checked={g.selected}
              onChange={() => toggleSelected(g.uiId)}
              className="mt-1"
            />
            <div className="flex-1">
              <p className="font-medium">
                {g.cognome} {g.nome}
              </p>
              <p className="text-xs text-neutral-500">
                {SOURCE_LABELS[g.source]} · {g.tipo_documento || "documento n/d"} ·{" "}
                {g.numero_documento || "—"}
              </p>
              <p className="text-xs text-neutral-400">
                Arrivo {g.data_arrivo || "—"} · {g.permanenza || "?"} notti · {g.tipo_alloggiato || "—"}
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-1">
              <button
                onClick={() => setEditingId(g.uiId)}
                className="rounded-lg border border-neutral-300 px-3 py-1 text-xs font-medium"
              >
                Modifica
              </button>
              <button
                onClick={() => removeGuest(g.uiId)}
                className="rounded-lg border border-red-200 px-3 py-1 text-xs font-medium text-red-600"
              >
                Rimuovi
              </button>
            </div>
          </div>
        ))}
      </div>

      {editingGuest && (
        <EditModal
          guest={editingGuest}
          onSave={saveEdit}
          onCancel={() => setEditingId(null)}
        />
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-neutral-50 p-3">
      <p className="text-xl font-semibold">{value}</p>
      <p className="text-xs text-neutral-500">{label}</p>
    </div>
  );
}

function EditModal({
  guest,
  onSave,
  onCancel,
}: {
  guest: AdminGuest;
  onSave: (g: AdminGuest) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<AdminGuest>(guest);

  function update<K extends keyof AdminGuest>(key: K, value: AdminGuest[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-5 sm:rounded-2xl">
        <h2 className="text-lg font-medium">Modifica ospite</h2>
        <div className="mt-4">
          <GuestForm guest={draft} onChange={update} />
        </div>
        <div className="mt-5 flex gap-2">
          <button onClick={onCancel} className="flex-1 rounded-lg border border-neutral-300 py-2.5 text-sm font-medium">
            Annulla
          </button>
          <button
            onClick={() => onSave(draft)}
            className="flex-1 rounded-lg bg-neutral-900 py-2.5 text-sm font-medium text-white"
          >
            Salva
          </button>
        </div>
      </div>
    </div>
  );
}
