"use client";

interface NavigationButtonsProps {
  showBack?: boolean;
  onBack: () => void;
  onNavigateHome: () => void;
  backLabel: string;
  homeLabel: string;
}

export function NavigationButtons({
  showBack = true,
  onBack,
  onNavigateHome,
  backLabel,
  homeLabel,
}: NavigationButtonsProps) {
  return (
    <div className="buttons-container">
      {showBack && (
        <button className="back" onClick={onBack}>
          {backLabel}
        </button>
      )}
      <button className="start" onClick={onNavigateHome}>
        {homeLabel}
      </button>
    </div>
  );
}
