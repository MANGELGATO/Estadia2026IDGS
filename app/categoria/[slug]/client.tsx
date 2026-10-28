'use client';
import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { mockDevices, DeviceItem } from '../../../lib/mockData';
import { ArrowLeft, Lightbulb, Target, CheckCircle2, Box, Layers, Coins } from 'lucide-react';
import EquipmentCard from '../../components/EquipmentCard';
import EquipmentDetailModal from '../../components/EquipmentDetailModal';
import ReservationForm from '../../components/ReservationForm';

const categoryMeta: Record<string, { name: string; description: string; plaiUsage: string; color: string; benefits: string[]; successCases: {title: string; desc: string}[] }> = {
  'realidad-virtual': {
    name: 'Realidad Virtual',
    description: 'Explora nuestra colección de dispositivos de realidad virtual. Visores, controles y accesorios de última generación para experiencias inmersivas.',
    plaiUsage: 'En PLAi utilizamos los visores de Realidad Virtual para simular entornos de alto riesgo, recorridos inmersivos de arquitectura y diseño, y desarrollar competencias en metaverso e interacción 3D para instituciones educativas y empresas.',
    color: '#7c3aed',
    benefits: ['Simulación de entornos seguros', 'Aprendizaje inmersivo 3D', 'Reducción de costos en prototipos'],
    successCases: [
      { title: 'Recorrido Arquitectónico', desc: 'Visualización de un complejo habitacional antes de su construcción.' },
      { title: 'Simulador Médico', desc: 'Prácticas de cirugía para estudiantes de medicina sin riesgo.' }
    ]
  },
  'robotica': {
    name: 'Robótica',
    description: 'Kits, brazos robóticos y componentes de automatización para aprender construyendo.',
    plaiUsage: 'Los laboratorios de robótica de PLAi permiten a los estudiantes y profesionales realizar prototipados rápidos, entender la automatización industrial (Industria 4.0) y programar desde cero algoritmos de inteligencia artificial aplicada al hardware.',
    color: '#0ea5e9',
    benefits: ['Prototipado rápido', 'Automatización Industrial', 'Programación de hardware aplicado'],
    successCases: [
      { title: 'Brazo Clasificador', desc: 'Sistema robótico capaz de clasificar piezas por color mediante visión por computadora.' },
      { title: 'Vehículo Autónomo', desc: 'Prototipo a escala para navegación en almacenes logísticos.' }
    ]
  },
  'fabricacion-digital': {
    name: 'Fabricación Digital',
    description: 'Impresoras 3D, escáneres y materiales para transformar diseños en objetos reales.',
    plaiUsage: 'Promovemos la cultura Maker en Jalisco permitiendo que emprendedores y estudiantes validen sus diseños físicos rápidamente antes de pasar a producción masiva, abaratando los costos de innovación y desarrollo de producto.',
    color: '#f59e0b',
    benefits: ['Validación de diseños', 'Cultura Maker', 'Abaratamiento de innovación'],
    successCases: [
      { title: 'Prótesis 3D', desc: 'Desarrollo e impresión de prótesis de bajo costo para niños.' },
      { title: 'Moldes Industriales', desc: 'Creación de moldes rápidos para inyección de plásticos.' }
    ]
  },
  'drones': {
    name: 'Drones',
    description: 'Drones profesionales y educativos para captura aérea, mapeo y entrenamiento de vuelo.',
    plaiUsage: 'Con nuestra flota de Drones, apoyamos capacitaciones en fotogrametría, agricultura de precisión, seguridad y producciones audiovisuales, preparando a los asistentes para certificaciones de vuelo.',
    color: '#10b981',
    benefits: ['Fotogrametría avanzada', 'Agricultura de precisión', 'Capacitación para certificaciones'],
    successCases: [
      { title: 'Mapeo Agrícola', desc: 'Análisis de cultivos mediante cámaras multiespectrales para optimizar riego.' },
      { title: 'Inspección de Estructuras', desc: 'Revisión segura de puentes y torres de telecomunicaciones.' }
    ]
  },
  'computo-multimedia': {
    name: 'Cómputo / Multimedia',
    description: 'Equipos de alto rendimiento para diseño, edición, gaming y desarrollo.',
    plaiUsage: 'Estaciones de trabajo de grado profesional disponibles para compilar código complejo, realizar renders arquitectónicos o desarrollar videojuegos pesados sin depender de infraestructura costosa propia.',
    color: '#a81e71',
    benefits: ['Renders ultrarrápidos', 'Desarrollo sin límites', 'Edición de video 8K'],
    successCases: [
      { title: 'Desarrollo de Videojuego', desc: 'Creación de assets y compilación de un título indie en Unreal Engine 5.' },
      { title: 'Postproducción de Cortometraje', desc: 'Edición, colorización y renderizado de un proyecto cinematográfico local.' }
    ]
  },
};

const categoryToDeviceCategory: Record<string, string> = {
  'realidad-virtual': 'Realidad Virtual',
  'robotica': 'Robótica',
  'fabricacion-digital': 'Fabricación digital',
  'drones': 'Drones',
  'computo-multimedia': 'Cómputo',
};

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const meta = categoryMeta[resolvedParams.slug];
  const deviceCategory = categoryToDeviceCategory[resolvedParams.slug];
  const [allDevices, setAllDevices] = useState<DeviceItem[]>(mockDevices);

  useEffect(() => {
    fetch('/api/equipos')
      .then(res => res.json())
      .then(json => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setAllDevices(json.data);
        }
      })
      .catch(() => {});
  }, []);

  const devices = allDevices.filter(d => d.category === deviceCategory);

  const [selectedDetailsId, setSelectedDetailsId] = useState<string | null>(null);
  const [selectedReserveId, setSelectedReserveId]  = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('https://www.youtube.com/embed/dQw4w9WgXcQ');
  const [isLoaded, setIsLoaded] = useState(false);
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);
  const [createdQuoteId, setCreatedQuoteId] = useState('');
  const [quoteName, setQuoteName] = useState('');
  const [quoteEmail, setQuoteEmail] = useState('');
  const [quotePhone, setQuotePhone] = useState('');
  const [quoteMaterial, setQuoteMaterial] = useState('PLA');
  const [quoteInfill, setQuoteInfill] = useState('20%');
  const [quoteDetails, setQuoteDetails] = useState('');
  const [quoteFilename, setQuoteFilename] = useState('');
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setQuoteLoading(true);
    setQuoteError(null);

    try {
      const res = await fetch('/api/cotizaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre_solicitante: quoteName,
          email_solicitante: quoteEmail,
          telefono: quotePhone,
          archivo_nombre: quoteFilename || 'modelo_3d.stl',
          material: quoteMaterial,
          relleno: quoteInfill,
          detalles: quoteDetails,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setCreatedQuoteId(json.data.id);
        setQuoteSubmitted(true);
      } else {
        setQuoteError(json.message || 'No fue posible registrar la cotización.');
      }
    } catch {
      setQuoteError('Error de conexión con el servidor de manufactura de PLAi.');
    } finally {
      setQuoteLoading(false);
    }
  };


  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setIsLoaded(true);
      const savedVideo = localStorage.getItem(`category_video_${resolvedParams.slug}`);
      if (savedVideo) {
        setVideoUrl(savedVideo);
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [resolvedParams.slug]);

  const deviceForDetails = allDevices.find(d => d.id === selectedDetailsId);
  const deviceForReserve = allDevices.find(d => d.id === selectedReserveId);

  if (!meta) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-xl font-bold text-navy">Categoría no encontrada.</p>
        <Link href="/" className="inline-flex items-center gap-2 font-heading font-semibold text-plai hover:underline">
          <ArrowLeft size={16} /> Volver al inicio
        </Link>
      </div>
    );
  }

  return (
    <div className={isLoaded ? 'opacity-100 transition-opacity duration-500 ease-out' : 'opacity-0'}>
      {/* Dynamic Hero Section */}
      <div
        className="relative overflow-hidden py-16 text-white after:absolute after:-bottom-px after:inset-x-0 after:h-16 after:bg-[#F4F6F9] after:[clip-path:polygon(0_100%,100%_100%,100%_40%,0%_100%)] bg-[linear-gradient(135deg,var(--primary)_0%,color-mix(in_srgb,var(--cat-color)_60%,var(--primary))_100%)]"
        style={{ '--cat-color': meta.color } as React.CSSProperties}
      >
        <div className="pointer-events-none absolute -left-[20%] -top-[50%] h-[200%] w-[140%] rotate-[15deg] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,transparent_60%)]" />
        <div className="relative z-10 mx-auto max-w-[1440px] px-6">
          <Link href="/#dispositivos" className="mb-8 inline-flex items-center gap-[0.4rem] font-heading text-[0.9rem] font-semibold text-white/80 transition-all hover:-translate-x-1 hover:text-white">
            <ArrowLeft size={18} /> Volver al Catálogo
          </Link>
          <div className="max-w-[800px]">
            <div className="mb-6 inline-block rounded-full border border-white/30 bg-white/20 px-4 py-[0.4rem] font-heading text-[0.85rem] font-bold uppercase tracking-[0.05em] backdrop-blur-md">
              Saber Más
            </div>
            <h1 className="mb-4 font-heading text-4xl font-black leading-[1.1] tracking-[-0.03em] drop-shadow-[0_4px_20px_rgba(0,0,0,0.15)] sm:text-[3.5rem]">{meta.name}</h1>
            <p className="mb-8 max-w-[650px] text-lg leading-[1.6] opacity-95 sm:text-[1.25rem]">{meta.description}</p>
            <div className="mt-10 flex flex-wrap gap-12">
              <div className="flex flex-col">
                <span className="mb-1 font-heading text-4xl font-extrabold leading-none">{devices.length}</span>
                <span className="font-heading text-[0.9rem] font-medium uppercase tracking-[0.05em] opacity-80">Equipos Disponibles</span>
              </div>
              <div className="flex flex-col">
                <span className="mb-1 font-heading text-4xl font-extrabold leading-none">{meta.successCases.length}+</span>
                <span className="font-heading text-[0.9rem] font-medium uppercase tracking-[0.05em] opacity-80">Casos de Éxito</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#F4F6F9] pb-24 pt-12">
        <div className="mx-auto max-w-[1440px] px-6">
          
          <div className="mb-16 grid grid-cols-1 gap-10 lg:grid-cols-[2fr_1fr]">
            {/* Información general de uso en PLAi */}
            <div className="h-full">
              <div className="h-full rounded-2xl border border-black/[0.08] bg-white p-8 shadow-[0_10px_40px_rgba(0,0,0,0.04)] md:p-12">
                <div className="mb-6 flex items-center gap-4">
                  <Lightbulb className="size-8 shrink-0" style={{ color: meta.color }} />
                  <h2 className="font-heading text-2xl font-extrabold tracking-[-0.02em] text-navy sm:text-[1.8rem]">Aplicación en PLAi</h2>
                </div>
                <p className="mb-10 text-lg leading-[1.8] text-plai-gray">{meta.plaiUsage}</p>
                
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {meta.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-center gap-3 rounded-xl bg-[#F4F6F9] px-5 py-4 font-heading text-[1.05rem] font-semibold text-navy transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_15px_rgba(0,0,0,0.05)]">
                      <CheckCircle2 size={18} className="shrink-0" style={{ color: meta.color }} />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Video Configurable desde Dashboard */}
            <div>
              <div className="rounded-2xl border border-black/[0.08] bg-white p-8 shadow-[0_10px_40px_rgba(0,0,0,0.04)]">
                <h3 className="mb-6 font-heading text-[1.2rem] font-extrabold text-navy">Casos de Éxito Destacados</h3>
                <div className="flex items-center justify-center overflow-hidden rounded-2xl border border-black/[0.08] bg-white p-4 shadow-[0_4px_15px_rgba(0,0,0,0.03)]">
                  {isLoaded && (
                    <iframe
                      width="100%"
                      height="315"
                      src={videoUrl.includes('watch?v=') ? videoUrl.replace("watch?v=", "embed/") : videoUrl}
                      title="Video de categoría"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="rounded-xl"
                    ></iframe>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Catálogo de Equipos de la categoría */}
          <div className="mt-8">
            <div className="mb-6 flex items-center gap-4">
              <Target className="size-8 shrink-0" style={{ color: meta.color }} />
              <h2 className="font-heading text-2xl font-extrabold tracking-[-0.02em] text-navy sm:text-[1.8rem]">Equipos Disponibles para Solicitar</h2>
            </div>
            
            {devices.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-black/[0.12] bg-white p-16 text-center text-base text-plai-muted">
                No hay equipos registrados en esta categoría todavía.
              </div>
            ) : (
              <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {devices.map(device => (
                  <EquipmentCard
                    key={device.id}
                    device={device}
                    onViewDetails={setSelectedDetailsId}
                    onReserve={setSelectedReserveId}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Secciones específicas para Fabricación Digital */}
          {resolvedParams.slug === 'fabricacion-digital' && (
            <div className="mt-16 flex flex-col gap-10">
              
              <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
                <div className="rounded-2xl border border-black/[0.08] bg-white p-8 shadow-[0_8px_30px_rgba(0,0,0,0.03)] md:p-10">
                  <div className="mb-6 flex items-center gap-4">
                    <Box className="size-8 shrink-0" style={{ color: meta.color }} />
                    <h2 className="font-heading text-2xl font-extrabold tracking-[-0.02em] text-navy sm:text-[1.8rem]">Inventario de Filamentos</h2>
                  </div>
                  <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="flex items-center gap-4 rounded-xl bg-[#F4F6F9] p-4 transition-transform hover:-translate-y-0.5">
                      <div className="size-10 shrink-0 rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]" style={{ backgroundColor: '#ff0000' }}></div>
                      <div>
                        <strong className="block font-heading text-[0.95rem] text-navy">PLA Rojo</strong>
                        <p className="m-0 text-[0.8rem] text-plai-gray">1.75mm - 800g disponibles</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 rounded-xl bg-[#F4F6F9] p-4 transition-transform hover:-translate-y-0.5">
                      <div className="size-10 shrink-0 rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]" style={{ backgroundColor: '#000000' }}></div>
                      <div>
                        <strong className="block font-heading text-[0.95rem] text-navy">PLA Negro</strong>
                        <p className="m-0 text-[0.8rem] text-plai-gray">1.75mm - 1.2kg disponibles</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 rounded-xl bg-[#F4F6F9] p-4 transition-transform hover:-translate-y-0.5">
                      <div className="size-10 shrink-0 rounded-full border border-gray-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]" style={{ backgroundColor: '#ffffff' }}></div>
                      <div>
                        <strong className="block font-heading text-[0.95rem] text-navy">PETG Blanco</strong>
                        <p className="m-0 text-[0.8rem] text-plai-gray">1.75mm - 450g disponibles</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 rounded-xl bg-[#F4F6F9] p-4 transition-transform hover:-translate-y-0.5">
                      <div className="size-10 shrink-0 rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]" style={{ backgroundColor: '#3b82f6' }}></div>
                      <div>
                        <strong className="block font-heading text-[0.95rem] text-navy">TPU Azul (Flexible)</strong>
                        <p className="m-0 text-[0.8rem] text-plai-gray">1.75mm - 600g disponibles</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-black/[0.08] bg-white p-8 shadow-[0_8px_30px_rgba(0,0,0,0.03)] md:p-10">
                  <div className="mb-6 flex items-center gap-4">
                    <Layers className="size-8 shrink-0" style={{ color: meta.color }} />
                    <h2 className="font-heading text-2xl font-extrabold tracking-[-0.02em] text-navy sm:text-[1.8rem]">Recomendaciones de Impresión</h2>
                  </div>
                  <ul className="mt-4 flex list-none flex-col gap-5 p-0">
                    <li className="relative pl-6 text-[0.95rem] leading-[1.6] text-plai-gray before:absolute before:left-0 before:top-0 before:font-bold before:text-plai before:content-['✓']"><strong className="text-navy">Formatos admitidos:</strong> Exporta tu modelo en formato .STL, .OBJ o .3MF.</li>
                    <li className="relative pl-6 text-[0.95rem] leading-[1.6] text-plai-gray before:absolute before:left-0 before:top-0 before:font-bold before:text-plai before:content-['✓']"><strong className="text-navy">Verifica las normales:</strong> Asegúrate de que tu malla sea &quot;manifold&quot; (cerrada) y no tenga caras invertidas.</li>
                    <li className="relative pl-6 text-[0.95rem] leading-[1.6] text-plai-gray before:absolute before:left-0 before:top-0 before:font-bold before:text-plai before:content-['✓']"><strong className="text-navy">Soportes:</strong> Considera la orientación para minimizar el uso de soportes, ahorrarás material y tiempo.</li>
                    <li className="relative pl-6 text-[0.95rem] leading-[1.6] text-plai-gray before:absolute before:left-0 before:top-0 before:font-bold before:text-plai before:content-['✓']"><strong className="text-navy">Tolerancias:</strong> Deja al menos 0.2mm de tolerancia para piezas que deben embonar.</li>
                  </ul>
                </div>
              </div>

              <div className="rounded-2xl border border-black/[0.08] bg-white p-8 shadow-[0_8px_30px_rgba(0,0,0,0.03)] md:p-10">
                <div className="mb-6 flex items-center gap-4">
                  <Coins className="size-8 shrink-0" style={{ color: meta.color }} />
                  <h2 className="font-heading text-2xl font-extrabold tracking-[-0.02em] text-navy sm:text-[1.8rem]">Cotización de Impresión 3D</h2>
                </div>
                <div className="mt-4 flex flex-col gap-6">
                  <p className="text-base text-plai-gray">¿Tienes un diseño listo pero no necesitas solicitar el equipo completo? Podemos imprimirlo por ti en nuestras impresoras 3D industriales Bambu Lab y Ender.</p>
                  {quoteSubmitted ? (
                    <div role="alert" className="flex items-center gap-4 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-800 animate-pop-in">
                      <CheckCircle2 size={36} className="shrink-0 text-emerald-600" />
                      <div>
                        <h3 className="font-heading font-bold text-emerald-900">
                          ¡Solicitud de cotización enviada con éxito!
                        </h3>
                        <p className="mt-1 text-sm text-emerald-700">
                          Folio de seguimiento: <strong className="font-mono font-bold text-emerald-900">{createdQuoteId || 'COT-104'}</strong>. El equipo técnico de manufactura aditiva de PLAi revisará la geometría de tu archivo y responderá a tu correo.
                        </p>
                        <button
                          type="button"
                          onClick={() => { setQuoteSubmitted(false); setCreatedQuoteId(''); }}
                          className="mt-3 text-xs font-bold text-emerald-800 underline hover:text-emerald-950"
                        >
                          Enviar otra solicitud
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form className="flex flex-col gap-5 rounded-xl bg-[#F4F6F9] p-6" onSubmit={handleQuoteSubmit}>
                      {quoteError && (
                        <div className="rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-700">
                          {quoteError}
                        </div>
                      )}

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="flex flex-col gap-1.5">
                          <label className="font-heading text-[0.85rem] font-bold text-navy">Nombre del solicitante *</label>
                          <input
                            type="text"
                            required
                            value={quoteName}
                            onChange={(e) => setQuoteName(e.target.value)}
                            placeholder="Ej. Ing. Carlos Mendoza"
                            className="w-full rounded-xl border border-black/[0.08] bg-white px-4 py-2.5 font-body text-[0.9rem] text-navy outline-none focus:border-plai"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="font-heading text-[0.85rem] font-bold text-navy">Correo institucional *</label>
                          <input
                            type="email"
                            required
                            value={quoteEmail}
                            onChange={(e) => setQuoteEmail(e.target.value)}
                            placeholder="usuario@plai.edu.mx"
                            className="w-full rounded-xl border border-black/[0.08] bg-white px-4 py-2.5 font-body text-[0.9rem] text-navy outline-none focus:border-plai"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="flex flex-col gap-1.5">
                          <label className="font-heading text-[0.85rem] font-bold text-navy">Teléfono / WhatsApp</label>
                          <input
                            type="tel"
                            value={quotePhone}
                            onChange={(e) => setQuotePhone(e.target.value)}
                            placeholder="33-1234-5678"
                            className="w-full rounded-xl border border-black/[0.08] bg-white px-4 py-2.5 font-body text-[0.9rem] text-navy outline-none focus:border-plai"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="font-heading text-[0.85rem] font-bold text-navy">Material deseado</label>
                          <select
                            value={quoteMaterial}
                            onChange={(e) => setQuoteMaterial(e.target.value)}
                            className="w-full cursor-pointer rounded-xl border border-black/[0.08] bg-white px-4 py-2.5 font-body text-[0.9rem] text-navy outline-none focus:border-plai"
                          >
                            <option value="PLA">PLA (Estándar prototipos)</option>
                            <option value="PETG">PETG (Resistencia química/mecánica)</option>
                            <option value="TPU (Flexible)">TPU (Flexible / Elastomérico)</option>
                            <option value="ABS">ABS (Térmico de ingeniería)</option>
                          </select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="font-heading text-[0.85rem] font-bold text-navy">Relleno (Infill)</label>
                          <select
                            value={quoteInfill}
                            onChange={(e) => setQuoteInfill(e.target.value)}
                            className="w-full cursor-pointer rounded-xl border border-black/[0.08] bg-white px-4 py-2.5 font-body text-[0.9rem] text-navy outline-none focus:border-plai"
                          >
                            <option value="15%">15% (Visual decorativo)</option>
                            <option value="20%">20% (Estándar recomendado)</option>
                            <option value="40%">40% (Carga media / funcional)</option>
                            <option value="80%">80% (Alta resistencia mecánica)</option>
                            <option value="100%">100% (Sólido macizo)</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="font-heading text-[0.85rem] font-bold text-navy">Archivo 3D (.stl, .obj, .3mf)</label>
                        <input
                          type="file"
                          accept=".stl,.obj,.3mf"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) setQuoteFilename(f.name);
                          }}
                          className="w-full rounded-xl border border-black/[0.08] bg-white px-4 py-2.5 font-body text-[0.9rem] file:mr-4 file:rounded-full file:border-0 file:bg-plai/10 file:px-4 file:py-1.5 file:font-heading file:font-semibold file:text-plai"
                        />
                        <span className="text-xs text-plai-muted">
                          {quoteFilename ? (
                            <strong className="text-plai">Archivo cargado: {quoteFilename}</strong>
                          ) : (
                            'Puedes adjuntar tu archivo CAD/STL o especificar dimensiones en el campo de detalles.'
                          )}
                        </span>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="font-heading text-[0.85rem] font-bold text-navy">Detalles adicionales o requerimientos</label>
                        <textarea
                          value={quoteDetails}
                          onChange={(e) => setQuoteDetails(e.target.value)}
                          className="w-full rounded-xl border border-black/[0.08] bg-white px-4 py-2.5 font-body text-[0.9rem] text-navy outline-none focus:border-plai"
                          placeholder="Ej. Color negro de preferencia, altura de capa de 0.16mm para mayor detalle superficial..."
                          rows={2}
                        ></textarea>
                      </div>

                      <button
                        type="submit"
                        disabled={quoteLoading}
                        className="mt-2 cursor-pointer self-start rounded-xl px-7 py-3 font-heading text-base font-bold text-white transition-all hover:-translate-y-0.5 hover:opacity-90 disabled:opacity-50"
                        style={{ backgroundColor: meta.color }}
                      >
                        {quoteLoading ? 'Enviando solicitud...' : 'Solicitar Cotización de Impresión'}
                      </button>
                    </form>
                  )}
                </div>
              </div>

            </div>
          )}
        </div>
      </div>

      {/* Modal de ficha de equipo (con botón de reserva interno) */}
      {deviceForDetails && (
        <EquipmentDetailModal
          device={deviceForDetails}
          onClose={() => setSelectedDetailsId(null)}
          onReserve={(id) => { setSelectedDetailsId(null); setSelectedReserveId(id); }}
        />
      )}

      {/* Formulario de reserva */}
      {deviceForReserve && (
        <ReservationForm
          device={deviceForReserve}
          onClose={() => setSelectedReserveId(null)}
        />
      )}
    </div>
  );
}
