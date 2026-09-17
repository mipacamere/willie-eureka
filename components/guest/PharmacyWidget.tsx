"use client";

import { useEffect, useState } from "react";
import { withAppToken } from "@/lib/client-app-token";

interface Pharmacy {
  name: string;
  address: string;
  phone: string;
  status: string;
  hours: string;
  distanceKm: number | null;
}

export function PharmacyWidget() {
  const [pharmacies, setPharmacies] = useState<Pharmacy[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/pharmacy", { headers: withAppToken() })
      .then((res) => {
        if (!res.ok) throw new Error("Errore dal servizio farmacie");
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setPharmacies(data.pharmacies ?? []);
      })
      .catch(() => {
        if (!cancelled) setError("Impossibile caricare l'elenco in questo momento.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) return <p className="text-sm text-neutral-500">{error}</p>;
  if (!pharmacies) return <p className="text-sm text-neutral-500">Caricamento…</p>;
  if (pharmacies.length === 0)
    return <p className="text-sm text-neutral-500">Nessun dato disponibile al momento.</p>;

  return (
    <div className="flex flex-col gap-3">
      {pharmacies.map((p, i) => (
        <div key={i} className="rounded-xl border border-neutral-200 p-3">
          <div className="flex items-start justify-between gap-2">
            <span className="font-medium">{p.name}</span>
            {p.status && (
              <span className="shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                {p.status}
              </span>
            )}
          </div>
          {p.address && <p className="mt-0.5 text-sm text-neutral-600">{p.address}</p>}
          <div className="mt-1 flex flex-wrap gap-x-3 text-xs text-neutral-500">
            {p.hours && <span>{p.hours}</span>}
            {p.phone && <span>{p.phone}</span>}
            {p.distanceKm != null && <span>{p.distanceKm} km</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
