"use client";

import React, { useState, useEffect } from 'react';
import DataTable, { Column } from '../../components/admin/DataTable';
import { RiCalendarCheckLine, RiCheckLine, RiCloseLine, RiTimeLine, RiEyeLine } from 'react-icons/ri';
import StatCard from '../../components/admin/StatCard';
import { ReservacionItem } from '../../../lib/db';
import { DeviceItem } from '../../../lib/mockData';

const statusConfig: Record<string, { bg: string; color: string; label: string }> = {
  Pendiente:   { bg: 'rgba(245,158,11,0.12)',  color: '#D97706', label: 'Pendiente' },
  Aprobada:    { bg: 'rgba(16,185,129,0.12)',  color: '#059669', label: 'Aprobada' },
  Rechazada:   { bg: 'rgba(239,68,68,0.12)',   color: '#DC2626', label: 'Rechazada' },
  'En uso':    { bg: 'rgba(99,102,241,0.12)',  color: '#4F46E5', label: 'En uso' },
  Completada:  { bg: 'rgba(107,114,128,0.12)', color: '#6B7280', label: 'Completada' },
};

function StatusBadge({ value }: { value: string }) {
  const cfg = statusConfig[value] || statusConfig['Pendiente'];
  return (
    <span
      className="inline-block rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap"
      style={{ backgroundColor: cfg.bg, color: cfg.color }}
    >
      {cfg.label}
    </span>
  );
}

export default function ReservacionesPage() {
  const [data, setData] = useState<ReservacionItem[]>([]);
  const [equipos, setEquipos] = useState<DeviceItem[]>([]);

  // Modals
  const [selectedItem, setSelectedItem] = useState<ReservacionItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isApprovalOpen, setIsApprovalOpen] = useState(false);

  // Approval form state
  const [assigningDevice, setAssigningDevice] = useState<DeviceItem | null>(null);
  const [accesoriosText, setAccesoriosText] = useState('');
  const [condicionSalida, setCondicionSalida] = useState('Excelente');
  const [observacionesAdmin, setObservacionesAdmin] = useState('');
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const [filterStatus, setFilterStatus] = useState<string>('Todas');

  const fetchData = async () => {
    try {
      const [resRes, resEq] = await Promise.all([
        fetch('/api/reservaciones'),
        fetch('/api/equipos'),
      ]);
      if (resRes.ok) {
        const json = await resRes.json();
        if (json.data) setData(json.data);
      }
      if (resEq.ok) {
        const jsonEq = await resEq.json();
        if (jsonEq.data) setEquipos(jsonEq.data);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  useEffect(() => {
    let active = true;
    Promise.all([fetch('/api/reservaciones'), fetch('/api/equipos')])
      .then(async ([resRes, resEq]) => {
        if (!active) return;
        if (resRes.ok) {
          const json = await resRes.json();
          if (active && json.data) setData(json.data);
        }
        if (resEq.ok) {
          const jsonEq = await resEq.json();
          if (active && jsonEq.data) setEquipos(jsonEq.data);
        }
      })
      .catch((err) => console.error('Error fetching data:', err));
    return () => {
      active = false;
    };
  }, []);

  const pendientes = data.filter(r => r.estado === 'Pendiente').length;
  const aprobadas = data.filter(r => r.estado === 'Aprobada' || r.estado === 'En uso').length;
  const completadas = data.filter(r => r.estado === 'Completada').length;

  const filteredData = filterStatus === 'Todas' ? data : data.filter(r => r.estado === filterStatus);

  // Normalizar cadena sin acentos para coincidencia exacta de categorías
  const normalizeCat = (s?: string) =>
    (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/-/g, ' ').trim();

  // Ofrecer EXCLUSIVAMENTE dispositivos con estado 'Disponible' en la categoría
  const getAvailableDevicesForCategory = (categoriaId?: string) => {
    if (!categoriaId) return [];
    const normCat = normalizeCat(categoriaId);
    return equipos.filter(eq => {
      const eqCat = normalizeCat(eq.category);
      const isSameCategory = eqCat.includes(normCat) || (normCat !== '' && normCat.includes(eqCat));
      return isSameCategory && eq.status === 'Disponible';
    });
  };

  const handleOpenApproval = (item: ReservacionItem) => {
    setSelectedItem(item);
    const available = getAvailableDevicesForCategory(item.categoriaId);
    if (available.length > 0) {
      const preferred =
        available.find(eq => eq.id === item.equipoId || eq.inventoryNumber === item.codigoPlaiAsignado) ||
        available[0];
      setAssigningDevice(preferred);
      setAccesoriosText(preferred.accessories?.join(', ') || 'Equipo completo con cargador y cables');
    } else {
      setAssigningDevice(null);
      setAccesoriosText(item.accesoriosIncluidos || 'Equipo base con cables');
    }
    setCondicionSalida('Excelente');
    setObservacionesAdmin(item.observacionesAdmin || 'Aprobado para uso académico en las instalaciones de PLAi.');
    setIsApprovalOpen(true);
  };

  const handleConfirmApproval = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    if (!assigningDevice) {
      setNotification({
        text: 'No es posible aprobar con asignación: no hay dispositivos en estado Disponible para esta categoría.',
        type: 'error',
      });
      return;
    }

    const payload = {
      id: selectedItem.id,
      estado: 'Aprobada' as const,
      equipoId: assigningDevice.id,
      codigoPlaiAsignado: assigningDevice.inventoryNumber,
      accesoriosIncluidos: accesoriosText,
      condicionSalida: condicionSalida,
      observacionesAdmin: observacionesAdmin,
    };

    try {
      const res = await fetch('/api/reservaciones', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));

      if (res.ok) {
        setData(prev => prev.map(r => r.id === selectedItem.id ? { ...r, ...payload, estado: 'Aprobada' } : r));
        setIsApprovalOpen(false);
        setNotification({
          text: `Reservación ${selectedItem.folio} aprobada. El dispositivo ${payload.codigoPlaiAsignado} quedó asignado y marcado como Reservado en Inventario.`,
          type: 'success',
        });
        fetchData();
      } else {
        setNotification({
          text: json.message || 'Error al aprobar y asignar dispositivo',
          type: 'error',
        });
      }
    } catch (err) {
      console.error('Error al aprobar reservación:', err);
    }
  };

  const handleRegistrarSalida = async (item: ReservacionItem) => {
    try {
      const res = await fetch('/api/reservaciones', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: item.id,
          estado: 'En uso',
          registrarEntregaEnBitacora: true,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        setNotification({
          text: `Salida registrada en Bitácora de Uso para ${item.folio} (${item.codigoPlaiAsignado || 'Equipo'}). Estado actualizado a "En uso".`,
          type: 'success',
        });
        fetchData();
      } else {
        setNotification({
          text: json.message || 'No fue posible registrar la salida del dispositivo.',
          type: 'error',
        });
      }
    } catch (err) {
      console.error('Error al registrar salida:', err);
    }
  };

  const handleEdit = (item: ReservacionItem) => {
    setSelectedItem(item);
    setIsEditOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedItem) return;
    const fd = new FormData(e.currentTarget);

    const updated: Partial<ReservacionItem> = {
      usuarioNombre: (fd.get('usuarioNombre') as string).trim(),
      fechaUso: fd.get('fechaUso') as string,
      horaInicio: fd.get('horaInicio') as string,
      horaFin: fd.get('horaFin') as string,
      actividad: (fd.get('actividad') as string).trim(),
      estado: fd.get('estado') as ReservacionItem['estado'],
      codigoPlaiAsignado: (fd.get('codigoPlaiAsignado') as string)?.trim() || undefined,
      accesoriosIncluidos: (fd.get('accesoriosIncluidos') as string)?.trim() || undefined,
      condicionSalida: fd.get('condicionSalida') as string,
      observacionesAdmin: (fd.get('observacionesAdmin') as string)?.trim() || undefined,
    };

    try {
      const res = await fetch('/api/reservaciones', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedItem.id, ...updated }),
      });

      if (res.ok) {
        setData(prev => prev.map(r => r.id === selectedItem.id ? { ...r, ...updated } : r));
        setIsEditOpen(false);
        setNotification({ text: `Cambios guardados en reservación ${selectedItem.folio}.`, type: 'success' });
        fetchData();
      } else {
        setNotification({ text: 'Error al guardar cambios', type: 'error' });
      }
    } catch (err) {
      console.error('Error al editar reservación:', err);
    }
  };

  const handleReject = async (item: ReservacionItem) => {
    try {
      const res = await fetch('/api/reservaciones', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: item.id,
          estado: 'Rechazada',
          observacionesAdmin: 'Rechazada por indisponibilidad de horarios o mantenimiento.',
        }),
      });

      if (res.ok) {
        setData(prev => prev.map(r => r.id === item.id ? { ...r, estado: 'Rechazada' } : r));
        setNotification({ text: `Solicitud ${item.folio} marcada como Rechazada.`, type: 'success' });
        fetchData();
      }
    } catch (err) {
      console.error('Error al rechazar:', err);
    }
  };

  const columns: Column[] = [
    {
      key: 'folio',
      label: 'Folio / Solicitante',
      render: (_, item: ReservacionItem) => (
        <div>
          <span className="font-mono text-xs font-bold text-plai">{item.folio || item.id}</span>
          <div className="text-sm font-semibold text-navy">{item.usuarioNombre || 'Usuario PLAi'}</div>
          <div className="text-xs text-plai-muted">{item.usuarioEmail || ''}</div>
        </div>
      ),
    },
    {
      key: 'categoriaId',
      label: 'Categoría / Equipo Asignado',
      render: (v: string, item: ReservacionItem) => {
        const catName = String(v || item?.categoriaId || 'General').replace(/-/g, ' ');
        return (
          <div>
            <div className="text-xs font-semibold capitalize text-navy">
              {catName}
            </div>
            {item.codigoPlaiAsignado ? (
              <div className="mt-0.5 inline-flex items-center gap-1 rounded bg-blue-50 px-2 py-0.5 text-[11px] font-mono font-bold text-blue-700">
                Cód: {item.codigoPlaiAsignado}
              </div>
            ) : (
              <div className="mt-0.5 text-[11px] italic text-amber-600">
                Sin dispositivo asignado
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: 'fechaUso',
      label: 'Fecha y Horario',
      render: (v: string, item: ReservacionItem) => (
        <div>
          <div className="font-mono text-xs font-semibold text-navy">{v || item.fechaUso || ''}</div>
          <div className="text-xs text-plai-muted">{item.horaInicio || '10:00'} – {item.horaFin || '12:00'}</div>
        </div>
      ),
    },
    {
      key: 'actividad',
      label: 'Actividad',
      render: (v: string) => (
        <span className="block max-w-[200px] truncate text-xs text-gray-800">{v}</span>
      ),
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (v: string) => <StatusBadge value={v} />,
    },
    {
      key: 'acciones_custom',
      label: 'Gestión',
      render: (_, item: ReservacionItem) => (
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          {item.estado === 'Pendiente' ? (
            <button
              onClick={() => handleOpenApproval(item)}
              className="flex cursor-pointer items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white shadow-sm transition-all hover:bg-emerald-700"
              title="Aprobar y asignar dispositivo disponible"
            >
              <RiCheckLine /> Asignar
            </button>
          ) : null}

          {item.estado === 'Aprobada' ? (
            <button
              onClick={() => handleRegistrarSalida(item)}
              className="flex cursor-pointer items-center gap-1 rounded-md bg-indigo-600 px-2.5 py-1 text-xs font-bold text-white shadow-sm transition-all hover:bg-indigo-700"
              title="Entregar dispositivo y abrir registro en Bitácora de Uso"
            >
              <RiCheckLine /> Entregar
            </button>
          ) : null}

          {item.estado === 'Pendiente' ? (
            <button
              onClick={() => handleReject(item)}
              className="flex cursor-pointer items-center gap-1 rounded-md bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-100"
              title="Rechazar solicitud"
            >
              <RiCloseLine />
            </button>
          ) : null}

          <button
            onClick={() => {
              setSelectedItem(item);
              setIsDetailOpen(true);
            }}
            className="flex cursor-pointer items-center gap-1 rounded-md bg-plai/10 px-2.5 py-1 text-xs font-semibold text-plai hover:bg-plai hover:text-white"
          >
            <RiEyeLine /> Ver
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex animate-pop-in flex-col gap-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="mb-1 font-heading text-3xl font-extrabold text-navy">Reservaciones</h1>
          <p className="text-sm text-plai-muted md:text-base">
            Aprobación inteligente con asignación automática de equipos, sincronización con Inventario y Bitácora
          </p>
        </div>
      </div>

      {notification && (
        <div className={`flex items-center justify-between rounded-xl border p-4 text-sm font-semibold animate-pop-in ${
          notification.type === 'success'
            ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
            : 'border-rose-200 bg-rose-50 text-rose-800'
        }`}>
          <span>{notification.text}</span>
          <button onClick={() => setNotification(null)} className="cursor-pointer text-gray-500 hover:text-black">
            <RiCloseLine size={18} />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Pendientes" value={pendientes} icon={<RiTimeLine />} variant="warning" />
        <StatCard title="Activas" value={aprobadas} icon={<RiCheckLine />} variant="success" />
        <StatCard title="Completadas" value={completadas} icon={<RiCalendarCheckLine />} variant="primary" />
        <StatCard title="Total Registros" value={data.length} icon={<RiCalendarCheckLine />} variant="primary" />
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
        title={`Solicitudes de Reservación (${filteredData.length})`}
        columns={columns}
        data={filteredData}
        onEdit={handleEdit}
        // Se omite onDelete expresamente conforme al requerimiento 6
      />

      {/* Modal de Aprobación y Asignación de Dispositivo (Req 6) */}
      {isApprovalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-pop-in" onClick={() => setIsApprovalOpen(false)}>
          <div className="max-h-[90vh] w-full max-w-[620px] overflow-y-auto rounded-2xl border border-black/[0.08] bg-white p-6 shadow-2xl md:p-8" onClick={e => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h2 className="font-heading text-xl font-bold text-navy">Aprobar y Asignar Dispositivo</h2>
                <p className="text-xs text-plai-muted">Folio: {selectedItem.folio} · Solicitante: {selectedItem.usuarioNombre}</p>
              </div>
              <button className="text-gray-400 hover:text-gray-700" onClick={() => setIsApprovalOpen(false)}>
                <RiCloseLine className="text-2xl" />
              </button>
            </div>

            <form onSubmit={handleConfirmApproval} className="flex flex-col gap-4">
              <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-navy uppercase tracking-wider">Categoría solicitada:</span>
                  <span className="rounded bg-blue-600 px-2 py-0.5 font-bold uppercase text-white">
                    {String(selectedItem?.categoriaId || 'General').replace(/-/g, ' ')}
                  </span>
                </div>
                <div className="mt-2 text-xs text-gray-600">
                  Fecha requerida: <strong className="text-navy">{selectedItem.fechaUso}</strong> ({selectedItem.horaInicio} a {selectedItem.horaFin})
                </div>
                <div className="mt-1 text-xs text-gray-600">
                  Actividad: <span className="italic">{selectedItem.actividad}</span>
                </div>
              </div>

              {/* Selector de Dispositivos Disponibles */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-navy">
                  Dispositivo asignado (Detectados disponibles para el día y hora)
                </label>
                {getAvailableDevicesForCategory(selectedItem.categoriaId).length > 0 ? (
                  <select
                    className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-800 transition-all focus:border-plai focus:outline-none focus:ring-2 focus:ring-plai/20"
                    value={assigningDevice?.id || ''}
                    onChange={e => {
                      const dev = equipos.find(eq => eq.id === e.target.value);
                      setAssigningDevice(dev || null);
                      if (dev) {
                        setAccesoriosText(dev.accessories?.join(', ') || 'Equipo completo con cargador y cables');
                      }
                    }}
                    required
                  >
                    {getAvailableDevicesForCategory(selectedItem.categoriaId).map(eq => (
                      <option key={eq.id} value={eq.id}>
                        {eq.name} (Código: {eq.inventoryNumber}) - {eq.brand} {eq.model}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-800">
                    ⚠️ No hay dispositivos con estado <strong>Disponible</strong> en esta categoría actualmente. Puedes asignar uno de otra categoría o liberar un equipo desde Inventario.
                  </div>
                )}
              </div>

              {/* Accesorios que se prestan */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-navy">
                  Accesorios que se entregan con el dispositivo
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-800 transition-all focus:border-plai focus:outline-none"
                  value={accesoriosText}
                  onChange={e => setAccesoriosText(e.target.value)}
                  placeholder="Ej. 2 Controles Touch Plus, Cable USB-C, Eliminador, Estuche..."
                  required
                />
              </div>

              {/* Condición física de salida */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-navy">
                  Condición física de entrega
                </label>
                <select
                  className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-800 transition-all focus:border-plai focus:outline-none"
                  value={condicionSalida}
                  onChange={e => setCondicionSalida(e.target.value)}
                >
                  <option value="Excelente">Excelente (Sin detalles estéticos ni funcionales)</option>
                  <option value="Bueno">Bueno (Marcas normales de uso superficial)</option>
                  <option value="Regular">Regular (Desgaste visible, 100% operativo)</option>
                </select>
              </div>

              {/* Observaciones del administrador */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-navy">
                  Observaciones administrativas
                </label>
                <textarea
                  className="w-full resize-y rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-800 transition-all focus:border-plai focus:outline-none"
                  rows={2}
                  value={observacionesAdmin}
                  onChange={e => setObservacionesAdmin(e.target.value)}
                  placeholder="Indicaciones especiales, software precargado o restricciones de uso..."
                />
              </div>

              <div className="mt-4 flex justify-end gap-3">
                <button
                  type="button"
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100"
                  onClick={() => setIsApprovalOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!assigningDevice}
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-md transition-all hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <RiCheckLine /> Confirmar Aprobación y Asignación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Registro (Req 6) */}
      {isEditOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-pop-in" onClick={() => setIsEditOpen(false)}>
          <div className="max-h-[90vh] w-full max-w-[620px] overflow-y-auto rounded-2xl border border-black/[0.08] bg-white p-6 shadow-2xl md:p-8" onClick={e => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h2 className="font-heading text-xl font-bold text-navy">Editar Reservación: {selectedItem.folio}</h2>
                <p className="text-xs text-plai-muted">Modificación de parámetros y estatus de reservación</p>
              </div>
              <button className="text-gray-400 hover:text-gray-700" onClick={() => setIsEditOpen(false)}>
                <RiCloseLine className="text-2xl" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-navy">Solicitante</label>
                <input
                  type="text"
                  name="usuarioNombre"
                  className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-gray-800"
                  defaultValue={selectedItem.usuarioNombre}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-navy">Estado</label>
                <select
                  name="estado"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-sm text-gray-800"
                  defaultValue={selectedItem.estado}
                >
                  <option value="Pendiente">Pendiente</option>
                  <option value="Aprobada">Aprobada</option>
                  <option value="En uso">En uso</option>
                  <option value="Completada">Completada</option>
                  <option value="Rechazada">Rechazada</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-navy">Fecha de Uso</label>
                <input
                  type="date"
                  name="fechaUso"
                  className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-gray-800"
                  defaultValue={selectedItem.fechaUso}
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <div className="flex flex-1 flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-navy">Hora Inicio</label>
                  <input
                    type="time"
                    name="horaInicio"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800"
                    defaultValue={selectedItem.horaInicio}
                    required
                  />
                </div>
                <div className="flex flex-1 flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-navy">Hora Fin</label>
                  <input
                    type="time"
                    name="horaFin"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800"
                    defaultValue={selectedItem.horaFin}
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-navy">Código PLAi Asignado</label>
                <input
                  type="text"
                  name="codigoPlaiAsignado"
                  className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-gray-800 font-mono"
                  defaultValue={selectedItem.codigoPlaiAsignado || ''}
                  placeholder="Ej. 5151000013-1"
                />
              </div>

              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-navy">Accesorios Incluidos</label>
                <input
                  type="text"
                  name="accesoriosIncluidos"
                  className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-gray-800"
                  defaultValue={selectedItem.accesoriosIncluidos || ''}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-navy">Condición de Salida</label>
                <select
                  name="condicionSalida"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-sm text-gray-800"
                  defaultValue={selectedItem.condicionSalida || 'Excelente'}
                >
                  <option value="Excelente">Excelente</option>
                  <option value="Bueno">Bueno</option>
                  <option value="Regular">Regular</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-navy">Actividad</label>
                <input
                  type="text"
                  name="actividad"
                  className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-gray-800"
                  defaultValue={selectedItem.actividad}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-navy">Observaciones del Administrador</label>
                <textarea
                  name="observacionesAdmin"
                  rows={2}
                  className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-gray-800"
                  defaultValue={selectedItem.observacionesAdmin || ''}
                />
              </div>

              <div className="mt-4 flex justify-end gap-3 sm:col-span-2">
                <button
                  type="button"
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100"
                  onClick={() => setIsEditOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-plai px-5 py-2 text-sm font-semibold text-white shadow-md transition-all hover:bg-plai-dark"
                >
                  Guardar Modificaciones
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Detalle */}
      {isDetailOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-pop-in" onClick={() => setIsDetailOpen(false)}>
          <div className="w-full max-w-[560px] rounded-2xl border border-black/[0.08] bg-white p-6 shadow-2xl md:p-8" onClick={e => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h2 className="font-heading text-xl font-bold text-navy">Ficha de Reservación</h2>
                <span className="font-mono text-xs text-plai font-bold">{selectedItem.folio}</span>
              </div>
              <StatusBadge value={selectedItem.estado} />
            </div>

            <div className="my-4 grid grid-cols-1 gap-3 rounded-xl border border-black/[0.04] bg-gray-50 p-4 text-xs sm:grid-cols-2">
              <div>
                <span className="font-bold text-plai-muted uppercase">Usuario:</span>
                <p className="font-semibold text-navy text-sm">{selectedItem.usuarioNombre}</p>
                <p className="text-gray-500">{selectedItem.usuarioEmail}</p>
              </div>
              <div>
                <span className="font-bold text-plai-muted uppercase">Institución:</span>
                <p className="font-semibold text-navy">{selectedItem.usuarioInstitucion || 'Particular'}</p>
              </div>
              <div>
                <span className="font-bold text-plai-muted uppercase">Categoría:</span>
                <p className="font-semibold text-navy capitalize">{String(selectedItem?.categoriaId || 'General').replace(/-/g, ' ')}</p>
              </div>
              <div>
                <span className="font-bold text-plai-muted uppercase">Código PLAi Asignado:</span>
                <p className="font-mono font-bold text-plai">{selectedItem.codigoPlaiAsignado || 'Sin asignar'}</p>
              </div>
              <div>
                <span className="font-bold text-plai-muted uppercase">Fecha de Uso:</span>
                <p className="font-semibold text-navy">{selectedItem.fechaUso}</p>
              </div>
              <div>
                <span className="font-bold text-plai-muted uppercase">Horario:</span>
                <p className="font-semibold text-navy">{selectedItem.horaInicio} – {selectedItem.horaFin}</p>
              </div>
              <div className="sm:col-span-2">
                <span className="font-bold text-plai-muted uppercase">Accesorios entregados:</span>
                <p className="font-semibold text-gray-800">{selectedItem.accesoriosIncluidos || 'No especificados'}</p>
              </div>
              <div className="sm:col-span-2">
                <span className="font-bold text-plai-muted uppercase">Condición de salida:</span>
                <p className="font-semibold text-emerald-700">{selectedItem.condicionSalida || 'Excelente'}</p>
              </div>
              <div className="sm:col-span-2">
                <span className="font-bold text-plai-muted uppercase">Actividad:</span>
                <p className="text-gray-800">{selectedItem.actividad}</p>
              </div>
              {selectedItem.observacionesAdmin && (
                <div className="sm:col-span-2">
                  <span className="font-bold text-plai-muted uppercase">Observaciones Admin:</span>
                  <p className="italic text-gray-700">{selectedItem.observacionesAdmin}</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100"
                onClick={() => setIsDetailOpen(false)}
              >
                Cerrar
              </button>
              <button
                className="rounded-lg bg-plai px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-plai-dark"
                onClick={() => {
                  setIsDetailOpen(false);
                  handleEdit(selectedItem);
                }}
              >
                Editar Registro
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
