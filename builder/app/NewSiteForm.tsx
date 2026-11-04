"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const slugify = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);

export function NewSiteForm({ templates }: { templates: { slug: string; name: string }[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [template, setTemplate] = useState(templates[0]?.slug ?? "");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/sites", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, slug, template }),
    });
    const body = await res.json();
    setBusy(false);
    if (!body.ok) return setError(body.error);
    router.push(`/edit/${body.slug}`);
  }

  const input = "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-900";

  return (
    <form onSubmit={submit} className="grid gap-4 rounded-xl border border-zinc-200 bg-white p-6 md:grid-cols-[2fr_1.5fr_1.5fr_auto] md:items-end">
      <label className="grid gap-1 text-sm font-medium text-zinc-700">
        Nome do cartório
        <input
          required
          className={input}
          value={name}
          placeholder="Cartório de Registro Civil Leste"
          onChange={(e) => {
            setName(e.target.value);
            if (!slugTouched) setSlug(slugify(e.target.value));
          }}
        />
      </label>
      <label className="grid gap-1 text-sm font-medium text-zinc-700">
        Slug (subdomínio)
        <input
          required
          className={`${input} font-mono`}
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(e.target.value);
          }}
        />
      </label>
      <label className="grid gap-1 text-sm font-medium text-zinc-700">
        Começar a partir de
        <select className={input} value={template} onChange={(e) => setTemplate(e.target.value)}>
          {templates.map((t) => (
            <option key={t.slug} value={t.slug}>
              {t.name}
            </option>
          ))}
        </select>
      </label>
      <button disabled={busy} className="h-[38px] rounded-md bg-zinc-900 px-5 text-sm font-semibold text-white disabled:opacity-50">
        {busy ? "Criando…" : "Criar site"}
      </button>
      {error && <pre className="whitespace-pre-wrap text-sm text-red-700 md:col-span-4">{error}</pre>}
    </form>
  );
}
