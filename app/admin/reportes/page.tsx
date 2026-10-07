"use client";

import React from 'react';
import styles from './page.module.css';
import StatCard from '../../components/admin/StatCard';
import {
  RiComputerLine, RiAppsLine, RiCalendarCheckLine,
  RiToolsLine, RiUserLine, RiAlertLine,
} from 'react-icons/ri';

// ─── Mock data ───────────────────────────────────────────────────────────────
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
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Reportes y Estadísticas</h1>
          <p className={styles.subtitle}>Métricas del inventario, uso de recursos y actividad del sistema</p>
        </div>
        <div className={styles.exportBtns}>
          <button className={styles.exportBtn}>📄 Exportar PDF</button>
          <button className={styles.exportBtn}>📊 Exportar Excel</button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className={styles.statsGrid}>
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
      <div className={styles.chartsRow}>

        {/* Equipos más reservados */}
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Equipos más Reservados</h3>
          <p className={styles.chartSubtitle}>Últimos 6 meses</p>
          <div className={styles.barChart}>
            {topEquipos.map(eq => {
              const pct = (eq.reservaciones / maxReservaciones) * 100;
              return (
                <div key={eq.nombre} className={styles.barRow}>
                  <div className={styles.barLabel}>
                    <span className={styles.barName}>{eq.nombre}</span>
                    <span className={styles.barCategory}>{eq.categoria}</span>
                  </div>
                  <div className={styles.barTrack}>
                    <div className={styles.barFill} style={{ width: `${pct}%` }} />
                  </div>
                  <span className={styles.barValue}>{eq.reservaciones}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Estado general */}
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Estado del Inventario</h3>
          <p className={styles.chartSubtitle}>Distribución actual (66 equipos)</p>
          <div className={styles.donutWrapper}>
            <div className={styles.donut} style={{
              background: `conic-gradient(
                #059669 0% ${(57/66)*100}%,
                #D97706 ${(57/66)*100}% ${((57+6)/66)*100}%,
                #DC2626 ${((57+6)/66)*100}% 100%
              )`
            }}>
              <div className={styles.donutCenter}>
                <span className={styles.donutNumber}>66</span>
                <span className={styles.donutLabel}>Total</span>
              </div>
            </div>
          </div>
          <div className={styles.legend}>
            {estadoGeneral.map(e => (
              <div key={e.label} className={styles.legendItem}>
                <span className={styles.legendDot} style={{ background: e.color }} />
                <span className={styles.legendLabel}>{e.label}</span>
                <span className={styles.legendValue}>{e.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actividad mensual */}
      <div className={styles.chartCard} style={{ width: '100%' }}>
        <h3 className={styles.chartTitle}>Actividad Mensual — Reservaciones</h3>
        <p className={styles.chartSubtitle}>Abril – Septiembre 2026</p>
        <div className={styles.columnChart}>
          {actividadMensual.map(a => {
            const pct = (a.reservaciones / maxActividad) * 100;
            return (
              <div key={a.mes} className={styles.columnGroup}>
                <div className={styles.columnValue}>{a.reservaciones}</div>
                <div className={styles.columnTrack}>
                  <div className={styles.columnBar} style={{ height: `${pct}%` }} />
                </div>
                <div className={styles.columnLabel}>{a.mes}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabla por categoría */}
      <div className={styles.tableCard}>
        <h3 className={styles.chartTitle}>Inventario por Categoría</h3>
        <table className={styles.reportTable}>
          <thead>
            <tr>
              <th>Categoría</th>
              <th>Total Equipos</th>
              <th>Activos</th>
              <th>Disponibilidad</th>
              <th>Reservaciones</th>
            </tr>
          </thead>
          <tbody>
            {categorias.map(c => {
              const pct = Math.round((c.activos / c.equipos) * 100);
              return (
                <tr key={c.nombre}>
                  <td><strong>{c.nombre}</strong></td>
                  <td>{c.equipos}</td>
                  <td>{c.activos}</td>
                  <td>
                    <div className={styles.miniBar}>
                      <div className={styles.miniBarFill} style={{ width: `${pct}%`, background: pct > 80 ? '#059669' : pct > 50 ? '#D97706' : '#DC2626' }} />
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{pct}%</span>
                  </td>
                  <td>{c.reservaciones}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
