import { ImageResponse } from "next/og";
import { monogramOf } from "@/components/brand/Seal";
import { getTenant, tenantSource } from "@/lib/tenant";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export async function generateStaticParams() {
  const slugs = await tenantSource.listSlugs();
  return slugs.map((slug) => ({ slug }));
}

/** Favicon gerado por tenant: monograma nas cores da marca. */
export default async function Icon({ params }: { params: Promise<{ slug: string }> }) {
  const tenant = await getTenant((await params).slug);
  const bg = tenant?.theme.primary ?? "#111827";
  const fg = tenant?.theme.onPrimary ?? "#ffffff";
  const text = tenant ? monogramOf(tenant.name, tenant.theme.monogram) : "?";
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: bg,
          color: fg,
          borderRadius: 14,
          fontSize: text.length > 2 ? 24 : 32,
          fontWeight: 700,
        }}
      >
        {text}
      </div>
    ),
    size,
  );
}
