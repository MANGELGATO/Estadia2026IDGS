'use client';
import Link from 'next/link';
import styles from './HeroSection.module.css';
import { ArrowRight } from 'lucide-react';

const stats = [
  { value: '61', label: 'Cursos disponibles' },
  { value: '39.6K', label: 'Estudiantes inscritos' },
  { value: '95%', label: 'Tasa de satisfacción' },
  { value: '100', label: 'Aliados(as) educativos' },
];

export default function HeroSection() {
  return (
    <section className={styles.hero}>
      {/* Background overlay */}
      <div className={styles.overlay} />

      <div className={styles.content}>
        <div className={styles.container}>
          <h1 className={styles.title}>
            Formación para la{' '}
            <span className={styles.accent}>era digital</span>
          </h1>
          <p className={styles.subtitle}>
            Desarrolla las habilidades que necesitas para destacar en el mundo tecnológico.
            Cursos virtuales y presenciales adaptados a la demanda del mercado laboral actual.
          </p>
          <Link href="#dispositivos" className={styles.ctaBtn} id="hero-explorar">
            Explorar cursos <ArrowRight size={18} />
          </Link>
        </div>
      </div>

      {/* Stats bar */}
      <div className={styles.statsBar}>
        {stats.map((s) => (
          <div key={s.label} className={styles.statItem}>
            <span className={styles.statValue}>{s.value}</span>
            <span className={styles.statLabel}>{s.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
