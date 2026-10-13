"use client";

import Link from "next/link";
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
} from "react-icons/ri";

const navSections = [
  {
    label: "General",
    items: [
      { name: "Dashboard", href: "/admin", icon: <RiDashboardLine /> },
    ],
  },
  {
    label: "Gestión",
    items: [
      { name: "Categorías", href: "/admin/categorias", icon: <RiAppsLine /> },
      { name: "Inventario", href: "/admin/inventario", icon: <RiComputerLine /> },
      { name: "Aplicaciones", href: "/admin/aplicaciones", icon: <RiAppsLine /> },
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

  return (
    <aside className="sticky top-[70px] flex h-auto w-full flex-col overflow-y-auto border-r border-white/5 bg-gradient-to-b from-[#162E50] to-[#1B365D] p-4 text-white shadow-[4px_0_20px_rgba(0,0,0,0.15)] [scrollbar-color:rgba(255,255,255,0.2)_transparent] [scrollbar-width:thin] md:h-[calc(100vh-70px)] md:w-[260px] md:p-6">
      <div className="mb-4 flex items-center gap-3 border-b border-white/[0.08] px-4 pb-6 pt-3">
        <span className="text-2xl">🔬</span>
        <span className="font-heading text-[1.1rem] font-extrabold tracking-[0.02em] text-white">PLAi Admin</span>
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
                (pathname.startsWith(item.href) && item.href !== "/admin");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center gap-3 overflow-hidden rounded-xl px-4 py-[0.7rem] font-heading text-[0.875rem] font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-br from-plai to-[#c42585] text-white shadow-[0_4px_15px_rgba(168,30,113,0.35)]"
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
      <div className="mt-4 hidden items-center gap-3 rounded-xl border-t border-white/[0.08] p-4 md:flex">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-plai to-[#c42585] font-heading text-base font-bold text-white">
          A
        </div>
        <div className="flex min-w-0 flex-col gap-[0.1rem]">
          <span className="truncate font-heading text-[0.8rem] font-semibold text-white/90">Administrador</span>
          <span className="text-[0.7rem] text-white/40">Super Admin</span>
        </div>
      </div>
    </aside>
  );
}
