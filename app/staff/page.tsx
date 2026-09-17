import { LogoutButton } from "@/components/auth/LogoutButton";
import { getCurrentSession } from "@/lib/auth/session";

const TOOLS = [
  { href: "/staff/checklist", icon: "✅", title: "Checklist pulizie", sub: "Lista di controllo per camera" },
  { href: "/staff/riepilogo", icon: "🧹", title: "Riepilogo pulizie", sub: "Configurazione e operazioni" },
  { href: "/staff/prodotti", icon: "🧴", title: "Prodotti pulizia", sub: "Lista della spesa" },
];

export default async function StaffHome() {
  const session = await getCurrentSession();
  const isAdmin = session?.role === "admin";

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium">Area staff</h1>
        <LogoutButton type={isAdmin ? "admin" : "staff"} />
      </div>
      {isAdmin && (
        <p className="mt-1 text-xs text-neutral-400">Stai navigando come admin.</p>
      )}
      <p className="mt-2 text-neutral-600">Gestione operativa: pulizie e materiali.</p>

      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {TOOLS.map((t) => (
          <a
            key={t.href}
            href={t.href}
            className="flex items-start gap-3 rounded-xl border border-neutral-200 p-4"
          >
            <span className="text-2xl">{t.icon}</span>
            <div>
              <p className="font-medium">{t.title}</p>
              <p className="text-sm text-neutral-500">{t.sub}</p>
            </div>
          </a>
        ))}
      </div>
    </main>
  );
}
