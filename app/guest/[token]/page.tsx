import { notFound } from "next/navigation";
import Link from "next/link";
import { getPropertyByGuestToken } from "@/config/properties";

export default async function GuestHome({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const property = getPropertyByGuestToken(token);
  if (!property) notFound();

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-8 px-6">
      <header className="text-center">
        <p className="text-sm uppercase tracking-wide text-neutral-500">
          {property.city}
        </p>
        <h1
          className="mt-1 text-3xl font-medium"
          style={{ color: property.theme.primary }}
        >
          {property.name}
        </h1>
      </header>

      <div className="flex flex-col gap-3">
        {/* Scan opzionale: personalizza l'app col nome, invia i dati alla
            struttura per la pratica Alloggiati. Non è un gate d'accesso. */}
        <Link
          href={`/guest/${token}/checkin`}
          className="rounded-lg px-5 py-4 text-center font-medium text-white"
          style={{ backgroundColor: property.theme.primary }}
        >
          Scansiona documento
        </Link>

        <Link
          href={`/guest/${token}/app`}
          className="rounded-lg border border-neutral-300 px-5 py-4 text-center font-medium text-neutral-800"
        >
          Usa l&apos;app senza scansione
        </Link>
      </div>
    </main>
  );
}
