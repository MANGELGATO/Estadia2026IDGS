import type { Metadata } from "next";
import { Montserrat, Mulish } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SessionProviderWrapper from "./components/SessionProviderWrapper";

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
  title: "PLAi - Aprender | Dashboard de Equipos",
  description: "Plataforma Abierta de Innovación. Laboratorio de Innovación, Robótica y Tecnologías Inmersivas.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${montserrat.variable} ${mulish.variable}`}>
      <body>
        <SessionProviderWrapper>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
