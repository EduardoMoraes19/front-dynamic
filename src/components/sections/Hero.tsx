import { ArrowRight, Check } from "lucide-react";
import { Seal, monogramOf } from "@/components/brand/Seal";
import { KIND_LABEL, type SectionOf } from "@/lib/tenant/schema";
import { ButtonLink, type SectionProps } from "./shared";

export function Hero({ section, tenant }: SectionProps<SectionOf<"hero">>) {
  const { data, variant } = section;
  const title = data.title ?? tenant.name;
  const subtitle = data.subtitle ?? tenant.slogan;
  const eyebrow = data.eyebrow ?? KIND_LABEL[tenant.kind];
  const monogram = monogramOf(tenant.name, tenant.theme.monogram);

  const ctas = (
    <div className="mt-8 flex flex-wrap gap-3">
      {data.cta && (
        <ButtonLink href={data.cta.href}>
          {data.cta.label} <ArrowRight className="size-4" />
        </ButtonLink>
      )}
      {data.secondaryCta && (
        <ButtonLink href={data.secondaryCta.href} variant="ghost">
          {data.secondaryCta.label}
        </ButtonLink>
      )}
    </div>
  );

  const highlights = data.highlights.length > 0 && (
    <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
      {data.highlights.map((h) => (
        <li key={h} className="flex items-center gap-2">
          <Check className="size-4 text-accent" /> {h}
        </li>
      ))}
    </ul>
  );

  if (variant === "split") {
    return (
      <section id={section.id} className="guilloche border-b border-ink/10 px-4 py-16 sm:px-6 md:py-28">
        <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">{eyebrow}</p>
            <h1 className="mt-4 font-heading text-4xl font-semibold leading-tight text-primary md:text-6xl">{title}</h1>
            <p className="mt-6 max-w-xl text-lg text-muted md:text-xl">{subtitle}</p>
            {ctas}
            {highlights}
          </div>
          <div className="flex justify-center text-primary">
            <Seal name={tenant.name} monogram={monogram} size={300} className="max-w-full -rotate-6 drop-shadow-sm" />
          </div>
        </div>
      </section>
    );
  }

  if (variant === "monumental") {
    return (
      <section id={section.id} className="relative overflow-hidden border-b border-ink/10 px-4 pb-20 pt-24 sm:px-6 md:pt-36">
        <Seal
          name={tenant.name}
          monogram={monogram}
          size={720}
          className="pointer-events-none absolute -right-48 -top-40 text-primary opacity-[0.07]"
        />
        <div className="relative mx-auto max-w-6xl">
          <p className="font-body text-xs uppercase tracking-[0.35em] text-primary">{eyebrow}</p>
          <h1 className="mt-6 max-w-4xl font-heading text-5xl font-medium leading-[0.95] tracking-tight text-ink sm:text-7xl md:text-8xl">
            {title}
          </h1>
          <div className="mt-10 grid gap-8 border-t border-ink/15 pt-8 md:grid-cols-2">
            <p className="text-base text-muted md:text-lg">{subtitle}</p>
            <div className="md:justify-self-end">{ctas}</div>
          </div>
          {highlights}
        </div>
      </section>
    );
  }

  // centered
  return (
    <section
      id={section.id}
      className="relative overflow-hidden px-4 py-20 text-center sm:px-6 md:py-32"
      style={{
        background:
          "radial-gradient(60% 60% at 50% 0%, color-mix(in oklab, var(--t-primary) 18%, transparent), transparent), radial-gradient(40% 40% at 90% 90%, color-mix(in oklab, var(--t-accent) 22%, transparent), transparent)",
      }}
    >
      <div className="mx-auto max-w-3xl">
        <p className="inline-block rounded-full bg-primary/10 px-4 py-1 text-sm font-medium text-primary">{eyebrow}</p>
        <h1 className="mt-6 font-heading text-4xl font-bold leading-tight tracking-tight md:text-6xl">{title}</h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-muted">{subtitle}</p>
        <div className="flex justify-center">{ctas}</div>
        <div className="flex justify-center">{highlights}</div>
      </div>
    </section>
  );
}
