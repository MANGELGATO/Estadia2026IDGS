import { RiCalendarCheckLine, RiMacbookLine, RiTimeLine } from 'react-icons/ri';
import Link from 'next/link';

export default function UserDashboard() {
  return (
    <div className="flex animate-pop-in flex-col gap-8">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#E91E8C] to-[#F59E0B] p-8 text-white shadow-[0_10px_30px_rgba(233,30,140,0.2)] md:p-10">
        <h1 className="relative z-10 mb-2 font-heading text-3xl font-extrabold md:text-[2.2rem]">¡Hola de nuevo!</h1>
        <p className="relative z-10 text-base opacity-90 md:text-[1.1rem]">Bienvenido a tu panel de institución. Aquí tienes un resumen de tu actividad.</p>
      </div>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/usuario/prestamos" className="no-underline">
          <div className="flex cursor-pointer items-center gap-6 rounded-2xl border border-black/[0.08] bg-white p-6 shadow-plai-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-plai-md">
            <div className="flex size-[60px] items-center justify-center rounded-xl bg-[rgba(233,30,140,0.1)] text-3xl text-[#E91E8C]">
              <RiMacbookLine />
            </div>
            <div>
              <h3 className="mb-1 font-heading text-sm font-medium uppercase text-plai-muted">Préstamos Activos</h3>
              <p className="font-heading text-[2rem] font-extrabold leading-none text-navy">2</p>
            </div>
          </div>
        </Link>
        
        <Link href="/usuario/agenda" className="no-underline">
          <div className="flex cursor-pointer items-center gap-6 rounded-2xl border border-black/[0.08] bg-white p-6 shadow-plai-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-plai-md">
            <div className="flex size-[60px] items-center justify-center rounded-xl bg-[rgba(245,158,11,0.1)] text-3xl text-[#F59E0B]">
              <RiCalendarCheckLine />
            </div>
            <div>
              <h3 className="mb-1 font-heading text-sm font-medium uppercase text-plai-muted">Cursos Próximos</h3>
              <p className="font-heading text-[2rem] font-extrabold leading-none text-navy">1</p>
            </div>
          </div>
        </Link>
        
        <div className="flex items-center gap-6 rounded-2xl border border-black/[0.08] bg-white p-6 shadow-plai-sm">
          <div className="flex size-[60px] items-center justify-center rounded-xl bg-[rgba(34,197,94,0.1)] text-3xl text-[#22C55E]">
            <RiTimeLine />
          </div>
          <div>
            <h3 className="mb-1 font-heading text-sm font-medium uppercase text-plai-muted">Horas de uso</h3>
            <p className="font-heading text-[2rem] font-extrabold leading-none text-navy">14h</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-black/[0.08] bg-white p-8 shadow-plai-sm">
        <h2 className="mb-6 font-heading text-2xl font-bold text-navy">Actividad Reciente</h2>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between rounded-xl border border-gray-100 p-4 transition-colors hover:bg-gray-50">
            <div className="flex items-center gap-4">
              <div className="flex size-10 items-center justify-center rounded-full bg-gray-100 text-lg">💻</div>
              <div>
                <h4 className="mb-1 font-heading text-base font-bold text-navy">Laptop HP ZBook</h4>
                <p className="text-[0.85rem] text-plai-muted">Solicitud de préstamo para Taller de Robótica</p>
              </div>
            </div>
            <span className="rounded-full bg-[#dcfce7] px-3 py-1 font-heading text-xs font-semibold text-[#15803d]">Aprobado</span>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-gray-100 p-4 transition-colors hover:bg-gray-50">
            <div className="flex items-center gap-4">
              <div className="flex size-10 items-center justify-center rounded-full bg-gray-100 text-lg">🥽</div>
              <div>
                <h4 className="mb-1 font-heading text-base font-bold text-navy">Visor Meta Quest 3</h4>
                <p className="text-[0.85rem] text-plai-muted">Solicitud de préstamo para Demostración VR</p>
              </div>
            </div>
            <span className="rounded-full bg-[#fef3c7] px-3 py-1 font-heading text-xs font-semibold text-[#d97706]">En revisión</span>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-gray-100 p-4 transition-colors hover:bg-gray-50">
            <div className="flex items-center gap-4">
              <div className="flex size-10 items-center justify-center rounded-full bg-gray-100 text-lg">📅</div>
              <div>
                <h4 className="mb-1 font-heading text-base font-bold text-navy">Curso: Fabricación Digital Básica</h4>
                <p className="text-[0.85rem] text-plai-muted">Agendado para el 15 de Noviembre, 10:00 AM</p>
              </div>
            </div>
            <span className="rounded-full bg-[#dcfce7] px-3 py-1 font-heading text-xs font-semibold text-[#15803d]">Confirmado</span>
          </div>
        </div>
      </div>
    </div>
  );
}
