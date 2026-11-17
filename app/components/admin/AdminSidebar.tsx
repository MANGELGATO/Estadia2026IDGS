"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { 
  RiDashboardLine, 
  RiComputerLine, 
  RiAppsLine, 
  RiSettings4Line,
  RiCalendarCheckLine,
  RiUserSettingsLine,
  RiToolsLine,
  RiBarChartLine,
  RiLogoutBoxRLine,
  RiHistoryLine,
  RiExternalLinkLine,
  RiGamepadLine
} from "react-icons/ri";
import { useSession, signOut } from "next-auth/react";

const navSections = [
  {
    label: "General",
    items: [
      { name: "Dashboard", href: "/admin", icon: <RiDashboardLine /> },
    ],
  },
  {
    label: "Gestión Operativa",
    items: [
      { name: "Categorías", href: "/admin/categorias", icon: <RiAppsLine /> },
      { name: "Inventario", href: "/admin/inventario", icon: <RiComputerLine /> },
      { name: "Bitácora de Uso", href: "/admin/bitacora", icon: <RiHistoryLine /> },
      { name: "Aplicaciones", href: "/admin/aplicaciones", icon: <RiGamepadLine /> },
      { name: "Mantenimiento", href: "/admin/mantenimiento", icon: <RiToolsLine /> },
    ],
  },
  {
    label: "Reservaciones",
    items: [
      { name: "Reservaciones", href: "/admin/reservaciones", icon: <RiCalendarCheckLine /> },
    ],
  },
  {
    label: "Administración",
    items: [
      { name: "Usuarios", href: "/admin/usuarios", icon: <RiUserSettingsLine /> },
      { name: "Reportes", href: "/admin/reportes", icon: <RiBarChartLine /> },
      { name: "Configuración", href: "/admin/configuracion", icon: <RiSettings4Line /> },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const userName = session?.user?.name || "Administrador PLAi";
  const userInitial = userName.charAt(0).toUpperCase();

  const handleSignOut = async () => {
    if (typeof document !== 'undefined') {
      document.cookie = 'plai_role=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
    await signOut({ callbackUrl: "/login?logout=true" });
  };

  return (
    <aside className="sticky top-0 z-40 flex h-auto w-full flex-col overflow-y-auto border-r border-white/10 bg-[#1e5ca7] p-4 text-white shadow-xl [scrollbar-color:rgba(255,255,255,0.2)_transparent] [scrollbar-width:thin] md:h-screen md:w-[270px] md:p-6">
      {/* Brand Header */}
      <div className="mb-4 flex items-center justify-between border-b border-white/15 px-2 pb-5 pt-2">
        <Link href="/" target="_blank" className="flex items-center gap-2 rounded-lg bg-white/95 px-2.5 py-1.5 shadow-sm transition hover:bg-white" title="Ver sitio web público">
          <Image
            src="/logotipo.png"
            alt="PLAi"
            width={120}
            height={36}
            className="h-7 w-auto object-contain"
          />
        </Link>
        <span className="rounded bg-white/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
          Admin
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-1">
        {navSections.map((section) => (
          <div key={section.label} className="mb-2">
            <span className="block px-3 pb-[0.35rem] pt-2 text-[0.68rem] font-bold uppercase tracking-[0.1em] text-white/50">
              {section.label}
            </span>
            {section.items.map((item) => {
              const isActive =
                pathname === item.href ||
                (pathname.startsWith(item.href) && item.href !== "/admin");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center gap-3 overflow-hidden rounded-xl px-3.5 py-[0.65rem] font-heading text-[0.875rem] font-medium transition-all duration-150 ${
                    isActive
                      ? "bg-white text-[#1e5ca7] font-bold shadow-md shadow-black/10"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span className={`flex shrink-0 items-center text-[1.15rem] ${isActive ? 'text-plai' : 'text-white/80'}`}>
                    {item.icon}
                  </span>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User Info & Integrated Sign Out */}
      <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-white/15 bg-white/10 p-3.5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white font-heading text-sm font-bold text-[#1e5ca7] shadow-sm">
            {userInitial}
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-heading text-[0.82rem] font-bold text-white">
              {userName}
            </span>
            <span className="truncate text-[0.7rem] text-white/70">
              {session?.user?.email || "admin@plai.edu.mx"}
            </span>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-white/15 py-2 text-xs font-bold text-white transition hover:bg-red-600 hover:text-white"
          title="Cerrar sesión del panel de administración"
        >
          <RiLogoutBoxRLine size={16} />
          <span>Cerrar Sesión</span>
        </button>

        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-center gap-1.5 text-[0.72rem] text-white/70 hover:text-white hover:underline transition"
        >
          <span>Ir al Portal Público</span>
          <RiExternalLinkLine size={12} />
        </Link>
      </div>
    </aside>
  );
}
