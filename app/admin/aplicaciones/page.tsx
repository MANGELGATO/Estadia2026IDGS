"use client";

import React, { useState } from 'react';
import styles from './page.module.css';
import DataTable, { Column } from '../../components/admin/DataTable';
import StatCard from '../../components/admin/StatCard';
import { RiAppsLine, RiGamepadLine, RiEyeLine, RiComputerLine, RiAddLine, RiCloseLine } from 'react-icons/ri';

type Platform = 'Meta Quest' | 'PC' | 'Meta Quest + PC';
type AgeRating = 'Todas las edades' | '3+' | '6+' | '10+' | '12+';
type AppCategory =
  | 'Juego Educativo'
  | 'Experiencia VR'
  | 'Simulación'
  | 'Juego Interactivo'
  | 'Arte y Creatividad'
  | 'Ciencia y Naturaleza'
  | 'Deportes VR';

type AppStatus = 'Activa' | 'Inactiva';

type Application = {
  id: number;
  name: string;
  developer: string;
  version: string;
  category: AppCategory;
  platform: Platform;
  ageRating: AgeRating;
  description: string;
  devicesInstalled: number; // cuántos dispositivos la tienen
  status: AppStatus;
};

// ─── Datos de ejemplo realistas para PLAI ──────────────────────────────────
const initialData: Application[] = [
  {
    id: 1,
    name: 'Tilt Brush',
    developer: 'Google',
    version: '22.0',
    category: 'Arte y Creatividad',
    platform: 'Meta Quest',
    ageRating: 'Todas las edades',
    description: 'Pinta en realidad virtual en 3D con pinceles y materiales mágicos. Ideal para talleres de arte inmersivo con niños.',
    devicesInstalled: 10,
    status: 'Activa',
  },
  {
    id: 2,
    name: 'Rec Room',
    developer: 'Against Gravity',
    version: '20240901',
    category: 'Juego Interactivo',
    platform: 'Meta Quest + PC',
    ageRating: 'Todas las edades',
    description: 'Mundo social con minijuegos cooperativos: paintball, dodgeball, escape rooms. Excelente para grupos de niños.',
    devicesInstalled: 15,
    status: 'Activa',
  },
  {
    id: 3,
    name: 'Ocean Rift',
    developer: 'Llyr ap Cenydd',
    version: '4.1',
    category: 'Ciencia y Naturaleza',
    platform: 'Meta Quest',
    ageRating: 'Todas las edades',
    description: 'Parque acuático virtual con tiburones, ballenas, delfines y tortugas. Experiencia educativa sobre el océano.',
    devicesInstalled: 15,
    status: 'Activa',
  },
  {
    id: 4,
    name: 'Beat Saber',
    developer: 'Beat Games',
    version: '1.37.0',
    category: 'Juego Interactivo',
    platform: 'Meta Quest',
    ageRating: '6+',
    description: 'Juego rítmico con sables de luz. Coordinar movimientos con la música. Muy popular en demostraciones para niños.',
    devicesInstalled: 15,
    status: 'Activa',
  },
  {
    id: 5,
    name: 'Job Simulator',
    developer: 'Owlchemy Labs',
    version: '1.4.0',
    category: 'Simulación',
    platform: 'Meta Quest',
    ageRating: 'Todas las edades',
    description: 'Simula trabajos cotidianos (chef, mecánico, oficinista) en un mundo futurista donde los robots hacen todo. Divertido y educativo.',
    devicesInstalled: 15,
    status: 'Activa',
  },
  {
    id: 6,
    name: 'Vacation Simulator',
    developer: 'Owlchemy Labs',
    version: '1.2.0',
    category: 'Simulación',
    platform: 'Meta Quest',
    ageRating: 'Todas las edades',
    description: 'Experiencia de vacaciones virtuales en playa, montaña y ciudad. Excelente para primeras experiencias VR con niños pequeños.',
    devicesInstalled: 15,
    status: 'Activa',
  },
  {
    id: 7,
    name: 'National Geographic Explore VR',
    developer: 'National Geographic',
    version: '2.0',
    category: 'Ciencia y Naturaleza',
    platform: 'Meta Quest',
    ageRating: 'Todas las edades',
    description: 'Explora la Antártida y Machu Picchu en VR. Kayak entre icebergs y aprende sobre ecosistemas. Contenido educativo certificado.',
    devicesInstalled: 10,
    status: 'Activa',
  },
  {
    id: 8,
    name: 'Spatial',
    developer: 'Spatial Systems',
    version: '3.5.1',
    category: 'Experiencia VR',
    platform: 'Meta Quest + PC',
    ageRating: 'Todas las edades',
    description: 'Plataforma de colaboración y exhibiciones en VR. Se usa para presentaciones de proyectos y galerías virtuales en PLAI.',
    devicesInstalled: 15,
    status: 'Activa',
  },
  {
    id: 9,
    name: 'Richie\'s Plank Experience',
    developer: 'Toast VR',
    version: '2.1',
    category: 'Experiencia VR',
    platform: 'Meta Quest',
    ageRating: '10+',
    description: 'Experiencia de altura extrema en VR. Ideal para demostraciones del efecto de presencia en realidad virtual.',
    devicesInstalled: 15,
    status: 'Activa',
  },
  {
    id: 10,
    name: 'Pistol Whip',
    developer: 'Cloudhead Games',
    version: '1.0.17',
    category: 'Juego Interactivo',
    platform: 'Meta Quest',
    ageRating: '12+',
    description: 'Juego de acción rítmica al estilo John Wick. Moverse y disparar al ritmo de la música. Popular en talleres para jóvenes.',
    devicesInstalled: 15,
    status: 'Activa',
  },
  {
    id: 11,
    name: 'The Room VR',
    developer: 'Fireproof Games',
    version: '1.0',
    category: 'Juego Educativo',
    platform: 'Meta Quest',
    ageRating: '10+',
    description: 'Juego de escape room con acertijos y puzzles intrincados en VR. Desarrolla pensamiento lógico y resolución de problemas.',
    devicesInstalled: 8,
    status: 'Activa',
  },
  {
    id: 12,
    name: 'Minecraft Education Edition',
    developer: 'Microsoft',
    version: '1.21.0',
    category: 'Juego Educativo',
    platform: 'PC',
    ageRating: '6+',
    description: 'Versión educativa de Minecraft con lecciones de matemáticas, ciencias, historia y código. Licencias institucionales PLAI.',
    devicesInstalled: 30,
    status: 'Activa',
  },
  {
    id: 13,
    name: 'Superhot VR',
    developer: 'Superhot Team',
    version: '1.1.0',
    category: 'Juego Interactivo',
    platform: 'Meta Quest',
    ageRating: '12+',
    description: 'El tiempo solo avanza cuando te mueves. Juego de acción innovador que demuestra las capacidades únicas del VR.',
    devicesInstalled: 15,
    status: 'Inactiva',
  },
  {
    id: 14,
    name: 'Star Chart',
    developer: 'Escape Velocity Limited',
    version: '5.3',
    category: 'Ciencia y Naturaleza',
    platform: 'Meta Quest',
    ageRating: 'Todas las edades',
    description: 'Planetario virtual interactivo. Explora constelaciones, planetas y galaxias. Perfecto para talleres de astronomía con niños.',
    devicesInstalled: 15,
    status: 'Activa',
  },
  {
    id: 15,
    name: 'Fruit Ninja VR 2',
    developer: 'Halfbrick Studios',
    version: '2.0.3',
    category: 'Juego Interactivo',
    platform: 'Meta Quest',
    ageRating: 'Todas las edades',
    description: 'Corta frutas volando con katanas en realidad virtual. Primera experiencia VR perfecta para niños pequeños.',
    devicesInstalled: 15,
    status: 'Activa',
  },
];

// ─── Helpers ────────────────────────────────────────────────────────────────
const categoryColors: Record<AppCategory, { bg: string; color: string; emoji: string }> = {
  'Juego Educativo':    { bg: 'rgba(16,185,129,0.12)',  color: '#059669', emoji: '🎓' },
  'Experiencia VR':     { bg: 'rgba(99,102,241,0.12)',  color: '#4F46E5', emoji: '🥽' },
  'Simulación':         { bg: 'rgba(245,158,11,0.12)',  color: '#D97706', emoji: '🎮' },
  'Juego Interactivo':  { bg: 'rgba(168,30,113,0.12)',  color: '#a81e71', emoji: '⚡' },
  'Arte y Creatividad': { bg: 'rgba(236,72,153,0.12)',  color: '#DB2777', emoji: '🎨' },
  'Ciencia y Naturaleza':{ bg: 'rgba(6,182,212,0.12)',  color: '#0891B2', emoji: '🌊' },
  'Deportes VR':        { bg: 'rgba(132,204,22,0.12)',  color: '#65A30D', emoji: '⚽' },
};

const platformConfig: Record<Platform, { bg: string; color: string; icon: React.ReactNode }> = {
  'Meta Quest':      { bg: 'rgba(168,30,113,0.1)',  color: '#a81e71',   icon: <RiEyeLine /> },
  'PC':              { bg: 'rgba(59,130,246,0.1)',   color: '#2563EB',   icon: <RiComputerLine /> },
  'Meta Quest + PC': { bg: 'rgba(99,102,241,0.1)',  color: '#4F46E5',   icon: <RiGamepadLine /> },
};

const ALL_CATEGORIES: AppCategory[] = [
  'Juego Educativo', 'Experiencia VR', 'Simulación',
  'Juego Interactivo', 'Arte y Creatividad', 'Ciencia y Naturaleza', 'Deportes VR',
];
const ALL_PLATFORMS: Platform[] = ['Meta Quest', 'PC', 'Meta Quest + PC'];
const ALL_AGE_RATINGS: AgeRating[] = ['Todas las edades', '3+', '6+', '10+', '12+'];

export default function AplicacionesPage() {
  const [data, setData] = useState<Application[]>(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Application | null>(null);
  const [detailItem, setDetailItem] = useState<Application | null>(null);
  const [filterPlatform, setFilterPlatform] = useState<string>('Todas');
  const [filterCategory, setFilterCategory] = useState<string>('Todas');

  // ── Stats ──
  const totalVR = data.filter(a => a.platform.includes('Meta Quest')).length;
  const totalPC = data.filter(a => a.platform.includes('PC')).length;
  const totalActivas = data.filter(a => a.status === 'Activa').length;
  const educativas = data.filter(a => a.category === 'Juego Educativo' || a.category === 'Ciencia y Naturaleza').length;

  // ── Filters ──
  const filteredData = data.filter(a => {
    const matchPlatform = filterPlatform === 'Todas' || a.platform === filterPlatform || a.platform.includes(filterPlatform);
    const matchCat = filterCategory === 'Todas' || a.category === filterCategory;
    return matchPlatform && matchCat;
  });

  // ── Handlers ──
  const handleAdd = () => { setEditingItem(null); setIsModalOpen(true); };
  const handleEdit = (item: Application) => { setEditingItem(item); setIsModalOpen(true); };
  const handleDetail = (item: Application) => { setDetailItem(item); setIsDetailOpen(true); };
  const handleDelete = (item: Application) => {
    if (confirm(`¿Quitar "${item.name}" del catálogo?`)) {
      setData(data.filter(d => d.id !== item.id));
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const item: Application = {
      id: editingItem ? editingItem.id : Date.now(),
      name: fd.get('name') as string,
      developer: fd.get('developer') as string,
      version: fd.get('version') as string,
      category: fd.get('category') as AppCategory,
      platform: fd.get('platform') as Platform,
      ageRating: fd.get('ageRating') as AgeRating,
      description: fd.get('description') as string,
      devicesInstalled: parseInt(fd.get('devicesInstalled') as string, 10) || 0,
      status: (fd.get('status') as AppStatus) || 'Activa',
    };
    if (editingItem) {
      setData(data.map(d => d.id === editingItem.id ? item : d));
    } else {
      setData([item, ...data]);
    }
    setIsModalOpen(false);
  };

  // ── Columns ──
  const columns: Column[] = [
    {
      key: 'name',
      label: 'Aplicación',
      render: (value, item: Application) => {
        const cfg = categoryColors[item.category];
        return (
          <div className={styles.appCell}>
            <div className={styles.appEmoji}>{cfg.emoji}</div>
            <div>
              <div className={styles.appName}>{value}</div>
              <div className={styles.appDev}>{item.developer}</div>
            </div>
          </div>
        );
      },
    },
    {
      key: 'category',
      label: 'Categoría',
      render: (value: AppCategory) => {
        const cfg = categoryColors[value];
        return (
          <span className={styles.badge} style={{ background: cfg.bg, color: cfg.color }}>
            {cfg.emoji} {value}
          </span>
        );
      },
    },
    {
      key: 'platform',
      label: 'Plataforma',
      render: (value: Platform) => {
        const cfg = platformConfig[value];
        return (
          <span className={styles.badge} style={{ background: cfg.bg, color: cfg.color }}>
            {cfg.icon} {value}
          </span>
        );
      },
    },
    {
      key: 'ageRating',
      label: 'Edad',
      render: (value: AgeRating) => (
        <span className={styles.ageBadge}>{value}</span>
      ),
    },
    {
      key: 'devicesInstalled',
      label: 'Dispositivos',
      render: (value: number) => (
        <span style={{ fontWeight: 600, color: 'var(--text-navy)' }}>
          {value} <span style={{ fontWeight: 400, color: 'var(--text-light)', fontSize: '0.8rem' }}>equipos</span>
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Estado',
      render: (value: AppStatus) => (
        <span className={styles.badge} style={{
          background: value === 'Activa' ? 'rgba(16,185,129,0.12)' : 'rgba(107,114,128,0.1)',
          color: value === 'Activa' ? '#059669' : '#6B7280',
        }}>
          {value}
        </span>
      ),
    },
    {
      key: 'id',
      label: 'Ver más',
      render: (_, item) => (
        <button
          onClick={() => handleDetail(item)}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.25rem',
            padding: '0.3rem 0.7rem', borderRadius: '0.4rem',
            background: 'rgba(168,30,113,0.1)', color: 'var(--primary)',
            fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', border: 'none',
          }}
        >
          <RiEyeLine /> Ver
        </button>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Catálogo de Aplicaciones</h1>
          <p className={styles.subtitle}>Juegos y experiencias VR y PC disponibles en PLAi</p>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        <StatCard title="Apps VR (Quest)"  value={totalVR}    icon={<RiEyeLine />}     variant="primary" />
        <StatCard title="Apps para PC"     value={totalPC}    icon={<RiComputerLine />} variant="primary" />
        <StatCard title="Activas"          value={totalActivas} icon={<RiAppsLine />}  variant="success" />
        <StatCard title="Educativas"       value={educativas} icon={<RiGamepadLine />} variant="warning" />
      </div>

      {/* Filters */}
      <div className={styles.filtersBar}>
        <div className={styles.filterGroup}>
          <span className={styles.filterGroupLabel}>Plataforma:</span>
          {['Todas', ...ALL_PLATFORMS].map(p => (
            <button
              key={p}
              className={`${styles.filterBtn} ${filterPlatform === p ? styles.filterBtnActive : ''}`}
              onClick={() => setFilterPlatform(p)}
            >
              {p === 'Meta Quest' ? '🥽' : p === 'PC' ? '💻' : p === 'Meta Quest + PC' ? '🎮' : ''} {p}
            </button>
          ))}
        </div>
        <div className={styles.filterGroup}>
          <span className={styles.filterGroupLabel}>Categoría:</span>
          {['Todas', ...ALL_CATEGORIES].map(c => (
            <button
              key={c}
              className={`${styles.filterBtn} ${filterCategory === c ? styles.filterBtnActive : ''}`}
              onClick={() => setFilterCategory(c)}
            >
              {c !== 'Todas' ? categoryColors[c as AppCategory].emoji + ' ' : ''}{c}
            </button>
          ))}
        </div>
      </div>

      <DataTable
        title={`Aplicaciones (${filteredData.length})`}
        columns={columns}
        data={filteredData}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        addActionLabel="Agregar App"
      />

      {/* Detail Modal */}
      {isDetailOpen && detailItem && (
        <div className={styles.modalOverlay} onClick={() => setIsDetailOpen(false)}>
          <div className={styles.modal} style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
            <div className={styles.detailHeader}>
              <div className={styles.detailEmoji}>
                {categoryColors[detailItem.category].emoji}
              </div>
              <div style={{ flex: 1 }}>
                <h2 className={styles.modalTitle}>{detailItem.name}</h2>
                <p style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>{detailItem.developer} · v{detailItem.version}</p>
              </div>
              <button className={styles.closeBtn} onClick={() => setIsDetailOpen(false)}><RiCloseLine /></button>
            </div>

            <p className={styles.detailDescription}>{detailItem.description}</p>

            <div className={styles.detailChips}>
              <span className={styles.badge} style={{ background: categoryColors[detailItem.category].bg, color: categoryColors[detailItem.category].color }}>
                {categoryColors[detailItem.category].emoji} {detailItem.category}
              </span>
              <span className={styles.badge} style={{ background: platformConfig[detailItem.platform].bg, color: platformConfig[detailItem.platform].color }}>
                {platformConfig[detailItem.platform].icon} {detailItem.platform}
              </span>
              <span className={styles.ageBadge}>{detailItem.ageRating}</span>
              <span className={styles.badge} style={{
                background: detailItem.status === 'Activa' ? 'rgba(16,185,129,0.12)' : 'rgba(107,114,128,0.1)',
                color: detailItem.status === 'Activa' ? '#059669' : '#6B7280',
              }}>
                {detailItem.status}
              </span>
            </div>

            <div className={styles.detailGrid}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Versión</span>
                <span className={styles.detailValue}>{detailItem.version}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Edad recomendada</span>
                <span className={styles.detailValue}>{detailItem.ageRating}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Dispositivos instalados</span>
                <span className={styles.detailValue}>{detailItem.devicesInstalled} equipos</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Desarrollador</span>
                <span className={styles.detailValue}>{detailItem.developer}</span>
              </div>
            </div>

            <div className={styles.modalActions}>
              <button className={styles.btnCancel} onClick={() => setIsDetailOpen(false)}>Cerrar</button>
              <button className={styles.btnSubmit} onClick={() => { setIsDetailOpen(false); handleEdit(detailItem); }}>
                Editar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 className={styles.modalTitle}>
                {editingItem ? 'Editar Aplicación' : 'Agregar Aplicación'}
              </h2>
              <button className={styles.closeBtn} onClick={() => setIsModalOpen(false)}><RiCloseLine /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                  <label className={styles.label}>Nombre de la Aplicación / Juego</label>
                  <input type="text" name="name" className={styles.input} defaultValue={editingItem?.name} required placeholder="Ej. Beat Saber" />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Desarrollador</label>
                  <input type="text" name="developer" className={styles.input} defaultValue={editingItem?.developer} required placeholder="Ej. Beat Games" />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Versión</label>
                  <input type="text" name="version" className={styles.input} defaultValue={editingItem?.version} required placeholder="Ej. 1.37.0" />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Categoría</label>
                  <select name="category" className={styles.select} defaultValue={editingItem?.category || 'Juego Interactivo'}>
                    {ALL_CATEGORIES.map(c => (
                      <option key={c} value={c}>{categoryColors[c].emoji} {c}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Plataforma</label>
                  <select name="platform" className={styles.select} defaultValue={editingItem?.platform || 'Meta Quest'}>
                    {ALL_PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Edad recomendada</label>
                  <select name="ageRating" className={styles.select} defaultValue={editingItem?.ageRating || 'Todas las edades'}>
                    {ALL_AGE_RATINGS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Dispositivos instalados</label>
                  <input type="number" name="devicesInstalled" className={styles.input} defaultValue={editingItem?.devicesInstalled ?? 0} min="0" required />
                </div>
                {editingItem && (
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Estado</label>
                    <select name="status" className={styles.select} defaultValue={editingItem?.status || 'Activa'}>
                      <option value="Activa">Activa</option>
                      <option value="Inactiva">Inactiva</option>
                    </select>
                  </div>
                )}
                <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                  <label className={styles.label}>Descripción</label>
                  <textarea
                    name="description"
                    className={styles.input}
                    defaultValue={editingItem?.description}
                    rows={3}
                    placeholder="Describe brevemente la aplicación y su uso en PLAI..."
                    style={{ resize: 'vertical' }}
                  />
                </div>
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.btnCancel} onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className={styles.btnSubmit}>
                  <RiAddLine /> {editingItem ? 'Guardar Cambios' : 'Agregar al Catálogo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
