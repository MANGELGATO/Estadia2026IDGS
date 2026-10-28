"use client";

import React, { useState, useEffect } from 'react';
import DataTable, { Column } from '../../components/admin/DataTable';
import StatCard from '../../components/admin/StatCard';
import { 
  RiBox3Line, 
  RiTimeLine, 
  RiCheckDoubleLine, 
  RiCoinsLine, 
  RiToolsLine,
  RiFileTextLine,
  RiSearchLine,
  RiCloseLine
} from 'react-icons/ri';
import { Cotizacion3D } from '../../../lib/db';

const initialCotizaciones: Cotizacion3D[] = [
  {
    id: 'COT-101',
    nombre_solicitante: 'Carlos López',
    email_solicitante: 'carlos.lopez@plai.edu.mx',
    telefono: '33-1234-5678',
    archivo_nombre: 'carcasa_sensor_iot.stl',
    material: 'PLA',
    color_preferido: 'Negro',
    relleno: '20%',
    detalles: 'Pieza para prototipo de validación en IoT',
    estado: 'Pendiente',
    created_at: '2026-10-27 18:05',
  },
  {
    id: 'COT-102',
    nombre_solicitante: 'Ana García',
    email_solicitante: 'ana.garcia@plai.edu.mx',
    telefono: '33-9876-5432',
    archivo_nombre: 'soporte_meta_quest.obj',
    material: 'PETG',
    color_preferido: 'Blanco',
    relleno: '40%',
    detalles: 'Soporte de pared para visores VR del laboratorio',
    estado: 'Cotizada',
    precio_estimado: 180,
    tiempo_estimado_horas: 4.5,
    notas_tecnicas: 'Imprimir con orientación en diagonal y soportes normales',
    created_at: '2026-10-27 17:30',
  },
  {
    id: 'COT-103',
    nombre_solicitante: 'Lucía Ramírez',
    email_solicitante: 'lucia.ramirez@plai.edu.mx',
    telefono: '33-4567-8901',
    archivo_nombre: 'engrane_robotico.3mf',
    material: 'TPU (Flexible)',
    color_preferido: 'Azul',
    relleno: '100%',
    detalles: 'Engrane flexible amortiguador para brazo Dobot',
    estado: 'En impresión',
    precio_estimado: 220,
    tiempo_estimado_horas: 6,
    notas_tecnicas: 'Temperatura de cama 50C, velocidad reducida a 30mm/s',
    created_at: '2026-10-27 16:15',
  },
];

const statusConfig: Record<string, { bg: string; color: string }> = {
  Pendiente:      { bg: 'rgba(245, 158, 11, 0.12)', color: '#D97706' },
  Cotizada:       { bg: 'rgba(59, 130, 246, 0.12)', color: '#2563EB' },
  Aprobada:       { bg: 'rgba(16, 185, 129, 0.12)', color: '#059669' },
  'En impresión': { bg: 'rgba(168, 30, 113, 0.12)', color: '#A81E71' },
  Completada:     { bg: 'rgba(5, 150, 105, 0.12)', color: '#047857' },
  Rechazada:      { bg: 'rgba(239, 68, 68, 0.12)',  color: '#DC2626' },
};

export default function CotizacionesAdminPage() {
  const [data, setData] = useState<Cotizacion3D[]>(initialCotizaciones);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('Todas');
  const [search, setSearch] = useState('');
  
  // Modal de revisión técnica
  const [selectedQuote, setSelectedQuote] = useState<Cotizacion3D | null>(null);
  const [editPrice, setEditPrice] = useState<number | ''>('');
  const [editHours, setEditHours] = useState<number | ''>('');
  const [editStatus, setEditStatus] = useState<Cotizacion3D['estado']>('Pendiente');
  const [editNotes, setEditNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchCotizaciones = () => {
    fetch('/api/cotizaciones')
      .then(res => res.json())
      .then(json => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setData(json.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCotizaciones();
  }, []);

  const total = data.length;
  const pendientes = data.filter(d => d.estado === 'Pendiente').length;
  const enImpresion = data.filter(d => d.estado === 'En impresión').length;
  const cotizadas = data.filter(d => d.estado === 'Cotizada' || d.estado === 'Aprobada').length;

  const filtered = data.filter(item => {
    const matchStatus = filterStatus === 'Todas' || item.estado === filterStatus;
    const q = search.toLowerCase().trim();
    const matchQuery = !q ||
      item.nombre_solicitante.toLowerCase().includes(q) ||
      item.email_solicitante.toLowerCase().includes(q) ||
      item.archivo_nombre.toLowerCase().includes(q) ||
      item.material.toLowerCase().includes(q) ||
      item.id.toLowerCase().includes(q);
    return matchStatus && matchQuery;
  });

  const openReviewModal = (quote: Cotizacion3D) => {
    setSelectedQuote(quote);
    setEditPrice(quote.precio_estimado ?? '');
    setEditHours(quote.tiempo_estimado_horas ?? '');
    setEditStatus(quote.estado);
    setEditNotes(quote.notas_tecnicas ?? '');
  };

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuote) return;
    setSaving(true);

    try {
      const res = await fetch('/api/cotizaciones', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedQuote.id,
          estado: editStatus,
          precio_estimado: editPrice === '' ? null : Number(editPrice),
          tiempo_estimado_horas: editHours === '' ? null : Number(editHours),
          notas_tecnicas: editNotes,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setData(prev => prev.map(q => q.id === selectedQuote.id ? {
          ...q,
          estado: editStatus,
          precio_estimado: editPrice === '' ? null : Number(editPrice),
          tiempo_estimado_horas: editHours === '' ? null : Number(editHours),
          notas_tecnicas: editNotes,
        } : q));
        setSelectedQuote(null);
      }
    } catch {
      alert('Error al guardar la cotización');
    } finally {
      setSaving(false);
    }
  };

  const columns: Column<Cotizacion3D>[] = [
    {
      key: 'id',
      label: 'Folio',
      render: (val: string) => (
        <span className="font-mono text-xs font-bold text-plai">{val}</span>
      ),
    },
    {
      key: 'nombre_solicitante',
      label: 'Solicitante',
      render: (_: unknown, item: Cotizacion3D) => (
        <div>
          <span className="block font-heading font-semibold text-navy">{item.nombre_solicitante}</span>
          <span className="text-xs text-plai-muted">{item.email_solicitante}</span>
          {item.telefono && <span className="block text-[11px] text-gray-400">Tel: {item.telefono}</span>}
        </div>
      ),
    },
    {
      key: 'archivo_nombre',
      label: 'Archivo 3D',
      render: (_: unknown, item: Cotizacion3D) => (
        <div className="flex items-center gap-2">
          <span className="rounded bg-plai/10 p-1.5 text-plai">
            <RiFileTextLine size={16} />
          </span>
          <div>
            <span className="block font-mono text-xs font-semibold text-navy">{item.archivo_nombre}</span>
            <span className="text-[11px] text-plai-muted">{item.material} · {item.relleno || '20%'}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (val: string) => {
        const cfg = statusConfig[val] || { bg: '#eee', color: '#666' };
        return (
          <span
            style={{ backgroundColor: cfg.bg, color: cfg.color }}
            className="inline-block rounded-full px-2.5 py-0.5 text-xs font-bold"
          >
            {val}
          </span>
        );
      },
    },
    {
      key: 'precio_estimado',
      label: 'Cotización ($ MXN)',
      render: (val: number | null) => (
        val !== null && val !== undefined ? (
          <span className="font-mono text-xs font-bold text-emerald-700">
            ${val.toFixed(2)}
          </span>
        ) : (
          <span className="text-xs text-plai-muted italic">Sin cotizar</span>
        )
      ),
    },
    {
      key: 'created_at',
      label: 'Fecha',
      render: (val: string) => (
        <span className="text-xs text-plai-muted">{val ? String(val).slice(0, 10) : 'Hoy'}</span>
      ),
    },
    {
      key: 'acciones',
      label: 'Acciones',
      render: (_: unknown, item: Cotizacion3D) => (
        <button
          onClick={() => openReviewModal(item)}
          className="rounded-lg border border-plai/30 bg-plai/5 px-3 py-1 font-heading text-xs font-bold text-plai transition hover:bg-plai hover:text-white cursor-pointer"
        >
          Gestionar
        </button>
      ),
    },
  ];

  return (
    <div className="flex animate-pop-in flex-col gap-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="mb-1 font-heading text-3xl font-extrabold text-navy">
              Cotizaciones de Impresión 3D
            </h1>
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">
              Manufactura Aditiva PLAi
            </span>
          </div>
          <p className="text-sm text-plai-muted md:text-base">
            Solicitudes de servicio de impresión recibidas a través del portal de Fabricación Digital
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Solicitudes"     value={total}       icon={<RiBox3Line />}        variant="primary" />
        <StatCard title="Pendientes de Cotizar" value={pendientes}  icon={<RiTimeLine />}        variant="warning" />
        <StatCard title="En Impresión"          value={enImpresion} icon={<RiToolsLine />}       variant="primary" />
        <StatCard title="Cotizadas / Listas"    value={cotizadas}   icon={<RiCheckDoubleLine />} variant="success" />
      </div>

      {/* Filtros y Búsqueda */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-black/[0.06] bg-white p-4 shadow-plai-sm">
        {/* Pills de estado */}
        <div className="flex flex-wrap gap-2">
          {['Todas', 'Pendiente', 'Cotizada', 'Aprobada', 'En impresión', 'Completada', 'Rechazada'].map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`rounded-xl px-3.5 py-1.5 font-heading text-xs font-bold transition cursor-pointer ${
                filterStatus === st
                  ? 'bg-plai text-white shadow-plai-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Buscador */}
        <div className="relative min-w-[240px] flex-1 sm:max-w-xs">
          <RiSearchLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por solicitante, archivo o folio..."
            className="w-full rounded-xl border border-black/[0.08] bg-gray-50/50 py-2 pl-9 pr-4 text-xs font-medium text-navy outline-none focus:border-plai focus:bg-white"
          />
        </div>
      </div>

      {/* Tabla */}
      <DataTable
        title="Solicitudes Recibidas"
        columns={columns}
        data={filtered}
      />

      {/* Modal de Revisión y Cotización Técnica */}
      {selectedQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-pop-in">
          <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-black/[0.08] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/75 px-6 py-4">
              <div>
                <h3 className="font-heading text-lg font-bold text-navy">
                  Gestionar Cotización {selectedQuote.id}
                </h3>
                <p className="text-xs text-plai-muted">
                  Solicitante: {selectedQuote.nombre_solicitante} ({selectedQuote.email_solicitante})
                </p>
              </div>
              <button
                onClick={() => setSelectedQuote(null)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-700"
              >
                <RiCloseLine size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveReview} className="flex flex-col gap-4 p-6">
              {/* Resumen del archivo */}
              <div className="rounded-xl border border-gray-200 bg-[#F4F6F9] p-4 text-xs text-gray-700">
                <div className="grid grid-cols-2 gap-2">
                  <div><strong>Archivo:</strong> {selectedQuote.archivo_nombre}</div>
                  <div><strong>Material:</strong> {selectedQuote.material}</div>
                  <div><strong>Relleno:</strong> {selectedQuote.relleno || '20%'}</div>
                  <div><strong>Color preferido:</strong> {selectedQuote.color_preferido || 'Cualquiera'}</div>
                </div>
                {selectedQuote.detalles && (
                  <div className="mt-2 border-t border-gray-200 pt-2">
                    <strong>Notas del solicitante:</strong> {selectedQuote.detalles}
                  </div>
                )}
              </div>

              {/* Formulario de actualización técnica */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="flex flex-col gap-1.5">
                  <label className="font-heading text-xs font-bold text-navy">Estado de la Orden</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as Cotizacion3D['estado'])}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs font-bold text-navy outline-none focus:border-plai"
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="Cotizada">Cotizada</option>
                    <option value="Aprobada">Aprobada</option>
                    <option value="En impresión">En impresión</option>
                    <option value="Completada">Completada</option>
                    <option value="Rechazada">Rechazada</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-heading text-xs font-bold text-navy">Precio ($ MXN)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Ej. 180.00"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs font-mono text-navy outline-none focus:border-plai"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-heading text-xs font-bold text-navy">Tiempo (Horas)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={editHours}
                    onChange={(e) => setEditHours(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Ej. 4.5"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs font-mono text-navy outline-none focus:border-plai"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-heading text-xs font-bold text-navy">Notas Técnicas del Técnico / Slicer</label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Ej. Modelo rebanado en Bambu Studio. Boquilla 0.4mm, 3 paredes perimetrales..."
                  rows={3}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs text-navy outline-none focus:border-plai"
                ></textarea>
              </div>

              <div className="mt-2 flex justify-end gap-3 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={() => setSelectedQuote(null)}
                  className="rounded-xl border border-gray-200 px-4 py-2 font-heading text-xs font-bold text-gray-600 transition hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-plai px-6 py-2 font-heading text-xs font-bold text-white transition hover:bg-[#8e1960] disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
