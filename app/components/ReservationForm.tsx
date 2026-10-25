'use client';
import { useEffect, useState } from 'react';
import { DeviceItem } from '../../lib/mockData';
import { validateTimeRange } from '../../lib/reservation';
import { X, CheckCircle2, Calendar, Clock, User, FileText, Image as ImageIcon, ShieldCheck, Download, AlertCircle } from 'lucide-react';
import PrivacyPolicyModal from './PrivacyPolicyModal';

interface Props {
  device: DeviceItem;
  onClose: () => void;
}

export default function ReservationForm({ device, onClose }: Props) {
  const [submitted, setSubmitted] = useState(false);
  const [userName, setUserName] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [activity, setActivity] = useState('');
  const [notes, setNotes] = useState('');
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [timeError, setTimeError] = useState<string | null>(null);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEnd = e.target.value;
    if (startTime && newEnd) {
      const result = validateTimeRange(startTime, newEnd);
      if (!result.valid) {
        setTimeError(
          result.reason === 'too-long'
            ? "El tiempo máximo de préstamo es de 2 horas. Por favor selecciona un horario menor."
            : "La hora de fin debe ser mayor a la hora de inicio."
        );
        setEndTime('');
        return;
      }
    }
    setTimeError(null);
    setEndTime(newEnd);
  };

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = 'unset'; window.removeEventListener('keydown', onKey); };
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setServerError(null);

    try {
      const res = await fetch('/api/reservas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId: device.id,
          userName,
          date,
          startTime,
          endTime,
          activity,
          notes,
          acceptPrivacy,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setServerError(data.message || 'Error al validar la reservación en servidor');
        setIsSubmitting(false);
        return;
      }

      setSubmitted(true);
    } catch {
      setServerError('No se pudo establecer conexión con el servidor. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div
        className="fixed inset-0 z-[110] flex items-center justify-center bg-[rgba(22,46,80,0.55)] p-4 backdrop-blur-[6px]"
        onClick={onClose}
      >
        <div
          className="relative flex max-h-[92vh] w-full max-w-[520px] animate-pop-in flex-col overflow-hidden rounded-2xl bg-white shadow-[0_24px_80px_rgba(22,46,80,0.25)]"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex animate-pop-in flex-col items-center gap-4 px-8 py-14 text-center">
            <CheckCircle2 size={56} className="text-[#15803d]" />
            <h2 className="font-heading text-2xl font-extrabold text-navy">¡Solicitud enviada!</h2>
            <p className="max-w-[340px] text-[0.95rem] leading-[1.7] text-plai-gray">
              Tu solicitud de reserva para <strong>{device.name}</strong> ha sido registrada.
              El equipo PLAi te contactará para confirmar.
            </p>
            <button
              className="mt-2 cursor-pointer rounded-full bg-plai px-8 py-3 font-heading text-[0.95rem] font-bold text-white transition-all duration-[250ms] hover:bg-navy"
              onClick={onClose}
            >
              Entendido
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-[rgba(22,46,80,0.55)] p-4 backdrop-blur-[6px]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative flex max-h-[92vh] w-full max-w-[520px] animate-pop-in flex-col overflow-hidden rounded-2xl bg-white shadow-[0_24px_80px_rgba(22,46,80,0.25)]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex shrink-0 items-start justify-between border-b-[1.5px] border-black/[0.08] p-6 bg-[linear-gradient(135deg,rgba(168,30,113,0.06)_0%,transparent_100%)]">
          <div>
            <p className="mb-[0.2rem] font-heading text-[0.68rem] font-extrabold uppercase tracking-[0.06em] text-plai">
              Formulario de Reserva
            </p>
            <h2 className="mb-[0.2rem] font-heading text-[1.25rem] font-extrabold text-navy">{device.name}</h2>
            <p className="text-[0.8rem] text-plai-gray">{device.brand} · {device.model} · ID: {device.inventoryNumber}</p>
          </div>
          <button
            className="shrink-0 cursor-pointer rounded-full p-[0.4rem] text-plai-gray transition-all duration-[250ms] hover:bg-[#F4F6F9] hover:text-navy"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <X size={22} />
          </button>
        </div>

        {/* Form */}
        <form className="flex flex-1 flex-col gap-[1.1rem] overflow-y-auto p-6" onSubmit={handleSubmit}>
          {serverError && (
            <div
              role="alert"
              className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700 animate-pop-in"
            >
              <AlertCircle size={16} className="shrink-0 text-red-600" />
              <span>{serverError}</span>
            </div>
          )}

          <div className="flex flex-1 flex-col gap-[0.45rem]">
            <label className="flex items-center gap-[0.4rem] font-heading text-[0.83rem] font-semibold text-navy [&>svg]:text-plai">
              <User size={14} /> Usuario / Institución solicitante
            </label>
            <input
              type="text"
              className="w-full rounded-[0.65rem] border-[1.5px] border-black/[0.08] bg-white px-4 py-[0.7rem] font-body text-[0.9rem] text-navy outline-none transition-all duration-[250ms] placeholder:text-plai-muted focus:border-plai focus:ring-2 focus:ring-plai/10"
              placeholder="Nombre completo o Institución"
              required
              id="res-user"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
          </div>

          <div className="flex flex-1 flex-col gap-[0.45rem]">
            <label className="flex items-center gap-[0.4rem] font-heading text-[0.83rem] font-semibold text-navy [&>svg]:text-plai">
              <Calendar size={14} /> Fecha de reserva
            </label>
            <input
              type="date"
              className="w-full rounded-[0.65rem] border-[1.5px] border-black/[0.08] bg-white px-4 py-[0.7rem] font-body text-[0.9rem] text-navy outline-none transition-all duration-[250ms] focus:border-plai focus:ring-2 focus:ring-plai/10"
              required
              id="res-date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-1 flex-col gap-[0.45rem]">
              <label className="flex items-center gap-[0.4rem] font-heading text-[0.83rem] font-semibold text-navy [&>svg]:text-plai">
                <Clock size={14} /> Hora de inicio
              </label>
              <input 
                type="time" 
                className="w-full rounded-[0.65rem] border-[1.5px] border-black/[0.08] bg-white px-4 py-[0.7rem] font-body text-[0.9rem] text-navy outline-none transition-all duration-[250ms] focus:border-plai focus:ring-2 focus:ring-plai/10" 
                required 
                id="res-start"
                value={startTime}
                onChange={(e) => {
                  setStartTime(e.target.value);
                  setEndTime(''); // Reset end time when start changes to enforce re-validation
                  setTimeError(null);
                }}
              />
            </div>
            <div className="flex flex-1 flex-col gap-[0.45rem]">
              <label className="flex items-center gap-[0.4rem] font-heading text-[0.83rem] font-semibold text-navy [&>svg]:text-plai">
                <Clock size={14} /> Hora de fin
              </label>
              <input 
                type="time" 
                className="w-full rounded-[0.65rem] border-[1.5px] border-black/[0.08] bg-white px-4 py-[0.7rem] font-body text-[0.9rem] text-navy outline-none transition-all duration-[250ms] focus:border-plai focus:ring-2 focus:ring-plai/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-60" 
                required 
                id="res-end"
                value={endTime}
                onChange={handleEndTimeChange}
                disabled={!startTime}
              />
            </div>
            {timeError && (
              <div
                role="alert"
                className="sm:col-span-2 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 animate-pop-in"
              >
                <AlertCircle size={16} className="shrink-0 text-red-600" />
                <span>{timeError}</span>
              </div>
            )}
          </div>

          <div className="flex flex-1 flex-col gap-[0.45rem]">
            <label className="flex items-center gap-[0.4rem] font-heading text-[0.83rem] font-semibold text-navy [&>svg]:text-plai">
              <FileText size={14} /> Actividad o motivo
            </label>
            <input
              type="text"
              className="w-full rounded-[0.65rem] border-[1.5px] border-black/[0.08] bg-white px-4 py-[0.7rem] font-body text-[0.9rem] text-navy outline-none transition-all duration-[250ms] placeholder:text-plai-muted focus:border-plai focus:ring-2 focus:ring-plai/10"
              placeholder="Ej. Taller de innovación, clase de robótica..."
              required
              id="res-activity"
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
            />
          </div>

          <div className="flex flex-1 flex-col gap-[0.45rem]">
            <label className="flex items-center gap-[0.4rem] font-heading text-[0.83rem] font-semibold text-navy [&>svg]:text-plai">
              <ImageIcon size={14} /> Identificación Oficial (INE)
            </label>
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="flex flex-1 flex-col gap-2 rounded-[0.65rem] border-[1.5px] border-dashed border-black/[0.12] bg-[#F4F6F9] p-4 text-center transition-all duration-[250ms] hover:border-plai hover:bg-plai/[0.02]">
                <span className="text-[0.8rem] font-semibold text-plai-gray">Parte Frontal</span>
                <input
                  type="file"
                  className="cursor-pointer text-[0.75rem] text-plai-gray file:mr-2 file:cursor-pointer file:rounded-full file:border file:border-black/[0.08] file:bg-white file:px-[0.8rem] file:py-[0.4rem] file:text-[0.75rem] file:font-semibold file:text-navy file:transition-all hover:file:border-plai-gray hover:file:bg-[#F4F6F9]"
                  accept="image/*"
                  required
                />
              </div>
              <div className="flex flex-1 flex-col gap-2 rounded-[0.65rem] border-[1.5px] border-dashed border-black/[0.12] bg-[#F4F6F9] p-4 text-center transition-all duration-[250ms] hover:border-plai hover:bg-plai/[0.02]">
                <span className="text-[0.8rem] font-semibold text-plai-gray">Parte Trasera</span>
                <input
                  type="file"
                  className="cursor-pointer text-[0.75rem] text-plai-gray file:mr-2 file:cursor-pointer file:rounded-full file:border file:border-black/[0.08] file:bg-white file:px-[0.8rem] file:py-[0.4rem] file:text-[0.75rem] file:font-semibold file:text-navy file:transition-all hover:file:border-plai-gray hover:file:bg-[#F4F6F9]"
                  accept="image/*"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-[0.45rem]">
            <label className="flex items-center gap-[0.4rem] font-heading text-[0.83rem] font-semibold text-navy [&>svg]:text-plai">
              <FileText size={14} /> Carta Responsiva
            </label>
            <div className="flex flex-col gap-4 rounded-[0.65rem] border border-black/[0.08] bg-[#F4F6F9] p-5">
              <p className="text-[0.85rem] leading-[1.5] text-plai-gray">
                Descarga la plantilla, fírmala y sube el documento escaneado (PDF o Imagen).
              </p>
              <div className="flex flex-col items-stretch gap-4 sm:flex-row">
                <a
                  href="/documentos/PLAi_Carta_Responsiva_Equipos.pdf"
                  download="PLAi_Carta_Responsiva_Equipos.pdf"
                  className="flex flex-1 items-center justify-center gap-2 rounded-[0.65rem] border border-[rgba(37,99,235,0.2)] bg-[rgba(37,99,235,0.1)] px-4 py-3 text-[0.85rem] font-semibold text-[#2563eb] transition-all duration-[250ms] hover:border-[rgba(37,99,235,0.3)] hover:bg-[rgba(37,99,235,0.15)]"
                >
                  <Download size={16} /> Descargar Plantilla Oficial
                </a>
                <div className="flex flex-[2] flex-col gap-2 rounded-[0.65rem] border-[1.5px] border-dashed border-black/[0.12] bg-white p-3 text-center transition-all duration-[250ms] hover:border-plai">
                  <span className="text-[0.8rem] font-semibold text-plai-gray">Subir Carta Firmada</span>
                  <input
                    type="file"
                    className="cursor-pointer text-[0.75rem] text-plai-gray file:mr-2 file:cursor-pointer file:rounded-full file:border file:border-black/[0.08] file:bg-[#F4F6F9] file:px-[0.8rem] file:py-[0.4rem] file:text-[0.75rem] file:font-semibold file:text-navy file:transition-all hover:file:border-plai-gray hover:file:bg-white"
                    accept=".pdf,image/*"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-[0.45rem]">
            <label className="font-heading text-[0.83rem] font-semibold text-navy">Observaciones (opcional)</label>
            <textarea
              className="w-full resize-none rounded-[0.65rem] border-[1.5px] border-black/[0.08] bg-white px-4 py-[0.7rem] font-body text-[0.9rem] text-navy outline-none transition-all duration-[250ms] placeholder:text-plai-muted focus:border-plai focus:ring-2 focus:ring-plai/10"
              rows={3}
              placeholder="Requerimientos especiales, número de participantes, etc."
              id="res-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="mt-2 flex items-center gap-[0.6rem] rounded-lg border border-plai/10 bg-plai/[0.04] p-2">
            <input
              type="checkbox"
              id="res-privacy"
              required
              checked={acceptPrivacy}
              onChange={(e) => setAcceptPrivacy(e.target.checked)}
              className="size-[1.1rem] cursor-pointer accent-plai"
            />
            <label htmlFor="res-privacy" className="flex cursor-pointer items-center gap-[0.4rem] text-[0.85rem] text-navy [&>svg]:text-plai">
              <ShieldCheck size={14} /> Acepto el{' '}
              <button
                type="button"
                onClick={() => setIsPrivacyOpen(true)}
                className="cursor-pointer font-semibold text-plai underline hover:text-navy transition-colors"
              >
                Aviso de Privacidad
              </button>
            </label>
          </div>

          <div className="flex justify-end gap-3 border-t border-black/[0.08] pt-2">
            <button
              type="button"
              className="cursor-pointer rounded-full bg-transparent px-5 py-[0.7rem] font-heading text-[0.9rem] font-semibold text-plai-gray transition-all duration-[250ms] hover:bg-[#F4F6F9] hover:text-navy"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex cursor-pointer items-center gap-2 rounded-full bg-plai px-6 py-[0.7rem] font-heading text-[0.9rem] font-bold text-white transition-all duration-[250ms] hover:bg-navy disabled:opacity-60 disabled:cursor-not-allowed"
              id="res-submit"
            >
              <CheckCircle2 size={16} /> {isSubmitting ? 'Validando...' : 'Enviar solicitud'}
            </button>
          </div>
        </form>
      </div>

      <PrivacyPolicyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
    </div>
  );
}
