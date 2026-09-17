import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getPropertyByGuestToken } from "@/config/properties";
import { ItineraryApp } from "@/components/guest/itinerary/ItineraryApp";

export default async function ItineraryPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  if (!getPropertyByGuestToken(token)) notFound();

  return (
    <Suspense>
      <ItineraryApp />
    </Suspense>
  );
}
