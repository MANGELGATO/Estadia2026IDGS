'use client';
import Link from 'next/link';
import styles from './CategoryCarousel.module.css';
import { Headset, Bot, Monitor, Plane, Printer, ArrowRight } from 'lucide-react';

const categories = [
  {
    id: 'realidad-virtual',
    filterKey: 'Realidad Virtual',
    name: 'Realidad Virtual',
    icon: Headset,
    description: 'Visores, controles y accesorios de última generación para experiencias inmersivas y simulaciones educativas.',
    color: '#7c3aed',
    count: 3,
  },
  {
    id: 'robotica',
    filterKey: 'Robótica',
    name: 'Robótica',
    icon: Bot,
    description: 'Brazos robóticos, kits Arduino y Raspberry Pi para programar y construir proyectos de automatización.',
    color: '#0ea5e9',
    count: 3,
  },
  {
    id: 'fabricacion-digital',
    filterKey: 'Fabricación digital',
    name: 'Fabricación Digital',
    icon: Printer,
    description: 'Impresoras 3D de alta velocidad y escáneres para convertir diseños digitales en objetos reales.',
    color: '#f59e0b',
    count: 3,
  },
  {
    id: 'drones',
    filterKey: 'Drones',
    name: 'Drones',
    icon: Plane,
    description: 'Drones profesionales para captura aérea, mapeo y entrenamiento de vuelo con controladores avanzados.',
    color: '#10b981',
    count: 2,
  },
  {
    id: 'computo-multimedia',
    filterKey: 'Cómputo',
    name: 'Cómputo / Multimedia',
    icon: Monitor,
    description: 'Equipos de alto rendimiento para diseño 3D, edición de video, desarrollo y gaming.',
    color: '#a81e71',
    count: 2,
  },
];

export default function CategoryCarousel() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.headerRow}>
          <h2 className={styles.sectionTitle}>Explora Categorías</h2>
          <Link href="#dispositivos" className={styles.seeAllBtn}>
            Ver todos los equipos <ArrowRight size={15} />
          </Link>
        </div>
        <div className={styles.carousel}>
          {categories.map((cat) => {
            return (
              <div
                key={cat.id}
                className={styles.card}
              >
                <div className={styles.cardInner}>
                  {/* Default state */}
                  <div className={styles.defaultState}>
                    <div
                      className={styles.iconWrapper}
                      style={{ '--cat-color': cat.color } as React.CSSProperties}
                    >
                      <cat.icon size={30} />
                    </div>
                    <span className={styles.name}>{cat.name}</span>
                    <span className={styles.count}>{cat.count} equipos</span>
                  </div>

                  {/* Hover / expanded state */}
                  <div className={styles.hoverState}>
                    <div
                      className={styles.hoverIcon}
                      style={{ background: cat.color } as React.CSSProperties}
                    >
                      <cat.icon size={26} color="white" />
                    </div>
                    <h3 className={styles.hoverName}>{cat.name}</h3>
                    <p className={styles.description}>{cat.description}</p>
                    <div className={styles.hoverActions}>
                      <Link href={`/categoria/${cat.id}`} className={styles.moreBtn}>
                        Saber más <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
