"use client";

import { createContext, useContext, type ComponentType } from "react";
import { createUsePuck, type Config, type Fields } from "@puckeditor/core";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SECTION_REGISTRY } from "@/components/sections/registry";
import type { SectionProps } from "@/components/sections/shared";
import { ThemeScope } from "@/components/theme/ThemeScope";
import { ICON_KEYS, KIND_LABEL, SectionSchema, ThemeSchema, type Section, type SectionType, type Tenant, type Theme } from "@/lib/tenant/schema";
import { fontRootCss } from "./fonts";
import { clean, navFromContent, propsToSection, type RootProps } from "./mapping";
import { color, cta, days, navFields, number, radio, select, stringList, text, textarea } from "./fields";

/* ------------------------------------------------------------------ *
 *  Os blocos do editor renderizam OS MESMOS componentes do renderer   *
 *  (src/components/sections). O que o usuário vê no canvas é          *
 *  exatamente o que será publicado.                                   *
 * ------------------------------------------------------------------ */

const TenantCtx = createContext<Tenant | null>(null);
const usePuck = createUsePuck();

const ICON_OPTIONS = ICON_KEYS.map((k) => [k, k] as [string, string]);

/** Converte as props do bloco em seção, valida e renderiza o componente real. */
function SectionPreview({ type, props }: { type: SectionType; props: Record<string, unknown> }) {
  const tenant = useContext(TenantCtx);
  const parsed = SectionSchema.safeParse(propsToSection(type, props));
  if (!tenant) return null;
  if (!parsed.success) {
    return (
      <div style={{ margin: 16, padding: 16, border: "2px dashed #f59e0b", background: "#fffbeb", color: "#78350f", fontFamily: "system-ui", fontSize: 14 }}>
        <strong>Seção “{type}” incompleta.</strong> Preencha os campos obrigatórios no painel à direita.
        <pre style={{ whiteSpace: "pre-wrap", fontSize: 12, marginTop: 8 }}>
          {parsed.error.issues.map((i) => `• ${i.path.join(".")}: ${i.message}`).join("\n")}
        </pre>
      </div>
    );
  }
  const Component = SECTION_REGISTRY[type] as ComponentType<SectionProps<Section>>;
  return <Component section={parsed.data} tenant={tenant} />;
}

function block(type: SectionType, label: string, fields: Fields, defaultProps: Record<string, unknown>) {
  return {
    label,
    fields: { ...fields, ...navFields } as Fields,
    defaultProps: { anchor: "", navLabel: "", ...defaultProps },
    render: (props: Record<string, unknown>) => <SectionPreview type={type} props={props} />,
  };
}

const DEFAULT_THEME: Theme = {
  primary: "#1F2937", onPrimary: "#FFFFFF", accent: "#6B7280", background: "#FAFAFA",
  surface: "#FFFFFF", text: "#111827", muted: "#6B7280", headingFont: "sans", bodyFont: "sans", radius: "md",
};

/** Campo a campo: enquanto o usuário digita uma cor inválida, usa o padrão só naquele campo. */
function safeTheme(input: Partial<Theme> | undefined): Theme {
  const theme = { ...DEFAULT_THEME } as Record<string, unknown>;
  const raw = (clean(input) ?? {}) as Record<string, unknown>;
  for (const [key, schema] of Object.entries(ThemeSchema.shape)) {
    if (schema.safeParse(raw[key]).success && raw[key] !== undefined) theme[key] = raw[key];
  }
  return theme as Theme;
}

/** Root: aplica tema + cabeçalho + rodapé em volta das seções (igual ao renderer). */
function RootRender({ children, slug, ...props }: RootProps & { children: React.ReactNode; slug: string }) {
  const content = usePuck((s) => s.appState.data.content);

  const tenant = {
    ...props,
    slug,
    theme: safeTheme(props.theme),
    legal: { ...props.legal, officerTitle: props.legal?.officerTitle || "Oficial Titular" },
    sections: navFromContent(content),
  } as Tenant;

  return (
    <TenantCtx.Provider value={tenant}>
      <style>{fontRootCss}</style>
      <ThemeScope theme={tenant.theme}>
        <SiteHeader tenant={tenant} />
        <main>{children}</main>
        <SiteFooter tenant={tenant} />
      </ThemeScope>
    </TenantCtx.Provider>
  );
}

const FONT_OPTIONS: [string, string][] = [
  ["serif", "Serifada (Fraunces)"],
  ["sans", "Sans (Source Sans)"],
  ["grotesk", "Grotesk (Space Grotesk)"],
  ["mono", "Mono (IBM Plex Mono)"],
];

export function createConfig(slug: string): Config {
  return {
    categories: {
      abertura: { title: "Abertura", components: ["hero", "notice", "stats"] },
      conteudo: { title: "Conteúdo", components: ["services", "checklist", "faq"] },
      atendimento: { title: "Atendimento", components: ["openingHours", "location", "contact"] },
    },
    root: {
      fields: {
        name: text("Nome oficial do cartório"),
        shortName: text("Nome curto (cabeçalho)"),
        slogan: textarea("Slogan"),
        kind: select("Tipo de serventia", Object.entries(KIND_LABEL)),
        theme: {
          type: "object",
          label: "🎨 Tema",
          objectFields: {
            primary: color("Cor primária"),
            onPrimary: color("Texto sobre a primária"),
            accent: color("Cor de destaque"),
            background: color("Fundo"),
            surface: color("Superfície (cards)"),
            text: color("Texto"),
            muted: color("Texto secundário"),
            headingFont: select("Fonte dos títulos", FONT_OPTIONS),
            bodyFont: select("Fonte do texto", FONT_OPTIONS),
            radius: radio("Arredondamento", [["none", "0"], ["sm", "P"], ["md", "M"], ["lg", "G"], ["xl", "GG"]]),
            monogram: text("Monograma do selo", "ex.: 1ºT"),
          },
        },
        seo: {
          type: "object",
          label: "🔎 SEO",
          objectFields: { title: text("Título da aba / Google"), description: textarea("Descrição") },
        },
        legal: {
          type: "object",
          label: "⚖️ Dados legais (rodapé)",
          objectFields: {
            officer: text("Oficial / Tabelião"),
            officerTitle: text("Cargo"),
            cns: text("CNS"),
            cnpj: text("CNPJ"),
          },
        },
      },
      render: (props: Record<string, unknown>) => <RootRender {...(props as unknown as RootProps & { children: React.ReactNode })} slug={slug} />,
    },
    components: {
      hero: block(
        "hero",
        "Hero (abertura)",
        {
          variant: radio("Layout", [["split", "Dividido + selo"], ["centered", "Centralizado"], ["monumental", "Monumental"]]),
          eyebrow: text("Chamada pequena (acima do título)"),
          title: text("Título", "vazio = nome do cartório"),
          subtitle: textarea("Subtítulo (vazio = slogan)"),
          cta: cta("Botão principal"),
          secondaryCta: cta("Botão secundário"),
          highlights: stringList("Destaques", "Destaque"),
        },
        {
          variant: "centered",
          eyebrow: "",
          title: "",
          subtitle: "",
          cta: { label: "Fale conosco", href: "#contato" },
          secondaryCta: { label: "", href: "" },
          highlights: [{ text: "Atendimento com hora marcada" }],
        },
      ),
      notice: block(
        "notice",
        "Aviso (faixa)",
        {
          tone: radio("Estilo", [["info", "Informativo"], ["warning", "Destaque"]]),
          title: text("Título"),
          text: text("Texto"),
          cta: cta("Link"),
        },
        { tone: "info", title: "Aviso", text: "Atendimento especial neste feriado.", cta: { label: "", href: "" } },
      ),
      stats: block(
        "stats",
        "Números",
        {
          items: {
            type: "array",
            label: "Números",
            arrayFields: { value: text("Valor"), label: text("Legenda") },
            defaultItemProps: { value: "10", label: "anos" },
            getItemSummary: (i: { value?: string; label?: string }) => `${i.value ?? ""} ${i.label ?? ""}`,
          },
        },
        { items: [{ value: "50", label: "anos de história" }, { value: "+10 mil", label: "atos por ano" }] },
      ),
      services: block(
        "services",
        "Serviços",
        {
          variant: radio("Layout", [["grid", "Grade"], ["list", "Lista"]]),
          title: text("Título"),
          intro: textarea("Introdução"),
          items: {
            type: "array",
            label: "Serviços",
            arrayFields: {
              icon: select("Ícone", ICON_OPTIONS),
              title: text("Nome"),
              description: textarea("Descrição"),
              tag: text("Etiqueta", "ex.: Online"),
            },
            defaultItemProps: { icon: "file-text", title: "Novo serviço", description: "Descrição do serviço.", tag: "" },
            getItemSummary: (i: { title?: string }) => i.title || "Serviço",
          },
        },
        {
          variant: "grid",
          title: "Serviços",
          intro: "",
          items: [
            { icon: "file-text", title: "Certidões", description: "Emissão de certidões.", tag: "" },
            { icon: "pen", title: "Reconhecimento de firma", description: "Por semelhança ou autenticidade.", tag: "" },
          ],
        },
      ),
      checklist: block(
        "checklist",
        "Checklist (o que levar)",
        {
          title: text("Título"),
          intro: textarea("Introdução"),
          items: {
            type: "array",
            label: "Serviços",
            arrayFields: { service: text("Serviço"), documents: stringList("Documentos", "Documento") },
            defaultItemProps: { service: "Novo serviço", documents: [{ text: "RG e CPF" }] },
            getItemSummary: (i: { service?: string }) => i.service || "Serviço",
          },
        },
        { title: "O que levar", intro: "", items: [{ service: "Procuração", documents: [{ text: "RG e CPF originais" }] }] },
      ),
      openingHours: block(
        "openingHours",
        "Horários",
        {
          title: text("Título"),
          timezone: text("Fuso horário"),
          schedule: {
            type: "array",
            label: "Turnos",
            arrayFields: { label: text("Descrição"), days: days("Dias"), open: text("Abre (HH:MM)"), close: text("Fecha (HH:MM)") },
            defaultItemProps: { label: "Segunda a sexta", days: [1, 2, 3, 4, 5], open: "09:00", close: "17:00" },
            getItemSummary: (i: { label?: string; open?: string; close?: string }) => `${i.label ?? ""} ${i.open ?? ""}–${i.close ?? ""}`,
          },
          note: text("Observação"),
        },
        {
          title: "Horário de atendimento",
          timezone: "America/Sao_Paulo",
          schedule: [{ label: "Segunda a sexta", days: [1, 2, 3, 4, 5], open: "09:00", close: "17:00" }],
          note: "",
        },
      ),
      location: block(
        "location",
        "Localização",
        {
          title: text("Título"),
          address: text("Endereço"),
          city: text("Cidade — UF"),
          lat: number("Latitude"),
          lng: number("Longitude"),
          reference: text("Ponto de referência"),
        },
        { title: "Onde estamos", address: "Rua Exemplo, 100", city: "São Paulo — SP", lat: -23.5505, lng: -46.6333, reference: "" },
      ),
      faq: block(
        "faq",
        "Perguntas frequentes",
        {
          title: text("Título"),
          items: {
            type: "array",
            label: "Perguntas",
            arrayFields: { q: text("Pergunta"), a: textarea("Resposta") },
            defaultItemProps: { q: "Nova pergunta?", a: "Resposta." },
            getItemSummary: (i: { q?: string }) => i.q || "Pergunta",
          },
        },
        { title: "Perguntas frequentes", items: [{ q: "Preciso agendar?", a: "Recomendamos o agendamento." }] },
      ),
      contact: block(
        "contact",
        "Contato",
        {
          title: text("Título"),
          text: textarea("Texto"),
          phone: text("Telefone"),
          whatsapp: text("WhatsApp (só números, com DDI)", "5511999999999"),
          email: text("E-mail"),
        },
        { title: "Fale com a gente", text: "", phone: "(11) 0000-0000", whatsapp: "", email: "" },
      ),
    },
  };
}
