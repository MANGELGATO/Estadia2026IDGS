'use client';
import { useEffect, useState } from 'react';
import { DeviceItem } from '../../lib/mockData';
import { validateTimeRange } from '../../lib/reservation';
import { X, CheckCircle2, Calendar, Clock, User, FileText, Image as ImageIcon, ShieldCheck, Download } from 'lucide-react';

interface Props {
  device: DeviceItem;
  onClose: () => void;
}

export default function ReservationForm({ device, onClose }: Props) {
  const [submitted, setSubmitted] = useState(false);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEnd = e.target.value;
    if (startTime && newEnd) {
      const result = validateTimeRange(startTime, newEnd);
      if (!result.valid) {
        alert(
          result.reason === 'too-long'
            ? "El tiempo máximo de préstamo es de 2 horas. Por favor selecciona un horario menor."
            : "La hora de fin debe ser mayor a la hora de inicio."
        );
        setEndTime('');
        return;
      }
    }
    setEndTime(newEnd);
  };

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
                  href="#"
                  className="flex flex-1 items-center justify-center gap-2 rounded-[0.65rem] border border-[rgba(37,99,235,0.2)] bg-[rgba(37,99,235,0.1)] px-4 py-3 text-[0.85rem] font-semibold text-[#2563eb] transition-all duration-[250ms] hover:border-[rgba(37,99,235,0.3)] hover:bg-[rgba(37,99,235,0.15)]"
                >
                  <Download size={16} /> Descargar Plantilla
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
            />
          </div>

          <div className="mt-2 flex items-center gap-[0.6rem] rounded-lg border border-plai/10 bg-plai/[0.04] p-2">
            <input type="checkbox" id="res-privacy" required className="size-[1.1rem] cursor-pointer accent-plai" />
            <label htmlFor="res-privacy" className="flex cursor-pointer items-center gap-[0.4rem] text-[0.85rem] text-navy [&>svg]:text-plai">
              <ShieldCheck size={14} /> Acepto el <a href="#" className="text-plai underline">Aviso de Privacidad</a>
            </label>
          </div>

          <div className="flex justify-end gap-3 border-t border-black/[0.08] pt-2">
            <button
              type="button"
              className="cursor-pointer rounded-full bg-transparent px-5 py-[0.7rem] font-heading text-[0.9rem] font-semibold text-plai-gray transition-all duration-[250ms] hover:bg-[#F4F6F9] hover:text-navy"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex cursor-pointer items-center gap-2 rounded-full bg-plai px-6 py-[0.7rem] font-heading text-[0.9rem] font-bold text-white transition-all duration-[250ms] hover:bg-navy"
              id="res-submit"
            >
              <CheckCircle2 size={16} /> Enviar solicitud
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
