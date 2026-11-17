'use client';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { ArrowLeft, CheckCircle2, User, Building, Mail, BookOpen, Calendar, Users, Briefcase, GraduationCap, FileText, Target } from 'lucide-react';
import { useState, use } from 'react';

export default function AgendarCursoPage({ params }: { params: Promise<{ type: string }> }) {
  const { data: session } = useSession();
  const [submitted, setSubmitted] = useState(false);
  const [folio, setFolio] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const resolvedParams = use(params);
  const isInstitucion = resolvedParams.type === 'academica' || resolvedParams.type === 'institucion';

  const typeLabel = isInstitucion ? 'Institución Académica' : 'Empresa / Privado';
  const description = isInstitucion
    ? 'Agenda un curso o recorrido para tus estudiantes. Diseñaremos una experiencia alineada a sus planes de estudio.'
    : 'Solicita capacitaciones especializadas o uso de laboratorio para tu equipo de trabajo.';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const solicitanteNombre = (fd.get('solicitanteNombre') as string)?.trim() || session?.user?.name || 'Solicitante PLAi';
    const solicitanteEmail = (fd.get('solicitanteEmail') as string)?.trim() || session?.user?.email || 'user@plai.edu.mx';
    const institucion = (fd.get('institucion') as string)?.trim() || typeLabel;
    const fecha = (fd.get('fecha') as string) || new Date().toISOString().split('T')[0];
    const asistentes = Number(fd.get('asistentes')) || 15;
    const objetivo = (fd.get('objetivo') as string) || 'Taller Tecnológico';
    const materia = (fd.get('materia') as string) || (fd.get('sector') as string) || 'Innovación';
    const comentarios = (fd.get('comentarios') as string) || '';

    try {
      const res = await fetch('/api/cursos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: `${objetivo.replace(/_/g, ' ').toUpperCase()} — ${materia}`,
          tipo: `${typeLabel} · ${institucion}`,
          fecha,
          hora: '10:00 - 13:00',
          lugar: 'Laboratorios de Innovación PLAi · Ciudad Creativa Digital',
          asistentes,
          solicitanteNombre,
          solicitanteEmail,
          institucion,
          icon: isInstitucion ? '🎓' : '💼',
          descripcion: comentarios || `Sesión formativa de ${materia} para ${institucion} (${asistentes} participantes).`,
        }),
      });
      const json = await res.json();
      if (json.data?.id) {
        setFolio(json.data.id);
      }
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center bg-[#F4F6F9] p-8">
        <div className="flex max-w-[520px] animate-pop-in flex-col items-center rounded-2xl border border-black/[0.08] bg-white px-8 py-14 text-center shadow-[0_16px_40px_rgba(27,54,93,0.06)] md:px-12">
          <CheckCircle2 size={64} className="mb-5 text-[#15803d]" />
          <h2 className="mb-2 font-heading text-[1.8rem] font-extrabold text-navy">¡Solicitud registrada!</h2>
          {folio && (
            <span className="mb-4 rounded-full bg-blue-50 px-4 py-1 font-mono text-xs font-bold text-plai">
              Folio de Seguimiento: {folio}
            </span>
          )}
          <p className="mb-8 text-[1rem] leading-[1.6] text-plai-gray">
            Hemos registrado tu solicitud como <strong>{typeLabel}</strong> en el sistema de agenda y reservaciones de PLAi.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/usuario/agenda" className="rounded-full bg-[#ed8d1b] px-7 py-[0.8rem] font-heading text-[0.9rem] font-bold text-white transition-colors hover:bg-[#d67a10]">
              Ver en Mi Agenda
            </Link>
            <Link href="/" className="rounded-full border border-gray-300 bg-white px-7 py-[0.8rem] font-heading text-[0.9rem] font-bold text-navy transition-colors hover:bg-gray-50">
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="relative bg-gradient-to-br from-navy to-[#7d205b] pb-20 pt-16 text-white after:absolute after:-bottom-px after:inset-x-0 after:h-10 after:bg-[#F4F6F9] after:[clip-path:ellipse(55%_100%_at_50%_100%)]">
        <div className="mx-auto max-w-[800px] px-6 text-center">
          <Link href="/" className="mb-8 inline-flex items-center gap-[0.4rem] font-heading text-[0.9rem] font-semibold text-white/80 transition-colors hover:text-white">
            <ArrowLeft size={18} /> Volver
          </Link>
          <p className="mb-2 font-heading text-base font-bold uppercase tracking-[0.08em] text-white/70">Agendar curso para</p>
          <h1 className="mb-4 font-heading text-4xl font-black leading-[1.1] tracking-[-0.04em] sm:text-5xl">{typeLabel}</h1>
          <p className="mx-auto max-w-[600px] text-[1.1rem] leading-[1.6] opacity-90">{description}</p>
        </div>
      </div>

      <div className="bg-[#F4F6F9] pb-20 pt-0">
        <div className="relative z-10 mx-auto -mt-12 max-w-[760px] px-6">
          <div className="rounded-2xl border border-black/[0.08] bg-white p-6 shadow-[0_16px_40px_rgba(27,54,93,0.06)] md:p-12">
            <h2 className="mb-8 text-center font-heading text-2xl font-extrabold text-navy">Completa tu solicitud</h2>
            
            <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
              {/* Campos comunes base */}
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-[0.4rem] font-heading text-[0.9rem] font-bold text-navy [&>svg]:text-plai">
                  <User size={15} /> Nombre del solicitante
                </label>
                <input name="solicitanteNombre" type="text" defaultValue={session?.user?.name || ''} className="rounded-xl border-[1.5px] border-black/[0.08] bg-white px-4 py-[0.8rem] font-body text-[0.95rem] text-navy outline-none transition-all placeholder:text-plai-muted focus:border-plai focus:ring-2 focus:ring-plai/10" placeholder={isInstitucion ? "Nombre del docente o coordinador" : "Nombre del solicitante"} required />
              </div>

              <div className="grid grid-cols-1 gap-6 min-[600px]:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-[0.4rem] font-heading text-[0.9rem] font-bold text-navy [&>svg]:text-plai">
                    <Building size={15} /> Nombre de la {isInstitucion ? 'Institución' : 'Empresa'}
                  </label>
                  <input name="institucion" type="text" className="rounded-xl border-[1.5px] border-black/[0.08] bg-white px-4 py-[0.8rem] font-body text-[0.95rem] text-navy outline-none transition-all placeholder:text-plai-muted focus:border-plai focus:ring-2 focus:ring-plai/10" placeholder={`Ej. ${isInstitucion ? 'Universidad de Guadalajara' : 'Empresa Tech SA'}`} required />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-[0.4rem] font-heading text-[0.9rem] font-bold text-navy [&>svg]:text-plai">
                    <Mail size={15} /> Correo electrónico
                  </label>
                  <input name="solicitanteEmail" type="email" defaultValue={session?.user?.email || ''} className="rounded-xl border-[1.5px] border-black/[0.08] bg-white px-4 py-[0.8rem] font-body text-[0.95rem] text-navy outline-none transition-all placeholder:text-plai-muted focus:border-plai focus:ring-2 focus:ring-plai/10" placeholder="contacto@ejemplo.com" required />
                </div>
              </div>

              {/* CAMPOS ESPECÍFICOS: INSTITUCIÓN EDUCATIVA */}
              {isInstitucion && (
                <>
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-[0.4rem] font-heading text-[0.9rem] font-bold text-navy [&>svg]:text-plai">
                      <FileText size={15} /> Clave de Escuela (CCT)
                    </label>
                    <input name="cct" type="text" className="rounded-xl border-[1.5px] border-black/[0.08] bg-white px-4 py-[0.8rem] font-body text-[0.95rem] text-navy outline-none transition-all placeholder:text-plai-muted focus:border-plai focus:ring-2 focus:ring-plai/10" placeholder="Clave del Centro de Trabajo (10 caracteres)" required minLength={5} maxLength={15} />
                  </div>
                  <div className="grid grid-cols-1 gap-6 min-[600px]:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <label className="flex items-center gap-[0.4rem] font-heading text-[0.9rem] font-bold text-navy [&>svg]:text-plai">
                        <GraduationCap size={15} /> Nivel Educativo
                      </label>
                      <select name="nivel" className="cursor-pointer rounded-xl border-[1.5px] border-black/[0.08] bg-white px-4 py-[0.8rem] font-body text-[0.95rem] text-navy outline-none transition-all focus:border-plai focus:ring-2 focus:ring-plai/10" required defaultValue="">
                        <option value="" disabled>Selecciona un nivel...</option>
                        <option value="primaria">Primaria</option>
                        <option value="secundaria">Secundaria</option>
                        <option value="preparatoria">Preparatoria / Bachillerato</option>
                        <option value="universidad">Universidad / Superior</option>
                        <option value="posgrado">Posgrado</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="flex items-center gap-[0.4rem] font-heading text-[0.9rem] font-bold text-navy [&>svg]:text-plai">
                        <BookOpen size={15} /> Materia o Asignatura
                      </label>
                      <input name="materia" type="text" className="rounded-xl border-[1.5px] border-black/[0.08] bg-white px-4 py-[0.8rem] font-body text-[0.95rem] text-navy outline-none transition-all placeholder:text-plai-muted focus:border-plai focus:ring-2 focus:ring-plai/10" placeholder="Ej. Robótica, Realidad Virtual, Diseño 3D" required />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-[0.4rem] font-heading text-[0.9rem] font-bold text-navy [&>svg]:text-plai">
                      <Target size={15} /> Objetivo de la visita
                    </label>
                    <select name="objetivo" className="cursor-pointer rounded-xl border-[1.5px] border-black/[0.08] bg-white px-4 py-[0.8rem] font-body text-[0.95rem] text-navy outline-none transition-all focus:border-plai focus:ring-2 focus:ring-plai/10" required defaultValue="">
                      <option value="" disabled>¿Qué buscas lograr con los estudiantes?</option>
                      <option value="Recorrido Guiado">Recorrido introductorio al laboratorio</option>
                      <option value="Taller Práctico VR">Taller básico / Demostración VR</option>
                      <option value="Proyecto Escolar Maker">Desarrollo de un proyecto escolar</option>
                    </select>
                  </div>
                </>
              )}

              {/* CAMPOS ESPECÍFICOS: EMPRESA */}
              {!isInstitucion && (
                <>
                  <div className="grid grid-cols-1 gap-6 min-[600px]:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <label className="flex items-center gap-[0.4rem] font-heading text-[0.9rem] font-bold text-navy [&>svg]:text-plai">
                        <Briefcase size={15} /> Sector o Giro
                      </label>
                      <input name="sector" type="text" className="rounded-xl border-[1.5px] border-black/[0.08] bg-white px-4 py-[0.8rem] font-body text-[0.95rem] text-navy outline-none transition-all placeholder:text-plai-muted focus:border-plai focus:ring-2 focus:ring-plai/10" placeholder="Ej. Tecnología, Manufactura, Diseño" required />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="flex items-center gap-[0.4rem] font-heading text-[0.9rem] font-bold text-navy [&>svg]:text-plai">
                        <Target size={15} /> Objetivo de capacitación
                      </label>
                      <select name="objetivo" className="cursor-pointer rounded-xl border-[1.5px] border-black/[0.08] bg-white px-4 py-[0.8rem] font-body text-[0.95rem] text-navy outline-none transition-all focus:border-plai focus:ring-2 focus:ring-plai/10" required defaultValue="">
                        <option value="" disabled>Selecciona el objetivo...</option>
                        <option value="Team Building VR">Team Building / Integración con VR</option>
                        <option value="Capacitación Técnica">Capacitación técnica en software</option>
                        <option value="Prototipado Industrial">Uso de equipo para prototipado</option>
                        <option value="Sesión Corporativa">Sesión en espacio corporativo</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* Campos comunes finales */}
              <div className="grid grid-cols-1 gap-6 min-[600px]:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-[0.4rem] font-heading text-[0.9rem] font-bold text-navy [&>svg]:text-plai">
                    <Users size={15} /> Número estimado de asistentes
                  </label>
                  <input name="asistentes" type="number" min="1" className="rounded-xl border-[1.5px] border-black/[0.08] bg-white px-4 py-[0.8rem] font-body text-[0.95rem] text-navy outline-none transition-all placeholder:text-plai-muted focus:border-plai focus:ring-2 focus:ring-plai/10" placeholder="Ej. 15" required />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-[0.4rem] font-heading text-[0.9rem] font-bold text-navy [&>svg]:text-plai">
                    <Calendar size={15} /> Fecha tentativa
                  </label>
                  <input name="fecha" type="date" className="rounded-xl border-[1.5px] border-black/[0.08] bg-white px-4 py-[0.8rem] font-body text-[0.95rem] text-navy outline-none transition-all focus:border-plai focus:ring-2 focus:ring-plai/10" required />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-heading text-[0.9rem] font-bold text-navy">Comentarios adicionales</label>
                <textarea name="comentarios" className="resize-y rounded-xl border-[1.5px] border-black/[0.08] bg-white px-4 py-[0.8rem] font-body text-[0.95rem] text-navy outline-none transition-all placeholder:text-plai-muted focus:border-plai focus:ring-2 focus:ring-plai/10" rows={4} placeholder={isInstitucion ? "Detalles del grupo escolar, requerimientos especiales o dudas..." : "Detalles específicos del proyecto o capacitación, áreas de interés de su equipo..."}></textarea>
              </div>

              <button type="submit" disabled={isSubmitting} className="mt-4 w-full cursor-pointer rounded-full bg-[#ed8d1b] py-4 font-heading text-[1.05rem] font-extrabold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#d67a10] disabled:opacity-60">
                {isSubmitting ? 'Registrando solicitud...' : 'Enviar solicitud'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
