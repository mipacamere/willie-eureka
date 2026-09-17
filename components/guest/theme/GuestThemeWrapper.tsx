"use client";

import type { PropertySlug } from "@/config/properties";
import { useTheme } from "./ThemeContext";

export function GuestThemeWrapper({
  slug,
  children,
}: {
  slug: PropertySlug;
  children: React.ReactNode;
}) {
  const { effective } = useTheme();
  return (
    <div className={`guest-theme theme-${slug} theme-${effective}`}>
      {children}
    </div>
  );
}
