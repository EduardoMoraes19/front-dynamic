import { NextResponse, type NextRequest } from "next/server";
import { resolveTenant } from "@/lib/tenant/resolve";

/**
 * Lê o host da requisição e reescreve (sem mudar a URL do usuário)
 * para /sites/<slug>/..., onde a página do tenant é renderizada.
 */
export function proxy(request: NextRequest) {
  const url = request.nextUrl;

  // /sites/* já é a rota interna (ex.: ícone gerado por tenant) — não reescreve de novo.
  if (url.pathname.startsWith("/sites/")) return NextResponse.next();

  const resolution = resolveTenant(request.headers.get("host"), url.searchParams.get("tenant"));
  if (resolution.kind === "root") return NextResponse.next();

  const target = url.clone();
  target.pathname = `/sites/${resolution.slug}${url.pathname === "/" ? "" : url.pathname}`;
  target.searchParams.delete("tenant");
  return NextResponse.rewrite(target);
}

export const config = {
  matcher: ["/((?!_next/|api/|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|ico|txt|xml)$).*)"],
};
