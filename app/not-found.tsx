import Link from 'next/link';
import { Home, Compass, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="relative mb-6 flex items-center justify-center">
        <div className="absolute -inset-4 rounded-full bg-plai/10 blur-xl"></div>
        <div className="relative flex size-24 items-center justify-center rounded-2xl bg-white shadow-plai-md border border-black/[0.06]">
          <span className="font-heading text-4xl font-extrabold text-plai">404</span>
        </div>
      </div>

      <div className="inline-flex items-center gap-2 rounded-full bg-navy/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-navy">
        <Search size={14} className="text-plai" />
        Recurso no localizado
      </div>

      <h1 className="mt-4 font-heading text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">
        Página no encontrada
      </h1>

      <p className="mt-3 max-w-md font-body text-base text-plai-gray sm:text-lg">
        La ruta o recurso al que intentas acceder no existe, ha sido reubicado o no está disponible en la plataforma.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-heading text-sm font-bold text-white shadow-plai-sm transition-all hover:bg-[#004a87] hover:shadow-plai-md active:scale-95"
        >
          <Home size={18} />
          Volver al Inicio
        </Link>

        <Link
          href="/categoria/laboratorio-de-innovacion-tecnologica"
          className="inline-flex items-center gap-2 rounded-xl border border-navy/20 bg-white px-6 py-3 font-heading text-sm font-bold text-navy shadow-plai-sm transition-all hover:bg-slate-50 hover:border-navy/40 active:scale-95"
        >
          <Compass size={18} className="text-plai" />
          Explorar Catálogo
        </Link>
      </div>

      <div className="mt-12 text-xs text-plai-muted">
        Plataforma Abierta de Innovación (PLAi) &bull; Red de Recursos y Espacios
      </div>
    </div>
  );
}
