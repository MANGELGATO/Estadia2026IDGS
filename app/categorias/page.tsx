import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Layers, Sparkles, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Categorías Tecnológicas | PLAi',
  description: 'Conoce todas las áreas y categorías tecnológicas del Laboratorio de Innovación de PLAi en Ciudad Creativa Digital.',
};

const CATEGORIES_DATA = [
  {
    id: 'realidad-virtual',
    name: 'Realidad Virtual y Mixta',
    image: '/images/categorias/realidad-virtual.png',
    color: '#1e5ca7',
    badge: 'Inmersión 3D',
    count: 3,
    description: 'Visores Meta Quest 3 y HTC Vive Pro 2 con accesorios de última generación para experiencias inmersivas, diseño espacial y simulaciones educativas de alto impacto.',
    highlights: ['Simuladores médicos sin riesgo', 'Gemelos digitales de arquitectura', 'Entornos colaborativos de metaverso'],
  },
  {
    id: 'robotica',
    name: 'Robótica y Automatización',
    image: '/images/categorias/robotica.png',
    color: '#0ea5e9',
    badge: 'Industria 4.0',
    count: 3,
    description: 'Brazos robóticos articulados DOBOT Magician, kits Arduino Mega y placas Raspberry Pi 4 para programar y prototipar algoritmos de cinemática e inteligencia artificial.',
    highlights: ['Cinemática inversa y pick & place', 'Control de sensores y actuadores IoT', 'Prototipado rápido de mecatrónica'],
  },
  {
    id: 'fabricacion-digital',
    name: 'Fabricación Digital y 3D',
    image: '/images/categorias/fabricacion-digital.png',
    color: '#ed8d1b',
    badge: 'Cultura Maker',
    count: 3,
    description: 'Impresoras 3D de alta velocidad Bambu Lab X1-Carbon, Prusa i3 MK3S+ y escáneres 3D Revopoint. Servicio 100% gratuito bajo la modalidad "Trae tu propio filamento".',
    highlights: ['Impresión FDM en PLA, PETG y TPU', 'Escaneo tridimensional de alta precisión', 'Validación de prototipos funcionales'],
  },
  {
    id: 'drones',
    name: 'Drones y Captura Aérea',
    image: '/images/categorias/drones.png',
    color: '#10b981',
    badge: 'Aeroespacial',
    count: 2,
    description: 'Flota de aeronaves no tripuladas DJI Mini 3 Pro y DJI Mavic para fotogrametría avanzada, mapeo topográfico, agricultura de precisión y producción audiovisual.',
    highlights: ['Fotogrametría y mapeo geoespacial', 'Inspección técnica de infraestructura', 'Capacitación en vuelo seguro'],
  },
  {
    id: 'computo-multimedia',
    name: 'Cómputo de Alto Rendimiento',
    image: '/images/categorias/computo.png',
    color: '#0086ff',
    badge: 'GPU & Workstation',
    count: 2,
    description: 'Estaciones Alienware Aurora R15 con GPU NVIDIA RTX 4090 y laptops MacBook Pro M3 Max diseñadas para desarrollo de videojuegos en Unreal/Unity, render 3D y edición 8K.',
    highlights: ['Desarrollo en Unreal Engine 5 y Unity', 'Modelado y animación en Blender 3D', 'Edición y posproducción en DaVinci/Final Cut'],
  },
];

export default function CategoriasPage() {
  return (
    <div className="min-h-screen bg-[#F4F6F9]">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-navy via-[#162e50] to-[#0086ff] pb-16 pt-12 text-white shadow-md">
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
              <Layers size={14} className="text-[#0086ff]" />
              Ejes Tecnológicos de Innovación
            </div>
            <h1 className="font-heading text-3xl font-black tracking-[-0.03em] sm:text-4xl md:text-5xl">
              Catálogo de Categorías
            </h1>
            <p className="text-base leading-relaxed text-white/85 md:text-lg">
              Conoce las 5 disciplinas tecnológicas del laboratorio de PLAi. Descubre casos de uso institucional, equipos disponibles y solicita sesiones de trabajo.
            </p>
          </div>
        </div>
      </div>

      {/* Grid de Categorías con Íconos Oficiales */}
      <div className="mx-auto max-w-[1200px] px-6 py-14">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES_DATA.map((cat) => (
            <div
              key={cat.id}
              className="flex flex-col overflow-hidden rounded-3xl border border-black/[0.08] bg-white shadow-plai-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-plai-md"
            >
              {/* Encabezado con imagen oficial */}
              <div
                className="relative flex items-center justify-between p-6 pb-4 border-b border-black/[0.05]"
                style={{ background: `linear-gradient(135deg, color-mix(in srgb, ${cat.color} 8%, white) 0%, white 100%)` }}
              >
                <div
                  className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-white p-3 shadow-sm border border-black/[0.06]"
                  style={{ borderColor: `color-mix(in srgb, ${cat.color} 30%, transparent)` }}
                >
                  <img src={cat.image} alt={cat.name} className="size-10 object-contain drop-shadow-xs" />
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span
                    className="rounded-full px-2.5 py-0.5 text-[0.7rem] font-bold uppercase tracking-wide text-white shadow-2xs"
                    style={{ backgroundColor: cat.color }}
                  >
                    {cat.badge}
                  </span>
                  <span className="font-mono text-xs font-semibold text-plai-muted">
                    {cat.count} equipos
                  </span>
                </div>
              </div>

              {/* Cuerpo de la tarjeta */}
              <div className="flex flex-1 flex-col p-6">
                <h2 className="font-heading text-xl font-extrabold text-navy leading-snug mb-2">
                  {cat.name}
                </h2>
                <p className="text-sm text-plai-gray leading-relaxed mb-6">
                  {cat.description}
                </p>

                {/* Puntos destacados */}
                <div className="mb-6 mt-auto space-y-2 border-t border-black/[0.05] pt-4 text-xs text-navy">
                  <span className="block font-bold text-plai-muted uppercase text-[0.7rem] tracking-wider mb-2">
                    Aplicaciones en Jalisco:
                  </span>
                  {cat.highlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle2 size={13} className="shrink-0" style={{ color: cat.color }} />
                      <span className="truncate">{h}</span>
                    </div>
                  ))}
                </div>

                {/* Botón de acceso a la categoría */}
                <Link
                  href={`/categoria/${cat.id}`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl py-3 font-heading text-sm font-bold text-white shadow-md transition-all hover:opacity-95 active:scale-[0.99]"
                  style={{ backgroundColor: cat.color }}
                >
                  Explorar Equipos de {cat.name.split(' ')[0]} <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Banner inferior de enlace a catálogo general */}
        <div className="mt-14 flex flex-col items-center justify-between gap-6 rounded-3xl border border-black/[0.08] bg-white p-8 md:flex-row md:p-10 shadow-plai-sm">
          <div>
            <h3 className="font-heading text-xl font-bold text-navy">
              ¿Prefieres buscar directamente por nombre o especificaciones de equipo?
            </h3>
            <p className="text-sm text-plai-muted mt-1">
              Accede al catálogo interactivo completo con búsqueda patrimonial, filtros y disponibilidad en tiempo real.
            </p>
          </div>
          <Link
            href="/equipos"
            className="shrink-0 inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3.5 font-heading text-sm font-bold text-white shadow-plai-sm hover:bg-[#004a87] transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            Ver Catálogo Completo de Equipos <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
