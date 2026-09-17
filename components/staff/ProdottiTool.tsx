"use client";

import { useState } from "react";
import { CLEANING_PRODUCTS } from "@/lib/staff/cleaning-products";

/**
 * Porting di prodottipulizia.html. Stesso catalogo, stessa logica di
 * quantità e lista spesa. Export PDF (jsPDF, come l'originale) e invio
 * WhatsApp (testo, come sendToWhatsApp() nell'originale).
 *
 * Non portato: exportAsImage() (rendering canvas) — stesso motivo del
 * Riepilogo pulizie, il PDF/WhatsApp coprono il bisogno di condivisione.
 */
export function ProdottiTool() {
  const [quantities, setQuantities] = useState<Record<number, number>>({});

  function change(id: number, delta: number) {
    setQuantities((q) => ({ ...q, [id]: Math.max(0, (q[id] ?? 0) + delta) }));
  }

  const shoppingList = CLEANING_PRODUCTS.filter((p) => (quantities[p.id] ?? 0) > 0);

  async function exportPdf() {
    if (shoppingList.length === 0) return;
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    const margin = 20;
    let y = margin;
    doc.setFontSize(16);
    doc.text("Lista della Spesa — Prodotti Pulizia", margin, y);
    y += 12;
    doc.setFontSize(12);
    shoppingList.forEach((p, i) => {
      doc.text(`${i + 1}. ${p.name} — quantità: ${quantities[p.id]}`, margin, y);
      y += 8;
    });
    doc.save(`lista-spesa-${new Date().toISOString().slice(0, 10)}.pdf`);
  }

  function sendWhatsApp() {
    if (shoppingList.length === 0) return;
    const lines = shoppingList.map((p) => `- ${p.name} x${quantities[p.id]}`);
    const text = `Lista della spesa — Prodotti pulizia:\n${lines.join("\n")}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {CLEANING_PRODUCTS.map((p) => (
          <div key={p.id} className="rounded-lg border border-neutral-200 p-3">
            <p className="font-medium">{p.name}</p>
            <p className="text-xs text-neutral-500">{p.description}</p>
            <div className="mt-2 flex items-center gap-3">
              <button
                onClick={() => change(p.id, -1)}
                className="h-7 w-7 rounded-full border border-neutral-300 text-sm"
              >
                −
              </button>
              <span className="w-6 text-center text-sm">{quantities[p.id] ?? 0}</span>
              <button
                onClick={() => change(p.id, 1)}
                className="h-7 w-7 rounded-full border border-neutral-300 text-sm"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      <section className="rounded-xl border border-neutral-200 p-4">
        <h2 className="mb-2 font-medium">📋 Lista della Spesa</h2>
        {shoppingList.length === 0 ? (
          <p className="text-sm text-neutral-400">Aggiungi prodotti per creare la lista della spesa</p>
        ) : (
          <ul className="flex flex-col gap-1 text-sm">
            {shoppingList.map((p) => (
              <li key={p.id}>
                {p.name} × {quantities[p.id]}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={exportPdf}
            disabled={shoppingList.length === 0}
            className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium disabled:opacity-40"
          >
            📄 Esporta PDF
          </button>
          <button
            onClick={sendWhatsApp}
            disabled={shoppingList.length === 0}
            className="rounded-lg bg-[#25d366] px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
          >
            📱 Invia su WhatsApp
          </button>
        </div>
      </section>
    </div>
  );
}
