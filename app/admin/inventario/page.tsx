"use client";

import React, { useState, useEffect, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import DataTable, { Column } from '../../components/admin/DataTable';
import StatCard from '../../components/admin/StatCard';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import { DeviceItem, mockDevices } from '../../../lib/mockData';
import { 
  RiArchiveLine, 
  RiCheckLine, 
  RiTimeLine, 
  RiToolsLine, 
  RiSearchLine, 
  RiFilter3Line,
  RiCloseLine,
  RiHardDriveLine,
  RiBarcodeLine
} from 'react-icons/ri';

function useIsMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

const CATEGORIES = [
  'Todas las categorías',
  'Realidad Virtual',
  'Robótica',
  'Fabricación digital',
  'Drones',
  'Cómputo',
];

const STATUSES = [
  'Todos los estados',
  'Disponible',
  'En uso',
  'En mantenimiento',
  'Reservado',
  'Fuera de servicio',
  'No disponible',
];

const EMOJI_OPTIONS = ['🥽', '🦾', '🤖', '🖨️', '🚁', '💻', '⚙️', '📡', '🔩', '🔧', '⚡', '🔋', '🔌', '🏠', '🖥️', '📦'];

export default function InventarioPage() {
  const mounted = useIsMounted();
  const [data, setData] = useState<DeviceItem[]>(mockDevices);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas las categorías');
  const [selectedStatus, setSelectedStatus] = useState('Todos los estados');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DeviceItem | null>(null);
  const [deletingEquipment, setDeletingEquipment] = useState<DeviceItem | null>(null);

  // Cargar datos reales desde la base de datos MySQL en MAMP
  useEffect(() => {
    fetch('/api/equipos')
      .then(res => res.json())
      .then(json => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setData(json.data);
        }
      })
      .catch(() => {});
  }, []);

  // Filtrado de equipos
  const filteredData = data.filter((item) => {
    const matchCat = selectedCategory === 'Todas las categorías' || item.category === selectedCategory;
    const matchStatus = selectedStatus === 'Todos los estados' || item.status === selectedStatus;
    const q = search.toLowerCase().trim();
    const matchQuery = !q || 
      item.name.toLowerCase().includes(q) ||
      item.brand.toLowerCase().includes(q) ||
      item.model.toLowerCase().includes(q) ||
      item.inventoryNumber.toLowerCase().includes(q) ||
      (item.serialNumber && item.serialNumber.toLowerCase().includes(q)) ||
      (item.storage && item.storage.toLowerCase().includes(q));
    
    return matchCat && matchStatus && matchQuery;
  });

  // Estadísticas rápidas
  const totalEquipos = data.length;
  const disponibles = data.filter(d => d.status === 'Disponible').length;
  const enUso = data.filter(d => d.status === 'En uso' || d.status === 'Reservado').length;
  const mantenimiento = data.filter(d => d.status === 'En mantenimiento' || d.status === 'Fuera de servicio').length;

  const columns: Column<DeviceItem>[] = [
    {
      key: 'inventoryNumber',
      label: 'Cód. PLAi',
      render: (val: string) => (
        <span className="inline-flex items-center gap-1 rounded bg-plai/10 px-2 py-0.5 font-mono text-xs font-bold text-plai">
          <RiBarcodeLine size={13} />
          {val}
        </span>
      ),
    },
    {
      key: 'name',
      label: 'Equipo / Modelo',
      render: (_: unknown, item: DeviceItem) => (
        <div className="flex items-center gap-2.5">
          <span className="text-xl shrink-0">{item.imageEmoji || '📦'}</span>
          <div>
            <span className="block font-heading font-semibold text-navy leading-tight">{item.name}</span>
            <span className="text-xs text-plai-muted">{item.brand} · {item.model}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'serialNumber',
      label: 'No. Serie',
      render: (val?: string) => (
        <span className="font-mono text-xs text-gray-600">
          {val || 'N/A'}
        </span>
      ),
    },
    {
      key: 'category',
      label: 'Categoría',
      render: (val: string) => (
        <span className="inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
          {val}
        </span>
      ),
    },
    {
      key: 'storage',
      label: 'Almacenamiento',
      render: (val?: string) => (
        <span className="inline-flex items-center gap-1 text-xs text-slate-600">
          <RiHardDriveLine className="text-sky-600" />
          {val && val !== 'N/A' ? val : '—'}
        </span>
      ),
    },
    {
      key: 'location',
      label: 'Ubicación',
      render: (val: string) => (
        <span className="text-xs text-plai-gray truncate max-w-[160px] inline-block" title={val}>
          {val}
        </span>
      ),
    },
    { 
      key: 'status', 
      label: 'Estado',
      render: (value: string) => {
        let bg = 'rgba(16, 185, 129, 0.12)';
        let color = '#10B981';
        
        if (value === 'En mantenimiento') {
          bg = 'rgba(245, 158, 11, 0.12)';
          color = '#F59E0B';
        } else if (value === 'En uso' || value === 'Reservado') {
          bg = 'rgba(249, 115, 22, 0.12)';
          color = '#EA580C';
        } else if (value === 'Fuera de servicio' || value === 'No disponible') {
          bg = 'rgba(239, 68, 68, 0.12)';
          color = '#EF4444';
        }

        return (
          <span style={{
            display: 'inline-block',
            padding: '0.2rem 0.65rem',
            borderRadius: '9999px',
            fontSize: '0.72rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            backgroundColor: bg,
            color: color
          }}>
            {value}
          </span>
        );
      }
    }
  ];

  const handleAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: DeviceItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = (item: DeviceItem) => {
    setDeletingEquipment(item);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Parse specs y accessories ingresados como saltos de línea
    const rawSpecs = (formData.get('specs') as string) || '';
    const specsArray = rawSpecs
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const rawAccessories = (formData.get('accessories') as string) || '';
    const accessoriesArray = rawAccessories
      .split('\n')
      .map(a => a.trim())
      .filter(Boolean);

    const newItem: DeviceItem = {
      id: editingItem ? editingItem.id : `eq-${Date.now()}`,
      name: (formData.get('name') as string).trim(),
      category: formData.get('category') as DeviceItem['category'],
      brand: (formData.get('brand') as string).trim(),
      model: (formData.get('model') as string).trim(),
      inventoryNumber: (formData.get('inventoryNumber') as string).trim(),
      serialNumber: (formData.get('serialNumber') as string).trim() || undefined,
      storage: (formData.get('storage') as string).trim() || 'N/A',
      location: (formData.get('location') as string).trim() || 'Laboratorio de Innovación PLAi',
      responsible: (formData.get('responsible') as string).trim() || 'Coordinación de Tecnologías PLAi',
      status: formData.get('status') as DeviceItem['status'],
      imageEmoji: (formData.get('imageEmoji') as string) || '📦',
      specs: specsArray.length > 0 ? specsArray : ['Equipo registrado en inventario PLAi'],
      accessories: accessoriesArray.length > 0 ? accessoriesArray : ['Equipo estándar'],
      observations: (formData.get('observations') as string).trim() || undefined,
      dateAdded: editingItem?.dateAdded || new Date().toISOString().split('T')[0],
      apps: editingItem?.apps,
    };

    // Persistir en MySQL (MAMP)
    fetch('/api/equipos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem),
    }).catch(err => {
      console.error('Error al persistir en MySQL:', err);
    });

    if (editingItem) {
      setData(data.map(d => d.id === editingItem.id ? newItem : d));
    } else {
      setData([newItem, ...data]);
    }
    setIsModalOpen(false);
  };

  const modalElement = isModalOpen && mounted ? (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-3 sm:p-5 backdrop-blur-sm"
      onClick={() => setIsModalOpen(false)}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="relative flex max-h-[92vh] w-full max-w-[720px] animate-pop-in flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Cabecera del modal */}
        <div className="flex shrink-0 items-center justify-between border-b border-black/[0.08] bg-[#F8FAFC] px-6 py-4">
          <div>
            <h2 className="font-heading text-lg sm:text-xl font-bold text-navy">
              {editingItem ? 'Modificar Recurso del Inventario' : 'Registrar Nuevo Recurso Tecnológico'}
            </h2>
            <p className="text-xs text-plai-muted">
              Captura todos los atributos patrimoniales, almacenamiento y características
            </p>
          </div>
          <button 
            type="button" 
            className="rounded-full p-1.5 text-gray-500 hover:bg-gray-200 hover:text-navy"
            onClick={() => setIsModalOpen(false)}
            aria-label="Cerrar modal"
          >
            <RiCloseLine size={22} />
          </button>
        </div>

        {/* Formulario scrolleable sin desbordamiento horizontal */}
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden p-6 gap-5">
          {/* SECCIÓN 1: Identificación Patrimonial */}
          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-plai">
              1. Control Patrimonial y Serie
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="mb-1 block text-xs font-bold text-navy">
                  Código PLAi / Resguardo *
                </label>
                <input 
                  type="text" 
                  name="inventoryNumber" 
                  required
                  placeholder="Ej. 5151000013-1 o PLAI-VR-015"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs sm:text-sm font-mono text-gray-800 focus:border-plai focus:outline-none focus:ring-1 focus:ring-plai" 
                  defaultValue={editingItem?.inventoryNumber} 
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-navy">
                  Número de Serie (Fábrica) *
                </label>
                <input 
                  type="text" 
                  name="serialNumber" 
                  required
                  placeholder="Ej. 1WMHH8100A05"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs sm:text-sm font-mono text-gray-800 focus:border-plai focus:outline-none focus:ring-1 focus:ring-plai" 
                  defaultValue={editingItem?.serialNumber} 
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-navy">
                  Icono / Emoji
                </label>
                <select 
                  name="imageEmoji" 
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-plai focus:outline-none"
                  defaultValue={editingItem?.imageEmoji || '📦'}
                >
                  {EMOJI_OPTIONS.map(em => (
                    <option key={em} value={em}>{em}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: Descripción y Fabricante */}
          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-plai">
              2. Datos del Equipo y Categoría
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-bold text-navy">
                  Nombre Completo del Equipo *
                </label>
                <input 
                  type="text" 
                  name="name" 
                  required
                  placeholder="Ej. Meta Quest 3 (512 GB) - Lote #5"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-plai focus:outline-none focus:ring-1 focus:ring-plai" 
                  defaultValue={editingItem?.name} 
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-navy">
                  Categoría Tecnológica *
                </label>
                <select 
                  name="category" 
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-plai focus:outline-none"
                  defaultValue={editingItem?.category || 'Realidad Virtual'}
                >
                  <option value="Realidad Virtual">Realidad Virtual</option>
                  <option value="Robótica">Robótica</option>
                  <option value="Fabricación digital">Fabricación digital</option>
                  <option value="Drones">Drones</option>
                  <option value="Cómputo">Cómputo</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-navy">
                  Marca *
                </label>
                <input 
                  type="text" 
                  name="brand" 
                  required
                  placeholder="Ej. Meta, DJI, Bambu Lab, Apple"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-plai focus:outline-none focus:ring-1 focus:ring-plai" 
                  defaultValue={editingItem?.brand} 
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-navy">
                  Modelo *
                </label>
                <input 
                  type="text" 
                  name="model" 
                  required
                  placeholder="Ej. Quest 3 512 GB, X1 Carbon AMS"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-plai focus:outline-none focus:ring-1 focus:ring-plai" 
                  defaultValue={editingItem?.model} 
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-navy">
                  Almacenamiento / Capacidad
                </label>
                <input 
                  type="text" 
                  name="storage" 
                  placeholder="Ej. 512 GB, 128 GB, 1 TB SSD, N/A"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-plai focus:outline-none focus:ring-1 focus:ring-plai" 
                  defaultValue={editingItem?.storage || 'N/A'} 
                />
              </div>
            </div>
          </div>

          {/* SECCIÓN 3: Ubicación y Resguardo */}
          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-plai">
              3. Ubicación y Estado de Disponibilidad
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="mb-1 block text-xs font-bold text-navy">
                  Estado *
                </label>
                <select 
                  name="status" 
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-plai focus:outline-none" 
                  defaultValue={editingItem?.status || 'Disponible'}
                >
                  <option value="Disponible">Disponible</option>
                  <option value="En uso">En uso</option>
                  <option value="Reservado">Reservado</option>
                  <option value="En mantenimiento">En mantenimiento</option>
                  <option value="Fuera de servicio">Fuera de servicio</option>
                  <option value="No disponible">No disponible</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-navy">
                  Ubicación Física
                </label>
                <input 
                  type="text" 
                  name="location" 
                  placeholder="Ej. Área de Realidad Virtual"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-plai focus:outline-none focus:ring-1 focus:ring-plai" 
                  defaultValue={editingItem?.location || 'Laboratorio de Innovación PLAi'} 
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-navy">
                  Responsable
                </label>
                <input 
                  type="text" 
                  name="responsible" 
                  placeholder="Ej. Lab. Tecnologías Inmersivas"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-plai focus:outline-none focus:ring-1 focus:ring-plai" 
                  defaultValue={editingItem?.responsible || 'Laboratorio de Innovación PLAi'} 
                />
              </div>
            </div>
          </div>

          {/* SECCIÓN 4: Características Técnicas y Accesorios */}
          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-plai">
              4. Ficha Técnica y Accesorios (1 por línea)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-bold text-navy">
                  Características Técnicas / Specs (1 por renglón)
                </label>
                <textarea 
                  name="specs" 
                  rows={4}
                  placeholder={"Almacenamiento 512 GB\nChip Snapdragon XR2 Gen 2\nHand Tracking con IA"}
                  className="w-full rounded-lg border border-gray-300 p-2.5 text-xs font-mono text-gray-800 focus:border-plai focus:outline-none focus:ring-1 focus:ring-plai"
                  defaultValue={editingItem?.specs ? editingItem.specs.join('\n') : ''}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-navy">
                  Accesorios Incluidos (1 por renglón)
                </label>
                <textarea 
                  name="accessories" 
                  rows={4}
                  placeholder={"2 Controladores Touch Plus\nCable USB-C de carga\nCargador oficial"}
                  className="w-full rounded-lg border border-gray-300 p-2.5 text-xs font-mono text-gray-800 focus:border-plai focus:outline-none focus:ring-1 focus:ring-plai"
                  defaultValue={editingItem?.accessories ? editingItem.accessories.join('\n') : ''}
                />
              </div>
            </div>
          </div>

          {/* SECCIÓN 5: Observaciones */}
          <div>
            <label className="mb-1 block text-xs font-bold text-navy">
              Observaciones o Notas de Mantenimiento
            </label>
            <input 
              type="text" 
              name="observations" 
              placeholder="Ej. En diagnóstico de pantalla, lote prioritario, etc."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-plai focus:outline-none focus:ring-1 focus:ring-plai" 
              defaultValue={editingItem?.observations || ''} 
            />
          </div>

          {/* Botones de acción del modal */}
          <div className="mt-4 flex shrink-0 justify-end gap-3 border-t border-black/[0.08] pt-4">
            <button 
              type="button" 
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100" 
              onClick={() => setIsModalOpen(false)}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="rounded-lg bg-plai px-5 py-2 text-sm font-semibold text-white shadow-md transition-all hover:bg-navy"
            >
              {editingItem ? 'Guardar Cambios' : 'Registrar Equipo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  ) : null;

  return (
    <div className="flex animate-pop-in flex-col gap-6">
      {/* Título y descripción */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-1 flex flex-wrap items-center gap-3">
            <h1 className="font-heading text-3xl font-extrabold text-navy">Control de Inventario Tecnológico</h1>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse"></span> MySQL Conectado (MAMP)
            </span>
          </div>
          <p className="text-sm text-plai-muted md:text-base">
            Catálogo patrimonial, especificaciones, almacenamiento y asignación de equipos de PLAi
          </p>
        </div>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Equipos" value={totalEquipos} icon={<RiArchiveLine />} variant="primary" />
        <StatCard title="Disponibles" value={disponibles} icon={<RiCheckLine />} variant="success" />
        <StatCard title="En uso / Reserva" value={enUso} icon={<RiTimeLine />} variant="warning" />
        <StatCard title="Mantenimiento" value={mantenimiento} icon={<RiToolsLine />} variant="danger" />
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-black/[0.08] bg-white p-4 shadow-plai-sm">
        {/* Input de Búsqueda */}
        <div className="relative min-w-[240px] flex-1">
          <RiSearchLine className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por código PLAi, serie, nombre o marca..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm text-navy placeholder:text-gray-400 focus:border-plai focus:outline-none focus:ring-1 focus:ring-plai"
          />
        </div>

        {/* Filtro por Categoría */}
        <div className="flex items-center gap-2">
          <RiFilter3Line className="text-gray-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-navy focus:border-plai focus:outline-none"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Filtro por Estado */}
        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-navy focus:border-plai focus:outline-none"
          >
            {STATUSES.map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla de Equipos con DataTable */}
      <DataTable 
        title={`Catálogo de Equipos (${filteredData.length} registros)`}
        columns={columns}
        data={filteredData}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        addActionLabel="Registrar Recurso"
      />

      {/* Modal montado vía portal */}
      {modalElement ? createPortal(modalElement, document.body) : null}

      {/* Diálogo de confirmación para baja */}
      <ConfirmDialog
        isOpen={!!deletingEquipment}
        title="¿Dar de baja equipo del inventario?"
        description={`El equipo "${deletingEquipment?.name}" (${deletingEquipment?.inventoryNumber}) será retirado del catálogo activo de PLAi.`}
        confirmText="Dar de baja"
        onConfirm={() => {
          if (deletingEquipment) {
            // Eliminar de forma permanente en la base de datos MySQL (MAMP)
            fetch(`/api/equipos?id=${encodeURIComponent(deletingEquipment.id)}`, {
              method: 'DELETE',
            }).catch(err => {
              console.error('Error al eliminar en MySQL:', err);
            });
            setData(data.filter(d => d.id !== deletingEquipment.id));
          }
        }}
        onClose={() => setDeletingEquipment(null)}
      />
    </div>
  );
}
