import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dormilazzo Platform",
  description: "Piattaforma unificata: ospiti, staff, admin.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="it" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
