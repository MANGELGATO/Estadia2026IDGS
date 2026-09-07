import styles from './EquipmentCard.module.css';
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

export default function EquipmentCard({ device, onViewDetails, onReserve }: Props) {
  const catColor = categoryColors[device.category] ?? '#a81e71';
  const isAvailable = device.status === 'Disponible';

  const getStatusCls = (s: string) => {
    switch (s) {
      case 'Disponible': return styles.statusAvailable;
      case 'Reservado': return styles.statusReserved;
      case 'En uso': return styles.statusInUse;
      case 'En mantenimiento': return styles.statusMaintenance;
      default: return styles.statusUnavailable;
    }
  };

  return (
    <div className={styles.card}>
      {/* Image area */}
      <div
        className={styles.imageArea}
        style={{ '--cat-color': catColor } as React.CSSProperties}
      >
        <span className={styles.emoji}>{device.imageEmoji}</span>
        <span className={`${styles.badge} ${getStatusCls(device.status)}`}>
          {device.status}
        </span>
      </div>

      {/* Body */}
      <div className={styles.body}>
        <p className={styles.category}>{device.category}</p>
        <h3 className={styles.name}>{device.name}</h3>
        <p className={styles.meta}>{device.brand} · {device.model}</p>
        <p className={styles.inventory}>ID: {device.inventoryNumber}</p>

        {/* Mini specs preview */}
        <ul className={styles.specPreview}>
          {device.specs.slice(0, 2).map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>

        {/* Location */}
        <p className={styles.location}>📍 {device.location}</p>

        {/* Actions */}
        <div className={styles.actions}>
          <button
            className={styles.detailsBtn}
            onClick={() => onViewDetails(device.id)}
            id={`details-${device.id}`}
          >
            <Info size={14} />
            Ver características
          </button>
          {onReserve && (
            <button
              className={`${styles.reserveBtn} ${!isAvailable ? styles.reserveDisabled : ''}`}
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
