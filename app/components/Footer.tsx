import Link from 'next/link';
import { MapPin, Mail } from 'lucide-react';

const container = 'mx-auto max-w-[1200px] px-6';
const social = 'flex size-[38px] items-center justify-center rounded-full bg-plai text-white transition-all duration-[250ms] hover:bg-white hover:text-plai';
const colLink = 'text-white/65 transition-colors duration-200 hover:text-white';
const contactValue = 'text-[0.87rem] leading-[1.7] text-white/65';

export default function Footer() {
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
                <circle cx="56" cy="32" r="14" fill="#22C55E" fillOpacity="0.8"/>
                <circle cx="56" cy="32" r="8" fill="#1B365D"/>
              </svg>
              <span className="text-xl font-extrabold text-white">Aprender</span>
            </div>
            <p className="mb-6 leading-[1.7] text-white/65">
              Formación para la era digital enfocada en desarrollar talento para las empresas tecnológicas modernas.
            </p>
            <div className="flex gap-3">
              {/* Facebook */}
              <a href="#" className={social} aria-label="Facebook">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              {/* X/Twitter */}
              <a href="#" className={social} aria-label="Twitter">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              {/* Instagram */}
              <a href="#" className={social} aria-label="Instagram">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/></svg>
              </a>
              {/* YouTube */}
              <a href="#" className={social} aria-label="YouTube">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58zM9.75 15.02V8.98L15.5 12z"/></svg>
              </a>
              {/* LinkedIn */}
              <a href="#" className={social} aria-label="LinkedIn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
              </a>
            </div>
          </div>

          {/* Nav col */}
          <div className="flex flex-col">
            <h4 className="mb-5 text-[0.95rem] font-bold text-white">Navegación</h4>
            <nav className="flex flex-col gap-3">
              <Link href="/" className={colLink}>Inicio</Link>
              <Link href="#ejes" className={colLink}>Ejes temáticos</Link>
              <Link href="#sobre" className={colLink}>Sobre nosotros</Link>
              <Link href="#contacto" className={colLink}>Contacto</Link>
            </nav>
          </div>

          {/* Contact col */}
          <div className="flex flex-col">
            <h4 className="mb-5 text-[0.95rem] font-bold text-white">&nbsp;</h4>
            <div className="flex flex-col gap-5">
              <div className="flex items-start gap-[0.85rem]">
                <div className="mt-[0.1rem] flex size-9 shrink-0 items-center justify-center rounded-full bg-[rgba(168,30,113,0.3)] text-plai"><MapPin size={18} /></div>
                <div>
                  <p className="mb-[0.3rem] text-[0.82rem] font-bold text-white">Ubicación</p>
                  <p className={contactValue}>C. Independencia 55, Guadalajara, Jalisco, Ciudad Creativa Digital</p>
                </div>
              </div>
              <div className="flex items-start gap-[0.85rem]">
                <div className="mt-[0.1rem] flex size-9 shrink-0 items-center justify-center rounded-full bg-[rgba(168,30,113,0.3)] text-plai"><Mail size={18} /></div>
                <div>
                  <p className="mb-[0.3rem] text-[0.82rem] font-bold text-white">Contacto</p>
                  <p className={contactValue}>plai.ayuda@plai.mx</p>
                  <p className={contactValue}>+52 33 1410 1620</p>
                  <p className={contactValue}>Whatsapp PLAi</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Logos bar */}
      <div className="border-b border-white/[0.08] py-8">
        <div className={container}>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {['Ciudad Creativa Digital', 'Plataforma Abierta de Innovación', 'Innovación, Ciencia y Tecnología', 'Coordinación de Crecimiento', 'Al Estilo Jalisco'].map(l => (
              <div key={l} className="text-center text-[0.78rem] font-bold uppercase tracking-[0.04em] text-white/50">{l}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="py-6">
        <div className={`${container} flex flex-wrap items-start justify-between gap-8`}>
          <span className="text-[0.85rem] text-white/45">© 2025 Aprender. Todos los derechos reservados.</span>
          <div className="flex items-start gap-12">
            <Link href="#" className="text-[0.85rem] text-white/55 transition-colors duration-200 hover:text-white">Aviso de privacidad</Link>
            <div className="text-[0.82rem] leading-[1.7] text-white/55">
              <p className="mb-1 font-bold text-white">Horarios de atención</p>
              <p>Lunes - Viernes: 9:00 AM - 5:00 PM</p>
              <p>Sábados - Domingos: Cerrado</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
