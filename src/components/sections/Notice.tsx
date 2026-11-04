import { Info, TriangleAlert } from "lucide-react";
import type { SectionOf } from "@/lib/tenant/schema";
import type { SectionProps } from "./shared";

export function Notice({ section }: SectionProps<SectionOf<"notice">>) {
  const { tone, title, text, cta } = section.data;
  const Icon = tone === "warning" ? TriangleAlert : Info;
  return (
    <div
      id={section.id}
      className={`px-4 py-3 sm:px-6 ${tone === "warning" ? "bg-accent text-ink" : "bg-primary text-on-primary"}`}
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-sm">
        <Icon className="size-4 shrink-0" />
        <strong>{title}</strong>
        <span className="opacity-90">{text}</span>
        {cta && (
          <a href={cta.href} className="font-semibold underline underline-offset-4">
            {cta.label} →
          </a>
        )}
      </div>
    </div>
  );
}
