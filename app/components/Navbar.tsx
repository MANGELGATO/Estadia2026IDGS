import Link from 'next/link';
import { UserCircle2 } from 'lucide-react';

const navLinkClass =
  "relative text-[0.95rem] font-medium text-plai-gray transition-all duration-200 hover:text-plai " +
  "after:absolute after:inset-x-0 after:-bottom-1 after:h-0.5 after:rounded-sm after:bg-plai " +
  "after:origin-center after:scale-x-0 after:transition-transform after:duration-200 hover:after:scale-x-100";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-black/[0.08] bg-white shadow-[0_1px_0_rgba(0,0,0,0.06)]">
      <div className="mx-auto flex h-[68px] max-w-[1200px] items-center justify-between gap-8 px-6">
        {/* Logo - exactly as in aprender.plai.mx */}
        <Link href="/" className="flex shrink-0 items-center gap-[0.6rem]">
          {/* PLAi colored logo circles icon */}
          <svg width="48" height="38" viewBox="0 0 80 62" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="18" cy="32" r="14" fill="#E91E8C"/>
            <circle cx="18" cy="32" r="8" fill="#F4F6F9"/>
            <circle cx="38" cy="20" r="12" fill="#F59E0B"/>
            <circle cx="56" cy="32" r="14" fill="#22C55E"/>
            <circle cx="56" cy="32" r="8" fill="#F4F6F9"/>
          </svg>
          <div className="flex flex-col leading-[1.15]">
            <span className="text-[0.78rem] font-extrabold text-navy">Plataforma</span>
            <span className="text-[0.72rem] font-medium leading-[1.2] text-plai-gray">Abierta de</span>
            <span className="text-[0.72rem] font-medium leading-[1.2] text-plai-gray">Innovación</span>
          </div>
        </Link>

        <nav className="hidden gap-10 md:flex">
          <Link href="/" className={navLinkClass}>Inicio</Link>
          <Link href="/espacios" className={navLinkClass}>Espacios</Link>
          <Link href="/#categorias" className={navLinkClass}>Categorías</Link>
          <Link href="/#aplicaciones" className={navLinkClass}>Aplicaciones</Link>
          <Link href="/#contacto" className={navLinkClass}>Contacto</Link>
        </nav>

        <Link
          href="/login"
          id="nav-login"
          className="btn btn-primary btn-sm h-auto shrink-0 whitespace-nowrap rounded-full border-0 px-[1.4rem] py-[0.55rem] text-[0.9rem] font-semibold shadow-none transition-all hover:-translate-y-px hover:bg-navy"
        >
          <UserCircle2 size={18} />
          Iniciar Sesión
        </Link>
      </div>
    </header>
  );
}
