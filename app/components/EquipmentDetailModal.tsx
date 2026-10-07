'use client';
import { useEffect } from 'react';
import styles from './EquipmentDetailModal.module.css';
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

export default function EquipmentDetailModal({ device, onClose, onReserve }: Props) {
  const catColor = categoryColors[device.category] ?? '#a81e71';
  const isAvailable = device.status === 'Disponible';

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = 'unset'; window.removeEventListener('keydown', onKey); };
  }, [onClose]);

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
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        {/* Header gradient by category */}
        <div
          className={styles.header}
          style={{ '--cat-color': catColor } as React.CSSProperties}
        >
          <div className={styles.headerContent}>
            <span className={styles.emoji}>{device.imageEmoji}</span>
            <div>
              <p className={styles.categoryLabel}>{device.category}</p>
              <h2 className={styles.title}>{device.name}</h2>
              <p className={styles.brandModel}>{device.brand} · {device.model}</p>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar">
            <X size={22} />
          </button>
        </div>

        {/* Status + inventory bar */}
        <div className={styles.metaBar}>
          <div className={styles.metaItem}>
            <Tag size={14} />
            <span>{device.inventoryNumber}</span>
          </div>
          <span className={`${styles.statusBadge} ${getStatusCls(device.status)}`}>
            {device.status}
          </span>
        </div>

        {/* Scrollable content */}
        <div className={styles.content}>
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}><Cpu size={16} className={styles.icon} /> Características Técnicas</h3>
            <ul className={styles.list}>
              {device.specs.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}><MapPin size={16} className={styles.icon} /> Ubicación</h3>
            <p className={styles.textValue}>{device.location}</p>
          </div>

          {device.apps && device.apps.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}><Laptop2 size={16} className={styles.icon} /> Aplicaciones</h3>
              <div className={styles.tags}>
                {device.apps.map((a, i) => {
                  const appData = mockApps.find(app => app.name === a);
                  const description = appData?.description || 'Aplicación compatible con este equipo.';
                  return (
                    <span key={i} className={styles.tag}>
                      {a}
                      <div className={styles.infoWrapper}>
                        <Info size={14} className={styles.infoIcon} />
                        <div className={styles.tooltip}>{description}</div>
                      </div>
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}><Box size={16} className={styles.icon} /> Accesorios incluidos</h3>
            <ul className={styles.list}>
              {device.accessories.map((a, i) => <li key={i}>{a}</li>)}
            </ul>
          </div>
        </div>

        {/* Footer actions */}
        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose}>Cerrar</button>
          <button
            className={`${styles.reserveBtn} ${!isAvailable ? styles.reserveDisabled : ''}`}
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
