import { properties } from "@/config/properties";
import { ChecklistTool } from "@/components/staff/ChecklistTool";
import { BackToHubLink } from "@/components/auth/BackToHubLink";

export default function ChecklistPage() {
  const list = Object.values(properties).map((p) => ({ slug: p.slug, name: p.name }));
  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <BackToHubLink />
      <h1 className="mb-4 text-xl font-medium">Checklist pulizie</h1>
      <ChecklistTool properties={list} />
    </main>
  );
}
