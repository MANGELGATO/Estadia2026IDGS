"use client";

import React, { useState } from 'react';
import styles from './page.module.css';
import { RiSaveLine, RiAddLine, RiDeleteBinLine } from 'react-icons/ri';

type Config = {
  labName: string;
  labLocation: string;
  adminEmail: string;
  maintenanceAlertDays: number;
  allowPublicView: boolean;
  requireApproval: boolean;
  maxReservationHours: number;
  maxAdvanceDays: number;
};

const defaultCategorias = [
  'Realidad Virtual', 'Robótica', 'Fabricación Digital',
  'Drones', 'Cómputo', 'Escaneo 3D', 'Electrónica',
];

const defaultEstados = [
  { nombre: 'Disponible',      color: '#059669' },
  { nombre: 'Reservado',       color: '#4F46E5' },
  { nombre: 'En uso',          color: '#3B82F6' },
  { nombre: 'En mantenimiento', color: '#D97706' },
  { nombre: 'Fuera de servicio', color: '#DC2626' },
  { nombre: 'No disponible',   color: '#6B7280' },
];

export default function ConfiguracionPage() {
  const [config, setConfig] = useState<Config>({
    labName: 'PLAI — Laboratorio de Innovación, Robótica y Tecnologías Inmersivas',
    labLocation: 'Edificio A, Planta Baja',
    adminEmail: 'admin@plai.edu.mx',
    maintenanceAlertDays: 30,
    allowPublicView: true,
    requireApproval: true,
    maxReservationHours: 4,
    maxAdvanceDays: 14,
  });
  const [categorias, setCategorias] = useState<string[]>(defaultCategorias);
  const [newCategoria, setNewCategoria] = useState('');
  const [savedMsg, setSavedMsg] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMsg('✅ Configuración guardada correctamente');
    setTimeout(() => setSavedMsg(''), 3000);
  };

  const addCategoria = () => {
    if (newCategoria.trim() && !categorias.includes(newCategoria.trim())) {
      setCategorias([...categorias, newCategoria.trim()]);
      setNewCategoria('');
    }
  };

  const removeCategoria = (cat: string) => {
    setCategorias(categorias.filter(c => c !== cat));
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Configuración</h1>
          <p className={styles.subtitle}>Ajusta los parámetros generales del sistema PLAi</p>
        </div>
      </div>

      <form onSubmit={handleSave}>
        {/* General */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>🏢 Información General</h2>
          <div className={styles.formGrid}>
            <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
              <label className={styles.label}>Nombre del Laboratorio</label>
              <input
                type="text"
                className={styles.input}
                value={config.labName}
                onChange={e => setConfig({ ...config, labName: e.target.value })}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Ubicación</label>
              <input
                type="text"
                className={styles.input}
                value={config.labLocation}
                onChange={e => setConfig({ ...config, labLocation: e.target.value })}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Correo Administrativo</label>
              <input
                type="email"
                className={styles.input}
                value={config.adminEmail}
                onChange={e => setConfig({ ...config, adminEmail: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Reservations */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>📅 Configuración de Reservaciones</h2>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Máx. horas por reservación</label>
              <input
                type="number"
                className={styles.input}
                min={1} max={24}
                value={config.maxReservationHours}
                onChange={e => setConfig({ ...config, maxReservationHours: Number(e.target.value) })}
              />
              <span className={styles.hint}>Límite en horas para una sola reservación</span>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Máx. días de anticipación</label>
              <input
                type="number"
                className={styles.input}
                min={1} max={90}
                value={config.maxAdvanceDays}
                onChange={e => setConfig({ ...config, maxAdvanceDays: Number(e.target.value) })}
              />
              <span className={styles.hint}>¿Con cuántos días de anticipación se puede reservar?</span>
            </div>
          </div>
          <div className={styles.toggleGroup}>
            <label className={styles.toggleLabel}>
              <div className={styles.toggleInfo}>
                <span className={styles.label}>Requerir aprobación manual</span>
                <span className={styles.hint}>Si está activo, las reservaciones requieren ser aprobadas por un admin antes de confirmarse</span>
              </div>
              <div
                className={`${styles.toggle} ${config.requireApproval ? styles.toggleOn : ''}`}
                onClick={() => setConfig({ ...config, requireApproval: !config.requireApproval })}
                role="switch"
                aria-checked={config.requireApproval}
              >
                <div className={styles.toggleKnob} />
              </div>
            </label>
            <label className={styles.toggleLabel}>
              <div className={styles.toggleInfo}>
                <span className={styles.label}>Permitir vista pública del inventario</span>
                <span className={styles.hint}>Los usuarios no autenticados pueden ver el catálogo de recursos</span>
              </div>
              <div
                className={`${styles.toggle} ${config.allowPublicView ? styles.toggleOn : ''}`}
                onClick={() => setConfig({ ...config, allowPublicView: !config.allowPublicView })}
                role="switch"
                aria-checked={config.allowPublicView}
              >
                <div className={styles.toggleKnob} />
              </div>
            </label>
          </div>
        </div>

        {/* Maintenance */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>🔧 Alertas de Mantenimiento</h2>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Alerta preventiva (días)</label>
              <input
                type="number"
                className={styles.input}
                min={7} max={365}
                value={config.maintenanceAlertDays}
                onChange={e => setConfig({ ...config, maintenanceAlertDays: Number(e.target.value) })}
              />
              <span className={styles.hint}>Número de días antes del vencimiento para generar una alerta de mantenimiento</span>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>🏷️ Categorías de Recursos</h2>
          <div className={styles.categoryList}>
            {categorias.map(cat => (
              <div key={cat} className={styles.categoryTag}>
                <span>{cat}</span>
                <button type="button" className={styles.tagRemove} onClick={() => removeCategoria(cat)}>
                  <RiDeleteBinLine />
                </button>
              </div>
            ))}
          </div>
          <div className={styles.addCategoryRow}>
            <input
              type="text"
              className={styles.input}
              placeholder="Nueva categoría..."
              value={newCategoria}
              onChange={e => setNewCategoria(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCategoria())}
            />
            <button type="button" className={styles.btnAdd} onClick={addCategoria}>
              <RiAddLine /> Agregar
            </button>
          </div>
        </div>

        {/* Equipment States */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>🚦 Estados de Equipos</h2>
          <p className={styles.hint} style={{ marginBottom: '1rem' }}>Estados predefinidos del sistema para clasificar el inventario</p>
          <div className={styles.statesGrid}>
            {defaultEstados.map(e => (
              <div key={e.nombre} className={styles.stateItem}>
                <span className={styles.stateDot} style={{ background: e.color }} />
                <span className={styles.stateName}>{e.nombre}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Save */}
        <div className={styles.saveBar}>
          {savedMsg && <span className={styles.savedMsg}>{savedMsg}</span>}
          <button type="submit" className={styles.btnSave}>
            <RiSaveLine /> Guardar Configuración
          </button>
        </div>
      </form>
    </div>
  );
}
