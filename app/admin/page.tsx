import { LogoutButton } from "@/components/auth/LogoutButton";
import { properties } from "@/config/properties";

const ADMIN_TOOLS = [
  { href: "/admin/alloggiati", icon: "🚔", title: "Gestione ospiti e schedine", sub: "Scansiona, invia alla Questura e Regione Sicilia" },
  { href: "/admin/condividi", icon: "🔗", title: "Condividi gallerie", sub: "Link foto per gli ospiti" },
  { href: "/admin/posizioni", icon: "📍", title: "Gestione Posizioni", sub: "Link Maps e QR code per le strutture" },
];

const STAFF_TOOLS = [
  { href: "/staff/checklist", icon: "✅", title: "Checklist pulizie" },
  { href: "/staff/riepilogo", icon: "🧹", title: "Riepilogo pulizie" },
  { href: "/staff/prodotti", icon: "🧴", title: "Prodotti pulizia" },
];

export default function AdminHome() {
  const propertyList = Object.values(properties);

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium">Area admin</h1>
        <LogoutButton type="admin" />
      </div>
      <p className="mt-2 text-neutral-600">
        Accesso completo: gestione ospiti, strumenti staff e app companion di entrambe le strutture.
      </p>

      {/* SEZIONE GESTIONE (Solo Admin) */}
      <section className="mt-8">
        <h2 className="mb-3 text-sm font-medium text-neutral-500 uppercase tracking-wide">Gestione Strutture</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {ADMIN_TOOLS.map((t) => (
            <a 
              key={t.href} 
              href={t.href} 
              className="flex items-start gap-4 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-neutral-300"
            >
              <span className="text-3xl">{t.icon}</span>
              <div>
                <p className="font-semibold text-neutral-900">{t.title}</p>
                <p className="text-sm text-neutral-500 mt-1">{t.sub}</p>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* SEZIONE STRUMENTI STAFF */}
      <section className="mt-10">
        <h2 className="mb-3 text-sm font-medium text-neutral-500 uppercase tracking-wide">Strumenti operativi (Staff)</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {STAFF_TOOLS.map((t) => (
            <a 
              key={t.href} 
              href={t.href} 
              className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition-all hover:bg-neutral-50"
            >
              <span className="text-2xl">{t.icon}</span>
              <p className="text-sm font-medium text-neutral-800">{t.title}</p>
            </a>
          ))}
        </div>
      </section>

      {/* SEZIONE ITINERARIO (Unico e condiviso) */}
      <section className="mt-10">
        <h2 className="mb-3 text-sm font-medium text-neutral-500 uppercase tracking-wide">Contenuti Ospiti</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <a
            href={`/guest/${propertyList[0].guestAccessToken}/itinerary`}
            className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-neutral-300"
          >
            <div>
              <p className="font-semibold text-neutral-900">Itinerario giornaliero</p>
              <p className="text-sm text-neutral-500 mt-1">Guida unica "Esploriamo Milazzo"</p>
            </div>
            <span className="text-xl text-neutral-400">↗</span>
          </a>
        </div>
      </section>

      {/* SEZIONE APP COMPANION */}
      <section className="mt-10">
        <h2 className="mb-3 text-sm font-medium text-neutral-500 uppercase tracking-wide">App Companion (Vista Ospite)</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {propertyList.map((p) => (
            <a
              key={p.slug}
              href={`/guest/${p.guestAccessToken}/app`}
              className="flex items-center justify-between rounded-xl p-5 text-white shadow-sm transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ backgroundColor: p.theme.primary }}
            >
              <span className="font-semibold">{p.name}</span>
              <span className="text-xl opacity-80">↗</span>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
