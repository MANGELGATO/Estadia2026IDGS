'use client';
import { useEffect, useState } from 'react';
import styles from './ReservationForm.module.css';
import { DeviceItem } from '../../lib/mockData';
import { X, CheckCircle2, Calendar, Clock, User, FileText } from 'lucide-react';

interface Props {
  device: DeviceItem;
  onClose: () => void;
}

export default function ReservationForm({ device, onClose }: Props) {
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = 'unset'; window.removeEventListener('keydown', onKey); };
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.modal} onClick={e => e.stopPropagation()}>
          <div className={styles.successState}>
            <CheckCircle2 size={56} className={styles.successIcon} />
            <h2 className={styles.successTitle}>¡Solicitud enviada!</h2>
            <p className={styles.successText}>
              Tu solicitud de reserva para <strong>{device.name}</strong> ha sido registrada.
              El equipo PLAi te contactará para confirmar.
            </p>
            <button className={styles.doneBtn} onClick={onClose}>Entendido</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <p className={styles.headerLabel}>Formulario de Reserva</p>
            <h2 className={styles.title}>{device.name}</h2>
            <p className={styles.subtitle}>{device.brand} · {device.model} · ID: {device.inventoryNumber}</p>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar">
            <X size={22} />
          </button>
        </div>

        {/* Form */}
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              <User size={14} /> Usuario / Institución solicitante
            </label>
            <input
              type="text"
              className={styles.input}
              placeholder="Nombre completo o Institución"
              required
              id="res-user"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              <Calendar size={14} /> Fecha de reserva
            </label>
            <input type="date" className={styles.input} required id="res-date" />
          </div>

          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <Clock size={14} /> Hora de inicio
              </label>
              <input type="time" className={styles.input} required id="res-start" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <Clock size={14} /> Hora de fin
              </label>
              <input type="time" className={styles.input} required id="res-end" />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              <FileText size={14} /> Actividad o motivo
            </label>
            <input
              type="text"
              className={styles.input}
              placeholder="Ej. Taller de innovación, clase de robótica..."
              required
              id="res-activity"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Observaciones (opcional)</label>
            <textarea
              className={styles.textarea}
              rows={3}
              placeholder="Requerimientos especiales, número de participantes, etc."
              id="res-notes"
            />
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancelar</button>
            <button type="submit" className={styles.submitBtn} id="res-submit">
              <CheckCircle2 size={16} /> Enviar solicitud
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
