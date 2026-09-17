import { Suspense } from "react";
import { ItineraryApp } from "@/components/guest/itinerary/ItineraryApp";

export default function ItineraryPage() {
  return (
    <Suspense fallback={<div style={{padding: '2rem', textAlign: 'center'}}>Caricamento itinerario...</div>}>
      <ItineraryApp />
    </Suspense>
  );
}
