import Link from 'next/link';
import styles from './Navbar.module.css';
import { UserCircle2 } from 'lucide-react';

export default function Navbar() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Logo - exactly as in aprender.plai.mx */}
        <Link href="/" className={styles.logo}>
          {/* PLAi colored logo circles icon */}
          <svg width="48" height="38" viewBox="0 0 80 62" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="18" cy="32" r="14" fill="#E91E8C"/>
            <circle cx="18" cy="32" r="8" fill="#F4F6F9"/>
            <circle cx="38" cy="20" r="12" fill="#F59E0B"/>
            <circle cx="56" cy="32" r="14" fill="#22C55E"/>
            <circle cx="56" cy="32" r="8" fill="#F4F6F9"/>
          </svg>
          <div className={styles.logoText}>
            <span className={styles.logoMain}>Plataforma</span>
            <span className={styles.logoSub}>Abierta de</span>
            <span className={styles.logoSub}>Innovación</span>
          </div>
        </Link>

        <nav className={styles.nav}>
          <Link href="/" className={styles.navLink}>Inicio</Link>
          <Link href="/espacios" className={styles.navLink}>Espacios</Link>
          <Link href="/#categorias" className={styles.navLink}>Categorías</Link>
          <Link href="/#aplicaciones" className={styles.navLink}>Aplicaciones</Link>
          <Link href="/#contacto" className={styles.navLink}>Contacto</Link>
        </nav>

        <Link href="/login" className={styles.loginBtn} id="nav-login">
          <UserCircle2 size={18} />
          Iniciar Sesión
        </Link>
      </div>
    </header>
  );
}
