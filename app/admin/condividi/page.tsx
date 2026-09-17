import { properties } from "@/config/properties";
import { CondividiTool } from "@/components/staff/CondividiTool";

export default function CondividiPage() {
  const list = Object.values(properties).map((p) => ({
    slug: p.slug,
    name: p.name,
    token: p.guestAccessToken,
  }));
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <a href="/admin" className="mb-4 inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700">
        ← Torna a Admin
      </a>
      <h1 className="mb-1 text-xl font-medium">Condividi le foto con gli ospiti</h1>
      <p className="mb-4 text-sm text-neutral-500">
        Ogni link mostra solo le foto della camera o dell&apos;appartamento selezionato.
      </p>
      <CondividiTool properties={list} />
    </main>
  );
}
