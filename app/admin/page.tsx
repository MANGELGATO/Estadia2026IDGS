"use client";

import React from 'react';
import styles from './page.module.css';
import StatCard from '../components/admin/StatCard';
import DataTable, { Column } from '../components/admin/DataTable';
import { RiComputerLine, RiAlertLine, RiAppsLine, RiCheckDoubleLine } from 'react-icons/ri';
import { useRouter } from 'next/navigation';

const recentEquipments = [
  { id: 1, name: 'Impresora 3D Ender 3', category: 'Impresoras 3D', status: 'Activo' },
  { id: 2, name: 'Lentes Meta Quest 3', category: 'Realidad Virtual', status: 'En mantenimiento' },
  { id: 3, name: 'Brazo Robótico Dobot', category: 'Robótica', status: 'Inactivo' },
];

const equipmentColumns: Column[] = [
  { key: 'name', label: 'Nombre del Equipo' },
  { key: 'category', label: 'Categoría' },
  { 
    key: 'status', 
    label: 'Estado',
    render: (value: string) => {
      let bg = 'rgba(16, 185, 129, 0.1)';
      let color = '#10B981';
      
      if (value === 'En mantenimiento') {
        bg = 'rgba(245, 158, 11, 0.1)';
        color = '#F59E0B';
      } else if (value === 'Inactivo') {
        bg = 'rgba(239, 68, 68, 0.1)';
        color = '#EF4444';
      }

      return (
        <span style={{
          display: 'inline-block',
          padding: '0.25rem 0.75rem',
          borderRadius: '9999px',
          fontSize: '0.75rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          backgroundColor: bg,
          color: color
        }}>
          {value}
        </span>
      );
    }
  }
];

export default function AdminDashboard() {
  const router = useRouter();

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>Resumen general del inventario y aplicaciones</p>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <StatCard 
          title="Total Equipos" 
          value={124} 
          icon={<RiComputerLine />} 
          variant="primary" 
        />
        <StatCard 
          title="Equipos Activos" 
          value={98} 
          icon={<RiCheckDoubleLine />} 
          variant="success" 
        />
        <StatCard 
          title="En Mantenimiento" 
          value={15} 
          icon={<RiAlertLine />} 
          variant="warning" 
        />
        <StatCard 
          title="Total Aplicaciones" 
          value={42} 
          icon={<RiAppsLine />} 
          variant="primary" 
        />
      </div>

      <div className={styles.sections}>
        <DataTable 
          title="Equipos Recientes" 
          columns={equipmentColumns} 
          data={recentEquipments}
          onAdd={() => router.push('/admin/inventario')}
          addActionLabel="Ver todos"
        />
        <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-navy)', marginBottom: '1rem' }}>
            Actividad Reciente
          </h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <li style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--border-light)' }}>
              <strong>Admin Juan</strong> dio de baja el equipo "Laptop Dell XPS".
              <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>Hace 2 horas</div>
            </li>
            <li style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--border-light)' }}>
              <strong>Admin María</strong> actualizó el estado de "Impresora 3D" a En mantenimiento.
              <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>Hace 5 horas</div>
            </li>
            <li>
              <strong>Sistema</strong> registró 3 nuevas aplicaciones en el catálogo.
              <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>Ayer</div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
