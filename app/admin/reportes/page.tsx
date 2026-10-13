"use client";

import React from 'react';
import StatCard from '../../components/admin/StatCard';
import {
  RiComputerLine, RiAppsLine, RiCalendarCheckLine,
  RiToolsLine, RiUserLine, RiAlertLine,
} from 'react-icons/ri';

const categorias = [
  { nombre: 'Realidad Virtual', equipos: 15, activos: 13, reservaciones: 42 },
  { nombre: 'Robótica',         equipos: 8,  activos: 6,  reservaciones: 18 },
  { nombre: 'Fabricación 3D',   equipos: 6,  activos: 5,  reservaciones: 31 },
  { nombre: 'Drones',           equipos: 4,  activos: 3,  reservaciones: 10 },
  { nombre: 'Cómputo',          equipos: 30, activos: 28, reservaciones: 65 },
  { nombre: 'Escaneo 3D',       equipos: 3,  activos: 2,  reservaciones: 9  },
];

const topEquipos = [
  { nombre: 'Meta Quest 3',         reservaciones: 28, categoria: 'Realidad Virtual' },
  { nombre: 'Laptop Dell XPS',      reservaciones: 24, categoria: 'Cómputo' },
  { nombre: 'Impresora 3D Ender 3', reservaciones: 19, categoria: 'Fabricación 3D' },
  { nombre: 'Brazo Robótico Dobot', reservaciones: 14, categoria: 'Robótica' },
  { nombre: 'Drone DJI Mini 3',     reservaciones: 10, categoria: 'Drones' },
];

const maxReservaciones = Math.max(...topEquipos.map(e => e.reservaciones));

const estadoGeneral = [
  { label: 'Activos',            value: 57, total: 66, color: '#059669' },
  { label: 'En Mantenimiento',   value: 6,  total: 66, color: '#D97706' },
  { label: 'Inactivos',          value: 3,  total: 66, color: '#DC2626' },
];

const actividadMensual = [
  { mes: 'Abr', reservaciones: 32 },
  { mes: 'May', reservaciones: 48 },
  { mes: 'Jun', reservaciones: 41 },
  { mes: 'Jul', reservaciones: 55 },
  { mes: 'Ago', reservaciones: 62 },
  { mes: 'Sep', reservaciones: 47 },
];
const maxActividad = Math.max(...actividadMensual.map(a => a.reservaciones));

export default function ReportesPage() {
  return (
    <div className="flex animate-pop-in flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="mb-1 font-heading text-3xl font-extrabold text-navy">Reportes y Estadísticas</h1>
          <p className="text-sm text-plai-muted md:text-base">Métricas del inventario, uso de recursos y actividad del sistema</p>
        </div>
        <div className="flex gap-3">
          <button className="cursor-pointer rounded-lg border border-black/[0.08] bg-white px-4 py-2 font-heading text-xs font-semibold text-navy shadow-plai-sm transition-all hover:-translate-y-0.5 hover:shadow-plai-md">📄 Exportar PDF</button>
          <button className="cursor-pointer rounded-lg border border-black/[0.08] bg-white px-4 py-2 font-heading text-xs font-semibold text-navy shadow-plai-sm transition-all hover:-translate-y-0.5 hover:shadow-plai-md">📊 Exportar Excel</button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Equipos"      value={66}  icon={<RiComputerLine />}       variant="primary" />
        <StatCard title="Equipos Activos"    value={57}  icon={<RiComputerLine />}       variant="success" />
        <StatCard title="En Mantenimiento"   value={6}   icon={<RiToolsLine />}          variant="warning" />
        <StatCard title="Apps VR / PC"     value={15}  icon={<RiAppsLine />}           variant="primary" />
        <StatCard title="Reservaciones"      value={175} icon={<RiCalendarCheckLine />}  variant="success" />
        <StatCard title="Usuarios Activos"   value={24}  icon={<RiUserLine />}           variant="primary" />
        <StatCard title="Incidencias Abiertas" value={3} icon={<RiAlertLine />}          variant="danger"  />
        <StatCard title="Alertas Pendientes" value={5}   icon={<RiAlertLine />}          variant="warning" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Equipos más reservados */}
        <div className="rounded-2xl border border-black/[0.06] bg-white p-6 shadow-plai-sm">
          <h3 className="mb-1 font-heading text-base font-bold text-navy">Equipos más Reservados</h3>
          <p className="mb-6 text-xs text-plai-muted">Últimos 6 meses</p>
          <div className="flex flex-col gap-4">
            {topEquipos.map(eq => {
              const pct = (eq.reservaciones / maxReservaciones) * 100;
              return (
                <div key={eq.nombre} className="flex items-center gap-3">
                  <div className="w-32 shrink-0 md:w-40">
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
          <h3 className="mb-1 font-heading text-base font-bold text-navy">Estado del Inventario</h3>
          <p className="mb-6 text-xs text-plai-muted">Distribución actual (66 equipos)</p>
          <div className="my-4 flex justify-center">
            <div className="relative flex size-[140px] items-center justify-center rounded-full" style={{
              background: `conic-gradient(
                #059669 0% ${(57/66)*100}%,
                #D97706 ${(57/66)*100}% ${((57+6)/66)*100}%,
                #DC2626 ${((57+6)/66)*100}% 100%
              )`
            }}>
              <div className="flex size-[90px] flex-col items-center justify-center rounded-full bg-white">
                <span className="font-heading text-2xl font-extrabold leading-none text-navy">66</span>
                <span className="mt-0.5 text-[10px] text-plai-muted">Total</span>
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
        <p className="mb-6 text-xs text-plai-muted">Abril – Septiembre 2026</p>
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
        <h3 className="mb-2 font-heading text-base font-bold text-navy">Inventario por Categoría</h3>
        <table className="mt-4 w-full min-w-[600px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b-2 border-gray-100">
              <th className="px-4 py-3 font-heading text-xs font-bold uppercase tracking-wider text-plai-muted">Categoría</th>
              <th className="px-4 py-3 font-heading text-xs font-bold uppercase tracking-wider text-plai-muted">Total Equipos</th>
              <th className="px-4 py-3 font-heading text-xs font-bold uppercase tracking-wider text-plai-muted">Activos</th>
              <th className="px-4 py-3 font-heading text-xs font-bold uppercase tracking-wider text-plai-muted">Disponibilidad</th>
              <th className="px-4 py-3 font-heading text-xs font-bold uppercase tracking-wider text-plai-muted">Reservaciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categorias.map(c => {
              const pct = Math.round((c.activos / c.equipos) * 100);
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
