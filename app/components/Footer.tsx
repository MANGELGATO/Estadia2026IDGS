'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, MessageCircle } from 'lucide-react';
import PrivacyPolicyModal from './PrivacyPolicyModal';

export default function Footer() {
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  return (
    <footer className="bg-[#1e5ca7] text-white font-body">
      {/* Contenedor Principal */}
      <div className="mx-auto max-w-[1240px] px-6 pt-14 pb-10">
        {/* Fila Superior: 3 Columnas */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.5fr_1fr_1.5fr] md:gap-14">
          {/* Columna 1: SOLUCIONES PLAi / Marca Editorial y Redes Sociales */}
          <div>
            <div className="mb-3 flex items-center gap-3">
              <Image
                src="/images/FOOTERIMG/logo-solo-BDfajDsx.svg"
                alt="Logo SOLUCIONES PLAi"
                width={40}
                height={26}
                className="h-8 w-auto object-contain"
              />
              <span className="font-heading text-2xl font-bold tracking-tight text-white">
                SOLUCIONES PLAi
              </span>
            </div>

            <p className="mb-2 max-w-[360px] text-[0.88rem] leading-[1.65] text-white/85">
              Soluciones tecnológicas, equipamiento especializado y espacios de innovación para impulsar proyectos de alto impacto en Jalisco.
            </p>

            {/* Leyenda de modificación solicitada */}
            <div className="mb-5 inline-flex items-center gap-1.5 rounded bg-white/10 px-2.5 py-1 text-[0.72rem] font-medium text-white/80 border border-white/20">
              <span className="text-amber-200">✎</span>
              <span>Sección / Leyenda sujeta a edición institucional de PLAi</span>
            </div>

            {/* Redes Sociales en color Naranja Oficial (#ed8d1b) */}
            <div className="flex items-center gap-2.5">
              {/* Facebook */}
              <a
                href="https://www.facebook.com/PLAiJalisco"
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-9 items-center justify-center rounded-full bg-[#ed8d1b] text-white transition-all duration-200 hover:scale-110 hover:brightness-110 shadow-sm"
                aria-label="Facebook"
              >
                <svg className="size-4 fill-current" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>

              {/* X / Twitter */}
              <a
                href="https://x.com/PLAiJalisco"
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-9 items-center justify-center rounded-full bg-[#ed8d1b] text-white transition-all duration-200 hover:scale-110 hover:brightness-110 shadow-sm"
                aria-label="X (Twitter)"
              >
                <svg className="size-3.5 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>

              {/* Instagram */}
              <a
                href="https://www.instagram.com/plaijalisco"
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-9 items-center justify-center rounded-full bg-[#ed8d1b] text-white transition-all duration-200 hover:scale-110 hover:brightness-110 shadow-sm"
                aria-label="Instagram"
              >
                <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/></svg>
              </a>

              {/* YouTube */}
              <a
                href="https://www.youtube.com/@PLAiJalisco"
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-9 items-center justify-center rounded-full bg-[#ed8d1b] text-white transition-all duration-200 hover:scale-110 hover:brightness-110 shadow-sm"
                aria-label="YouTube"
              >
                <svg className="size-4 fill-current" viewBox="0 0 24 24"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58zM9.75 15.02V8.98L15.5 12z"/></svg>
              </a>

              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com/company/plai-jalisco"
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-9 items-center justify-center rounded-full bg-[#ed8d1b] text-white transition-all duration-200 hover:scale-110 hover:brightness-110 shadow-sm"
                aria-label="LinkedIn"
              >
                <svg className="size-4 fill-current" viewBox="0 0 24 24"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
              </a>
            </div>
          </div>

          {/* Columna 2: Navegación (reproduce fielmente la estructura del header) */}
          <div>
            <h3 className="mb-4 font-heading text-[1rem] font-bold tracking-wide text-white">
              Navegación
            </h3>
            <ul className="flex flex-col gap-2.5 p-0 list-none text-[0.92rem]">
              <li>
                <Link href="/" className="text-white/80 transition-colors duration-150 hover:text-white">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/categorias" className="text-white/80 transition-colors duration-150 hover:text-white">
                  Categorías
                </Link>
              </li>
              <li>
                <Link href="/equipos" className="text-white/80 transition-colors duration-150 hover:text-white">
                  Equipos
                </Link>
              </li>
              <li>
                <Link href="/aplicaciones" className="text-white/80 transition-colors duration-150 hover:text-white">
                  Aplicaciones
                </Link>
              </li>
              <li>
                <Link href="/espacios" className="text-white/80 transition-colors duration-150 hover:text-white">
                  Espacios
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-white/60 transition-colors duration-150 hover:text-white text-[0.85rem]">
                  Panel de Administración
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 3: Ubicación y Contacto */}
          <div className="flex flex-col gap-6">
            {/* Ubicación */}
            <div className="flex items-start gap-3.5">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white shadow-inner">
                <MapPin className="size-4 text-white" />
              </div>
              <div>
                <h4 className="font-heading text-[0.95rem] font-bold text-white mb-0.5">
                  Ubicación
                </h4>
                <p className="text-[0.86rem] leading-snug text-white/80 max-w-[280px]">
                  C. Independencia 55, Guadalajara, Jalisco, Ciudad Creativa Digital
                </p>
              </div>
            </div>

            {/* Contacto */}
            <div className="flex items-start gap-3.5">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white shadow-inner">
                <MessageCircle className="size-4 text-white" />
              </div>
              <div>
                <h4 className="font-heading text-[0.95rem] font-bold text-white mb-0.5">
                  Contacto
                </h4>
                <div className="flex flex-col gap-1 text-[0.86rem] text-white/80">
                  <a href="mailto:plai.ayuda@plai.mx" className="hover:text-white hover:underline transition-colors">
                    plai.ayuda@plai.mx
                  </a>
                  <a href="tel:+523314101620" className="hover:text-white hover:underline transition-colors">
                    +52 33 1410 1620
                  </a>
                  <a
                    href="https://wa.me/523314101620"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white hover:underline transition-colors"
                  >
                    Whatsapp PLAi
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fila Media: Logos Institucionales (footerimg) */}
        <div className="my-8 border-t border-white/15 pt-8">
          <div className="flex flex-wrap items-center justify-center gap-8 md:justify-between md:gap-6">
            {/* 1. Ciudad Creativa Digital */}
            <div className="flex items-center justify-center">
              <Image
                src="/images/FOOTERIMG/A_CCD.154e6245.svg"
                alt="Ciudad Creativa Digital"
                width={155}
                height={55}
                className="h-10 md:h-12 w-auto object-contain opacity-90 transition-opacity hover:opacity-100"
              />
            </div>

            {/* 2. PLAi */}
            <div className="flex items-center justify-center">
              <Image
                src="/images/FOOTERIMG/A_PLAi.8631c8bf.svg"
                alt="Plataforma Abierta de Innovación"
                width={178}
                height={55}
                className="h-10 md:h-12 w-auto object-contain opacity-90 transition-opacity hover:opacity-100"
              />
            </div>

            {/* 3. SICyT */}
            <div className="flex items-center justify-center">
              <Image
                src="/images/FOOTERIMG/A_SICYT.ee61346a.svg"
                alt="Innovación, Ciencia y Tecnología"
                width={236}
                height={55}
                className="h-10 md:h-12 w-auto object-contain opacity-90 transition-opacity hover:opacity-100"
              />
            </div>

            {/* 4. Coordinación de Crecimiento y Desarrollo Económico */}
            <div className="flex items-center justify-center">
              <Image
                src="/images/FOOTERIMG/A_COORDINACION.e75ecbc5.svg"
                alt="Coordinación de Crecimiento y Desarrollo Económico"
                width={236}
                height={55}
                className="h-10 md:h-12 w-auto object-contain opacity-90 transition-opacity hover:opacity-100"
              />
            </div>

            {/* 5. Al Estilo Jalisco */}
            <div className="flex items-center justify-center">
              <Image
                src="/images/FOOTERIMG/A_JALISCO.1b4e7f4a.svg"
                alt="Al Estilo Jalisco"
                width={214}
                height={55}
                className="h-10 md:h-12 w-auto object-contain opacity-90 transition-opacity hover:opacity-100"
              />
            </div>
          </div>
        </div>

        {/* Fila Inferior: Derechos, Aviso de Privacidad y Horarios */}
        <div className="border-t border-white/15 pt-7">
          <div className="flex flex-col items-center justify-between gap-6 text-center md:flex-row md:items-start md:text-left">
            {/* Copyright */}
            <span className="text-[0.84rem] text-white/70">
              © 2026 SOLUCIONES PLAi. Todos los derechos reservados.
            </span>

            {/* Aviso de Privacidad con enlace oficial de PLAi */}
            <div className="flex items-center gap-3">
              <a
                href="https://plai.mx/aviso-de-privacidad"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[0.86rem] text-white/85 underline underline-offset-4 transition-colors hover:text-white"
              >
                Aviso de privacidad
              </a>
              <span className="text-white/40">|</span>
              <button
                type="button"
                onClick={() => setIsPrivacyOpen(true)}
                className="cursor-pointer text-[0.82rem] text-white/60 transition-colors hover:text-white hover:underline"
                title="Consultar resumen normativo interno"
              >
                (Ver detalle)
              </button>
            </div>

            {/* Horarios de atención */}
            <div className="text-[0.84rem] text-white/80">
              <p className="font-heading font-bold text-white mb-0.5">Horarios de atención</p>
              <p className="text-white/85">Lunes - Viernes: 9:00 AM - 5:00 PM</p>
              <p className="text-white/85">Sábados - Domingos: Cerrado</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal interactivo de soporte normativo */}
      <PrivacyPolicyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
    </footer>
  );
}
