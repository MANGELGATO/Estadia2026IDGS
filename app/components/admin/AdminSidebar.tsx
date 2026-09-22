"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./AdminSidebar.module.css";
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
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <span className={styles.brandIcon}>🔬</span>
        <span className={styles.brandName}>PLAi Admin</span>
      </div>
      <nav className={styles.nav}>
        {navSections.map((section) => (
          <div key={section.label} className={styles.section}>
            <span className={styles.sectionLabel}>{section.label}</span>
            {section.items.map((item) => {
              const isActive =
                pathname === item.href ||
                (pathname.startsWith(item.href) && item.href !== "/admin");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${styles.link} ${isActive ? styles.linkActive : ""}`}
                >
                  <span className={styles.icon}>{item.icon}</span>
                  {item.name}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
      <div className={styles.userFooter}>
        <div className={styles.userAvatar}>A</div>
        <div className={styles.userInfo}>
          <span className={styles.userName}>Administrador</span>
          <span className={styles.userRole}>Super Admin</span>
        </div>
      </div>
    </aside>
  );
}
