import { properties } from "@/config/properties";
import { AlloggiatiAdmin } from "@/components/admin/AlloggiatiAdmin";

export default function AlloggiatiAdminPage() {
  const structures = Object.values(properties).map((p) => ({
    slug: p.slug,
    name: p.name,
    policeStructureId: p.policeStructureId,
  }));

  return <AlloggiatiAdmin structures={structures} />;
}
