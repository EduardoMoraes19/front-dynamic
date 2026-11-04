import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";

const SECRET = process.env.REVALIDATE_SECRET ?? "dev-secret";

/**
 * Webhook chamado pelo hub/builder ao publicar um site.
 * Invalida o cache do tenant para a próxima visita já mostrar a versão nova.
 */
export async function POST(request: NextRequest) {
  if (request.headers.get("x-revalidate-secret") !== SECRET) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const { slug } = (await request.json().catch(() => ({}))) as { slug?: string };
  if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({ ok: false, error: "slug inválido" }, { status: 400 });
  }
  revalidateTag(`tenant:${slug}`, { expire: 0 });
  revalidateTag("tenants", { expire: 0 });
  return NextResponse.json({ ok: true, slug });
}
