'use client';
import { useState } from 'react';
import { Users, Calendar, Building, ShieldCheck, CheckCircle2, Clock } from 'lucide-react';

const espaciosMock = [
  {
    id: 'auditorio',
    name: 'Auditorio Principal',
    description: 'Espacio ideal para conferencias, presentaciones y eventos corporativos con capacidad para 150 personas.',
    capacity: 150,
    features: ['Proyector 4K', 'Sistema de audio profesional', 'Iluminación escénica', 'Wi-Fi de alta velocidad'],
    color: '#E91E8C'
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
  const [selectedEspacio, setSelectedEspacio] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const closeReserve = () => {
    setSelectedEspacio(null);
    setSubmitted(false);
  };

  const activeEspacio = espaciosMock.find(e => e.id === selectedEspacio);

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

      {activeEspacio && (
        <div className="fixed inset-0 z-[1000] flex animate-pop-in items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={closeReserve}>
          <div className="relative max-h-[90vh] w-full max-w-[600px] overflow-y-auto rounded-2xl bg-white p-8 shadow-[0_20px_40px_rgba(0,0,0,0.2)]" onClick={e => e.stopPropagation()}>
            <button className="absolute right-6 top-6 cursor-pointer text-2xl text-plai-gray transition-colors hover:text-navy" onClick={closeReserve}>&times;</button>
            
            {submitted ? (
              <div className="py-8 text-center">
                <CheckCircle2 size={60} color={activeEspacio.color} className="mx-auto mb-6" />
                <h2 className="mb-4 font-heading text-2xl font-bold text-navy">¡Solicitud Enviada!</h2>
                <p className="mb-8 text-[0.95rem] leading-[1.5] text-plai-gray">Tu solicitud para reservar el <strong>{activeEspacio.name}</strong> ha sido recibida. El equipo de PLAi se comunicará contigo a la brevedad para confirmar la disponibilidad.</p>
                <button className="cursor-pointer rounded-xl px-8 py-3 font-heading font-semibold text-white transition-opacity hover:opacity-90" onClick={closeReserve} style={{ backgroundColor: activeEspacio.color }}>
                  Cerrar
                </button>
              </div>
            ) : (
              <>
                <div className="mb-6 border-l-4 pl-4" style={{ borderColor: activeEspacio.color }}>
                  <h2 className="mb-1 font-heading text-2xl font-bold text-navy">Reservar: {activeEspacio.name}</h2>
                  <p className="text-[0.9rem] text-plai-gray">Completa el formulario para solicitar el uso de este espacio.</p>
                </div>
                
                <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
                  <div className="flex flex-col gap-1">
                    <label className="font-heading text-[0.85rem] font-semibold text-navy">Nombre del solicitante o institución</label>
                    <input type="text" className="w-full rounded-xl border border-black/[0.08] bg-[#F4F6F9] px-4 py-3 text-[0.9rem] outline-none transition-all focus:border-plai focus:ring-2 focus:ring-plai/10" required placeholder="Ej. Universidad XYZ" />
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-1">
                      <label className="font-heading text-[0.85rem] font-semibold text-navy">Correo Electrónico</label>
                      <input type="email" className="w-full rounded-xl border border-black/[0.08] bg-[#F4F6F9] px-4 py-3 text-[0.9rem] outline-none transition-all focus:border-plai focus:ring-2 focus:ring-plai/10" required placeholder="correo@ejemplo.com" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-heading text-[0.85rem] font-semibold text-navy">Teléfono</label>
                      <input type="tel" className="w-full rounded-xl border border-black/[0.08] bg-[#F4F6F9] px-4 py-3 text-[0.9rem] outline-none transition-all focus:border-plai focus:ring-2 focus:ring-plai/10" required placeholder="123 456 7890" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-1">
                      <label className="flex items-center gap-1 font-heading text-[0.85rem] font-semibold text-navy"><Calendar size={14}/> Fecha deseada</label>
                      <input type="date" className="w-full rounded-xl border border-black/[0.08] bg-[#F4F6F9] px-4 py-3 text-[0.9rem] outline-none transition-all focus:border-plai focus:ring-2 focus:ring-plai/10" required />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="flex items-center gap-1 font-heading text-[0.85rem] font-semibold text-navy"><Clock size={14}/> Hora de inicio</label>
                      <input type="time" className="w-full rounded-xl border border-black/[0.08] bg-[#F4F6F9] px-4 py-3 text-[0.9rem] outline-none transition-all focus:border-plai focus:ring-2 focus:ring-plai/10" required />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-heading text-[0.85rem] font-semibold text-navy">Propósito del evento</label>
                    <textarea className="w-full rounded-xl border border-black/[0.08] bg-[#F4F6F9] px-4 py-3 text-[0.9rem] outline-none transition-all focus:border-plai focus:ring-2 focus:ring-plai/10" rows={3} required placeholder="Describe brevemente el tipo de evento, asistentes y requerimientos especiales..."></textarea>
                  </div>
                  
                  <div className="flex items-center gap-2 rounded-xl bg-[#F4F6F9] p-3">
                    <input type="checkbox" className="size-4 cursor-pointer accent-plai" required id="aviso" />
                    <label htmlFor="aviso" className="flex cursor-pointer items-center text-[0.85rem] text-navy">
                      <ShieldCheck size={14} className="mr-1 text-plai" /> Acepto el <a href="#" style={{ color: activeEspacio.color, marginLeft: '0.2rem' }}>Aviso de Privacidad</a>
                    </label>
                  </div>

                  <button type="submit" className="mt-4 cursor-pointer rounded-xl p-4 font-heading text-base font-bold text-white transition-opacity hover:opacity-90" style={{ backgroundColor: activeEspacio.color }}>
                    Enviar Solicitud
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
