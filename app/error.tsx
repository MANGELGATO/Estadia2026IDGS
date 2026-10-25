'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Registro interno seguro (sin exponer stack al DOM del cliente)
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error no capturado en la aplicación:', error);
    }
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="relative mb-6 flex items-center justify-center">
        <div className="absolute -inset-4 rounded-full bg-red-500/10 blur-xl"></div>
        <div className="relative flex size-20 items-center justify-center rounded-2xl bg-white shadow-plai-md border border-red-100">
          <AlertTriangle size={40} className="text-red-500" />
        </div>
      </div>

      <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-red-700">
        Incidencia Técnica
      </div>

      <h1 className="mt-4 font-heading text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">
        Ha ocurrido un error inesperado
      </h1>

      <p className="mt-3 max-w-lg font-body text-base text-plai-gray sm:text-lg">
        No se pudo completar la solicitud actual. Por motivos de seguridad institucional, los detalles técnicos han sido resguardados.
      </p>

      {error.digest && (
        <div className="mt-4 rounded-lg bg-slate-100 px-3 py-1.5 font-mono text-xs text-plai-muted">
          Código de referencia para soporte: <span className="font-semibold text-navy">{error.digest}</span>
        </div>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-heading text-sm font-bold text-white shadow-plai-sm transition-all hover:bg-[#004a87] hover:shadow-plai-md active:scale-95"
        >
          <RefreshCw size={18} />
          Intentar nuevamente
        </button>

        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl border border-navy/20 bg-white px-6 py-3 font-heading text-sm font-bold text-navy shadow-plai-sm transition-all hover:bg-slate-50 hover:border-navy/40 active:scale-95"
        >
          <Home size={18} className="text-plai" />
          Volver al Inicio
        </Link>
      </div>

      <div className="mt-12 text-xs text-plai-muted">
        Si el problema persiste, contacte al área de Tecnologías de Información de PLAi.
      </div>
    </div>
  );
}
