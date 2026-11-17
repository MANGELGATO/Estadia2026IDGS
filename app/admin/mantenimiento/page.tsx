"use client";

import React, { useState, useEffect } from 'react';
import DataTable, { Column } from '../../components/admin/DataTable';
import StatCard from '../../components/admin/StatCard';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import { RiToolsLine, RiAlertLine, RiCheckLine, RiTimeLine, RiSearch2Line, RiCloseLine } from 'react-icons/ri';
import { DeviceItem } from '../../../lib/mockData';
import { IncidenciaItem } from '../../../lib/db';

const statusConfig: Record<string, { bg: string; color: string }> = {
  Reportada:         { bg: 'rgba(239,68,68,0.12)',    color: '#DC2626' },
  'En diagnóstico':  { bg: 'rgba(245,158,11,0.12)', color: '#D97706' },
  'En reparación':   { bg: 'rgba(0,134,255,0.12)',   color: '#0086ff' },
  'Esperando piezas':{ bg: 'rgba(147,51,234,0.12)',  color: '#9333ea' },
  Resuelta:          { bg: 'rgba(16,185,129,0.12)',   color: '#059669' },
};

const severidadConfig: Record<string, { bg: string; color: string }> = {
  Crítica: { bg: 'rgba(239,68,68,0.15)',    color: '#DC2626' },
  Alta:    { bg: 'rgba(249,115,22,0.15)',   color: '#EA580C' },
  Media:   { bg: 'rgba(245,158,11,0.15)',   color: '#D97706' },
  Baja:    { bg: 'rgba(107,114,128,0.15)',  color: '#4B5563' },
};

export default function MantenimientoPage() {
  const [data, setData] = useState<IncidenciaItem[]>([]);
  const [equipos, setEquipos] = useState<DeviceItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<IncidenciaItem | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<DeviceItem | null>(null);
  const [searchCodigo, setSearchCodigo] = useState('');
  const [closingRecord, setClosingRecord] = useState<IncidenciaItem | null>(null);

  const [filterStatus, setFilterStatus] = useState<string>('Todas');

  const fetchData = async () => {
    try {
      const [resInc, resEq] = await Promise.all([
        fetch('/api/mantenimiento'),
        fetch('/api/equipos'),
      ]);
      if (resInc.ok) {
        const jsonInc = await resInc.json();
        if (jsonInc.data) setData(jsonInc.data);
      }
      if (resEq.ok) {
        const jsonEq = await resEq.json();
        if (jsonEq.data) setEquipos(jsonEq.data);
      }
    } catch (err) {
      console.error('Error cargando datos de mantenimiento:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Sync selected device when user types or selects Código PLAi
  const handleCodigoChange = (codigo: string) => {
    setSearchCodigo(codigo);
    const found = equipos.find(
      e => e.inventoryNumber.toLowerCase() === codigo.trim().toLowerCase()
    );
    setSelectedDevice(found || null);
  };

  const abiertas = data.filter(r => r.estado !== 'Resuelta').length;
  const enReparacion = data.filter(r => r.estado === 'En reparación' || r.estado === 'En diagnóstico').length;
  const resueltas = data.filter(r => r.estado === 'Resuelta').length;
  const criticas = data.filter(r => (r.severidad === 'Alta' || r.severidad === 'Crítica') && r.estado !== 'Resuelta').length;

  const filteredData = filterStatus === 'Todas' ? data : data.filter(r => r.estado === filterStatus);

  const handleAdd = () => {
    setEditingItem(null);
    setSelectedDevice(null);
    setSearchCodigo('');
    setIsModalOpen(true);
  };

  const handleEdit = (item: IncidenciaItem) => {
    setEditingItem(item);
    const eq = equipos.find(e => e.inventoryNumber === item.codigoPlai);
    setSelectedDevice(eq || null);
    setSearchCodigo(item.codigoPlai);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    if (editingItem) {
      // Actualizar incidencia
      const nuevoEstado = fd.get('estado') as IncidenciaItem['estado'];
      const acciones = fd.get('accionesRealizadas') as string;

      try {
        const res = await fetch('/api/mantenimiento', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingItem.id,
            estado: nuevoEstado,
            accionesRealizadas: acciones,
          }),
        });

        if (res.ok) {
          setData(prev => prev.map(r => r.id === editingItem.id ? {
            ...r,
            estado: nuevoEstado,
            accionesRealizadas: acciones,
            fechaResolucion: nuevoEstado === 'Resuelta' ? new Date().toISOString().split('T')[0] : r.fechaResolucion,
          } : r));
          setIsModalOpen(false);
          // Refrescar equipos para reflejar cambio de disponibilidad
          fetchData();
        } else {
          alert('Error al actualizar la incidencia');
        }
      } catch (err) {
        console.error('Error al actualizar:', err);
      }
    } else {
      // Registrar nueva incidencia
      if (!selectedDevice) {
        alert('Debes ingresar un Código PLAi válido existente en la base de datos.');
        return;
      }

      const body = {
        codigoPlai: selectedDevice.inventoryNumber,
        origen: fd.get('origen'),
        tipoFalla: fd.get('tipoFalla'),
        severidad: fd.get('severidad'),
        tecnicoResponsable: fd.get('tecnicoResponsable'),
        descripcion: fd.get('descripcion'),
      };

      try {
        const res = await fetch('/api/mantenimiento', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        if (res.ok) {
          const json = await res.json();
          setData(prev => [json.data, ...prev]);
          setIsModalOpen(false);
          fetchData();
        } else {
          const errJson = await res.json();
          alert(errJson.message || 'Error al guardar la incidencia');
        }
      } catch (err) {
        console.error('Error al guardar:', err);
      }
    }
  };

  const columns: Column[] = [
    {
      key: 'folio',
      label: 'Folio / Equipo',
      render: (_, item: IncidenciaItem) => (
        <div>
          <div className="font-heading text-xs font-bold text-plai">{item.folio}</div>
          <div className="text-sm font-semibold text-navy">{item.equipoNombre}</div>
          <div className="text-xs text-plai-muted">Cód. PLAi: <span className="font-mono font-semibold">{item.codigoPlai}</span></div>
        </div>
      ),
    },
    {
      key: 'origen',
      label: 'Origen y Falla',
      render: (_, item: IncidenciaItem) => (
        <div>
          <div className="text-xs font-semibold text-navy">{item.tipoFalla}</div>
          <div className="text-[11px] text-plai-muted">{item.origen}</div>
        </div>
      ),
    },
    {
      key: 'descripcion',
      label: 'Descripción / Diagnóstico',
      render: (v: string, item: IncidenciaItem) => (
        <div className="max-w-[280px]">
          <span className="block text-xs text-gray-800 line-clamp-2">{v}</span>
          {item.accionesRealizadas && (
            <span className="mt-0.5 block text-[11px] text-emerald-700 italic">
              Acción: {item.accionesRealizadas}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'severidad',
      label: 'Severidad',
      render: (v: string) => {
        const cfg = severidadConfig[v] || severidadConfig['Media'];
        return (
          <span className="inline-block rounded-full px-2.5 py-0.5 text-xs font-bold" style={{ backgroundColor: cfg.bg, color: cfg.color }}>
            {v}
          </span>
        );
      },
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (v: string) => {
        const cfg = statusConfig[v] || statusConfig['Reportada'];
        return (
          <span className="inline-block rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap" style={{ backgroundColor: cfg.bg, color: cfg.color }}>
            {v}
          </span>
        );
      },
    },
    {
      key: 'tecnicoResponsable',
      label: 'Técnico',
      render: (v: string) => (
        <span className="text-xs text-navy font-medium">{v || 'Sin asignar'}</span>
      ),
    },
    {
      key: 'fechaReporte',
      label: 'Fecha',
      render: (v: string) => (
        <span className="text-xs text-plai-muted font-mono">{String(v).split('T')[0]}</span>
      ),
    },
  ];

  return (
    <div className="flex animate-pop-in flex-col gap-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="mb-1 font-heading text-3xl font-extrabold text-navy">Mantenimiento e Incidencias</h1>
          <p className="text-sm text-plai-muted md:text-base">
            Control de fallas, reparaciones y vinculación automática con el inventario institucional
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Incidencias Abiertas" value={abiertas} icon={<RiAlertLine />} variant="danger" />
        <StatCard title="En Diagnóstico / Reparación" value={enReparacion} icon={<RiTimeLine />} variant="warning" />
        <StatCard title="Equipos Resueltos" value={resueltas} icon={<RiCheckLine />} variant="success" />
        <StatCard title="Atención Crítica / Alta" value={criticas} icon={<RiToolsLine />} variant="danger" />
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {['Todas', 'Reportada', 'En diagnóstico', 'En reparación', 'Esperando piezas', 'Resuelta'].map(s => (
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
        title={`Bitácora de Incidencias (${filteredData.length})`}
        columns={columns}
        data={filteredData}
        onAdd={handleAdd}
        onEdit={handleEdit}
        addActionLabel="Reportar Incidencia"
      />

      {/* Modal Nueva / Editar Incidencia */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-pop-in" onClick={() => setIsModalOpen(false)}>
          <div className="max-h-[90vh] w-full max-w-[650px] overflow-y-auto rounded-2xl border border-black/[0.08] bg-white p-6 shadow-2xl md:p-8" onClick={e => e.stopPropagation()}>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-heading text-xl font-bold text-navy md:text-2xl">
                {editingItem ? `Actualizar Incidencia: ${editingItem.folio}` : 'Reportar Incidencia de Equipo'}
              </h2>
              <button 
                className="flex size-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900" 
                onClick={() => setIsModalOpen(false)}
              >
                <RiCloseLine className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {!editingItem ? (
                <>
                  {/* Localizador inteligente de Código PLAi (Req 5) */}
                  <div className="rounded-xl border border-plai/30 bg-plai/[0.03] p-4">
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-navy">
                      1. Localizar Dispositivo por Código PLAi o Inventario
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          list="equipos-list"
                          value={searchCodigo}
                          onChange={e => handleCodigoChange(e.target.value)}
                          placeholder="Escribe o selecciona código PLAi (ej. 5151000013-1, PLAI-VR-001)..."
                          className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-800 transition-all focus:border-plai focus:outline-none focus:ring-2 focus:ring-plai/20"
                          required
                        />
                        <datalist id="equipos-list">
                          {equipos.map(eq => (
                            <option key={eq.id} value={eq.inventoryNumber}>
                              {eq.name} ({eq.category}) - {eq.status}
                            </option>
                          ))}
                        </datalist>
                      </div>
                    </div>

                    {/* Auto-fill details card */}
                    {selectedDevice ? (
                      <div className="mt-3 flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50/60 p-3">
                        <div className="text-2xl">{selectedDevice.imageEmoji || '📦'}</div>
                        <div className="flex-1 text-xs">
                          <div className="font-bold text-navy">{selectedDevice.name}</div>
                          <div className="text-gray-600">
                            Marca/Modelo: <span className="font-semibold">{selectedDevice.brand} {selectedDevice.model}</span> · Categoría: <span className="font-semibold">{selectedDevice.category}</span>
                          </div>
                          <div className="text-gray-600">
                            Ubicación: <span className="font-semibold">{selectedDevice.location}</span> · Estado actual: <span className="font-semibold text-plai">{selectedDevice.status}</span>
                          </div>
                        </div>
                        <span className="rounded bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white">
                          Encontrado
                        </span>
                      </div>
                    ) : searchCodigo.trim() ? (
                      <div className="mt-2 text-xs font-semibold text-amber-600">
                        Buscando equipo con código &quot;{searchCodigo}&quot;... Si no aparece en la lista, verifica el número de resguardo patrimonial.
                      </div>
                    ) : null}
                  </div>

                  {/* Datos exclusivos de la incidencia que llena el Admin */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-navy">Origen de la incidencia</label>
                      <select name="origen" className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-800 transition-all focus:border-plai focus:outline-none focus:ring-2 focus:ring-plai/20">
                        <option value="Devolución de Préstamo">Devolución de Préstamo (Bitácora)</option>
                        <option value="Revisión Periódica">Revisión Periódica Preventiva</option>
                        <option value="Reporte de Usuario">Reporte de Usuario / Taller</option>
                        <option value="Falla Operativa">Falla Operativa en Uso</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-navy">Tipo de falla</label>
                      <select name="tipoFalla" className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-800 transition-all focus:border-plai focus:outline-none focus:ring-2 focus:ring-plai/20">
                        <option value="Hardware">Falla de Hardware / Display / Encendido</option>
                        <option value="Software">Software / Firmware / Sistema</option>
                        <option value="Calibración">Pérdida de Calibración / Sensores</option>
                        <option value="Daño Físico">Daño Físico / Carcasa / Óptica</option>
                        <option value="Accesorio Faltante">Accesorio Faltante / Cable Dañado</option>
                        <option value="Limpieza y Óptica">Limpieza Especial de Lentes</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-navy">Severidad / Prioridad</label>
                      <select name="severidad" className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-800 transition-all focus:border-plai focus:outline-none focus:ring-2 focus:ring-plai/20">
                        <option value="Media">Media (No impide arranque pero afecta uso)</option>
                        <option value="Alta">Alta (Equipo inoperable)</option>
                        <option value="Crítica">Crítica (Riesgo eléctrico o daño permanente)</option>
                        <option value="Baja">Baja (Detalle estético menor)</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-navy">Técnico responsable asignado</label>
                      <input 
                        type="text" 
                        name="tecnicoResponsable" 
                        className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-800 transition-all focus:border-plai focus:outline-none focus:ring-2 focus:ring-plai/20" 
                        defaultValue="Técnico de Laboratorio PLAi" 
                        required 
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-navy">Descripción detallada de la incidencia</label>
                    <textarea 
                      name="descripcion" 
                      className="w-full resize-y rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-800 transition-all focus:border-plai focus:outline-none focus:ring-2 focus:ring-plai/20" 
                      rows={3} 
                      required 
                      placeholder="Describe la anomalía detectada, síntomas o piezas involucradas..." 
                    />
                  </div>

                  <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
                    💡 <strong>Aviso automático:</strong> Al guardar la incidencia, el dispositivo pasará de forma automática al estado <strong>&quot;En mantenimiento&quot;</strong> en la base de datos hasta que el técnico concluya la reparación.
                  </div>
                </>
              ) : (
                /* Modo Edición / Resolución */
                <>
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <div className="text-sm font-bold text-navy">{editingItem.equipoNombre}</div>
                    <div className="text-xs text-plai-muted">Código: <span className="font-mono font-semibold">{editingItem.codigoPlai}</span> · Origen: {editingItem.origen}</div>
                    <div className="mt-2 text-xs text-gray-700 bg-white p-2.5 rounded border border-gray-200">
                      <strong>Reporte inicial:</strong> {editingItem.descripcion}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-navy">Estado del Mantenimiento</label>
                      <select name="estado" className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-800 transition-all focus:border-plai focus:outline-none focus:ring-2 focus:ring-plai/20" defaultValue={editingItem.estado}>
                        <option value="Reportada">Reportada</option>
                        <option value="En diagnóstico">En diagnóstico</option>
                        <option value="En reparación">En reparación</option>
                        <option value="Esperando piezas">Esperando piezas</option>
                        <option value="Resuelta">Resuelta (Restaurar a Disponible)</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-navy">Técnico a cargo</label>
                      <input 
                        type="text" 
                        name="tecnicoResponsable" 
                        className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-800" 
                        defaultValue={editingItem.tecnicoResponsable} 
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-navy">Acciones realizadas / Solución técnica</label>
                    <textarea 
                      name="accionesRealizadas" 
                      className="w-full resize-y rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-800 transition-all focus:border-plai focus:outline-none focus:ring-2 focus:ring-plai/20" 
                      rows={3} 
                      defaultValue={editingItem.accionesRealizadas || ''} 
                      placeholder="Indica qué piezas se sustituyeron, pruebas de funcionamiento realizadas, calibración efectuada, etc." 
                    />
                  </div>

                  <div className="rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800">
                    ✅ Si seleccionas <strong>Resuelta</strong>, el sistema liberará automáticamente el equipo marcándolo como <strong>&quot;Disponible&quot;</strong> para nuevos préstamos y reservaciones.
                  </div>
                </>
              )}

              <div className="mt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100" 
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="rounded-lg bg-plai px-5 py-2 text-sm font-semibold text-white shadow-md transition-all hover:bg-plai-dark"
                >
                  {editingItem ? 'Guardar Cambios' : 'Registrar Incidencia'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
