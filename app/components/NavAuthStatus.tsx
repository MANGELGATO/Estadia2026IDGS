'use client';

import React from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { UserCircle2, LogOut, ShieldCheck, User } from 'lucide-react';

export default function NavAuthStatus() {
  const { data: session, status } = useSession();

  const handleFederatedLogout = async () => {
    try {
      const res = await fetch('/api/auth/federated-logout', {
        method: 'POST',
        credentials: 'same-origin',
      });
      const data = await res.json().catch(() => ({}));
      window.location.href = typeof data.logoutUrl === 'string' ? data.logoutUrl : '/login';
    } catch {
      window.location.href = '/login';
    }
  };

  if (status === 'loading') {
    return <div className="h-9 w-28 animate-pulse rounded-full bg-gray-200" />;
  }

  if (session?.user) {
    const role = session.user.role || 'usuario';
    const isStaff = role === 'admin' || role === 'colaborador';
    const dashboardHref = isStaff ? '/admin' : '/usuario';
    const roleLabel =
      role === 'admin' ? 'Admin' : role === 'colaborador' ? 'Colaborador' : 'Usuario';

    return (
      <div className="flex items-center gap-3">
        <Link
          href={dashboardHref}
          className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
            isStaff
              ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
              : 'bg-sky-100 text-sky-900 hover:bg-sky-200'
          }`}
          title={`Ir al portal de ${roleLabel}`}
        >
          {isStaff ? (
            <ShieldCheck size={14} className="text-amber-700" />
          ) : (
            <User size={14} className="text-plai" />
          )}
          <span className="hidden sm:inline">{session.user.name?.split(' ')[0]}</span>
          <span className="rounded bg-white/70 px-1 py-0.2 text-[10px] uppercase tracking-wide">
            {roleLabel}
          </span>
        </Link>

        <button
          type="button"
          onClick={handleFederatedLogout}
          className="flex items-center gap-1 rounded-full border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 transition hover:border-red-300 hover:bg-red-50 hover:text-red-700"
          title="Cerrar Sesión (SSO Keycloak)"
        >
          <LogOut size={13} />
          <span className="hidden md:inline">Salir</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/login"
        id="nav-login"
        className="inline-flex h-auto shrink-0 items-center gap-2 whitespace-nowrap rounded-full border-0 bg-[#ed8d1b] px-[1.3rem] py-[0.55rem] text-[0.88rem] font-semibold text-white shadow-sm transition-all hover:-translate-y-px hover:bg-[#d67a10]"
      >
        <UserCircle2 size={17} />
        Iniciar Sesión
      </Link>
    </div>
  );
}
