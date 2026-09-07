'use client';
import { useState } from 'react';
import styles from './EquipmentFilterGrid.module.css';
import { mockDevices } from '../../lib/mockData';
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
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos los estados');

  const filter = activeFilter ?? 'Todos';

  const statuses = ['Todos los estados', 'Disponible', 'Reservado', 'En uso', 'En mantenimiento', 'No disponible'];

  const filtered = mockDevices.filter(d => {
    const matchCat = filter === 'Todos' || d.category === filter;
    const matchStatus = statusFilter === 'Todos los estados' || d.status === statusFilter;
    const matchSearch = !search || d.name.toLowerCase().includes(search.toLowerCase())
      || d.brand.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchStatus && matchSearch;
  });

  const available = filtered.filter(d => d.status === 'Disponible').length;

  return (
    <section id="dispositivos" className={styles.section}>
      <div className={styles.container}>
        {/* Section header */}
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.title}>Dispositivos y Disponibilidad</h2>
            <p className={styles.subtitle}>
              {filtered.length} equipos encontrados
              {available > 0 && <span className={styles.availableCount}> · {available} disponibles</span>}
            </p>
          </div>
        </div>

        {/* Filter bar */}
        <div className={styles.filterBar}>
          {/* Search */}
          <div className={styles.searchBox}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Buscar equipo, marca..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              id="equipment-search"
            />
          </div>

          {/* Status select */}
          <div className={styles.statusSelect}>
            <SlidersHorizontal size={15} className={styles.selectIcon} />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className={styles.select}
              id="status-filter"
            >
              {statuses.map(s => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Category tabs */}
        <div className={styles.tabs}>
          {FILTER_TABS.map(tab => (
            <button
              key={tab}
              className={`${styles.tab} ${filter === tab ? styles.tabActive : ''}`}
              onClick={() => onFilterChange?.(tab)}
              id={`filter-${tab.replace(/\s+/g, '-').toLowerCase()}`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className={styles.grid}>
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
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>🔍</span>
            <p>No se encontraron equipos con los filtros aplicados.</p>
            <button
              className={styles.clearBtn}
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
