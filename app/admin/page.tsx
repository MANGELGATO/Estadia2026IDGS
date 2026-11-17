"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StatCard from '../components/admin/StatCard';
import {
  RiComputerLine, RiAlertLine, RiAppsLine, RiCheckDoubleLine,
  RiCalendarCheckLine, RiTimeLine, RiToolsLine, RiHistoryLine,
  RiAddLine, RiArrowRightLine, RiFileList3Line, RiShieldCheckLine
} from 'react-icons/ri';
import type { DeviceItem, AppItem } from '../../lib/mockData';
import type { ReservacionItem, IncidenciaItem, BitacoraItem } from '../../lib/db';

export default function AdminDashboard() {
  const router = useRouter();

  const [equipos, setEquipos] = useState<DeviceItem[]>([]);
  const [apps, setApps] = useState<AppItem[]>([]);
  const [reservaciones, setReservaciones] = useState<ReservacionItem[]>([]);
  const [incidencias, setIncidencias] = useState<IncidenciaItem[]>([]);
  const [bitacora, setBitacora] = useState<BitacoraItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/equipos').then(r => r.json()).catch(() => ({ data: [] })),
      fetch('/api/aplicaciones').then(r => r.json()).catch(() => ({ data: [] })),
      fetch('/api/reservaciones').then(r => r.json()).catch(() => ({ data: [] })),
      fetch('/api/mantenimiento').then(r => r.json()).catch(() => ({ data: [] })),
      fetch('/api/bitacora').then(r => r.json()).catch(() => ({ data: [] })),
    ]).then(([eqRes, appRes, resRes, incRes, bitRes]) => {
      if (eqRes.data) setEquipos(eqRes.data);
      if (appRes.data) setApps(appRes.data);
      if (resRes.data) setReservaciones(resRes.data);
      if (incRes.data) setIncidencias(incRes.data);
      if (bitRes.data) setBitacora(bitRes.data);
      setIsLoading(false);
    });
  }, []);

  const totalEquipos = equipos.length;
  const equiposDisponibles = equipos.filter(e => e.status === 'Disponible').length;
  const equiposMantenimiento = equipos.filter(e => e.status === 'En mantenimiento').length;
  const totalApps = apps.length;
  const totalReservas = reservaciones.length;
  const reservasPendientes = reservaciones.filter(r => r.estado === 'Pendiente').length;
  const prestamosActivos = bitacora.filter(b => b.estadoPrestamo === 'Activo').length;
  const incidenciasAbiertas = incidencias.filter(i => i.estado !== 'Resuelta').length;

  const pendingList = reservaciones.filter(r => r.estado === 'Pendiente').slice(0, 4);
  const recentEquiposList = equipos.slice(0, 4);

  return (
    <div className="flex animate-pop-in flex-col gap-8 pb-12">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="mb-1 font-heading text-3xl font-extrabold text-navy">
            Panel de Control General
          </h1>
          <p className="text-sm text-plai-muted md:text-base">
            Visión centralizada de recursos tecnológicos, bitácoras y reservaciones en Ciudad Creativa Digital
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => router.push('/admin/inventario')}
            className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#ed8d1b] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#d67a10]"
          >
            <RiAddLine size={16} />
            <span>Nuevo Equipo</span>
          </button>

          <button
            onClick={() => router.push('/admin/bitacora')}
            className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#ed8d1b] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#d67a10]"
          >
            <RiHistoryLine size={16} />
            <span>Bitácora de Uso</span>
          </button>

          <button
            onClick={() => router.push('/admin/reportes')}
            className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#ed8d1b] px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#d67a10]"
          >
            <RiFileList3Line size={16} />
            <span>Reportes</span>
          </button>
        </div>
      </div>

      {/* Stats Row 1 — Inventario Tecnológico (Todos los botones son interactivos y redirigen a su sección) */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-xs font-bold uppercase tracking-wider text-plai-muted">
            Inventario y Multimedia (Clic para gestionar)
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div 
            onClick={() => router.push('/admin/inventario')} 
            className="cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
            title="Ver catálogo completo de inventario"
          >
            <StatCard title="Total Equipos" value={isLoading ? '...' : totalEquipos} icon={<RiComputerLine />} variant="primary" />
          </div>

          <div 
            onClick={() => router.push('/admin/inventario')} 
            className="cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
            title="Ver equipos disponibles para préstamo"
          >
            <StatCard title="Equipos Disponibles" value={isLoading ? '...' : equiposDisponibles} icon={<RiCheckDoubleLine />} variant="success" />
          </div>

          <div 
            onClick={() => router.push('/admin/mantenimiento')} 
            className="cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
            title="Ir a mantenimiento e incidencias"
          >
            <StatCard title="En Mantenimiento" value={isLoading ? '...' : equiposMantenimiento} icon={<RiAlertLine />} variant="warning" />
          </div>

          <div 
            onClick={() => router.push('/admin/aplicaciones')} 
            className="cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
            title="Gestionar catálogo de aplicaciones VR y PC"
          >
            <StatCard title="Apps VR / PC" value={isLoading ? '...' : totalApps} icon={<RiAppsLine />} variant="primary" />
          </div>
        </div>
      </div>

      {/* Stats Row 2 — Operaciones y Bitácora (Interactivos) */}
      <div className="flex flex-col gap-3">
        <h2 className="font-heading text-xs font-bold uppercase tracking-wider text-plai-muted">
          Operaciones y Préstamos Activos (Clic para gestionar)
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div 
            onClick={() => router.push('/admin/reservaciones')} 
            className="cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
            title="Ver todas las reservaciones"
          >
            <StatCard title="Total Reservas" value={isLoading ? '...' : totalReservas} icon={<RiCalendarCheckLine />} variant="primary" />
          </div>

          <div 
            onClick={() => router.push('/admin/reservaciones')} 
            className="cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
            title="Revisar y aprobar reservaciones pendientes"
          >
            <StatCard title="Pendientes Aprobar" value={isLoading ? '...' : reservasPendientes} icon={<RiTimeLine />} variant="warning" />
          </div>

          <div 
            onClick={() => router.push('/admin/bitacora')} 
            className="cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
            title="Ver bitácora de préstamos activos"
          >
            <StatCard title="Préstamos Activos" value={isLoading ? '...' : prestamosActivos} icon={<RiHistoryLine />} variant="success" />
          </div>

          <div 
            onClick={() => router.push('/admin/mantenimiento')} 
            className="cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
            title="Revisar incidencias abiertas de laboratorio"
          >
            <StatCard title="Incidencias Abiertas" value={isLoading ? '...' : incidenciasAbiertas} icon={<RiToolsLine />} variant="danger" />
          </div>
        </div>
      </div>

      {/* 2 Column Layout: Equipos Recientes y Reservaciones Pendientes */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Equipos Recientes */}
        <div className="rounded-2xl border border-black/[0.06] bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-heading text-base font-bold text-navy">
              Equipos de Inventario
            </h3>
            <button
              onClick={() => router.push('/admin/inventario')}
              className="flex items-center gap-1 text-xs font-bold text-plai hover:underline cursor-pointer"
            >
              <span>Ver todos ({totalEquipos})</span>
              <RiArrowRightLine />
            </button>
          </div>

          <div className="flex flex-col divide-y divide-gray-100">
            {recentEquiposList.map((eq) => (
              <div
                key={eq.id}
                onClick={() => router.push('/admin/inventario')}
                className="flex items-center justify-between py-3 cursor-pointer hover:bg-gray-50/80 px-2 rounded-lg transition"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{eq.imageEmoji || '📦'}</span>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">{eq.name}</h4>
                    <p className="text-xs text-plai-muted">{eq.inventoryNumber} • {eq.category}</p>
                  </div>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                  eq.status === 'Disponible'
                    ? 'bg-emerald-100 text-emerald-800'
                    : eq.status === 'En mantenimiento'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {eq.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Reservaciones Pendientes con botón interactivo de aprobación */}
        <div className="rounded-2xl border border-black/[0.06] bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-heading text-base font-bold text-navy">
              Reservaciones por Atender
            </h3>
            <button
              onClick={() => router.push('/admin/reservaciones')}
              className="flex items-center gap-1 text-xs font-bold text-plai hover:underline cursor-pointer"
            >
              <span>Ver todas ({totalReservas})</span>
              <RiArrowRightLine />
            </button>
          </div>

          {pendingList.length === 0 ? (
            <div className="p-8 text-center text-xs text-plai-muted">
              No hay reservaciones pendientes de aprobación en este momento.
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-gray-100">
              {pendingList.map((res) => (
                <div
                  key={res.id}
                  className="flex items-center justify-between py-3"
                >
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">{res.usuarioNombre}</h4>
                    <p className="text-xs text-plai-muted">
                      {res.fechaUso} • {res.horaInicio} - {res.horaFin} • Categ: {res.categoriaId}
                    </p>
                  </div>

                  <button
                    onClick={() => router.push('/admin/reservaciones')}
                    className="flex cursor-pointer items-center gap-1 rounded-lg bg-[#ed8d1b] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[#d67a10] shadow-sm"
                  >
                    <RiShieldCheckLine size={14} />
                    <span>Revisar y Asignar</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
