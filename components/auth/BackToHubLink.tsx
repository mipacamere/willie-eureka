import { getCurrentSession } from "@/lib/auth/session";

/**
 * Torna all'hub giusto in base a chi sta effettivamente navigando: un
 * admin che visita /staff/* deve tornare a /admin (dove ha accesso a
 * tutto), un membro dello staff deve tornare a /staff (l'unica area a
 * cui ha accesso). Sulle pagine sotto /admin/* il ritorno è sempre
 * /admin, quindi lì si può passare href="/admin" direttamente senza
 * bisogno di questo componente.
 */
export async function BackToHubLink() {
  const session = await getCurrentSession();
  const isAdmin = session?.role === "admin";
  const href = isAdmin ? "/admin" : "/staff";
  const label = isAdmin ? "Admin" : "Area staff";

  return (
    <a href={href} className="mb-4 inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700">
      ← Torna a {label}
    </a>
  );
}
