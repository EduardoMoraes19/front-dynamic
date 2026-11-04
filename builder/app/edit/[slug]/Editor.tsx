"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Puck, type Data } from "@puckeditor/core";
import "@puckeditor/core/puck.css";
import { createConfig } from "~/lib/puck-config";
import type { PuckData } from "~/lib/mapping";

type Status = { kind: "idle" } | { kind: "saving" } | { kind: "ok"; url: string; revalidated: boolean } | { kind: "error"; message: string };

export function Editor({ slug, name, data, siteUrl }: { slug: string; name: string; data: PuckData; siteUrl: string }) {
  const config = useMemo(() => createConfig(slug), [slug]);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function publish(next: Data) {
    setStatus({ kind: "saving" });
    const res = await fetch(`/api/sites/${slug}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(next),
    });
    const body = await res.json();
    setStatus(body.ok ? { kind: "ok", url: body.url, revalidated: body.revalidated } : { kind: "error", message: body.error });
  }

  return (
    <>
      <Puck
        config={config}
        data={data}
        onPublish={publish}
        headerTitle={name}
        headerPath={siteUrl.replace(/^https?:\/\//, "")}
        viewports={[
          { width: 390, height: "auto", label: "Celular", icon: "Smartphone" },
          { width: 820, height: "auto", label: "Tablet", icon: "Tablet" },
          { width: 1280, height: "auto", label: "Desktop", icon: "Monitor" },
        ]}
        overrides={{
          headerActions: ({ children }) => (
            <>
              <Link href="/" style={btn}>
                ← Sites
              </Link>
              <a href={siteUrl} target="_blank" rel="noreferrer" style={btn}>
                Ver site ↗
              </a>
              {children}
            </>
          ),
        }}
      />
      <Toast status={status} onClose={() => setStatus({ kind: "idle" })} />
    </>
  );
}

const btn: React.CSSProperties = {
  padding: "6px 12px",
  border: "1px solid #d4d4d8",
  borderRadius: 6,
  fontSize: 14,
  color: "#18181b",
  textDecoration: "none",
  background: "white",
};

function Toast({ status, onClose }: { status: Status; onClose: () => void }) {
  if (status.kind === "idle") return null;
  const tone =
    status.kind === "error" ? { bg: "#fef2f2", fg: "#991b1b", bd: "#fecaca" } : status.kind === "ok" ? { bg: "#f0fdf4", fg: "#166534", bd: "#bbf7d0" } : { bg: "#f4f4f5", fg: "#3f3f46", bd: "#e4e4e7" };
  return (
    <div
      role="status"
      style={{
        position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)", zIndex: 1000,
        maxWidth: 560, padding: "12px 16px", borderRadius: 8, border: `1px solid ${tone.bd}`,
        background: tone.bg, color: tone.fg, fontFamily: "system-ui", fontSize: 14, boxShadow: "0 8px 24px rgba(0,0,0,.12)",
      }}
    >
      {status.kind === "saving" && "Publicando…"}
      {status.kind === "ok" && (
        <>
          ✅ Publicado!{" "}
          <a href={status.url} target="_blank" rel="noreferrer" style={{ color: "inherit", fontWeight: 600 }}>
            Abrir {status.url.replace(/^https?:\/\//, "")} ↗
          </a>
          {!status.revalidated && <div style={{ marginTop: 4 }}>⚠️ Renderer não respondeu ao webhook (está rodando na :3000?).</div>}
        </>
      )}
      {status.kind === "error" && (
        <>
          <strong>Não foi possível publicar:</strong>
          <pre style={{ whiteSpace: "pre-wrap", margin: "6px 0 0", fontSize: 12 }}>{status.message}</pre>
        </>
      )}
      {status.kind !== "saving" && (
        <button onClick={onClose} style={{ marginLeft: 12, border: 0, background: "transparent", cursor: "pointer", color: "inherit" }} aria-label="Fechar">
          ✕
        </button>
      )}
    </div>
  );
}
