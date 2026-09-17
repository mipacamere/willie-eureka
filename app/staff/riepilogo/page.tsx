import { RiepilogoTool } from "@/components/staff/RiepilogoTool";
import { BackToHubLink } from "@/components/auth/BackToHubLink";

export default function RiepilogoPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <BackToHubLink />
      <RiepilogoTool />
    </main>
  );
}
