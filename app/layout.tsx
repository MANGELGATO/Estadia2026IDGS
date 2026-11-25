import type { Metadata } from "next";
import { headers } from "next/headers";
import { Montserrat, Mulish } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SessionProviderWrapper from "./components/SessionProviderWrapper";
import AccessibilityButton from "./components/AccessibilityButton";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const mulish = Mulish({
  variable: "--font-mulish",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "SOLUCIONES PLAi | Recursos y Espacios Tecnológicos",
  description: "SOLUCIONES PLAi — Plataforma Abierta de Innovación. Catálogo de equipamiento tecnológico, aplicaciones inmersivas y espacios especializados.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Leer x-nonce fuerza renderizado dinámico por petición para que Next.js 16
  // adjunte automáticamente el nonce CSP a sus scripts de hidratación.
  await headers();

  return (
    <html lang="es" className={`${montserrat.variable} ${mulish.variable}`}>
      <body>
        <SessionProviderWrapper>
          <Navbar />
          <main>{children}</main>
          <Footer />
          <AccessibilityButton />
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
