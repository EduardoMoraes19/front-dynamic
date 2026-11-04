import { Fraunces, IBM_Plex_Mono, Source_Sans_3, Space_Grotesk } from "next/font/google";
import "./globals.css";

// Todas as famílias ficam disponíveis como CSS vars; cada tenant escolhe quais usar.
const serif = Fraunces({ variable: "--font-serif", subsets: ["latin"] });
const sans = Source_Sans_3({ variable: "--font-sans", subsets: ["latin"] });
const grotesk = Space_Grotesk({ variable: "--font-grotesk", subsets: ["latin"] });
const mono = IBM_Plex_Mono({ variable: "--font-mono", subsets: ["latin"], weight: ["400", "500", "600"] });

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${serif.variable} ${sans.variable} ${grotesk.variable} ${mono.variable} antialiased`}
    >
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
