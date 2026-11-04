import type { Metadata } from "next";
import { fontVariables } from "~/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hub · Page Builder de Cartórios",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${fontVariables} antialiased`}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
