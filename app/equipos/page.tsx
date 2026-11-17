import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Cpu, ShieldCheck } from 'lucide-react';
import EquipmentFilterGrid from '../components/EquipmentFilterGrid';

export const metadata: Metadata = {
  title: 'Catálogo de Equipos | PLAi',
  description: 'Explora todos los dispositivos, visores de realidad virtual, impresoras 3D, drones y estaciones de cómputo disponibles en PLAi.',
};

export default function EquiposPage() {
  return (
    <div className="min-h-screen bg-[#F4F6F9]">
      {/* Hero Institucional de la página de Equipos */}
      <div className="relative overflow-hidden bg-gradient-to-br from-navy via-[#162e50] to-[#0086ff] pb-14 pt-12 text-white shadow-md">
        <div className="pointer-events-none absolute -left-[20%] -top-[50%] h-[200%] w-[140%] rotate-[15deg] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08)_0%,transparent_60%)]" />
        <div className="relative z-10 mx-auto max-w-[1200px] px-6">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-[0.4rem] font-heading text-[0.88rem] font-semibold text-white/80 transition-all hover:-translate-x-1 hover:text-white"
          >
            <ArrowLeft size={18} /> Volver al inicio
          </Link>

          <div className="flex flex-col gap-3 md:max-w-[780px]">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              <Cpu size={14} className="text-[#0086ff]" />
              Infraestructura y Laboratorios PLAi
            </div>
            <h1 className="font-heading text-3xl font-black tracking-[-0.03em] sm:text-4xl md:text-5xl">
              Catálogo de Equipos Tecnológicos
            </h1>
            <p className="text-base leading-relaxed text-white/85 md:text-lg">
              Consulta el inventario de visores VR, brazos robóticos, manufactura aditiva y cómputo de alto rendimiento. Conoce especificaciones y disponibilidad para proyectos y capacitación.
            </p>
          </div>
        </div>
      </div>

      {/* Grid Interactivo con Búsqueda y Filtros */}
      <div className="-mt-4">
        <EquipmentFilterGrid />
      </div>
    </div>
  );
}
