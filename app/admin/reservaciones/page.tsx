"use client";

import React, { useState } from 'react';
import DataTable, { Column } from '../../components/admin/DataTable';
import { RiCalendarCheckLine, RiCheckLine, RiCloseLine, RiTimeLine, RiEyeLine } from 'react-icons/ri';
import StatCard from '../../components/admin/StatCard';

type ReservationStatus = 'Pendiente' | 'Aprobada' | 'Rechazada' | 'En uso' | 'Completada';

type Reservation = {
  id: number;
  usuario: string;
  recurso: string;
  categoria: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  actividad: string;
  observaciones: string;
  status: ReservationStatus;
};

const initialData: Reservation[] = [
  { id: 1, usuario: 'Ana García', recurso: 'Meta Quest 3 #05', categoria: 'Realidad Virtual', fecha: '2026-09-25', horaInicio: '09:00', horaFin: '11:00', actividad: 'Taller de Realidad Virtual', observaciones: '', status: 'Pendiente' },
  { id: 2, usuario: 'Carlos López', recurso: 'Impresora 3D Ender 3', categoria: 'Fabricación Digital', fecha: '2026-09-23', horaInicio: '14:00', horaFin: '16:00', actividad: 'Proyecto de prototipado', observaciones: 'Necesita filamento PLA azul', status: 'Aprobada' },
  { id: 3, usuario: 'María Torres', recurso: 'Brazo Robótico Dobot', categoria: 'Robótica', fecha: '2026-09-22', horaInicio: '10:00', horaFin: '12:00', actividad: 'Demostración para visita', observaciones: '', status: 'En uso' },
  { id: 4, usuario: 'Pedro Sánchez', recurso: 'Drone DJI Mini 3', categoria: 'Drones', fecha: '2026-09-20', horaInicio: '08:00', horaFin: '09:00', actividad: 'Captura para reel PLAI', observaciones: 'Necesita espacio exterior', status: 'Completada' },
  { id: 5, usuario: 'Lucía Ramírez', recurso: 'Laptop Dell XPS 15', categoria: 'Cómputo', fecha: '2026-09-21', horaInicio: '13:00', horaFin: '15:00', actividad: 'Desarrollo de proyecto', observaciones: '', status: 'Rechazada' },
];

const statusConfig: Record<ReservationStatus, { bg: string; color: string; label: string }> = {
  Pendiente:   { bg: 'rgba(245,158,11,0.12)',  color: '#D97706', label: 'Pendiente' },
  Aprobada:    { bg: 'rgba(16,185,129,0.12)',  color: '#059669', label: 'Aprobada' },
  Rechazada:   { bg: 'rgba(239,68,68,0.12)',   color: '#DC2626', label: 'Rechazada' },
  'En uso':    { bg: 'rgba(99,102,241,0.12)',  color: '#4F46E5', label: 'En uso' },
  Completada:  { bg: 'rgba(107,114,128,0.12)', color: '#6B7280', label: 'Completada' },
};

function StatusBadge({ value }: { value: ReservationStatus }) {
  const cfg = statusConfig[value];
  return (
    <span style={{
      display: 'inline-block',
      padding: '0.25rem 0.75rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: 600,
      backgroundColor: cfg.bg,
      color: cfg.color,
    }}>
      {cfg.label}
    </span>
  );
}

export default function ReservacionesPage() {
  const [data, setData] = useState<Reservation[]>(initialData);
  const [selectedItem, setSelectedItem] = useState<Reservation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('Todas');

  const pendientes = data.filter(r => r.status === 'Pendiente').length;
  const aprobadas = data.filter(r => r.status === 'Aprobada' || r.status === 'En uso').length;
  const completadas = data.filter(r => r.status === 'Completada').length;

  const filteredData = filterStatus === 'Todas' ? data : data.filter(r => r.status === filterStatus);

  const changeStatus = (item: Reservation, newStatus: ReservationStatus) => {
    setData(data.map(r => r.id === item.id ? { ...r, status: newStatus } : r));
    setIsDetailOpen(false);
  };

  const handleDelete = (item: Reservation) => {
    if (confirm(`¿Cancelar la reservación de "${item.usuario}" para "${item.recurso}"?`)) {
      setData(data.filter(r => r.id !== item.id));
    }
  };

  const handleAdd = () => {
    setSelectedItem(null);
    setIsModalOpen(true);
  };

  const handleDetail = (item: Reservation) => {
    setSelectedItem(item);
    setIsDetailOpen(true);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const newItem: Reservation = {
      id: Date.now(),
      usuario: fd.get('usuario') as string,
      recurso: fd.get('recurso') as string,
      categoria: fd.get('categoria') as string,
      fecha: fd.get('fecha') as string,
      horaInicio: fd.get('horaInicio') as string,
      horaFin: fd.get('horaFin') as string,
      actividad: fd.get('actividad') as string,
      observaciones: fd.get('observaciones') as string,
      status: 'Pendiente',
    };
    setData([newItem, ...data]);
    setIsModalOpen(false);
  };

  const columns: Column[] = [
    { key: 'usuario', label: 'Usuario' },
    { key: 'recurso', label: 'Recurso' },
    { key: 'fecha', label: 'Fecha' },
    { 
      key: 'horaInicio', 
      label: 'Horario',
      render: (value, item) => `${value} – ${item.horaFin}`,
    },
    {
      key: 'status',
      label: 'Estado',
      render: (value) => <StatusBadge value={value} />,
    },
    {
      key: 'id',
      label: 'Detalle',
      render: (_, item) => (
        <button
          onClick={() => handleDetail(item)}
          className="flex items-center gap-1 rounded-lg bg-[rgba(168,30,113,0.1)] px-3 py-1.5 text-xs font-semibold text-plai transition-colors hover:bg-plai hover:text-white"
        >
          <RiEyeLine /> Ver
        </button>
      ),
    },
  ];

  return (
    <div className="flex animate-pop-in flex-col gap-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="mb-1 font-heading text-3xl font-extrabold text-navy">Reservaciones</h1>
          <p className="text-sm text-plai-muted md:text-base">Gestión de solicitudes y reservas de recursos tecnológicos</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Pendientes" value={pendientes} icon={<RiTimeLine />} variant="warning" />
        <StatCard title="Activas" value={aprobadas} icon={<RiCheckLine />} variant="success" />
        <StatCard title="Completadas" value={completadas} icon={<RiCalendarCheckLine />} variant="primary" />
        <StatCard title="Total" value={data.length} icon={<RiCalendarCheckLine />} variant="primary" />
      </div>

      <div className="flex flex-wrap gap-2">
        {['Todas', 'Pendiente', 'Aprobada', 'En uso', 'Completada', 'Rechazada'].map(s => (
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
        title="Solicitudes de Reservación"
        columns={columns}
        data={filteredData}
        onAdd={handleAdd}
        onDelete={handleDelete}
        addActionLabel="Nueva Reservación"
      />

      {/* Detail/Action Modal */}
      {isDetailOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-pop-in" onClick={() => setIsDetailOpen(false)}>
          <div className="w-full max-w-[560px] rounded-2xl border border-black/[0.08] bg-white p-6 shadow-2xl md:p-8" onClick={e => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="font-heading text-xl font-bold text-navy">Detalle de Reservación</h2>
              <StatusBadge value={selectedItem.status} />
            </div>
            <div className="my-4 grid grid-cols-1 gap-4 rounded-xl border border-black/[0.04] bg-gray-50 p-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1"><span className="text-xs font-bold uppercase tracking-wider text-plai-muted">Usuario</span><span className="text-sm font-semibold text-gray-800">{selectedItem.usuario}</span></div>
              <div className="flex flex-col gap-1"><span className="text-xs font-bold uppercase tracking-wider text-plai-muted">Recurso</span><span className="text-sm font-semibold text-gray-800">{selectedItem.recurso}</span></div>
              <div className="flex flex-col gap-1"><span className="text-xs font-bold uppercase tracking-wider text-plai-muted">Categoría</span><span className="text-sm font-semibold text-gray-800">{selectedItem.categoria}</span></div>
              <div className="flex flex-col gap-1"><span className="text-xs font-bold uppercase tracking-wider text-plai-muted">Fecha</span><span className="text-sm font-semibold text-gray-800">{selectedItem.fecha}</span></div>
              <div className="flex flex-col gap-1"><span className="text-xs font-bold uppercase tracking-wider text-plai-muted">Horario</span><span className="text-sm font-semibold text-gray-800">{selectedItem.horaInicio} – {selectedItem.horaFin}</span></div>
              <div className="flex flex-col gap-1 sm:col-span-2"><span className="text-xs font-bold uppercase tracking-wider text-plai-muted">Actividad</span><span className="text-sm font-semibold text-gray-800">{selectedItem.actividad}</span></div>
              {selectedItem.observaciones && (
                <div className="flex flex-col gap-1 sm:col-span-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-plai-muted">Observaciones</span>
                  <span className="text-sm font-semibold text-gray-800">{selectedItem.observaciones}</span>
                </div>
              )}
            </div>
            {selectedItem.status === 'Pendiente' && (
              <div className="my-4 flex gap-3">
                <button className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-emerald-700" onClick={() => changeStatus(selectedItem, 'Aprobada')}>
                  <RiCheckLine /> Aprobar
                </button>
                <button className="flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-rose-700" onClick={() => changeStatus(selectedItem, 'Rechazada')}>
                  <RiCloseLine /> Rechazar
                </button>
              </div>
            )}
            {selectedItem.status === 'Aprobada' && (
              <div className="my-4 flex gap-3">
                <button className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-indigo-700" onClick={() => changeStatus(selectedItem, 'En uso')}>
                  <RiCheckLine /> Marcar En Uso
                </button>
              </div>
            )}
            {selectedItem.status === 'En uso' && (
              <div className="my-4 flex gap-3">
                <button className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-emerald-700" onClick={() => changeStatus(selectedItem, 'Completada')}>
                  <RiCheckLine /> Completar
                </button>
              </div>
            )}
            <div className="mt-6 flex justify-end">
              <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100" onClick={() => setIsDetailOpen(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* New Reservation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-pop-in" onClick={() => setIsModalOpen(false)}>
          <div className="w-full max-w-[600px] rounded-2xl border border-black/[0.08] bg-white p-6 shadow-2xl md:p-8" onClick={e => e.stopPropagation()}>
            <h2 className="mb-6 font-heading text-xl font-bold text-navy md:text-2xl">Nueva Reservación</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-navy">Usuario</label>
                  <input type="text" name="usuario" className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-800 transition-all focus:border-plai focus:outline-none focus:ring-2 focus:ring-plai/20" required placeholder="Nombre completo" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-navy">Recurso</label>
                  <input type="text" name="recurso" className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-800 transition-all focus:border-plai focus:outline-none focus:ring-2 focus:ring-plai/20" required placeholder="Nombre del equipo" />
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
                  <label className="text-xs font-bold uppercase tracking-wider text-navy">Fecha</label>
                  <input type="date" name="fecha" className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-800 transition-all focus:border-plai focus:outline-none focus:ring-2 focus:ring-plai/20" required />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-navy">Hora Inicio</label>
                  <input type="time" name="horaInicio" className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-800 transition-all focus:border-plai focus:outline-none focus:ring-2 focus:ring-plai/20" required />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-navy">Hora Fin</label>
                  <input type="time" name="horaFin" className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-800 transition-all focus:border-plai focus:outline-none focus:ring-2 focus:ring-plai/20" required />
                </div>
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-navy">Actividad / Propósito</label>
                  <input type="text" name="actividad" className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-800 transition-all focus:border-plai focus:outline-none focus:ring-2 focus:ring-plai/20" required placeholder="Describe el uso del recurso" />
                </div>
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-navy">Observaciones</label>
                  <textarea name="observaciones" className="w-full resize-y rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-800 transition-all focus:border-plai focus:outline-none focus:ring-2 focus:ring-plai/20" rows={2} placeholder="Notas adicionales (opcional)" />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="rounded-lg bg-plai px-5 py-2 text-sm font-semibold text-white shadow-md transition-all hover:bg-plai-dark">Registrar Solicitud</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
