'use client';

import React, { useState, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, getSession } from 'next-auth/react';
import { Lock, Mail, AlertCircle, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';

function isSafeRelativePath(path: string): boolean {
  return path.startsWith('/') && !path.startsWith('//') && !path.startsWith('/login');
}

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Por favor ingresa tu correo institucional y tu contraseña.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await signIn('credentials', {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (res?.status === 429) {
        setError(
          'Has alcanzado el límite máximo de intentos permitidos por seguridad. Espera un minuto antes de reintentar.'
        );
        setLoading(false);
        return;
      }

      if (res?.error || !res?.ok) {
        setError('Credenciales inválidas o cuenta inactiva. Verifica tu correo y contraseña.');
        setLoading(false);
        return;
      }

      // Obtener el rol real y autorizado directamente de la sesión firmada por el servidor
      const session = await getSession();
      const role = session?.user?.role || 'usuario';
      const isStaff = role === 'admin' || role === 'colaborador';

      let destination = isStaff ? '/admin' : '/usuario';
      if (isSafeRelativePath(callbackUrl)) {
        const requestsAdmin = callbackUrl.startsWith('/admin');
        if (!requestsAdmin || isStaff) {
          destination = callbackUrl;
        }
      }

      router.push(destination);
      router.refresh();
    } catch {
      setError('No fue posible conectar con el servicio de autenticación. Intenta nuevamente.');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-160px)] items-center justify-center bg-gradient-to-br from-[#F4F6F9] to-[#E9ECEF] p-4 py-12 md:p-8">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-black/[0.08] bg-white p-8 shadow-xl md:p-10">
        <div className="mb-6 text-center">
          <Image
            src="/logotipo.png"
            alt="PLAi - Plataforma Abierta de Innovación"
            width={160}
            height={48}
            priority
            className="mx-auto mb-5 h-11 w-auto object-contain"
          />
          <h1 className="font-heading text-2xl font-bold text-[#1B365D]">
            Acceso Institucional
          </h1>
          <p className="mt-1.5 text-sm text-plai-muted">
            Plataforma de Gestión de Recursos y Espacios de PLAi
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700"
          >
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
            <div>
              <p className="font-semibold">Error de autenticación</p>
              <p className="text-xs text-red-600">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="login-email"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-700"
            >
              Correo Institucional
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nombre.apellido@plai.mx"
                required
                disabled={loading}
                className="w-full rounded-xl border border-gray-300 py-2.5 pl-11 pr-4 text-sm text-gray-800 transition focus:border-[#1B365D] focus:outline-none focus:ring-2 focus:ring-[#1B365D]/20 disabled:bg-gray-100"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-700"
            >
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                disabled={loading}
                className="w-full rounded-xl border border-gray-300 py-2.5 pl-11 pr-4 text-sm text-gray-800 transition focus:border-[#1B365D] focus:outline-none focus:ring-2 focus:ring-[#1B365D]/20 disabled:bg-gray-100"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#ed8d1b] py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#d67a10] active:scale-[0.99] disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Verificando credenciales...</span>
              </>
            ) : (
              <>
                <span>Iniciar Sesión</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-gray-100 bg-[#F8FAFC] p-3.5 text-xs text-plai-muted">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#1e5ca7]" />
          <p className="leading-relaxed">
            El nivel de acceso se asigna automáticamente según tu perfil registrado en PLAi. Si requieres alta o restablecimiento de cuenta, contacta al área de Tecnología e Infraestructura.
          </p>
        </div>

        <div className="mt-5 text-center">
          <Link
            href="/"
            className="text-xs font-semibold text-[#1e5ca7] transition hover:underline"
          >
            ← Volver al catálogo público
          </Link>
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
