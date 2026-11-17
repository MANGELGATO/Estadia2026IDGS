'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { DeviceItem } from '../../lib/mockData';
import { validateTimeRange } from '../../lib/reservation';
import { 
  X, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  User, 
  Mail, 
  Building2, 
  FileText, 
  Image as ImageIcon, 
  ShieldCheck, 
  Download, 
  AlertCircle 
} from 'lucide-react';
import PrivacyPolicyModal from './PrivacyPolicyModal';

interface Props {
  device: DeviceItem;
  onClose: () => void;
}

export default function ReservationForm({ device, onClose }: Props) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [submitted, setSubmitted] = useState(false);
  const [submittedFolio, setSubmittedFolio] = useState('');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userInstitution, setUserInstitution] = useState('Universidad de Guadalajara (CUAAD)');
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

  // Auto-llenado de datos personales cuando el usuario está logueado
  useEffect(() => {
    if (session?.user) {
      if (session.user.name) setUserName(session.user.name);
      if (session.user.email) setUserEmail(session.user.email);
    }
  }, [session]);

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
          userName: userName.trim() || session?.user?.name || 'Usuario Institucional',
          userEmail: userEmail.trim() || session?.user?.email || 'user@plai.edu.mx',
          userInstitution: userInstitution.trim() || 'Comunidad PLAi',
          userId: session?.user?.id || 'usr-standard-01',
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

      setSubmittedFolio(data.data?.reserva?.folio || data.data?.id || `RES-${Date.now().toString().slice(-4)}`);
      setSubmitted(true);
    } catch {
      setServerError('No se pudo establecer conexión con el servidor. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 1. PANTALLA: Si el usuario NO está logueado, solicitar inicio de sesión para vincular sus datos
  if (status === 'unauthenticated' || (!session && status !== 'loading')) {
    const callbackUrl = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/';
    return (
      <div
        className="fixed inset-0 z-[110] flex items-center justify-center bg-[rgba(22,46,80,0.65)] p-4 backdrop-blur-[6px] animate-pop-in"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
      >
        <div
          className="relative flex w-full max-w-[460px] flex-col overflow-hidden rounded-3xl bg-white p-7 text-center shadow-[0_24px_80px_rgba(22,46,80,0.3)] border border-black/[0.08]"
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-navy transition-colors"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
          
          <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-plai/10 text-plai">
            <User size={30} />
          </div>

          <span className="text-[11px] font-bold uppercase tracking-wider text-plai">Acceso Institucional Requerido</span>
          <h2 className="mt-1 font-heading text-xl font-extrabold text-navy">
            Inicia Sesión para Reservar
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-plai-gray leading-relaxed">
            Para solicitar el préstamo de <strong>{device.name}</strong>, es necesario ingresar con tu cuenta institucional de PLAi. Tus datos personales se vincularán automáticamente a tu expediente y a la solicitud en el panel administrativo.
          </p>

          <div className="my-4 rounded-xl border border-blue-100 bg-blue-50/70 p-3 text-left text-xs text-blue-900">
            <p className="font-bold mb-1 flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-blue-600" /> Cuenta de demostración de usuario:
            </p>
            <p className="font-mono text-[11px] text-blue-800">user@plai.edu.mx · Contraseña: 123user</p>
          </div>

          <div className="mt-2 flex flex-col sm:flex-row gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-full border border-gray-200 py-2.5 font-heading text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`)}
              className="w-full rounded-full bg-[#ed8d1b] py-2.5 font-heading text-xs font-bold text-white shadow-md hover:bg-[#d67a10] transition-all"
            >
              Iniciar Sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. PANTALLA: Solicitud confirmada exitosamente
  if (submitted) {
    return (
      <div
        className="fixed inset-0 z-[110] flex items-center justify-center bg-[rgba(22,46,80,0.55)] p-4 backdrop-blur-[6px]"
        onClick={onClose}
      >
        <div
          className="relative flex max-h-[92vh] w-full max-w-[520px] animate-pop-in flex-col overflow-hidden rounded-3xl bg-white shadow-[0_24px_80px_rgba(22,46,80,0.25)] p-8 text-center"
          onClick={e => e.stopPropagation()}
        >
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 mb-2">
            <CheckCircle2 size={36} />
          </div>
          <span className="font-mono text-xs font-bold text-plai uppercase tracking-wider">Folio Oficial: {submittedFolio}</span>
          <h2 className="mt-1 font-heading text-2xl font-extrabold text-navy">¡Solicitud Registrada con Éxito!</h2>
          <p className="mt-2 text-sm leading-relaxed text-plai-gray">
            Tu solicitud de préstamo para <strong>{device.name}</strong> ha sido vinculada a tu cuenta (<strong>{userEmail || session?.user?.email}</strong>) y remitida al área administrativa para su revisión y asignación.
          </p>

          <div className="my-4 rounded-xl border border-gray-100 bg-[#F4F6F9] p-3 text-left text-xs">
            <p className="text-gray-700"><strong>Fecha solicitada:</strong> {date} ({startTime} a {endTime})</p>
            <p className="text-gray-700 mt-1"><strong>Motivo:</strong> {activity}</p>
            <p className="text-gray-700 mt-1"><strong>Estatus actual:</strong> <span className="font-bold text-amber-600">Pendiente de Aprobación</span></p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <button
              className="w-full rounded-full border border-gray-200 py-2.5 font-heading text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={onClose}
            >
              Cerrar
            </button>
            <button
              className="w-full rounded-full bg-[#ed8d1b] py-2.5 font-heading text-xs font-bold text-white shadow-md hover:bg-[#d67a10] transition-all"
              onClick={() => router.push('/usuario/prestamos')}
            >
              Ver en Mis Préstamos →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. PANTALLA: Formulario con Auto-llenado de datos personales
  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-[rgba(22,46,80,0.55)] p-4 backdrop-blur-[6px]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative flex max-h-[92vh] w-full max-w-[540px] animate-pop-in flex-col overflow-hidden rounded-2xl bg-white shadow-[0_24px_80px_rgba(22,46,80,0.25)]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex shrink-0 items-start justify-between border-b-[1.5px] border-black/[0.08] p-6 bg-[linear-gradient(135deg,rgba(0,134,255,0.08)_0%,transparent_100%)]">
          <div>
            <p className="mb-[0.2rem] font-heading text-[0.68rem] font-extrabold uppercase tracking-[0.06em] text-plai">
              Formulario Institucional de Reserva
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

          {/* Tarjeta de Solicitante Identificado con Sesión */}
          {session?.user && (
            <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white font-heading font-extrabold text-sm shadow-xs">
                {session.user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-heading text-xs font-bold text-navy truncate">
                    {session.user.name}
                  </span>
                  <span className="rounded bg-emerald-600 px-1.5 py-0.2 text-[9px] font-bold text-white uppercase tracking-wider">
                    Usuario Verificado
                  </span>
                </div>
                <p className="font-mono text-[11px] text-gray-600 truncate">{session.user.email}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <div className="flex flex-1 flex-col gap-[0.45rem]">
              <label className="flex items-center gap-[0.4rem] font-heading text-[0.83rem] font-semibold text-navy [&>svg]:text-plai">
                <User size={14} /> Nombre del Solicitante *
              </label>
              <input
                type="text"
                className="w-full rounded-[0.65rem] border-[1.5px] border-black/[0.08] bg-gray-50/70 px-4 py-[0.7rem] font-body text-[0.88rem] text-navy outline-none transition-all duration-[250ms] focus:border-plai focus:bg-white"
                placeholder="Nombre completo"
                required
                id="res-user"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </div>

            <div className="flex flex-1 flex-col gap-[0.45rem]">
              <label className="flex items-center gap-[0.4rem] font-heading text-[0.83rem] font-semibold text-navy [&>svg]:text-plai">
                <Mail size={14} /> Correo Electrónico *
              </label>
              <input
                type="email"
                className="w-full rounded-[0.65rem] border-[1.5px] border-black/[0.08] bg-gray-50/70 px-4 py-[0.7rem] font-body text-[0.88rem] text-navy outline-none transition-all duration-[250ms] focus:border-plai focus:bg-white"
                placeholder="user@plai.edu.mx"
                required
                id="res-email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-[0.45rem]">
            <label className="flex items-center gap-[0.4rem] font-heading text-[0.83rem] font-semibold text-navy [&>svg]:text-plai">
              <Building2 size={14} /> Institución o Dependencia
            </label>
            <input
              type="text"
              className="w-full rounded-[0.65rem] border-[1.5px] border-black/[0.08] bg-white px-4 py-[0.7rem] font-body text-[0.88rem] text-navy outline-none transition-all duration-[250ms] placeholder:text-plai-muted focus:border-plai focus:ring-2 focus:ring-plai/10"
              placeholder="Ej. Universidad de Guadalajara (CUAAD), Startup Hub CCD"
              id="res-institution"
              value={userInstitution}
              onChange={(e) => setUserInstitution(e.target.value)}
            />
          </div>

          <div className="flex flex-1 flex-col gap-[0.45rem]">
            <label className="flex items-center gap-[0.4rem] font-heading text-[0.83rem] font-semibold text-navy [&>svg]:text-plai">
              <Calendar size={14} /> Fecha de reserva *
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
                <Clock size={14} /> Hora de inicio *
              </label>
              <input 
                type="time" 
                className="w-full rounded-[0.65rem] border-[1.5px] border-black/[0.08] bg-white px-4 py-[0.7rem] font-body text-[0.9rem] text-navy outline-none transition-all duration-[250ms] focus:border-plai focus:ring-2 focus:ring-plai/10" 
                required 
                id="res-start"
                value={startTime}
                onChange={(e) => {
                  setStartTime(e.target.value);
                  setEndTime('');
                  setTimeError(null);
                }}
              />
            </div>
            <div className="flex flex-1 flex-col gap-[0.45rem]">
              <label className="flex items-center gap-[0.4rem] font-heading text-[0.83rem] font-semibold text-navy [&>svg]:text-plai">
                <Clock size={14} /> Hora de fin *
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
              <FileText size={14} /> Actividad o motivo *
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
                />
              </div>
              <div className="flex flex-1 flex-col gap-2 rounded-[0.65rem] border-[1.5px] border-dashed border-black/[0.12] bg-[#F4F6F9] p-4 text-center transition-all duration-[250ms] hover:border-plai hover:bg-plai/[0.02]">
                <span className="text-[0.8rem] font-semibold text-plai-gray">Parte Trasera</span>
                <input
                  type="file"
                  className="cursor-pointer text-[0.75rem] text-plai-gray file:mr-2 file:cursor-pointer file:rounded-full file:border file:border-black/[0.08] file:bg-white file:px-[0.8rem] file:py-[0.4rem] file:text-[0.75rem] file:font-semibold file:text-navy file:transition-all hover:file:border-plai-gray hover:file:bg-[#F4F6F9]"
                  accept="image/*"
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
              className="flex cursor-pointer items-center gap-2 rounded-full bg-[#ed8d1b] px-6 py-[0.7rem] font-heading text-[0.9rem] font-bold text-white transition-all duration-[250ms] hover:bg-[#d67a10] disabled:opacity-60 disabled:cursor-not-allowed shadow-md"
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
