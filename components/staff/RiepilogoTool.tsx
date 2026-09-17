"use client";

import { useState } from "react";
import { RIEPILOGO_SECTIONS } from "@/lib/staff/riepilogo-layout";
import {
  CONFIG_OPTIONS,
  OPERATION_OPTIONS,
  EXTRA_BEDS_OPTIONS,
  configLabel,
  operationLabel,
} from "@/lib/staff/room-config";

/**
 * Porting fedele di riepilogopulizie.html ("Gestione Camere Hotel") —
 * stessi colori, stesso layout a card, stessi bottoni a gradiente
 * (PDF blu, PNG verde). Aggiunta rispetto all'originale: campo data di
 * riferimento (precompilato con oggi, modificabile), incluso sia nel
 * PDF che nel PNG generati.
 */

interface RoomState {
  config: string;
  operation: string;
  extraBeds: string;
}

const CONFIG_ICON: Record<string, string> = {
  matrimoniale: "🛏️",
  lettini: "🛏️🛏️",
  "matrimoniale-singola": "👤",
};

const OPERATION_ICON: Record<string, string> = {
  "pulizia-completa": "🧹",
  "cambio-spugne-bagno": "🧼",
  "cambio-lenzuola-spugne-pulizia": "🛏️🧼",
};

function todayInputValue(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatDateIt(isoDate: string): string {
  const [y, m, d] = isoDate.split("-");
  return `${d}/${m}/${y}`;
}

export function RiepilogoTool() {
  const [date, setDate] = useState(todayInputValue());
  const [state, setState] = useState<Record<string, RoomState>>({});
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function update(roomId: string, field: keyof RoomState, value: string) {
    setState((s) => ({ ...s, [roomId]: { ...s[roomId], [field]: value } }));
  }

  function getSelectedForSection(section: (typeof RIEPILOGO_SECTIONS)[number]) {
    return section.rooms
      .map((room) => ({ room, ...state[`${section.key}-${room}`] }))
      .filter(
        (r): r is { room: string; config: string; operation: string; extraBeds: string } =>
          !!r.config && !!r.operation
      );
  }

  function getAllSelected() {
    return RIEPILOGO_SECTIONS.flatMap((section) =>
      getSelectedForSection(section).map((r) => ({ section: section.title, ...r }))
    );
  }

  function showStatus(text: string, type: "success" | "error") {
    setStatus({ type, text });
    setTimeout(() => setStatus(null), 4000);
  }

  // Porting di generatePDF().
  async function generatePdf() {
    const selected = getAllSelected();
    if (selected.length === 0) {
      showStatus("Seleziona almeno una camera con configurazione e operazione", "error");
      return;
    }

    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    let y = margin;

    const now = new Date();
    doc.setFontSize(16);
    doc.text("ELENCO COSE DA FARE", margin, y);
    y += 10;
    doc.setFontSize(12);
    doc.text(`Data di riferimento: ${formatDateIt(date)}`, margin, y);
    y += 7;
    doc.setFontSize(10);
    doc.text(`Generato il ${now.toLocaleDateString("it-IT")} alle ${now.toLocaleTimeString("it-IT")}`, margin, y);
    y += 10;
    doc.line(margin, y, 190, y);
    y += 10;

    for (const section of RIEPILOGO_SECTIONS) {
      const roomsInSection = getSelectedForSection(section);
      if (roomsInSection.length === 0) continue;

      if (y > pageHeight - 30) {
        doc.addPage();
        y = margin;
      }
      doc.setFontSize(14);
      doc.text(section.title, margin, y);
      y += 10;

      roomsInSection.forEach((r, i) => {
        if (y > pageHeight - 30) {
          doc.addPage();
          y = margin;
        }
        const extra = r.extraBeds ? `, ${r.extraBeds} Letto/i Aggiuntivo/i` : "";
        doc.setFontSize(11);
        doc.text(
          `${i + 1}. Camera ${r.room}: ${configLabel(r.config)}, ${operationLabel(r.operation)}${extra}`,
          margin,
          y
        );
        y += 8;
      });
      y += 5;
    }

    doc.line(margin, y, 190, y);
    y += 10;
    doc.setFontSize(11);
    doc.text(`Totale camere da gestire: ${selected.length}`, margin, y);

    doc.save(`lista-attivita-${date}.pdf`);
    showStatus(`Lista attività (PDF) generata con ${selected.length} camera/e!`, "success");
  }

  // Porting di generateImage(): stesso DOM temporaneo fuori schermo, reso con html2canvas.
  async function generateImage() {
    const selected = getAllSelected();
    if (selected.length === 0) {
      showStatus("Seleziona almeno una camera con configurazione e operazione", "error");
      return;
    }

    const html2canvas = (await import("html2canvas")).default;

    const tempContainer = document.createElement("div");
    tempContainer.style.position = "absolute";
    tempContainer.style.left = "-9999px";
    tempContainer.style.background = "#ffffff";
    tempContainer.style.padding = "24px";
    tempContainer.style.borderRadius = "8px";
    tempContainer.style.width = "560px";
    tempContainer.style.fontFamily = "-apple-system, BlinkMacSystemFont, sans-serif";
    document.body.appendChild(tempContainer);

    const dateHeader = document.createElement("div");
    dateHeader.textContent = `Data di riferimento: ${formatDateIt(date)}`;
    dateHeader.style.fontSize = "14px";
    dateHeader.style.fontWeight = "600";
    dateHeader.style.color = "#2d3748";
    dateHeader.style.marginBottom = "16px";
    tempContainer.appendChild(dateHeader);

    for (const section of RIEPILOGO_SECTIONS) {
      const roomsInSection = getSelectedForSection(section);
      if (roomsInSection.length === 0) continue;

      const sectionHeader = document.createElement("h2");
      sectionHeader.textContent = section.title;
      sectionHeader.style.color = "#2d3748";
      sectionHeader.style.fontSize = "20px";
      sectionHeader.style.fontWeight = "600";
      sectionHeader.style.margin = "20px 0 12px";
      sectionHeader.style.paddingLeft = "10px";
      sectionHeader.style.borderLeft = `4px solid ${section.color}`;
      tempContainer.appendChild(sectionHeader);

      roomsInSection.forEach((r) => {
        const roomRow = document.createElement("div");
        roomRow.style.display = "flex";
        roomRow.style.alignItems = "center";
        roomRow.style.gap = "15px";
        roomRow.style.marginBottom = "10px";
        roomRow.style.padding = "12px 15px";
        roomRow.style.borderRadius = "8px";
        roomRow.style.background = "#f7fafc";
        roomRow.style.borderLeft = `4px solid ${section.color}`;

        const roomName = document.createElement("div");
        roomName.textContent = `Camera ${r.room}`;
        roomName.style.width = "110px";
        roomName.style.fontWeight = "600";
        roomName.style.color = "#2d3748";
        roomName.style.fontSize = "14px";
        roomRow.appendChild(roomName);

        const configText = document.createElement("div");
        configText.textContent = `${CONFIG_ICON[r.config] ?? ""} ${configLabel(r.config)}`;
        configText.style.flex = "1";
        configText.style.fontSize = "13px";
        roomRow.appendChild(configText);

        const operationText = document.createElement("div");
        operationText.textContent = `${OPERATION_ICON[r.operation] ?? ""} ${operationLabel(r.operation)}`;
        operationText.style.flex = "1";
        operationText.style.fontSize = "13px";
        roomRow.appendChild(operationText);

        if (r.extraBeds) {
          const extraBedsText = document.createElement("div");
          extraBedsText.textContent = `🛏️ ${r.extraBeds} Letto/i Agg.`;
          extraBedsText.style.flex = "1";
          extraBedsText.style.fontSize = "13px";
          roomRow.appendChild(extraBedsText);
        }

        tempContainer.appendChild(roomRow);
      });
    }

    try {
      const canvas = await html2canvas(tempContainer, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `lista-attivita-${date}.png`;
      link.click();
      showStatus(`Immagine PNG generata con ${selected.length} camera/e!`, "success");
    } catch (err) {
      console.error("Errore durante la generazione dell'immagine:", err);
      showStatus("Errore durante la generazione dell'immagine", "error");
    } finally {
      document.body.removeChild(tempContainer);
    }
  }

  return (
    <div className="mx-auto max-w-2xl rounded-xl bg-white p-6 shadow-sm sm:p-10">
      <h1 className="mb-2 text-center text-2xl font-bold text-neutral-800">Gestione Camere Hotel</h1>

      <div className="mb-8 flex items-center justify-center gap-2">
        <label htmlFor="riepilogo-date" className="text-sm font-medium text-neutral-600">
          Data di riferimento
        </label>
        <input
          id="riepilogo-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm"
        />
      </div>

      {RIEPILOGO_SECTIONS.map((section) => (
        <div key={section.key} className="mb-6">
          <h2
            className="mb-4 pl-2.5 text-lg font-semibold text-neutral-700"
            style={{ borderLeft: `4px solid ${section.color}` }}
          >
            {section.title}
          </h2>
          <div className="flex flex-col gap-3">
            {section.rooms.map((room) => {
              const key = `${section.key}-${room}`;
              return (
                <div
                  key={key}
                  className="flex flex-col gap-2 rounded-lg bg-neutral-50 p-3 transition hover:-translate-y-0.5 hover:shadow-md sm:flex-row sm:items-center"
                  style={{ borderLeft: `4px solid ${section.color}` }}
                >
                  <span className="w-full shrink-0 text-center text-sm font-semibold text-neutral-700 sm:w-28 sm:text-left">
                    Camera {room}
                  </span>
                  <select
                    value={state[key]?.config ?? ""}
                    onChange={(e) => update(key, "config", e.target.value)}
                    className="w-full flex-1 rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm"
                  >
                    <option value="">Seleziona configurazione...</option>
                    {CONFIG_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={state[key]?.operation ?? ""}
                    onChange={(e) => update(key, "operation", e.target.value)}
                    className="w-full flex-1 rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm"
                  >
                    <option value="">Seleziona operazione...</option>
                    {OPERATION_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={state[key]?.extraBeds ?? ""}
                    onChange={(e) => update(key, "extraBeds", e.target.value)}
                    className="w-full flex-1 rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm"
                  >
                    <option value="">Letti aggiuntivi...</option>
                    {EXTRA_BEDS_OPTIONS.map((v) => (
                      <option key={v} value={v}>
                        {v} Letto/i
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
        <button
          onClick={generatePdf}
          className="rounded-md px-6 py-3 text-sm font-medium text-white transition hover:-translate-y-0.5"
          style={{ background: "linear-gradient(90deg, #2b6cb0, #2c5282)" }}
        >
          Genera Lista PDF
        </button>
        <button
          onClick={generateImage}
          className="rounded-md px-6 py-3 text-sm font-medium text-white transition hover:-translate-y-0.5"
          style={{ background: "linear-gradient(90deg, #38a169, #2f855a)" }}
        >
          Genera Immagine PNG
        </button>
      </div>

      {status && (
        <p
          className={`mt-5 rounded-md p-3 text-center text-sm ${
            status.type === "error" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
          }`}
        >
          {status.text}
        </p>
      )}
    </div>
  );
}
