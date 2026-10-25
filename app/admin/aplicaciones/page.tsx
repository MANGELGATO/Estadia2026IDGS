"use client";

import React, { useState } from 'react';
import DataTable, { Column } from '../../components/admin/DataTable';
import StatCard from '../../components/admin/StatCard';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
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
  devicesInstalled: number;
  status: AppStatus;
};

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
    description: 'Secuela de Job Simulator en una isla de vacaciones virtual. Actividades al aire libre, juegos y diversión interactiva.',
    devicesInstalled: 12,
    status: 'Activa',
  },
  {
    id: 7,
    name: 'Apollo 11 VR HD',
    developer: 'Immersive VR Education',
    version: '2.0',
    category: 'Ciencia y Naturaleza',
    platform: 'Meta Quest + PC',
    ageRating: 'Todas las edades',
    description: 'Reconstrucción histórica del alunizaje del Apolo 11 en 1969 usando audio y datos reales de la NASA. Alta relevancia educativa.',
    devicesInstalled: 10,
    status: 'Activa',
  },
  {
    id: 8,
    name: 'National Geographic Explore VR',
    developer: 'Force Field VR',
    version: '1.3',
    category: 'Ciencia y Naturaleza',
    platform: 'Meta Quest',
    ageRating: 'Todas las edades',
    description: 'Expediciones a la Antártida y Machu Picchu como fotógrafo de National Geographic. Escalada, kayak y naturaleza.',
    devicesInstalled: 10,
    status: 'Activa',
  },
  {
    id: 9,
    name: 'First Steps & First Contact',
    developer: 'Oculus',
    version: '1.0',
    category: 'Experiencia VR',
    platform: 'Meta Quest',
    ageRating: 'Todas las edades',
    description: 'La experiencia de bienvenida perfecta para niños y personas que usan realidad virtual por primera vez. Robot amigable e interacción táctil.',
    devicesInstalled: 15,
    status: 'Activa',
  },
  {
    id: 10,
    name: 'Epic Roller Coasters',
    developer: 'B4T Games',
    version: '3.5',
    category: 'Experiencia VR',
    platform: 'Meta Quest',
    ageRating: 'Todas las edades',
    description: 'Montañas rusas en lugares fantásticos: dinosaurios, castillos medievales, el espacio. Muy emocionante para primeras experiencias.',
    devicesInstalled: 12,
    status: 'Activa',
  },
  {
    id: 11,
    name: 'Walkabout Mini Golf',
    developer: 'Mighty Coconut',
    version: '4.2',
    category: 'Deportes VR',
    platform: 'Meta Quest + PC',
    ageRating: 'Todas las edades',
    description: 'Minigolf relajante y divertido con física ultra-precisa y escenarios mágicos. Ideal para dinámicas en grupos pequeños.',
    devicesInstalled: 8,
    status: 'Activa',
  },
  {
    id: 12,
    name: 'ShapesXR',
    developer: 'ShapesXR',
    version: '2.1',
    category: 'Arte y Creatividad',
    platform: 'Meta Quest',
    ageRating: 'Todas las edades',
    description: 'Herramienta de diseño espacial en 3D para prototipar experiencias, interfaces y entornos virtuales en equipo.',
    devicesInstalled: 6,
    status: 'Activa',
  },
  {
    id: 13,
    name: 'Mission: ISS',
    developer: 'Magnopus / NASA',
    version: '1.2',
    category: 'Ciencia y Naturaleza',
    platform: 'Meta Quest + PC',
    ageRating: 'Todas las edades',
    description: 'Explora la Estación Espacial Internacional en gravedad cero con astronautas reales guiando el recorrido.',
    devicesInstalled: 10,
    status: 'Activa',
  },
  {
    id: 14,
    name: 'Gadgeteer',
    developer: 'Metanaut',
    version: '1.5.2',
    category: 'Juego Educativo',
    platform: 'Meta Quest',
    ageRating: 'Todas las edades',
    description: 'Construye máquinas de reacción en cadena (estilo Rube Goldberg) usando física real. Enseña pensamiento lógico e ingeniería.',
    devicesInstalled: 8,
    status: 'Activa',
  },
  {
    id: 15,
    name: 'Elixir',
    developer: 'Magnopus',
    version: '1.1',
    category: 'Experiencia VR',
    platform: 'Meta Quest',
    ageRating: 'Todas las edades',
    description: 'Experiencia con seguimiento de manos (sin controles). Conviértete en aprendiz de brujo e interactúa con pociones y criaturas usando solo las manos.',
    devicesInstalled: 15,
    status: 'Activa',
  },
];

const categoryColors: Record<AppCategory, { bg: string; color: string; emoji: string }> = {
  'Juego Educativo':    { bg: 'rgba(59,130,246,0.12)',  color: '#2563EB', emoji: '🧩' },
  'Experiencia VR':     { bg: 'rgba(168,30,113,0.12)',  color: '#a81e71', emoji: '✨' },
  'Simulación':         { bg: 'rgba(245,158,11,0.12)',  color: '#D97706', emoji: '🏗️' },
  'Juego Interactivo':  { bg: 'rgba(139,92,246,0.12)',  color: '#7C3AED', emoji: '🎯' },
  'Arte y Creatividad': { bg: 'rgba(236,72,153,0.12)',  color: '#DB2777', emoji: '🎨' },
  'Ciencia y Naturaleza':{ bg: 'rgba(16,185,129,0.12)', color: '#059669', emoji: '🌿' },
  'Deportes VR':        { bg: 'rgba(249,115,22,0.12)',  color: '#EA580C', emoji: '⛳' },
};

const platformConfig: Record<Platform, { bg: string; color: string; icon: string }> = {
  'Meta Quest':      { bg: 'rgba(168,30,113,0.1)', color: '#a81e71', icon: '🥽' },
  'PC':              { bg: 'rgba(30,41,59,0.1)',   color: '#1E293B', icon: '💻' },
  'Meta Quest + PC': { bg: 'rgba(79,70,229,0.1)',  color: '#4F46E5', icon: '🎮' },
};

const ALL_CATEGORIES: AppCategory[] = [
  'Juego Educativo',
  'Experiencia VR',
  'Simulación',
  'Juego Interactivo',
  'Arte y Creatividad',
  'Ciencia y Naturaleza',
  'Deportes VR',
];

const ALL_PLATFORMS: Platform[] = ['Meta Quest', 'PC', 'Meta Quest + PC'];
const ALL_AGE_RATINGS: AgeRating[] = ['Todas las edades', '3+', '6+', '10+', '12+'];

export default function AplicacionesPage() {
  const [data, setData] = useState<Application[]>(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Application | null>(null);
  const [detailItem, setDetailItem] = useState<Application | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [deletingApp, setDeletingApp] = useState<Application | null>(null);

  const [filterPlatform, setFilterPlatform] = useState<string>('Todas');
  const [filterCategory, setFilterCategory] = useState<string>('Todas');

  const totalVR = data.filter(a => a.platform.includes('Meta Quest')).length;
  const totalPC = data.filter(a => a.platform.includes('PC')).length;
  const totalActivas = data.filter(a => a.status === 'Activa').length;
  const educativas = data.filter(a => a.category === 'Juego Educativo' || a.category === 'Ciencia y Naturaleza').length;

  const filteredData = data.filter(item => {
    const matchPlatform = filterPlatform === 'Todas' || item.platform === filterPlatform;
    const matchCategory = filterCategory === 'Todas' || item.category === filterCategory;
    return matchPlatform && matchCategory;
  });

  const handleAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: Application) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDetail = (item: Application) => {
    setDetailItem(item);
    setIsDetailOpen(true);
  };

  const handleDelete = (item: Application) => {
    setDeletingApp(item);
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
          <div className="flex items-center gap-3">
            <div className="flex size-[38px] shrink-0 items-center justify-center rounded-lg bg-gray-100 text-xl">
              {cfg.emoji}
            </div>
            <div>
              <div className="text-sm font-semibold text-navy">{value}</div>
              <div className="text-xs text-plai-muted">{item.developer}</div>
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
          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap" style={{ background: cfg.bg, color: cfg.color }}>
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
          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap" style={{ background: cfg.bg, color: cfg.color }}>
            {cfg.icon} {value}
          </span>
        );
      },
    },
    {
      key: 'ageRating',
      label: 'Edad',
      render: (value: AgeRating) => (
        <span className="inline-block rounded-md border border-gray-200 bg-gray-100 px-2 py-0.5 text-xs font-bold text-navy">{value}</span>
      ),
    },
    {
      key: 'devicesInstalled',
      label: 'Dispositivos',
      render: (value: number) => (
        <span className="font-semibold text-navy">
          {value} <span className="text-xs font-normal text-plai-muted">equipos</span>
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Estado',
      render: (value: AppStatus) => (
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${
          value === 'Activa' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
        }`}>
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
          className="flex items-center gap-1 rounded-md bg-[rgba(168,30,113,0.1)] px-3 py-1.5 text-xs font-semibold text-plai transition-colors hover:bg-plai hover:text-white"
        >
          <RiEyeLine /> Ver
        </button>
      ),
    },
  ];

  return (
    <div className="flex animate-pop-in flex-col gap-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="mb-1 font-heading text-3xl font-extrabold text-navy">Catálogo de Aplicaciones</h1>
          <p className="text-sm text-plai-muted md:text-base">Juegos y experiencias VR y PC disponibles en PLAi</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Apps VR (Quest)"  value={totalVR}    icon={<RiEyeLine />}     variant="primary" />
        <StatCard title="Apps para PC"     value={totalPC}    icon={<RiComputerLine />} variant="primary" />
        <StatCard title="Activas"          value={totalActivas} icon={<RiAppsLine />}  variant="success" />
        <StatCard title="Educativas"       value={educativas} icon={<RiGamepadLine />} variant="warning" />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-2xl border border-black/[0.06] bg-white p-5 shadow-plai-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 min-w-[80px] font-heading text-xs font-bold uppercase tracking-wider text-plai-muted whitespace-nowrap">Plataforma:</span>
          {['Todas', ...ALL_PLATFORMS].map(p => (
            <button
              key={p}
              className={`cursor-pointer rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                filterPlatform === p 
                  ? 'border border-plai bg-plai text-white shadow-sm' 
                  : 'border border-gray-200 bg-gray-100 text-gray-700 hover:border-plai hover:text-plai'
              }`}
              onClick={() => setFilterPlatform(p)}
            >
              {p === 'Meta Quest' ? '🥽' : p === 'PC' ? '💻' : p === 'Meta Quest + PC' ? '🎮' : ''} {p}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 min-w-[80px] font-heading text-xs font-bold uppercase tracking-wider text-plai-muted whitespace-nowrap">Categoría:</span>
          {['Todas', ...ALL_CATEGORIES].map(c => (
            <button
              key={c}
              className={`cursor-pointer rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                filterCategory === c 
                  ? 'border border-plai bg-plai text-white shadow-sm' 
                  : 'border border-gray-200 bg-gray-100 text-gray-700 hover:border-plai hover:text-plai'
              }`}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-pop-in" onClick={() => setIsDetailOpen(false)}>
          <div className="max-h-[90vh] w-full max-w-[560px] overflow-y-auto rounded-2xl border border-black/[0.08] bg-white p-6 shadow-2xl md:p-8" onClick={e => e.stopPropagation()}>
            <div className="mb-5 flex items-start gap-4">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gray-100 text-3xl">
                {categoryColors[detailItem.category].emoji}
              </div>
              <div className="flex-1">
                <h2 className="font-heading text-xl font-bold text-navy md:text-2xl">{detailItem.name}</h2>
                <p className="text-xs text-plai-muted">{detailItem.developer} · v{detailItem.version}</p>
              </div>
              <button className="flex size-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900" onClick={() => setIsDetailOpen(false)}><RiCloseLine className="text-xl" /></button>
            </div>

            <p className="mb-5 text-sm leading-relaxed text-gray-700">{detailItem.description}</p>

            <div className="mb-6 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap" style={{ background: categoryColors[detailItem.category].bg, color: categoryColors[detailItem.category].color }}>
                {categoryColors[detailItem.category].emoji} {detailItem.category}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap" style={{ background: platformConfig[detailItem.platform].bg, color: platformConfig[detailItem.platform].color }}>
                {platformConfig[detailItem.platform].icon} {detailItem.platform}
              </span>
              <span className="inline-block rounded-md border border-gray-200 bg-gray-100 px-2 py-0.5 text-xs font-bold text-navy">{detailItem.ageRating}</span>
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${
                detailItem.status === 'Activa' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {detailItem.status}
              </span>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-4 rounded-xl border border-black/[0.04] bg-gray-50 p-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold uppercase tracking-wider text-plai-muted">Versión</span>
                <span className="text-sm font-semibold text-gray-800">{detailItem.version}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold uppercase tracking-wider text-plai-muted">Edad recomendada</span>
                <span className="text-sm font-semibold text-gray-800">{detailItem.ageRating}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold uppercase tracking-wider text-plai-muted">Dispositivos instalados</span>
                <span className="text-sm font-semibold text-gray-800">{detailItem.devicesInstalled} equipos</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold uppercase tracking-wider text-plai-muted">Desarrollador</span>
                <span className="text-sm font-semibold text-gray-800">{detailItem.developer}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100" onClick={() => setIsDetailOpen(false)}>Cerrar</button>
              <button className="rounded-lg bg-plai px-5 py-2 text-sm font-semibold text-white shadow-md transition-all hover:bg-plai-dark" onClick={() => { setIsDetailOpen(false); handleEdit(detailItem); }}>
                Editar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-pop-in" onClick={() => setIsModalOpen(false)}>
          <div className="max-h-[90vh] w-full max-w-[640px] overflow-y-auto rounded-2xl border border-black/[0.08] bg-white p-6 shadow-2xl md:p-8" onClick={e => e.stopPropagation()}>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-heading text-xl font-bold text-navy md:text-2xl">
                {editingItem ? 'Editar Aplicación' : 'Agregar Aplicación'}
              </h2>
              <button className="flex size-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900" onClick={() => setIsModalOpen(false)}><RiCloseLine className="text-xl" /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-navy">Nombre de la Aplicación / Juego</label>
                  <input type="text" name="name" className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-800 transition-all focus:border-plai focus:outline-none focus:ring-2 focus:ring-plai/20" defaultValue={editingItem?.name} required placeholder="Ej. Beat Saber" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-navy">Desarrollador</label>
                  <input type="text" name="developer" className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-800 transition-all focus:border-plai focus:outline-none focus:ring-2 focus:ring-plai/20" defaultValue={editingItem?.developer} required placeholder="Ej. Beat Games" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-navy">Versión</label>
                  <input type="text" name="version" className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-800 transition-all focus:border-plai focus:outline-none focus:ring-2 focus:ring-plai/20" defaultValue={editingItem?.version} required placeholder="Ej. 1.37.0" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-navy">Categoría</label>
                  <select name="category" className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-800 transition-all focus:border-plai focus:outline-none focus:ring-2 focus:ring-plai/20" defaultValue={editingItem?.category || 'Juego Interactivo'}>
                    {ALL_CATEGORIES.map(c => (
                      <option key={c} value={c}>{categoryColors[c].emoji} {c}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-navy">Plataforma</label>
                  <select name="platform" className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-800 transition-all focus:border-plai focus:outline-none focus:ring-2 focus:ring-plai/20" defaultValue={editingItem?.platform || 'Meta Quest'}>
                    {ALL_PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-navy">Edad recomendada</label>
                  <select name="ageRating" className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-800 transition-all focus:border-plai focus:outline-none focus:ring-2 focus:ring-plai/20" defaultValue={editingItem?.ageRating || 'Todas las edades'}>
                    {ALL_AGE_RATINGS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-navy">Dispositivos instalados</label>
                  <input type="number" name="devicesInstalled" className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-800 transition-all focus:border-plai focus:outline-none focus:ring-2 focus:ring-plai/20" defaultValue={editingItem?.devicesInstalled ?? 0} min="0" required />
                </div>
                {editingItem && (
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-navy">Estado</label>
                    <select name="status" className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-800 transition-all focus:border-plai focus:outline-none focus:ring-2 focus:ring-plai/20" defaultValue={editingItem?.status || 'Activa'}>
                      <option value="Activa">Activa</option>
                      <option value="Inactiva">Inactiva</option>
                    </select>
                  </div>
                )}
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-navy">Descripción</label>
                  <textarea
                    name="description"
                    className="w-full resize-y rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-800 transition-all focus:border-plai focus:outline-none focus:ring-2 focus:ring-plai/20"
                    defaultValue={editingItem?.description}
                    rows={3}
                    placeholder="Describe brevemente la aplicación y su uso en PLAI..."
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="flex items-center gap-1 rounded-lg bg-plai px-5 py-2 text-sm font-semibold text-white shadow-md transition-all hover:bg-plai-dark">
                  <RiAddLine /> {editingItem ? 'Guardar Cambios' : 'Agregar al Catálogo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deletingApp}
        title="¿Quitar aplicación del catálogo?"
        description={`Se retirará "${deletingApp?.name}" de la lista pública de aplicaciones disponibles en PLAi.`}
        confirmText="Quitar del catálogo"
        onConfirm={() => {
          if (deletingApp) {
            setData(data.filter(d => d.id !== deletingApp.id));
          }
        }}
        onClose={() => setDeletingApp(null)}
      />
    </div>
  );
}
