import { ICONS } from "@/components/brand/icons";
import type { SectionOf } from "@/lib/tenant/schema";
import { SectionHeading, SectionShell, type SectionProps } from "./shared";

export function Services({ section }: SectionProps<SectionOf<"services">>) {
  const { data, variant } = section;

  if (variant === "list") {
    return (
      <SectionShell id={section.id}>
        <SectionHeading title={data.title} intro={data.intro} />
        <ul className="divide-y divide-ink/10 overflow-hidden rounded-brand border border-ink/10 bg-surface">
          {data.items.map((item) => {
            const Icon = ICONS[item.icon];
            return (
              <li key={item.title} className="flex items-start gap-5 p-6 transition hover:bg-primary/5">
                <span className="grid size-12 shrink-0 place-items-center rounded-brand bg-primary/10 text-primary">
                  <Icon className="size-6" />
                </span>
                <div className="flex-1">
                  <h3 className="flex flex-wrap items-center gap-2 font-heading text-lg font-semibold">
                    {item.title}
                    {item.tag && (
                      <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-ink">{item.tag}</span>
                    )}
                  </h3>
                  <p className="mt-1 text-muted">{item.description}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </SectionShell>
    );
  }

  return (
    <SectionShell id={section.id}>
      <SectionHeading title={data.title} intro={data.intro} />
      <div className="grid gap-px overflow-hidden rounded-brand border border-ink/10 bg-ink/10 sm:grid-cols-2 lg:grid-cols-3">
        {data.items.map((item) => {
          const Icon = ICONS[item.icon];
          return (
            <article key={item.title} className="group relative bg-surface p-8 transition hover:bg-bg">
              <Icon className="size-8 text-accent transition group-hover:text-primary" strokeWidth={1.5} />
              <h3 className="mt-5 font-heading text-xl font-semibold">{item.title}</h3>
              <p className="mt-2 text-muted">{item.description}</p>
              {item.tag && (
                <span className="absolute right-6 top-6 border border-primary px-2 py-0.5 text-xs uppercase tracking-wider text-primary">
                  {item.tag}
                </span>
              )}
            </article>
          );
        })}
      </div>
    </SectionShell>
  );
}
