'use client';

import Link from 'next/link';
import { mockApps } from '../../lib/mockData';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';

const platformIcon: Record<string, string> = {
  'Meta Quest': '🥽',
  'PC': '💻',
  'Meta Quest + PC': '🎮',
};

const categoryColors: Record<string, { color: string; bg: string }> = {
  'Juego Educativo':     { color: '#059669', bg: 'rgba(16,185,129,0.1)' },
  'Experiencia VR':      { color: '#4F46E5', bg: 'rgba(99,102,241,0.1)' },
  'Simulación':          { color: '#D97706', bg: 'rgba(245,158,11,0.1)' },
  'Juego Interactivo':   { color: '#a81e71', bg: 'rgba(168,30,113,0.1)' },
  'Arte y Creatividad':  { color: '#DB2777', bg: 'rgba(236,72,153,0.1)' },
  'Ciencia y Naturaleza':{ color: '#0891B2', bg: 'rgba(6,182,212,0.1)'  },
  'Deportes VR':         { color: '#65A30D', bg: 'rgba(132,204,22,0.1)' },
};

const ALL_PLATFORMS = ['Todas', 'Meta Quest', 'PC', 'Meta Quest + PC'];

export default function AplicacionesPage() {
  const [filterPlatform, setFilterPlatform] = useState('Todas');

  const filtered = filterPlatform === 'Todas'
    ? mockApps
    : mockApps.filter(a => a.platform === filterPlatform || a.platform.includes(filterPlatform));

  return (
    <div>
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-navy to-[#592663] pb-[4.5rem] pt-16 text-white after:absolute after:-bottom-px after:inset-x-0 after:h-10 after:bg-[#F4F6F9] after:[clip-path:ellipse(55%_100%_at_50%_100%)]">
        <div className="mx-auto max-w-[1200px] px-6">
          <Link href="/" className="mb-6 inline-flex items-center gap-[0.4rem] font-heading text-[0.9rem] font-semibold text-white/80 transition-colors hover:text-white">
            <ArrowLeft size={18} /> Volver al inicio
          </Link>
          <h1 className="mb-3 font-heading text-4xl font-black leading-none tracking-[-0.04em] sm:text-5xl">Catálogo de Aplicaciones</h1>
          <p className="mb-8 max-w-[560px] text-[1.05rem] leading-[1.7] opacity-90">
            Juegos educativos e inmersivos para Meta Quest VR y PC disponibles en PLAi.
            Experiencias interactivas pensadas para niños y jóvenes.
          </p>
          <div className="flex flex-wrap gap-6">
            <span className="rounded-full border border-white/20 bg-white/[0.12] px-4 py-[0.4rem] font-heading text-[0.9rem] font-semibold">
              🥽 {mockApps.filter(a => a.platform.includes('Meta Quest')).length} apps para Meta Quest
            </span>
            <span className="rounded-full border border-white/20 bg-white/[0.12] px-4 py-[0.4rem] font-heading text-[0.9rem] font-semibold">
              💻 {mockApps.filter(a => a.platform.includes('PC')).length} apps para PC
            </span>
            <span className="rounded-full border border-white/20 bg-white/[0.12] px-4 py-[0.4rem] font-heading text-[0.9rem] font-semibold">
              🎓 {mockApps.filter(a => a.category === 'Juego Educativo' || a.category === 'Ciencia y Naturaleza').length} educativas
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-[#F4F6F9] pb-20 pt-12">
        <div className="mx-auto max-w-[1200px] px-6">

          {/* Platform Filters */}
          <div className="mb-8 flex flex-wrap items-center gap-2">
            {ALL_PLATFORMS.map(p => (
              <button
                key={p}
                className={`whitespace-nowrap rounded-full border px-4 py-[0.45rem] font-heading text-[0.82rem] font-semibold transition-all duration-200 ${
                  filterPlatform === p
                    ? 'border-plai bg-plai text-white shadow-[0_2px_8px_rgba(168,30,113,0.25)]'
                    : 'border-black/[0.08] bg-white text-plai-gray hover:border-plai hover:text-plai'
                }`}
                onClick={() => setFilterPlatform(p)}
              >
                {p === 'Meta Quest' ? '🥽 ' : p === 'PC' ? '💻 ' : p === 'Meta Quest + PC' ? '🎮 ' : ''}
                {p}
              </button>
            ))}
            <span className="ml-auto font-heading text-[0.8rem] font-semibold text-plai-muted">{filtered.length} aplicaciones</span>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 gap-5 min-[600px]:grid-cols-2 min-[900px]:grid-cols-3">
            {filtered.map(app => {
              const catStyle = categoryColors[app.category] || { color: '#6B7280', bg: 'rgba(107,114,128,0.1)' };
              return (
                <div key={app.id} className="flex items-start gap-4 rounded-2xl border border-black/[0.08] bg-white p-5 transition-all duration-200 hover:-translate-y-1 hover:border-[rgba(168,30,113,0.25)] hover:shadow-[0_12px_32px_rgba(27,54,93,0.07)]">
                  <div className="flex size-[50px] shrink-0 items-center justify-center rounded-xl bg-[#F4F6F9] text-[1.75rem]">{app.iconUrl}</div>
                  <div className="flex min-w-0 flex-1 flex-col gap-[0.3rem]">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span
                        className="rounded-full px-[0.55rem] py-[0.15rem] font-heading text-[0.65rem] font-extrabold uppercase tracking-[0.06em]"
                        style={{ color: catStyle.color, background: catStyle.bg }}
                      >
                        {app.category}
                      </span>
                      <span className="whitespace-nowrap font-heading text-[0.65rem] font-semibold text-plai-muted">
                        {platformIcon[app.platform]} {app.platform}
                      </span>
                    </div>
                    <h3 className="font-heading text-base font-extrabold leading-[1.2] text-navy">{app.name}</h3>
                    <p className="m-0 text-[0.75rem] text-plai-muted">{app.developer}</p>
                    <p className="text-[0.82rem] leading-[1.5] text-plai-gray">{app.description}</p>
                    <div className="mt-2">
                      <span className="inline-block rounded-full border border-black/[0.08] bg-[#F4F6F9] px-[0.65rem] py-[0.15rem] text-[0.7rem] font-semibold text-plai-muted">👤 {app.ageRating}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
