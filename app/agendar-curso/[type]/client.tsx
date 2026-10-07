'use client';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, User, Building, Mail, BookOpen, Calendar, Users, Briefcase, GraduationCap, FileText, Target } from 'lucide-react';
import styles from './AgendarCurso.module.css';
import { useState, use } from 'react';

export default function AgendarCursoPage({ params }: { params: Promise<{ type: string }> }) {
  const [submitted, setSubmitted] = useState(false);
  const resolvedParams = use(params);
  const isInstitucion = resolvedParams.type === 'academica' || resolvedParams.type === 'institucion';

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
              {/* Campos comunes base */}
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <User size={15} /> Nombre del solicitante
                </label>
                <input type="text" className={styles.input} placeholder={isInstitucion ? "Nombre del docente o coordinador" : "Nombre del solicitante"} required />
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

              {/* CAMPOS ESPECÍFICOS: INSTITUCIÓN EDUCATIVA */}
              {isInstitucion && (
                <>
                  <div className={styles.formGroup} style={{ marginBottom: '1rem' }}>
                    <label className={styles.label}>
                      <FileText size={15} /> Clave de Escuela (CCT)
                    </label>
                    <input type="text" className={styles.input} placeholder="Clave del Centro de Trabajo (10 caracteres)" required minLength={10} maxLength={10} />
                  </div>
                  <div className={styles.row}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>
                        <GraduationCap size={15} /> Nivel Educativo
                      </label>
                      <select className={styles.select} required defaultValue="">
                        <option value="" disabled>Selecciona un nivel...</option>
                        <option value="primaria">Primaria</option>
                        <option value="secundaria">Secundaria</option>
                        <option value="preparatoria">Preparatoria / Bachillerato</option>
                        <option value="universidad">Universidad / Superior</option>
                        <option value="posgrado">Posgrado</option>
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>
                        <BookOpen size={15} /> Materia o Asignatura
                      </label>
                      <input type="text" className={styles.input} placeholder="Ej. Ciencias, Informática, Diseño" required />
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      <Target size={15} /> Objetivo de la visita
                    </label>
                    <select className={styles.select} required defaultValue="">
                      <option value="" disabled>¿Qué buscas lograr con los estudiantes?</option>
                      <option value="recorrido">Recorrido introductorio al laboratorio</option>
                      <option value="taller_basico">Taller básico / Demostración VR</option>
                      <option value="proyecto">Desarrollo de un proyecto escolar</option>
                    </select>
                  </div>
                </>
              )}

              {/* CAMPOS ESPECÍFICOS: EMPRESA */}
              {!isInstitucion && (
                <>
                  <div className={styles.row}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>
                        <Briefcase size={15} /> Sector o Giro
                      </label>
                      <input type="text" className={styles.input} placeholder="Ej. Tecnología, Manufactura, Diseño" required />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>
                        <Target size={15} /> Objetivo de capacitación
                      </label>
                      <select className={styles.select} required defaultValue="">
                        <option value="" disabled>Selecciona el objetivo...</option>
                        <option value="team_building">Team Building / Integración con VR</option>
                        <option value="capacitacion_tecnica">Capacitación técnica en software</option>
                        <option value="prototipado">Uso de equipo para prototipado</option>
                        <option value="renta">Renta de espacio corporativo</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* Campos comunes finales */}
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
                  <input type="date" className={styles.input} required />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Comentarios adicionales</label>
                <textarea className={styles.textarea} rows={4} placeholder={isInstitucion ? "Detalles del grupo escolar, requerimientos especiales o dudas..." : "Detalles específicos del proyecto o capacitación, áreas de interés de su equipo..."}></textarea>
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
