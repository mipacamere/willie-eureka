"use client";

import { useRouter } from "next/navigation";

interface NavigationButtonsProps {
  showBack?: boolean;
  onNavigateHome: () => void;
  backLabel: string;
  homeLabel: string;
}

export function NavigationButtons({
  showBack = true,
  onNavigateHome,
  backLabel,
  homeLabel,
}: NavigationButtonsProps) {
  const router = useRouter();

  return (
    <div className="buttons-container">
      {showBack && (
        <button className="back" onClick={() => router.back()}>
          {backLabel}
        </button>
      )}
      <button className="start" onClick={onNavigateHome}>
        {homeLabel}
      </button>
    </div>
  );
}
