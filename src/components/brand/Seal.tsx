import { useId } from "react";

/**
 * "Selo" do cartório gerado a partir do nome — dispensa logo enviado pelo cliente.
 * Texto circular + monograma central, inspirado em carimbos e selos de fé pública.
 */
export function Seal({
  name,
  monogram,
  size = 160,
  className = "",
}: {
  name: string;
  monogram: string;
  size?: number;
  className?: string;
}) {
  const id = useId().replace(/:/g, "");
  const ring = `${name.toUpperCase()} • `;
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={`Selo de ${name}`}
    >
      <defs>
        <path id={`ring-${id}`} d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
      </defs>
      <circle cx="100" cy="100" r="97" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="100" cy="100" r="92" fill="none" stroke="currentColor" strokeWidth="0.75" />
      <circle cx="100" cy="100" r="62" fill="none" stroke="currentColor" strokeWidth="0.75" strokeDasharray="2 3" />
      <text fontSize="11.5" letterSpacing="2.2" fill="currentColor" style={{ fontFamily: "var(--t-font-heading)" }}>
        <textPath href={`#ring-${id}`} textLength={2 * Math.PI * 78 - 6} lengthAdjust="spacingAndGlyphs">
          {ring}
        </textPath>
      </text>
      <text
        x="100"
        y="100"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={monogram.length > 2 ? 34 : 44}
        fontWeight="600"
        fill="currentColor"
        style={{ fontFamily: "var(--t-font-heading)" }}
      >
        {monogram}
      </text>
    </svg>
  );
}

export function monogramOf(name: string, explicit?: string) {
  if (explicit) return explicit;
  return name
    .split(/\s+/)
    .filter((w) => w.length > 3)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}
