import { notFound } from "next/navigation";
import { getPropertyByGuestToken } from "@/config/properties";
import { ThemeProvider } from "@/components/guest/theme/ThemeContext";
import { GuestThemeWrapper } from "@/components/guest/theme/GuestThemeWrapper";
import "@/components/guest/theme/guest-theme.css";

export default async function GuestLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const property = getPropertyByGuestToken(token);
  if (!property) notFound();

  return (
    <>
      {/* Material Symbols Rounded — stesso font icone dell'originale.
          Next.js "ospita" (hoist) i tag <link> resi da un Server Component
          nell'head del documento, anche da un layout annidato. */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
      />
      <div
        style={
          {
            "--property-primary": property.theme.primary,
            "--property-on-primary": property.theme.onPrimary,
          } as React.CSSProperties
        }
        className="min-h-screen bg-white"
      >
        <ThemeProvider>
          <GuestThemeWrapper slug={property.slug}>{children}</GuestThemeWrapper>
        </ThemeProvider>
      </div>
    </>
  );
}
