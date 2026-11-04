import type { Metadata } from "next";
import { Seal, monogramOf } from "@/components/brand/Seal";
import { themeToCssVars } from "@/components/theme/ThemeScope";
import { HostLink } from "@/components/layout/CurrentHost";
import { listTenants } from "@/lib/tenant";
import { KIND_LABEL } from "@/lib/tenant/schema";
import domains from "../../data/domains.json";

export const metadata: Metadata = {
  title: "POC — Cartórios multi-tenant",
  description: "Um único frontend, uma landing page por domínio.",
};

/** Índice da POC: exibido no host raiz (localhost), lista os tenants para demo. */
export default async function Home() {
  const tenants = await listTenants();
  const aliasOf = (slug: string) =>
    Object.entries(domains as Record<string, string>)
      .filter(([d, s]) => s === slug && d.endsWith(".localhost"))
      .map(([d]) => d);

  return (
    <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">POC · Front dinâmico por domínio</p>
      <h1 className="mt-3 font-heading text-4xl font-bold tracking-tight md:text-5xl">
        Um frontend, um cartório por domínio.
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">
        O <code>proxy.ts</code> lê o <code>Host</code> da requisição, encontra o tenant e renderiza a landing page a partir
        do JSON em <code>data/tenants/</code>. Abra cada domínio abaixo:
      </p>

      <ul className="mt-12 grid gap-6 md:grid-cols-3">
        {tenants.map((t) => {
          const hosts = [...aliasOf(t.slug), `${t.slug}.localhost`];
          return (
            <li
              key={t.slug}
              style={themeToCssVars(t.theme)}
              className="flex flex-col overflow-hidden rounded-brand border border-ink/10 bg-bg text-ink"
            >
              <div className="flex items-center gap-3 bg-primary p-5 text-on-primary">
                <Seal name={t.name} monogram={monogramOf(t.name, t.theme.monogram)} size={52} />
                <div className="min-w-0">
                  <p className="truncate font-heading font-semibold">{t.shortName ?? t.name}</p>
                  <p className="text-xs opacity-80">{KIND_LABEL[t.kind]}</p>
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-3 p-5 font-body text-sm">
                <p className="text-muted">{t.slogan}</p>
                <p className="text-xs text-muted">{t.sections.length} seções · fonte {t.theme.headingFont}/{t.theme.bodyFont}</p>
                <div className="mt-auto flex flex-col gap-1 pt-2">
                  {hosts.map((h) => (
                    <HostLink key={h} host={h} className="font-medium text-primary underline underline-offset-4" />
                  ))}
                  <a href={`/?tenant=${t.slug}`} className="text-muted underline underline-offset-4">
                    ?tenant={t.slug}
                  </a>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
