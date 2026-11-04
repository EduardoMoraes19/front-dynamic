import "server-only";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { TenantSchema, type Tenant } from "./schema";
import type { TenantSource } from "./source";

const DIR = path.join(process.cwd(), "data", "tenants");

export class LocalTenantSource implements TenantSource {
  async listSlugs() {
    const files = await readdir(DIR);
    return files.filter((f) => f.endsWith(".json")).map((f) => f.replace(/\.json$/, ""));
  }

  async getBySlug(slug: string): Promise<Tenant | null> {
    if (!/^[a-z0-9-]+$/.test(slug)) return null;
    let raw: string;
    try {
      raw = await readFile(path.join(DIR, `${slug}.json`), "utf8");
    } catch {
      return null;
    }
    const parsed = TenantSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) {
      throw new Error(`Config inválida para "${slug}":\n${z.prettifyError(parsed.error)}`);
    }
    return parsed.data;
  }
}
