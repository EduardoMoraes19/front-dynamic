import { NextResponse } from "next/server";
import { z } from "zod";
import { getSite, notifyRenderer, saveSite, siteExists } from "~/lib/store";

const CreateSite = z.object({
  slug: z
    .string()
    .min(3)
    .max(40)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "use letras minúsculas, números e hífen"),
  name: z.string().min(3),
  template: z.string(),
});

/** Cria um site novo a partir de um template (um site existente). */
export async function POST(request: Request) {
  const parsed = CreateSite.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: z.prettifyError(parsed.error) }, { status: 422 });
  }
  const { slug, name, template } = parsed.data;
  if (await siteExists(slug)) {
    return NextResponse.json({ ok: false, error: "Já existe um site com esse slug" }, { status: 409 });
  }
  const base = await getSite(template);
  if (!base) return NextResponse.json({ ok: false, error: "Template não encontrado" }, { status: 404 });

  await saveSite({
    ...base,
    slug,
    name,
    shortName: name,
    seo: { ...base.seo, title: name },
  });
  await notifyRenderer(slug);
  return NextResponse.json({ ok: true, slug });
}
