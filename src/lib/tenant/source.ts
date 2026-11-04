import type { Tenant } from "./schema";

/**
 * Contrato da fonte de dados de tenants.
 * Hoje: LocalTenantSource (JSON em /data/tenants).
 * Futuro: ApiTenantSource (fetch para a API) — basta implementar esta interface
 * e trocar a exportação em `index.ts`.
 */
export interface TenantSource {
  getBySlug(slug: string): Promise<Tenant | null>;
  listSlugs(): Promise<string[]>;
}
