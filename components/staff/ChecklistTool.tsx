"use client";

import { Fragment, useEffect, useState } from "react";
import type { PropertySlug } from "@/config/properties";
import { getAllRooms } from "@/lib/staff/rooms";
import { CHECKLIST_CATEGORIES, TOTAL_TASKS } from "@/lib/staff/checklist-tasks";

/**
 * Porting di checklist.html. Stesse 27 voci in 4 categorie, stessa
 * logica di progresso per camera e persistenza in localStorage
 * (updateProgress/saveState/loadState/resetChecklist).
 *
 * Differenza dall'originale: qui le camere sono scelte in base alla
 * struttura (config/properties + lib/staff/rooms.ts) invece di essere
 * fissate staticamente a "101"..."108" nell'HTML.
 */

export function ChecklistTool({ properties }: { properties: { slug: PropertySlug; name: string }[] }) {
  const [propertySlug, setPropertySlug] = useState<PropertySlug>(properties[0]?.slug);
  const [cleaner, setCleaner] = useState("");
  const [shift, setShift] = useState("mattina");
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const rooms = getAllRooms(propertySlug);
  const storageKey = `checklist_${propertySlug}_${new Date().toISOString().slice(0, 10)}`;

  // Porting di loadState(): ripristina lo stato salvato per oggi/struttura.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      setChecked(saved ? JSON.parse(saved) : {});
    } catch {
      setChecked({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertySlug]);

  // Porting di saveState(): salva ad ogni modifica.
  function toggle(taskId: string, roomId: string) {
    const key = `${taskId}-${roomId}`;
    const next = { ...checked, [key]: !checked[key] };
    setChecked(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      // localStorage non disponibile: il progresso resta solo per questa sessione
    }
  }

  // Porting di updateProgress(): percentuale di completamento per camera.
  function roomProgress(roomId: string): number {
    const done = CHECKLIST_CATEGORIES.flatMap((c) => c.tasks).filter(
      (t) => checked[`${t.id}-${roomId}`]
    ).length;
    return Math.round((done / TOTAL_TASKS) * 100);
  }

  // Porting di resetChecklist().
  function reset() {
    if (!window.confirm("Sei sicuro di voler resettare tutta la checklist?")) return;
    setChecked({});
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // localStorage non disponibile: nulla da rimuovere
    }
    window.alert("Checklist resettata con successo!");
  }

  return (
    <div className="flex flex-col gap-4 pb-10">
      <div className="flex flex-wrap gap-3 rounded-xl bg-neutral-50 p-4">
        <div>
          <label className="mb-1 block text-xs text-neutral-500">Struttura</label>
          <select
            value={propertySlug}
            onChange={(e) => setPropertySlug(e.target.value as PropertySlug)}
            className="rounded-lg border border-neutral-300 bg-white p-2 text-sm"
          >
            {properties.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-neutral-500">Data</label>
          <input
            type="date"
            defaultValue={new Date().toISOString().slice(0, 10)}
            disabled
            className="rounded-lg border border-neutral-300 bg-white p-2 text-sm text-neutral-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-neutral-500">Nome addetto pulizie</label>
          <input
            value={cleaner}
            onChange={(e) => setCleaner(e.target.value)}
            className="rounded-lg border border-neutral-300 bg-white p-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-neutral-500">Turno</label>
          <select
            value={shift}
            onChange={(e) => setShift(e.target.value)}
            className="rounded-lg border border-neutral-300 bg-white p-2 text-sm"
          >
            <option value="mattina">Mattina</option>
            <option value="pomeriggio">Pomeriggio</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-neutral-200">
        <table className="w-full min-w-max border-collapse text-sm">
          <thead>
            <tr className="bg-neutral-900 text-white">
              <th className="p-2 text-left">Operazione di Pulizia</th>
              {rooms.map((r) => (
                <th key={r.id} className="p-2 text-center">
                  {r.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CHECKLIST_CATEGORIES.map((cat) => (
              <Fragment key={cat.id}>
                <tr className="bg-neutral-100">
                  <td colSpan={rooms.length + 1} className="p-2 font-medium">
                    {cat.title}
                  </td>
                </tr>
                {cat.tasks.map((task) => (
                  <tr key={task.id} className="border-b border-neutral-100">
                    <td className="p-2">{task.label}</td>
                    {rooms.map((r) => (
                      <td key={r.id} className="p-2 text-center">
                        <input
                          type="checkbox"
                          checked={!!checked[`${task.id}-${r.id}`]}
                          onChange={() => toggle(task.id, r.id)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <h3 className="mb-2 font-medium">Riepilogo Progresso</h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {rooms.map((r) => (
            <div key={r.id} className="rounded-lg border border-neutral-200 p-3">
              <p className="text-sm font-medium">{r.label}</p>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-neutral-100">
                <div
                  className="h-full bg-neutral-900 transition-all"
                  style={{ width: `${roomProgress(r.id)}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-neutral-500">{roomProgress(r.id)}%</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={() => window.print()} className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white">
          Stampa Checklist
        </button>
        <button onClick={reset} className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600">
          Reset Checklist
        </button>
      </div>
    </div>
  );
}
