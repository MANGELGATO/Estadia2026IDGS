"use client";

import React, { useState } from 'react';
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
        <div className="text-sm font-semibold text-navy">{v}</div>
        <div className="text-xs text-plai-muted">{item.categoria}</div>
      </div>
    )},
    { key: 'descripcion', label: 'Descripción', render: (v) => (
      <span className="block max-w-[220px] truncate text-xs text-gray-700">{v}</span>
    )},
    { key: 'priority', label: 'Prioridad', render: (v) => {
      const cfg = priorityConfig[v as MaintenancePriority];
      return <span className="inline-block rounded-full px-2.5 py-0.5 text-xs font-bold" style={{ backgroundColor: cfg.bg, color: cfg.color }}>{v}</span>;
    }},
    { key: 'status', label: 'Estado', render: (v) => {
      const cfg = statusConfig[v as MaintenanceStatus];
      return <span className="inline-block rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: cfg.bg, color: cfg.color }}>{v}</span>;
    }},
    { key: 'tecnico', label: 'Técnico', render: (v) => v || <span className="text-xs text-plai-muted">Sin asignar</span> },
    { key: 'fechaReporte', label: 'Reportado' },
  ];

  return (
    <div className="flex animate-pop-in flex-col gap-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="mb-1 font-heading text-3xl font-extrabold text-navy">Mantenimiento</h1>
          <p className="text-sm text-plai-muted md:text-base">Registro de incidencias y mantenimiento de equipos</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Abiertas" value={abiertas} icon={<RiAlertLine />} variant="danger" />
        <StatCard title="En Proceso" value={enProceso} icon={<RiTimeLine />} variant="warning" />
        <StatCard title="Resueltas" value={resueltas} icon={<RiCheckLine />} variant="success" />
        <StatCard title="Alta Prioridad" value={altaPrioridad} icon={<RiToolsLine />} variant="danger" />
      </div>

      <div className="flex flex-wrap gap-2">
        {['Todas', 'Abierta', 'En proceso', 'Resuelta', 'Cerrada'].map(s => (
          <button 
            key={s} 
            className={`cursor-pointer rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
              filterStatus === s 
                ? 'bg-plai text-white shadow-sm' 
                : 'border border-black/[0.08] bg-white text-gray-700 hover:bg-gray-100'
            }`} 
            onClick={() => setFilterStatus(s)}
          >
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-pop-in" onClick={() => setIsModalOpen(false)}>
          <div className="w-full max-w-[600px] rounded-2xl border border-black/[0.08] bg-white p-6 shadow-2xl md:p-8" onClick={e => e.stopPropagation()}>
            <h2 className="mb-6 font-heading text-xl font-bold text-navy md:text-2xl">
              {editingItem ? 'Actualizar Registro' : 'Nueva Incidencia'}
            </h2>
            <form onSubmit={handleSubmit}>
              {!editingItem ? (
                <>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-navy">Equipo</label>
                      <input type="text" name="equipo" className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-800 transition-all focus:border-plai focus:outline-none focus:ring-2 focus:ring-plai/20" required placeholder="Nombre del equipo" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-navy">Categoría</label>
                      <select name="categoria" className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-800 transition-all focus:border-plai focus:outline-none focus:ring-2 focus:ring-plai/20">
                        <option>Realidad Virtual</option>
                        <option>Robótica</option>
                        <option>Fabricación Digital</option>
                        <option>Drones</option>
                        <option>Cómputo</option>
                        <option>Escaneo 3D</option>
                        <option>Electrónica</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-navy">Reportado por</label>
                      <input type="text" name="reportadoPor" className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-800 transition-all focus:border-plai focus:outline-none focus:ring-2 focus:ring-plai/20" required placeholder="Nombre del reportante" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-navy">Técnico asignado</label>
                      <input type="text" name="tecnico" className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-800 transition-all focus:border-plai focus:outline-none focus:ring-2 focus:ring-plai/20" placeholder="Opcional" />
                    </div>
                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-navy">Prioridad</label>
                      <select name="priority" className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-800 transition-all focus:border-plai focus:outline-none focus:ring-2 focus:ring-plai/20">
                        <option value="Alta">Alta</option>
                        <option value="Media">Media</option>
                        <option value="Baja">Baja</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-navy">Descripción del problema</label>
                    <textarea name="descripcion" className="w-full resize-y rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-800 transition-all focus:border-plai focus:outline-none focus:ring-2 focus:ring-plai/20" rows={3} required placeholder="Describe la falla o problema detectado" />
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-4 rounded-lg bg-gray-50 p-3 font-heading text-sm font-bold text-navy">{editingItem.equipo}</div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-navy">Estado</label>
                      <select name="status" className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-800 transition-all focus:border-plai focus:outline-none focus:ring-2 focus:ring-plai/20" defaultValue={editingItem.status}>
                        <option value="Abierta">Abierta</option>
                        <option value="En proceso">En proceso</option>
                        <option value="Resuelta">Resuelta</option>
                        <option value="Cerrada">Cerrada</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-navy">Prioridad</label>
                      <select name="priority" className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-800 transition-all focus:border-plai focus:outline-none focus:ring-2 focus:ring-plai/20" defaultValue={editingItem.priority}>
                        <option value="Alta">Alta</option>
                        <option value="Media">Media</option>
                        <option value="Baja">Baja</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-navy">Técnico</label>
                      <input type="text" name="tecnico" className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-800 transition-all focus:border-plai focus:outline-none focus:ring-2 focus:ring-plai/20" defaultValue={editingItem.tecnico} placeholder="Sin asignar" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-navy">Fecha resolución</label>
                      <input type="date" name="fechaResolucion" className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-800 transition-all focus:border-plai focus:outline-none focus:ring-2 focus:ring-plai/20" defaultValue={editingItem.fechaResolucion} />
                    </div>
                  </div>
                  <div className="mt-4 flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-navy">Actualizar descripción</label>
                    <textarea name="descripcion" className="w-full resize-y rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-800 transition-all focus:border-plai focus:outline-none focus:ring-2 focus:ring-plai/20" rows={3} defaultValue={editingItem.descripcion} />
                  </div>
                </>
              )}
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="rounded-lg bg-plai px-5 py-2 text-sm font-semibold text-white shadow-md transition-all hover:bg-plai-dark">{editingItem ? 'Actualizar' : 'Registrar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
