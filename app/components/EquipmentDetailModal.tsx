'use client';
import { useEffect, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { DeviceItem, mockApps } from '../../lib/mockData';
import { X, MapPin, Box, Cpu, Laptop2, Calendar, Tag, Info, HardDrive, Hash, ShieldCheck, FileText } from 'lucide-react';

function useIsMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

interface Props {
  device: DeviceItem;
  onClose: () => void;
  onReserve: (id: string) => void;
}

const categoryColors: Record<string, string> = {
  'Realidad Virtual': '#7c3aed',
  'Robótica': '#0ea5e9',
  'Fabricación digital': '#f59e0b',
  'Drones': '#10b981',
  'Cómputo': '#a81e71',
};

const statusClasses: Record<string, string> = {
  'Disponible': 'bg-[#dcfce7] text-[#15803d]',
  'Reservado': 'bg-[#fef9c3] text-[#a16207]',
  'En uso': 'bg-[#ffedd5] text-[#c2410c]',
  'En mantenimiento': 'bg-[#f1f5f9] text-[#475569]',
  'Fuera de servicio': 'bg-[#fee2e2] text-[#b91c1c]',
  'No disponible': 'bg-[#fee2e2] text-[#b91c1c]',
};
const statusFallback = 'bg-[#fee2e2] text-[#b91c1c]';

export default function EquipmentDetailModal({ device, onClose, onReserve }: Props) {
  const mounted = useIsMounted();
  const catColor = categoryColors[device.category] ?? '#a81e71';
  const isAvailable = device.status === 'Disponible';

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  if (!mounted) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[rgba(22,46,80,0.6)] p-3 sm:p-5 backdrop-blur-md"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-[620px] animate-pop-in flex-col overflow-hidden rounded-2xl bg-white shadow-[0_24px_80px_rgba(22,46,80,0.35)]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header gradient by category */}
        <div
          className="flex shrink-0 items-start justify-between border-b-[1.5px] border-black/[0.08] p-5 sm:p-6 bg-[linear-gradient(135deg,color-mix(in_srgb,var(--cat-color)_18%,white)_0%,color-mix(in_srgb,var(--cat-color)_6%,white)_100%)]"
          style={{ '--cat-color': catColor } as React.CSSProperties}
        >
          <div className="flex items-center gap-4">
            <span className="text-4xl sm:text-5xl leading-none drop-shadow-sm">{device.imageEmoji}</span>
            <div>
              <p className="mb-1 font-heading text-[0.7rem] font-extrabold uppercase tracking-[0.06em] text-plai">
                {device.category}
              </p>
              <h2 className="font-heading text-lg sm:text-xl font-extrabold leading-tight text-navy">
                {device.name}
              </h2>
              <p className="text-xs sm:text-[0.83rem] text-plai-gray">
                {device.brand} · {device.model}
              </p>
            </div>
          </div>
          <button
            className="shrink-0 cursor-pointer rounded-full p-1.5 text-plai-gray transition-colors hover:bg-black/5 hover:text-navy"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Status + inventory bar */}
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-black/[0.08] bg-[#F4F6F9] px-5 sm:px-6 py-2.5">
          <div className="flex flex-wrap items-center gap-3 text-xs text-plai-gray">
            <span className="inline-flex items-center gap-1 font-semibold text-plai">
              <Tag size={13} />
              Cód. PLAi: {device.inventoryNumber}
            </span>
            {device.serialNumber && (
              <span className="inline-flex items-center gap-1 text-plai-muted">
                <Hash size={13} />
                S/N: {device.serialNumber}
              </span>
            )}
          </div>
          <span
            className={`rounded-full px-2.5 py-0.5 font-heading text-[0.68rem] font-bold uppercase tracking-[0.04em] ${statusClasses[device.status] ?? statusFallback}`}
          >
            {device.status}
          </span>
        </div>

        {/* Scrollable content without horizontal overflow */}
        <div className="flex flex-1 flex-col gap-5 overflow-y-auto overflow-x-hidden p-5 sm:p-6 text-navy">
          {/* Ficha técnica y patrimonial */}
          <div className="rounded-xl border border-black/[0.06] bg-[#F8FAFC] p-3.5">
            <h3 className="mb-2.5 flex items-center gap-1.5 font-heading text-xs font-bold uppercase tracking-wider text-navy">
              <FileText size={14} className="text-plai" /> Datos Patrimoniales y Almacenamiento
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2 text-plai-gray">
                <Tag size={13} className="shrink-0 text-plai-muted" />
                <span><strong>Código PLAi:</strong> {device.inventoryNumber}</span>
              </div>
              <div className="flex items-center gap-2 text-plai-gray">
                <Hash size={13} className="shrink-0 text-plai-muted" />
                <span><strong>No. Serie:</strong> {device.serialNumber || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2 text-plai-gray">
                <HardDrive size={13} className="shrink-0 text-plai-muted" />
                <span><strong>Almacenamiento:</strong> {device.storage || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2 text-plai-gray">
                <ShieldCheck size={13} className="shrink-0 text-plai-muted" />
                <span><strong>Responsable:</strong> {device.responsible || 'Laboratorio PLAi'}</span>
              </div>
              <div className="flex items-center gap-2 text-plai-gray sm:col-span-2">
                <MapPin size={13} className="shrink-0 text-plai-muted" />
                <span><strong>Ubicación:</strong> {device.location}</span>
              </div>
            </div>
          </div>

          {/* Características Técnicas */}
          <div className="flex flex-col gap-2">
            <h3 className="flex items-center gap-1.5 font-heading text-sm font-bold text-navy">
              <Cpu size={16} className="shrink-0 text-plai" /> Características Técnicas
            </h3>
            <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
              {device.specs.map((s, i) => (
                <li
                  key={i}
                  className="relative pl-4 text-xs sm:text-[0.85rem] leading-relaxed text-plai-gray before:absolute before:left-0 before:top-2 before:size-1.5 before:rounded-full before:bg-plai before:content-['']"
                >
                  {s}
                </li>
              ))}
            </ul>
          </div>

          {/* Accesorios incluidos */}
          {device.accessories && device.accessories.length > 0 && (
            <div className="flex flex-col gap-2">
              <h3 className="flex items-center gap-1.5 font-heading text-sm font-bold text-navy">
                <Box size={16} className="shrink-0 text-plai" /> Accesorios incluidos
              </h3>
              <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
                {device.accessories.map((a, i) => (
                  <li
                    key={i}
                    className="relative pl-4 text-xs sm:text-[0.85rem] leading-relaxed text-plai-gray before:absolute before:left-0 before:top-2 before:size-1.5 before:rounded-full before:bg-plai before:content-['']"
                  >
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Aplicaciones */}
          {device.apps && device.apps.length > 0 && (
            <div className="flex flex-col gap-2">
              <h3 className="flex items-center gap-1.5 font-heading text-sm font-bold text-navy">
                <Laptop2 size={16} className="shrink-0 text-plai" /> Software y Aplicaciones Preinstaladas
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {device.apps.map((a, i) => {
                  const appData = mockApps.find(app => app.name === a);
                  const description = appData?.description || 'Aplicación compatible con este equipo.';
                  return (
                    <span
                      key={i}
                      className="group relative inline-flex items-center gap-1 rounded-full bg-plai/10 px-2.5 py-1 font-heading text-xs font-semibold text-plai"
                    >
                      {a}
                      <Info size={12} className="cursor-help opacity-60 transition-opacity hover:opacity-100" />
                      <div className="pointer-events-none invisible absolute bottom-full left-1/2 z-[1000] w-48 -translate-x-1/2 -translate-y-1.5 rounded-lg bg-navy p-2 text-center font-body text-[0.7rem] font-medium leading-snug text-white opacity-0 shadow-lg transition-all duration-150 group-hover:visible group-hover:opacity-100">
                        {description}
                      </div>
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Observaciones si las hay */}
          {device.observations && (
            <div className="rounded-lg border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900">
              <span className="font-bold">Observaciones: </span>
              {device.observations}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex shrink-0 items-center justify-end gap-3 border-t-[1.5px] border-black/[0.08] bg-white px-5 sm:px-6 py-3.5">
          <button
            className="cursor-pointer rounded-full px-4 py-2 font-heading text-xs sm:text-sm font-semibold text-plai-gray transition-colors hover:bg-[#F4F6F9] hover:text-navy"
            onClick={onClose}
          >
            Cerrar
          </button>
          <button
            className={`flex items-center gap-1.5 rounded-full px-5 py-2 font-heading text-xs sm:text-sm font-bold text-white transition-all ${
              isAvailable
                ? 'cursor-pointer bg-plai hover:bg-navy shadow-sm'
                : 'cursor-not-allowed bg-gray-400'
            }`}
            onClick={() => { if (isAvailable) { onReserve(device.id); onClose(); } }}
            disabled={!isAvailable}
            id={`modal-reserve-${device.id}`}
          >
            <Calendar size={15} />
            {isAvailable ? 'Solicitar reserva' : 'No disponible'}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
