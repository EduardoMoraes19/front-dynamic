"use client";

import { useSyncExternalStore } from "react";
import type { SectionOf } from "@/lib/tenant/schema";

type Schedule = SectionOf<"openingHours">["data"]["schedule"];

// Relógio por minuto: estável entre renders, atualiza a cada 30s.
const subscribe = (cb: () => void) => {
  const t = setInterval(cb, 30_000);
  return () => clearInterval(t);
};
const getMinute = () => Math.floor(Date.now() / 60_000);
const getServerMinute = () => null;

const WEEKDAY: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

function isOpen(schedule: Schedule, timezone: string, epochMinute: number) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(epochMinute * 60_000));
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const day = WEEKDAY[get("weekday")];
  const now = Number(get("hour")) * 60 + Number(get("minute"));
  return schedule.some((s) => s.days.includes(day) && now >= toMin(s.open) && now < toMin(s.close));
}

/** Calculado só no cliente (fuso do cartório) para não haver mismatch de hidratação. */
export function OpenNowBadge({ schedule, timezone }: { schedule: Schedule; timezone: string }) {
  const minute = useSyncExternalStore(subscribe, getMinute, getServerMinute);
  if (minute === null) return <span className="inline-block h-9" aria-hidden />;
  const open = isOpen(schedule, timezone, minute);
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
        open ? "bg-emerald-600/15 text-emerald-700" : "bg-ink/10 text-muted"
      }`}
    >
      <span className={`size-2 rounded-full ${open ? "animate-pulse bg-emerald-500" : "bg-muted"}`} />
      {open ? "Aberto agora" : "Fechado no momento"}
    </span>
  );
}
