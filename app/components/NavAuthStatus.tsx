'use client';

import React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { UserCircle2, LogOut, ShieldCheck, User } from 'lucide-react';

export default function NavAuthStatus() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="h-9 w-28 animate-pulse rounded-full bg-gray-200" />
    );
  }

  if (session?.user) {
    const isAdmin = session.user.role === 'admin';
    const dashboardHref = isAdmin ? '/admin' : '/usuario';

    return (
      <div className="flex items-center gap-3">
        <Link
          href={dashboardHref}
          className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
            isAdmin
              ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
              : 'bg-pink-100 text-pink-900 hover:bg-pink-200'
          }`}
          title={`Ir al portal de ${isAdmin ? 'Administrador' : 'Usuario'}`}
        >
          {isAdmin ? <ShieldCheck size={14} className="text-amber-700" /> : <User size={14} className="text-pink-700" />}
          <span className="hidden sm:inline">{session.user.name?.split(' ')[0]}</span>
          <span className="rounded bg-white/70 px-1 py-0.2 text-[10px] uppercase tracking-wide">
            {isAdmin ? 'Admin' : 'Usuario'}
          </span>
        </Link>

        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-1 rounded-full border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 transition hover:border-red-300 hover:bg-red-50 hover:text-red-700"
          title="Cerrar Sesión"
        >
          <LogOut size={13} />
          <span className="hidden md:inline">Salir</span>
        </button>
      </div>
    );
  }

  return (
    <Link
      href="/login"
      id="nav-login"
      className="btn btn-primary btn-sm h-auto shrink-0 whitespace-nowrap rounded-full border-0 px-[1.4rem] py-[0.55rem] text-[0.9rem] font-semibold shadow-none transition-all hover:-translate-y-px hover:bg-navy"
    >
      <UserCircle2 size={18} />
      Iniciar Sesión
    </Link>
  );
}
