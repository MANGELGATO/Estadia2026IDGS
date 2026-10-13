'use client';
import { useEffect } from 'react';
import { DeviceItem, mockApps } from '../../lib/mockData';
import { X, MapPin, Box, Cpu, Laptop2, Calendar, Tag, Info } from 'lucide-react';

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
};
const statusFallback = 'bg-[#fee2e2] text-[#b91c1c]';

export default function EquipmentDetailModal({ device, onClose, onReserve }: Props) {
  const catColor = categoryColors[device.category] ?? '#a81e71';
  const isAvailable = device.status === 'Disponible';

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = 'unset'; window.removeEventListener('keydown', onKey); };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(22,46,80,0.55)] p-4 backdrop-blur-[6px]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-[560px] animate-pop-in flex-col overflow-hidden rounded-2xl bg-white shadow-[0_24px_80px_rgba(22,46,80,0.25)]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header gradient by category */}
        <div
          className="flex shrink-0 items-start justify-between border-b-[1.5px] border-black/[0.08] p-6 bg-[linear-gradient(135deg,color-mix(in_srgb,var(--cat-color)_18%,white)_0%,color-mix(in_srgb,var(--cat-color)_6%,white)_100%)]"
          style={{ '--cat-color': catColor } as React.CSSProperties}
        >
          <div className="flex items-center gap-4">
            <span className="text-[2.5rem] leading-none">{device.imageEmoji}</span>
            <div>
              <p className="mb-[0.2rem] font-heading text-[0.7rem] font-extrabold uppercase tracking-[0.06em] text-plai">
                {device.category}
              </p>
              <h2 className="mb-[0.2rem] font-heading text-[1.35rem] font-extrabold leading-[1.2] text-navy">
                {device.name}
              </h2>
              <p className="text-[0.83rem] text-plai-gray">{device.brand} · {device.model}</p>
            </div>
          </div>
          <button
            className="shrink-0 cursor-pointer rounded-full p-[0.4rem] text-plai-gray transition-all duration-[250ms] hover:bg-[#F4F6F9] hover:text-navy"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <X size={22} />
          </button>
        </div>

        {/* Status + inventory bar */}
        <div className="flex shrink-0 items-center justify-between border-b border-black/[0.08] bg-[#F4F6F9] px-6 py-3">
          <div className="flex items-center gap-[0.4rem] text-[0.82rem] text-plai-gray">
            <Tag size={14} />
            <span>{device.inventoryNumber}</span>
          </div>
          <span
            className={`rounded-full px-[0.7rem] py-[0.28rem] font-heading text-[0.68rem] font-bold uppercase tracking-[0.04em] ${statusClasses[device.status] ?? statusFallback}`}
          >
            {device.status}
          </span>
        </div>

        {/* Scrollable content */}
        <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
          <div className="flex flex-col gap-[0.65rem]">
            <h3 className="flex items-center gap-[0.45rem] font-heading text-[0.92rem] font-bold text-navy">
              <Cpu size={16} className="shrink-0 text-plai" /> Características Técnicas
            </h3>
            <ul className="m-0 flex list-none flex-col gap-[0.4rem] p-0">
              {device.specs.map((s, i) => (
                <li
                  key={i}
                  className="relative pl-4 text-[0.88rem] leading-[1.5] text-plai-gray before:absolute before:left-0 before:top-2 before:size-[5px] before:rounded-full before:bg-plai before:content-['']"
                >
                  {s}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-[0.65rem]">
            <h3 className="flex items-center gap-[0.45rem] font-heading text-[0.92rem] font-bold text-navy">
              <MapPin size={16} className="shrink-0 text-plai" /> Ubicación
            </h3>
            <p className="text-[0.9rem] text-plai-gray">{device.location}</p>
          </div>

          {device.apps && device.apps.length > 0 && (
            <div className="flex flex-col gap-[0.65rem]">
              <h3 className="flex items-center gap-[0.45rem] font-heading text-[0.92rem] font-bold text-navy">
                <Laptop2 size={16} className="shrink-0 text-plai" /> Aplicaciones
              </h3>
              <div className="flex flex-wrap gap-2">
                {device.apps.map((a, i) => {
                  const appData = mockApps.find(app => app.name === a);
                  const description = appData?.description || 'Aplicación compatible con este equipo.';
                  return (
                    <span
                      key={i}
                      className="group relative inline-flex items-center gap-[0.35rem] rounded-full bg-[rgba(168,30,113,0.08)] px-3 py-[0.3rem] font-heading text-[0.78rem] font-semibold text-plai"
                    >
                      {a}
                      <div className="relative flex items-center justify-center">
                        <Info size={14} className="cursor-help opacity-60 transition-opacity hover:opacity-100" />
                        <div className="pointer-events-none invisible absolute bottom-[calc(100%+8px)] left-1/2 z-[1000] w-max max-w-[220px] -translate-x-1/2 translate-y-[5px] rounded-md bg-navy px-3 py-[0.6rem] text-center font-body text-[0.75rem] font-medium leading-[1.4] text-white opacity-0 shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 after:absolute after:left-1/2 after:top-full after:-ml-[5px] after:border-[5px] after:border-transparent after:border-t-navy after:content-['']">
                          {description}
                        </div>
                      </div>
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-[0.65rem]">
            <h3 className="flex items-center gap-[0.45rem] font-heading text-[0.92rem] font-bold text-navy">
              <Box size={16} className="shrink-0 text-plai" /> Accesorios incluidos
            </h3>
            <ul className="m-0 flex list-none flex-col gap-[0.4rem] p-0">
              {device.accessories.map((a, i) => (
                <li
                  key={i}
                  className="relative pl-4 text-[0.88rem] leading-[1.5] text-plai-gray before:absolute before:left-0 before:top-2 before:size-[5px] before:rounded-full before:bg-plai before:content-['']"
                >
                  {a}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex shrink-0 justify-end gap-3 border-t-[1.5px] border-black/[0.08] px-6 py-4">
          <button
            className="cursor-pointer rounded-full bg-transparent px-5 py-[0.7rem] font-heading text-[0.9rem] font-semibold text-plai-gray transition-all duration-[250ms] hover:bg-[#F4F6F9] hover:text-navy"
            onClick={onClose}
          >
            Cerrar
          </button>
          <button
            className={`flex items-center gap-[0.45rem] rounded-full px-6 py-[0.7rem] font-heading text-[0.9rem] font-bold text-white transition-all duration-[250ms] ${
              isAvailable
                ? 'cursor-pointer bg-plai hover:bg-navy'
                : 'cursor-not-allowed bg-[#94a3b8]'
            }`}
            onClick={() => { if (isAvailable) { onReserve(device.id); onClose(); } }}
            disabled={!isAvailable}
            id={`modal-reserve-${device.id}`}
          >
            <Calendar size={16} />
            {isAvailable ? 'Solicitar reserva' : 'No disponible'}
          </button>
        </div>
      </div>
    </div>
  );
}
