import type { ComponentType } from "react";
import type { SectionOf, SectionType } from "@/lib/tenant/schema";
import { Checklist } from "./Checklist";
import { Contact } from "./Contact";
import { Faq } from "./Faq";
import { Hero } from "./Hero";
import { Location } from "./Location";
import { Notice } from "./Notice";
import { OpeningHours } from "./OpeningHours";
import { Services } from "./Services";
import { Stats } from "./Stats";
import type { SectionProps } from "./shared";

/**
 * type do JSON → componente. Para criar uma seção nova:
 * 1) schema em lib/tenant/schema.ts  2) componente  3) entrada aqui.
 * O TypeScript obriga a registrar todo tipo declarado no schema.
 */
export const SECTION_REGISTRY: { [T in SectionType]: ComponentType<SectionProps<SectionOf<T>>> } = {
  hero: Hero,
  notice: Notice,
  stats: Stats,
  services: Services,
  checklist: Checklist,
  openingHours: OpeningHours,
  location: Location,
  faq: Faq,
  contact: Contact,
};
