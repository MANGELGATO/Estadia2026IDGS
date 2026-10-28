'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import NavAuthStatus from './NavAuthStatus';

const navLinkClass =
  "relative text-[0.95rem] font-medium text-plai-gray transition-all duration-200 hover:text-plai " +
  "after:absolute after:inset-x-0 after:-bottom-1 after:h-0.5 after:rounded-sm after:bg-plai " +
  "after:origin-center after:scale-x-0 after:transition-transform after:duration-200 hover:after:scale-x-100";

export default function Navbar() {
  const pathname = usePathname();

  // No mostrar el Navbar público en las rutas del panel de administración
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-black/[0.08] bg-white shadow-[0_1px_0_rgba(0,0,0,0.06)]">
      <div className="mx-auto flex h-[68px] max-w-[1200px] items-center justify-between gap-8 px-6">
        {/* Logo oficial de PLAi */}
        <Link href="/" className="flex shrink-0 items-center">
          <Image
            src="/logotipo.png"
            alt="PLAi - Plataforma Abierta de Innovación"
            width={160}
            height={48}
            priority
            className="h-10 w-auto object-contain"
          />
        </Link>

        <nav className="hidden gap-10 md:flex">
          <Link href="/" className={navLinkClass}>Inicio</Link>
          <Link href="/espacios" className={navLinkClass}>Espacios</Link>
          <Link href="/#categorias" className={navLinkClass}>Categorías</Link>
          <Link href="/#aplicaciones" className={navLinkClass}>Aplicaciones</Link>
          <Link href="/#contacto" className={navLinkClass}>Contacto</Link>
        </nav>

        <NavAuthStatus />
      </div>
    </header>
  );
}
