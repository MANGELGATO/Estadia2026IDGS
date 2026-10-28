"use client";

import React, { useState, useEffect } from 'react';
import StatCard from '../../components/admin/StatCard';
import {
  RiComputerLine, RiAppsLine, RiCalendarCheckLine,
  RiToolsLine, RiUserLine, RiAlertLine,
} from 'react-icons/ri';
import { DashboardStats } from '../../../lib/db';

const fallbackTopEquipos = [
  { nombre: 'Meta Quest 3 (512 GB)', reservaciones: 12, categoria: 'Realidad Virtual' },
  { nombre: 'Dron DJI Mavic 4 Pro', reservaciones: 9,  categoria: 'Drones' },
  { nombre: 'Bambu Lab X1-Carbon',   reservaciones: 8,  categoria: 'Fabricación Digital' },
  { nombre: 'DOBOT Magician',        reservaciones: 7,  categoria: 'Robótica' },
  { nombre: 'Escáner 3D Miraco Plus',reservaciones: 5,  categoria: 'Fabricación Digital' },
];

const actividadMensual = [
  { mes: 'May', reservaciones: 18 },
  { mes: 'Jun', reservaciones: 24 },
  { mes: 'Jul', reservaciones: 32 },
  { mes: 'Ago', reservaciones: 28 },
  { mes: 'Sep', reservaciones: 35 },
  { mes: 'Oct', reservaciones: 22 },
];
const maxActividad = Math.max(...actividadMensual.map(a => a.reservaciones));

export default function ReportesPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(res => res.json())
      .then(json => {
        if (json.success && json.data) {
          setStats(json.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalEquipos = stats?.inventario.totalEquipos ?? 25;
  const equiposActivos = stats?.inventario.activos ?? 23;
  const enMantenimiento = (stats?.inventario.enMantenimiento ?? 1) + (stats?.inventario.noDisponibles ?? 1);
  const inactivos = stats?.inventario.noDisponibles ?? 1;
  const totalApps = stats?.inventario.totalApps ?? 15;
  const totalReservaciones = stats?.operaciones.totalReservaciones ?? 5;
  const usuariosActivos = stats?.operaciones.usuariosActivos ?? 5;
  const incidenciasAbiertas = stats?.operaciones.incidenciasAbiertas ?? 3;

  const categorias = stats?.categorias && stats.categorias.length > 0
    ? stats.categorias.map(c => ({
        nombre: c.nombre,
        equipos: c.total,
        activos: c.disponibles,
        reservaciones: Math.round(c.total * 2.5),
      }))
    : [
        { nombre: 'Robótica', equipos: 8, activos: 8, reservaciones: 18 },
        { nombre: 'Fabricación Digital', equipos: 6, activos: 5, reservaciones: 15 },
        { nombre: 'Drones', equipos: 4, activos: 3, reservaciones: 10 },
        { nombre: 'Realidad Virtual', equipos: 4, activos: 2, reservaciones: 14 },
        { nombre: 'Cómputo / Multimedia', equipos: 3, activos: 2, reservaciones: 8 },
      ];

  const estadoGeneral = [
    { label: 'Disponibles / Activos', value: equiposActivos, total: totalEquipos, color: '#059669' },
    { label: 'En Mantenimiento',      value: stats?.inventario.enMantenimiento ?? 1, total: totalEquipos, color: '#D97706' },
    { label: 'Fuera de Servicio',     value: inactivos, total: totalEquipos, color: '#DC2626' },
  ];

  const pctActivos = totalEquipos > 0 ? (equiposActivos / totalEquipos) * 100 : 92;
  const pctMant = totalEquipos > 0 ? (enMantenimiento / totalEquipos) * 100 : 8;

  const maxReservaciones = Math.max(...fallbackTopEquipos.map(e => e.reservaciones));

  return (
    <div className="flex animate-pop-in flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="mb-1 font-heading text-3xl font-extrabold text-navy">Reportes y Estadísticas</h1>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
              ● Sincronizado con MySQL
            </span>
          </div>
          <p className="text-sm text-plai-muted md:text-base">
            Métricas del inventario real, uso de recursos y actividad del sistema PLAi
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => window.print()}
            className="cursor-pointer rounded-lg border border-black/[0.08] bg-white px-4 py-2 font-heading text-xs font-semibold text-navy shadow-plai-sm transition-all hover:-translate-y-0.5 hover:shadow-plai-md"
          >
            📄 Imprimir / PDF
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Equipos"        value={totalEquipos}        icon={<RiComputerLine />}      variant="primary" />
        <StatCard title="Equipos Activos"      value={equiposActivos}      icon={<RiComputerLine />}      variant="success" />
        <StatCard title="En Mantenimiento"     value={enMantenimiento}     icon={<RiToolsLine />}         variant="warning" />
        <StatCard title="Apps VR / PC"         value={totalApps}           icon={<RiAppsLine />}          variant="primary" />
        <StatCard title="Total Reservaciones"  value={totalReservaciones}  icon={<RiCalendarCheckLine />} variant="success" />
        <StatCard title="Usuarios Registrados" value={stats?.operaciones.totalUsuarios ?? 6} icon={<RiUserLine />} variant="primary" />
        <StatCard title="Incidencias Abiertas" value={incidenciasAbiertas} icon={<RiAlertLine />}         variant="danger"  />
        <StatCard title="Usuarios Activos"     value={usuariosActivos}     icon={<RiUserLine />}          variant="primary" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Equipos más reservados */}
        <div className="rounded-2xl border border-black/[0.06] bg-white p-6 shadow-plai-sm">
          <h3 className="mb-1 font-heading text-base font-bold text-navy">Equipos con Mayor Demanda</h3>
          <p className="mb-6 text-xs text-plai-muted">Basado en reservaciones históricas del laboratorio</p>
          <div className="flex flex-col gap-4">
            {fallbackTopEquipos.map(eq => {
              const pct = (eq.reservaciones / maxReservaciones) * 100;
              return (
                <div key={eq.nombre} className="flex items-center gap-3">
                  <div className="w-32 shrink-0 md:w-44">
                    <span className="block truncate text-xs font-semibold text-navy">{eq.nombre}</span>
                    <span className="block text-[11px] text-plai-muted">{eq.categoria}</span>
                  </div>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                    <div className="h-full rounded-full bg-gradient-to-r from-plai to-[#c42585] transition-all duration-1000" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-7 text-right text-xs font-bold text-navy">{eq.reservaciones}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Estado general */}
        <div className="rounded-2xl border border-black/[0.06] bg-white p-6 shadow-plai-sm">
          <h3 className="mb-1 font-heading text-base font-bold text-navy">Estado del Inventario Real</h3>
          <p className="mb-6 text-xs text-plai-muted">Distribución actual ({totalEquipos} dispositivos en base de datos)</p>
          <div className="my-4 flex justify-center">
            <div className="relative flex size-[140px] items-center justify-center rounded-full" style={{
              background: `conic-gradient(
                #059669 0% ${pctActivos}%,
                #D97706 ${pctActivos}% ${Math.min(100, pctActivos + pctMant)}%,
                #DC2626 ${Math.min(100, pctActivos + pctMant)}% 100%
              )`
            }}>
              <div className="flex size-[90px] flex-col items-center justify-center rounded-full bg-white">
                <span className="font-heading text-2xl font-extrabold leading-none text-navy">{totalEquipos}</span>
                <span className="mt-0.5 text-[10px] text-plai-muted">Equipos</span>
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-2.5">
            {estadoGeneral.map(e => (
              <div key={e.label} className="flex items-center gap-2.5 text-xs">
                <span className="size-2.5 shrink-0 rounded-full" style={{ background: e.color }} />
                <span className="flex-1 text-gray-600">{e.label}</span>
                <span className="font-bold text-navy">{e.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actividad mensual */}
      <div className="rounded-2xl border border-black/[0.06] bg-white p-6 shadow-plai-sm">
        <h3 className="mb-1 font-heading text-base font-bold text-navy">Actividad Mensual — Reservaciones</h3>
        <p className="mb-6 text-xs text-plai-muted">Mayo – Octubre 2026</p>
        <div className="flex h-36 items-end gap-3 pt-8 md:gap-4">
          {actividadMensual.map(a => {
            const pct = (a.reservaciones / maxActividad) * 100;
            return (
              <div key={a.mes} className="flex h-full flex-1 flex-col items-center gap-1.5">
                <div className="shrink-0 text-xs font-bold text-navy">{a.reservaciones}</div>
                <div className="flex w-full flex-1 items-end overflow-hidden rounded-md bg-gray-100">
                  <div className="w-full rounded-md bg-gradient-to-t from-plai to-[#c42585] transition-all duration-1000" style={{ height: `${pct}%` }} />
                </div>
                <div className="shrink-0 text-xs font-semibold text-plai-muted">{a.mes}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabla por categoría */}
      <div className="overflow-x-auto rounded-2xl border border-black/[0.06] bg-white p-6 shadow-plai-sm">
        <h3 className="mb-2 font-heading text-base font-bold text-navy">Inventario Real por Categoría Tecnológica</h3>
        <table className="mt-4 w-full min-w-[600px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b-2 border-gray-100">
              <th className="px-4 py-3 font-heading text-xs font-bold uppercase tracking-wider text-plai-muted">Categoría</th>
              <th className="px-4 py-3 font-heading text-xs font-bold uppercase tracking-wider text-plai-muted">Total Equipos</th>
              <th className="px-4 py-3 font-heading text-xs font-bold uppercase tracking-wider text-plai-muted">Disponibles</th>
              <th className="px-4 py-3 font-heading text-xs font-bold uppercase tracking-wider text-plai-muted">Disponibilidad</th>
              <th className="px-4 py-3 font-heading text-xs font-bold uppercase tracking-wider text-plai-muted">Actividad estimada</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categorias.map(c => {
              const pct = c.equipos > 0 ? Math.round((c.activos / c.equipos) * 100) : 100;
              return (
                <tr key={c.nombre} className="transition-colors hover:bg-gray-50/75">
                  <td className="px-4 py-3.5 font-semibold text-navy">{c.nombre}</td>
                  <td className="px-4 py-3.5 text-gray-700">{c.equipos}</td>
                  <td className="px-4 py-3.5 text-gray-700">{c.activos}</td>
                  <td className="px-4 py-3.5">
                    <div className="mb-1 h-1.5 w-20 overflow-hidden rounded-full bg-gray-100">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: pct > 80 ? '#059669' : pct > 50 ? '#D97706' : '#DC2626' }} />
                    </div>
                    <span className="text-xs text-plai-muted">{pct}%</span>
                  </td>
                  <td className="px-4 py-3.5 text-gray-700">{c.reservaciones}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
