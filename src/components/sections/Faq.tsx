import { ChevronDown } from "lucide-react";
import type { SectionOf } from "@/lib/tenant/schema";
import { SectionHeading, SectionShell, type SectionProps } from "./shared";

export function Faq({ section }: SectionProps<SectionOf<"faq">>) {
  return (
    <SectionShell id={section.id}>
      <SectionHeading title={section.data.title} />
      <div className="divide-y divide-ink/10 border-y border-ink/10">
        {section.data.items.map((item) => (
          <details key={item.q} className="group py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-heading text-lg font-semibold">
              {item.q}
              <ChevronDown className="size-5 shrink-0 text-accent transition group-open:rotate-180" />
            </summary>
            <p className="mt-3 max-w-3xl text-muted">{item.a}</p>
          </details>
        ))}
      </div>
    </SectionShell>
  );
}
