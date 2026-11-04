"use client";

import { useState } from "react";
import { FileCheck } from "lucide-react";
import type { SectionOf } from "@/lib/tenant/schema";
import { SectionHeading, SectionShell, type SectionProps } from "./shared";

/** "O que levar": o visitante escolhe o serviço e marca os documentos que já tem. */
export function Checklist({ section }: SectionProps<SectionOf<"checklist">>) {
  const { title, intro, items } = section.data;
  const [active, setActive] = useState(0);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const current = items[active];
  const done = current.documents.filter((d) => checked[`${active}:${d}`]).length;

  return (
    <SectionShell id={section.id} className="bg-surface">
      <SectionHeading title={title} intro={intro} />
      <div className="grid gap-8 md:grid-cols-[260px_1fr]">
        <div role="tablist" aria-label="Serviços" className="flex gap-2 overflow-x-auto md:flex-col">
          {items.map((item, i) => (
            <button
              key={item.service}
              role="tab"
              aria-selected={i === active}
              onClick={() => setActive(i)}
              className={`shrink-0 rounded-brand px-4 py-3 text-left font-medium transition ${
                i === active ? "bg-primary text-on-primary" : "text-ink hover:bg-ink/5"
              }`}
            >
              {item.service}
            </button>
          ))}
        </div>

        <div role="tabpanel" className="rounded-brand border border-ink/10 bg-bg p-6 md:p-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h3 className="font-heading text-xl font-semibold">{current.service}</h3>
            <span className="text-sm text-muted">
              {done}/{current.documents.length} separados
            </span>
          </div>
          <div className="mb-6 h-1.5 overflow-hidden rounded-full bg-ink/10">
            <div
              className="h-full bg-accent transition-all"
              style={{ width: `${(done / current.documents.length) * 100}%` }}
            />
          </div>
          <ul className="space-y-3">
            {current.documents.map((doc) => {
              const key = `${active}:${doc}`;
              return (
                <li key={key}>
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={!!checked[key]}
                      onChange={(e) => setChecked((c) => ({ ...c, [key]: e.target.checked }))}
                      className="mt-1 size-4 accent-[var(--t-primary)]"
                    />
                    <span className={checked[key] ? "text-muted line-through" : ""}>{doc}</span>
                  </label>
                </li>
              );
            })}
          </ul>
          {done === current.documents.length && (
            <p className="mt-6 flex items-center gap-2 font-medium text-primary">
              <FileCheck className="size-5" /> Tudo pronto! É só vir ao cartório.
            </p>
          )}
        </div>
      </div>
    </SectionShell>
  );
}
