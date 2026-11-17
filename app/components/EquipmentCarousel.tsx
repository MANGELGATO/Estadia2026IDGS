'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Cpu, HardDrive, MapPin, Calendar } from 'lucide-react';
import { DeviceItem, mockDevices } from '../../lib/mockData';
import ReservationForm from './ReservationForm';

const PREVIEW_COUNT = 8;

const categoryColors: Record<string, string> = {
  'Realidad Virtual': '#1e5ca7',
  'Robótica': '#0ea5e9',
  'Fabricación digital': '#ed8d1b',
  'Drones': '#10b981',
  'Cómputo': '#0086ff',
};

const categorySlugMap: Record<string, string> = {
  'Realidad Virtual': 'realidad-virtual',
  'Robótica': 'robotica',
  'Cómputo': 'computo-multimedia',
  'Drones': 'drones',
  'Fabricación digital': 'fabricacion-digital',
};

const statusClasses: Record<string, string> = {
  'Disponible': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Reservado': 'bg-amber-50 text-amber-700 border-amber-200',
  'En uso': 'bg-orange-50 text-orange-700 border-orange-200',
  'En mantenimiento': 'bg-slate-100 text-slate-700 border-slate-200',
  'Fuera de servicio': 'bg-rose-50 text-rose-700 border-rose-200',
  'No disponible': 'bg-rose-50 text-rose-700 border-rose-200',
};

export default function EquipmentCarousel() {
  const [devices, setDevices] = useState<DeviceItem[]>(mockDevices);
  const [selectedReserveId, setSelectedReserveId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/equipos')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setDevices(json.data);
        }
      })
      .catch(() => {});
  }, []);

  const preview = devices.slice(0, PREVIEW_COUNT);

  return (
    <div className="border-t border-dashed border-black/[0.08] bg-[#F4F6F9] py-14">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-plai/10 px-3 py-1 text-xs font-bold text-plai">
              <Cpu size={14} />
              Infraestructura Tecnológica
            </div>
            <h2 className="mb-1 font-heading text-[1.5rem] font-extrabold text-navy">
              Equipos y Recursos Destacados
            </h2>
            <p className="text-sm text-plai-muted">
              Visores de realidad virtual, impresión 3D, robótica y estaciones de alto rendimiento
            </p>
          </div>
          <Link
            href="/equipos"
            className="mt-1 inline-flex shrink-0 items-center gap-[0.4rem] whitespace-nowrap font-heading text-[0.88rem] font-bold text-plai transition-all duration-[250ms] hover:gap-[0.6rem] hover:text-navy"
          >
            Ver catálogo completo ({devices.length}) <ArrowRight size={15} />
          </Link>
        </div>

        {/* Carrusel horizontal de tarjetas de equipos */}
        <div className="flex items-stretch gap-5 overflow-x-auto px-1 pb-5 pt-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {preview.map((device) => {
            const catColor = categoryColors[device.category] || '#0086ff';
            const catSlug = categorySlugMap[device.category] || 'computo-multimedia';
            const statusBadge = statusClasses[device.status] || 'bg-slate-100 text-slate-700 border-slate-200';

            return (
              <div
                key={device.id}
                className="w-[280px] shrink-0 rounded-2xl border border-black/[0.08] bg-white transition-all duration-[250ms] hover:-translate-y-1 hover:border-plai/40 hover:shadow-[0_12px_32px_rgba(27,54,93,0.08)] flex flex-col overflow-hidden"
              >
                {/* Visual Header / Foto */}
                <div className="relative flex h-36 w-full items-center justify-center bg-[#F8FAFC] border-b border-black/[0.06] p-4">
                  {device.imageUrl ? (
                    <img
                      src={device.imageUrl}
                      alt={device.name}
                      className="max-h-28 w-auto max-w-full object-contain transition-transform duration-300 hover:scale-105"
                    />
                  ) : (
                    <span className="text-5xl">{device.imageEmoji || '📦'}</span>
                  )}
                  <span
                    className="absolute right-3 top-3 inline-block rounded-full px-2.5 py-0.5 text-[0.7rem] font-bold uppercase tracking-wider text-white shadow-xs"
                    style={{ backgroundColor: catColor }}
                  >
                    {device.category}
                  </span>
                </div>

                {/* Contenido de la tarjeta */}
                <div className="flex flex-1 flex-col gap-2.5 p-5">
                  <div>
                    <h3 className="font-heading text-base font-extrabold leading-tight text-navy line-clamp-1">
                      {device.name}
                    </h3>
                    <p className="mt-0.5 text-xs text-plai-muted truncate">
                      {device.brand} &bull; {device.model}
                    </p>
                  </div>

                  {device.storage && device.storage !== 'N/A' && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                      <HardDrive size={13} className="text-plai shrink-0" />
                      <span className="truncate">{device.storage}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 text-xs text-plai-muted">
                    <MapPin size={13} className="text-slate-400 shrink-0" />
                    <span className="truncate">{device.location}</span>
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-3 border-t border-black/[0.05]">
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[0.7rem] font-bold uppercase tracking-wide ${statusBadge}`}>
                      {device.status}
                    </span>
                    <div className="flex items-center gap-2.5">
                      {device.status === 'Disponible' && (
                        <button
                          type="button"
                          onClick={() => setSelectedReserveId(device.id)}
                          className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-plai px-2.5 py-1 text-[0.7rem] font-bold text-white hover:bg-navy transition-colors"
                        >
                          <Calendar size={11} /> Reservar
                        </button>
                      )}
                      <Link
                        href={`/categoria/${catSlug}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-plai hover:text-navy transition-colors"
                      >
                        Detalles <ArrowRight size={13} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex justify-center">
          <Link
            href="/equipos"
            className="inline-flex items-center gap-2 rounded-full border border-black/[0.1] bg-white px-6 py-2.5 font-heading text-xs font-bold text-navy shadow-2xs hover:border-plai hover:bg-plai/5 hover:text-plai transition-all"
          >
            Explorar todos los equipos disponibles ({devices.length}) <ArrowRight size={14} />
          </Link>
        </div>

        {selectedReserveId && devices.find(d => d.id === selectedReserveId) && (
          <ReservationForm
            device={devices.find(d => d.id === selectedReserveId)!}
            onClose={() => setSelectedReserveId(null)}
          />
        )}
      </div>
    </div>
  );
}
