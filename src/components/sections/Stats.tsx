import type { SectionOf } from "@/lib/tenant/schema";
import type { SectionProps } from "./shared";

export function Stats({ section }: SectionProps<SectionOf<"stats">>) {
  return (
    <section id={section.id} className="bg-primary px-4 py-12 text-on-primary sm:px-6">
      <dl className="mx-auto grid max-w-6xl grid-cols-2 gap-8 md:grid-flow-col md:grid-cols-none md:auto-cols-fr">
        {section.data.items.map((s) => (
          <div key={s.label} className="flex flex-col-reverse border-l-2 border-accent pl-4">
            <dt className="text-sm opacity-80">{s.label}</dt>
            <dd className="font-heading text-3xl font-semibold md:text-4xl">{s.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
