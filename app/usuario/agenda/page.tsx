"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  RiCalendarCheckLine, 
  RiTimeLine, 
  RiMapPinLine, 
  RiGroupLine, 
  RiAddCircleLine,
  RiCloseLine,
  RiArrowRightLine
} from 'react-icons/ri';
import type { CursoAgendaItem } from '../../../lib/db';

export default function AgendaPage() {
  const [selectedCurso, setSelectedCurso] = useState<CursoAgendaItem | null>(null);
  const [cursos, setCursos] = useState<CursoAgendaItem[]>([]);

  useEffect(() => {
    fetch('/api/cursos')
      .then(res => res.json())
      .then(json => {
        if (json.success && Array.isArray(json.data)) {
          setCursos(json.data);
        }
      })
      .catch(err => console.error('Error cargando agenda:', err));
  }, []);

  return (
    <div className="flex animate-pop-in flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="mb-1 font-heading text-3xl font-extrabold text-navy">Mi Agenda y Talleres</h1>
          <p className="text-sm text-plai-muted md:text-base">
            Actividades, cursos y sesiones formativas programadas en PLAi
          </p>
        </div>
        <Link
          href="/#cursos"
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 font-heading text-xs font-bold text-white shadow-plai-sm transition-all hover:bg-accent-hover hover:-translate-y-0.5"
        >
          <RiAddCircleLine className="text-base" /> Agendar Nueva Sesión
        </Link>
      </div>

      {/* Timeline */}
      <div className="relative flex flex-col gap-6 before:absolute before:bottom-2 before:left-5 before:top-4 before:w-0.5 before:bg-gradient-to-b before:from-plai before:to-gray-200 before:content-['']">
        {cursos.map((curso) => (
          <div key={curso.id} className="relative flex gap-5 sm:gap-6">
            <div className="z-10 flex size-11 shrink-0 items-center justify-center rounded-2xl border-2 border-plai bg-white text-xl shadow-md">
              {curso.icon}
            </div>

            <div className="flex-1 rounded-2xl border border-black/[0.08] bg-white p-6 shadow-plai-sm transition-all duration-200 hover:border-plai/40 hover:shadow-plai-md">
              <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                <div>
                  <span className="font-mono text-xs font-bold text-plai">{curso.id}</span>
                  <h3 className="font-heading text-lg font-bold text-navy">{curso.titulo}</h3>
                  <span className="text-xs text-plai-muted">{curso.tipo}</span>
                </div>
                <span className="rounded-full bg-blue-50 px-3 py-1 font-heading text-xs font-bold text-blue-700">
                  {curso.fecha}
                </span>
              </div>
              
              <div className="grid grid-cols-1 gap-2 rounded-xl border border-black/[0.04] bg-[#F4F6F9] p-3 text-xs text-plai-gray sm:grid-cols-3">
                <div className="flex items-center gap-2 font-medium">
                  <RiTimeLine className="text-plai text-sm" /> {curso.hora}
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <RiMapPinLine className="text-accent text-sm" /> {curso.lugar}
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <RiGroupLine className="text-emerald-600 text-sm" /> {curso.asistentes} participantes
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
                <span className="text-xs text-gray-500">Instructor: <strong>{curso.instructor}</strong></span>
                <button 
                  onClick={() => setSelectedCurso(curso)}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-navy transition-all hover:border-plai hover:bg-plai hover:text-white"
                >
                  Ver Ficha <RiArrowRightLine />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Detalle Curso */}
      {selectedCurso && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-pop-in" onClick={() => setSelectedCurso(null)}>
          <div className="w-full max-w-[560px] rounded-2xl border border-black/[0.08] bg-white p-6 shadow-2xl md:p-8" onClick={e => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-heading text-lg font-bold text-navy">{selectedCurso.titulo}</h3>
                <span className="font-mono text-xs font-bold text-plai">{selectedCurso.id}</span>
              </div>
              <button onClick={() => setSelectedCurso(null)} className="text-gray-400 hover:text-gray-700">
                <RiCloseLine className="text-2xl" />
              </button>
            </div>

            <div className="my-4 flex flex-col gap-3 text-xs text-gray-700">
              <p className="leading-relaxed bg-blue-50/50 p-3.5 rounded-xl border border-blue-100 text-blue-950">
                {selectedCurso.descripcion}
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <span className="font-bold text-plai-muted uppercase text-[10px]">Fecha:</span>
                  <p className="font-semibold text-navy">{selectedCurso.fecha}</p>
                </div>
                <div>
                  <span className="font-bold text-plai-muted uppercase text-[10px]">Horario:</span>
                  <p className="font-semibold text-navy">{selectedCurso.hora}</p>
                </div>
                <div>
                  <span className="font-bold text-plai-muted uppercase text-[10px]">Ubicación:</span>
                  <p className="font-semibold text-navy">{selectedCurso.lugar}</p>
                </div>
                <div>
                  <span className="font-bold text-plai-muted uppercase text-[10px]">Cupo Registrado:</span>
                  <p className="font-semibold text-emerald-700">{selectedCurso.asistentes} asistentes</p>
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setSelectedCurso(null)}
                className="rounded-lg bg-[#1e5ca7] px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-navy"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
