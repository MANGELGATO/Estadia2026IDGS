"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { 
  RiDashboardLine, 
  RiCalendarCheckLine, 
  RiFileListLine,
  RiLogoutBoxRLine,
} from "react-icons/ri";
import { useSession, signOut } from "next-auth/react";

const navSections = [
  {
    label: "General",
    items: [
      { name: "Resumen", href: "/usuario", icon: <RiDashboardLine /> },
    ],
  },
  {
    label: "Mis Solicitudes",
    items: [
      { name: "Préstamos", href: "/usuario/prestamos", icon: <RiFileListLine /> },
      { name: "Mi Agenda", href: "/usuario/agenda", icon: <RiCalendarCheckLine /> },
    ],
  }
];

export default function UserSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const userName = session?.user?.name || "Usuario Estándar";
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <aside className="sticky top-[70px] flex h-auto w-full flex-col overflow-y-auto border-r border-white/5 bg-gradient-to-b from-[#162E50] to-[#1B365D] p-4 text-white shadow-[4px_0_20px_rgba(0,0,0,0.15)] [scrollbar-color:rgba(255,255,255,0.2)_transparent] [scrollbar-width:thin] md:h-[calc(100vh-70px)] md:w-[260px] md:p-6">
      <div className="mb-4 flex items-center justify-between border-b border-white/[0.08] px-3 pb-5 pt-2">
        <div className="rounded-lg bg-white/95 px-2 py-1 shadow-sm">
          <Image
            src="/logotipo.png"
            alt="PLAi"
            width={120}
            height={36}
            className="h-7 w-auto object-contain"
          />
        </div>
        <span className="rounded bg-[#E91E8C]/20 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#E91E8C]">Usuario</span>
      </div>
      <nav className="flex flex-1 flex-col gap-1">
        {navSections.map((section) => (
          <div key={section.label} className="mb-2">
            <span className="block px-4 pb-[0.35rem] pt-3 text-[0.65rem] font-bold uppercase tracking-[0.1em] text-white/35">
              {section.label}
            </span>
            {section.items.map((item) => {
              const isActive =
                pathname === item.href ||
                (pathname.startsWith(item.href) && item.href !== "/usuario");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center gap-3 overflow-hidden rounded-xl px-4 py-[0.7rem] font-heading text-[0.875rem] font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-br from-[#E91E8C] to-[#c42585] text-white shadow-[0_4px_15px_rgba(233,30,140,0.35)]"
                      : "text-white/65 hover:bg-white/[0.08] hover:text-white"
                  }`}
                >
                  <span className="flex shrink-0 items-center text-[1.1rem]">{item.icon}</span>
                  {item.name}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
      <div className="mt-4 flex items-center justify-between gap-2 rounded-xl border-t border-white/[0.08] p-3 md:p-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#E91E8C] to-[#c42585] font-heading text-base font-bold text-white shadow-sm">
            {userInitial}
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-heading text-[0.8rem] font-semibold text-white/90">
              {userName}
            </span>
            <span className="truncate text-[0.68rem] text-white/40">
              {session?.user?.email || "Institución / Escuela"}
            </span>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          title="Cerrar sesión"
          className="rounded-lg p-2 text-white/50 transition hover:bg-white/10 hover:text-red-300"
        >
          <RiLogoutBoxRLine size={18} />
        </button>
      </div>
    </aside>
  );
}
