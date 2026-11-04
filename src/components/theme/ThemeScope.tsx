import type { CSSProperties, ReactNode } from "react";
import type { Theme } from "@/lib/tenant/schema";

const FONT_VAR: Record<Theme["headingFont"], string> = {
  serif: "var(--font-serif)",
  sans: "var(--font-sans)",
  grotesk: "var(--font-grotesk)",
  mono: "var(--font-mono)",
};

const RADIUS: Record<Theme["radius"], string> = {
  none: "0px",
  sm: "0.25rem",
  md: "0.5rem",
  lg: "1rem",
  xl: "1.5rem",
};

export function themeToCssVars(theme: Theme): CSSProperties {
  return {
    "--t-primary": theme.primary,
    "--t-on-primary": theme.onPrimary,
    "--t-accent": theme.accent,
    "--t-bg": theme.background,
    "--t-surface": theme.surface,
    "--t-ink": theme.text,
    "--t-muted": theme.muted,
    "--t-radius": RADIUS[theme.radius],
    "--t-font-heading": FONT_VAR[theme.headingFont],
    "--t-font-body": FONT_VAR[theme.bodyFont],
  } as CSSProperties;
}

/**
 * Aplica o tema no <body> via <style> inline renderizado no servidor:
 * o HTML já chega com as cores certas, sem flash.
 */
export function ThemeScope({ theme, children }: { theme: Theme; children: ReactNode }) {
  const vars = Object.entries(themeToCssVars(theme))
    .map(([k, v]) => `${k}:${v};`)
    .join("");
  return (
    <>
      <style>{`:root{${vars}}`}</style>
      {children}
    </>
  );
}
