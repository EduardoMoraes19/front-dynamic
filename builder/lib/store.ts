import "server-only";
import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { TenantSchema, type Tenant } from "@/lib/tenant/schema";

/**
 * "Banco" do hub nesta POC: os mesmos arquivos que o renderer lê.
 * Num hub real isto seria o banco de dados + a API pública de sites.
 */
const DATA_DIR = [path.resolve(process.cwd(), "data/tenants"), path.resolve(process.cwd(), "../data/tenants")].find(
  existsSync,
)!;

export const RENDERER_URL = process.env.RENDERER_URL ?? "http://localhost:3000";
const SECRET = process.env.REVALIDATE_SECRET ?? "dev-secret";

export function siteUrl(slug: string) {
  const u = new URL(RENDERER_URL);
  return `${u.protocol}//${slug}.${u.hostname}${u.port ? `:${u.port}` : ""}`;
}

export async function listSites(): Promise<Tenant[]> {
  const files = (await readdir(DATA_DIR)).filter((f) => f.endsWith(".json")).sort();
  const sites = await Promise.all(files.map((f) => getSite(f.replace(/\.json$/, ""))));
  return sites.filter((s): s is Tenant => s !== null);
}

export async function getSite(slug: string): Promise<Tenant | null> {
  if (!/^[a-z0-9-]+$/.test(slug)) return null;
  try {
    const raw = JSON.parse(await readFile(path.join(DATA_DIR, `${slug}.json`), "utf8"));
    return TenantSchema.parse(raw);
  } catch {
    return null;
  }
}

export async function siteExists(slug: string) {
  return existsSync(path.join(DATA_DIR, `${slug}.json`));
}

export async function saveSite(tenant: Tenant) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(path.join(DATA_DIR, `${tenant.slug}.json`), JSON.stringify(tenant, null, 2) + "\n");
}

/** Webhook para o renderer invalidar o cache do site publicado. */
export async function notifyRenderer(slug: string): Promise<boolean> {
  try {
    const res = await fetch(`${RENDERER_URL}/api/revalidate`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-revalidate-secret": SECRET },
      body: JSON.stringify({ slug }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
