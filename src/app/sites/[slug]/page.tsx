import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SectionRenderer } from "@/components/sections/SectionRenderer";
import { ThemeScope } from "@/components/theme/ThemeScope";
import { getTenant, tenantSource } from "@/lib/tenant";

// Pré-renderiza os tenants conhecidos; slugs novos são renderizados sob demanda.
export async function generateStaticParams() {
  const slugs = await tenantSource.listSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/sites/[slug]">): Promise<Metadata> {
  const tenant = await getTenant((await params).slug);
  if (!tenant) return { title: "Cartório não encontrado" };
  return {
    title: tenant.seo.title,
    description: tenant.seo.description,
    openGraph: { title: tenant.seo.title, description: tenant.seo.description, siteName: tenant.name },
  };
}

export default async function TenantPage({ params }: PageProps<"/sites/[slug]">) {
  const tenant = await getTenant((await params).slug);
  if (!tenant) notFound();

  return (
    <ThemeScope theme={tenant.theme}>
      <SiteHeader tenant={tenant} />
      <main>
        <SectionRenderer tenant={tenant} />
      </main>
      <SiteFooter tenant={tenant} />
    </ThemeScope>
  );
}
