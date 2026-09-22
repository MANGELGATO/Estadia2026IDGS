'use client';

import Link from 'next/link';
import { mockApps } from '../../lib/mockData';
import styles from './AplicacionesPage.module.css';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';

const platformIcon: Record<string, string> = {
  'Meta Quest': '🥽',
  'PC': '💻',
  'Meta Quest + PC': '🎮',
};

const categoryColors: Record<string, { color: string; bg: string }> = {
  'Juego Educativo':     { color: '#059669', bg: 'rgba(16,185,129,0.1)' },
  'Experiencia VR':      { color: '#4F46E5', bg: 'rgba(99,102,241,0.1)' },
  'Simulación':          { color: '#D97706', bg: 'rgba(245,158,11,0.1)' },
  'Juego Interactivo':   { color: '#a81e71', bg: 'rgba(168,30,113,0.1)' },
  'Arte y Creatividad':  { color: '#DB2777', bg: 'rgba(236,72,153,0.1)' },
  'Ciencia y Naturaleza':{ color: '#0891B2', bg: 'rgba(6,182,212,0.1)'  },
  'Deportes VR':         { color: '#65A30D', bg: 'rgba(132,204,22,0.1)' },
};

const ALL_PLATFORMS = ['Todas', 'Meta Quest', 'PC', 'Meta Quest + PC'];

export default function AplicacionesPage() {
  const [filterPlatform, setFilterPlatform] = useState('Todas');

  const filtered = filterPlatform === 'Todas'
    ? mockApps
    : mockApps.filter(a => a.platform === filterPlatform || a.platform.includes(filterPlatform));

  return (
    <div>
      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.heroContainer}>
          <Link href="/" className={styles.backLink}>
            <ArrowLeft size={18} /> Volver al inicio
          </Link>
          <h1 className={styles.heroTitle}>Catálogo de Aplicaciones</h1>
          <p className={styles.heroDesc}>
            Juegos educativos e inmersivos para Meta Quest VR y PC disponibles en PLAi.
            Experiencias interactivas pensadas para niños y jóvenes.
          </p>
          <div className={styles.heroStats}>
            <span>🥽 {mockApps.filter(a => a.platform.includes('Meta Quest')).length} apps para Meta Quest</span>
            <span>💻 {mockApps.filter(a => a.platform.includes('PC')).length} apps para PC</span>
            <span>🎓 {mockApps.filter(a => a.category === 'Juego Educativo' || a.category === 'Ciencia y Naturaleza').length} educativas</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        <div className={styles.contentContainer}>

          {/* Platform Filters */}
          <div className={styles.filterBar}>
            {ALL_PLATFORMS.map(p => (
              <button
                key={p}
                className={`${styles.filterBtn} ${filterPlatform === p ? styles.filterBtnActive : ''}`}
                onClick={() => setFilterPlatform(p)}
              >
                {p === 'Meta Quest' ? '🥽 ' : p === 'PC' ? '💻 ' : p === 'Meta Quest + PC' ? '🎮 ' : ''}
                {p}
              </button>
            ))}
            <span className={styles.filterCount}>{filtered.length} aplicaciones</span>
          </div>

          {/* Grid */}
          <div className={styles.grid}>
            {filtered.map(app => {
              const catStyle = categoryColors[app.category] || { color: '#6B7280', bg: 'rgba(107,114,128,0.1)' };
              return (
                <div key={app.id} className={styles.card}>
                  <div className={styles.cardIcon}>{app.iconUrl}</div>
                  <div className={styles.cardBody}>
                    <div className={styles.cardMeta}>
                      <span
                        className={styles.category}
                        style={{ color: catStyle.color, background: catStyle.bg }}
                      >
                        {app.category}
                      </span>
                      <span className={styles.platformBadge}>
                        {platformIcon[app.platform]} {app.platform}
                      </span>
                    </div>
                    <h3 className={styles.title}>{app.name}</h3>
                    <p className={styles.developer}>{app.developer}</p>
                    <p className={styles.description}>{app.description}</p>
                    <div className={styles.cardFooter}>
                      <span className={styles.ageBadge}>👤 {app.ageRating}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
