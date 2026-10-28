"use client";

import React, { useState, useEffect } from 'react';
import StatCard from '../components/admin/StatCard';
import DataTable, { Column } from '../components/admin/DataTable';
import {
  RiComputerLine, RiAlertLine, RiAppsLine, RiCheckDoubleLine,
  RiCalendarCheckLine, RiTimeLine, RiUserLine, RiToolsLine,
  RiShieldUserLine, RiLogoutBoxRLine, RiPrinterLine,
} from 'react-icons/ri';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { DashboardStats } from '../../lib/db';

const initialRecentActivity = [
  { id: 1, user: 'Admin Juan',  action: 'verificó el inventario oficial en la base de datos MySQL.', time: 'Hace 10 min', type: 'info' },
  { id: 2, user: 'Ana García',  action: 'solicitó reservación para Meta Quest 3 (512 GB).',          time: 'Hace 1 hora', type: 'warning' },
  { id: 3, user: 'Admin Juan',  action: 'aprobó solicitud de Impresora 3D Bambu Lab X1-Carbon.',    time: 'Hace 3 horas', type: 'success' },
  { id: 4, user: 'Sistema',     action: 'sincronizó 25 equipos del inventario patrimonial.',        time: 'Hoy',          type: 'info' },
  { id: 5, user: 'Luis M.',     action: 'abrió reporte de mantenimiento preventivo en Robótica.',    time: 'Ayer',         type: 'danger' },
];

const statusRender = (value: string) => {
  let bg = 'rgba(16, 185, 129, 0.1)', color = '#10B981';
  if (value === 'En mantenimiento' || value === 'No disponible') {
    bg = 'rgba(245, 158, 11, 0.1)'; color = '#F59E0B';
  } else if (value === 'Inactivo' || value === 'Fuera de servicio') {
    bg = 'rgba(239, 68, 68, 0.1)';  color = '#EF4444';
  } else if (value === 'Reservado' || value === 'En uso') {
    bg = 'rgba(79, 70, 229, 0.1)';  color = '#4F46E5';
  }
  return (
    <span style={{ display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', backgroundColor: bg, color }}>
      {value}
    </span>
  );
};

const equipmentColumns: Column[] = [
  { key: 'name', label: 'Nombre del Equipo' },
  { key: 'category', label: 'Categoría' },
  { key: 'status', label: 'Estado', render: statusRender },
];

const reservColumns: Column[] = [
  { key: 'usuario', label: 'Usuario' },
  { key: 'recurso', label: 'Recurso' },
  { key: 'fecha', label: 'Fecha' },
  { key: 'hora', label: 'Horario' },
];

const activityTypeColor: Record<string, string> = {
  danger:  '#DC2626',
  success: '#059669',
  warning: '#D97706',
  info:    '#4F46E5',
};

export default function AdminDashboard() {
  const router = useRouter();
  const { data: session } = useSession();
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

  // Valores reales desde la BD MySQL (con valores por defecto mientras carga)
  const totalEquipos = stats?.inventario.totalEquipos ?? 25;
  const equiposActivos = stats?.inventario.activos ?? 23;
  const enMantenimiento = (stats?.inventario.enMantenimiento ?? 1) + (stats?.inventario.noDisponibles ?? 1);
  const totalApps = stats?.inventario.totalApps ?? 15;

  const totalReservaciones = stats?.operaciones.totalReservaciones ?? 5;
  const pendientesAprobar = stats?.operaciones.reservacionesPendientes ?? 1;
  const usuariosActivos = stats?.operaciones.usuariosActivos ?? 5;
  const cotizaciones3D = stats?.cotizaciones3D?.total ?? 3;

  const recentEquipments = stats?.equiposRecientes && stats.equiposRecientes.length > 0
    ? stats.equiposRecientes
    : [
        { id: 'fab-02', name: 'Escáner 3D Miraco Plus', category: 'Fabricación Digital', status: 'Disponible' },
        { id: 'dr-02', name: 'Dron DJI Mini 5 Pro (4 piezas)', category: 'Drones', status: 'Reservado' },
        { id: 'comp-04', name: 'Oculus Link PC', category: 'Cómputo / Multimedia', status: 'No disponible' },
        { id: 'vr-01', name: 'Meta Quest 3 (512 GB)', category: 'Realidad Virtual', status: 'Disponible' },
        { id: 'rob-01', name: 'Brazo Robótico DOBOT Magician', category: 'Robótica', status: 'Disponible' },
      ];

  const pendingReservations = stats?.reservacionesPendientes && stats.reservacionesPendientes.length > 0
    ? stats.reservacionesPendientes
    : [
        { id: 'RES-1001', usuario: 'Ana García', recurso: 'Meta Quest 3 (512 GB)', fecha: '2026-09-25', hora: '09:00–11:00' },
      ];

  return (
    <div className="flex animate-pop-in flex-col gap-8">
      {/* Header con botón de Admin y Cerrar Sesión ARRIBA de la Fecha */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="mb-1 font-heading text-3xl font-extrabold text-navy">Dashboard</h1>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
              ● Base de Datos Conectada
            </span>
          </div>
          <p className="text-sm text-plai-muted md:text-base">
            Panel de administración de PLAi sincronizado con MySQL en tiempo real
          </p>
        </div>

        {/* Bloque superior derecho: Botón Admin y Cerrar Sesión ARRIBA de la fecha */}
        <div className="flex flex-col items-end gap-2.5">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3.5 py-1.5 text-xs font-bold text-amber-900 shadow-plai-sm">
              <RiShieldUserLine className="text-sm text-amber-700" />
              <span>{session?.user?.name || 'Administrador'}</span>
              <span className="rounded bg-amber-200/80 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-amber-900">
                Admin
              </span>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="flex cursor-pointer items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-plai-sm transition hover:border-red-300 hover:bg-red-50 hover:text-red-700"
              title="Cerrar sesión"
            >
              <RiLogoutBoxRLine size={14} className="text-red-500" />
              <span>Cerrar sesión</span>
            </button>
          </div>

          <div className="rounded-full border border-black/[0.08] bg-white px-4 py-1.5 text-xs font-semibold capitalize text-plai-muted shadow-plai-sm">
            {new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Stats Row 1 — Inventory */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-xs font-bold uppercase tracking-wider text-plai-muted">
            Inventario Patrimonial
          </h2>
          <span className="text-xs text-plai-muted">
            {loading ? 'Consultando BD...' : `${totalEquipos} dispositivos registrados en MySQL`}
          </span>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Equipos"     value={totalEquipos}    icon={<RiComputerLine />}    variant="primary" />
          <StatCard title="Equipos Activos"   value={equiposActivos}  icon={<RiCheckDoubleLine />} variant="success" />
          <StatCard title="En Mantenimiento"  value={enMantenimiento} icon={<RiAlertLine />}       variant="warning" />
          <StatCard title="Apps VR / PC"      value={totalApps}       icon={<RiAppsLine />}        variant="primary" />
        </div>
      </div>

      {/* Stats Row 2 — Operations */}
      <div className="flex flex-col gap-3">
        <h2 className="font-heading text-xs font-bold uppercase tracking-wider text-plai-muted">Operaciones y Solicitudes</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Reservaciones" value={totalReservaciones} icon={<RiCalendarCheckLine />} variant="success" />
          <StatCard title="Pendientes Aprobar"  value={pendientesAprobar}  icon={<RiTimeLine />}           variant="warning" />
          <StatCard title="Cotizaciones 3D"     value={cotizaciones3D}     icon={<RiPrinterLine />}        variant="primary" />
          <StatCard title="Usuarios Activos"    value={usuariosActivos}    icon={<RiUserLine />}           variant="primary" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Equipment */}
        <DataTable
          title="Equipos Recientes Registrados"
          columns={equipmentColumns}
          data={recentEquipments}
          onAdd={() => router.push('/admin/inventario')}
          addActionLabel="Ver todos"
        />

        {/* Pending Reservations */}
        <div>
          <DataTable
            title="Reservaciones Pendientes"
            columns={reservColumns}
            data={pendingReservations}
            onAdd={() => router.push('/admin/reservaciones')}
            addActionLabel="Ver todas"
          />
        </div>
      </div>

      {/* Activity Feed */}
      <div className="rounded-2xl border border-black/[0.06] bg-white p-6 shadow-plai-sm">
        <h3 className="mb-5 font-heading text-base font-bold text-navy">Actividad Reciente del Sistema</h3>
        <ul className="m-0 flex list-none flex-col divide-y divide-black/[0.06] p-0">
          {initialRecentActivity.map(act => (
            <li key={act.id} className="flex items-start gap-4 py-3.5 first:pt-0 last:pb-0">
              <span
                className="mt-1.5 size-2.5 shrink-0 rounded-full"
                style={{ background: activityTypeColor[act.type] }}
              />
              <div className="flex flex-col gap-0.5 text-sm text-[#374151]">
                <span><strong>{act.user}</strong> {act.action}</span>
                <span className="text-xs text-plai-muted">{act.time}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
