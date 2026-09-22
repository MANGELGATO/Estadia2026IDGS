"use client";

import React from 'react';
import styles from './page.module.css';
import StatCard from '../components/admin/StatCard';
import DataTable, { Column } from '../components/admin/DataTable';
import {
  RiComputerLine, RiAlertLine, RiAppsLine, RiCheckDoubleLine,
  RiCalendarCheckLine, RiTimeLine, RiUserLine, RiToolsLine,
} from 'react-icons/ri';
import { useRouter } from 'next/navigation';

const recentEquipments = [
  { id: 1, name: 'Impresora 3D Ender 3', category: 'Impresoras 3D', status: 'Activo' },
  { id: 2, name: 'Lentes Meta Quest 3', category: 'Realidad Virtual', status: 'En mantenimiento' },
  { id: 3, name: 'Brazo Robótico Dobot', category: 'Robótica', status: 'Inactivo' },
];

const recentActivity = [
  { id: 1, user: 'Admin Juan',  action: 'dio de baja el equipo "Laptop Dell XPS".',         time: 'Hace 2 horas', type: 'danger' },
  { id: 2, user: 'Admin María', action: 'aprobó la reservación de Ana García para Meta Quest 3.', time: 'Hace 3 horas', type: 'success' },
  { id: 3, user: 'Admin María', action: 'actualizó "Impresora 3D" a En mantenimiento.',        time: 'Hace 5 horas', type: 'warning' },
  { id: 4, user: 'Sistema',     action: 'registró 3 nuevas aplicaciones en el catálogo.',       time: 'Ayer',         type: 'info' },
  { id: 5, user: 'Admin Juan',  action: 'agregó al usuario "Pedro Sánchez" como Colaborador.',  time: 'Ayer',         type: 'info' },
];

const pendingReservations = [
  { id: 1, usuario: 'Ana García',    recurso: 'Meta Quest 3 #05',    fecha: '2026-09-25', hora: '09:00–11:00' },
  { id: 2, usuario: 'Lucía Ramírez', recurso: 'Laptop Dell XPS #02', fecha: '2026-09-26', hora: '14:00–15:00' },
];

const statusRender = (value: string) => {
  let bg = 'rgba(16, 185, 129, 0.1)', color = '#10B981';
  if (value === 'En mantenimiento') { bg = 'rgba(245, 158, 11, 0.1)'; color = '#F59E0B'; }
  else if (value === 'Inactivo')    { bg = 'rgba(239, 68, 68, 0.1)';  color = '#EF4444'; }
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

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>Bienvenido al panel de administración de PLAi</p>
        </div>
        <div className={styles.dateChip}>
          {new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Stats Row 1 — Inventory */}
      <div className={styles.statsSection}>
        <h2 className={styles.statsLabel}>Inventario</h2>
        <div className={styles.statsGrid}>
          <StatCard title="Total Equipos"     value={124} icon={<RiComputerLine />}    variant="primary" />
          <StatCard title="Equipos Activos"   value={98}  icon={<RiCheckDoubleLine />} variant="success" />
          <StatCard title="En Mantenimiento"  value={15}  icon={<RiAlertLine />}       variant="warning" />
          <StatCard title="Apps VR / PC" value={15} icon={<RiAppsLine />}        variant="primary" />
        </div>
      </div>

      {/* Stats Row 2 — Operations */}
      <div className={styles.statsSection}>
        <h2 className={styles.statsLabel}>Operaciones</h2>
        <div className={styles.statsGrid}>
          <StatCard title="Reservaciones Hoy"   value={8}  icon={<RiCalendarCheckLine />} variant="success" />
          <StatCard title="Pendientes Aprobar"  value={2}  icon={<RiTimeLine />}           variant="warning" />
          <StatCard title="Usuarios Activos"    value={24} icon={<RiUserLine />}           variant="primary" />
          <StatCard title="Incidencias Abiertas" value={3} icon={<RiToolsLine />}          variant="danger" />
        </div>
      </div>

      <div className={styles.sections}>
        {/* Recent Equipment */}
        <DataTable
          title="Equipos Recientes"
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
      <div className={styles.activityCard}>
        <h3 className={styles.activityTitle}>Actividad Reciente</h3>
        <ul className={styles.activityList}>
          {recentActivity.map(act => (
            <li key={act.id} className={styles.activityItem}>
              <span
                className={styles.activityDot}
                style={{ background: activityTypeColor[act.type] }}
              />
              <div className={styles.activityContent}>
                <span><strong>{act.user}</strong> {act.action}</span>
                <span className={styles.activityTime}>{act.time}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
