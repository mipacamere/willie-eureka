import { LogoutButton } from "@/components/auth/LogoutButton";
import { properties } from "@/config/properties";

const ADMIN_TOOLS = [
  { href: "/admin/alloggiati", icon: "🚔", title: "Gestione ospiti e schedine", sub: "Scansiona, invia alla Questura e Regione Sicilia" },
  { href: "/admin/condividi", icon: "🔗", title: "Condividi gallerie", sub: "Link foto per gli ospiti" },
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

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-medium text-neutral-500">Gestione</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {ADMIN_TOOLS.map((t) => (
            <a key={t.href} href={t.href} className="flex items-start gap-3 rounded-xl border border-neutral-200 p-4">
              <span className="text-2xl">{t.icon}</span>
              <div>
                <p className="font-medium">{t.title}</p>
                <p className="text-sm text-neutral-500">{t.sub}</p>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-medium text-neutral-500">Strumenti staff</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {STAFF_TOOLS.map((t) => (
            <a key={t.href} href={t.href} className="flex items-center gap-2 rounded-xl border border-neutral-200 p-3">
              <span className="text-xl">{t.icon}</span>
              <p className="text-sm font-medium">{t.title}</p>
            </a>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-medium text-neutral-500">Itinerario giornaliero</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {propertyList.map((p) => (
            <a
              key={p.slug}
              href={`/guest/${p.guestAccessToken}/itinerary`}
              className="flex items-center justify-between rounded-xl border border-neutral-200 p-4"
            >
              <span className="text-sm font-medium">Itinerario — {p.name}</span>
              <span>↗</span>
            </a>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-medium text-neutral-500">App companion (vista ospite)</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {propertyList.map((p) => (
            <a
              key={p.slug}
              href={`/guest/${p.guestAccessToken}/app`}
              className="flex items-center justify-between rounded-xl p-4 text-white"
              style={{ backgroundColor: p.theme.primary }}
            >
              <span className="font-medium">{p.name}</span>
              <span>↗</span>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
