"use client";

import type { CustomField, Field } from "@puckeditor/core";

/* Helpers para declarar campos do Puck de forma enxuta e em português. */

export const text = (label: string, placeholder?: string): Field => ({ type: "text", label, placeholder });
export const textarea = (label: string): Field => ({ type: "textarea", label });
export const number = (label: string): Field => ({ type: "number", label });
export const select = (label: string, options: [string, string][]): Field => ({
  type: "select",
  label,
  options: options.map(([value, l]) => ({ value, label: l })),
});
export const radio = (label: string, options: [string, string][]): Field => ({
  type: "radio",
  label,
  options: options.map(([value, l]) => ({ value, label: l })),
});
export const cta = (label: string): Field => ({
  type: "object",
  label,
  objectFields: { label: text("Texto do botão"), href: text("Link", "#contato") },
});
export const stringList = (label: string, itemLabel = "Item"): Field => ({
  type: "array",
  label,
  arrayFields: { text: text(itemLabel) },
  defaultItemProps: { text: "" },
  getItemSummary: (item: { text?: string }) => item.text || itemLabel,
});

/** Âncora + rótulo no menu: comuns a todas as seções. */
export const navFields = {
  anchor: text("Âncora (id da seção)", "ex.: servicos"),
  navLabel: text("Rótulo no menu", "vazio = não aparece no menu"),
};

const box: React.CSSProperties = {
  display: "flex",
  gap: 8,
  alignItems: "center",
};
const labelStyle: React.CSSProperties = { fontSize: 14, fontWeight: 500, marginBottom: 6, display: "block" };

/** Seletor de cor: color picker + hex. */
export const color = (label: string): CustomField<string> => ({
  type: "custom",
  label,
  render: ({ value, onChange, id }) => (
    <div>
      <label htmlFor={id} style={labelStyle}>
        {label}
      </label>
      <div style={box}>
        <input
          id={id}
          type="color"
          value={/^#[0-9a-fA-F]{6}$/.test(value ?? "") ? value : "#000000"}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          style={{ width: 40, height: 32, padding: 0, border: "1px solid #ddd", borderRadius: 4, cursor: "pointer" }}
        />
        <input
          type="text"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          style={{ flex: 1, height: 32, padding: "0 8px", border: "1px solid #ddd", borderRadius: 4, fontFamily: "monospace" }}
        />
      </div>
    </div>
  ),
});

const DAYS = ["D", "S", "T", "Q", "Q", "S", "S"];
const DAY_NAMES = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

/** Dias da semana como botões liga/desliga (0 = domingo). */
export const days = (label: string): CustomField<number[]> => ({
  type: "custom",
  label,
  render: ({ value = [], onChange }) => (
    <div>
      <span style={labelStyle}>{label}</span>
      <div style={{ display: "flex", gap: 4 }}>
        {DAYS.map((d, i) => {
          const on = value.includes(i);
          return (
            <button
              key={i}
              type="button"
              title={DAY_NAMES[i]}
              onClick={() => onChange(on ? value.filter((x) => x !== i) : [...value, i].sort())}
              style={{
                width: 30,
                height: 30,
                borderRadius: 4,
                border: "1px solid #ccc",
                background: on ? "#1f2937" : "white",
                color: on ? "white" : "#1f2937",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {d}
            </button>
          );
        })}
      </div>
    </div>
  ),
});
