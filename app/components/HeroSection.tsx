'use client';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const stats = [
  { value: '61', label: 'Cursos disponibles' },
  { value: '39.6K', label: 'Estudiantes inscritos' },
  { value: '95%', label: 'Tasa de satisfacción' },
  { value: '100', label: 'Aliados(as) educativos' },
];

export default function HeroSection() {
  return (
    <section
      className="relative flex min-h-[520px] flex-col justify-end bg-navy-deep bg-cover bg-center bg-[url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1600&q=80')]"
    >
      {/* Background overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[rgba(22,46,80,0.88)] from-0% via-[rgba(22,46,80,0.6)] via-55% to-[rgba(22,46,80,0.25)] to-100%" />

      <div className="relative z-[1] flex flex-1 items-center pt-16 pb-8">
        <div className="mx-auto w-full max-w-[640px] px-6 min-[1200px]:ml-[max(1.5rem,calc((100vw-1200px)/2))]">
          <h1 className="mb-5 text-[clamp(2rem,5vw,3.25rem)] font-black leading-[1.1] tracking-[-0.03em] text-white">
            Formación para la{' '}
            <span className="block text-plai">era digital</span>
          </h1>
          <p className="mb-8 max-w-[480px] text-[1.05rem] leading-[1.7] text-white/80">
            Desarrolla las habilidades que necesitas para destacar en el mundo tecnológico.
            Cursos virtuales y presenciales adaptados a la demanda del mercado laboral actual.
          </p>
          <Link
            href="#dispositivos"
            id="hero-explorar"
            className="inline-flex items-center gap-[0.6rem] rounded-full bg-plai px-8 py-[0.85rem] text-base font-bold text-white transition-all duration-[250ms] hover:gap-[0.9rem] hover:bg-[#8b145d]"
          >
            Explorar cursos <ArrowRight size={18} />
          </Link>
        </div>
      </div>

      {/* Stats bar */}
      <div className="relative z-[1] grid grid-cols-2 border-t border-white/10 bg-[rgba(22,46,80,0.75)] backdrop-blur-[10px] min-[640px]:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col items-center gap-[0.4rem] border-r border-white/10 px-4 py-6 last:border-r-0">
            <span className="text-[2rem] font-black tracking-[-0.03em] text-white">{s.value}</span>
            <span className="text-center text-[0.8rem] font-medium text-white/65">{s.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
