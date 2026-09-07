import Link from 'next/link';
import styles from './Footer.module.css';
import { MapPin, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.main}>
        <div className={styles.container}>
          {/* Brand col */}
          <div className={styles.brandCol}>
            <div className={styles.brandLogo}>
              <svg width="40" height="30" viewBox="0 0 80 62" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="18" cy="32" r="14" fill="#E91E8C" fillOpacity="0.8"/>
                <circle cx="18" cy="32" r="8" fill="#1B365D"/>
                <circle cx="38" cy="20" r="12" fill="#F59E0B" fillOpacity="0.9"/>
                <circle cx="56" cy="32" r="14" fill="#22C55E" fillOpacity="0.8"/>
                <circle cx="56" cy="32" r="8" fill="#1B365D"/>
              </svg>
              <span className={styles.brandName}>Aprender</span>
            </div>
            <p className={styles.brandDesc}>
              Formación para la era digital enfocada en desarrollar talento para las empresas tecnológicas modernas.
            </p>
            <div className={styles.socials}>
              {/* Facebook */}
              <a href="#" className={styles.socialIcon} aria-label="Facebook">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              {/* X/Twitter */}
              <a href="#" className={styles.socialIcon} aria-label="Twitter">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              {/* Instagram */}
              <a href="#" className={styles.socialIcon} aria-label="Instagram">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/></svg>
              </a>
              {/* YouTube */}
              <a href="#" className={styles.socialIcon} aria-label="YouTube">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58zM9.75 15.02V8.98L15.5 12z"/></svg>
              </a>
              {/* LinkedIn */}
              <a href="#" className={styles.socialIcon} aria-label="LinkedIn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
              </a>
            </div>
          </div>

          {/* Nav col */}
          <div className={styles.col}>
            <h4 className={styles.colTitle}>Navegación</h4>
            <nav className={styles.colNav}>
              <Link href="/">Inicio</Link>
              <Link href="#ejes">Ejes temáticos</Link>
              <Link href="#sobre">Sobre nosotros</Link>
              <Link href="#contacto">Contacto</Link>
            </nav>
          </div>

          {/* Contact col */}
          <div className={styles.col}>
            <h4 className={styles.colTitle}>&nbsp;</h4>
            <div className={styles.contactList}>
              <div className={styles.contactItem}>
                <div className={styles.contactIcon}><MapPin size={18} /></div>
                <div>
                  <p className={styles.contactLabel}>Ubicación</p>
                  <p className={styles.contactValue}>C. Independencia 55, Guadalajara, Jalisco, Ciudad Creativa Digital</p>
                </div>
              </div>
              <div className={styles.contactItem}>
                <div className={styles.contactIcon}><Mail size={18} /></div>
                <div>
                  <p className={styles.contactLabel}>Contacto</p>
                  <p className={styles.contactValue}>plai.ayuda@plai.mx</p>
                  <p className={styles.contactValue}>+52 33 1410 1620</p>
                  <p className={styles.contactValue}>Whatsapp PLAi</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Logos bar */}
      <div className={styles.logosBar}>
        <div className={styles.container}>
          <div className={styles.logos}>
            {['Ciudad Creativa Digital', 'Plataforma Abierta de Innovación', 'Innovación, Ciencia y Tecnología', 'Coordinación de Crecimiento', 'Al Estilo Jalisco'].map(l => (
              <div key={l} className={styles.logoItem}>{l}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className={styles.bottom}>
        <div className={styles.container}>
          <span className={styles.copyright}>© 2025 Aprender. Todos los derechos reservados.</span>
          <div className={styles.bottomRight}>
            <Link href="#" className={styles.privacyLink}>Aviso de privacidad</Link>
            <div className={styles.hours}>
              <p className={styles.hoursTitle}>Horarios de atención</p>
              <p>Lunes - Viernes: 9:00 AM - 5:00 PM</p>
              <p>Sábados - Domingos: Cerrado</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
