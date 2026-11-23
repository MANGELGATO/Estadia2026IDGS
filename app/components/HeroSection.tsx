'use client';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function HeroSection() {
  return (
    <section
      className="relative flex min-h-[480px] flex-col justify-center bg-navy-deep bg-cover bg-center bg-[url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1600&q=80')]"
    >
      {/* Background overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[rgba(22,46,80,0.9)] from-0% via-[rgba(22,46,80,0.65)] via-55% to-[rgba(22,46,80,0.28)] to-100%" />

      <div className="relative z-[1] flex flex-1 items-center py-20">
        <div className="mx-auto w-full max-w-[660px] px-6 min-[1200px]:ml-[max(1.5rem,calc((100vw-1200px)/2))]">
          <h1 className="mb-5 text-[clamp(2rem,5vw,3.25rem)] font-black leading-[1.1] tracking-[-0.03em] text-white">
            Soluciones tecnológicas{' '}
            <span className="block text-plai">para innovar</span>
          </h1>
          <p className="mb-8 max-w-[520px] text-[1.05rem] leading-[1.7] text-white/85">
            Accede a equipamiento de vanguardia, aplicaciones inmersivas y espacios especializados en PLAi.
            Solicita préstamos de laboratorio, fabricación digital y soporte tecnológico para impulsar tus proyectos.
          </p>
          <Link
            href="#equipos"
            id="hero-explorar"
            className="inline-flex items-center gap-[0.6rem] rounded-full bg-[#ed8d1b] px-8 py-[0.85rem] text-base font-bold text-white shadow-md transition-all duration-[250ms] hover:gap-[0.9rem] hover:bg-[#d67a10]"
          >
            Explorar recursos y soluciones <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}
