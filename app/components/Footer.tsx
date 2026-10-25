'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MapPin, Mail } from 'lucide-react';
import PrivacyPolicyModal from './PrivacyPolicyModal';

const container = 'mx-auto max-w-[1200px] px-6';
const social = 'flex size-[38px] items-center justify-center rounded-full bg-plai text-white transition-all duration-[250ms] hover:bg-white hover:text-plai';
const colLink = 'text-white/65 transition-colors duration-200 hover:text-white';
const contactValue = 'text-[0.87rem] leading-[1.7] text-white/65';

export default function Footer() {
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  return (
    <footer className="bg-navy text-[0.9rem] text-white/75">
      <div className="border-b border-white/[0.08] py-14">
        <div className={`${container} grid grid-cols-1 gap-8 md:grid-cols-[1.6fr_1fr_1.4fr] md:gap-12`}>
          {/* Brand col */}
          <div>
            <div className="mb-4 flex items-center gap-3">
              <svg width="40" height="30" viewBox="0 0 80 62" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="18" cy="32" r="14" fill="#E91E8C" fillOpacity="0.8"/>
                <circle cx="18" cy="32" r="8" fill="#1B365D"/>
                <circle cx="38" cy="20" r="12" fill="#F59E0B" fillOpacity="0.9"/>
                <circle cx="38" cy="20" r="6" fill="#1B365D"/>
                <circle cx="58" cy="32" r="14" fill="#00C48C" fillOpacity="0.8"/>
                <circle cx="58" cy="32" r="8" fill="#1B365D"/>
                <circle cx="38" cy="44" r="12" fill="#7C3AED" fillOpacity="0.85"/>
                <circle cx="38" cy="44" r="6" fill="#1B365D"/>
              </svg>
              <span className="font-heading text-[1.4rem] font-black tracking-[-0.03em] text-white">PLAi</span>
            </div>
            <p className="mb-6 max-w-[340px] text-[0.87rem] leading-[1.65] text-white/65">
              Plataforma Abierta de Innovación. Impulsamos la innovación y el desarrollo tecnológico para toda la comunidad.
            </p>
            <div className="flex gap-[0.6rem]">
              {/* Facebook */}
              <a href="https://www.facebook.com/PLAiJalisco" target="_blank" rel="noopener noreferrer" className={social} aria-label="Facebook">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              {/* X/Twitter */}
              <a href="https://x.com/PLAiJalisco" target="_blank" rel="noopener noreferrer" className={social} aria-label="Twitter">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              {/* Instagram */}
              <a href="https://www.instagram.com/plaijalisco" target="_blank" rel="noopener noreferrer" className={social} aria-label="Instagram">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/></svg>
              </a>
              {/* YouTube */}
              <a href="https://www.youtube.com/@PLAiJalisco" target="_blank" rel="noopener noreferrer" className={social} aria-label="YouTube">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58zM9.75 15.02V8.98L15.5 12z"/></svg>
              </a>
              {/* LinkedIn */}
              <a href="https://www.linkedin.com/company/plai-jalisco" target="_blank" rel="noopener noreferrer" className={social} aria-label="LinkedIn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
              </a>
            </div>
          </div>

          {/* Nav links */}
          <div>
            <p className="mb-4 font-heading text-[0.8rem] font-bold tracking-[0.08em] text-white">NAVEGACIÓN</p>
            <ul className="flex flex-col gap-[0.7rem] list-none p-0">
              <li><Link href="/" className={colLink}>Inicio</Link></li>
              <li><Link href="/#equipos" className={colLink}>Equipos disponibles</Link></li>
              <li><Link href="/#categorias" className={colLink}>Categorías</Link></li>
              <li><Link href="/#aplicaciones" className={colLink}>Aplicaciones</Link></li>
              <li><Link href="/#cursos" className={colLink}>Agendar un curso</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="mb-4 font-heading text-[0.8rem] font-bold tracking-[0.08em] text-white">UBICACIÓN Y CONTACTO</p>
            {[
              {
                icon: <MapPin size={18} className="mt-1 shrink-0 text-plai" />,
                title: 'Ciudad Creativa Digital',
                lines: ['Calle López Cotilla 1505, Col. Americana', 'Torre C, Piso 2, Guadalajara, Jal.']
              },
              {
                icon: <Mail size={18} className="mt-1 shrink-0 text-plai" />,
                title: 'Correo de soporte',
                lines: ['soporte@plai.mx']
              }
            ].map((c, i) => (
              <div key={i} className="mb-4 flex items-start gap-3">
                {c.icon}
                <div>
                  <strong className="block text-[0.85rem] text-white">{c.title}</strong>
                  {c.lines.map((l, j) => <p key={j} className={contactValue}>{l}</p>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="py-6">
        <div className={`${container} flex flex-wrap items-start justify-between gap-8`}>
          <span className="text-[0.85rem] text-white/45">© 2026 Plataforma Abierta de Innovación (PLAi). Todos los derechos reservados.</span>
          <div className="flex items-start gap-12">
            <button
              type="button"
              onClick={() => setIsPrivacyOpen(true)}
              className="text-[0.85rem] text-white/55 transition-colors duration-200 hover:text-white cursor-pointer underline-offset-4 hover:underline"
            >
              Aviso de privacidad
            </button>
            <div className="text-[0.82rem] leading-[1.7] text-white/55">
              <p className="mb-1 font-bold text-white">Horarios de atención</p>
              <p>Lunes - Viernes: 9:00 AM - 5:00 PM</p>
              <p>Sábados - Domingos: Cerrado</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Aviso de Privacidad */}
      <PrivacyPolicyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
    </footer>
  );
}
