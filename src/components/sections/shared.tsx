import type { ReactNode } from "react";
import type { Tenant } from "@/lib/tenant/schema";

/** Props recebidas por toda seção: os dados dela + o tenant (para nome, tema etc.). */
export type SectionProps<S> = { section: S; tenant: Tenant };

export function SectionShell({
  id,
  children,
  className = "",
}: {
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`scroll-mt-24 px-4 py-16 sm:px-6 md:py-24 ${className}`}>
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  );
}

export function SectionHeading({ title, intro }: { title: string; intro?: string }) {
  return (
    <header className="mb-10 max-w-2xl">
      <div className="mb-4 h-1 w-12 bg-accent" />
      <h2 className="font-heading text-3xl font-semibold tracking-tight text-ink md:text-4xl">{title}</h2>
      {intro && <p className="mt-3 text-lg text-muted">{intro}</p>}
    </header>
  );
}

export function ButtonLink({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "ghost";
}) {
  const styles =
    variant === "primary"
      ? "bg-primary text-on-primary hover:opacity-90"
      : "border border-current text-ink hover:bg-ink/5";
  return (
    <a
      href={href}
      className={`inline-flex items-center gap-2 rounded-brand px-6 py-3 font-semibold transition ${styles}`}
    >
      {children}
    </a>
  );
}
