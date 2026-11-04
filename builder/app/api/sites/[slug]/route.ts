import { NextResponse } from "next/server";
import { z } from "zod";
import { TenantSchemaStrict } from "@/lib/tenant/schema";
import { puckToTenant, type PuckData } from "~/lib/mapping";
import { notifyRenderer, saveSite, siteExists, siteUrl } from "~/lib/store";

/** Publicar: Puck Data → JSON do tenant → validação estrita → grava → avisa o renderer. */
export async function PUT(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!(await siteExists(slug))) {
    return NextResponse.json({ ok: false, error: "Site não encontrado" }, { status: 404 });
  }

  const data = (await request.json()) as PuckData;
  const parsed = TenantSchemaStrict.safeParse(puckToTenant(slug, data));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: z.prettifyError(parsed.error) }, { status: 422 });
  }

  await saveSite(parsed.data);
  const revalidated = await notifyRenderer(slug);
  return NextResponse.json({ ok: true, url: siteUrl(slug), revalidated });
}
