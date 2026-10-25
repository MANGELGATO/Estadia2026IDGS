'use client';

import { useEffect } from 'react';
import { ShieldCheck, X, FileText, Check } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PrivacyPolicyModal({ isOpen, onClose }: PrivacyPolicyModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[130] flex items-center justify-center bg-[rgba(22,46,80,0.6)] p-4 backdrop-blur-[6px] animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-modal-title"
    >
      <div
        className="relative flex max-h-[88vh] w-full max-w-[680px] animate-pop-in flex-col overflow-hidden rounded-2xl bg-white shadow-[0_24px_80px_rgba(22,46,80,0.25)] border border-black/[0.08]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-plai/10 text-plai">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h2 id="privacy-modal-title" className="font-heading text-lg font-extrabold text-navy">
                Aviso de Privacidad Integral
              </h2>
              <p className="font-body text-xs text-plai-muted">
                Plataforma Abierta de Innovación (PLAi) &bull; Cumplimiento LFPDPPP
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-plai-muted hover:bg-slate-100 hover:text-navy transition-colors"
            aria-label="Cerrar aviso de privacidad"
          >
            <X size={20} />
          </button>
        </div>

        {/* Contenido desplazable con lineamientos normativos */}
        <div className="flex-1 overflow-y-auto px-6 py-5 font-body text-sm leading-relaxed text-plai-gray">
          <div className="flex flex-col gap-4">
            <section>
              <h3 className="font-heading text-sm font-bold text-navy mb-1">
                1. Identidad y Domicilio del Responsable
              </h3>
              <p>
                La <strong>Plataforma Abierta de Innovación (PLAi)</strong>, con domicilio en Ciudad Creativa Digital,
                Calle López Cotilla No. 1505, Torre C, Guadalajara, Jalisco, México, es responsable del uso y protección
                de sus datos personales recabados mediante la plataforma digital de reserva de recursos y espacios.
              </p>
            </section>

            <section>
              <h3 className="font-heading text-sm font-bold text-navy mb-1">
                2. Datos Personales Sujetos a Tratamiento
              </h3>
              <p>
                Para procesar solicitudes de préstamo de equipo tecnológico y reservación de espacios de innovación,
                se recaban los siguientes datos:
              </p>
              <ul className="mt-1.5 list-disc pl-5 space-y-1 text-xs text-plai-gray">
                <li>Nombre completo del solicitante o responsable institucional.</li>
                <li>Correo electrónico institucional o personal de contacto.</li>
                <li>Identificación oficial con fotografía (INE o Pasaporte vigente) en copia digital.</li>
                <li>Carta responsiva debidamente suscrita con firma autógrafa.</li>
                <li>Institución educativa, organismo o empresa de procedencia y actividad académica vinculada.</li>
              </ul>
            </section>

            <section>
              <h3 className="font-heading text-sm font-bold text-navy mb-1">
                3. Finalidades del Tratamiento de Datos
              </h3>
              <p className="text-xs">
                <strong>Finalidades Primarias:</strong> Verificación de identidad para el préstamo de equipo de alto
                valor (robótica, manufactura aditiva y realidad virtual), formalización de responsabilidades civiles en
                caso de extravío o daño, y control de asistencia a cursos y laboratorios.
              </p>
              <p className="mt-1 text-xs">
                <strong>Finalidades Secundarias:</strong> Generación de métricas de impacto y estadísticas de uso de
                infraestructura pública estatal, siempre de manera anonimizada y disociada.
              </p>
            </section>

            <section>
              <h3 className="font-heading text-sm font-bold text-navy mb-1">
                4. Transferencia de Datos y Resguardo Seguro
              </h3>
              <p className="text-xs">
                PLAi no realiza transferencias de datos personales a terceros comerciales ni privados. Las copias
                digitales de identificaciones oficiales se almacenan en repositorios cifrados bajo control de acceso
                restringido y no son accesibles públicamente en la red.
              </p>
            </section>

            <section>
              <h3 className="font-heading text-sm font-bold text-navy mb-1">
                5. Ejercicio de Derechos ARCO
              </h3>
              <p className="text-xs">
                Usted tiene derecho a conocer qué datos personales tenemos de usted, para qué los utilizamos y las
                condiciones de su uso (Acceso). Asimismo, es su derecho solicitar su corrección (Rectificación), su
                eliminación de nuestros registros (Cancelación) u oponerse al uso de los mismos para fines específicos
                (Oposición). Para ejercer estos derechos, puede dirigir una solicitud a la Unidad de Transparencia al
                correo electrónico: <strong className="text-plai">transparencia@plai.mx</strong>.
              </p>
            </section>
          </div>
        </div>

        {/* Pie del modal */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 px-6 py-4">
          <div className="flex items-center gap-1.5 text-xs text-plai-muted">
            <FileText size={14} className="text-plai" />
            <span>Versión 1.0 &bull; Octubre 2026</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-heading text-sm font-bold text-white shadow-plai-sm hover:bg-[#004a87] transition-all active:scale-95"
          >
            <Check size={16} />
            Entendido y Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
