"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./AdminSidebar.module.css";
import { 
  RiDashboardLine, 
  RiComputerLine, 
  RiAppsLine, 
  RiSettings4Line 
} from "react-icons/ri";

const navItems = [
  { name: "Dashboard", href: "/admin", icon: <RiDashboardLine /> },
  { name: "Inventario", href: "/admin/inventario", icon: <RiComputerLine /> },
  { name: "Aplicaciones", href: "/admin/aplicaciones", icon: <RiAppsLine /> },
  { name: "Configuración", href: "/admin/configuracion", icon: <RiSettings4Line /> },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <h2 className={styles.title}>Panel Admin</h2>
      <nav className={styles.nav}>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/admin");
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
      </nav>
    </aside>
  );
}
