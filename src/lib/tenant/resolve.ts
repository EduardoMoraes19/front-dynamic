import domains from "../../../data/domains.json";

const DOMAIN_MAP = domains as Record<string, string>;

/** Hosts que exibem o índice da POC (nenhum tenant). */
const ROOT_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0"]);

export type Resolution =
  | { kind: "tenant"; slug: string }
  | { kind: "root" };

/**
 * host → tenant.
 * Ordem: 1) override ?tenant=  2) mapa explícito domains.json
 *        3) convenção <slug>.localhost  4) host raiz → índice
 * Qualquer outro host vira um slug inexistente → 404 "cartório não encontrado".
 */
export function resolveTenant(hostHeader: string | null, override?: string | null): Resolution {
  if (override) return { kind: "tenant", slug: override.toLowerCase() };

  const host = (hostHeader ?? "").split(":")[0].toLowerCase().replace(/^www\./, "");
  if (DOMAIN_MAP[host]) return { kind: "tenant", slug: DOMAIN_MAP[host] };
  if (ROOT_HOSTS.has(host) || host === "") return { kind: "root" };
  if (host.endsWith(".localhost")) return { kind: "tenant", slug: host.slice(0, -".localhost".length) };

  return { kind: "tenant", slug: host.replace(/[^a-z0-9-]/g, "-") };
}
