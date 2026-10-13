import Link from 'next/link';
import { User, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-150px)] items-center justify-center bg-[#F4F6F9] p-8">
      <div className="w-full max-w-[800px] rounded-2xl border border-black/[0.08] bg-white p-8 text-center shadow-[0_10px_30px_rgba(0,0,0,0.05)] md:p-12">
        <h1 className="mb-2 font-heading text-3xl font-bold text-navy md:text-[2rem]">
          Demostración: Iniciar Sesión
        </h1>
        <p className="mb-12 text-base text-plai-muted md:text-[1.1rem]">
          Selecciona el tipo de usuario con el que deseas ingresar para la demostración:
        </p>
        
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <Link
            href="/usuario"
            className="group flex flex-col items-center rounded-xl border-2 border-gray-200 p-8 text-inherit no-underline transition-all duration-200 hover:-translate-y-1 hover:border-[#E91E8C] hover:shadow-[0_10px_25px_rgba(233,30,140,0.1)] md:p-10"
          >
            <User size={48} className="mb-4 text-[#E91E8C]" />
            <h2 className="mb-3 font-heading text-xl font-bold text-navy md:text-2xl">Usuario Estándar</h2>
            <p className="text-[0.95rem] leading-[1.5] text-plai-muted">
              Ver catálogo, buscar dispositivos y agendar cursos.
            </p>
          </Link>
          
          <Link
            href="/admin"
            className="group flex flex-col items-center rounded-xl border-2 border-gray-200 p-8 text-inherit no-underline transition-all duration-200 hover:-translate-y-1 hover:border-[#F59E0B] hover:shadow-[0_10px_25px_rgba(245,158,11,0.1)] md:p-10"
          >
            <ShieldCheck size={48} className="mb-4 text-[#F59E0B]" />
            <h2 className="mb-3 font-heading text-xl font-bold text-navy md:text-2xl">Administrador</h2>
            <p className="text-[0.95rem] leading-[1.5] text-plai-muted">
              Gestión de inventario, usuarios, reportes y configuración.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
