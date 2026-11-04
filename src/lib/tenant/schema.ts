import { z } from "zod";

const hex = z.string().regex(/^#([0-9a-fA-F]{6})$/, "cor deve ser hex #RRGGBB");

export const FONT_KEYS = ["serif", "sans", "grotesk", "mono"] as const;
export const RADIUS_KEYS = ["none", "sm", "md", "lg", "xl"] as const;
export const ICON_KEYS = [
  "file-text", "scroll", "stamp", "pen", "house", "baby", "heart", "gavel",
  "landmark", "signature", "key", "scale", "users", "badge", "shield",
  "building", "file-check", "calendar",
] as const;

export const ThemeSchema = z.object({
  primary: hex,
  onPrimary: hex,
  accent: hex,
  background: hex,
  surface: hex,
  text: hex,
  muted: hex,
  headingFont: z.enum(FONT_KEYS),
  bodyFont: z.enum(FONT_KEYS),
  radius: z.enum(RADIUS_KEYS),
  monogram: z.string().max(5).optional(),
});

const cta = z.object({ label: z.string(), href: z.string() });

/** Campos comuns a qualquer seção: âncora e rótulo opcional no menu. */
const base = {
  id: z.string().optional(),
  navLabel: z.string().optional(),
};

export const HeroSection = z.object({
  ...base,
  type: z.literal("hero"),
  variant: z.enum(["split", "centered", "monumental"]).default("centered"),
  data: z.object({
    eyebrow: z.string().optional(),
    title: z.string().optional(),
    subtitle: z.string().optional(),
    cta: cta.optional(),
    secondaryCta: cta.optional(),
    highlights: z.array(z.string()).default([]),
  }),
});

export const NoticeSection = z.object({
  ...base,
  type: z.literal("notice"),
  data: z.object({
    tone: z.enum(["info", "warning"]).default("info"),
    title: z.string(),
    text: z.string(),
    cta: cta.optional(),
  }),
});

export const StatsSection = z.object({
  ...base,
  type: z.literal("stats"),
  data: z.object({
    items: z.array(z.object({ value: z.string(), label: z.string() })).min(1),
  }),
});

export const ServicesSection = z.object({
  ...base,
  type: z.literal("services"),
  variant: z.enum(["grid", "list"]).default("grid"),
  data: z.object({
    title: z.string().default("Serviços"),
    intro: z.string().optional(),
    items: z
      .array(
        z.object({
          icon: z.enum(ICON_KEYS).default("file-text"),
          title: z.string(),
          description: z.string(),
          tag: z.string().optional(),
        }),
      )
      .min(1),
  }),
});

export const ChecklistSection = z.object({
  ...base,
  type: z.literal("checklist"),
  data: z.object({
    title: z.string().default("O que levar"),
    intro: z.string().optional(),
    items: z
      .array(z.object({ service: z.string(), documents: z.array(z.string()).min(1) }))
      .min(1),
  }),
});

export const OpeningHoursSection = z.object({
  ...base,
  type: z.literal("openingHours"),
  data: z.object({
    title: z.string().default("Horário de atendimento"),
    timezone: z.string().default("America/Sao_Paulo"),
    schedule: z
      .array(
        z.object({
          label: z.string(),
          days: z.array(z.number().int().min(0).max(6)),
          open: z.string().regex(/^\d{2}:\d{2}$/),
          close: z.string().regex(/^\d{2}:\d{2}$/),
        }),
      )
      .min(1),
    note: z.string().optional(),
  }),
});

export const LocationSection = z.object({
  ...base,
  type: z.literal("location"),
  data: z.object({
    title: z.string().default("Onde estamos"),
    address: z.string(),
    city: z.string(),
    lat: z.number(),
    lng: z.number(),
    reference: z.string().optional(),
  }),
});

export const FaqSection = z.object({
  ...base,
  type: z.literal("faq"),
  data: z.object({
    title: z.string().default("Perguntas frequentes"),
    items: z.array(z.object({ q: z.string(), a: z.string() })).min(1),
  }),
});

export const ContactSection = z.object({
  ...base,
  type: z.literal("contact"),
  data: z.object({
    title: z.string().default("Fale com a gente"),
    text: z.string().optional(),
    phone: z.string().optional(),
    whatsapp: z.string().optional(),
    email: z.string().optional(),
  }),
});

export const SectionSchema = z.discriminatedUnion("type", [
  HeroSection,
  NoticeSection,
  StatsSection,
  ServicesSection,
  ChecklistSection,
  OpeningHoursSection,
  LocationSection,
  FaqSection,
  ContactSection,
]);

export type Section = z.infer<typeof SectionSchema>;
export type SectionType = Section["type"];
export type SectionOf<T extends SectionType> = Extract<Section, { type: T }>;

/**
 * Seções são validadas individualmente: uma seção inválida ou de tipo
 * desconhecido é descartada com warning em vez de derrubar a página inteira.
 * Isso deixa o front resiliente quando o JSON vier de uma API que evolui.
 */
const ResilientSections = z.array(z.unknown()).transform((raw) =>
  raw.flatMap((entry, index) => {
    const parsed = SectionSchema.safeParse(entry);
    if (parsed.success) return [parsed.data];
    const type = (entry as { type?: unknown })?.type;
    console.warn(
      `[tenant] seção #${index} (type=${String(type)}) ignorada:\n${z.prettifyError(parsed.error)}`,
    );
    return [];
  }),
);

export const TenantSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string(),
  shortName: z.string().optional(),
  slogan: z.string(),
  kind: z.enum(["notas", "registro-civil", "imoveis", "protesto", "titulos-documentos"]),
  theme: ThemeSchema,
  seo: z.object({ title: z.string(), description: z.string() }),
  sections: ResilientSections,
  legal: z.object({
    cns: z.string(),
    officer: z.string(),
    officerTitle: z.string().default("Oficial Titular"),
    cnpj: z.string().optional(),
  }),
});

/** Variante estrita (usada ao salvar pelo builder): seção inválida é erro, não warning. */
export const TenantSchemaStrict = TenantSchema.extend({ sections: z.array(SectionSchema) });

export type Tenant = z.infer<typeof TenantSchema>;
export type Theme = z.infer<typeof ThemeSchema>;

export const KIND_LABEL: Record<Tenant["kind"], string> = {
  notas: "Tabelionato de Notas",
  "registro-civil": "Registro Civil",
  imoveis: "Registro de Imóveis",
  protesto: "Tabelionato de Protesto",
  "titulos-documentos": "Títulos e Documentos",
};
