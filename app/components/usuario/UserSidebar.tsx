"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./UserSidebar.module.css";
import { 
  RiDashboardLine, 
  RiCalendarCheckLine,
  RiFileListLine
} from "react-icons/ri";

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

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <span className={styles.brandIcon}>🎓</span>
        <span className={styles.brandName}>PLAi Usuario</span>
      </div>
      <nav className={styles.nav}>
        {navSections.map((section) => (
          <div key={section.label} className={styles.section}>
            <span className={styles.sectionLabel}>{section.label}</span>
            {section.items.map((item) => {
              const isActive =
                pathname === item.href ||
                (pathname.startsWith(item.href) && item.href !== "/usuario");
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
        <div className={styles.userAvatar}>U</div>
        <div className={styles.userInfo}>
          <span className={styles.userName}>Usuario Estándar</span>
          <span className={styles.userRole}>Institución / Escuela</span>
        </div>
      </div>
    </aside>
  );
}
