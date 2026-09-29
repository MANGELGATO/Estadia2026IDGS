import styles from './page.module.css';
import { RiCalendarCheckLine, RiMacbookLine, RiTimeLine } from 'react-icons/ri';
import Link from 'next/link';

export default function UserDashboard() {
  return (
    <div className={styles.container}>
      <div className={styles.welcomeBanner}>
        <h1>¡Hola de nuevo!</h1>
        <p>Bienvenido a tu panel de institución. Aquí tienes un resumen de tu actividad.</p>
      </div>
      
      <div className={styles.statsGrid}>
        <Link href="/usuario/prestamos" style={{ textDecoration: 'none' }}>
          <div className={styles.statCard}>
            <div className={`${styles.iconWrapper} ${styles.iconPink}`}>
              <RiMacbookLine />
            </div>
            <div className={styles.statInfo}>
              <h3>Préstamos Activos</h3>
              <p>2</p>
            </div>
          </div>
        </Link>
        
        <Link href="/usuario/agenda" style={{ textDecoration: 'none' }}>
          <div className={styles.statCard}>
            <div className={`${styles.iconWrapper} ${styles.iconOrange}`}>
              <RiCalendarCheckLine />
            </div>
            <div className={styles.statInfo}>
              <h3>Cursos Próximos</h3>
              <p>1</p>
            </div>
          </div>
        </Link>
        
        <div className={styles.statCard}>
          <div className={`${styles.iconWrapper} ${styles.iconGreen}`}>
            <RiTimeLine />
          </div>
          <div className={styles.statInfo}>
            <h3>Horas de uso</h3>
            <p>14h</p>
          </div>
        </div>
      </div>

      <div className={styles.recentActivity}>
        <h2>Actividad Reciente</h2>
        <div className={styles.activityList}>
          <div className={styles.activityItem}>
            <div className={styles.activityInfo}>
              <div className={styles.activityIcon}>💻</div>
              <div className={styles.activityDetails}>
                <h4>Laptop HP ZBook</h4>
                <p>Solicitud de préstamo para Taller de Robótica</p>
              </div>
            </div>
            <span className={`${styles.badge} ${styles.badgeApproved}`}>Aprobado</span>
          </div>

          <div className={styles.activityItem}>
            <div className={styles.activityInfo}>
              <div className={styles.activityIcon}>🥽</div>
              <div className={styles.activityDetails}>
                <h4>Visor Meta Quest 3</h4>
                <p>Solicitud de préstamo para Demostración VR</p>
              </div>
            </div>
            <span className={`${styles.badge} ${styles.badgePending}`}>En revisión</span>
          </div>

          <div className={styles.activityItem}>
            <div className={styles.activityInfo}>
              <div className={styles.activityIcon}>📅</div>
              <div className={styles.activityDetails}>
                <h4>Curso: Fabricación Digital Básica</h4>
                <p>Agendado para el 15 de Noviembre, 10:00 AM</p>
              </div>
            </div>
            <span className={`${styles.badge} ${styles.badgeApproved}`}>Confirmado</span>
          </div>
        </div>
      </div>
    </div>
  );
}
