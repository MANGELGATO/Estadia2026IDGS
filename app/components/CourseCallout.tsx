'use client';
import { useState } from 'react';
import Link from 'next/link';
import styles from './CourseCallout.module.css';
import { GraduationCap, Building2, ArrowRight, Sparkles } from 'lucide-react';

export default function CourseCallout() {
  const [selected, setSelected] = useState<'academica' | 'privada' | null>(null);

  return (
    <section className={styles.section} id="agendar">
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.leftCol}>
            <div className={styles.badge}>
              <Sparkles size={13} />
              Próximos cursos disponibles
            </div>
            <h2 className={styles.title}>
              ¿Te gustaría agendar<br />
              <span className={styles.highlight}>un curso?</span>
            </h2>
            <p className={styles.subtitle}>
              Reserva sesiones de capacitación con nuestros expertos y lleva a tu equipo
              al siguiente nivel tecnológico.
            </p>
          </div>

          <div className={styles.rightCol}>
            <p className={styles.selectLabel}>Selecciona el tipo de institución:</p>
            <div className={styles.optionGrid}>
              <button
                id="opt-academica"
                className={`${styles.optionCard} ${selected === 'academica' ? styles.optionActive : ''}`}
                onClick={() => setSelected('academica')}
              >
                <div className={styles.optionIcon}><GraduationCap size={26} /></div>
                <span className={styles.optionTitle}>Institución Académica</span>
                <span className={styles.optionDesc}>Universidades, escuelas y centros educativos</span>
                {selected === 'academica' && <div className={styles.checkMark}>✓</div>}
              </button>

              <button
                id="opt-privada"
                className={`${styles.optionCard} ${selected === 'privada' ? styles.optionActive : ''}`}
                onClick={() => setSelected('privada')}
              >
                <div className={styles.optionIcon}><Building2 size={26} /></div>
                <span className={styles.optionTitle}>Empresa Privada</span>
                <span className={styles.optionDesc}>Corporativos, startups y organizaciones</span>
                {selected === 'privada' && <div className={styles.checkMark}>✓</div>}
              </button>
            </div>

            <Link
              href={selected ? `/agendar-curso/${selected}` : '#'}
              id="btn-agendar"
              className={`${styles.ctaBtn} ${!selected ? styles.ctaDisabled : ''}`}
              onClick={e => { if (!selected) e.preventDefault(); }}
            >
              Agendar mi curso <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
