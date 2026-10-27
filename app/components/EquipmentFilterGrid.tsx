'use client';
import { useState, useEffect } from 'react';
import { DeviceItem, mockDevices } from '../../lib/mockData';
import EquipmentCard from './EquipmentCard';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Props {
  activeFilter?: string;
  onFilterChange?: (filter: string) => void;
}

const FILTER_TABS = ['Todos', 'Realidad Virtual', 'Robótica', 'Cómputo', 'Drones', 'Fabricación digital'];

export default function EquipmentFilterGrid({ activeFilter, onFilterChange }: Props) {
  const router = useRouter();
  const [devices, setDevices] = useState<DeviceItem[]>(mockDevices);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos los estados');

  useEffect(() => {
    fetch('/api/equipos')
      .then(res => res.json())
      .then(json => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setDevices(json.data);
        }
      })
      .catch(() => {});
  }, []);

  const filter = activeFilter ?? 'Todos';

  const statuses = ['Todos los estados', 'Disponible', 'Reservado', 'En uso', 'En mantenimiento', 'No disponible'];

  const filtered = devices.filter(d => {
    const matchCat = filter === 'Todos' || d.category === filter;
    const matchStatus = statusFilter === 'Todos los estados' || d.status === statusFilter;
    const q = search.toLowerCase().trim();
    const matchSearch = !q 
      || d.name.toLowerCase().includes(q)
      || d.brand.toLowerCase().includes(q)
      || d.inventoryNumber.toLowerCase().includes(q)
      || (d.serialNumber && d.serialNumber.toLowerCase().includes(q))
      || (d.storage && d.storage.toLowerCase().includes(q));
    return matchCat && matchStatus && matchSearch;
  });

  const available = filtered.filter(d => d.status === 'Disponible').length;

  return (
    <section id="dispositivos" className="bg-[#F4F6F9] pb-20 pt-14">
      <div className="mx-auto max-w-[1200px] px-6">
        {/* Section header */}
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="mb-1 font-heading text-[1.6rem] font-extrabold tracking-[-0.025em] text-navy">
              Dispositivos y Disponibilidad
            </h2>
            <p className="text-[0.88rem] text-plai-muted">
              {filtered.length} equipos encontrados
              {available > 0 && <span className="font-semibold text-[#15803d]"> · {available} disponibles</span>}
            </p>
          </div>
        </div>

        {/* Filter bar */}
        <div className="mb-5 flex flex-wrap gap-3">
          {/* Search */}
          <div className="relative flex min-w-[200px] flex-1 items-center">
            <Search size={16} className="pointer-events-none absolute left-[0.85rem] text-plai-muted" />
            <input
              type="text"
              className="w-full rounded-[0.65rem] border-[1.5px] border-black/[0.08] bg-white py-[0.65rem] pl-[2.4rem] pr-4 text-[0.9rem] text-navy placeholder:text-plai-muted outline-none transition-all duration-[250ms] focus:border-plai focus:ring-2 focus:ring-plai/10"
              placeholder="Buscar equipo, marca..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              id="equipment-search"
            />
          </div>

          {/* Status select */}
          <div className="relative flex items-center">
            <SlidersHorizontal size={15} className="pointer-events-none absolute left-[0.85rem] z-10 text-plai-muted" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="cursor-pointer appearance-none rounded-[0.65rem] border-[1.5px] border-black/[0.08] bg-white py-[0.65rem] pl-[2.4rem] pr-8 font-body text-[0.88rem] text-navy outline-none transition-all duration-[250ms] focus:border-plai"
              id="status-filter"
            >
              {statuses.map(s => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Category tabs */}
        <div className="mb-8 flex flex-wrap gap-2">
          {FILTER_TABS.map(tab => (
            <button
              key={tab}
              className={`cursor-pointer rounded-full border-[1.5px] px-[1.1rem] py-[0.48rem] font-heading text-[0.83rem] font-semibold transition-all duration-[250ms] ${
                filter === tab
                  ? 'border-plai bg-plai text-white'
                  : 'border-black/[0.08] bg-white text-plai-gray hover:border-plai hover:text-plai'
              }`}
              onClick={() => onFilterChange?.(tab)}
              id={`filter-${tab.replace(/\s+/g, '-').toLowerCase()}`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-5 min-[580px]:grid-cols-2 min-[900px]:grid-cols-3 min-[1180px]:grid-cols-4">
          {filtered.map(device => {
            const categorySlugMap: Record<string, string> = {
              'Realidad Virtual': 'realidad-virtual',
              'Robótica': 'robotica',
              'Cómputo': 'computo-multimedia',
              'Drones': 'drones',
              'Fabricación digital': 'fabricacion-digital',
            };
            const slug = categorySlugMap[device.category] || '';
            
            return (
              <EquipmentCard
                key={device.id}
                device={device}
                onViewDetails={() => router.push(`/categoria/${slug}`)}
              />
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-2xl border-[1.5px] border-dashed border-black/[0.08] bg-white px-8 py-16 text-center">
            <span className="text-[2.5rem]">🔍</span>
            <p className="text-base text-plai-gray">No se encontraron equipos con los filtros aplicados.</p>
            <button
              className="cursor-pointer rounded-full bg-plai px-6 py-[0.6rem] font-heading text-[0.88rem] font-bold text-white transition-all duration-[250ms] hover:bg-navy"
              onClick={() => { setSearch(''); setStatusFilter('Todos los estados'); onFilterChange?.('Todos'); }}
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
