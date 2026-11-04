import { MapPin } from "lucide-react";
import type { SectionOf } from "@/lib/tenant/schema";
import { SectionHeading, SectionShell, type SectionProps } from "./shared";

export function Location({ section, tenant }: SectionProps<SectionOf<"location">>) {
  const { title, address, city, lat, lng, reference } = section.data;
  const d = 0.006;
  const embed = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - d},${lat - d},${lng + d},${lat + d}&layer=mapnik&marker=${lat},${lng}`;
  const directions = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  return (
    <SectionShell id={section.id} className="bg-surface">
      <div className="grid gap-10 md:grid-cols-[1fr_1.4fr] md:items-center">
        <div>
          <SectionHeading title={title} />
          <p className="flex items-start gap-3 text-lg">
            <MapPin className="mt-1 size-5 shrink-0 text-accent" />
            <span>
              {address}
              <br />
              <span className="text-muted">{city}</span>
            </span>
          </p>
          {reference && <p className="mt-3 text-muted">{reference}</p>}
          <a href={directions} target="_blank" rel="noreferrer" className="mt-6 inline-block font-semibold text-primary underline underline-offset-4">
            Como chegar →
          </a>
        </div>
        <iframe
          title={`Mapa — ${tenant.name}`}
          src={embed}
          loading="lazy"
          className="aspect-[4/3] w-full rounded-brand border border-ink/10 grayscale-[30%]"
        />
      </div>
    </SectionShell>
  );
}
