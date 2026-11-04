import type { Data } from "@puckeditor/core";
import type { Section, SectionType, Tenant } from "@/lib/tenant/schema";

/**
 * Tradução entre o JSON do tenant (formato do renderer / API) e o formato do Puck.
 *
 *  Tenant JSON                         Puck Data
 *  ─────────────────────────────────   ──────────────────────────────────────────
 *  { name, slogan, theme, seo, ... }   root.props
 *  sections[i] = {type, id, navLabel,  content[i] = {type, props: {id: <puck>,
 *                 variant, data}}                    anchor, navLabel, variant, ...data}}
 *
 * Diferenças tratadas:
 *  - `props.id` é reservado pelo Puck → o id/âncora da seção vira `anchor`.
 *  - Arrays de string viram arrays de objeto ({ text }), pois o campo array do Puck
 *    trabalha com objetos (hero.highlights, checklist.items[].documents).
 *  - Campos vazios do editor ("") são removidos antes de validar/salvar.
 */

export type RootProps = Omit<Tenant, "slug" | "sections">;
export type PuckData = Data<Record<string, Record<string, unknown>>, RootProps>;

type Props = Record<string, unknown>;
const wrap = (xs: unknown) => (Array.isArray(xs) ? xs.map((text) => ({ text })) : []);
const unwrap = (xs: unknown) =>
  Array.isArray(xs) ? xs.map((x) => (x as { text?: string }).text ?? "").filter(Boolean) : [];

// ---------- tenant → Puck ----------

function dataToProps(type: SectionType, data: Props): Props {
  if (type === "hero") return { ...data, highlights: wrap(data.highlights) };
  if (type === "checklist") {
    const items = (data.items as Props[]).map((i) => ({ ...i, documents: wrap(i.documents) }));
    return { ...data, items };
  }
  return { ...data };
}

export function tenantToPuck(tenant: Tenant): PuckData {
  const { slug: _slug, sections, ...root } = tenant;
  return {
    root: { props: root },
    content: sections.map((s, i) => ({
      type: s.type,
      props: {
        id: `${s.type}-${i}`,
        anchor: s.id ?? "",
        navLabel: s.navLabel ?? "",
        ...("variant" in s ? { variant: s.variant } : {}),
        ...dataToProps(s.type, s.data as Props),
      },
    })),
  };
}

// ---------- Puck → tenant ----------

/** Remove strings vazias e objetos que ficaram vazios (ex.: CTA sem texto nem link). */
export function clean<T>(value: T): T {
  if (typeof value === "string") return (value.trim() === "" ? undefined : value) as T;
  if (Array.isArray(value)) return value.map(clean).filter((v) => v !== undefined) as T;
  if (value && typeof value === "object") {
    const out: Props = {};
    for (const [k, v] of Object.entries(value)) {
      const c = clean(v);
      if (c !== undefined) out[k] = c;
    }
    return (Object.keys(out).length ? out : undefined) as T;
  }
  return value;
}

/** Props de um bloco do Puck → seção no formato do JSON (ainda não validada). */
export function propsToSection(type: string, props: Props): unknown {
  const { id: _puckId, anchor, navLabel, variant, puck: _p, editMode: _e, ...rest } = props;
  let data: Props = rest;
  if (type === "hero") data = { ...rest, highlights: unwrap(rest.highlights) };
  if (type === "checklist") {
    data = {
      ...rest,
      items: ((rest.items as Props[]) ?? []).map((i) => ({ ...i, documents: unwrap(i.documents) })),
    };
  }
  return clean({ type, id: anchor, navLabel, variant, data: data }) ?? { type, data: {} };
}

export function puckToTenant(slug: string, data: PuckData): unknown {
  const root = (data.root.props ?? {}) as Props;
  return {
    ...clean(root),
    slug,
    sections: data.content.map((c) => propsToSection(c.type, c.props as Props)),
  };
}

/** Seções "falsas" só com âncora/rótulo — o suficiente para o menu do cabeçalho no preview. */
export function navFromContent(content: PuckData["content"]): Section[] {
  return content.map(
    (c) =>
      ({
        type: c.type,
        id: (c.props as Props).anchor || undefined,
        navLabel: (c.props as Props).navLabel || undefined,
      }) as unknown as Section,
  );
}
