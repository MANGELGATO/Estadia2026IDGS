"use client";

import React, { useState, useEffect, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import DataTable, { Column } from '../../components/admin/DataTable';
import StatCard from '../../components/admin/StatCard';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import { DeviceItem, mockDevices, UsageHistoryItem, mockUsageHistory } from '../../../lib/mockData';
import { 
  RiArchiveLine, 
  RiCheckLine, 
  RiTimeLine, 
  RiToolsLine, 
  RiSearchLine, 
  RiFilter3Line,
  RiCloseLine,
  RiHardDriveLine,
  RiBarcodeLine,
  RiHistoryLine,
  RiAddCircleLine,
  RiCalendarCheckLine,
  RiCheckboxCircleLine,
  RiFileList3Line,
  RiUploadCloud2Line
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
  const [imagePreview, setImagePreview] = useState<string>('');

  // Historial de uso y bitácora institucional
  const [historyList, setHistoryList] = useState<UsageHistoryItem[]>(mockUsageHistory);
  const [selectedHistoryEquipment, setSelectedHistoryEquipment] = useState<DeviceItem | null>(null);
  const [isGlobalHistoryOpen, setIsGlobalHistoryOpen] = useState(false);
  const [newHistoryFormOpen, setNewHistoryFormOpen] = useState(false);
  const [historySearch, setHistorySearch] = useState('');

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
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.name}
              className="size-10 rounded-lg border border-black/[0.08] bg-slate-50 object-contain p-1 shrink-0 shadow-2xs"
            />
          ) : (
            <span className="text-xl shrink-0">{item.imageEmoji || '📦'}</span>
          )}
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
    setImagePreview('');
    setIsModalOpen(true);
  };

  const handleEdit = (item: DeviceItem) => {
    setEditingItem(item);
    setImagePreview(item.imageUrl || '');
    setIsModalOpen(true);
  };

  const handleDelete = (item: DeviceItem) => {
    setDeletingEquipment(item);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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
      imageUrl: imagePreview.trim() || (formData.get('imageUrl') as string)?.trim() || editingItem?.imageUrl || undefined,
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

              {/* Imagen oficial del equipo */}
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-bold text-navy">
                  Fotografía / Imagen Oficial del Equipo
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    name="imageUrl"
                    placeholder="URL o ruta de imagen (ej. /images/equipos/meta-quest-3.png)"
                    value={imagePreview}
                    onChange={e => setImagePreview(e.target.value)}
                    className="w-full flex-1 rounded-lg border border-gray-300 px-3 py-2 text-xs sm:text-sm text-gray-800 focus:border-plai focus:outline-none focus:ring-1 focus:ring-plai"
                  />
                  <label className="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-plai/30 bg-plai/10 px-3 py-2 text-xs font-bold text-plai hover:bg-plai hover:text-white transition-all whitespace-nowrap">
                    <RiUploadCloud2Line className="text-sm" /> Subir archivo
                    <input type="file" accept="image/*" onChange={handleImageFileChange} className="hidden" />
                  </label>
                </div>
                {imagePreview && (
                  <div className="mt-2 flex items-center gap-3 rounded-lg border border-black/[0.06] bg-gray-50 p-2">
                    <img src={imagePreview} alt="Preview" className="size-12 rounded-lg object-contain bg-white border border-gray-200 p-1" />
                    <span className="text-xs text-plai-muted">Vista previa de imagen asignada</span>
                    <button 
                      type="button" 
                      onClick={() => setImagePreview('')} 
                      className="ml-auto text-xs text-rose-500 hover:underline"
                    >
                      Quitar imagen
                    </button>
                  </div>
                )}
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

  // Filtrado y cálculo para el modal de Historial de Uso
  const activeHistoryLogs = historyList
    .filter((log) => {
      if (selectedHistoryEquipment) {
        return log.deviceId === selectedHistoryEquipment.id || (!!log.deviceName && log.deviceName.toLowerCase().includes(selectedHistoryEquipment.name.toLowerCase()));
      }
      return true;
    })
    .filter((log) => {
      if (!historySearch.trim()) return true;
      const q = historySearch.toLowerCase();
      return (
        (!!log.deviceName && log.deviceName.toLowerCase().includes(q)) ||
        log.user.toLowerCase().includes(q) ||
        (!!log.institution && log.institution.toLowerCase().includes(q)) ||
        log.activity.toLowerCase().includes(q) ||
        (!!log.notes && log.notes.toLowerCase().includes(q))
      );
    });

  const totalHistoryHours = activeHistoryLogs.reduce((acc, curr) => acc + (curr.hoursUsed || 0), 0);

  const handleCreateHistoryEntry = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const targetDeviceId = selectedHistoryEquipment ? selectedHistoryEquipment.id : (formData.get('deviceId') as string);
    const foundDevice = data.find(d => d.id === targetDeviceId);
    const targetDeviceName = foundDevice 
      ? `${foundDevice.name} (${foundDevice.inventoryNumber})` 
      : (selectedHistoryEquipment ? `${selectedHistoryEquipment.name} (${selectedHistoryEquipment.inventoryNumber})` : 'Recurso Tecnológico PLAi');

    const newEntry: UsageHistoryItem = {
      id: `hist-${Date.now()}`,
      deviceId: targetDeviceId || 'eq-general',
      deviceName: targetDeviceName,
      user: (formData.get('user') as string).trim(),
      institution: (formData.get('institution') as string).trim() || 'Comunidad PLAi',
      activity: (formData.get('activity') as string).trim(),
      date: (formData.get('date') as string) || new Date().toISOString().split('T')[0],
      startTime: (formData.get('startTime') as string) || '09:00',
      endTime: (formData.get('endTime') as string) || '12:00',
      hoursUsed: parseFloat(formData.get('hoursUsed') as string) || 3.0,
      status: (formData.get('status') as UsageHistoryItem['status']) || 'Completado',
      conditionReturned: (formData.get('conditionReturned') as UsageHistoryItem['conditionReturned']) || 'Excelente',
      notes: (formData.get('notes') as string).trim() || 'Sin observaciones.',
    };

    setHistoryList([newEntry, ...historyList]);
    setNewHistoryFormOpen(false);
  };

  const historyModalElement = (selectedHistoryEquipment !== null || isGlobalHistoryOpen) && mounted ? (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-3 sm:p-5 backdrop-blur-sm animate-fade-in"
      onClick={() => {
        setSelectedHistoryEquipment(null);
        setIsGlobalHistoryOpen(false);
        setNewHistoryFormOpen(false);
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative flex max-h-[92vh] w-full max-w-[880px] animate-pop-in flex-col overflow-hidden rounded-2xl bg-white shadow-2xl border border-black/[0.08]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del modal */}
        <div className="flex shrink-0 items-center justify-between border-b border-black/[0.08] bg-[#F8FAFC] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 border border-sky-100">
              <RiHistoryLine size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading text-lg sm:text-xl font-bold text-navy">
                  {selectedHistoryEquipment
                    ? `Historial de Uso: ${selectedHistoryEquipment.name}`
                    : 'Bitácora Centralizada de Uso y Préstamos'}
                </h2>
                {selectedHistoryEquipment && (
                  <span className="rounded bg-plai/10 px-2 py-0.5 font-mono text-xs font-bold text-plai">
                    {selectedHistoryEquipment.inventoryNumber}
                  </span>
                )}
              </div>
              <p className="text-xs text-plai-muted">
                {selectedHistoryEquipment
                  ? `Serie: ${selectedHistoryEquipment.serialNumber || 'N/A'} · Ubicación: ${selectedHistoryEquipment.location} · Estado: ${selectedHistoryEquipment.status}`
                  : 'Trazabilidad institucional de sesiones, horas operadas y condiciones de retorno de equipos en PLAi'}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="rounded-full p-1.5 text-gray-500 hover:bg-gray-200 hover:text-navy transition-colors"
            onClick={() => {
              setSelectedHistoryEquipment(null);
              setIsGlobalHistoryOpen(false);
              setNewHistoryFormOpen(false);
            }}
            aria-label="Cerrar historial"
          >
            <RiCloseLine size={22} />
          </button>
        </div>

        {/* Resumen de Métricas de Uso */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-b border-black/[0.08] bg-[#FAFBFD] p-4 text-xs">
          <div className="rounded-xl border border-black/[0.05] bg-white p-3 shadow-2xs">
            <span className="block text-plai-muted text-[0.7rem] uppercase font-bold tracking-wider">Sesiones Totales</span>
            <strong className="font-heading text-lg font-extrabold text-navy">{activeHistoryLogs.length}</strong>
          </div>
          <div className="rounded-xl border border-black/[0.05] bg-white p-3 shadow-2xs">
            <span className="block text-plai-muted text-[0.7rem] uppercase font-bold tracking-wider">Horas Acumuladas</span>
            <strong className="font-heading text-lg font-extrabold text-sky-600">{totalHistoryHours.toFixed(1)} hrs</strong>
          </div>
          <div className="rounded-xl border border-black/[0.05] bg-white p-3 shadow-2xs">
            <span className="block text-plai-muted text-[0.7rem] uppercase font-bold tracking-wider">Estado Operativo</span>
            <strong className="font-heading text-sm font-bold text-emerald-600">
              {selectedHistoryEquipment ? selectedHistoryEquipment.status : 'Activo y Verificado'}
            </strong>
          </div>
          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={() => setNewHistoryFormOpen(!newHistoryFormOpen)}
              className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-plai px-3 py-2.5 font-heading text-xs font-bold text-white shadow-plai-sm hover:bg-navy transition-all active:scale-95"
            >
              <RiAddCircleLine size={16} />
              {newHistoryFormOpen ? 'Ocultar Formulario' : 'Registrar Nuevo Uso'}
            </button>
          </div>
        </div>

        {/* Formulario desplegable para registrar nuevo uso */}
        {newHistoryFormOpen && (
          <form
            onSubmit={handleCreateHistoryEntry}
            className="shrink-0 border-b border-sky-100 bg-sky-50/40 p-5 animate-fade-in text-xs flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <strong className="font-heading text-sm text-navy flex items-center gap-1.5">
                <RiCalendarCheckLine className="text-plai text-base" /> Captura de Nueva Sesión / Préstamo
              </strong>
              <span className="text-plai-muted">Todos los campos con * son obligatorios</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {isGlobalHistoryOpen && (
                <div>
                  <label className="mb-1 block font-bold text-navy">Equipo Tecnológico *</label>
                  <select
                    name="deviceId"
                    required
                    className="w-full rounded-lg border border-gray-300 bg-white p-2 text-xs text-navy focus:border-plai focus:outline-none"
                  >
                    {data.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.inventoryNumber})
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className={isGlobalHistoryOpen ? 'sm:col-span-1' : 'sm:col-span-1'}>
                <label className="mb-1 block font-bold text-navy">Usuario / Responsable *</label>
                <input
                  type="text"
                  name="user"
                  required
                  placeholder="Ej. Ing. Carlos Mendoza"
                  className="w-full rounded-lg border border-gray-300 bg-white p-2 text-xs text-navy focus:border-plai focus:outline-none"
                />
              </div>
              <div className={isGlobalHistoryOpen ? 'sm:col-span-1' : 'sm:col-span-2'}>
                <label className="mb-1 block font-bold text-navy">Institución / Empresa *</label>
                <input
                  type="text"
                  name="institution"
                  required
                  placeholder="Ej. UDG / ITESO / Startup Ecosistema"
                  className="w-full rounded-lg border border-gray-300 bg-white p-2 text-xs text-navy focus:border-plai focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="mb-1 block font-bold text-navy">Fecha de Uso *</label>
                <input
                  type="date"
                  name="date"
                  defaultValue={new Date().toISOString().split('T')[0]}
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white p-2 text-xs text-navy focus:border-plai focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block font-bold text-navy">Hora Inicio *</label>
                <input
                  type="time"
                  name="startTime"
                  defaultValue="10:00"
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white p-2 text-xs text-navy focus:border-plai focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block font-bold text-navy">Hora Fin *</label>
                <input
                  type="time"
                  name="endTime"
                  defaultValue="12:30"
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white p-2 text-xs text-navy focus:border-plai focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block font-bold text-navy">Horas Computadas</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  name="hoursUsed"
                  defaultValue="2.5"
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white p-2 text-xs text-navy focus:border-plai focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="mb-1 block font-bold text-navy">Actividad / Proyecto Realizado *</label>
                <input
                  type="text"
                  name="activity"
                  required
                  placeholder="Ej. Taller de Prototipado 3D para prótesis robótica"
                  className="w-full rounded-lg border border-gray-300 bg-white p-2 text-xs text-navy focus:border-plai focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block font-bold text-navy">Condición al Retorno *</label>
                <select
                  name="conditionReturned"
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white p-2 text-xs text-navy focus:border-plai focus:outline-none"
                >
                  <option value="Excelente">Excelente (Impecable)</option>
                  <option value="Bueno">Bueno (Sin fallas)</option>
                  <option value="Observación">Observación (Detalle/Ajuste)</option>
                  <option value="En revisión">En revisión (Mantenimiento)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block font-bold text-navy">Observaciones / Notas del Laboratorio</label>
              <textarea
                name="notes"
                rows={2}
                placeholder="Ej. Equipo devuelto con batería al 100%, accesorios completos y limpieza efectuada."
                className="w-full rounded-lg border border-gray-300 bg-white p-2 text-xs text-navy focus:border-plai focus:outline-none"
              ></textarea>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setNewHistoryFormOpen(false)}
                className="rounded-lg border border-gray-300 px-3 py-1.5 font-semibold text-gray-700 hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-lg bg-plai px-4 py-1.5 font-semibold text-white shadow hover:bg-navy"
              >
                Guardar en Bitácora
              </button>
            </div>
          </form>
        )}

        {/* Barra de búsqueda interna */}
        <div className="flex items-center gap-3 border-b border-black/[0.06] bg-white px-6 py-3">
          <div className="relative flex-1">
            <RiSearchLine className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Filtrar por solicitante, proyecto, institución o notas..."
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              className="w-full rounded-lg border border-gray-200 py-1.5 pl-8 pr-3 text-xs text-navy placeholder:text-gray-400 focus:border-plai focus:outline-none"
            />
          </div>
          <span className="text-xs text-plai-muted font-mono">
            {activeHistoryLogs.length} registro{activeHistoryLogs.length === 1 ? '' : 's'}
          </span>
        </div>

        {/* Listado desplazable de registros de uso */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeHistoryLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-plai-muted">
              <RiFileList3Line size={40} className="mb-3 text-gray-300" />
              <p className="font-heading text-sm font-semibold text-navy">No hay registros de uso coincidentes</p>
              <p className="mt-1 text-xs max-w-sm">
                No se encontraron bitácoras de préstamo para los filtros seleccionados. Utiliza el botón superior para capturar un nuevo registro.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeHistoryLogs.map((log) => {
                let badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                if (log.conditionReturned === 'Bueno') badgeColor = 'bg-sky-50 text-sky-700 border-sky-200';
                if (log.conditionReturned === 'Observación') badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
                if (log.conditionReturned === 'En revisión') badgeColor = 'bg-rose-50 text-rose-700 border-rose-200';

                return (
                  <div
                    key={log.id}
                    className="flex flex-col gap-2 rounded-xl border border-black/[0.08] bg-[#FDFDFE] p-4 text-xs transition-shadow hover:shadow-plai-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/[0.04] pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-navy">{log.date}</span>
                        <span className="text-plai-muted">&bull;</span>
                        <span className="font-mono text-plai-gray">
                          {log.startTime} - {log.endTime} ({log.hoursUsed} hrs)
                        </span>
                        {isGlobalHistoryOpen && (
                          <span className="rounded bg-slate-100 px-2 py-0.5 font-heading font-semibold text-slate-700">
                            {log.deviceName}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[0.7rem] font-bold ${badgeColor}`}>
                          <RiCheckboxCircleLine size={12} /> Condición: {log.conditionReturned}
                        </span>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[0.7rem] font-semibold text-slate-600 uppercase">
                          {log.status}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <span className="block text-[0.7rem] uppercase font-bold text-plai-muted">Usuario / Solicitante</span>
                        <strong className="text-navy">{log.user}</strong>
                        {log.institution && (
                          <span className="block text-plai-muted text-[0.75rem]">{log.institution}</span>
                        )}
                      </div>
                      <div className="sm:col-span-2">
                        <span className="block text-[0.7rem] uppercase font-bold text-plai-muted">Actividad / Proyecto</span>
                        <p className="text-plai-gray font-medium">{log.activity}</p>
                      </div>
                    </div>

                    {log.notes && (
                      <div className="mt-1 rounded-lg bg-[#F4F6F9] px-3 py-2 text-[0.78rem] text-plai-gray">
                        <strong className="text-navy">Notas de laboratorio:</strong> {log.notes}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pie del modal */}
        <div className="flex items-center justify-between border-t border-black/[0.08] bg-[#F8FAFC] px-6 py-3 text-xs">
          <span className="text-plai-muted">
            Bitácora de trazabilidad de activos de la Plataforma Abierta de Innovación
          </span>
          <button
            type="button"
            onClick={() => {
              setSelectedHistoryEquipment(null);
              setIsGlobalHistoryOpen(false);
              setNewHistoryFormOpen(false);
            }}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-heading font-semibold text-navy hover:bg-gray-50 shadow-2xs"
          >
            Cerrar Bitácora
          </button>
        </div>
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
        customActions={(item: DeviceItem) => (
          <button
            type="button"
            className="cursor-pointer rounded p-1 text-xl text-plai-muted transition-colors duration-[250ms] hover:bg-sky-500/10 hover:text-sky-600"
            onClick={() => {
              setSelectedHistoryEquipment(item);
              setIsGlobalHistoryOpen(false);
              setNewHistoryFormOpen(false);
              setHistorySearch('');
            }}
            title="Ver historial de uso"
            aria-label={`Ver historial de uso de ${item.name}`}
          >
            <RiHistoryLine />
          </button>
        )}
        addActionLabel="Registrar Recurso"
      />

      {/* Modal montado vía portal */}
      {modalElement ? createPortal(modalElement, document.body) : null}
      {historyModalElement ? createPortal(historyModalElement, document.body) : null}

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
