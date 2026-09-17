"use client";

import { useTheme } from "./ThemeContext";
import { Ms } from "./Ms";

export function ThemeToggleButton() {
  const { effective, toggleTheme } = useTheme();
  const isDark = effective === "dark";
  return (
    <button
      className="theme-toggle-btn"
      onClick={(e) => {
        e.stopPropagation();
        toggleTheme();
      }}
    >
      <Ms icon={isDark ? "light_mode" : "dark_mode"} />
    </button>
  );
}
