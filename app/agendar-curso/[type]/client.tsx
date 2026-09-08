'use client';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, User, Building, Mail, BookOpen, Calendar, Users } from 'lucide-react';
import styles from './AgendarCurso.module.css';
import { useState, use } from 'react';

export default function AgendarCursoPage({ params }: { params: Promise<{ type: string }> }) {
  const [submitted, setSubmitted] = useState(false);
  const resolvedParams = use(params);
  const isInstitucion = resolvedParams.type === 'institucion';

  const typeLabel = isInstitucion ? 'Institución Académica' : 'Empresa / Privado';
  const description = isInstitucion
    ? 'Agenda un curso o recorrido para tus estudiantes. Diseñaremos una experiencia alineada a sus planes de estudio.'
    : 'Solicita capacitaciones especializadas o uso de laboratorio para tu equipo de trabajo.';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className={styles.successState}>
        <div className={styles.successCard}>
          <CheckCircle2 size={64} className={styles.successIcon} />
          <h2 className={styles.successTitle}>¡Solicitud enviada!</h2>
          <p className={styles.successText}>
            Hemos recibido tu interés para agendar un curso como <strong>{typeLabel}</strong>. 
            El equipo de PLAi revisará tu solicitud y se pondrá en contacto pronto.
          </p>
          <Link href="/" className={styles.homeBtn}>
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.hero}>
        <div className={styles.heroContainer}>
          <Link href="/" className={styles.backLink}>
            <ArrowLeft size={18} /> Volver
          </Link>
          <p className={styles.heroPreTitle}>Agendar curso para</p>
          <h1 className={styles.heroTitle}>{typeLabel}</h1>
          <p className={styles.heroDesc}>{description}</p>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.formContainer}>
          <div className={styles.formCard}>
            <h2 className={styles.formTitle}>Completa tu solicitud</h2>
            
            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <User size={15} /> Nombre del solicitante
                </label>
                <input type="text" className={styles.input} placeholder="Tu nombre completo" required />
              </div>

              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <Building size={15} /> Nombre de la {isInstitucion ? 'Institución' : 'Empresa'}
                  </label>
                  <input type="text" className={styles.input} placeholder={`Ej. ${isInstitucion ? 'Universidad XYZ' : 'Empresa Tech SA'}`} required />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <Mail size={15} /> Correo electrónico
                  </label>
                  <input type="email" className={styles.input} placeholder="contacto@ejemplo.com" required />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <BookOpen size={15} /> Tema o área de interés
                </label>
                <select className={styles.select} required defaultValue="">
                  <option value="" disabled>Selecciona un tema...</option>
                  <option value="vr">Realidad Virtual e Inmersiva</option>
                  <option value="robotica">Robótica y Automatización</option>
                  <option value="impresion">Fabricación Digital e Impresión 3D</option>
                  <option value="drones">Pilotaje y Mapeo con Drones</option>
                  <option value="otro">Otro (especificar en comentarios)</option>
                </select>
              </div>

              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <Users size={15} /> Número estimado de asistentes
                  </label>
                  <input type="number" min="1" className={styles.input} placeholder="Ej. 15" required />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <Calendar size={15} /> Fecha tentativa
                  </label>
                  <input type="date" className={styles.input} />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Comentarios adicionales</label>
                <textarea className={styles.textarea} rows={4} placeholder="Detalles de lo que esperan aprender, requerimientos especiales..."></textarea>
              </div>

              <button type="submit" className={styles.submitBtn}>
                Enviar solicitud
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
