import Link from 'next/link';
import styles from './login.module.css';
import { User, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Demostración: Iniciar Sesión</h1>
        <p className={styles.subtitle}>Selecciona el tipo de usuario con el que deseas ingresar para la demostración:</p>
        
        <div className={styles.options}>
          <Link href="/usuario" className={styles.optionBox}>
            <User size={48} className={styles.iconUser} />
            <h2>Usuario Estándar</h2>
            <p>Ver catálogo, buscar dispositivos y agendar cursos.</p>
          </Link>
          
          <Link href="/admin" className={styles.optionBox}>
            <ShieldCheck size={48} className={styles.iconAdmin} />
            <h2>Administrador</h2>
            <p>Gestión de inventario, usuarios, reportes y configuración.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
