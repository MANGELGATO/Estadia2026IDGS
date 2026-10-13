"use client";

import React, { useState } from 'react';
import { RiSaveLine, RiAddLine, RiDeleteBinLine } from 'react-icons/ri';

type Config = {
  labName: string;
  labLocation: string;
  adminEmail: string;
  maintenanceAlertDays: number;
  allowPublicView: boolean;
  requireApproval: boolean;
  maxReservationHours: number;
  maxAdvanceDays: number;
};

const defaultCategorias = [
  'Realidad Virtual', 'Robótica', 'Fabricación Digital',
  'Drones', 'Cómputo', 'Escaneo 3D', 'Electrónica',
];

const defaultEstados = [
  { nombre: 'Disponible',       color: '#059669' },
  { nombre: 'Reservado',        color: '#4F46E5' },
  { nombre: 'En uso',           color: '#3B82F6' },
  { nombre: 'En mantenimiento', color: '#D97706' },
  { nombre: 'Fuera de servicio', color: '#DC2626' },
  { nombre: 'No disponible',    color: '#6B7280' },
];

export default function ConfiguracionPage() {
  const [config, setConfig] = useState<Config>({
    labName: 'PLAI — Laboratorio de Innovación, Robótica y Tecnologías Inmersivas',
    labLocation: 'Edificio A, Planta Baja',
    adminEmail: 'admin@plai.edu.mx',
    maintenanceAlertDays: 30,
    allowPublicView: true,
    requireApproval: true,
    maxReservationHours: 4,
    maxAdvanceDays: 14,
  });
  const [categorias, setCategorias] = useState<string[]>(defaultCategorias);
  const [newCategoria, setNewCategoria] = useState('');
  const [savedMsg, setSavedMsg] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMsg('✅ Configuración guardada correctamente');
    setTimeout(() => setSavedMsg(''), 3000);
  };

  const addCategoria = () => {
    if (newCategoria.trim() && !categorias.includes(newCategoria.trim())) {
      setCategorias([...categorias, newCategoria.trim()]);
      setNewCategoria('');
    }
  };

  const removeCategoria = (cat: string) => {
    setCategorias(categorias.filter(c => c !== cat));
  };

  return (
    <div className="flex animate-pop-in flex-col">
      <div className="mb-8">
        <h1 className="mb-1 font-heading text-3xl font-extrabold text-navy">Configuración</h1>
        <p className="text-sm text-plai-muted md:text-base">Ajusta los parámetros generales del sistema PLAi</p>
      </div>

      <form onSubmit={handleSave}>
        {/* General */}
        <div className="mb-6 rounded-2xl border border-black/[0.06] bg-white p-6 shadow-plai-sm md:p-7">
          <h2 className="mb-5 border-b border-gray-100 pb-3 font-heading text-base font-bold text-navy">🏢 Información General</h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-navy">Nombre del Laboratorio</label>
              <input
                type="text"
                className="w-full rounded-lg border border-gray-300 bg-gray-50/50 px-3.5 py-2.5 text-sm text-gray-800 transition-all focus:border-plai focus:bg-white focus:outline-none focus:ring-2 focus:ring-plai/20"
                value={config.labName}
                onChange={e => setConfig({ ...config, labName: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-navy">Ubicación</label>
              <input
                type="text"
                className="w-full rounded-lg border border-gray-300 bg-gray-50/50 px-3.5 py-2.5 text-sm text-gray-800 transition-all focus:border-plai focus:bg-white focus:outline-none focus:ring-2 focus:ring-plai/20"
                value={config.labLocation}
                onChange={e => setConfig({ ...config, labLocation: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-navy">Correo Administrativo</label>
              <input
                type="email"
                className="w-full rounded-lg border border-gray-300 bg-gray-50/50 px-3.5 py-2.5 text-sm text-gray-800 transition-all focus:border-plai focus:bg-white focus:outline-none focus:ring-2 focus:ring-plai/20"
                value={config.adminEmail}
                onChange={e => setConfig({ ...config, adminEmail: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Reservations */}
        <div className="mb-6 rounded-2xl border border-black/[0.06] bg-white p-6 shadow-plai-sm md:p-7">
          <h2 className="mb-5 border-b border-gray-100 pb-3 font-heading text-base font-bold text-navy">📅 Configuración de Reservaciones</h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-navy">Máx. horas por reservación</label>
              <input
                type="number"
                className="w-full rounded-lg border border-gray-300 bg-gray-50/50 px-3.5 py-2.5 text-sm text-gray-800 transition-all focus:border-plai focus:bg-white focus:outline-none focus:ring-2 focus:ring-plai/20"
                min={1} max={24}
                value={config.maxReservationHours}
                onChange={e => setConfig({ ...config, maxReservationHours: Number(e.target.value) })}
              />
              <span className="text-xs text-plai-muted">Límite en horas para una sola reservación</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-navy">Máx. días de anticipación</label>
              <input
                type="number"
                className="w-full rounded-lg border border-gray-300 bg-gray-50/50 px-3.5 py-2.5 text-sm text-gray-800 transition-all focus:border-plai focus:bg-white focus:outline-none focus:ring-2 focus:ring-plai/20"
                min={1} max={90}
                value={config.maxAdvanceDays}
                onChange={e => setConfig({ ...config, maxAdvanceDays: Number(e.target.value) })}
              />
              <span className="text-xs text-plai-muted">¿Con cuántos días de anticipación se puede reservar?</span>
            </div>
          </div>
          <div className="mt-5 flex flex-col gap-5">
            <label className="flex cursor-pointer items-start justify-between gap-4">
              <div className="flex flex-1 flex-col gap-0.5">
                <span className="text-xs font-bold uppercase tracking-wider text-navy">Requerir aprobación manual</span>
                <span className="text-xs text-plai-muted">Si está activo, las reservaciones requieren ser aprobadas por un admin antes de confirmarse</span>
              </div>
              <div
                className={`relative mt-0.5 h-[26px] w-12 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ${config.requireApproval ? 'bg-plai' : 'bg-gray-300'}`}
                onClick={() => setConfig({ ...config, requireApproval: !config.requireApproval })}
                role="switch"
                aria-checked={config.requireApproval}
              >
                <div className={`absolute top-[3px] left-[3px] size-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${config.requireApproval ? 'translate-x-[22px]' : ''}`} />
              </div>
            </label>
            <label className="flex cursor-pointer items-start justify-between gap-4">
              <div className="flex flex-1 flex-col gap-0.5">
                <span className="text-xs font-bold uppercase tracking-wider text-navy">Permitir vista pública del inventario</span>
                <span className="text-xs text-plai-muted">Los usuarios no autenticados pueden ver el catálogo de recursos</span>
              </div>
              <div
                className={`relative mt-0.5 h-[26px] w-12 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ${config.allowPublicView ? 'bg-plai' : 'bg-gray-300'}`}
                onClick={() => setConfig({ ...config, allowPublicView: !config.allowPublicView })}
                role="switch"
                aria-checked={config.allowPublicView}
              >
                <div className={`absolute top-[3px] left-[3px] size-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${config.allowPublicView ? 'translate-x-[22px]' : ''}`} />
              </div>
            </label>
          </div>
        </div>

        {/* Maintenance */}
        <div className="mb-6 rounded-2xl border border-black/[0.06] bg-white p-6 shadow-plai-sm md:p-7">
          <h2 className="mb-5 border-b border-gray-100 pb-3 font-heading text-base font-bold text-navy">🔧 Alertas de Mantenimiento</h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-navy">Alerta preventiva (días)</label>
              <input
                type="number"
                className="w-full rounded-lg border border-gray-300 bg-gray-50/50 px-3.5 py-2.5 text-sm text-gray-800 transition-all focus:border-plai focus:bg-white focus:outline-none focus:ring-2 focus:ring-plai/20"
                min={7} max={365}
                value={config.maintenanceAlertDays}
                onChange={e => setConfig({ ...config, maintenanceAlertDays: Number(e.target.value) })}
              />
              <span className="text-xs text-plai-muted">Número de días antes del vencimiento para generar una alerta de mantenimiento</span>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="mb-6 rounded-2xl border border-black/[0.06] bg-white p-6 shadow-plai-sm md:p-7">
          <h2 className="mb-5 border-b border-gray-100 pb-3 font-heading text-base font-bold text-navy">🏷️ Categorías de Recursos</h2>
          <div className="mb-4 flex flex-wrap gap-2">
            {categorias.map(cat => (
              <div key={cat} className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(168,30,113,0.2)] bg-[rgba(168,30,113,0.08)] px-3 py-1 text-xs font-semibold text-plai">
                <span>{cat}</span>
                <button type="button" className="cursor-pointer text-sm text-plai/60 transition-opacity hover:text-plai" onClick={() => removeCategoria(cat)}>
                  <RiDeleteBinLine />
                </button>
              </div>
            ))}
          </div>
          <div className="flex max-w-md items-center gap-3">
            <input
              type="text"
              className="flex-1 rounded-lg border border-gray-300 bg-gray-50/50 px-3.5 py-2.5 text-sm text-gray-800 transition-all focus:border-plai focus:bg-white focus:outline-none focus:ring-2 focus:ring-plai/20"
              placeholder="Nueva categoría..."
              value={newCategoria}
              onChange={e => setNewCategoria(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCategoria())}
            />
            <button type="button" className="flex cursor-pointer items-center gap-1 rounded-lg border border-[rgba(168,30,113,0.25)] bg-[rgba(168,30,113,0.1)] px-4 py-2.5 font-heading text-xs font-semibold text-plai whitespace-nowrap transition-all hover:bg-plai hover:text-white" onClick={addCategoria}>
              <RiAddLine /> Agregar
            </button>
          </div>
        </div>

        {/* Equipment States */}
        <div className="mb-6 rounded-2xl border border-black/[0.06] bg-white p-6 shadow-plai-sm md:p-7">
          <h2 className="mb-2 font-heading text-base font-bold text-navy">🚦 Estados de Equipos</h2>
          <p className="mb-4 text-xs text-plai-muted">Estados predefinidos del sistema para clasificar el inventario</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
            {defaultEstados.map(e => (
              <div key={e.nombre} className="flex items-center gap-2.5 rounded-lg border border-black/[0.04] bg-gray-50 p-2.5 text-xs text-navy">
                <span className="size-2.5 shrink-0 rounded-full" style={{ background: e.color }} />
                <span className="font-medium">{e.nombre}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Save */}
        <div className="sticky bottom-4 z-20 mt-2 flex items-center justify-end gap-4 rounded-2xl border border-black/[0.08] bg-white/95 p-4 shadow-xl backdrop-blur-md md:p-5">
          {savedMsg && <span className="animate-pop-in text-sm font-semibold text-emerald-600">{savedMsg}</span>}
          <button type="submit" className="flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-plai to-[#c42585] px-6 py-2.5 font-heading text-sm font-bold text-white shadow-[0_4px_12px_rgba(168,30,113,0.35)] transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(168,30,113,0.4)]">
            <RiSaveLine /> Guardar Configuración
          </button>
        </div>
      </form>
    </div>
  );
}
