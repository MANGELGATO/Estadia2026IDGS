'use client';
import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { mockDevices } from '../../../lib/mockData';
import styles from './CategoryPage.module.css';
import { ArrowLeft, MapPin, Cpu, Lightbulb, Users, Target, CheckCircle2 } from 'lucide-react';
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
  const devices = mockDevices.filter(d => d.category === deviceCategory);

  const [selectedDetailsId, setSelectedDetailsId] = useState<string | null>(null);
  const [selectedReserveId, setSelectedReserveId]  = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const deviceForDetails = mockDevices.find(d => d.id === selectedDetailsId);
  const deviceForReserve = mockDevices.find(d => d.id === selectedReserveId);

  if (!meta) {
    return (
      <div className={styles.notFound}>
        <p>Categoría no encontrada.</p>
        <Link href="/" className={styles.backLink}><ArrowLeft size={16} /> Volver al inicio</Link>
      </div>
    );
  }

  return (
    <div className={isLoaded ? styles.pageLoaded : styles.pageInitial}>
      {/* Dynamic Hero Section */}
      <div className={styles.hero} style={{ '--cat-color': meta.color } as React.CSSProperties}>
        <div className={styles.heroBgEffect}></div>
        <div className={styles.heroContainer}>
          <Link href="/#dispositivos" className={styles.backLink}>
            <ArrowLeft size={18} /> Volver al Catálogo
          </Link>
          <div className={styles.heroContent}>
            <div className={styles.badgeLabel}>Saber Más</div>
            <h1 className={styles.heroTitle}>{meta.name}</h1>
            <p className={styles.heroDesc}>{meta.description}</p>
            <div className={styles.heroStats}>
              <div className={styles.stat}>
                <span className={styles.statValue}>{devices.length}</span>
                <span className={styles.statLabel}>Equipos Disponibles</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statValue}>{meta.successCases.length}+</span>
                <span className={styles.statLabel}>Casos de Éxito</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.contentContainer}>
          
          <div className={styles.twoColumnLayout}>
            {/* Información general de uso en PLAi */}
            <div className={styles.mainInfo}>
              <div className={styles.usageSection}>
                <div className={styles.sectionHeader}>
                  <Lightbulb className={styles.sectionIcon} style={{ color: meta.color }} />
                  <h2 className={styles.sectionTitle}>Aplicación en PLAi</h2>
                </div>
                <p className={styles.usageText}>{meta.plaiUsage}</p>
                
                <div className={styles.benefitsList}>
                  {meta.benefits.map((benefit, idx) => (
                    <div key={idx} className={styles.benefitItem}>
                      <CheckCircle2 size={18} style={{ color: meta.color }} />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Casos de Éxito Mockup */}
            <div className={styles.sideInfo}>
              <div className={styles.successSection}>
                <h3 className={styles.sideTitle}>Casos de Éxito Destacados</h3>
                <div className={styles.successCards}>
                  {meta.successCases.map((caseItem, idx) => (
                    <div key={idx} className={styles.successCard}>
                      <div className={styles.successCardAccent} style={{ backgroundColor: meta.color }}></div>
                      <h4>{caseItem.title}</h4>
                      <p>{caseItem.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Catálogo de Equipos de la categoría */}
          <div className={styles.catalogSection}>
            <div className={styles.sectionHeader}>
              <Target className={styles.sectionIcon} style={{ color: meta.color }} />
              <h2 className={styles.sectionTitle}>Equipos Disponibles para Solicitar</h2>
            </div>
            
            {devices.length === 0 ? (
              <div className={styles.empty}>No hay equipos registrados en esta categoría todavía.</div>
            ) : (
              <div className={styles.grid}>
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
