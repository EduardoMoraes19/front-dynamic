import { Seal, monogramOf } from "@/components/brand/Seal";
import { themeToCssVars } from "@/components/theme/ThemeScope";
import { KIND_LABEL } from "@/lib/tenant/schema";
import { listSites, siteUrl } from "~/lib/store";
import { NewSiteForm } from "./NewSiteForm";

export const dynamic = "force-dynamic";

/** "Hub": lista os sites dos cartórios e permite criar/editar. */
export default async function Home() {
  const sites = await listSites();

  return (
    <div className="min-h-screen bg-zinc-50 font-[family-name:var(--font-grotesk)] text-zinc-900">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <p className="font-semibold">
            Hub <span className="text-zinc-400">/</span> Sites dos cartórios
          </p>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">POC · Page Builder (Puck)</span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="text-3xl font-bold tracking-tight">Sites</h1>
        <p className="mt-2 max-w-2xl text-zinc-600">
          Cada site é um JSON. O editor visual altera esse JSON; ao publicar, o renderer (porta 3000) é avisado e o site
          atualiza no domínio do cartório.
        </p>

        <h2 className="mt-10 mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">Novo cartório</h2>
        <NewSiteForm templates={sites.map((s) => ({ slug: s.slug, name: s.shortName ?? s.name }))} />

        <h2 className="mt-12 mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">{sites.length} sites</h2>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {sites.map((s) => (
            <li key={s.slug} style={themeToCssVars(s.theme)} className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
              <div className="flex items-center gap-3 bg-primary p-4 text-on-primary">
                <Seal name={s.name} monogram={monogramOf(s.name, s.theme.monogram)} size={44} />
                <div className="min-w-0">
                  <p className="truncate font-heading font-semibold">{s.shortName ?? s.name}</p>
                  <p className="text-xs opacity-80">{KIND_LABEL[s.kind]}</p>
                </div>
              </div>
              <div className="p-4 text-sm">
                <p className="font-mono text-xs text-zinc-500">{siteUrl(s.slug).replace(/^https?:\/\//, "")}</p>
                <p className="mt-1 text-zinc-500">{s.sections.length} seções</p>
                <div className="mt-4 flex gap-2">
                  <a href={`/edit/${s.slug}`} className="rounded-md bg-zinc-900 px-3 py-1.5 font-medium text-white">
                    Editar
                  </a>
                  <a href={siteUrl(s.slug)} target="_blank" rel="noreferrer" className="rounded-md border border-zinc-300 px-3 py-1.5 font-medium">
                    Ver site ↗
                  </a>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
