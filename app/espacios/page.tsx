'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Users, Calendar, Building, ShieldCheck, CheckCircle2, Clock, User } from 'lucide-react';
import PrivacyPolicyModal from '../components/PrivacyPolicyModal';

const espaciosMock = [
  {
    id: 'auditorio',
    name: 'Auditorio Principal',
    description: 'Espacio ideal para conferencias, presentaciones y eventos corporativos con capacidad para 150 personas.',
    capacity: 150,
    features: ['Proyector 4K', 'Sistema de audio profesional', 'Iluminación escénica', 'Wi-Fi de alta velocidad'],
    color: '#0086ff'
  },
  {
    id: 'aula-robotica',
    name: 'Aula de Robótica',
    description: 'Laboratorio equipado para prácticas de automatización, electrónica y programación de brazos robóticos.',
    capacity: 25,
    features: ['Estaciones de trabajo equipadas', 'Kits de electrónica', 'Brazos robóticos DOBOT', 'Pizarrones interactivos'],
    color: '#0ea5e9'
  },
  {
    id: 'workshop-vr',
    name: 'Workshop de VR',
    description: 'Sala inmersiva para desarrollo y prueba de experiencias de realidad virtual, aumentada y mixta.',
    capacity: 15,
    features: ['PC Gamers de alto rendimiento', 'Visores Meta Quest 3', 'Sensores de movimiento', 'Pantallas de monitoreo'],
    color: '#7c3aed'
  },
  {
    id: 'sala-juntas',
    name: 'Sala de Juntas Creativa',
    description: 'Un entorno diseñado para sesiones de lluvia de ideas y planeación estratégica.',
    capacity: 10,
    features: ['Pantalla de 75"', 'Pintarrón de cristal', 'Mobiliario ergonómico', 'Coffee break opcional'],
    color: '#F59E0B'
  }
];

export default function EspaciosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedEspacio, setSelectedEspacio] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [folio, setFolio] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  const activeEspacio = espaciosMock.find(e => e.id === selectedEspacio);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!activeEspacio) return;
    setErrorMsg(null);
    setIsSubmitting(true);

    const fd = new FormData(e.currentTarget);
    const payload = {
      espacioId: activeEspacio.id,
      nombreSolicitante: (fd.get('nombreSolicitante') as string)?.trim() || session?.user?.name || 'Solicitante PLAi',
      email: (fd.get('correo') as string)?.trim() || session?.user?.email || 'user@plai.edu.mx',
      telefono: (fd.get('telefono') as string)?.trim() || '33 1410 1620',
      fecha: fd.get('fecha') as string,
      hora: fd.get('horaInicio') as string,
      proposito: (fd.get('proposito') as string)?.trim(),
      acceptPrivacy: true,
    };

    try {
      const res = await fetch('/api/solicitudes-espacios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        const firstErr = json.errors ? Object.values(json.errors).flat()[0] : null;
        setErrorMsg((firstErr as string) || json.message || 'No se pudo procesar la solicitud.');
        setIsSubmitting(false);
        return;
      }
      setFolio(json.data?.id || '');
      setSubmitted(true);
    } catch {
      setErrorMsg('Error de conexión con el servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeReserve = () => {
    setSelectedEspacio(null);
    setSubmitted(false);
    setFolio('');
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] pb-20">
      <div className="bg-gradient-to-br from-navy to-[#0f172a] px-8 pb-16 pt-24 text-center text-white">
        <div className="mx-auto max-w-[800px]">
          <h1 className="mb-4 font-heading text-4xl font-extrabold md:text-[2.5rem]">Reserva de Espacios</h1>
          <p className="text-[1.1rem] leading-[1.6] text-slate-300">
            Contamos con instalaciones de vanguardia diseñadas para fomentar la innovación, el aprendizaje y la colaboración.
          </p>
        </div>
      </div>

      <div className="relative z-10 mx-auto -mt-12 max-w-[1200px] px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {espaciosMock.map((espacio) => (
            <div
              key={espacio.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-black/[0.08] bg-white shadow-[0_10px_40px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_50px_rgba(0,0,0,0.12)]"
            >
              <div className="flex h-[120px] items-center justify-center text-white" style={{ backgroundColor: espacio.color }}>
                <Building className="size-12 opacity-90" />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="mb-2 font-heading text-xl font-bold text-navy">{espacio.name}</h3>
                <p className="mb-4 flex-1 text-[0.9rem] leading-[1.5] text-plai-gray">{espacio.description}</p>
                <div className="mb-4">
                  <span className="inline-flex items-center gap-[0.4rem] rounded-full bg-[#F4F6F9] px-[0.8rem] py-[0.4rem] font-heading text-[0.8rem] font-semibold text-plai-muted">
                    <Users size={14} /> Hasta {espacio.capacity} personas
                  </span>
                </div>
                <ul className="mb-6 flex list-none flex-col gap-[0.4rem] p-0">
                  {espacio.features.slice(0, 3).map((feat, i) => (
                    <li key={i} className="flex items-center gap-[0.4rem] text-[0.85rem] text-plai-gray">
                      <CheckCircle2 size={12} className="shrink-0" style={{ color: espacio.color }} /> {feat}
                    </li>
                  ))}
                  {espacio.features.length > 3 && (
                    <li className="flex items-center gap-[0.4rem] text-[0.85rem] text-plai-gray">
                      <CheckCircle2 size={12} className="shrink-0" style={{ color: espacio.color }} /> y más...
                    </li>
                  )}
                </ul>
                <button 
                  className="w-full cursor-pointer rounded-xl py-3 font-heading text-base font-bold text-white transition-opacity duration-200 hover:opacity-90" 
                  style={{ backgroundColor: espacio.color }}
                  onClick={() => setSelectedEspacio(espacio.id)}
                >
                  Solicitar Reserva
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {activeEspacio && status === 'unauthenticated' && (
        <div className="fixed inset-0 z-[1000] flex animate-pop-in items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={closeReserve}>
          <div className="relative w-full max-w-[460px] rounded-3xl bg-white p-7 text-center shadow-2xl border border-black/[0.08]" onClick={e => e.stopPropagation()}>
            <button className="absolute right-5 top-5 cursor-pointer text-xl text-plai-gray hover:text-navy" onClick={closeReserve}>&times;</button>
            <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-plai/10 text-plai">
              <User size={30} />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-plai">Acceso Institucional Requerido</span>
            <h2 className="mt-1 font-heading text-xl font-extrabold text-navy">Inicia Sesión para Reservar Espacio</h2>
            <p className="mt-2 text-xs sm:text-sm text-plai-gray leading-relaxed">
              Para solicitar el uso de <strong>{activeEspacio.name}</strong>, inicia sesión con tu cuenta institucional. Tus datos se autocompletarán y la solicitud quedará vinculada a tu portal y al panel administrativo.
            </p>
            <div className="my-4 rounded-xl border border-blue-100 bg-blue-50/70 p-3 text-left text-xs text-blue-900">
              <p className="font-bold mb-1">Cuenta de demostración:</p>
              <p className="font-mono text-[11px] text-blue-800">user@plai.edu.mx · Contraseña: 123user</p>
            </div>
            <div className="mt-3 flex gap-2.5">
              <button type="button" onClick={closeReserve} className="w-full rounded-full border border-gray-200 py-2.5 font-heading text-xs font-bold text-gray-600 hover:bg-gray-100">
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => router.push('/login?callbackUrl=/espacios')}
                className="w-full rounded-full bg-plai py-2.5 font-heading text-xs font-bold text-white shadow-md hover:bg-navy"
              >
                Iniciar Sesión
              </button>
            </div>
          </div>
        </div>
      )}

      {activeEspacio && status !== 'unauthenticated' && (
        <div className="fixed inset-0 z-[1000] flex animate-pop-in items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={closeReserve}>
          <div className="relative max-h-[90vh] w-full max-w-[600px] overflow-y-auto rounded-2xl bg-white p-8 shadow-[0_20px_40px_rgba(0,0,0,0.2)]" onClick={e => e.stopPropagation()}>
            <button className="absolute right-6 top-6 cursor-pointer text-2xl text-plai-gray transition-colors hover:text-navy" onClick={closeReserve}>&times;</button>
            
            {submitted ? (
              <div className="py-8 text-center">
                <CheckCircle2 size={60} color={activeEspacio.color} className="mx-auto mb-4" />
                <h2 className="mb-2 font-heading text-2xl font-bold text-navy">¡Solicitud Registrada!</h2>
                {folio && (
                  <p className="mb-4 font-mono text-xs font-bold text-plai">Folio Oficial: {folio}</p>
                )}
                <p className="mb-8 text-[0.95rem] leading-[1.5] text-plai-gray">
                  Tu solicitud para reservar el <strong>{activeEspacio.name}</strong> quedó registrada en el sistema administrativo de PLAi y en tu expediente de usuario.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Link
                    href="/usuario/prestamos"
                    className="rounded-xl px-6 py-3 font-heading text-sm font-bold text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: activeEspacio.color }}
                  >
                    Ver en Mis Solicitudes
                  </Link>
                  <button
                    className="cursor-pointer rounded-xl border border-gray-200 px-6 py-3 font-heading text-sm font-semibold text-navy hover:bg-gray-50"
                    onClick={closeReserve}
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-6 border-l-4 pl-4" style={{ borderColor: activeEspacio.color }}>
                  <h2 className="mb-1 font-heading text-2xl font-bold text-navy">Reservar: {activeEspacio.name}</h2>
                  <p className="text-[0.9rem] text-plai-gray">Completa el formulario para solicitar el uso de este espacio institucional.</p>
                </div>

                {errorMsg && (
                  <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800">
                    {errorMsg}
                  </div>
                )}
                
                <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
                  <div className="flex flex-col gap-1">
                    <label className="font-heading text-[0.85rem] font-semibold text-navy">Nombre del solicitante o institución</label>
                    <input name="nombreSolicitante" type="text" defaultValue={session?.user?.name || ''} className="w-full rounded-xl border border-black/[0.08] bg-[#F4F6F9] px-4 py-3 text-[0.9rem] outline-none transition-all focus:border-plai focus:ring-2 focus:ring-plai/10" required placeholder="Ej. Universidad de Guadalajara" />
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-1">
                      <label className="font-heading text-[0.85rem] font-semibold text-navy">Correo Electrónico</label>
                      <input name="correo" type="email" defaultValue={session?.user?.email || ''} className="w-full rounded-xl border border-black/[0.08] bg-[#F4F6F9] px-4 py-3 text-[0.9rem] outline-none transition-all focus:border-plai focus:ring-2 focus:ring-plai/10" required placeholder="correo@ejemplo.com" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-heading text-[0.85rem] font-semibold text-navy">Teléfono (10 dígitos)</label>
                      <input name="telefono" type="tel" defaultValue="3314101620" className="w-full rounded-xl border border-black/[0.08] bg-[#F4F6F9] px-4 py-3 text-[0.9rem] outline-none transition-all focus:border-plai focus:ring-2 focus:ring-plai/10" required placeholder="33 1410 1620" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-1">
                      <label className="flex items-center gap-1 font-heading text-[0.85rem] font-semibold text-navy"><Calendar size={14}/> Fecha deseada</label>
                      <input name="fecha" type="date" min={new Date().toISOString().split('T')[0]} className="w-full rounded-xl border border-black/[0.08] bg-[#F4F6F9] px-4 py-3 text-[0.9rem] outline-none transition-all focus:border-plai focus:ring-2 focus:ring-plai/10" required />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="flex items-center gap-1 font-heading text-[0.85rem] font-semibold text-navy"><Clock size={14}/> Hora de inicio</label>
                      <input name="horaInicio" type="time" defaultValue="10:00" className="w-full rounded-xl border border-black/[0.08] bg-[#F4F6F9] px-4 py-3 text-[0.9rem] outline-none transition-all focus:border-plai focus:ring-2 focus:ring-plai/10" required />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-heading text-[0.85rem] font-semibold text-navy">Propósito del evento (mín. 10 caracteres)</label>
                    <textarea name="proposito" minLength={10} className="w-full rounded-xl border border-black/[0.08] bg-[#F4F6F9] px-4 py-3 text-[0.9rem] outline-none transition-all focus:border-plai focus:ring-2 focus:ring-plai/10" rows={3} required placeholder="Describe brevemente el tipo de evento, asistentes y requerimientos especiales..."></textarea>
                  </div>
                  
                  <div className="flex items-center gap-2 rounded-xl bg-[#F4F6F9] p-3">
                    <input type="checkbox" className="size-4 cursor-pointer accent-plai" required id="aviso" />
                    <label htmlFor="aviso" className="flex cursor-pointer items-center text-[0.85rem] text-navy">
                      <ShieldCheck size={14} className="mr-1 text-plai" /> Acepto el{' '}
                      <button
                        type="button"
                        onClick={() => setIsPrivacyOpen(true)}
                        className="cursor-pointer font-semibold underline hover:opacity-80 transition-opacity"
                        style={{ color: activeEspacio.color, marginLeft: '0.2rem' }}
                      >
                        Aviso de Privacidad
                      </button>
                    </label>
                  </div>

                  <button type="submit" disabled={isSubmitting} className="mt-4 cursor-pointer rounded-xl p-4 font-heading text-base font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60" style={{ backgroundColor: activeEspacio.color }}>
                    {isSubmitting ? 'Registrando solicitud...' : 'Enviar Solicitud'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
      {/* Modal de Aviso de Privacidad */}
      <PrivacyPolicyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
    </div>
  );
}
