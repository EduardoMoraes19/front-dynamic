import { notFound } from "next/navigation";
import { tenantToPuck } from "~/lib/mapping";
import { getSite, siteUrl } from "~/lib/store";
import { Editor } from "./Editor";

export default async function EditPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const site = await getSite(slug);
  if (!site) notFound();
  return <Editor slug={slug} name={site.shortName ?? site.name} data={tenantToPuck(site)} siteUrl={siteUrl(slug)} />;
}
