'use client';
import { useState } from 'react';
import Link from 'next/link';
import { mockDevices } from '../../../lib/mockData';
import styles from './CategoryPage.module.css';
import { ArrowLeft, MapPin, Cpu } from 'lucide-react';
import EquipmentCard from '../../components/EquipmentCard';
import EquipmentDetailModal from '../../components/EquipmentDetailModal';
import ReservationForm from '../../components/ReservationForm';

const categoryMeta: Record<string, { name: string; description: string; plaiUsage: string; color: string }> = {
  'realidad-virtual': {
    name: 'Realidad Virtual',
    description: 'Explora nuestra colección de dispositivos de realidad virtual. Visores, controles y accesorios de última generación para experiencias inmersivas.',
    plaiUsage: 'En PLAi utilizamos los visores de Realidad Virtual para simular entornos de alto riesgo, recorridos inmersivos de arquitectura y diseño, y desarrollar competencias en metaverso e interacción 3D para instituciones educativas y empresas.',
    color: '#7c3aed',
  },
  'robotica': {
    name: 'Robótica',
    description: 'Kits, brazos robóticos y componentes de automatización para aprender construyendo.',
    plaiUsage: 'Los laboratorios de robótica de PLAi permiten a los estudiantes y profesionales realizar prototipados rápidos, entender la automatización industrial (Industria 4.0) y programar desde cero algoritmos de inteligencia artificial aplicada al hardware.',
    color: '#0ea5e9',
  },
  'fabricacion-digital': {
    name: 'Fabricación Digital',
    description: 'Impresoras 3D, escáneres y materiales para transformar diseños en objetos reales.',
    plaiUsage: 'Promovemos la cultura Maker en Jalisco permitiendo que emprendedores y estudiantes validen sus diseños físicos rápidamente antes de pasar a producción masiva, abaratando los costos de innovación y desarrollo de producto.',
    color: '#f59e0b',
  },
  'drones': {
    name: 'Drones',
    description: 'Drones profesionales y educativos para captura aérea, mapeo y entrenamiento de vuelo.',
    plaiUsage: 'Con nuestra flota de Drones, apoyamos capacitaciones en fotogrametría, agricultura de precisión, seguridad y producciones audiovisuales, preparando a los asistentes para certificaciones de vuelo.',
    color: '#10b981',
  },
  'computo-multimedia': {
    name: 'Cómputo / Multimedia',
    description: 'Equipos de alto rendimiento para diseño, edición, gaming y desarrollo.',
    plaiUsage: 'Estaciones de trabajo de grado profesional disponibles para compilar código complejo, realizar renders arquitectónicos o desarrollar videojuegos pesados sin depender de infraestructura costosa propia.',
    color: '#a81e71',
  },
};

const categoryToDeviceCategory: Record<string, string> = {
  'realidad-virtual': 'Realidad Virtual',
  'robotica': 'Robótica',
  'fabricacion-digital': 'Fabricación digital',
  'drones': 'Drones',
  'computo-multimedia': 'Cómputo',
};

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const meta = categoryMeta[params.slug];
  const deviceCategory = categoryToDeviceCategory[params.slug];
  const devices = mockDevices.filter(d => d.category === deviceCategory);

  const [selectedDetailsId, setSelectedDetailsId] = useState<string | null>(null);
  const [selectedReserveId, setSelectedReserveId]  = useState<string | null>(null);

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
    <div>
      <div className={styles.hero} style={{ '--cat-color': meta.color } as React.CSSProperties}>
        <div className={styles.heroContainer}>
          <Link href="/#dispositivos" className={styles.backLink}>
            <ArrowLeft size={18} /> Volver al Catálogo
          </Link>
          <h1 className={styles.heroTitle}>{meta.name}</h1>
          <p className={styles.heroDesc}>{meta.description}</p>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.contentContainer}>
          
          {/* Nueva sección: Información general de uso en PLAi */}
          <div className={styles.usageSection}>
            <h2 className={styles.sectionTitle}>Aplicación en PLAi</h2>
            <p className={styles.usageText}>{meta.plaiUsage}</p>
          </div>

          <h2 className={styles.sectionTitle}>Equipos Disponibles para Solicitar</h2>
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
