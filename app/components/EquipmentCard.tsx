import { DeviceItem } from '../../lib/mockData';
import { Calendar, Info } from 'lucide-react';

interface Props {
  device: DeviceItem;
  onViewDetails: (id: string) => void;
  onReserve?: (id: string) => void;
}

// Color per category
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

const btnBase =
  'flex w-full items-center justify-center gap-[0.4rem] rounded-[0.65rem] p-[0.6rem] font-heading text-[0.82rem] transition-all duration-[250ms]';

export default function EquipmentCard({ device, onViewDetails, onReserve }: Props) {
  const catColor = categoryColors[device.category] ?? '#a81e71';
  const isAvailable = device.status === 'Disponible';

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border-[1.5px] border-black/[0.08] bg-white transition-all duration-[250ms] hover:-translate-y-1 hover:border-[rgba(168,30,113,0.2)] hover:shadow-[0_8px_32px_rgba(27,54,93,0.12)]">
      {/* Image area */}
      <div
        className="relative flex h-[148px] items-center justify-center border-b-[1.5px] border-black/[0.08] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--cat-color)_10%,white)_0%,color-mix(in_srgb,var(--cat-color)_4%,white)_100%)]"
        style={{ '--cat-color': catColor } as React.CSSProperties}
      >
        <span className="text-5xl leading-none drop-shadow-[0_4px_8px_rgba(0,0,0,0.12)] transition-transform duration-300 group-hover:rotate-[-3deg] group-hover:scale-110">
          {device.imageEmoji}
        </span>
        <span
          className={`absolute right-3 top-3 rounded-full px-[0.65rem] py-[0.28rem] font-heading text-[0.65rem] font-bold uppercase tracking-[0.05em] ${statusClasses[device.status] ?? statusFallback}`}
        >
          {device.status}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-[0.2rem] px-5 pb-5 pt-[1.1rem]">
        <p className="mb-[0.1rem] font-heading text-[0.68rem] font-extrabold uppercase tracking-[0.06em] text-plai">{device.category}</p>
        <h3 className="font-heading text-base font-extrabold leading-[1.25] text-navy">{device.name}</h3>
        <p className="text-[0.78rem] font-normal text-plai-gray">{device.brand} · {device.model}</p>
        <p className="mb-2 text-[0.72rem] text-plai-muted">ID: {device.inventoryNumber}</p>

        {/* Mini specs preview */}
        <ul className="my-1 flex list-none flex-col gap-[0.2rem]">
          {device.specs.slice(0, 2).map((s, i) => (
            <li
              key={i}
              className="relative pl-[0.9rem] text-[0.76rem] leading-[1.4] text-plai-gray before:absolute before:left-0 before:top-[0.45rem] before:size-1 before:rounded-full before:bg-plai before:content-['']"
            >
              {s}
            </li>
          ))}
        </ul>

        {/* Location */}
        <p className="mb-3 mt-[0.35rem] text-[0.72rem] text-plai-muted">📍 {device.location}</p>

        {/* Actions */}
        <div className="mt-auto flex flex-col gap-2">
          <button
            className={`${btnBase} border-[1.5px] border-black/[0.08] bg-white font-semibold text-navy hover:border-plai hover:text-plai`}
            onClick={() => onViewDetails(device.id)}
            id={`details-${device.id}`}
          >
            <Info size={14} />
            Ver características
          </button>
          {onReserve && (
            <button
              className={`${btnBase} font-bold text-white ${
                isAvailable
                  ? 'bg-plai hover:bg-navy'
                  : 'cursor-not-allowed bg-[#94a3b8] opacity-60'
              }`}
              onClick={() => isAvailable && onReserve(device.id)}
              disabled={!isAvailable}
              title={isAvailable ? 'Solicitar reserva' : 'No disponible para reserva'}
              id={`reserve-${device.id}`}
            >
              <Calendar size={14} />
              {isAvailable ? 'Reservar' : 'No disponible'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
