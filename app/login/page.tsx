'use client';

import React, { useState, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { AlertCircle, Loader2, ShieldCheck } from 'lucide-react';

function isSafeRelativePath(path: string): boolean {
  return path.startsWith('/') && !path.startsWith('//') && !path.startsWith('/login');
}

function LoginFormContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '';
  const authErrorParam = searchParams.get('error');

  const [error, setError] = useState<string | null>(
    authErrorParam === 'AccountInactive'
      ? 'Tu cuenta está desactivada en el laboratorio PLAi. Contacta al administrador para reactivar tu acceso.'
      : authErrorParam
      ? 'No fue posible completar la autenticación con Keycloak. Intenta nuevamente.'
      : null
  );
  const [keycloakLoading, setKeycloakLoading] = useState(false);

  const handleKeycloakLogin = async () => {
    setKeycloakLoading(true);
    setError(null);
    try {
      const destination = callbackUrl && isSafeRelativePath(callbackUrl) ? callbackUrl : '/usuario';
      await signIn('keycloak', { callbackUrl: destination });
    } catch {
      setError('No fue posible conectar con el servidor Keycloak SSO de PLAi.');
      setKeycloakLoading(false);
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

        <div className="mb-6 space-y-3">
          <button
            type="button"
            onClick={handleKeycloakLogin}
            disabled={keycloakLoading}
            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#1B365D] py-3.5 px-4 text-sm font-semibold text-white shadow-lg shadow-[#1B365D]/20 transition hover:bg-[#152a48] active:scale-[0.99] disabled:opacity-60"
          >
            {keycloakLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Redirigiendo a Keycloak SSO...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="h-5 w-5 text-[#ed8d1b]" />
                <span>Iniciar sesión con cuenta PLAi (SSO)</span>
              </>
            )}
          </button>
          <p className="text-center text-xs text-gray-500">
            Autenticación única administrada por el servidor Keycloak institucional de PLAi
          </p>
        </div>

        <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-gray-100 bg-[#F8FAFC] p-3.5 text-xs text-plai-muted">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#1e5ca7]" />
          <p className="leading-relaxed">
            El nivel de acceso (administrador, colaborador o usuario) se asigna automáticamente según los roles configurados en tu cuenta institucional de Keycloak.
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
