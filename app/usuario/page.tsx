"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { 
  RiCalendarCheckLine, 
  RiMacbookLine, 
  RiTimeLine, 
  RiAddCircleLine, 
  RiArrowRightLine,
  RiCheckDoubleLine,
  RiShieldCheckLine,
  RiComputerLine
} from 'react-icons/ri';
import { ReservacionItem, CursoAgendaItem } from '../../lib/db';

export default function UserDashboard() {
  const { data: session } = useSession();
  const userName = session?.user?.name || "Usuario Institucional";

  const [reservaciones, setReservaciones] = useState<ReservacionItem[]>([]);
  const [cursos, setCursos] = useState<CursoAgendaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/reservaciones').then(r => r.json()).catch(() => ({ data: [] })),
      fetch('/api/cursos').then(r => r.json()).catch(() => ({ data: [] })),
    ])
      .then(([resJson, curJson]) => {
        if (resJson.data && Array.isArray(resJson.data)) {
          setReservaciones(resJson.data);
        }
        if (curJson.data && Array.isArray(curJson.data)) {
          setCursos(curJson.data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const totalActivas = reservaciones.filter(r => r.estado === 'Aprobada' || r.estado === 'En uso').length;
  const totalPendientes = reservaciones.filter(r => r.estado === 'Pendiente').length;
  const totalCompletadas = reservaciones.filter(r => r.estado === 'Completada').length;

  const recentList = reservaciones.slice(0, 4);

  return (
    <div className="flex animate-pop-in flex-col gap-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-plai via-[#1e5ca7] to-[#0b192c] p-8 text-white shadow-[0_12px_36px_rgba(0,134,255,0.22)] md:p-10">
        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              Portal de Innovación y Préstamo de Recursos
            </div>
            <h1 className="font-heading text-3xl font-black tracking-tight sm:text-4xl">
              ¡Hola, {userName}!
            </h1>
            <p className="mt-2 max-w-[620px] text-sm text-white/85 sm:text-base leading-relaxed">
              Bienvenido a tu portal institucional de PLAi. Administra tus solicitudes de equipo, revisa tus talleres y agenda recursos en Ciudad Creativa Digital.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/equipos"
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 font-heading text-xs font-bold text-white shadow-lg transition-all hover:bg-accent-hover hover:-translate-y-0.5"
            >
              <RiAddCircleLine className="text-base" /> Solicitar Préstamo
            </Link>
            <Link
              href="/equipos"
              className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/15 px-4 py-3 font-heading text-xs font-bold text-white backdrop-blur-sm transition-all hover:bg-white hover:text-[#1e5ca7]"
            >
              <RiComputerLine className="text-base" /> Ver Catálogo
            </Link>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="pointer-events-none absolute -right-16 -top-24 size-80 rounded-full bg-white/10 blur-3xl" />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/usuario/prestamos" className="no-underline">
          <div className="flex cursor-pointer items-center gap-4 rounded-2xl border border-black/[0.08] bg-white p-5 shadow-plai-sm transition-all duration-200 hover:-translate-y-1 hover:border-plai/40 hover:shadow-plai-md">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-2xl text-emerald-600">
              <RiCheckDoubleLine />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-plai-muted">Préstamos Aprobados</span>
              <p className="font-heading text-2xl font-black text-navy">{loading ? '...' : totalActivas}</p>
            </div>
          </div>
        </Link>

        <Link href="/usuario/prestamos" className="no-underline">
          <div className="flex cursor-pointer items-center gap-4 rounded-2xl border border-black/[0.08] bg-white p-5 shadow-plai-sm transition-all duration-200 hover:-translate-y-1 hover:border-amber-300 hover:shadow-plai-md">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-2xl text-amber-600">
              <RiTimeLine />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-plai-muted">En Revisión</span>
              <p className="font-heading text-2xl font-black text-navy">{loading ? '...' : totalPendientes}</p>
            </div>
          </div>
        </Link>

        <Link href="/usuario/agenda" className="no-underline">
          <div className="flex cursor-pointer items-center gap-4 rounded-2xl border border-black/[0.08] bg-white p-5 shadow-plai-sm transition-all duration-200 hover:-translate-y-1 hover:border-plai/40 hover:shadow-plai-md">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-2xl text-plai">
              <RiCalendarCheckLine />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-plai-muted">Cursos Agendados</span>
              <p className="font-heading text-2xl font-black text-navy">{loading ? '...' : cursos.length}</p>
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-4 rounded-2xl border border-black/[0.08] bg-white p-5 shadow-plai-sm">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-purple-50 text-2xl text-purple-600">
            <RiShieldCheckLine />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-plai-muted">Historial Total</span>
            <p className="font-heading text-2xl font-black text-navy">{loading ? '...' : reservaciones.length + totalCompletadas}</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Actividad Reciente & Lineamientos */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Recent Solicitudes Table */}
        <div className="rounded-2xl border border-black/[0.08] bg-white p-6 shadow-plai-sm lg:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-heading text-xl font-bold text-navy">Mis Solicitudes y Reservaciones</h2>
              <p className="text-xs text-plai-muted">Últimos movimientos registrados en el sistema</p>
            </div>
            <Link
              href="/usuario/prestamos"
              className="inline-flex items-center gap-1 text-xs font-bold text-plai hover:text-navy"
            >
              Ver todas <RiArrowRightLine />
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            {recentList.map((reserva) => {
              const statusColor = 
                reserva.estado === 'Aprobada' || reserva.estado === 'En uso' ? 'bg-emerald-100 text-emerald-800' :
                reserva.estado === 'Pendiente' ? 'bg-amber-100 text-amber-800' :
                reserva.estado === 'Completada' ? 'bg-gray-100 text-gray-700' :
                'bg-rose-100 text-rose-800';

              return (
                <div
                  key={reserva.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-gray-100 p-4 transition-all hover:bg-gray-50/80 hover:border-gray-200"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#F4F6F9] text-xl">
                      {reserva.categoriaId?.includes('virtual') ? '🥽' :
                       reserva.categoriaId?.includes('robot') ? '🤖' :
                       reserva.categoriaId?.includes('dron') ? '🚁' :
                       reserva.categoriaId?.includes('fabric') ? '🖨️' : '💻'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-heading text-sm font-bold text-navy">
                          {reserva.codigoPlaiAsignado ? `Equipo Cód: ${reserva.codigoPlaiAsignado}` : reserva.actividad}
                        </h4>
                        <span className="font-mono text-[10px] text-plai-muted">({reserva.folio})</span>
                      </div>
                      <p className="text-xs text-plai-muted">
                        Fecha: <span className="font-semibold text-gray-700">{reserva.fechaUso}</span> ({reserva.horaInicio} - {reserva.horaFin}) · Categoría: <span className="capitalize">{String(reserva.categoriaId || 'General').replace(/-/g, ' ')}</span>
                      </p>
                    </div>
                  </div>

                  <span className={`inline-block w-fit rounded-full px-3 py-1 text-xs font-bold whitespace-nowrap ${statusColor}`}>
                    {reserva.estado}
                  </span>
                </div>
              );
            })}

            {recentList.length === 0 && !loading && (
              <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center text-xs text-plai-muted">
                No tienes solicitudes registradas aún. ¡Solicita tu primer préstamo tecnológico hoy!
              </div>
            )}
          </div>
        </div>

        {/* Institutional Guidelines Card */}
        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-black/[0.08] bg-white p-6 shadow-plai-sm">
            <h3 className="mb-3 font-heading text-base font-bold text-navy flex items-center gap-2">
              <span className="text-plai">📋</span> Guía para Préstamos PLAi
            </h3>
            <ul className="flex flex-col gap-3 text-xs leading-relaxed text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">✓</span>
                <span><strong>Horarios de entrega:</strong> Lunes a Viernes de 9:00 AM a 5:00 PM en Ciudad Creativa Digital.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">✓</span>
                <span><strong>Requisitos:</strong> Presentar identificación institucional y firmar responsiva de entrega.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">✓</span>
                <span><strong>Devolución:</strong> Los equipos deben entregarse completos con cargadores y cables en buen estado.</span>
              </li>
            </ul>

            <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50/60 p-3.5 text-xs text-blue-900">
              ¿Tienes dudas o requieres asistencia técnica previa a tu taller? Escríbenos a <strong>plai.ayuda@plai.mx</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
