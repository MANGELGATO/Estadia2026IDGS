'use client';
import { useState } from 'react';
import Link from 'next/link';
import { GraduationCap, Building2, ArrowRight, Sparkles } from 'lucide-react';

const optionBase =
  'relative flex cursor-pointer flex-col items-start gap-[0.45rem] rounded-2xl border-2 p-5 text-left transition-all duration-[250ms] ' +
  'hover:-translate-y-0.5 hover:border-plai hover:bg-white hover:shadow-[0_4px_20px_rgba(168,30,113,0.1)]';

export default function CourseCallout() {
  const [selected, setSelected] = useState<'academica' | 'privada' | null>(null);

  const optionClass = (key: 'academica' | 'privada') =>
    `${optionBase} ${selected === key ? 'border-plai bg-[rgba(168,30,113,0.04)]' : 'border-black/[0.08] bg-[#F4F6F9]'}`;

  return (
    <section className="bg-[#F4F6F9] py-20" id="agendar">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="relative flex flex-col items-center gap-8 overflow-hidden rounded-3xl border border-black/[0.08] bg-white p-8 shadow-[0_4px_32px_rgba(27,54,93,0.08)] before:absolute before:inset-y-0 before:left-0 before:w-[5px] before:rounded-[99px_0_0_99px] before:bg-[linear-gradient(180deg,var(--primary)_0%,#e91e8c_100%)] before:content-[''] md:flex-row md:gap-14 md:p-12">
          <div className="flex-1">
            <div className="mb-5 inline-flex items-center gap-[0.4rem] rounded-full bg-[rgba(168,30,113,0.08)] px-[0.85rem] py-[0.3rem] text-[0.75rem] font-bold uppercase tracking-[0.05em] text-plai">
              <Sparkles size={13} />
              Próximos cursos disponibles
            </div>
            <h2 className="mb-4 text-[2.1rem] font-black leading-[1.15] tracking-[-0.03em] text-navy">
              ¿Te gustaría agendar<br />
              <span className="text-plai">un curso?</span>
            </h2>
            <p className="max-w-[380px] text-[0.97rem] leading-[1.7] text-plai-gray">
              Reserva sesiones de capacitación con nuestros expertos y lleva a tu equipo
              al siguiente nivel tecnológico.
            </p>
          </div>

          <div className="flex flex-1 flex-col gap-5">
            <p className="text-[0.9rem] font-semibold text-navy">Selecciona el tipo de institución:</p>
            <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2">
              <button id="opt-academica" className={optionClass('academica')} onClick={() => setSelected('academica')}>
                <div className="mb-[0.15rem] flex rounded-[10px] bg-[rgba(168,30,113,0.08)] p-[0.55rem] text-plai"><GraduationCap size={26} /></div>
                <span className="text-[0.93rem] font-bold leading-[1.2] text-navy">Institución Académica</span>
                <span className="text-[0.76rem] leading-[1.4] text-plai-gray">Universidades, escuelas y centros educativos</span>
                {selected === 'academica' && <div className="absolute right-[0.7rem] top-[0.7rem] flex size-5 animate-pop-in items-center justify-center rounded-full bg-plai text-[0.65rem] font-extrabold text-white">✓</div>}
              </button>

              <button id="opt-privada" className={optionClass('privada')} onClick={() => setSelected('privada')}>
                <div className="mb-[0.15rem] flex rounded-[10px] bg-[rgba(168,30,113,0.08)] p-[0.55rem] text-plai"><Building2 size={26} /></div>
                <span className="text-[0.93rem] font-bold leading-[1.2] text-navy">Empresa Privada</span>
                <span className="text-[0.76rem] leading-[1.4] text-plai-gray">Corporativos, startups y organizaciones</span>
                {selected === 'privada' && <div className="absolute right-[0.7rem] top-[0.7rem] flex size-5 animate-pop-in items-center justify-center rounded-full bg-plai text-[0.65rem] font-extrabold text-white">✓</div>}
              </button>
            </div>

            <Link
              href={selected ? `/agendar-curso/${selected}` : '#'}
              id="btn-agendar"
              className={`inline-flex items-center gap-[0.6rem] self-start rounded-full bg-plai px-8 py-[0.85rem] text-[0.97rem] font-bold text-white transition-all duration-[250ms] ${
                selected
                  ? 'hover:-translate-y-0.5 hover:bg-navy hover:shadow-[0_8px_24px_rgba(27,54,93,0.25)]'
                  : 'cursor-not-allowed opacity-40'
              }`}
              onClick={e => { if (!selected) e.preventDefault(); }}
            >
              Agendar mi curso <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
