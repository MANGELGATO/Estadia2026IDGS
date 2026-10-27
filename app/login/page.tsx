'use client';

import React, { useState, Suspense } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { ShieldCheck, User, Lock, Mail, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [quickLoginRole, setQuickLoginRole] = useState<'admin' | 'usuario' | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor ingresa tanto tu correo institucional como tu contraseña.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (res?.status === 429) {
        setError('Has alcanzado el límite máximo de intentos permitidos por seguridad. Por favor, espera un minuto antes de reintentar.');
        setLoading(false);
        return;
      }

      if (res?.error) {
        setError('Credenciales no válidas. Verifica tu correo o contraseña.');
        setLoading(false);
        return;
      }

      // Redirección exitosa
      const destination = callbackUrl || (email.toLowerCase().includes('admin') ? '/admin' : '/usuario');
      router.push(destination);
      router.refresh();
    } catch {
      setError('Ocurrió un error inesperado al conectar con el servidor de autenticación.');
      setLoading(false);
    }
  };

  const handleQuickLogin = async (role: 'admin' | 'usuario') => {
    setQuickLoginRole(role);
    setError(null);

    const demoCredentials =
      role === 'admin'
        ? { email: 'admin@plai.mx', password: 'AdminPlai2026!' }
        : { email: 'usuario@plai.mx', password: 'UserPlai2026!' };

    try {
      const res = await signIn('credentials', {
        ...demoCredentials,
        redirect: false,
      });

      if (res?.error) {
        setError('No fue posible iniciar sesión con la cuenta de demostración.');
        setQuickLoginRole(null);
        return;
      }

      const destination = callbackUrl || (role === 'admin' ? '/admin' : '/usuario');
      router.push(destination);
      router.refresh();
    } catch {
      setError('Error al procesar el acceso rápido.');
      setQuickLoginRole(null);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-160px)] items-center justify-center bg-gradient-to-br from-[#F4F6F9] to-[#E9ECEF] p-4 py-12 md:p-8">
      <div className="w-full max-w-4xl overflow-hidden rounded-3xl border border-black/[0.08] bg-white shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-12">
          {/* Columna Izquierda: Formulario Directo */}
          <div className="p-8 md:col-span-7 md:p-12">
            <div className="mb-6">
              <Image
                src="/logotipo.png"
                alt="PLAi - Plataforma Abierta de Innovación"
                width={160}
                height={48}
                priority
                className="mb-4 h-10 w-auto object-contain"
              />
              <span className="inline-block rounded-full bg-[#1B365D]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#1B365D]">
                Estándar PLAi v1.0 • NextAuth.js
              </span>
              <h1 className="mt-3 font-heading text-2xl font-bold text-[#1B365D] md:text-3xl">
                Iniciar Sesión
              </h1>
              <p className="mt-1 text-sm text-plai-muted">
                Acceso al Laboratorio de Innovación, Robótica y Tecnologías Inmersivas.
              </p>
            </div>

            {error && (
              <div role="alert" className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                <div>
                  <p className="font-semibold">Error de autenticación</p>
                  <p className="text-xs text-red-600">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="login-email" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-700">
                  Correo Institucional
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ejemplo@plai.mx"
                    required
                    disabled={loading || quickLoginRole !== null}
                    className="w-full rounded-xl border border-gray-300 py-2.5 pl-11 pr-4 text-sm text-gray-800 transition focus:border-[#1B365D] focus:outline-none focus:ring-2 focus:ring-[#1B365D]/20 disabled:bg-gray-100"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="login-password" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-700">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    disabled={loading || quickLoginRole !== null}
                    className="w-full rounded-xl border border-gray-300 py-2.5 pl-11 pr-4 text-sm text-gray-800 transition focus:border-[#1B365D] focus:outline-none focus:ring-2 focus:ring-[#1B365D]/20 disabled:bg-gray-100"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || quickLoginRole !== null}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1B365D] py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#142642] active:scale-[0.99] disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Autenticando en servidor...</span>
                  </>
                ) : (
                  <>
                    <span>Ingresar con Credenciales</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Columna Derecha: Acceso Rápido de Demostración */}
          <div className="border-t border-black/[0.08] bg-[#F8FAFC] p-8 md:col-span-5 md:border-l md:border-t-0 md:p-10">
            <h2 className="font-heading text-lg font-bold text-[#1B365D]">
              Cuentas de Evaluación
            </h2>
            <p className="mt-1 text-xs text-plai-muted">
              Haz clic en cualquiera de los dos perfiles para ingresar de forma inmediata:
            </p>

            <div className="mt-6 space-y-4">
              {/* Opción Usuario Estándar */}
              <button
                type="button"
                onClick={() => handleQuickLogin('usuario')}
                disabled={loading || quickLoginRole !== null}
                className="group relative flex w-full items-start gap-4 rounded-2xl border-2 border-gray-200 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-[#E91E8C] hover:shadow-md disabled:opacity-60"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E91E8C]/10 text-[#E91E8C]">
                  {quickLoginRole === 'usuario' ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-heading text-sm font-bold text-[#1B365D]">Usuario Estándar</span>
                    <span className="rounded bg-pink-100 px-1.5 py-0.5 text-[10px] font-semibold text-[#E91E8C]">
                      Rol: usuario
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-plai-muted">
                    usuario@plai.mx
                  </p>
                  <p className="mt-0.5 text-[11px] text-gray-400">
                    Consultar catálogo, préstamos personales y agendar cursos.
                  </p>
                </div>
              </button>

              {/* Opción Administrador */}
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                disabled={loading || quickLoginRole !== null}
                className="group relative flex w-full items-start gap-4 rounded-2xl border-2 border-gray-200 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-[#F59E0B] hover:shadow-md disabled:opacity-60"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F59E0B]/10 text-[#F59E0B]">
                  {quickLoginRole === 'admin' ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <ShieldCheck className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-heading text-sm font-bold text-[#1B365D]">Administrador</span>
                    <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-[#B45309]">
                      Rol: admin
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-plai-muted">
                    admin@plai.mx
                  </p>
                  <p className="mt-0.5 text-[11px] text-gray-400">
                    Inventario, mantenimiento, control de reservas y configuraciones.
                  </p>
                </div>
              </button>
            </div>

            <div className="mt-6 rounded-xl border border-gray-200 bg-white p-3 text-[11px] text-plai-muted">
              <span className="font-semibold text-gray-700">Nota de Seguridad:</span> Las sesiones son emitidas y verificadas en servidor mediante tokens JWT cifrados con el secreto institucional.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-160px)] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#1B365D]" />
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
