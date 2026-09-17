import { notFound } from "next/navigation";
import { getPropertyByGuestToken } from "@/config/properties";
import { CheckinFlow } from "@/components/guest/CheckinFlow";

export default async function CheckinPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const property = getPropertyByGuestToken(token);
  if (!property) notFound();

  return (
    <CheckinFlow
      slug={property.slug}
      token={token}
      exportInfo={{
        displayName: property.displayName,
        policeStructureId: property.policeStructureId,
        cin: property.cin,
      }}
    />
  );
}
