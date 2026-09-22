"use client";

import React, { useState } from 'react';
import styles from './page.module.css';
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
          style={{
            display: 'flex', alignItems: 'center', gap: '0.25rem',
            padding: '0.35rem 0.75rem', borderRadius: '0.5rem',
            background: 'rgba(168,30,113,0.1)', color: 'var(--primary)',
            fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', border: 'none',
          }}
        >
          <RiEyeLine /> Ver
        </button>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Reservaciones</h1>
          <p className={styles.subtitle}>Gestión de solicitudes y reservas de recursos tecnológicos</p>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <StatCard title="Pendientes" value={pendientes} icon={<RiTimeLine />} variant="warning" />
        <StatCard title="Activas" value={aprobadas} icon={<RiCheckLine />} variant="success" />
        <StatCard title="Completadas" value={completadas} icon={<RiCalendarCheckLine />} variant="primary" />
        <StatCard title="Total" value={data.length} icon={<RiCalendarCheckLine />} variant="primary" />
      </div>

      <div className={styles.filterBar}>
        {['Todas', 'Pendiente', 'Aprobada', 'En uso', 'Completada', 'Rechazada'].map(s => (
          <button
            key={s}
            className={`${styles.filterBtn} ${filterStatus === s ? styles.filterBtnActive : ''}`}
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
        <div className={styles.modalOverlay} onClick={() => setIsDetailOpen(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Detalle de Reservación</h2>
              <StatusBadge value={selectedItem.status} />
            </div>
            <div className={styles.detailGrid}>
              <div className={styles.detailItem}><span className={styles.detailLabel}>Usuario</span><span className={styles.detailValue}>{selectedItem.usuario}</span></div>
              <div className={styles.detailItem}><span className={styles.detailLabel}>Recurso</span><span className={styles.detailValue}>{selectedItem.recurso}</span></div>
              <div className={styles.detailItem}><span className={styles.detailLabel}>Categoría</span><span className={styles.detailValue}>{selectedItem.categoria}</span></div>
              <div className={styles.detailItem}><span className={styles.detailLabel}>Fecha</span><span className={styles.detailValue}>{selectedItem.fecha}</span></div>
              <div className={styles.detailItem}><span className={styles.detailLabel}>Horario</span><span className={styles.detailValue}>{selectedItem.horaInicio} – {selectedItem.horaFin}</span></div>
              <div className={styles.detailItem} style={{ gridColumn: '1 / -1' }}><span className={styles.detailLabel}>Actividad</span><span className={styles.detailValue}>{selectedItem.actividad}</span></div>
              {selectedItem.observaciones && (
                <div className={styles.detailItem} style={{ gridColumn: '1 / -1' }}>
                  <span className={styles.detailLabel}>Observaciones</span>
                  <span className={styles.detailValue}>{selectedItem.observaciones}</span>
                </div>
              )}
            </div>
            {selectedItem.status === 'Pendiente' && (
              <div className={styles.actionButtons}>
                <button className={styles.btnApprove} onClick={() => changeStatus(selectedItem, 'Aprobada')}>
                  <RiCheckLine /> Aprobar
                </button>
                <button className={styles.btnReject} onClick={() => changeStatus(selectedItem, 'Rechazada')}>
                  <RiCloseLine /> Rechazar
                </button>
              </div>
            )}
            {selectedItem.status === 'Aprobada' && (
              <div className={styles.actionButtons}>
                <button className={styles.btnApprove} onClick={() => changeStatus(selectedItem, 'En uso')}>
                  <RiCheckLine /> Marcar En Uso
                </button>
              </div>
            )}
            {selectedItem.status === 'En uso' && (
              <div className={styles.actionButtons}>
                <button className={styles.btnApprove} onClick={() => changeStatus(selectedItem, 'Completada')}>
                  <RiCheckLine /> Completar
                </button>
              </div>
            )}
            <div className={styles.modalActions}>
              <button className={styles.btnCancel} onClick={() => setIsDetailOpen(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* New Reservation Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Nueva Reservación</h2>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Usuario</label>
                  <input type="text" name="usuario" className={styles.input} required placeholder="Nombre completo" />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Recurso</label>
                  <input type="text" name="recurso" className={styles.input} required placeholder="Nombre del equipo" />
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
                  <label className={styles.label}>Fecha</label>
                  <input type="date" name="fecha" className={styles.input} required />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Hora Inicio</label>
                  <input type="time" name="horaInicio" className={styles.input} required />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Hora Fin</label>
                  <input type="time" name="horaFin" className={styles.input} required />
                </div>
                <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                  <label className={styles.label}>Actividad / Propósito</label>
                  <input type="text" name="actividad" className={styles.input} required placeholder="Describe el uso del recurso" />
                </div>
                <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                  <label className={styles.label}>Observaciones</label>
                  <textarea name="observaciones" className={styles.input} rows={2} placeholder="Notas adicionales (opcional)" style={{ resize: 'vertical' }} />
                </div>
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.btnCancel} onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className={styles.btnSubmit}>Registrar Solicitud</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
