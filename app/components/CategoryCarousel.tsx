'use client';
import Link from 'next/link';
import { Headset, Bot, Monitor, Plane, Printer, ArrowRight } from 'lucide-react';

const categories = [
  {
    id: 'realidad-virtual',
    filterKey: 'Realidad Virtual',
    name: 'Realidad Virtual',
    icon: Headset,
    description: 'Visores, controles y accesorios de última generación para experiencias inmersivas y simulaciones educativas.',
    color: '#7c3aed',
    count: 3,
  },
  {
    id: 'robotica',
    filterKey: 'Robótica',
    name: 'Robótica',
    icon: Bot,
    description: 'Brazos robóticos, kits Arduino y Raspberry Pi para programar y construir proyectos de automatización.',
    color: '#0ea5e9',
    count: 3,
  },
  {
    id: 'fabricacion-digital',
    filterKey: 'Fabricación digital',
    name: 'Fabricación Digital',
    icon: Printer,
    description: 'Impresoras 3D de alta velocidad y escáneres para convertir diseños digitales en objetos reales.',
    color: '#f59e0b',
    count: 3,
  },
  {
    id: 'drones',
    filterKey: 'Drones',
    name: 'Drones',
    icon: Plane,
    description: 'Drones profesionales para captura aérea, mapeo y entrenamiento de vuelo con controladores avanzados.',
    color: '#10b981',
    count: 2,
  },
  {
    id: 'computo-multimedia',
    filterKey: 'Cómputo',
    name: 'Cómputo / Multimedia',
    icon: Monitor,
    description: 'Equipos de alto rendimiento para diseño 3D, edición de video, desarrollo y gaming.',
    color: '#a81e71',
    count: 2,
  },
];

export default function CategoryCarousel() {
  return (
    <div className="border-b border-black/[0.08] bg-white pb-8 pt-10">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="mb-7 flex items-center justify-between">
          <h2 className="text-[1.35rem] font-extrabold text-navy">Explora Categorías</h2>
          <Link
            href="#dispositivos"
            className="inline-flex items-center gap-[0.35rem] font-heading text-[0.85rem] font-semibold text-plai transition-all duration-[250ms] hover:gap-[0.55rem]"
          >
            Ver todos los equipos <ArrowRight size={15} />
          </Link>
        </div>
        <div className="flex items-stretch gap-5 overflow-x-auto px-1 pb-4 pt-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="group min-h-[170px] w-[150px] shrink-0 transition-[width,min-height] duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)] hover:z-10 hover:min-h-[280px] hover:w-[300px]"
            >
              <div className="relative flex h-full min-h-[inherit] items-center justify-center overflow-hidden rounded-2xl border-[1.5px] border-black/[0.08] bg-[#F4F6F9] transition-[border-color,box-shadow,background-color] duration-300 group-hover:border-plai group-hover:bg-white group-hover:shadow-[0_12px_40px_rgba(168,30,113,0.14)]">
                {/* Default state */}
                <div className="absolute flex w-full scale-100 flex-col items-center gap-3 px-4 pb-5 pt-6 text-center opacity-100 transition-[opacity,transform] duration-200 group-hover:pointer-events-none group-hover:scale-[0.82] group-hover:opacity-0">
                  <div
                    className="flex size-[62px] items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--cat-color)_13%,transparent)] text-[var(--cat-color)]"
                    style={{ '--cat-color': cat.color } as React.CSSProperties}
                  >
                    <cat.icon size={30} />
                  </div>
                  <span className="font-heading text-[0.88rem] font-bold leading-[1.3] text-navy">{cat.name}</span>
                  <span className="text-[0.72rem] font-normal text-plai-muted">{cat.count} equipos</span>
                </div>

                {/* Hover / expanded state */}
                <div className="pointer-events-none absolute inset-0 flex translate-y-[10px] flex-col items-start gap-[0.65rem] px-5 py-6 opacity-0 transition-[opacity,transform] delay-[80ms] duration-[280ms] group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100">
                  <div
                    className="flex size-11 shrink-0 items-center justify-center rounded-[10px]"
                    style={{ background: cat.color }}
                  >
                    <cat.icon size={26} color="white" />
                  </div>
                  <h3 className="font-heading text-[0.98rem] font-extrabold leading-[1.2] text-navy">{cat.name}</h3>
                  <p className="flex-1 text-[0.78rem] leading-[1.6] text-plai-gray">{cat.description}</p>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/categoria/${cat.id}`}
                      className="inline-flex items-center gap-[0.35rem] rounded-full bg-plai px-[0.85rem] py-[0.45rem] font-heading text-[0.75rem] font-bold text-white transition-all duration-[250ms] hover:bg-navy"
                    >
                      Saber más <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
