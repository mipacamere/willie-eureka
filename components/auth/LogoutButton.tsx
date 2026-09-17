"use client";

import { useRouter } from "next/navigation";

export function LogoutButton({ type }: { type: "admin" | "staff" }) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type }),
    });
    router.push(`/login/${type}`);
    router.refresh();
  }

  return (
    <button onClick={logout} className="text-sm text-neutral-500 underline">
      Esci
    </button>
  );
}
