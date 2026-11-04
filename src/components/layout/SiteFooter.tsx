import type { Tenant } from "@/lib/tenant/schema";

export function SiteFooter({ tenant }: { tenant: Tenant }) {
  const { legal } = tenant;
  return (
    <footer className="border-t border-ink/10 px-4 py-10 text-sm text-muted sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:justify-between">
        <div>
          <p className="font-heading font-semibold text-ink">{tenant.name}</p>
          <p className="mt-1">
            {legal.officerTitle}: {legal.officer}
          </p>
        </div>
        <div className="md:text-right">
          <p>CNS {legal.cns}</p>
          {legal.cnpj && <p>CNPJ {legal.cnpj}</p>}
          <p className="mt-1 text-xs opacity-70">Serviço delegado do Poder Público — Lei 8.935/94</p>
        </div>
      </div>
    </footer>
  );
}
