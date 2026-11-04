import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { LocalTenantSource } from "./local-source";
import type { TenantSource } from "./source";

// Para usar a API: `export const tenantSource: TenantSource = new ApiTenantSource(process.env.TENANT_API_URL!)`
export const tenantSource: TenantSource = new LocalTenantSource();

/**
 * Leitura cacheada do tenant. Com a API, invalidar após edição no painel com
 * `revalidateTag(\`tenant:${slug}\`)`.
 */
export async function getTenant(slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(`tenant:${slug}`);
  return tenantSource.getBySlug(slug);
}

export async function listTenants() {
  "use cache";
  cacheLife("hours");
  cacheTag("tenants");
  const slugs = await tenantSource.listSlugs();
  const all = await Promise.all(slugs.map((s) => tenantSource.getBySlug(s)));
  return all.filter((t) => t !== null);
}
