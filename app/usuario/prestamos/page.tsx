"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  RiFileListLine, 
  RiAddCircleLine, 
  RiEyeLine, 
  RiSearchLine, 
  RiCloseLine,
  RiCheckLine,
  RiTimeLine
} from 'react-icons/ri';
import { ReservacionItem } from '../../../lib/db';

export default function PrestamosPage() {
  const [reservaciones, setReservaciones] = useState<ReservacionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todas');
  const [selectedItem, setSelectedItem] = useState<ReservacionItem | null>(null);

  useEffect(() => {
    fetch('/api/reservaciones')
      .then(res => res.json())
      .then(json => {
        if (json.data && Array.isArray(json.data)) {
          setReservaciones(json.data);
        }
      })
      .catch(err => console.error('Error cargando préstamos:', err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = reservaciones.filter(r => {
    const matchStatus = statusFilter === 'Todas' || r.estado === statusFilter;
    const matchSearch = 
      r.folio?.toLowerCase().includes(search.toLowerCase()) ||
      r.actividad?.toLowerCase().includes(search.toLowerCase()) ||
      r.categoriaId?.toLowerCase().includes(search.toLowerCase()) ||
      (r.codigoPlaiAsignado && r.codigoPlaiAsignado.toLowerCase().includes(search.toLowerCase()));
    return matchStatus && matchSearch;
  });

  return (
    <div className="flex animate-pop-in flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="mb-1 font-heading text-3xl font-extrabold text-navy">Mis Préstamos y Solicitudes</h1>
          <p className="text-sm text-plai-muted md:text-base">
            Monitoreo en tiempo real del estado de tus solicitudes de equipo tecnológico
          </p>
        </div>
        <Link
          href="/#reservar"
          className="inline-flex items-center gap-2 rounded-xl bg-plai px-5 py-2.5 font-heading text-xs font-bold text-white shadow-plai-sm transition-all hover:bg-navy hover:-translate-y-0.5"
        >
          <RiAddCircleLine className="text-base" /> Nueva Solicitud
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-black/[0.06] bg-white p-4 shadow-plai-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {['Todas', 'Aprobada', 'Pendiente', 'En uso', 'Completada', 'Rechazada'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-all ${
                statusFilter === s
                  ? 'bg-plai text-white shadow-sm'
                  : 'border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <RiSearchLine className="absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por folio o equipo..."
            className="w-full rounded-lg border border-gray-200 bg-gray-50/60 pl-9 pr-3 py-1.5 text-xs text-gray-800 focus:border-plai focus:bg-white focus:outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-black/[0.08] bg-white shadow-plai-sm">
        <table className="w-full min-w-[700px] border-collapse text-left">
          <thead>
            <tr className="border-b border-gray-100 bg-[#F4F6F9]">
              <th className="px-6 py-4 font-heading text-xs font-bold uppercase tracking-wider text-plai-muted">Folio / Solicitud</th>
              <th className="px-6 py-4 font-heading text-xs font-bold uppercase tracking-wider text-plai-muted">Categoría / Equipo</th>
              <th className="px-6 py-4 font-heading text-xs font-bold uppercase tracking-wider text-plai-muted">Fecha y Horario</th>
              <th className="px-6 py-4 font-heading text-xs font-bold uppercase tracking-wider text-plai-muted">Estado</th>
              <th className="px-6 py-4 text-center font-heading text-xs font-bold uppercase tracking-wider text-plai-muted">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {filtered.map(item => {
              const statusBadge = 
                item.estado === 'Aprobada' || item.estado === 'En uso' ? 'bg-emerald-100 text-emerald-800' :
                item.estado === 'Pendiente' ? 'bg-amber-100 text-amber-800' :
                item.estado === 'Completada' ? 'bg-gray-100 text-gray-700' :
                'bg-rose-100 text-rose-800';

              return (
                <tr key={item.id} className="transition-colors hover:bg-gray-50/60">
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs font-bold text-plai">{item.folio}</span>
                    <div className="font-semibold text-navy">{item.actividad}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium capitalize text-navy">{item.categoriaId.replace('-', ' ')}</div>
                    {item.codigoPlaiAsignado ? (
                      <span className="inline-block mt-0.5 rounded bg-blue-50 px-2 py-0.5 text-[11px] font-mono font-bold text-blue-700">
                        Cód: {item.codigoPlaiAsignado}
                      </span>
                    ) : (
                      <span className="text-[11px] italic text-amber-600">Por asignar por técnico</span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-gray-700">
                    <div>{item.fechaUso}</div>
                    <div className="text-plai-muted">{item.horaInicio} - {item.horaFin}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${statusBadge}`}>
                      {item.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => setSelectedItem(item)}
                      className="inline-flex items-center gap-1 rounded-md bg-plai/10 px-3 py-1.5 text-xs font-bold text-plai transition hover:bg-plai hover:text-white"
                    >
                      <RiEyeLine /> Ver Ficha
                    </button>
                  </td>
                </tr>
              );
            })}

            {filtered.length === 0 && !loading && (
              <tr>
                <td colSpan={5} className="py-12 text-center text-xs text-plai-muted">
                  No se encontraron préstamos que coincidan con la búsqueda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Detalle */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-pop-in" onClick={() => setSelectedItem(null)}>
          <div className="w-full max-w-[560px] rounded-2xl border border-black/[0.08] bg-white p-6 shadow-2xl md:p-8" onClick={e => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-heading text-lg font-bold text-navy">Ficha de Solicitud</h3>
                <span className="font-mono text-xs font-bold text-plai">{selectedItem.folio}</span>
              </div>
              <button onClick={() => setSelectedItem(null)} className="text-gray-400 hover:text-gray-700">
                <RiCloseLine className="text-2xl" />
              </button>
            </div>

            <div className="my-4 grid grid-cols-1 gap-3 rounded-xl border border-black/[0.04] bg-gray-50 p-4 text-xs sm:grid-cols-2">
              <div>
                <span className="font-bold text-plai-muted uppercase">Actividad:</span>
                <p className="font-semibold text-navy text-sm">{selectedItem.actividad}</p>
              </div>
              <div>
                <span className="font-bold text-plai-muted uppercase">Estado:</span>
                <p className="font-bold text-emerald-700">{selectedItem.estado}</p>
              </div>
              <div>
                <span className="font-bold text-plai-muted uppercase">Categoría:</span>
                <p className="font-semibold text-navy capitalize">{selectedItem.categoriaId.replace('-', ' ')}</p>
              </div>
              <div>
                <span className="font-bold text-plai-muted uppercase">Dispositivo Asignado:</span>
                <p className="font-mono font-bold text-plai">{selectedItem.codigoPlaiAsignado || 'En proceso de asignación'}</p>
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
                <span className="font-bold text-plai-muted uppercase">Accesorios autorizados:</span>
                <p className="font-semibold text-gray-800">{selectedItem.accesoriosIncluidos || 'Equipo con cables originales'}</p>
              </div>
              <div className="sm:col-span-2">
                <span className="font-bold text-plai-muted uppercase">Condición de entrega:</span>
                <p className="font-semibold text-emerald-700">{selectedItem.condicionSalida || 'Excelente'}</p>
              </div>
              {selectedItem.observacionesAdmin && (
                <div className="sm:col-span-2">
                  <span className="font-bold text-plai-muted uppercase">Indicaciones Técnicas:</span>
                  <p className="italic text-gray-700">{selectedItem.observacionesAdmin}</p>
                </div>
              )}
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setSelectedItem(null)}
                className="rounded-lg bg-[#1e5ca7] px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-navy"
              >
                Cerrar Ficha
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
