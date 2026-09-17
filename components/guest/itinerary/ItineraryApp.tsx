"use client";

import { useCallback, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { getItineraryStep, FIRST_STEP_ID } from "@/lib/itinerary/locales";
import { useLocale } from "@/lib/i18n/LocaleContext";
import { LanguageSelector } from "@/lib/i18n/LanguageSelector";
import { ItineraryStepView } from "./ItineraryStepView";

export function ItineraryApp() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { locale } = useLocale();

  const currentId = searchParams.get("step") || FIRST_STEP_ID;
  const step = useMemo(() => getItineraryStep(currentId, locale), [currentId, locale]);

  const goTo = useCallback(
    (id: string) => {
      router.push(`${pathname}?step=${id}`);
    },
    [router, pathname]
  );

  const goBack = useCallback(() => {
    router.back();
  }, [router]);

  const goHome = useCallback(() => {
    router.push(`${pathname}?step=${FIRST_STEP_ID}`);
  }, [router, pathname]);

  return (
    <div>
      <div className="flex justify-end px-5 pt-4">
        <LanguageSelector className="[&_button]:bg-neutral-100 [&_button]:text-neutral-800" />
      </div>
      <ItineraryStepView
        currentId={currentId}
        step={step}
        onNavigate={goTo}
        onBack={goBack}
        onHome={goHome}
        canGoBack={currentId !== FIRST_STEP_ID}
      />
    </div>
  );
}
