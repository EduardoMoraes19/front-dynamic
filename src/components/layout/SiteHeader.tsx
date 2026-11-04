import { Seal, monogramOf } from "@/components/brand/Seal";
import { KIND_LABEL, type Tenant } from "@/lib/tenant/schema";

/** O menu é derivado das seções que declaram navLabel — muda junto com o JSON. */
export function SiteHeader({ tenant }: { tenant: Tenant }) {
  const nav = tenant.sections.filter((s) => s.navLabel && s.id);
  return (
    <header className="sticky top-0 z-20 border-b border-ink/10 bg-bg/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <a href="#" className="flex min-w-0 items-center gap-3 text-primary">
          <Seal name={tenant.name} monogram={monogramOf(tenant.name, tenant.theme.monogram)} size={44} className="shrink-0" />
          <span className="min-w-0">
            <span className="block truncate font-heading font-semibold text-ink">{tenant.shortName ?? tenant.name}</span>
            <span className="block truncate text-xs text-muted">{KIND_LABEL[tenant.kind]}</span>
          </span>
        </a>
        <nav className="hidden gap-6 text-sm font-medium md:flex">
          {nav.map((s) => (
            <a key={s.id} href={`#${s.id}`} className="text-muted transition hover:text-primary">
              {s.navLabel}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
