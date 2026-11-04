import { Fraunces, IBM_Plex_Mono, Source_Sans_3, Space_Grotesk } from "next/font/google";

// Mesmas famílias do renderer.
export const serif = Fraunces({ variable: "--font-serif", subsets: ["latin"] });
export const sans = Source_Sans_3({ variable: "--font-sans", subsets: ["latin"] });
export const grotesk = Space_Grotesk({ variable: "--font-grotesk", subsets: ["latin"] });
export const mono = IBM_Plex_Mono({ variable: "--font-mono", subsets: ["latin"], weight: ["400", "500", "600"] });

export const fontVariables = [serif, sans, grotesk, mono].map((f) => f.variable).join(" ");

/**
 * O canvas do Puck é um iframe: as classes de fonte do <html> do editor não chegam lá.
 * Este CSS declara as variáveis no :root do iframe.
 */
export const fontRootCss = `:root{--font-serif:${serif.style.fontFamily};--font-sans:${sans.style.fontFamily};--font-grotesk:${grotesk.style.fontFamily};--font-mono:${mono.style.fontFamily};}`;
