import type { ComponentType } from "react";
import type { Section, Tenant } from "@/lib/tenant/schema";
import { SECTION_REGISTRY } from "./registry";
import type { SectionProps } from "./shared";

export function SectionRenderer({ tenant }: { tenant: Tenant }) {
  return (
    <>
      {tenant.sections.map((section, i) => {
        const Component = SECTION_REGISTRY[section.type] as ComponentType<SectionProps<Section>>;
        return <Component key={`${section.type}-${i}`} section={section} tenant={tenant} />;
      })}
    </>
  );
}
