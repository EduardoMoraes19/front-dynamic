import { Clock } from "lucide-react";
import type { SectionOf } from "@/lib/tenant/schema";
import { OpenNowBadge } from "./OpenNowBadge";
import { SectionHeading, SectionShell, type SectionProps } from "./shared";

export function OpeningHours({ section }: SectionProps<SectionOf<"openingHours">>) {
  const { title, schedule, timezone, note } = section.data;
  return (
    <SectionShell id={section.id}>
      <div className="grid gap-10 md:grid-cols-2 md:items-start">
        <div>
          <SectionHeading title={title} />
          <OpenNowBadge schedule={schedule} timezone={timezone} />
          {note && <p className="mt-4 text-muted">{note}</p>}
        </div>
        <dl className="rounded-brand border border-ink/10 bg-surface">
          {schedule.map((s) => (
            <div key={s.label} className="flex items-center justify-between gap-4 border-b border-ink/10 px-6 py-4 last:border-0">
              <dt className="flex items-center gap-3">
                <Clock className="size-4 text-accent" /> {s.label}
              </dt>
              <dd className="font-heading font-semibold tabular-nums">
                {s.open} – {s.close}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </SectionShell>
  );
}
