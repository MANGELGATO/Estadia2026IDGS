"use client";

import React, { useState } from 'react';
import styles from './page.module.css';
import DataTable, { Column } from '../../components/admin/DataTable';
import StatCard from '../../components/admin/StatCard';
import { RiToolsLine, RiAlertLine, RiCheckLine, RiTimeLine } from 'react-icons/ri';

type MaintenanceStatus = 'Abierta' | 'En proceso' | 'Resuelta' | 'Cerrada';
type MaintenancePriority = 'Alta' | 'Media' | 'Baja';

type MaintenanceRecord = {
  id: number;
  equipo: string;
  categoria: string;
  descripcion: string;
  reportadoPor: string;
  tecnico: string;
  fechaReporte: string;
  fechaResolucion: string;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
};

const initialData: MaintenanceRecord[] = [
  { id: 1, equipo: 'Meta Quest 3 #02', categoria: 'Realidad Virtual', descripcion: 'Pantalla con líneas verticales, posible falla de display', reportadoPor: 'Ana García', tecnico: 'Luis Martínez', fechaReporte: '2026-09-15', fechaResolucion: '', priority: 'Alta', status: 'En proceso' },
  { id: 2, equipo: 'Impresora 3D Ender 3 #01', categoria: 'Fabricación Digital', descripcion: 'Extrusor obstruido, no extruye material correctamente', reportadoPor: 'Carlos López', tecnico: 'Luis Martínez', fechaReporte: '2026-09-18', fechaResolucion: '', priority: 'Media', status: 'Abierta' },
  { id: 3, equipo: 'Laptop Dell XPS #03', categoria: 'Cómputo', descripcion: 'Batería no carga, solo funciona conectada', reportadoPor: 'María Torres', tecnico: '', fechaReporte: '2026-09-20', fechaResolucion: '', priority: 'Baja', status: 'Abierta' },
  { id: 4, equipo: 'Brazo Robótico Dobot', categoria: 'Robótica', descripcion: 'Calibración perdida, movimientos imprecisos', reportadoPor: 'Pedro Sánchez', tecnico: 'Ana Rodríguez', fechaReporte: '2026-09-10', fechaResolucion: '2026-09-21', priority: 'Alta', status: 'Resuelta' },
  { id: 5, equipo: 'Scanner 3D Revopoint', categoria: 'Escaneo 3D', descripcion: 'Software no reconoce el dispositivo USB', reportadoPor: 'Lucía Ramírez', tecnico: 'Luis Martínez', fechaReporte: '2026-09-08', fechaResolucion: '2026-09-12', priority: 'Media', status: 'Cerrada' },
];

const statusConfig: Record<MaintenanceStatus, { bg: string; color: string }> = {
  Abierta:    { bg: 'rgba(239,68,68,0.12)',    color: '#DC2626' },
  'En proceso': { bg: 'rgba(245,158,11,0.12)', color: '#D97706' },
  Resuelta:   { bg: 'rgba(16,185,129,0.12)',   color: '#059669' },
  Cerrada:    { bg: 'rgba(107,114,128,0.12)',  color: '#6B7280' },
};

const priorityConfig: Record<MaintenancePriority, { bg: string; color: string }> = {
  Alta:  { bg: 'rgba(239,68,68,0.1)',    color: '#DC2626' },
  Media: { bg: 'rgba(245,158,11,0.1)',   color: '#D97706' },
  Baja:  { bg: 'rgba(107,114,128,0.1)', color: '#6B7280' },
};

export default function MantenimientoPage() {
  const [data, setData] = useState<MaintenanceRecord[]>(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MaintenanceRecord | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('Todas');

  const abiertas = data.filter(r => r.status === 'Abierta').length;
  const enProceso = data.filter(r => r.status === 'En proceso').length;
  const resueltas = data.filter(r => r.status === 'Resuelta' || r.status === 'Cerrada').length;
  const altaPrioridad = data.filter(r => r.priority === 'Alta' && r.status !== 'Cerrada').length;

  const filteredData = filterStatus === 'Todas' ? data : data.filter(r => r.status === filterStatus);

  const handleAdd = () => { setEditingItem(null); setIsModalOpen(true); };
  const handleEdit = (item: MaintenanceRecord) => { setEditingItem(item); setIsModalOpen(true); };
  const handleDelete = (item: MaintenanceRecord) => {
    if (confirm(`¿Cerrar el registro de mantenimiento de "${item.equipo}"?`)) {
      setData(data.map(r => r.id === item.id ? { ...r, status: 'Cerrada' } : r));
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (editingItem) {
      setData(data.map(r => r.id === editingItem.id ? {
        ...r,
        status: fd.get('status') as MaintenanceStatus,
        priority: fd.get('priority') as MaintenancePriority,
        tecnico: fd.get('tecnico') as string,
        fechaResolucion: fd.get('fechaResolucion') as string,
        descripcion: fd.get('descripcion') as string,
      } : r));
    } else {
      const newRecord: MaintenanceRecord = {
        id: Date.now(),
        equipo: fd.get('equipo') as string,
        categoria: fd.get('categoria') as string,
        descripcion: fd.get('descripcion') as string,
        reportadoPor: fd.get('reportadoPor') as string,
        tecnico: fd.get('tecnico') as string,
        fechaReporte: new Date().toISOString().split('T')[0],
        fechaResolucion: '',
        priority: fd.get('priority') as MaintenancePriority,
        status: 'Abierta',
      };
      setData([newRecord, ...data]);
    }
    setIsModalOpen(false);
  };

  const columns: Column[] = [
    { key: 'equipo', label: 'Equipo', render: (v, item) => (
      <div>
        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-navy)' }}>{v}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{item.categoria}</div>
      </div>
    )},
    { key: 'descripcion', label: 'Descripción', render: (v) => (
      <span style={{ fontSize: '0.85rem', color: 'var(--text-gray)', maxWidth: 220, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v}</span>
    )},
    { key: 'priority', label: 'Prioridad', render: (v) => {
      const cfg = priorityConfig[v as MaintenancePriority];
      return <span style={{ display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: cfg.bg, color: cfg.color }}>{v}</span>;
    }},
    { key: 'status', label: 'Estado', render: (v) => {
      const cfg = statusConfig[v as MaintenanceStatus];
      return <span style={{ display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: cfg.bg, color: cfg.color }}>{v}</span>;
    }},
    { key: 'tecnico', label: 'Técnico', render: (v) => v || <span style={{ color: 'var(--text-light)', fontSize: '0.8rem' }}>Sin asignar</span> },
    { key: 'fechaReporte', label: 'Reportado' },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Mantenimiento</h1>
          <p className={styles.subtitle}>Registro de incidencias y mantenimiento de equipos</p>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <StatCard title="Abiertas" value={abiertas} icon={<RiAlertLine />} variant="danger" />
        <StatCard title="En Proceso" value={enProceso} icon={<RiTimeLine />} variant="warning" />
        <StatCard title="Resueltas" value={resueltas} icon={<RiCheckLine />} variant="success" />
        <StatCard title="Alta Prioridad" value={altaPrioridad} icon={<RiToolsLine />} variant="danger" />
      </div>

      <div className={styles.filterBar}>
        {['Todas', 'Abierta', 'En proceso', 'Resuelta', 'Cerrada'].map(s => (
          <button key={s} className={`${styles.filterBtn} ${filterStatus === s ? styles.filterBtnActive : ''}`} onClick={() => setFilterStatus(s)}>
            {s}
          </button>
        ))}
      </div>

      <DataTable
        title="Incidencias y Mantenimientos"
        columns={columns}
        data={filteredData}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        addActionLabel="Registrar Incidencia"
      />

      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>
              {editingItem ? 'Actualizar Registro' : 'Nueva Incidencia'}
            </h2>
            <form onSubmit={handleSubmit}>
              {!editingItem ? (
                <>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Equipo</label>
                      <input type="text" name="equipo" className={styles.input} required placeholder="Nombre del equipo" />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Categoría</label>
                      <select name="categoria" className={styles.select}>
                        <option>Realidad Virtual</option>
                        <option>Robótica</option>
                        <option>Fabricación Digital</option>
                        <option>Drones</option>
                        <option>Cómputo</option>
                        <option>Escaneo 3D</option>
                        <option>Electrónica</option>
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Reportado por</label>
                      <input type="text" name="reportadoPor" className={styles.input} required placeholder="Nombre del reportante" />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Técnico asignado</label>
                      <input type="text" name="tecnico" className={styles.input} placeholder="Opcional" />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Prioridad</label>
                      <select name="priority" className={styles.select}>
                        <option value="Alta">Alta</option>
                        <option value="Media">Media</option>
                        <option value="Baja">Baja</option>
                      </select>
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Descripción del problema</label>
                    <textarea name="descripcion" className={styles.input} rows={3} required placeholder="Describe la falla o problema detectado" style={{ resize: 'vertical' }} />
                  </div>
                </>
              ) : (
                <>
                  <div className={styles.equipoLabel}>{editingItem.equipo}</div>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Estado</label>
                      <select name="status" className={styles.select} defaultValue={editingItem.status}>
                        <option value="Abierta">Abierta</option>
                        <option value="En proceso">En proceso</option>
                        <option value="Resuelta">Resuelta</option>
                        <option value="Cerrada">Cerrada</option>
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Prioridad</label>
                      <select name="priority" className={styles.select} defaultValue={editingItem.priority}>
                        <option value="Alta">Alta</option>
                        <option value="Media">Media</option>
                        <option value="Baja">Baja</option>
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Técnico</label>
                      <input type="text" name="tecnico" className={styles.input} defaultValue={editingItem.tecnico} placeholder="Sin asignar" />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Fecha resolución</label>
                      <input type="date" name="fechaResolucion" className={styles.input} defaultValue={editingItem.fechaResolucion} />
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Actualizar descripción</label>
                    <textarea name="descripcion" className={styles.input} rows={3} defaultValue={editingItem.descripcion} style={{ resize: 'vertical' }} />
                  </div>
                </>
              )}
              <div className={styles.modalActions}>
                <button type="button" className={styles.btnCancel} onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className={styles.btnSubmit}>{editingItem ? 'Actualizar' : 'Registrar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
