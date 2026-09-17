import { ProdottiTool } from "@/components/staff/ProdottiTool";
import { BackToHubLink } from "@/components/auth/BackToHubLink";

export default function ProdottiPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <BackToHubLink />
      <h1 className="mb-4 text-xl font-medium">🏨 Prodotti Pulizia B&amp;B</h1>
      <ProdottiTool />
    </main>
  );
}
