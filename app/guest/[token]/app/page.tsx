import { notFound } from "next/navigation";
import { getPropertyByGuestToken } from "@/config/properties";
import { GuestDashboard } from "@/components/guest/GuestDashboard";

export default async function GuestApp({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const property = getPropertyByGuestToken(token);
  if (!property) notFound();

  return <GuestDashboard slug={property.slug} token={token} />;
}
